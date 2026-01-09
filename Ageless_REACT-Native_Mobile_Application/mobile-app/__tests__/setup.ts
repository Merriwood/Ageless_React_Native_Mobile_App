/*
 * Test Setup File
 * Mocks React Native modules for unit testing
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  getCredentialAsync: jest.fn(),
  setCredentialAsync: jest.fn(),
  deleteCredentialAsync: jest.fn(),
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
  addEventListener: jest.fn(() => jest.fn()),
  useNetInfo: jest.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
}));

// Mock nativewind early (used by babel jsx transformer)
jest.mock('nativewind', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

// Mock react-native
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  ActivityIndicator: 'ActivityIndicator',
  Alert: {
    alert: jest.fn(),
  },
  AppState: {
    addEventListener: jest.fn(),
    currentState: 'active',
  },
  Platform: {
    OS: 'ios',
    Version: 14,
  },
  Appearance: {
    getColorScheme: jest.fn(() => 'light'),
    addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
    isBoldTextEnabled: jest.fn(() => Promise.resolve(false)),
    isGrayscaleEnabled: jest.fn(() => Promise.resolve(false)),
    isInvertColorsEnabled: jest.fn(() => Promise.resolve(false)),
    isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
    isReduceTransparencyEnabled: jest.fn(() => Promise.resolve(false)),
    isScreenReaderEnabledSync: jest.fn(() => false),
    isBoldTextEnabledSync: jest.fn(() => false),
    isGrayscaleEnabledSync: jest.fn(() => false),
    isInvertColorsEnabledSync: jest.fn(() => false),
    isReduceMotionEnabledSync: jest.fn(() => false),
    isReduceTransparencyEnabledSync: jest.fn(() => false),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

// Mock react-native-css-interop - needs to happen before any module using it is imported
jest.mock('react-native-css-interop', () => ({
  useColorScheme: jest.fn(() => 'light'),
  createInsertRules: jest.fn(() => jest.fn()),
  css: jest.fn((strings, ...values) => {
    let result = '';
    strings.forEach((str, i) => {
      result += str + (values[i] || '');
    });
    return result;
  }),
}));

// Global mocks
global.fetch = jest.fn();

export {};

// Test helpers - Mock API responses and errors
export const mockApiResponse = (status: number, data: any) => ({
  status,
  statusText: 'OK',
  headers: {},
  config: {},
  data,
});

export const mockApiError = (status: number, message: string) => {
  const error = new Error(message) as any;
  error.response = {
    status,
    statusText: 'Error',
    headers: {},
    config: {},
    data: { message },
  };
  error.code = 'ERR_BAD_REQUEST';
  return error;
};

// Global test utilities
global.__DEV__ = false;
