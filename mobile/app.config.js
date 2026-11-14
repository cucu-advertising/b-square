const fs = require('fs');
const path = require('path');
const base = require('./app.json').expo;

module.exports = () => {
  // EAS file variables resolve to an absolute temporary file path on the builder.
  // Local development uses the gitignored google-services.json next to this file.
  const localAndroid = path.join(__dirname, 'google-services.json');
  const androidFile = process.env.BSQUARE_GOOGLE_SERVICES_JSON ||
    (fs.existsSync(localAndroid) ? localAndroid : undefined);
  // Keep the bundle ID identical to the existing Bsquare Club App Store record.
  if (process.env.BSQUARE_IOS_BUNDLE_ID && process.env.BSQUARE_IOS_BUNDLE_ID !== base.ios.bundleIdentifier) {
    throw new Error('BSQUARE_IOS_BUNDLE_ID does not match the existing App Store bundle identifier.');
  }
  const plugins = [
    ...base.plugins,
    ['expo-build-properties', { ios: { useFrameworks: 'static', enableSceneSupport: true } }],
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
    },
    plugins,
  };
};
