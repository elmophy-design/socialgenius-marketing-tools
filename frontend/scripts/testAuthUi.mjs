import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Capture network requests and responses
  page.on('request', (req) => {
    console.log('→', req.method(), req.url());
    const headers = req.headers();
    if (req.url().includes('/api/auth')) {
      console.log('  Request headers:', JSON.stringify({
        origin: headers.origin,
        referer: headers.referer,
        'content-type': headers['content-type']
      }, null, 2));
    }
  });

  page.on('response', async (res) => {
    if (res.url().includes('/api/auth')) {
      console.log('←', res.status(), res.url());
      const rHeaders = res.headers();
      console.log('  Response headers (CORS related):', JSON.stringify({
        'access-control-allow-origin': rHeaders['access-control-allow-origin'],
        'access-control-allow-credentials': rHeaders['access-control-allow-credentials'],
        'content-type': rHeaders['content-type']
      }, null, 2));

      try {
        const text = await res.text();
        console.log('  Response body:', text);
      } catch (e) {
        console.log('  Could not get response body:', e.message);
      }
    }
  });

  try {
    // Visit the public signup page which exists at /signup.html
    await page.goto('http://localhost:3000/signup.html', { waitUntil: 'networkidle2' });

    // Fill signup form
    await page.type('#name', 'UI Test');
    const testEmail = `ui-test+${Date.now()}@example.com`;
    await page.type('#email', testEmail);
    await page.type('#password', 'password123');
    await page.type('#confirm-password', 'password123');

    // Submit form
    await Promise.all([
      page.click('#signup-btn'),
      page.waitForResponse(r => r.url().includes('/api/auth/signup') && r.status() < 500, { timeout: 10000 })
    ]).catch(e => console.log('Signup response wait error:', e.message));

    // Now try login using the same credentials via /login.html
    await page.goto('http://localhost:3000/login.html', { waitUntil: 'networkidle2' });
    await page.type('#email', testEmail);
    await page.type('#password', 'password123');

    await Promise.all([
      page.click('#login-btn'),
      page.waitForResponse(r => r.url().includes('/api/auth/login') && r.status() < 500, { timeout: 10000 })
    ]).catch(e => console.log('Login response wait error:', e.message));

    console.log('Test completed. Look above for captured request/response logs.');
  } catch (error) {
    console.error('Test run error:', error);
  } finally {
    await browser.close();
    process.exit(0);
  }
})();