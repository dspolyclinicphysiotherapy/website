const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:3050...');
  await page.goto('http://localhost:3050');
  console.log('Title:', await page.title());

  // Check nav links
  const links = await page.$$eval('.nav-links a', elements => elements.map(el => ({ text: el.innerText, href: el.href, hrefAttr: el.getAttribute('href') })));
  console.log('Nav links found:', JSON.stringify(links, null, 2));

  for (const item of links) {
    if (item.hrefAttr === 'index.html' || item.hrefAttr === '/') continue;
    console.log(`\nTesting click on link: "${item.text}" (href="${item.hrefAttr}")...`);
    
    // Find the link
    const linkLocator = page.locator(`.nav-links a:has-text("${item.text}")`).first();
    const isVisible = await linkLocator.isVisible();
    console.log(`Is visible on desktop: ${isVisible}`);

    await Promise.all([
      page.waitForNavigation({ timeout: 5000 }).catch(e => console.log('Navigation event timeout or didn\'t trigger: ' + e.message)),
      linkLocator.click()
    ]);

    console.log('Current URL after click:', page.url());
    console.log('Page Title after click:', await page.title());
    
    // Go back to home
    await page.goto('http://localhost:3050');
  }

  // Also test mobile drawer
  console.log('\nTesting mobile drawer at viewport 375x812:');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:3050');
  
  const hamburger = page.locator('#hamburger-toggle');
  console.log('Hamburger visible:', await hamburger.isVisible());
  await hamburger.click();
  
  const drawerOpen = await page.locator('#mobile-drawer').evaluate(el => el.classList.contains('open'));
  console.log('Drawer opened:', drawerOpen);

  const mobileLinks = await page.$$eval('.mobile-nav-list a', elements => elements.map(el => ({ text: el.innerText, hrefAttr: el.getAttribute('href') })));
  console.log('Mobile links:', mobileLinks);

  for (const item of mobileLinks) {
    if (item.hrefAttr === 'index.html') continue;
    console.log(`Testing mobile click on "${item.text}"...`);
    await page.goto('http://localhost:3050');
    await hamburger.click();
    await page.waitForTimeout(300);
    const mLink = page.locator(`.mobile-nav-list a:has-text("${item.text}")`).first();
    await Promise.all([
      page.waitForNavigation({ timeout: 5000 }).catch(e => console.log('Mobile nav timeout: ' + e.message)),
      mLink.click()
    ]);
    console.log('Mobile current URL:', page.url());
  }

  await browser.close();
  console.log('\nDone test.');
})();
