// DS Polyclinic — Automated Quality & A11y Audit Suite
// Inspired by pbakaus/impeccable, vercel-labs/agent-skills, and microsoft/playwright

const http = require('http');

const BASE_URL = 'http://localhost:3050';

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function runAudit() {
  console.log('======================================================');
  console.log('  DS Polyclinic — Comprehensive Design & Code Quality Audit');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  const routes = ['/', '/treatments', '/about', '/book', '/contact'];

  console.log('1. Route Availability & HTTP 200 Tests');
  for (const route of routes) {
    const res = await fetchPage(route);
    assert(res.status === 200, `Route ${route} returns 200 OK`);
  }

  console.log('\n2. Accessibility & Semantic Landmarks Audit (impeccable + agent-skills)');
  for (const route of routes) {
    const res = await fetchPage(route);
    const html = res.body;

    assert(html.includes('class="skip-link"'), `${route} has accessible skip link`);
    assert(html.includes('role="banner"'), `${route} has <header role="banner"> landmark`);
    assert(html.includes('id="main-content"'), `${route} has <main id="main-content"> landmark`);
    assert(html.includes('role="contentinfo"'), `${route} has <footer role="contentinfo"> landmark`);
    assert(html.includes('aria-label='), `${route} has ARIA labels on key elements`);
  }

  console.log('\n3. Design System & CSS Token Verification (awesome-design-md + taste-skill)');
  const cssRes = await fetchPage('/css/styles.css');
  assert(cssRes.status === 200, 'Shared CSS stylesheet loads successfully');
  const css = cssRes.body;
  assert(css.includes('--green: #447e2d;'), 'Primary clinical green palette token configured');
  assert(css.includes('--black: #1d1d1f;'), 'Apple off-black tone token configured');
  assert(css.includes(':focus-visible'), 'Visible focus ring indicator rule present');
  assert(css.includes('text-wrap: balance'), 'Typography balance rule for headings present');
  assert(css.includes('prefers-reduced-motion'), 'prefers-reduced-motion accessibility query configured');

  console.log('\n4. Real Human Photography Check (Zero Stock Cartoon Placeholders)');
  for (const route of routes) {
    const res = await fetchPage(route);
    const hasPexels = res.body.includes('images.pexels.com');
    assert(hasPexels, `${route} features real human clinical photography`);
  }

  console.log('\n5. API Endpoints Functional Test');
  const leadRes = await new Promise((resolve) => {
    const req = http.request(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.write(JSON.stringify({
      name: 'Audit Bot',
      phone: '+919999999999',
      painArea: 'Lower Back',
      source: 'Automated Test'
    }));
    req.end();
  });
  assert(leadRes.status === 201 && leadRes.body.success, 'Lead capture API returns 201 Success');

  console.log('\n======================================================');
  console.log(`  Audit Summary: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

runAudit().catch(err => {
  console.error('Audit crashed:', err);
  process.exit(1);
});
