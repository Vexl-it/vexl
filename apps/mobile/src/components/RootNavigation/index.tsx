import InsideScreen from '../InsideRouter'
import LoginFlow from '../LoginFlow'
import {useIsUserLoggedIn} from '../../state/session'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import {type RootStackParamsList} from '../../navigationTypes'
import PostLoginFlow from '../PostLoginFlow'
import {
  useHandleNotificationsPermissionsRedirect,
  useHandlePostLoginFlowRedirect,
} from './utils'
import TodoScreen from '../TodoScreen'
import OfferDetailScreen from '../OfferDetailScreen'
import ChatDetailScreen from '../ChatDetailScreen'
import TosScreen from '../TosScreen'
import FaqsScreen from '../FaqScreen'
import CreateOfferScreen from '../OfferScreen/components/CreateOfferScreen'
import {NotificationPermissionsScreen} from '../NotificationPermissionsScreen'
import {useRefreshNotificationTokenOnResumeAssumeLoggedIn} from '../../utils/notifications/useRefreshNotificationTokenOnResumeAssumeLoggedIn'
import {useHandleReceivedNotifications} from '../../state/useHandleReceivedNotifications'
import DebugScreen from '../DebugScreen'
import SetContactsScreen from '../SetContactsScreen'
import useHandleRefreshContactServiceAndOffers from '../../state/useHandleRefreshContactServiceAndOffers'
import MyOffersScreen from '../MyOffersScreen'
import EditOfferScreen from '../OfferScreen/components/EditOfferScreen'

const Stack = createNativeStackNavigator<RootStackParamsList>()

function LoggedInHookGroup(): null {
  useRefreshNotificationTokenOnResumeAssumeLoggedIn()
  useHandleReceivedNotifications()

  useHandleNotificationsPermissionsRedirect()
  useHandlePostLoginFlowRedirect()
  useHandleRefreshContactServiceAndOffers()

  return null
}

function RootNavigation(): JSX.Element {
  const isLoggedIn = useIsUserLoggedIn()

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          presentation: 'card',
        }}
      >
        {!isLoggedIn ? (
          <Stack.Screen name={'LoginFlow'} component={LoginFlow} />
        ) : (
          <Stack.Group>
            <Stack.Screen name={'InsideTabs'} component={InsideScreen} />
            <Stack.Screen name={'TodoScreen'} component={TodoScreen} />
            <Stack.Screen name={'PostLoginFlow'} component={PostLoginFlow} />
            <Stack.Screen name={'OfferDetail'} component={OfferDetailScreen} />
            <Stack.Screen name={'CreateOffer'} component={CreateOfferScreen} />
            <Stack.Screen name={'EditOffer'} component={EditOfferScreen} />
            <Stack.Screen name={'MyOffers'} component={MyOffersScreen} />
            <Stack.Screen name={'ChatDetail'} component={ChatDetailScreen} />
            <Stack.Screen name={'SetContacts'} component={SetContactsScreen} />
            <Stack.Screen
              name={'NotificationPermissionsMissing'}
              component={NotificationPermissionsScreen}
            />
          </Stack.Group>
        )}
        <Stack.Screen name={'TermsAndConditions'} component={TosScreen} />
        <Stack.Screen name={'Faqs'} component={FaqsScreen} />
        <Stack.Screen name={'DebugScreen'} component={DebugScreen} />
      </Stack.Navigator>
      {isLoggedIn && <LoggedInHookGroup />}
    </>
  )
}

export default RootNavigation
