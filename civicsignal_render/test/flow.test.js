const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { inferCategory } = require('../service-directory');

test('streetlight near a park remains a streetlight issue', () => {
  assert.equal(inferCategory('A streetlight is out on Fictional Avenue near Sample Park.'), 'Streetlight');
});

test('clarification, consent, routing and private tracker work together', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'civicsignal-test-'));
  const reportsFile = path.join(directory, 'reports.json');
  const port = 4174 + Math.floor(Math.random() * 1000);
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(port), CIVICSIGNAL_REPORTS_FILE: reportsFile, CIVICSIGNAL_ADMIN_PASSWORD: 'test-only-password' },
    stdio: 'ignore'
  });
  const request = async (url, options) => {
    const response = await fetch(base + url, options);
    return { status: response.status, body: await response.json() };
  };
  const post = (url, value) => request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      try { if ((await request('/api/health')).status === 200) { ready = true; break; } } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready, 'server started');
    const issue = { originalDescription: 'The streetlight is broken near a business.', city: 'San José', locationType: 'city', location: '', landmark: '', categoryHint: 'Not sure', clarifications: [] };
    const first = await post('/api/analyze', issue);
    assert.equal(first.status, 200);
    assert.equal(first.body.question.id, 'place');
    assert.equal(first.body.routeStatus, 'Needs review');
    const skipped = await post('/api/analyze', { ...issue, skipClarifications: true });
    assert.equal(skipped.body.question, null);
    assert.ok(skipped.body.flags.some(flag => flag.type === 'Details skipped'));
    const detailed = await post('/api/analyze', { ...issue, landmark: 'Near the library' });
    assert.equal(detailed.body.routeStatus, 'Assigned in local tracker');
    const edited = { subject: 'Streetlight outage near library', summary: 'A streetlight near the library appears to be out.', category: 'Streetlight', locationType: 'address', location: '12 Sample St', landmark: 'Library', nextStep: 'Review the San José streetlight guidance.' };
    const payload = { issue, edited, confirmed: true };
    assert.equal((await post('/api/reports', payload)).status, 400);
    assert.equal((await post('/api/reports', { ...payload, issue: { ...issue, originalDescription: 'The streetlight is broken. Call 408-555-0101.' }, exactLocationConsent: true })).status, 400);
    assert.equal((await post('/api/reports', { ...payload, exactLocationConsent: true })).status, 201);
    assert.equal((await request('/api/admin/reports')).status, 401);
    const admin = await request('/api/admin/reports', { headers: { 'X-CivicSignal-Admin': 'test-only-password' } });
    assert.equal(admin.status, 200);
    assert.equal(admin.body.reports.length, 1);
    assert.equal(admin.body.reports[0].originalReport.description, issue.originalDescription);
    assert.match(admin.body.reports[0].polishedReport, /Streetlight outage near library/);
    assert.equal(admin.body.reports[0].exactLocationConsent, true);
    assert.equal((await fetch(base + '/')).status, 200);
  } finally {
    if (child.exitCode === null) {
      child.kill();
      await new Promise(resolve => child.once('exit', resolve));
    }
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test('hosted demo drafts without storing or exposing reports', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'civicsignal-hosted-test-'));
  const reportsFile = path.join(directory, 'reports.json');
  const port = 5200 + Math.floor(Math.random() * 1000);
  const base = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(port), CIVICSIGNAL_MODE: 'hosted-demo', CIVICSIGNAL_REPORTS_FILE: reportsFile },
    stdio: 'ignore'
  });
  try {
    let health;
    for (let attempt = 0; attempt < 50; attempt++) {
      try { const response = await fetch(base + '/api/health'); if (response.ok) { health = await response.json(); break; } } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.equal(health?.mode, 'hosted-demo');
    assert.equal(health.saveEnabled, false);
    assert.equal(health.adminEnabled, false);
    const issue = { originalDescription: 'A pothole is near the library.', city: 'San José', locationType: 'city', location: '', categoryHint: 'Pothole', clarifications: [] };
    const analyze = await fetch(base + '/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify(issue) });
    assert.equal(analyze.status, 200);
    const crossOrigin = await fetch(base + '/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://other.example' }, body: JSON.stringify(issue) });
    assert.equal(crossOrigin.status, 403);
    const save = await fetch(base + '/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(save.status, 403);
    assert.equal((await fetch(base + '/api/admin/reports')).status, 403);
    await assert.rejects(fs.stat(reportsFile), { code: 'ENOENT' });
  } finally {
    if (child.exitCode === null) {
      child.kill();
      await new Promise(resolve => child.once('exit', resolve));
    }
    await fs.rm(directory, { recursive: true, force: true });
  }
});
