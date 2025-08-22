const { createRequire } = require('module');

function getPlatform() {
  const { platform, arch } = process;
  switch (platform) {
    case 'win32':
      return arch === 'x64' ? 'win32-x64-msvc' : `win32-${arch}`;
    case 'darwin':
      return arch === 'arm64' ? 'darwin-arm64' : 'darwin-x64';
    case 'linux':
      return arch === 'x64' ? 'linux-x64-gnu' : `linux-${arch}`;
    default:
      throw new Error(`Unsupported platform: ${platform}-${arch}`);
  }
}

const platformName = getPlatform();
const require = createRequire(import.meta.url);

try {
  module.exports = require(`./index.${platformName}.node`);
} catch (e) {
  try {
    module.exports = require('./index.node');
  } catch (fallbackError) {
    throw new Error(`Failed to load native binary for ${platformName}: ${fallbackError.message}`);
  }
}
