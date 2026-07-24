const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  resolver: {
    sourceExts: ['js', 'json', 'jsx', 'ts', 'tsx'],
    assetExts: ['glb', 'gltf', 'png', 'jpg', 'jpeg', 'dxf', 'html', 'js', 'css', 'svg', 'ttf', 'woff', 'woff2'],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
