import {flow, pipe} from 'fp-ts/function'
import * as A from 'fp-ts/Array'
import {type ChatPrivateApi} from '@vexl-next/rest-api/dist/services/chat'
import {type ChatMessageWithState, type InboxInState} from '../domain'
import * as TE from 'fp-ts/TaskEither'
import retrieveMessages, {
  type ApiErrorRetrievingMessages,
} from '@vexl-next/resources-utils/dist/chat/retrieveMessages'
import reportError from '../../../utils/reportError'
import * as T from 'fp-ts/Task'
import {usePrivateApiAssumeLoggedIn} from '../../../api'
import {type SetStateAction, useStore, type WritableAtom} from 'jotai'
import {useCallback} from 'react'
import {
  type PrivateKeyHolder,
  type PublicKeyPemBase64,
} from '@vexl-next/cryptography/dist/KeyHolder'
import addMessagesToChats from '../utils/addMessagesToChats'
import createNewChatsFromMessages from '../utils/createNewChatsFromFirstMessages'
import {group} from 'group-items'
import {focusAtom} from 'jotai-optics'
import messagingStateAtom from '../atoms/messagingStateAtom'
import replaceBase64UriWithImageFileUri from '../utils/replaceBase64UriWithImageFileUri'

export function createInboxAtom(
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
  messageInNewChat: ChatMessageWithState[]
  messageInExistingChat: ChatMessageWithState[]
} {
  return group(messages)
    .by((oneMessage) =>
      inbox.chats.some(
        (oneChat) =>
          oneMessage.message.senderPublicKey ===
          oneChat.chat.otherSide.publicKey
      )
        ? 'messageInExistingChat'
        : 'messageInNewChat'
    )
    .asObject()
}

function refreshInbox(
  api: ChatPrivateApi
): (
  getInbox: () => InboxInState
) => TE.TaskEither<ApiErrorRetrievingMessages, InboxInState> {
  return (getInbox) =>
    pipe(
      retrieveMessages({api, inboxKeypair: getInbox().inbox.privateKey}),
      TE.map((one) => {
        if (one.errors.length > 0) {
          reportError('error', 'Error decrypting messages', one.errors)
        }
        return one.messages
      }),
      TE.map((newMessages) =>
        newMessages.map(
          (oneMessage): ChatMessageWithState => ({
            state: 'received',
            message: oneMessage,
          })
        )
      ),
      TE.chainW(
        flow(
          A.map((oneMessage): T.Task<ChatMessageWithState> => {
            if (!oneMessage.message.image) return T.of(oneMessage)
            return replaceBase64UriWithImageFileUri(
              oneMessage,
              getInbox().inbox.privateKey.publicKeyPemBase64
            )
          }),
          T.sequenceArray,
          TE.fromTask
        )
      ),
      TE.map((newMessages) =>
        splitMessagesArrayToNewChatsAndExistingChats({
          inbox: getInbox(),
          messages: newMessages,
        })
      ),
      TE.map(({messageInNewChat, messageInExistingChat}) => {
        const inbox = getInbox()
        return {
          ...getInbox(),
          chats: [
            ...createNewChatsFromMessages(inbox.inbox)(messageInNewChat || []),
            ...addMessagesToChats(inbox.chats)(messageInExistingChat || []),
          ],
        }
      })
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
        reportError('error', 'Error deleting pulled messages', error)
      },
      () => {}
    )
  )
}

export function useFetchAndStoreMessagesForInbox(): (
  key: PublicKeyPemBase64
) => T.Task<InboxInState | undefined> {
  const api = usePrivateApiAssumeLoggedIn()
  const store = useStore()

  return useCallback(
    (inboxKey: PublicKeyPemBase64) => {
      const inbox = store.get(createInboxAtom(inboxKey))

      if (!inbox) {
        reportError(
          'error',
          `Trying to refresh inbox with public key: ${inboxKey}, but inbox does not exist.`,
          new Error('Inbox does not exist')
        )
        return T.of(undefined)
      }

      return pipe(
        refreshInbox(api.chat)(
          () => store.get(createInboxAtom(inboxKey)) ?? inbox
        ),
        TE.match(
          (error) => {
            reportError('error', 'Api Error fetching messages for inbox', error)
            return inbox
          },
          (i) => {
            return i
          }
        ),
        T.map((inbox) => {
          store.set(
            createInboxAtom(inbox.inbox.privateKey.publicKeyPemBase64),
            inbox
          )
          return inbox
        }),
        T.chainFirst(() =>
          deletePulledMessagesReportLeft({
            api: api.chat,
            keyPair: inbox.inbox.privateKey,
          })
        )
      )
    },
    [api.chat, store]
  )
}

export default function useFetchMessagesForAllInboxes(): () => T.Task<'done'> {
  const store = useStore()
  const fetchAndStoreMessagesForInbox = useFetchAndStoreMessagesForInbox()

  return useCallback(
    () =>
      pipe(
        store.get(messagingStateAtom),
        A.map(
          async (inbox) =>
            await fetchAndStoreMessagesForInbox(
              inbox.inbox.privateKey.publicKeyPemBase64
            )()
        ),
        // @ts-expect-error bad typings?
        A.sequence(T.ApplicativeSeq),
        T.map(() => 'done' as const)
      ),
    [fetchAndStoreMessagesForInbox, store]
  )
}
