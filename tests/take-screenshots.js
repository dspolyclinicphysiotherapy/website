const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const outDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('Loading home page...');
  await page.goto('http://localhost:3050/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(outDir, '01-home.png'), fullPage: false });

  const navLinks = [
    { text: 'Treatments', expectedUrl: 'treatments.html' },
    { text: 'The Doctor', expectedUrl: 'about.html' },
    { text: 'Book', expectedUrl: 'book.html' },
    { text: 'Contact', expectedUrl: 'contact.html' }
  ];

  for (let i = 0; i < navLinks.length; i++) {
    const item = navLinks[i];
    console.log(`\nClicking nav link: "${item.text}"...`);
    const link = page.locator(`.nav-links a:has-text("${item.text}")`).first();
    await link.click();
    await page.waitForLoadState('networkidle');
    console.log(`New URL: ${page.url()}`);
    console.log(`Page Title: ${await page.title()}`);
    await page.screenshot({ path: path.join(outDir, `0${i+2}-${item.text.toLowerCase().replace(/\s+/g, '-')}.png`), fullPage: false });
  }

  await browser.close();
  console.log('\nAll navigation screenshots captured successfully in tests/screenshots/');
})();
