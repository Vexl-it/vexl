import {
  type PrivateKeyHolder,
  type PublicKeyPemBase64,
} from '@vexl-next/cryptography/src/KeyHolder'
import {type ChatMessage} from '@vexl-next/domain/src/general/messaging'
import {type OneOfferInState} from '@vexl-next/domain/src/general/offers'
import {
  UnixMilliseconds0,
  unixMillisecondsNow,
  type UnixMilliseconds,
} from '@vexl-next/domain/src/utility/UnixMilliseconds.brand'
import retrieveMessages, {
  type ApiErrorRetrievingMessages,
} from '@vexl-next/resources-utils/src/chat/retrieveMessages'
import {type ErrorChatMessageRequiresNewerVersion} from '@vexl-next/resources-utils/src/chat/utils/parseChatMessage'
import {type ChatPrivateApi} from '@vexl-next/rest-api/src/services/chat'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import {flow, pipe} from 'fp-ts/function'
import {group} from 'group-items'
import {atom, type SetStateAction, type WritableAtom} from 'jotai'
import {focusAtom} from 'jotai-optics'
import {privateApiAtom} from '../../../api'
import {version} from '../../../utils/environment'
import {getNotificationToken} from '../../../utils/notifications'
import reportError from '../../../utils/reportError'
import {startMeasure} from '../../../utils/reportTime'
import {
  createSingleOfferReportedFlagFromAtomAtom,
  focusOfferByPublicKeyAtom,
  singleOfferAtom,
} from '../../marketplace/atoms/offersState'
import messagingStateAtom from '../atoms/messagingStateAtom'
import {type InboxInState} from '../domain'
import addMessagesToChats from '../utils/addMessagesToChats'
import createNewChatsFromMessages from '../utils/createNewChatsFromFirstMessages'
import replaceBase64UriWithImageFileUri from '../utils/replaceBase64UriWithImageFileUri'
import {type ChatMessageWithState} from './../domain'
import {sendUpdateNoticeMessageActionAtom} from './checkAndReportCurrentVersionToChatsActionAtom'
import focusChatByInboxKeyAndSenderKey from './focusChatByInboxKeyAndSenderKey'

const handleOtherSideUpdatedActionAtom = atom(
  null,
  (
    get,
    set,
    {
      newMessages,
      inbox,
    }: {newMessages: readonly ChatMessageWithState[]; inbox: InboxInState}
  ) => {
    const messagesToRespondWithCurrentVersion = newMessages.filter(
      (one) =>
        one.message.messageType === 'VERSION_UPDATE' &&
        one.message.lastReceivedVersion !== version
    )

    messagesToRespondWithCurrentVersion.forEach(
      (oneMessageToRespondWithCurrentVersion) => {
        const chatAtom = focusChatByInboxKeyAndSenderKey({
          inboxKey: inbox.inbox.privateKey.publicKeyPemBase64,
          senderKey:
            oneMessageToRespondWithCurrentVersion.message.senderPublicKey,
        })
        void set(sendUpdateNoticeMessageActionAtom, chatAtom)()
      }
    )
  }
)

function focusInboxInMessagingStateAtom(
  publicKey: PublicKeyPemBase64
): WritableAtom<
  InboxInState | undefined,
  [SetStateAction<InboxInState>],
  void
> {
  return focusAtom(messagingStateAtom, (optic) =>
    optic.find((one) => one.inbox.privateKey.publicKeyPemBase64 === publicKey)
  )
}

function splitMessagesArrayToNewChatsAndExistingChats({
  inbox,
  messages,
}: {
  readonly inbox: InboxInState
  readonly messages: readonly ChatMessageWithState[]
}): {
  messagesInNewChat: ChatMessageWithState[] | undefined
  messagesInExistingChat: ChatMessageWithState[] | undefined
} {
  return group(messages)
    .by((oneMessage) =>
      inbox.chats.some(
        (oneChat) =>
          oneMessage.message.senderPublicKey ===
          oneChat.chat.otherSide.publicKey
      )
        ? 'messagesInExistingChat'
        : 'messagesInNewChat'
    )
    .asObject()
}

function incompatableErrorToChatMessageWithState(
  error: ErrorChatMessageRequiresNewerVersion
): ChatMessageWithState {
  return {
    message: error.message,
    state: 'receivedButRequiresNewerVersion',
  }
}

function messageToChatMessageWithState(
  message: ChatMessage
): ChatMessageWithState {
  return {
    message,
    state: 'received',
  }
}

export interface NoMessagesLeft {
  _tag: 'noMessages'
}

function refreshInbox(
  api: ChatPrivateApi
): (
  getInbox: () => InboxInState,
  inboxOffer?: OneOfferInState
) => TE.TaskEither<
  ApiErrorRetrievingMessages | NoMessagesLeft,
  {updatedInbox: InboxInState; newMessages: readonly ChatMessageWithState[]}
