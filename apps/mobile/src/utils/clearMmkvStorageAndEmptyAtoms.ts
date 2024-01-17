import {type OneOfferInState} from '@vexl-next/domain/src/general/offers'
import {MINIMAL_DATE} from '@vexl-next/domain/src/utility/IsoDatetimeString.brand'
import {UnixMilliseconds} from '@vexl-next/domain/src/utility/UnixMilliseconds.brand'
import {getDefaultStore} from 'jotai'
import {previousSearchesAtom} from '../components/SearchOffersScreen/atoms/previousSearchesAtom'
import {messagingStateAtomStorageAtom} from '../state/chat/atoms/messagingStateAtom'
import connectionStateAtom from '../state/connections/atom/connectionStateAtom'
import offerToConnectionsAtom from '../state/connections/atom/offerToConnectionsAtom'
import {
  combinedContactsAfterLastSubmitStorageAtom,
  importedContactsStorageAtom,
} from '../state/contacts'
import {
  feedbacksForClosedChatsStorageAtom,
  newOfferFeedbackDoneStorageAtom,
} from '../state/feedback/atoms'
import {offersStateAtom} from '../state/marketplace/atoms/offersState'
import {offersMissingOnServerStorageAtom} from '../state/marketplace/atoms/offersMissingOnServer'
import {postLoginFinishedStorageAtom} from '../state/postLoginOnboarding'
import {selectedCurrencyStorageAtom} from '../state/selectedCurrency'
import {storage} from './fpMmkv'
import {preferencesAtom} from './preferences'

export default function clearMmkvStorageAndEmptyAtoms(): void {
  // TODO:#110 find a better way how to clear the state

  getDefaultStore().set(messagingStateAtomStorageAtom, {messagingState: []})
  getDefaultStore().set(connectionStateAtom, {
    lastUpdate: UnixMilliseconds.parse(0),
    firstLevel: [],
    secondLevel: [],
    commonFriends: {commonContacts: []},
  })
  getDefaultStore().set(offerToConnectionsAtom, {
    offerToConnections: [],
  })
  getDefaultStore().set(newOfferFeedbackDoneStorageAtom, {
    newOfferFeedbackDone: false,
  })
  getDefaultStore().set(importedContactsStorageAtom, {
    importedContacts: [],
  })
  getDefaultStore().set(combinedContactsAfterLastSubmitStorageAtom, {
    combinedContactsAfterLastSubmit: null,
  })
  getDefaultStore().set(offersStateAtom, {
    lastUpdatedAt: MINIMAL_DATE,
    offers: [] as OneOfferInState[],
  })
  getDefaultStore().set(postLoginFinishedStorageAtom, {
    postLoginFinished: false,
  })
  getDefaultStore().set(selectedCurrencyStorageAtom, {
    currency: 'USD',
  })
  getDefaultStore().set(preferencesAtom, {
    disableOfferRerequestLimit: false,
    allowSendingImages: false,
    notificationPreferences: {
      marketing: true,
      chat: true,
      inactivityWarnings: true,
      marketplace: true,
      newOfferInMarketplace: true,
      newPhoneContacts: true,
      offer: true,
    },
    enableNewOffersNotificationDevMode: false,
    showFriendLevelBanner: true,
    tradeChecklistEnabled: false,
    offerFeedbackEnabled: false,
    showTextDebugButton: false,
    disableScreenshots: false,
    isDeveloper: false,
  })

  getDefaultStore().set(previousSearchesAtom, [])

  getDefaultStore().set(feedbacksForClosedChatsStorageAtom, {feedbacks: {}})

  getDefaultStore().set(offersMissingOnServerStorageAtom, {
    offerIds: [],
    progress: null,
  })

  storage._storage.clearAll()
}
