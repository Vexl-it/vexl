import Clipboard from '@react-native-clipboard/clipboard'
import messaging from '@react-native-firebase/messaging'
import {type Inbox} from '@vexl-next/domain/src/general/messaging'
import {MINIMAL_DATE} from '@vexl-next/domain/src/utility/IsoDatetimeString.brand'
import * as T from 'fp-ts/Task'
import {pipe} from 'fp-ts/function'
import {useAtomValue, useSetAtom, useStore} from 'jotai'
import {Alert, ScrollView} from 'react-native'
import {Spacer, Text, YStack} from 'tamagui'
import {apiEnv, privateApiAtom} from '../../api'
import deleteAllInboxesActionAtom from '../../state/chat/atoms/deleteAllInboxesActionAtom'
import fetchMessagesForAllInboxesAtom from '../../state/chat/atoms/fetchNewMessagesActionAtom'
import messagingStateAtom from '../../state/chat/atoms/messagingStateAtom'
import offerToConnectionsAtom, {
  deleteOrphanRecordsActionAtom,
  updateAllOffersConnectionsActionAtom,
} from '../../state/connections/atom/offerToConnectionsAtom'
import {importedContactsAtom} from '../../state/contacts'
import {triggerOffersRefreshAtom} from '../../state/marketplace'
import {useSessionAssumeLoggedIn} from '../../state/session'
import {enableHiddenFeatures, version} from '../../utils/environment'
import reportError from '../../utils/reportError'
import useSafeGoBack from '../../utils/useSafeGoBack'
import Button from '../Button'
import Screen from '../Screen'
import WhiteContainer from '../WhiteContainer'
import deleteInboxAtom from './atoms/deleteInboxAtom'
import CryptoBenchmarks from './components/CryptoBenchmarks'
import LanguagePicker from './components/LanguagePicker'
import Preferences from './components/Preferences'
import RemoteConfigView from './components/RemoteConfigView'
import SimulateMissingOfferInbox from './components/SimulateMissingOfferInbox'
import {offersStateAtom} from '../../state/marketplace/atoms/offersState'
import {myOffersAtom} from '../../state/marketplace/atoms/myOffers'
import AfterInteractionTaskDemo from './components/AfterInteractionTaskDemo'
import {isDeveloperAtom, showTextDebugButtonAtom} from '../../utils/preferences'
import {
  getShowDebugNotifications,
  setShowDebugNotifications,
} from '../../utils/notifications/showDebugNotificationIfEnabled'

// const ContentScroll = styled(ScrollView, {
//   marginBottom: '$2',
//   contentContainerStyle: {
//     flex: 1,
//   },
// })

