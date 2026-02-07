const express = require('express');
const cors = require('cors');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health check (مهم جدًا)
app.get('/', (req, res) => {
  res.status(200).send('Price Drop Notifier backend is running');
});

// API
app.post('/subscribe-price-drop', (req, res) => {
  const { email, product } = req.body || {};

  if (!email) {
    return res.status(400).json({ ok: false, error: 'invalid_email' });
  }

  return res.json({ ok: true });
});

// 🚨 CRITICAL PART
const PORT = Number(process.env.PORT);

if (!PORT) {
  console.error('❌ PORT is not defined');
  process.exit(1);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
