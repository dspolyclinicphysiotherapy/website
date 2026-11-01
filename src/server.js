const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./db');
const { configureHelmet } = require('./security');
const apiRoutes = require('./routes/api');
const adminApiRoutes = require('./routes/adminApi');

const app = express();
const PORT = process.env.PORT || 3050;

// Security Middleware: Helmet CSP, HSTS, X-Frame-Options
app.use(configureHelmet());

// CORS configuration (allow same-origin and safe local origins)
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsers with bounded payload limits (prevent memory buffer overflow)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Static file hosting with caching
app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0
}));

// Dynamic XML Sitemap for Google Search Console / SEO
app.get('/sitemap.xml', (req, res) => {
  const host = req.get('host');
  const protocol = req.protocol;
  const baseUrl = `${protocol}://${host}`;
  const now = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/#services</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#body-navigator</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#quiz</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#team</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/#faq</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Dynamic robots.txt
app.get('/robots.txt', (req, res) => {
  const host = req.get('host');
  const protocol = req.protocol;
  const content = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin/

Sitemap: ${protocol}://${host}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(content);
});

// API Routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminApiRoutes);

// Dedicated Page Routes
app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get(['/treatments', '/treatments.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'treatments.html'));
});

app.get(['/about', '/about.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'about.html'));
});

app.get(['/contact', '/contact.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'contact.html'));
});

app.get(['/book', '/book.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'book.html'));
});

// Admin Web Route (Serves admin.html for /admin and any subpath)
app.use('/admin', (req, res, next) => {
  if (req.method === 'GET') {
    return res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
  }
  next();
});

// Architecture Documentation Route (Archify interactive diagram)
app.get('/docs/architecture', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'docs', 'archify-system-architecture.html'));
});

// Fallback to index.html for unrecognized routes
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }
  next();
});

// Safe global error handler (never expose stack traces)
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  res.status(500).json({
    success: false,
    error: "An internal server error occurred. Our team has been notified."
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  DS Polyclinic — Dr. Devansh Sharma`);
    console.log(`  Consultant Physiotherapy & CRM Platform Live`);
    console.log(`======================================================`);
    console.log(`  Patient Portal:  http://localhost:${PORT}`);
    console.log(`  Admin CRM Panel: http://localhost:${PORT}/admin`);
    console.log(`  Archify Diagram: http://localhost:${PORT}/docs/architecture`);
    console.log(`  Sitemap (SEO):   http://localhost:${PORT}/sitemap.xml`);
    console.log(`  Admin Demo User: admin / PhysioAdmin2026!`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
