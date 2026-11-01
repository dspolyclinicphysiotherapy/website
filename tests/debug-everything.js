const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const errors = [];
  const failedRequests = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ url: page.url(), text: msg.text() });
    }
  });

  page.on('pageerror', err => {
    errors.push({ url: page.url(), text: err.message });
  });

  page.on('response', resp => {
    if (resp.status() >= 400 && !resp.url().includes('favicon')) {
      failedRequests.push({ url: resp.url(), status: resp.status() });
    }
  });

  const urlsToTest = [
    'http://localhost:3050/',
    'http://localhost:3050/index.html',
    'http://localhost:3050/treatments.html',
    'http://localhost:3050/about.html',
    'http://localhost:3050/book.html',
    'http://localhost:3050/contact.html',
    'http://localhost:3050/treatments',
    'http://localhost:3050/about',
    'http://localhost:3050/book',
    'http://localhost:3050/contact'
  ];

  console.log('--- 1. Testing Page Loading & Network Requests ---');
  for (const url of urlsToTest) {
    try {
      const resp = await page.goto(url, { waitUntil: 'load' });
      console.log(`[${resp.status()}] ${url} -> Title: "${await page.title()}"`);
    } catch (e) {
      console.error(`FAILED to load ${url}:`, e.message);
    }
  }

  console.log('\n--- 2. Testing Homepage Interactive Elements ---');
  await page.goto('http://localhost:3050/');

  // Test Booking Modal on Homepage
  console.log('Testing "Book Visit" button in navbar...');
  const bookVisitBtn = page.locator('.nav-cta:has-text("Book Visit")').first();
  await bookVisitBtn.click();
  await page.waitForTimeout(400);
  const modalOpen = await page.locator('#booking-modal').evaluate(el => el.classList.contains('open'));
  console.log('Booking Modal opened:', modalOpen);

  // Close modal
  const modalClose = page.locator('#booking-modal-close');
  if (await modalClose.isVisible()) {
    await modalClose.click();
    await page.waitForTimeout(300);
    console.log('Modal closed:', !(await page.locator('#booking-modal').evaluate(el => el.classList.contains('open'))));
  }

  // Test Quiz on Homepage
  console.log('Testing Pain Recovery Quiz on Homepage...');
  const quizNextBtn = page.locator('#quiz-btn');
  if (await quizNextBtn.isVisible()) {
    console.log('Quiz button found. Clicking Option...');
    const firstOption = page.locator('#quiz-options .quiz-opt').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
      await page.waitForTimeout(200);
      await quizNextBtn.click();
      await page.waitForTimeout(300);
      console.log('Quiz moved to next question.');
    }
  }

  console.log('\n--- 3. Testing Book Page Form Submission ---');
  await page.goto('http://localhost:3050/book.html');
  await page.fill('#patient-name', 'Playwright Test Patient');
  await page.fill('#patient-phone', '9891018300');
  await page.fill('#patient-email', 'test@dspolyclinic.com');
  const bookSubmitBtn = page.locator('#submit-booking-btn');
  console.log('Submitting booking form...');
  await bookSubmitBtn.click();
  await page.waitForTimeout(1000);
  const bookFeedback = await page.locator('#booking-feedback').textContent();
  console.log('Booking form feedback:', bookFeedback.trim());

  console.log('\n--- 4. Testing Contact Page Inquiry Submission ---');
  await page.goto('http://localhost:3050/contact.html');
  await page.fill('#inquiry-name', 'Playwright Contact Lead');
  await page.fill('#inquiry-phone', '9891018300');
  await page.fill('#inquiry-message', 'I have knee pain for 2 months.');
  const contactSubmitBtn = page.locator('#inquiry-submit-btn');
  console.log('Submitting contact inquiry form...');
  await contactSubmitBtn.click();
  await page.waitForTimeout(1000);
  const contactFeedback = await page.locator('#inquiry-feedback').textContent();
  console.log('Contact form feedback:', contactFeedback.trim());

  console.log('\n--- 5. Summary of Console Errors & Failed Requests ---');
  console.log('Console Errors:', JSON.stringify(errors, null, 2));
  console.log('Failed Requests:', JSON.stringify(failedRequests, null, 2));

  await browser.close();
  console.log('\nDone full diagnostic.');
})();
