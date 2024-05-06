import {DefaultTheme, NavigationContainer} from '@react-navigation/native'
import {StatusBar} from 'expo-status-bar'
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {useTheme} from 'tamagui'
import AnimatedSplashScreen from './AnimatedSplashScreen'
import AreYouSureDialog from './components/AreYouSureDialog'
import BadgeCountManager from './components/BadgeCountManager'
import LoadingOverlayProvider from './components/LoadingOverlayProvider'
import MaintenanceAndForceUpdateCheck from './components/MaintenanceAndForceUpdateCheck'
import PreventScreenshots from './components/PreventScreenshots'
import RootNavigation from './components/RootNavigation'
import ToastNotification from './components/ToastNotification'
import UploadingOfferProgressModal from './components/UploadingOfferProgressModal'
import VersionMigrations from './components/VersionMigrations'
import ThemeProvider from './utils/ThemeProvider'
import {setLastTimeAppWasRunningToNow} from './utils/lastTimeAppWasRunning'
import {navigationRef} from './utils/navigation'
import {useAppState} from './utils/useAppState'

function App(): JSX.Element {
  const theme = useTheme()

  useAppState(setLastTimeAppWasRunningToNow, true)

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <BadgeCountManager />
      <PreventScreenshots />
      <NavigationContainer
        ref={navigationRef}
        theme={{
          dark: true,
          colors: {
            ...DefaultTheme.colors,
            primary: theme.background?.val,
            background: 'transparent',
            text: theme.color?.val,
          },
        }}
      >
        <LoadingOverlayProvider>
          <MaintenanceAndForceUpdateCheck>
            <VersionMigrations>
              <GestureHandlerRootView style={{flex: 1}}>
                <RootNavigation />
              </GestureHandlerRootView>
            </VersionMigrations>
            <UploadingOfferProgressModal />
          </MaintenanceAndForceUpdateCheck>
        </LoadingOverlayProvider>
        <AreYouSureDialog />
        <ToastNotification />
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

export default function _(): JSX.Element {
  return (
    <ThemeProvider>
      <AnimatedSplashScreen>
        <App />
      </AnimatedSplashScreen>
    </ThemeProvider>
  )
}
