import assert from 'assert/strict';
import fetch from 'node-fetch';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { setTimeout as delay } from 'timers/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverPath = path.join(__dirname, '..', 'server.js');

// Utility to start server and wait until listening line appears
async function startServer() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [serverPath], {
      env: { ...process.env, PORT: '18080', JWT_SECRET: 'test-secret', DATABASE_URL: process.env.DATABASE_URL || '' },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let started = false; let output = '';
    child.stdout.on('data', d => {
      output += d.toString();
      if (/API listening on :18080/.test(output) && !started) { started = true; resolve(child); }
    });
    child.stderr.on('data', d => { output += d.toString(); });
    child.on('exit', code => { if(!started) reject(new Error('Server exited early code '+code+' output:'+output)); });
  });
}

async function http(method, url, body, token){
  const resp = await fetch(url, { method, headers: { 'Content-Type':'application/json', ...(token? { Authorization: 'Bearer '+token }: {}) }, body: body? JSON.stringify(body): undefined });
  const text = await resp.text();
  let json; try { json = text? JSON.parse(text): null; } catch { json = { raw: text }; }
  return { status: resp.status, json };
}

(async () => {
  const child = await startServer();
  const base = 'http://localhost:18080';
  try {
    // Health
    const health = await http('GET', base + '/healthz');
    assert.equal(health.status, 200, 'healthz status');
    assert.equal(health.json.ok, true, 'healthz ok=true');

    // Register (multi-goal)
    const email = 'user_'+Date.now()+'@test.local';
    const reg = await http('POST', base + '/api/auth/register', { email, password: 'Test1234!', goal: ['Strength','Cardio'] });
    assert.equal(reg.status, 200, 'register status');
    assert.ok(reg.json.token, 'register returns token');
    assert.ok(Array.isArray(reg.json.user.goal), 'goal stored array');

    // Login
    const login = await http('POST', base + '/api/auth/login', { email, password: 'Test1234!' });
    assert.equal(login.status, 200, 'login status');
    assert.ok(login.json.token, 'login token present');

    // Verify
    const verify = await http('GET', base + '/api/auth/verify', null, login.json.token);
    assert.equal(verify.status, 200, 'verify status');
    assert.equal(verify.json.user.email, email.toLowerCase(), 'verify email matches');

    console.log('\nAll auth tests passed');
  } catch (e) {
    console.error('TEST FAILURE:', e);
    process.exitCode = 1;
  } finally {
    child.kill('SIGTERM');
    await delay(300);
  }
})();
