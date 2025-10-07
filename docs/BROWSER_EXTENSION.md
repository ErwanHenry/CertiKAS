# CertiKAS Browser Extension

> **Real-time content verification as you browse the web**

The CertiKAS browser extension automatically scans web pages and flags unverified content, helping you identify potential fake news and AI-generated misinformation.

---

## Features

### 🔍 Automatic Content Scanning
- Scans all images, videos, and articles on web pages
- Computes content hashes in real-time
- Checks CertiKAS database for existing certificates
- Non-intrusive background operation

### 🛡️ Visual Indicators
- **Green badge** ✅ - Content is certified and confirmed
- **Yellow badge** ⚠️ - Content is certified but pending confirmation
- **Red badge** ❌ - Content is not certified
- **Gray badge** ℹ️ - Unable to verify (content may be exempt)

### 📊 Statistics Dashboard
- View verification stats for current page
- Track certified vs. uncertified content ratio
- See historical trends for news websites
- Export verification reports

### ⚡ One-Click Actions
- Click any badge to view full certificate details
- Report suspicious content
- Share verified content on social media
- Certify your own content directly from the extension

---

## Installation

### Chrome / Edge
```bash
1. Download extension: https://chrome.google.com/webstore/detail/certikas
2. Click "Add to Chrome"
3. Pin extension to toolbar
4. Configure settings (optional)
```

### Firefox
```bash
1. Download extension: https://addons.mozilla.org/firefox/addon/certikas
2. Click "Add to Firefox"
3. Grant required permissions
4. Configure settings (optional)
```

### Manual Installation (Development)
```bash
1. Clone repository: git clone https://github.com/certikas/browser-extension
2. cd browser-extension
3. npm install
4. npm run build
5. Open chrome://extensions
6. Enable "Developer mode"
7. Click "Load unpacked"
8. Select dist/ folder
```

---

## How It Works

### Content Hash Generation
The extension computes SHA-256 hashes for:
- **Images**: Direct pixel data hashing
- **Videos**: First frame + metadata hashing
- **Articles**: Full text content hashing
- **PDFs**: Document content hashing

### Certificate Verification
1. Extension extracts content from page
2. Computes SHA-256 hash locally
3. Sends hash to CertiKAS API (no content uploaded)
4. Receives certificate status
5. Displays visual indicator

### Privacy-First Design
- **No content is uploaded** to servers
- Only SHA-256 hashes are transmitted
- No tracking or analytics
- No data collection
- Open-source code for transparency

---

## Configuration

### Settings Panel

Access via: Extension icon → Settings

**Display Options:**
- Badge position (top-right, bottom-right, overlay)
- Badge size (small, medium, large)
- Show/hide certificate details on hover
- Enable/disable sound notifications

**Scanning Options:**
- Auto-scan on page load (default: ON)
- Scan images (default: ON)
- Scan videos (default: ON)
- Scan articles (default: ON)
- Whitelist domains (always trust certain sites)
- Blacklist domains (never scan certain sites)

