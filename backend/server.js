const express = require('express');
const compression = require('compression');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Store subscriptions with full data (in-memory for demo)
const subscriptions = [];
const subscribedEmails = new Set();

// Middleware: Logging
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const latency = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${latency}ms)`);
  });
  
  next();
});
app.get('/', (req, res) => {
  res.status(200).send('OK - Server is alive');
});

app.use(express.static(path.join(__dirname, 'dist')));
// Middleware: CORS
app.use(cors());

// Middleware: Compression (Gzip/Brotli)
app.use(compression());

// Middleware: Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper: Simulate random delay
const randomDelay = () => {
  const delay = Math.random() * (2800 - 800) + 800; // 0.8s - 2.8s
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Helper: Validate email
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper: Simulate random server error (10% chance)
const shouldSimulateServerError = () => Math.random() < 0.1;

// Health check endpoint for Railway
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Price Drop Notifier API',
    version: '2.0.0',
    endpoints: {
      widget: '/assets/price-drop-widget.min.js',
      demo: '/demo.html',
      api: '/subscribe-price-drop',
      subscriptions: '/subscriptions/view'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// POST /subscribe-price-drop
app.post('/subscribe-price-drop', async (req, res) => {
  await randomDelay();
  
  // Simulate random 5xx error
  if (shouldSimulateServerError()) {
    return res.status(503).json({
      ok: false,
      error: 'server_error'
    });
  }
  
  const { email, product } = req.body || {};
  
  // Log received data
  console.log('📧 Subscription request:', { email, product });
  
  // Validate email
  if (!isValidEmail(email)) {
    return res.status(400).json({
      ok: false,
      error: 'invalid_email'
    });
  }
  
  // Check if already subscribed
  if (subscribedEmails.has(email.toLowerCase())) {
    return res.status(409).json({
      ok: false,
      error: 'already_subscribed'
    });
  }
  
  // Add to subscribed list with full data
  const subscription = {
    email: email.toLowerCase(),
    product: {
      name: product?.name || 'Unknown',
      price: product?.price || 'N/A',
      url: product?.url || ''
    },
    subscribedAt: new Date().toISOString()
  };
  
  subscriptions.push(subscription);
  subscribedEmails.add(email.toLowerCase());
  
  console.log(`✅ New subscription: ${email} for "${product?.name}"`);
  console.log(`📊 Total subscriptions: ${subscriptions.length}`);
  
  // Success
  res.status(200).json({
    ok: true
  });
});

// GET /subscriptions - View all subscriptions
app.get('/subscriptions', (req, res) => {
  res.json({
    total: subscriptions.length,
    subscriptions: subscriptions
  });
});

// GET /subscriptions/view - HTML view of subscriptions
app.get('/subscriptions/view', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscriptions Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
    }
    .stats {
      background: #667eea;
      color: white;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .product-name {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .price {
      color: #667eea;
      font-weight: 600;
    }
    .email {
      color: #666;
    }
    .date {
      color: #999;
      font-size: 0.9em;
    }
    .empty {
      text-align: center;
      padding: 40px;
      color: #999;
    }
    a {
      color: #667eea;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Subscriptions Dashboard</h1>
    <div class="stats">
      <strong>Total Subscriptions:</strong> ${subscriptions.length}
    </div>
    ${subscriptions.length === 0 ? 
      '<div class="empty">No subscriptions yet. Try subscribing from the demo page!</div>' :
      `<table>
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>Product</th>
            <th>Price</th>
            <th>Subscribed At</th>
          </tr>
        </thead>
        <tbody>
          ${subscriptions.map((sub, index) => `
            <tr>
              <td>${index + 1}</td>
              <td class="email">${sub.email}</td>
              <td class="product-name" title="${sub.product.name}">
                ${sub.product.url ? 
                  `<a href="${sub.product.url}" target="_blank">${sub.product.name}</a>` :
                  sub.product.name
                }
              </td>
              <td class="price">${sub.product.price}</td>
              <td class="date">${new Date(sub.subscribedAt).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`
    }
  </div>
</body>
</html>`;
  
  res.set('Content-Type', 'text/html');
  res.send(html);
});

// Serve widget bundle with caching headers and CORS
app.get('/assets/price-drop-widget.min.js', (req, res) => {
  res.set({
    'Content-Type': 'application/javascript; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate', // Development mode
    'ETag': 'v2.0.0-rollup',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.sendFile(path.join(__dirname, 'public', 'assets', 'price-drop-widget.min.js'));
});

// Serve widget CSS with caching headers and CORS
app.get('/assets/widget.css', (req, res) => {
  res.set({
    'Content-Type': 'text/css; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate', // Development mode
    'ETag': 'v2.0.0-rollup',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.sendFile(path.join(__dirname, 'public', 'assets', 'widget.css'));
});

// Serve static files from public directory with proper headers
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript; charset=utf-8');
      res.set('Access-Control-Allow-Origin', '*');
    }
  }
}));

// Serve demo page with CSP
app.get('/demo', (req, res) => {
  res.set({
    'Content-Type': 'text/html',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none';"
  });
  res.sendFile(path.join(__dirname, 'public', 'demo.html'));
});

// Serve embed iframe page
app.get('/embed/price-drop.html', (req, res) => {
  const { name = '', price = '', url = '' } = req.query;
  
  res.set('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Price Drop Notifier</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      padding: 16px;
    }
  </style>
</head>
<body>
  <div id="price-drop-widget-root"></div>
  <script>
    window.PRICE_DROP_CONFIG = {
      product: {
        name: decodeURIComponent("${encodeURIComponent(name)}"),
        price: decodeURIComponent("${encodeURIComponent(price)}"),
        url: decodeURIComponent("${encodeURIComponent(url)}")
      },
      apiEndpoint: '/subscribe-price-drop',
      onSuccess: function() {
        // Notify parent window of successful subscription
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'pdw-subscription-success',
            product: window.PRICE_DROP_CONFIG.product
          }, '*');
        }
      }
    };
  </script>
  <script src="/assets/price-drop-widget.min.js"></script>
  <script>
    // Initialize widget when loaded
    if (typeof PriceDropWidget !== 'undefined') {
      const widget = new PriceDropWidget(window.PRICE_DROP_CONFIG);
      widget.init();
      
      // Override the success handler to call onSuccess callback
      const originalMarkAsSubscribed = widget.markAsSubscribed;
      widget.markAsSubscribed = function() {
        originalMarkAsSubscribed.call(widget);
        if (window.PRICE_DROP_CONFIG.onSuccess) {
          window.PRICE_DROP_CONFIG.onSuccess();
        }
      };
    }
  </script>
</body>
</html>`);
});

// Export for Vercel serverless
module.exports = app;

// Start server (always start in Railway/production)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Price Drop Notifier Backend running on port ${PORT}`);
  console.log(`📦 Widget: /assets/price-drop-widget.min.js`);
  console.log(`🖼️  Embed: /embed/price-drop.html`);
  console.log(`📊 Subscriptions: /subscriptions/view`);
  console.log(`\nServer is running. Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});



