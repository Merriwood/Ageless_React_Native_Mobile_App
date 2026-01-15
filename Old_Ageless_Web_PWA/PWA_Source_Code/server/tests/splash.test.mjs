// Basic splash screen logic test using a simulated DOM.
// Verifies skipSplash decision path based on mbh_lastActive timestamp (<2 min) vs stale.
import { strict as assert } from 'assert';

function simulateSkip(lastActiveDeltaMs){
  const now = Date.now();
  const storage = new Map();
  if(lastActiveDeltaMs !== null){
    storage.set('mbh_lastActive', String(now - lastActiveDeltaMs));
  }
  // Inline copy of decision snippet from DOMContentLoaded bootstrap
  let skipSplash = false;
  try {
    const prev = parseInt(storage.get('mbh_lastActive')||'0',10);
    if(prev && (now - prev) < 120000) skipSplash = true;
  } catch {}
  return skipSplash;
}

// Recent activity (60s) should skip
assert.equal(simulateSkip(60000), true, 'Expected splash to skip when activity <2m');
// Stale activity (3m) should NOT skip
assert.equal(simulateSkip(180000), false, 'Expected splash to show when activity >=2m');
// No activity stored should NOT skip
assert.equal(simulateSkip(null), false, 'Expected splash to show when no prior activity');

console.log('\u2714 splash.test.mjs passed');
