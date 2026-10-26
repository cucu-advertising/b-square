const fs = require('fs');
const path = require('path');
const base = require('./app.json').expo;

module.exports = () => {
  // EAS file variables resolve to an absolute temporary file path on the builder.
  // Local development uses the gitignored google-services.json next to this file.
  const localAndroid = path.join(__dirname, 'google-services.json');
  const androidFile = process.env.BSQUARE_GOOGLE_SERVICES_JSON ||
    (fs.existsSync(localAndroid) ? localAndroid : undefined);
  const iosFile = process.env.BSQUARE_GOOGLE_SERVICE_INFO_PLIST;
  const plugins = [
    ...base.plugins,
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    ['expo-build-properties', { ios: { useFrameworks: 'static' } }],
  ];
  return {
    ...base,
    android: {
      ...base.android,
      // Must equal the existing Play Store listing; do not change.
      package: 'com.cucuadvertising.bsquare',
      ...(androidFile ? { googleServicesFile: androidFile } : {}),
    },
    ios: {
      ...base.ios,
      ...(process.env.BSQUARE_IOS_BUNDLE_ID ? { bundleIdentifier: process.env.BSQUARE_IOS_BUNDLE_ID } : {}),
      ...(iosFile ? { googleServicesFile: iosFile } : {}),
    },
    plugins,
  };
};
