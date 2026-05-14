import puppeteer from 'puppeteer';

(async () => {
  try {
    const API = process.env.STAGING_API_URL || 'http://localhost:4000/api';
    const FRONTEND = process.env.STAGING_FRONTEND_URL || 'http://localhost:3000';
    const initialPassword = 'password123';
    const newPassword = 'NewPass!234';
    const email = `staging-e2e+${Date.now()}@example.com`;

    console.log('E2E START - Email:', email);

    // 1) Signup
    let res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'E2E Test', email, password: initialPassword })
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Signup failed: ${res.status} ${body}`);
    }

    console.log('Signup OK');

    // 2) Trigger forgot-password
    res = await fetch(`${API}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Forgot-password request failed: ${res.status} ${body}`);
    }

    const data = await res.json();

    // Look for resetUrl in multiple places (compat)
    const resetUrl = data.resetUrl || (data.data && data.data.resetUrl) || (data.data && data.data.resetUrl);

    if (!resetUrl) {
      throw new Error('No resetUrl returned by API. Ensure ENABLE_DEBUG_EMAILS=true in staging. Response: ' + JSON.stringify(data));
    }

    console.log('Reset URL:', resetUrl);

    // 3) Visit reset URL and set new password
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    await page.goto(resetUrl, { waitUntil: 'networkidle2' });

    // Fill password fields - IDs match ResetPassword component
    await page.waitForSelector('#password', { timeout: 5000 });
    await page.type('#password', newPassword);
    await page.type('#confirmPassword', newPassword);

    // Submit form
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {})
    ]);

    // Optionally check for success message
    const title = await page.$eval('.auth-title', el => el.textContent).catch(() => null);
    console.log('Reset page title:', title);

    await browser.close();

    // 4) Try logging in with new password
    res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: newPassword })
    });

    const loginResp = await res.json();

    if (!res.ok || !loginResp.success) {
      throw new Error('Login post-reset failed: ' + JSON.stringify(loginResp));
    }

    console.log('E2E PASS: Reset + login succeeded');
    process.exit(0);
  } catch (err) {
    console.error('E2E FAIL:', err.message || err);
    process.exit(1);
  }
})();
