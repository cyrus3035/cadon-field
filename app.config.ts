import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'CADonField',
  displayName: 'CADonField',
  slug: 'cadon-field',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
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
    permissions: [
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO'
    ]
  },
  plugins: [
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to access your location'
      }
    ]
  ]
});
