/**
 * Jest global setup — runs once before any test worker starts.
 *
 * All tests run in US Eastern time (America/New_York), the app's home
 * timezone. This must be set here rather than inside a test file: test
 * workers inherit it at startup, whereas changing process.env.TZ inside a
 * test file is too late to take effect.
 */
module.exports = async () => {
  process.env.TZ = 'America/New_York';
};
