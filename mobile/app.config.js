const base = require('./app.json').expo;
module.exports = () => {
  const androidFile = process.env.BSQUARE_GOOGLE_SERVICES_JSON;
  const iosFile = process.env.BSQUARE_GOOGLE_SERVICE_INFO_PLIST;
  const androidPackage = process.env.BSQUARE_ANDROID_PACKAGE;
  const iosBundle = process.env.BSQUARE_IOS_BUNDLE_ID;
  const plugins = [...base.plugins];
  if (androidFile || iosFile) {
    plugins.push('@react-native-firebase/app');
    plugins.push('@react-native-firebase/auth');
    plugins.push(['expo-build-properties', { ios: { useFrameworks: 'static' } }]);
  }
  return {
    ...base,
    android: { ...base.android, ...(androidPackage ? { package: androidPackage } : {}), ...(androidFile ? { googleServicesFile: androidFile } : {}) },
    ios: { ...base.ios, ...(iosBundle ? { bundleIdentifier: iosBundle } : {}), ...(iosFile ? { googleServicesFile: iosFile } : {}) },
    plugins
  };
};
