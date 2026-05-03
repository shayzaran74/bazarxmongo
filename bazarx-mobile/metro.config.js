const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

// Monorepo kök dizinini bul
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Tüm monorepo dizinlerini izle (Workspace support)
config.watchFolders = [workspaceRoot];

// 2. Paket çözme ayarlarını pnpm ve monorepo için optimize et
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. NativeWind entegrasyonunu koru
module.exports = withNativeWind(config, { input: "./global.css" });
