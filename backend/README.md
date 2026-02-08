# Price Drop Notifier Backend

Express backend API for the Price Drop Notifier widget.

## Features

- ✅ **POST /subscribe-price-drop**: Accept JSON or form-encoded data with realistic random delays
- ✅ **Status Codes**: 200 (success), 400 (invalid email), 409 (already subscribed), 5xx (server error)
- ✅ **Widget Bundle**: Served at `/assets/price-drop-widget.min.js` with caching and compression
- ✅ **Embed Page**: iframe at `/embed/price-drop.html` with query params support
- ✅ **Request Logging**: Method, path, status, and latency tracking
- ✅ **Compression**: Gzip/Brotli support via compression middleware

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
```

Server runs on `http://localhost:3000`

## API Endpoints

### POST /subscribe-price-drop

Subscribe to price drop alerts for a product.

**Request (JSON):**
```json
{
  "email": "user@example.com",
  "product":{
    "name": "iPhone 15",
    "price": "$999",
    "url": "https://example.com/iphone"
  }
}
```

**Request (Form-encoded):**
```
email=user@example.com&productName=iPhone%2015&productPrice=$999&productUrl=https://example.com/iphone
```

**Responses:**
- `200`: `{ "ok": true }` - Success
- `400`: `{ "ok": false, "error": "invalid_email" }` - Invalid email
- `409`: `{ "ok": false, "error": "already_subscribed" }` - Already subscribed
- `503`: `{ "ok": false, "error": "server_error" }` - Simulated server error

### GET /assets/price-drop-widget.min.js

Get the widget JavaScript bundle with caching headers.

### GET /embed/price-drop.html

Embed page with query parameters:
- `name`: Product name
- `price`: Product price
- `url`: Product URL

**Example:**
```
http://localhost:3000/embed/price-drop.html?name=iPhone%2015&price=$999&url=https://example.com/iphone
```

## Testing

Test the API endpoint:

```bash
# Success case
curl -X POST http://localhost:3000/subscribe-price-drop \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com",
  "product":{"name":"Test Product","price":"$99","url":"https://example.com"}}'

# Invalid email
curl -X POST http://localhost:3000/subscribe-price-drop \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","productName":"Test Product"}'

# Already subscribed (try same email twice)
curl -X POST http://localhost:3000/subscribe-price-drop \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","productName":"Test Product"}'
```

Test the embed page:
```
http://localhost:3000/embed/price-drop.html?name=iPhone%2015&price=$999&url=https://example.com
```

## License

MIT
