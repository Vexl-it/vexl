import {type OneOfferInState} from '@vexl-next/domain/src/general/offers'
import {generateKeyPair} from '@vexl-next/resources-utils/src/utils/crypto'
import * as A from 'fp-ts/Array'
import {isNonEmpty} from 'fp-ts/Array'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import {pipe} from 'fp-ts/function'
import {atom, useSetAtom, useStore} from 'jotai'
import {useCallback} from 'react'
import {usePrivateApiAssumeLoggedIn} from '../api'
import notEmpty from '../utils/notEmpty'
import reportError from '../utils/reportError'
import {useAppState} from '../utils/useAppState'
import {inboxesAtom} from './chat/atoms/messagingStateAtom'
import {useRefreshNotificationTokensForActiveChatsAssumeLogin} from './chat/atoms/refreshNotificationTokensActionAtom'
import {createInboxAtom} from './chat/hooks/useCreateInbox'
import {updateOfferAtom} from './marketplace'
import checkNotificationTokensAndRefreshOffersActionAtom from './marketplace/atoms/checkNotificationTokensAndRefreshOffersActionAtom'
import {myOffersAtom} from './marketplace/atoms/myOffers'
import {offersMissingOnServerAtom} from './marketplace/atoms/offersMissingOnServer'
import {useLogout} from './useLogout'

export function useRefreshUserOnContactService(): void {
  const api = usePrivateApiAssumeLoggedIn()
  const logout = useLogout()

  useAppState(
    useCallback(
      (state) => {
        if (state !== 'active') return

        console.info('🦋 Refreshing user')
        void pipe(
          api.contact.refreshUser({offersAlive: true}),
          TE.match(
            (e) => {
              if (e._tag === 'UserNotFoundError') {
                console.warn('🦋 🚨 User to refresh not found. Logging out')
                void logout()
              } else if (e._tag === 'NetworkError') {
                console.warn(
                  '🦋 Network error refreshing user. Not logging out.',
                  e
                )
              } else if (e._tag === 'UnknownError') {
                reportError(
                  'warn',
                  new Error('Unknown error refreshing user. Not logging out.'),
                  {e}
                )
                console.warn(
                  '🦋 🚨 Unknown error refreshing user. Not logging out.',
                  e._tag
                )
              } else if (e._tag === 'UnexpectedApiResponseError') {
                reportError(
                  'warn',
                  new Error(
                    'UnexpectedApiResponseError error refreshing user. Not logging out.'
                  ),
                  {e}
                )
                console.warn(
                  '🦋 🚨 UnexpectedApiResponseError error refreshing user. Not logging out.',
                  e._tag
                )
              } else if (e._tag === 'BadStatusCodeError') {
                const codeStartsWith4XX = e.response.status
                  .toString()
                  .startsWith('4')
                if (codeStartsWith4XX) {
                  console.warn('🦋 🚨 Bad status code while refreshing user')
                  reportError(
                    'warn',
                    new Error(
                      'Bad status code while error refreshing user. Not logging out.'
                    ),
                    {e}
                  )
                  void logout()
                } else {
                  console.warn('🦋 🚨 Bad status code while refreshing user')
                  reportError(
                    'warn',
                    new Error(
                      'Bad status code error refreshing user. Not logging out.'
                    ),
                    {e}
                  )
                }
              } else {
                reportError(
                  'error',
                  new Error('Uncaught error refreshing user. Not logging out.'),
                  e
                )
                console.error(
                  '🦋 🚨 UnexpectedApiResponseError error refreshing user. Not logging out.',
                  {e}
                )
              }
            },
            () => {
              console.log('🦋 User refreshed')
            }
          )
        )()
      },
      [api.contact, logout]
    )
  )
}

