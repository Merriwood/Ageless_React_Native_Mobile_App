// Mock for react-native-css-interop native runtime
module.exports = {
  Dimensions: {
    get: jest.fn(() => ({
      width: 375,
      height: 812,
      scale: 2,
      fontScale: 1,
    })),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
};
