const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable web platform to avoid lightningcss issues
config.resolver.platforms = ['ios', 'android'];

module.exports = config;