export function useRefreshOffers(): void {
  const store = useStore()
  const api = usePrivateApiAssumeLoggedIn()

  useAppState(
    useCallback(
      (state) => {
        if (state !== 'active') return

        const myOffers = store.get(myOffersAtom)

        void pipe(
          myOffers,
          A.map((offer) => offer.ownershipInfo?.adminId),
          A.filter(notEmpty),
          (o) => {
            console.info(`🦋 Refreshing ${o.length} offers`)
            return o
          },
          TE.fromPredicate(
            isNonEmpty,
            () => ({_tag: 'noOffersToRefresh'}) as const
          ),
          TE.chainW((adminIds) => api.offer.refreshOffer({adminIds})),
          TE.map((offerIdsOnServer) => {
            const offerIdsOnDevice = myOffers.map(
              (one) => one.offerInfo.offerId
            )
            const offerIdsNotOnServer = offerIdsOnDevice.filter(
              (oneOnDevice) => !offerIdsOnServer.includes(oneOnDevice)
            )
            store.set(offersMissingOnServerAtom, offerIdsNotOnServer)
          }),
          TE.match(
            (l) => {
              if (l._tag === 'noOffersToRefresh') {
                console.info('🦋 No offers to refresh')
              } else {
                console.error('🦋 🚨 Error while refreshing offers', l._tag)
                reportError(
                  'warn',
                  new Error('Error while refreshing offers'),
                  {l}
                )
              }
            },
            () => {
              console.info(`🦋 Offers refreshed`)
            }
          )
        )()
      },
      [api.offer, store]
    )
  )
}

const recreateInboxAndUpdateOfferAtom = atom(
  null,
  (get, set, offerWithoutInbox: OneOfferInState) => {
    reportError(
      'warn',
      new Error(
        'Found offer without corresponding inbox. Trying to recreate the inbox and updating offer.'
      ),
      {}
    )
    const adminId = offerWithoutInbox.ownershipInfo?.adminId
    const intendedConnectionLevel =
      offerWithoutInbox.ownershipInfo?.intendedConnectionLevel
    const symmetricKey = offerWithoutInbox.offerInfo.privatePart.symmetricKey
    if (!adminId || !symmetricKey || !intendedConnectionLevel) {
      reportError(
        'error',
        new Error('Missing data to update offer after recreating inbox'),
        {}
      )
      return T.of(false)
    }

    return pipe(
      generateKeyPair(),
      TE.fromEither,
      TE.chainFirstW((keyPair) =>
        set(createInboxAtom, {
          inbox: {
            privateKey: keyPair,
            offerId: offerWithoutInbox.offerInfo.offerId,
          },
        })
      ),
      TE.chainW((keyHolder) => {
        return set(updateOfferAtom, {
          payloadPublic: {
            ...offerWithoutInbox.offerInfo.publicPart,
            offerPublicKey: keyHolder.publicKeyPemBase64,
          },
          symmetricKey,
          adminId,
          intendedConnectionLevel,
          updateFcmCypher: true,
          offerKey: keyHolder,
        })
      }),
      TE.match(
        (e) => {
          reportError(
            'error',
            new Error('Errow while recreating inbox and updating offer'),
            {e}
          )
          return false
        },
        () => {
          console.info('✅ Inbox recreated and offer updated')
          return true
        }
      )
    )
  }
)

function useCheckOfferInboxes(): void {
  const store = useStore()

  useAppState(
    useCallback(
      (state) => {
        if (state !== 'active') return

        const publicKeys = store
          .get(inboxesAtom)
          .map((one) => one.privateKey.publicKeyPemBase64)

        void pipe(
          store.get(myOffersAtom),
          A.filter((offer) => {
            const offerPublicKey = offer.offerInfo.publicPart.offerPublicKey
            return !publicKeys.includes(offerPublicKey)
          }),
          A.map(
            (offerWithoutInbox): T.Task<boolean> =>
              store.set(recreateInboxAndUpdateOfferAtom, offerWithoutInbox)
          ),
          A.sequence(T.ApplicativeSeq)
        )()
      },
      [store]
    )
  )
}

function useCheckNotificationTokensAndRefreshOffers(): void {
  const checkNotificationTokensAndRefreshOffers = useSetAtom(
    checkNotificationTokensAndRefreshOffersActionAtom
  )

  useAppState(
    useCallback(
      (state) => {
        if (state !== 'active') return
        checkNotificationTokensAndRefreshOffers()
      },
      [checkNotificationTokensAndRefreshOffers]
    )
  )
}

export default function useHandleRefreshContactServiceAndOffers(): void {
  useRefreshUserOnContactService()
  useRefreshOffers()
  useCheckOfferInboxes()
  useCheckNotificationTokensAndRefreshOffers()
  useRefreshNotificationTokensForActiveChatsAssumeLogin()
}
