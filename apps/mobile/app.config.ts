const VERSION_CODE = 14
const VERSION = '0.0.1'
const ENV_PRESET = process.env.ENV_PRESET

const presets = {
  stage: {
    enableHiddenFeatures: true,
    apiPreset: 'stageEnv',
    versionCode: VERSION_CODE,
    version: `${VERSION} (${VERSION_CODE})`,
    packageName: 'it.vexl.nextstaging',
    appName: 'Vexl Next (stage)',
    googleServicesInfoPlistFile: './creds/GoogleService-stage-Info.plist',
    foregroundImage: './assets/android-front.png',
    backgroundImage: './assets/android-back-stage.png',
    icon: './assets/icon-stage.png',
  },
  prod: {
    enableHiddenFeatures: false,
    apiPreset: 'prodEnv',
    versionCode: VERSION_CODE,
    version: `${VERSION} (${VERSION_CODE})`,
    packageName: 'it.vexl.next',
    appName: 'Vexl Next',
    googleServicesInfoPlistFile: './creds/GoogleService-Info.plist',
    foregroundImage: './assets/android-front-next.png',
    backgroundImage: './assets/android-back-next.png',
    icon: './assets/icon-next.png',
  },
}

// @ts-expect-error there is fallback there.
const extra = presets[String(ENV_PRESET)] ?? presets.stage

export default {
  'name': extra.appName,
  'slug': 'vexl',
  'version': VERSION,
  'orientation': 'portrait',
  'icon': extra.icon,
  'userInterfaceStyle': 'light',
  'jsEngine': 'hermes',
  'splash': {
    'image': './assets/splash.png',
    'resizeMode': 'contain',
    'backgroundColor': '#ACD9B7',
  },
  'updates': {
    'fallbackToCacheTimeout': 0,
    'url': 'https://u.expo.dev/8a2b78bf-b758-42b9-947a-c6201cb7cc59',
  },
  'assetBundlePatterns': ['**/*'],
  'ios': {
    buildNumber: String(VERSION_CODE),
    'supportsTablet': false,
    'bundleIdentifier': extra.packageName,
    'config': {
      'usesNonExemptEncryption': false,
    },
    'infoPlist': {
      'UIBackgroundModes': ['fetch', 'remote-notification'],
      'LSApplicationQueriesSchemes': ['itms-apps'],
    },
    'googleServicesFile': extra.googleServicesInfoPlistFile,
  },
  'android': {
    versionCode: VERSION_CODE,
    'softwareKeyboardLayoutMode': 'resize',
    'adaptiveIcon': {
      'foregroundImage': extra.foregroundImage,
      'backgroundImage': extra.backgroundImage,
    },
    'package': extra.packageName,
    'googleServicesFile': './creds/google-services.json',
  },
  'web': {
    'favicon': './assets/favicon.png',
  },
  'owner': 'vexlit',
  'runtimeVersion': {
    'policy': 'sdkVersion',
  },
  'plugins': [
    [
      'expo-image-picker',
      {
        'photosPermission':
          'Vexl wants to access your camera in order to select a photo for your avatar.',
        'cameraPermission':
          'Vexl wants to access your camera in order to take a photo for your avatar.',
        'microphonePermission': false,
      },
    ],
    [
      'expo-contacts',
      {
        'contactsPermission':
          'Vexl needs access to your contacts to make your offers visible for them in a secure way. Phone number of contacts you select will be encrypted and uploaded to the server.',
      },
    ],
    [
      'expo-build-properties',
      {
        'ios': {
          'useFrameworks': 'static',
        },
      },
    ],
    '@react-native-firebase/app',
    '@react-native-firebase/crashlytics',
    '@notifee/react-native',
    './expo-plugins/disable-firebase-analytics.js',
    './expo-plugins/setup-headless-background-message-processing-ios.js',
  ],

  'extra': {
    'eas': {
      'projectId': 'dbcc5b47-6c4a-4faf-a345-e9cd8a680c32',
    },
    ...extra,
  },
}