> {
  return (getInbox, inboxOffer) =>
    pipe(
      retrieveMessages({
        api,
        currentAppVersion: version,
        inboxKeypair: getInbox().inbox.privateKey,
      }),
      TE.map((one) => {
        const incompatibleMessagesError = one.errors.filter(
          (
            one
          ): one is typeof one & {
            _tag: 'ErrorChatMessageRequiresNewerVersion'
          } => one._tag === 'ErrorChatMessageRequiresNewerVersion'
        )
        const otherErrors = one.errors.filter(
          (one) => one._tag !== 'ErrorChatMessageRequiresNewerVersion'
        )

        if (otherErrors.length > 0) {
          reportError('error', new Error('Error decrypting messages'), {
            otherErrors,
          })
        }

        return [
          ...incompatibleMessagesError.map(
            incompatableErrorToChatMessageWithState
          ),
          ...one.messages.map(messageToChatMessageWithState),
        ]
      }),
      TE.filterOrElseW(
        (messages) => messages.length > 0,
        () => 'noMessages' as const
      ),
      TE.chainW(
        flow(
          A.map((oneMessage): T.Task<ChatMessageWithState> => {
            if (
              oneMessage.state !== 'receivedButRequiresNewerVersion' &&
              !oneMessage.message.image &&
              !oneMessage.message.tradeChecklistUpdate?.identity?.image
            )
              return T.of(oneMessage)
            return replaceBase64UriWithImageFileUri(
              oneMessage,
              getInbox().inbox.privateKey.publicKeyPemBase64,
              oneMessage.message.senderPublicKey
            )
          }),
          T.sequenceArray,
          TE.fromTask
        )
      ),
      TE.bindTo('newMessages'),
      TE.bindW('updatedInbox', ({newMessages}) =>
        pipe(
          TE.right(newMessages),
          TE.map((newMessages) =>
            splitMessagesArrayToNewChatsAndExistingChats({
              inbox: getInbox(),
              messages: newMessages,
            })
          ),
          TE.map(({messagesInNewChat, messagesInExistingChat}) => {
            const inbox = getInbox()
            return {
              ...getInbox(),
              chats: [
                ...createNewChatsFromMessages({
                  inbox: inbox.inbox,
                  inboxOffer,
                })(messagesInNewChat ?? []),
                ...addMessagesToChats(inbox.chats)(
                  messagesInExistingChat ?? []
                ),
              ],
            }
          })
        )
      ),
      TE.match(
        (e) => {
          if (e === 'noMessages') {
            return E.left({_tag: 'noMessages'} as const)
          }
          return E.left(e)
        },
        (right) => E.right(right)
      )
    )
}

function deletePulledMessagesReportLeft({
  api,
  keyPair,
}: {
  api: ChatPrivateApi
  keyPair: PrivateKeyHolder
}): T.Task<void> {
  return pipe(
    api.deletePulledMessages({keyPair}),
    TE.match(
      (error) => {
        reportError('error', new Error('Error deleting pulled messages'), {
          error,
        })
      },
      () => {}
    )
  )
}

export const fetchAndStoreMessagesForInboxAtom = atom<
  null,
  [{key: PublicKeyPemBase64}],
  T.Task<InboxInState | undefined>
>(null, (get, set, params) => {
  const {key} = params
  const api = get(privateApiAtom)
  const inbox = get(focusInboxInMessagingStateAtom(key))

  if (!inbox) {
    reportError(
      'error',
      new Error('Trying to refresh an inbox but inbox does not exist')
    )
    return T.of(undefined)
  }

  return pipe(
    refreshInbox(api.chat)(
      () => get(focusInboxInMessagingStateAtom(key)) ?? inbox,
      get(singleOfferAtom(inbox.inbox.offerId))
    ),
    TE.matchEW(
      (error) => {
        if (error._tag === 'noMessages') {
          console.info('No new messages in inbox')
          return T.of(inbox)
        }

        if (error._tag === 'inboxDoesNotExist') {
          reportError(
            'warn',
            new Error(
              'Api Error fetching messages for inbox. Trying to create the inbox again.'
            ),
            {error}
          )
          return pipe(
            getNotificationToken(),
            TE.fromTask,
            TE.chainW((token) =>
              api.chat.createInbox({
                token: token ?? undefined,
                keyPair: inbox.inbox.privateKey,
              })
            ),
            TE.match(
              (e) => {
                reportError(
                  'error',
                  new Error('Error recreating inbox on server'),
                  {e}
                )
                return false
              },
              () => {
                console.info(
                  `✅ Inbox ${inbox.inbox.privateKey.publicKeyPemBase64} successfully recreated`
                )
                return true
              }
            ),
            T.map(() => inbox)
          )
        }
        return T.of(inbox)
      },
      ({newMessages, updatedInbox}) => {
        set(
          focusInboxInMessagingStateAtom(
            inbox.inbox.privateKey.publicKeyPemBase64
          ),
          updatedInbox
        )

        newMessages
          .filter((one) => one.message.messageType === 'BLOCK_CHAT')
          .map((oneBlockMessage) => {
            set(
              createSingleOfferReportedFlagFromAtomAtom(
                focusOfferByPublicKeyAtom(
                  oneBlockMessage.message.senderPublicKey
                )
              ),
              true
            )
          })

        set(handleOtherSideUpdatedActionAtom, {
          newMessages,
          inbox: updatedInbox,
        })

        return pipe(
          deletePulledMessagesReportLeft({
            api: api.chat,
            keyPair: updatedInbox.inbox.privateKey,
          }),
          T.map(() => updatedInbox)
        )
      }
    )
  )
})

const lastRefreshAtom = atom<UnixMilliseconds>(UnixMilliseconds0)

const fetchMessagesForAllInboxesAtom = atom(null, (get, set) => {
  const lastRefresh = get(lastRefreshAtom)

  if (unixMillisecondsNow() - lastRefresh < 120) return T.of('done')
  console.log(`Last refresh before ${unixMillisecondsNow() - lastRefresh}`)

  set(lastRefreshAtom, unixMillisecondsNow())
  const measure = startMeasure('Fetch inboxes')
  console.log('Refreshing all inboxes')

  return pipe(
    get(messagingStateAtom),
    A.map((inbox) =>
      set(fetchAndStoreMessagesForInboxAtom, {
        key: inbox.inbox.privateKey.publicKeyPemBase64,
      })
    ),
    T.sequenceSeqArray,
    T.map(() => {
      measure()
      return 'done' as const
    })
  )
})

export default fetchMessagesForAllInboxesAtom
