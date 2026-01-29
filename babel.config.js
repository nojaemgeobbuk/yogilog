module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // WatermelonDB 데코레이터 지원 (다른 플러그인보다 먼저 와야 함)
      ["@babel/plugin-proposal-decorators", { legacy: true }],
      // Reanimated 플러그인은 항상 마지막에
      "react-native-reanimated/plugin",
    ],
  };
};
