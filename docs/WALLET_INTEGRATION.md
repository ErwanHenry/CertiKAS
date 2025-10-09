# 🔗 Kaspa Wallet Integration Guide

CertiKAS supports multiple Kaspa wallets for content certification. This guide helps you connect your preferred wallet.

---

## 🌟 Supported Wallets

### 1. KasWare (Recommended)
**Type:** Browser Extension
**Platform:** Chrome, Edge, Firefox
**Features:** Full KRC-20 support, message signing, transaction management

**Install:**
- Chrome: [KasWare on Chrome Web Store](https://chromewebstore.google.com/detail/kasware-wallet/hklhheigdmpoolooomdihmhlpjjdbklf)
- Firefox: Search "KasWare" in Firefox Add-ons
- GitHub: [kasware-wallet/extension](https://github.com/kasware-wallet/extension)

**Why KasWare?**
- ✅ Open-source (100% auditable)
- ✅ Native Kaspa WASM integration
- ✅ KRC-20 token support (for Igra rewards)
- ✅ Message signing for certification
- ✅ Active development and community

---

### 2. Kaspa Web Wallet
**Type:** Web-based
**Platform:** Any browser (no extension needed)
**URL:** https://wallet.kaspanet.io

**Features:**
- ✅ No installation required
- ✅ Works on all platforms (desktop, mobile)
- ✅ Official Kaspa wallet
- ⚠️ Requires browser redirect for authentication

**Use Case:** Best for quick access without installing extensions

---

### 3. Chainge Wallet
**Type:** Multi-chain wallet via KasWare API
**Platform:** Mobile & Desktop

**Features:**
- ✅ Cross-chain DEX integration
- ✅ Self-custodial security
- ✅ Kaspa integration via KasWare API
- ✅ Swap KRC-20 tokens directly

**Note:** Chainge uses KasWare API for Kaspa integration

---

## 🚀 Quick Start

### Step 1: Install a Wallet

**Option A: KasWare (Recommended)**
1. Go to Chrome Web Store
2. Search "KasWare Wallet"
3. Click "Add to Chrome"
4. Create new wallet or import existing seed phrase
5. Save your seed phrase securely ⚠️

**Option B: Kaspa Web Wallet**
1. Visit https://wallet.kaspanet.io
2. Create new wallet or restore from seed
3. No installation needed!

---

### Step 2: Connect to CertiKAS

1. Visit CertiKAS (https://certikas.org or your Railway URL)
2. Click **"Connect Wallet"** button in the top-right
3. Select your preferred wallet:
   - **KasWare** for browser extension
   - **Kaspa Web Wallet** for browser-based
   - **Chainge** if you have KasWare installed
4. Approve the connection request
5. Your wallet address appears in the navbar 🎉

---

## 🛠️ Developer Integration

### JavaScript API

CertiKAS provides a simple API for wallet integration:

#### Connect Wallet
```javascript
// Auto-detect and connect
await window.connectKaspaWallet();

// Connect specific wallet
await window.connectKaspaWallet('kasware'); // KasWare
await window.connectKaspaWallet('webwallet'); // Web wallet
```

#### Get Address
```javascript
const address = await window.getKaspaAddress();
console.log('Connected:', address);
```

#### Sign Message
```javascript
const signature = await window.signKaspaMessage('Content hash to certify');
console.log('Signature:', signature);
```

#### Disconnect
```javascript
window.disconnectKaspaWallet();
```

---

### Advanced API

Access the full wallet integration object:

```javascript
const wallet = window.KaspaWallet;

// Check connection status
if (wallet.isConnected()) {
  console.log('Wallet connected');
}

// Get wallet info
const info = wallet.getWalletInfo();
console.log('Wallet type:', info.walletType);
console.log('Address:', info.address);

// Get balance
const balance = await wallet.getBalance();
console.log('Balance:', balance.total, 'sompi');

// Send KAS
await wallet.sendKaspa('kaspa:qr...', 1000000); // 0.01 KAS

// Sign KRC-20 transaction (for Igra rewards)
const transferJson = '{"p":"KRC-20","op":"transfer","tick":"IGRA","amt":"1000"}';
await wallet.signKRC20Transaction(transferJson, 4, toAddress);
```

---

### Event Listeners

Listen to wallet events:

```javascript
// Connection event
window.KaspaWallet.on('connect', (data) => {
  console.log('Connected:', data.address, data.network);
});

// Disconnection event
window.KaspaWallet.on('disconnect', () => {
  console.log('Wallet disconnected');
});

// Account change event
window.KaspaWallet.on('accountChange', (newAddress) => {
  console.log('Account changed to:', newAddress);
});

// Error event
window.KaspaWallet.on('error', (error) => {
  console.error('Wallet error:', error);
});
```

---

## 🔒 Security Best Practices

### For Users

1. **Never share your seed phrase** 🚨
2. **Verify the domain** before connecting (should be certikas.org or your Railway URL)
3. **Review transaction details** before signing
4. **Use hardware wallets** for large amounts
5. **Keep browser extensions updated**

### For Developers

1. **Always verify signatures** server-side
2. **Never request private keys** (CertiKAS never does this)
3. **Use HTTPS only** for wallet interactions
4. **Implement CSP headers** to prevent XSS
5. **Validate all user inputs** before signing

---

## 🐛 Troubleshooting

### "KasWare is not installed"

**Solution:**
1. Install KasWare from Chrome Web Store
2. Refresh the CertiKAS page
3. Click "Connect Wallet" again

---

### "Connection failed"

**Possible causes:**
- KasWare is locked (unlock your wallet)
- Wrong network selected (switch to mainnet)
- Browser blocked the extension
- Page not loaded over HTTPS

**Solution:**
1. Unlock KasWare wallet
2. Go to KasWare settings → Network → Select "Mainnet"
3. Refresh CertiKAS page
4. Try connecting again

---

### "Wallet already connected to another site"

**Solution:**
1. Open KasWare extension
2. Click "Connected Sites"
3. Disconnect from other sites if needed
4. Return to CertiKAS and connect

---

### "Transaction failed"

**Possible causes:**
- Insufficient balance
- Network congestion
- Gas fees too low

**Solution:**
1. Check balance in KasWare
2. Ensure you have enough KAS for fees (~0.0001 KAS)
3. Try again in a few minutes

---

## 🌐 Network Configuration

CertiKAS supports:
- ✅ **Mainnet** (default, recommended for production)
- ⚠️ **Testnet** (for development and testing)

Switch networks in KasWare:
1. Open KasWare extension
2. Click network dropdown (top-right)
3. Select "Mainnet" or "Testnet"
4. Reconnect wallet to CertiKAS

---

## 📱 Mobile Support

### KasWare Mobile (Coming Soon)
- iOS and Android apps in development
- Same API as browser extension

### Current Workaround:
Use **Kaspa Web Wallet** (https://wallet.kaspanet.io) in mobile browser

---

## 🆕 Coming Soon

- **Hardware wallet support** (Ledger, Trezor)
- **WalletConnect integration** for mobile apps
- **Multi-sig wallets** for organizations
- **Biometric authentication** (Face ID, Touch ID)

---

## 📚 Additional Resources

**KasWare Documentation:**
- https://docs.kasware.xyz
- GitHub: https://github.com/kasware-wallet/extension

**Kaspa Wallet API:**
- https://kaspa.aspectron.org/wallets/wallet-api

**Kasplex (KRC-20):**
- https://kasplex.org
- Igra token integration guide (coming soon)

---

## 💡 Pro Tips

1. **Create a separate wallet** for CertiKAS certifications (better security)
2. **Enable notifications** in KasWare to never miss certification requests
3. **Backup your seed phrase** in multiple secure locations
4. **Test on testnet first** if you're certifying high-value content
5. **Use browser profiles** to manage multiple Kaspa accounts

---

## 🤝 Need Help?

- **Discord:** https://discord.gg/certikas
- **GitHub Issues:** https://github.com/ErwanHenry/CertiKAS/issues
- **Twitter:** @CertiKAS
- **Email:** support@certikas.org

---

**Last Updated:** October 9, 2025
**CertiKAS Version:** 1.0.0