**API Configuration:**
- CertiKAS API endpoint (default: https://api.certikas.org)
- API key (optional, for higher rate limits)
- Cache duration (default: 24 hours)

---

## API Integration

### JavaScript API

The extension exposes a global API for websites:

```javascript
// Check if CertiKAS extension is installed
if (window.CertiKAS) {
  console.log('CertiKAS extension detected');

  // Certify current page content
  window.CertiKAS.certifyPage({
    walletAddress: 'kaspa:qr1234...',
    contentType: 'article',
    metadata: {
      title: document.title,
      url: window.location.href
    }
  }).then(certificate => {
    console.log('Page certified:', certificate);
  });

  // Verify specific element
  const img = document.querySelector('img');
  window.CertiKAS.verifyElement(img).then(result => {
    console.log('Image verification:', result);
  });

  // Listen for verification events
  window.CertiKAS.on('verified', (event) => {
    console.log('Content verified:', event.element, event.certificate);
  });
}
```

---

## Content Creator Integration

### Embed Verification Badge

Add CertiKAS badges directly to your website:

```html
<!-- Automatic badge for certified image -->
<img src="photo.jpg"
     data-certikas-hash="a1b2c3d4e5f6..."
     data-certikas-cert="cert_abc123def456">

<!-- Manual badge widget -->
<div class="certikas-badge"
     data-cert-id="cert_abc123def456"></div>

<!-- Load CertiKAS widget script -->
<script src="https://cdn.certikas.org/widget.js"></script>
```

### WordPress Plugin

```bash
1. Install CertiKAS WordPress plugin
2. Settings → CertiKAS → Connect wallet
3. All post images automatically certified on publish
4. Verification badges appear automatically
```

---

## Use Cases

### For Journalists
- Certify articles immediately after publication
- Prove original authorship with timestamps
- Build reputation through verified content
- Combat plagiarism and misattribution

### For News Consumers
- Instantly verify news article authenticity
- Check if images have been manipulated
- Avoid AI-generated fake news
- Trust verified sources

### For Content Creators
- Protect intellectual property
- Prove creation date for legal purposes
- Build audience trust through verification
- Monetize verified content

### For Researchers
- Certify academic papers
- Verify data sources
- Track content citations
- Ensure reproducibility

---

## Troubleshooting

### Badge Not Appearing
1. Check if extension is enabled
2. Refresh the page
3. Verify site is not in blacklist
4. Check browser console for errors

### Verification Failing
1. Check internet connection
2. Verify CertiKAS API status: https://status.certikas.org
3. Clear extension cache (Settings → Clear Cache)
4. Reinstall extension if issues persist

### High Memory Usage
1. Reduce scan frequency (Settings → Performance)
2. Disable video scanning on slow devices
3. Whitelist trusted sites to skip scanning
4. Update to latest extension version

---

## Security

### Permissions Required
- `activeTab` - Access current tab content
- `storage` - Cache verification results
- `https://api.certikas.org/*` - API communication

### Data Collection
- **Zero tracking**: No analytics or user data collection
- **Local caching**: Verification results cached locally
- **No content upload**: Only hashes transmitted
- **Open-source**: Full code audit available

### Threat Model
The extension protects against:
- ✅ AI-generated fake news
- ✅ Image manipulation detection
- ✅ Plagiarized content
- ✅ Deepfake videos
- ✅ Misinformation campaigns

---

## Development

### Build Extension

```bash
git clone https://github.com/certikas/browser-extension
cd browser-extension
npm install
npm run build
```

### Project Structure

```
browser-extension/
├── manifest.json         # Extension manifest
├── background.js         # Background service worker
├── content.js            # Content script (injected into pages)
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic
├── options.html          # Settings page
├── styles/               # CSS stylesheets
├── icons/                # Extension icons
└── lib/                  # Shared libraries
    ├── hash.js           # SHA-256 hashing
    ├── api.js            # CertiKAS API client
    └── badge.js          # Badge rendering
```

### Testing

```bash
npm run test              # Run unit tests
npm run lint              # ESLint code quality
npm run build:dev         # Development build
npm run watch             # Watch mode
```

---

## Roadmap

### Q4 2025
- [x] Chrome extension beta
- [x] Firefox extension beta
- [ ] Edge extension
- [ ] Safari extension

### Q1 2026
- [ ] Mobile browser support (Kiwi, Firefox Mobile)
- [ ] Bulk verification for pages with many images
- [ ] AI-generated content detection integration
- [ ] Deepfake video analysis

### Q2 2026
- [ ] Social media integration (Twitter, Facebook)
- [ ] Real-time collaboration features
- [ ] Browser-native certificate storage
- [ ] Offline verification mode

---

## Support

- **Documentation**: https://docs.certikas.org/extension
- **GitHub Issues**: https://github.com/certikas/browser-extension/issues
- **Discord**: https://discord.gg/certikas
- **Email**: extension@certikas.org

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

**Ways to contribute:**
- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit pull requests
- 📝 Improve documentation
- 🌍 Add translations

---

**Join the fight against fake news. Verify truth with CertiKAS.**

🛡️ **Install Extension** | 📖 **Read Docs** | 💬 **Join Discord**
