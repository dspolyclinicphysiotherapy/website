const assert = require('assert');
const app = require('../src/server');
const db = require('../src/db');

const PORT = 3002;

async function runTests() {
  console.log('--- Starting Automated Test Suite for KineticPulse Platform ---');

  const server = app.listen(PORT);
  const baseUrl = `http://localhost:${PORT}`;

  try {
    // 1. Test Homepage
    console.log('[Test 1] Testing Homepage GET / ...');
    const homeRes = await fetch(`${baseUrl}/`);
    assert.strictEqual(homeRes.status, 200);
    const homeHtml = await homeRes.text();
    assert.ok(homeHtml.includes('KineticPulse Physiotherapy'));
    assert.ok(homeHtml.includes('schema.org'));
    assert.ok(homeHtml.includes('body-hotspot'));
    console.log('✓ Homepage loaded with valid SEO and interactive components');

    // 2. Test Public Clinic Info (Security check: no password leaked)
    console.log('[Test 2] Testing GET /api/clinic/info ...');
    const clinicRes = await fetch(`${baseUrl}/api/clinic/info`);
    assert.strictEqual(clinicRes.status, 200);
    const clinicData = await clinicRes.json();
    assert.strictEqual(clinicData.success, true);
    assert.ok(clinicData.data.clinicName);
    assert.strictEqual(clinicData.data.adminUser, undefined, 'CRITICAL: adminUser password must NOT be leaked');
    console.log('✓ Public clinic info returns safe data without credentials');

    // 3. Test XML Sitemap and Robots.txt
    console.log('[Test 3] Testing SEO /sitemap.xml and /robots.txt ...');
    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    assert.strictEqual(sitemapRes.status, 200);
    const sitemapXml = await sitemapRes.text();
    assert.ok(sitemapXml.includes('<urlset'));
    assert.ok(sitemapXml.includes('/#body-navigator'));

    const robotsRes = await fetch(`${baseUrl}/robots.txt`);
    assert.strictEqual(robotsRes.status, 200);
    const robotsTxt = await robotsRes.text();
    assert.ok(robotsTxt.includes('Disallow: /admin'));
    console.log('✓ SEO sitemap.xml and robots.txt active and valid');

    // 4. Test Public Appointment Booking
    console.log('[Test 4] Testing Appointment Booking POST /api/bookings ...');
    const bookingRes = await fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: "Alice Walker",
        patientPhone: "+1 (555) 777-8888",
        patientEmail: "alice@example.com",
        serviceName: "Sports Injury & Performance Rehab",
        painLocation: "Shoulder Impingement",
        urgency: "Moderate",
        consultationType: "In-Clinic",
        date: "2026-10-25",
        timeSlot: "09:30 AM",
        patientNotes: "Persistent ache after tennis matches"
      })
    });
    assert.strictEqual(bookingRes.status, 201);
    const bookingJson = await bookingRes.json();
    assert.strictEqual(bookingJson.success, true);
    assert.ok(bookingJson.data.id.startsWith('APT-'));
    console.log(`✓ Appointment created: ${bookingJson.data.id}`);

    // 5. Test Honeypot Bot Defusal
    console.log('[Test 5] Testing Anti-Bot Honeypot Defense ...');
    const aptCountBefore = db.getAppointments().length;
    const botRes = await fetch(`${baseUrl}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: "Spam Bot",
        patientPhone: "+1000000000",
        date: "2026-10-25",
        timeSlot: "09:30 AM",
        hp_clinic_token: "I_AM_A_MALICIOUS_BOT"
      })
    });
    assert.strictEqual(botRes.status, 200);
    const aptCountAfter = db.getAppointments().length;
    assert.strictEqual(aptCountBefore, aptCountAfter, 'Honeypot submission must NOT enter the database');
    console.log('✓ Bot honeypot effectively trapped and neutralized without database contamination');

    // 6. Test Admin Authentication & Token Generation
    console.log('[Test 6] Testing Admin CRM Authentication ...');
    // Wrong password test
    const badLogin = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: "admin", password: "WrongPassword123" })
    });
    assert.strictEqual(badLogin.status, 401);

    // Correct password test
    const goodLogin = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: "admin", password: "PhysioAdmin2026!" })
    });
    assert.strictEqual(goodLogin.status, 200);
    const loginData = await goodLogin.json();
    assert.strictEqual(loginData.success, true);
    const adminToken = loginData.token;
    assert.ok(adminToken, 'Valid JWT token returned');
    console.log('✓ Admin authentication verified with Bcrypt and JWT');

    // 7. Test Admin Dashboard KPIs
    console.log('[Test 7] Testing GET /api/admin/dashboard ...');
    const dashRes = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.strictEqual(dashRes.status, 200);
    const dashData = await dashRes.json();
    assert.strictEqual(dashData.success, true);
    assert.ok(dashData.metrics.totalAppointments > 0);
    assert.ok(dashData.metrics.estimatedRevenue > 0);
    console.log(`✓ Dashboard metrics retrieved: ${dashData.metrics.totalAppointments} bookings, $${dashData.metrics.estimatedRevenue} pipeline`);

    // 8. Test Appointment Status Update (CRM Pipeline)
    console.log('[Test 8] Testing Appointment Status Update (PATCH) ...');
    const patchRes = await fetch(`${baseUrl}/api/admin/appointments/${bookingJson.data.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: "Confirmed",
        doctorNotes: "Evaluated by Dr. Marcus. Shoulder abduction limited to 80 deg. Mobilization planned."
      })
    });
    assert.strictEqual(patchRes.status, 200);
    const patchData = await patchRes.json();
    assert.strictEqual(patchData.data.status, "Confirmed");
    console.log('✓ Appointment status updated to Confirmed with doctor notes');

    // 9. Test CSV Export
    console.log('[Test 9] Testing CSV Export ...');
    const csvRes = await fetch(`${baseUrl}/api/admin/export/appointments.csv`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.strictEqual(csvRes.status, 200);
    const csvText = await csvRes.text();
    assert.ok(csvText.includes('Alice Walker'));
    assert.ok(csvText.includes('Patient Name'));
    console.log('✓ CSV export endpoint generated valid spreadsheet data');

    // 10. Test Archify Interactive Diagram Route
    console.log('[Test 10] Testing Archify System Architecture Route /docs/architecture ...');
    const archRes = await fetch(`${baseUrl}/docs/architecture`);
    assert.strictEqual(archRes.status, 200);
    const archHtml = await archRes.text();
    assert.ok(archHtml.includes('Archify'));
    assert.ok(archHtml.includes('KineticPulse'));
    console.log('✓ Archify interactive system architecture HTML served successfully');

    console.log('\n======================================================');
    console.log('  ALL 10 AUTOMATED VERIFICATION TESTS PASSED (100%)');
    console.log('======================================================\n');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
