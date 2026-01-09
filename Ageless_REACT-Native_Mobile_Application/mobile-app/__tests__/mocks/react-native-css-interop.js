// Mock for react-native-css-interop
module.exports = {
  useColorScheme: jest.fn(() => 'light'),
  createInsertRules: jest.fn(() => jest.fn()),
  css: jest.fn((strings, ...values) => {
    let result = '';
    strings.forEach((str, i) => {
      result += str + (values[i] || '');
    });
    return result;
  }),
};
