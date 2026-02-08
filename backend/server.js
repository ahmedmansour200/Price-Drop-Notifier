const express = require('express');
const compression = require('compression');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage
const subscriptions = [];
const subscribedEmails = new Set();

/* ===================== MIDDLEWARE ===================== */
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} (${Date.now() - start}ms)`
    );
  });
  next();
});

/* ===================== ROUTES ===================== */

// ✅ ROOT (Railway health)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Price Drop Notifier',
    version: '2.0.0'
  });
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// Subscribe
app.post('/subscribe-price-drop', (req, res) => {
  const { email, product } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'invalid_email' });
  }

  if (subscribedEmails.has(email.toLowerCase())) {
    return res.status(409).json({ ok: false, error: 'already_subscribed' });
  }

  subscribedEmails.add(email.toLowerCase());
  subscriptions.push({
    email,
    product,
    subscribedAt: new Date().toISOString()
  });

  res.json({ ok: true });
});

// Subscriptions view
app.get('/subscriptions/view', (req, res) => {
  res.send(`<pre>${JSON.stringify(subscriptions, null, 2)}</pre>`);
});

// Static files
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use(express.static(path.join(__dirname, 'public')));

// Demo page ✅
app.get('/demo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'demo.html'));
});

// Embed iframe
app.get('/embed/price-drop.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'embed.html'));
});

/* ===================== START ===================== */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
