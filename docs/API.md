# CertiKAS API Documentation

Base URL: `https://api.certikas.org/v1` (Production)
Base URL: `http://localhost:3000/api/v1` (Development)

## Authentication

All API requests require an API key (coming soon for public beta).

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.certikas.org/v1/statistics
```

## Endpoints

### Certification

#### `POST /certify`

Create a new content certificate.

**Request (Multipart Form Data):**

```bash
curl -X POST https://api.certikas.org/v1/certify \
  -F "file=@document.pdf" \
  -F "content_type=document" \
  -F "creator_wallet_address=kaspa:qr1234..." \
  -F 'metadata={"title":"Important Document","description":"Official report"}'
```

**Parameters:**
- `file` (file, required): Content file to certify
- `content_type` (string, required): `article`, `video`, `image`, `document`, `audio`, `tweet`, `post`
- `creator_wallet_address` (string, required): Kaspa wallet address
- `metadata` (JSON string, optional): Additional metadata

**Response (201 Created):**

```json
{
  "success": true,
  "certificate": {
    "id": "cert_abc123def456",
    "content_hash": "a1b2c3...",
    "content_type": "document",
    "blockchain_tx_id": "kaspa:tx:xyz789...",
    "creator_wallet_address": "kaspa:qr1234...",
    "status": "pending",
    "blockchain_confirmations": 0,
    "created_at": "2025-10-07T10:30:00Z",
    "verification_url": "https://certikas.org/verify/cert_abc123def456"
  },
  "blockchain_explorer": "https://explorer.kaspa.org/txs/xyz789..."
}
```

---

#### `POST /certify/hash`

Certify by content hash only (no file upload).

**Request (JSON):**

```json
{
  "content_hash": "a1b2c3d4e5f6...",
  "content_type": "article",
  "creator_wallet_address": "kaspa:qr1234...",
  "metadata": {
    "title": "Article Title",
    "url": "https://example.com/article"
  }
}
```

**Response:** Same as `POST /certify`

---

#### `POST /bulk/certify`

Bulk certify multiple files.

**Request (Multipart Form Data):**

```bash
curl -X POST https://api.certikas.org/v1/bulk/certify \
  -F "files=@file1.pdf" \
  -F "files=@file2.pdf" \
  -F "creator_wallet_address=kaspa:qr1234..."
```

**Response (200 OK):**

```json
{
  "success": true,
  "total": 2,
  "successful": 2,
  "failed": 0,
  "results": {
    "successful": [
      {
        "certificateId": "cert_abc123",
        "contentHash": "a1b2c3...",
        "metadata": { "filename": "file1.pdf" }
      }
    ],
    "failed": []
  }
}
```

---

### Verification

#### `GET /verify/:certificate_id`

Get certificate details by ID.

**Request:**

```bash
curl https://api.certikas.org/v1/verify/cert_abc123def456
```

**Response (200 OK):**

```json
{
  "success": true,
  "certificate": {
    "id": "cert_abc123def456",
    "content_hash": "a1b2c3...",
    "content_type": "document",
    "blockchain_tx_id": "kaspa:tx:xyz789...",
    "creator_wallet_address": "kaspa:qr1234...",
    "status": "confirmed",
    "blockchain_confirmations": 12,
    "is_confirmed": true,
    "created_at": "2025-10-07T10:30:00Z",
    "confirmed_at": "2025-10-07T11:00:00Z",
    "verification_url": "https://certikas.org/verify/cert_abc123def456",
    "age_in_days": 1,
    "metadata": {
      "title": "Document Title",
      "description": "Description"
    }
  },
  "blockchain_explorer": "https://explorer.kaspa.org/txs/xyz789..."
}
```

---

#### `POST /verify/hash`

Check if content hash is certified.

**Request (JSON):**

```json
{
  "content_hash": "a1b2c3d4e5f6..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "exists": true,
  "certified": true,
  "certificateId": "cert_abc123def456",
  "certifiedAt": "2025-10-07T10:30:00Z",
  "isConfirmed": true
}
```

**Response (Not Certified):**

```json
{
  "success": true,
  "exists": false,
  "certified": false
}
```

---

#### `POST /verify/file`

Verify uploaded file.

**Request (Multipart Form Data):**

```bash
curl -X POST https://api.certikas.org/v1/verify/file \
  -F "file=@document.pdf"
