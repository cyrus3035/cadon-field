import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'cadon-field',
  displayName: 'CadonField',
  slug: 'cadon-field',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    '**/*',
    'assets/cad-viewer/**/*'
  ],
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.cadonfield.app'
  },
  android: {
    package: 'com.cadonfield.app',
    versionCode: 1,
    targetSdkVersion: 35,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    permissions: [
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO'
    ]
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    'expo-router',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to access your location'
      }
    ],
    'react-native-maps'
  ]
});
