const {
  withDangerousMod,
  withSettingsGradle,
  withAppBuildGradle,
  withMainApplication
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// iOS: No additional Podfile changes needed
// simdjson is handled via react-native.config.js autolinking
function withIOSPodfile(config) {
  // WatermelonDB.podspec declares `s.dependency "simdjson"`
  // react-native.config.js registers @nozbe/simdjson for autolinking
  // This ensures simdjson is added to Podfile exactly once
  return config;
}

// iOS: Create Swift bridging header for WatermelonDB
function withIOSBridgingHeader(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectName = config.modRequest.projectName || config.name.replace(/[- ]/g, '');
      const filePath = path.join(config.modRequest.platformProjectRoot, projectName, 'wmelon.swift');

      const contents = `//
//  wmelon.swift
//  WatermelonDB bridging header
//
import Foundation
`;

      fs.writeFileSync(filePath, contents);
      return config;
    },
  ]);
}

// Android: Add watermelondb-jsi to settings.gradle
function withAndroidSettingsGradle(config) {
  return withSettingsGradle(config, (mod) => {
    if (!mod.modResults.contents.includes(':watermelondb-jsi')) {
      mod.modResults.contents += `
include ':watermelondb-jsi'
project(':watermelondb-jsi').projectDir = new File([
    "node", "--print",
    "require.resolve('@nozbe/watermelondb/package.json')"
].execute(null, rootProject.projectDir).text.trim(), "../native/android-jsi")
`;
    }
    return mod;
  });
}

// Android: Add JSI implementation to build.gradle
function withAndroidBuildGradle(config) {
  return withAppBuildGradle(config, (mod) => {
    if (!mod.modResults.contents.includes("implementation project(':watermelondb-jsi')")) {
      mod.modResults.contents = mod.modResults.contents.replace(
        'dependencies {',
        `dependencies {
    implementation project(':watermelondb-jsi')`
      );
    }

    if (!mod.modResults.contents.includes("pickFirst '**/libc++_shared.so'")) {
      mod.modResults.contents = mod.modResults.contents.replace(
        'android {',
        `android {
    packagingOptions {
        pickFirst '**/libc++_shared.so'
    }`
      );
    }

    return mod;
  });
}

// Android: Add JSI package to MainApplication
function withAndroidMainApplication(config) {
  return withMainApplication(config, (mod) => {
    // Add imports
    if (!mod.modResults.contents.includes('import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage')) {
      mod.modResults.contents = mod.modResults.contents.replace(
        'import android.app.Application',
        `import android.app.Application
import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage
import com.facebook.react.bridge.JSIModulePackage`
      );
    }

    // Add JSI module
    if (!mod.modResults.contents.includes('override fun getJSIModulePackage()')) {
      mod.modResults.contents = mod.modResults.contents.replace(
        'override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED',
        `override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED

    override fun getJSIModulePackage(): JSIModulePackage {
      return WatermelonDBJSIPackage()
    }`
      );
    }

    return mod;
  });
}

// Android: Add ProGuard rules
function withAndroidProguard(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const proguardPath = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'proguard-rules.pro'
      );

      if (fs.existsSync(proguardPath)) {
        let contents = fs.readFileSync(proguardPath, 'utf-8');

        if (!contents.includes('-keep class com.nozbe.watermelondb.** { *; }')) {
          contents += `

# WatermelonDB
-keep class com.nozbe.watermelondb.** { *; }
`;
          fs.writeFileSync(proguardPath, contents);
        }
      }

      return config;
    },
  ]);
}

// Main plugin export
module.exports = function withWatermelonDB(config) {
  // iOS
  config = withIOSPodfile(config);
  config = withIOSBridgingHeader(config);

  // Android
  config = withAndroidSettingsGradle(config);
  config = withAndroidBuildGradle(config);
  config = withAndroidMainApplication(config);
  config = withAndroidProguard(config);

  return config;
};
