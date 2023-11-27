import notifee from '@notifee/react-native'
import {type getDefaultStore} from 'jotai'
import {myOffersAtom} from '../../state/marketplace/atoms/myOffers'
import {showDebugNotificationIfEnabled} from '.'
import {loadSession, userLoggedInAtom} from '../../state/session'
import {notificationPreferencesAtom} from '../preferences'
import {triggerOffersRefreshAtom} from '../../state/marketplace'
import {offersToSeeInMarketplaceAtom} from '../../state/marketplace/atoms/offersToSeeInMarketplace'
import {translationAtom} from '../localization/I18nProvider'
import {CREATE_OFFER_PROMPT} from './notificationTypes'
import {getDefaultChannel} from './notificationChannels'

export default async function checkAndShowCreateOfferPrompt(
  store: ReturnType<typeof getDefaultStore>
): Promise<void> {
  void showDebugNotificationIfEnabled({
    title: 'checkAndShowCreateOfferPrompt',
    body: 'Checking if create offer prompt should be shown',
  })

  const newOffersInMarketpacePreference = store.get(
    notificationPreferencesAtom
  ).marketplace

  if (!newOffersInMarketpacePreference) {
    void showDebugNotificationIfEnabled({
      title: 'checkAndShowCreateOfferPrompt',
      body: 'User has disabled marketplace notifications',
    })
  }

  await loadSession()

  if (!store.get(userLoggedInAtom)) {
    void showDebugNotificationIfEnabled({
      title: 'checkAndShowCreateOfferPrompt',
      body: 'User is not logged in.',
    })
    return
  }

  const myOffers = store.get(myOffersAtom)
  if (myOffers.length > 0) {
    void showDebugNotificationIfEnabled({
      title: 'checkAndShowCreateOfferPrompt',
      body: 'User has offers. Not showing notification',
    })
    return
  }

  await store.set(triggerOffersRefreshAtom)

  const offersInMarketplace = store.get(offersToSeeInMarketplaceAtom)
  if (offersInMarketplace.length <= 0) {
    void showDebugNotificationIfEnabled({
      title: 'checkAndShowCreateOfferPrompt',
      body: 'There are no offers in marketplace',
    })
    return
  }

  const {t} = store.get(translationAtom)
  await notifee.displayNotification({
    title: t('notifications.createOfferPrompt.title'),
    body: t('notifications.createOfferPrompt.body'),
    data: {
      type: CREATE_OFFER_PROMPT,
    },
    android: {
      channelId: await getDefaultChannel(),
      pressAction: {
        id: 'default',
      },
    },
  })
}
