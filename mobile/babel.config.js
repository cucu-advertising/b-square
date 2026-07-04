module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // must stay last
      'react-native-worklets/plugin',
    ],
  };
};