```

**Response (200 OK):**

```json
{
  "success": true,
  "certified": true,
  "confirmed": true,
  "certificate": { ... },
  "blockchainExplorerUrl": "https://explorer.kaspa.org/txs/..."
}
```

---

### User Certificates

#### `GET /certificates/creator/:wallet_address`

Get certificates by creator wallet address.

**Request:**

```bash
curl "https://api.certikas.org/v1/certificates/creator/kaspa:qr1234...?limit=50&offset=0&status=confirmed"
```

**Query Parameters:**
- `limit` (integer, optional): Results per page (default: 50)
- `offset` (integer, optional): Pagination offset (default: 0)
- `status` (string, optional): Filter by status (`pending`, `confirmed`, `revoked`)

**Response (200 OK):**

```json
{
  "success": true,
  "count": 25,
  "certificates": [
    { ... },
    { ... }
  ]
}
```

---

### Search

#### `GET /search`

Search certificates by metadata.

**Request:**

```bash
curl "https://api.certikas.org/v1/search?q=article&limit=50&offset=0"
```

**Query Parameters:**
- `q` (string, required): Search query
- `limit` (integer, optional): Results per page
- `offset` (integer, optional): Pagination offset

**Response (200 OK):**

```json
{
  "success": true,
  "query": "article",
  "count": 10,
  "results": [
    { ... }
  ]
}
```

---

### Statistics

#### `GET /statistics`

Get platform statistics.

**Request:**

```bash
curl https://api.certikas.org/v1/statistics
```

**Response (200 OK):**

```json
{
  "success": true,
  "statistics": {
    "totalCertificates": 12534,
    "confirmedCertificates": 11892,
    "pendingCertificates": 642,
    "byContentType": {
      "article": 4567,
      "video": 3201,
      "image": 2876,
      "document": 1890
    },
    "certificationsToday": 342,
    "certificationsThisWeek": 1876,
    "certificationsThisMonth": 7654
  }
}
```

---

### Blockchain

#### `GET /blockchain/health`

Check Kaspa blockchain connection health.

**Request:**

```bash
curl https://api.certikas.org/v1/blockchain/health
```

**Response (200 OK):**

```json
{
  "success": true,
  "blockchain": {
    "connected": true,
    "network": "mainnet",
    "blockHeight": 1234567,
    "nodeVersion": "0.13.0"
  }
}
```

---

### Igra Token

#### `GET /igra/status`

Get Igra token bridge status.

**Request:**

```bash
curl https://api.certikas.org/v1/igra/status
```

**Response (200 OK):**

```json
{
  "success": true,
  "igra_token": {
    "name": "Igra Token",
    "symbol": "IGRA",
    "decimals": 8,
    "deployed": false,
    "status": "awaiting_launch",
    "contractAddress": null
  },
  "bridge_ready": false
}
```

---

#### `GET /igra/balance/:wallet_address`

Get Igra token balance for wallet.

**Request:**

```bash
curl https://api.certikas.org/v1/igra/balance/kaspa:qr1234...
```

**Response (200 OK):**

```json
{
  "success": true,
  "wallet_address": "kaspa:qr1234...",
  "balance": 1500,
  "token": "IGRA"
}
```

---

### Utilities

#### `GET /cost/estimate`

Estimate certification cost.

**Request:**

```bash
curl "https://api.certikas.org/v1/cost/estimate?content_type=video&content_size=52428800"
```

**Query Parameters:**
- `content_type` (string, optional): Content type
- `content_size` (integer, optional): File size in bytes

**Response (200 OK):**

```json
{
  "success": true,
  "cost": {
    "blockchainFee": 0.0005,
    "sizePremium": 0.0005,
    "totalCost": 0.001,
    "unit": "KAS"
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `400 Bad Request` - Invalid parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Blockchain connection issues

---

## Rate Limiting

API endpoints are rate-limited to:
- **100 requests per 15 minutes** per IP address

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696689600
```

---

## Webhooks (Coming Soon)

Configure webhooks to receive notifications for:
- `certificate.created` - New certificate created
- `certificate.confirmed` - Certificate confirmed on blockchain
- `certificate.revoked` - Certificate revoked

---

## SDKs

Official SDKs available:
- **JavaScript/TypeScript**: `npm install @certikas/sdk`
- **Python**: `pip install certikas`
- **Go**: `go get github.com/certikas/go-sdk`

---

## Support

- **Documentation**: https://docs.certikas.org
- **Discord**: https://discord.gg/certikas
- **Email**: api@certikas.org