function DebugScreen(): JSX.Element {
  const safeGoBack = useSafeGoBack()
  const store = useStore()
  const session = useSessionAssumeLoggedIn()

  const refreshMessaging = useSetAtom(fetchMessagesForAllInboxesAtom)
  const refreshOffers = useSetAtom(triggerOffersRefreshAtom)
  const updateConnections = useSetAtom(updateAllOffersConnectionsActionAtom)
  const deleteInbox = useSetAtom(deleteInboxAtom)
  const deleteAllInboxes = useSetAtom(deleteAllInboxesActionAtom)
  const isDeveloper = useAtomValue(isDeveloperAtom)
  const showTextDebugButton = useSetAtom(showTextDebugButtonAtom)

  if (!isDeveloper) {
    const buttonText = !isDeveloper
      ? 'Show translators debug button'
      : 'Hide translators debug button'
    return (
      <Screen>
        <WhiteContainer>
          <Text color="$black" fos={20} ff="$heading">
            Debug screen
          </Text>
          <Spacer />
          <Button
            variant="secondary"
            size="small"
            onPress={() => {
              showTextDebugButton((old) => !old)
            }}
            text={buttonText}
          />
        </WhiteContainer>
      </Screen>
    )
  }

  return (
    <Screen>
      <WhiteContainer>
        <ScrollView>
          <YStack space="$2">
            <Text color="$black" fos={20} ff="$heading">
              Debug screen
            </Text>
            <Text color="$black">App version: {version}</Text>
            <CryptoBenchmarks />
            <Text color="$black">
              enableHiddenFeatures: {enableHiddenFeatures ? 'true' : 'false'}
            </Text>
            <Text color="$black">
              apiEnv: {JSON.stringify(apiEnv, null, 2)}
            </Text>
            <Spacer />
            <RemoteConfigView />
            <Spacer />
            <LanguagePicker />
            <Spacer />
            <Button
              variant={'primary'}
              size={'small'}
              text={'Print contacts'}
              onPress={() => {
                const contacts = store.get(importedContactsAtom)
                console.log('Contacts: ', JSON.stringify(contacts, null, 2))
              }}
            />
            <Button
              variant={'primary'}
              size={'small'}
              text={'Simulate non fatal error'}
              onPress={() => {
                reportError(
                  'error',
                  // Private key should be stripped
                  `Simulated non fatal error ${session.privateKey.privateKeyPemBase64}`,
                  new Error('Simulated non fatal error')
                )
              }}
            />
            <Button
              variant={'primary'}
              size={'small'}
              text={'Simulate fatal error'}
              onPress={() => {
                throw new Error(`Simulated fatal error`)
              }}
            />
            <Button
              variant={'primary'}
              size={'small'}
              text={'Clear offers state'}
              onPress={() => {
                store.set(offersStateAtom, {
                  lastUpdatedAt: MINIMAL_DATE,
                  offers: [],
                })
                Alert.alert('Done')
              }}
            />
            <Button
              variant={'primary'}
              size={'small'}
              text={'Clear messaging state'}
              onPress={() => {
                const userInbox: Inbox = {privateKey: session.privateKey}

                store.set(messagingStateAtom, [{inbox: userInbox, chats: []}])
                Alert.alert('Done')
              }}
            />
            <Button
              variant={'primary'}
              size={'small'}
              text={'Refresh chat state'}
              onPress={() => {
                void pipe(
                  refreshMessaging(),
                  T.map((result) => {
                    if (result === 'done') {
                      Alert.alert('done')
                    }
                  })
                )()
              }}
            />
            <Button
              variant={'primary'}
              size={'small'}
              text={'Refresh messages state'}
              onPress={() => {
                void pipe(
                  refreshMessaging(),
                  T.map((result) => {
                    if (result === 'done') {
                      Alert.alert('done')
                    }
                  })
                )()
              }}
            />
            <Button
              variant={'primary'}
              size={'small'}
              text={'Refresh offers state'}
              onPress={() => {
                void refreshOffers().then(() => {
                  Alert.alert('done')
                })
              }}
            />

            <Button
              variant={'primary'}
              size={'small'}
              text={'Reconstruct user inbox'}
              onPress={() => {
                store.set(messagingStateAtom, (old) => [
                  ...old.filter(
                    (one) =>
                      one.inbox.privateKey.publicKeyPemBase64 !==
                      session.privateKey.publicKeyPemBase64
                  ),
                  {
                    inbox: {
                      privateKey: session.privateKey,
                    },
                    chats: [],
                  },
                ])
              }}
            />

            <Button
              variant="primary"
              size="small"
              text="Delete offer connections without offer"
              onPress={() => {
                store.set(deleteOrphanRecordsActionAtom)
              }}
            />

            <Button
              variant={'primary'}
              size={'small'}
              text={'Print offer and chat state into console'}
              onPress={() => {
                const offers = store.get(offersStateAtom)
                const messagingState = store.get(messagingStateAtom)
                const connectionState = store.get(offerToConnectionsAtom)
                console.log({offers, messagingState, connectionState})
              }}
            />

            <Button
              variant={'primary'}
              size={'small'}
              text={'Delete user inbox'}
              onPress={() => {
                void pipe(
                  deleteInbox(session.privateKey),
                  T.map((result) => {
                    if (result) {
                      Alert.alert('done')
                    } else {
                      Alert.alert('error')
                    }
                  })
                )()
              }}
            />

            <Button
              variant={'primary'}
              size={'small'}
              text={'Delete all inboxes'}
              onPress={() => {
                void pipe(
                  deleteAllInboxes(),
                  T.map((result) => {
                    if (result) {
                      Alert.alert('done')
                    } else {
                      Alert.alert('error')
                    }
                  })
                )()
              }}
            />

            <Button
              variant={'primary'}
              size={'small'}
              text={'Update all offers connections'}
              onPress={() => {
                void updateConnections({isInBackground: false})()
              }}
            />

            <Button
              variant={'primary'}
              size={'small'}
              text={'Copy notification token'}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onPress={async () => {
                Clipboard.setString(
                  (await messaging().getToken()) || 'No token'
                )
              }}
            />
            <Button
              variant="primary"
              size="small"
              text="Simulate offers deleted from server"
              onPress={() => {
                void store
                  .get(privateApiAtom)
                  .offer.deleteOffer({
                    adminIds: store
                      .get(myOffersAtom)
                      .map((one) => one.ownershipInfo.adminId),
                  })()
                  .then(() => {
                    Alert.alert('done')
                  })
                  .catch((error) => {
                    Alert.alert('Error', error.message)
                  })
              }}
            />

            <Button
              variant="primary"
              size="small"
              text="Toggle debug notifications"
              onPress={() => {
                setShowDebugNotifications(!getShowDebugNotifications())
                Alert.alert(
                  getShowDebugNotifications() ? 'Enabled' : 'Disabled'
                )
              }}
            />
          </YStack>
          <SimulateMissingOfferInbox />
          <Preferences />
          <AfterInteractionTaskDemo />
        </ScrollView>
        <Button variant="secondary" text="back" onPress={safeGoBack} />
      </WhiteContainer>
    </Screen>
  )
}

export default DebugScreen
