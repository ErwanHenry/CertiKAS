/**
 * CertiKAS Wallet Integration Module
 * Supports: KasWare, Kastle
 */

class KaspaWalletIntegration {
  constructor() {
    this.currentWallet = null;
    this.currentAddress = null;
    this.walletType = null;
    this.listeners = {
      connect: [],
      disconnect: [],
      accountChange: [],
      error: []
    };

    this.init();
  }

  /**
   * Initialize wallet detection
   */
  async init() {
    // Detect installed wallets
    this.detectWallets();

    // Setup event listeners for account changes
    if (window.kasware) {
      this.setupKasWareListeners();
    }

    if (window.kastle) {
      this.setupKastleListeners();
    }
  }

  /**
   * Detect available Kaspa wallets
   */
  detectWallets() {
    const wallets = {
      kasware: typeof window.kasware !== 'undefined',
      kastle: typeof window.kastle !== 'undefined'
    };

    console.log('🔍 Detected Kaspa wallets:', wallets);
    return wallets;
  }

  /**
   * Setup KasWare wallet event listeners
   */
  setupKasWareListeners() {
    // Listen for account changes
    window.kasware.on('accountsChanged', (accounts) => {
      console.log('📍 Account changed:', accounts);
      if (accounts.length > 0) {
        this.currentAddress = accounts[0];
        this.emit('accountChange', accounts[0]);
      } else {
        this.disconnect();
      }
    });

    // Listen for network changes
    window.kasware.on('networkChanged', (network) => {
      console.log('🌐 Network changed:', network);
      this.emit('networkChange', network);
    });
  }

  /**
   * Setup Kastle wallet event listeners
   */
  setupKastleListeners() {
    // Listen for account changes
    window.kastle.on('accountsChanged', (accounts) => {
      console.log('📍 Kastle account changed:', accounts);
      if (accounts && accounts.length > 0) {
        this.currentAddress = accounts[0];
        this.emit('accountChange', accounts[0]);
      } else {
        this.disconnect();
      }
    });

    // Listen for network changes
    if (window.kastle.on) {
      window.kastle.on('networkChanged', (network) => {
        console.log('🌐 Kastle network changed:', network);
        this.emit('networkChange', network);
      });
    }
  }

  /**
   * Connect to KasWare wallet
   */
  async connectKasWare() {
    try {
      if (typeof window.kasware === 'undefined') {
        throw new Error('KasWare wallet is not installed. Please install from Chrome Web Store.');
      }

      console.log('🔗 Connecting to KasWare wallet...');
      const accounts = await window.kasware.requestAccounts();

      if (accounts && accounts.length > 0) {
        this.currentAddress = accounts[0];
        this.currentWallet = window.kasware;
        this.walletType = 'kasware';

        // Get network info
        const network = await window.kasware.getNetwork();

        console.log('✅ Connected to KasWare:', {
          address: this.currentAddress,
          network: network
        });

        this.emit('connect', {
          address: this.currentAddress,
          walletType: 'kasware',
          network: network
        });

        return {
          success: true,
          address: this.currentAddress,
          network: network
        };
      }
    } catch (error) {
      console.error('❌ KasWare connection failed:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Connect to Kastle wallet
   */
  async connectKastle() {
    try {
      if (typeof window.kastle === 'undefined') {
        throw new Error('Kastle wallet is not installed. Please install from Chrome Web Store.');
      }

      console.log('🔗 Connecting to Kastle wallet...');
      const accounts = await window.kastle.requestAccounts();

      if (accounts && accounts.length > 0) {
        this.currentAddress = accounts[0];
        this.currentWallet = window.kastle;
        this.walletType = 'kastle';

        // Get network info (if available)
        let network = 'mainnet';
        try {
          network = await window.kastle.getNetwork();
        } catch (e) {
          console.log('Network info not available for Kastle');
        }

        console.log('✅ Connected to Kastle:', {
          address: this.currentAddress,
          network: network
        });

        this.emit('connect', {
          address: this.currentAddress,
          walletType: 'kastle',
          network: network
        });

        return {
          success: true,
          address: this.currentAddress,
          network: network
        };
      }
    } catch (error) {
      console.error('❌ Kastle connection failed:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Generic connect method - tries to detect best wallet
   */
  async connect(preferredWallet = 'auto') {
    try {
      if (preferredWallet === 'kasware' || (preferredWallet === 'auto' && window.kasware)) {
        return await this.connectKasWare();
      } else if (preferredWallet === 'kastle' || (preferredWallet === 'auto' && window.kastle)) {
        return await this.connectKastle();
      } else {
        throw new Error('No Kaspa wallet detected. Please install KasWare or Kastle wallet.');
      }
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect() {
    console.log('🔌 Disconnecting wallet...');
    this.currentAddress = null;
    this.currentWallet = null;
    this.walletType = null;
    this.emit('disconnect');
  }

  /**
   * Get current account address
   */
  async getAddress() {
    if (this.currentAddress) {
      return this.currentAddress;
    }

    if (this.walletType === 'kasware' && window.kasware) {
      try {
        const accounts = await window.kasware.getAccounts();
        if (accounts && accounts.length > 0) {
          this.currentAddress = accounts[0];
          return this.currentAddress;
        }
      } catch (error) {
        console.error('Error getting address:', error);
      }
    }

    return null;
  }

  /**
   * Get wallet balance
   */
  async getBalance() {
    if (!this.currentAddress) {
      throw new Error('No wallet connected');
    }

    if (this.walletType === 'kasware') {
      try {
        const balance = await window.kasware.getBalance();
        return {
          confirmed: balance.confirmed || 0,
          unconfirmed: balance.unconfirmed || 0,
          total: balance.total || balance.confirmed || 0
        };
      } catch (error) {
        console.error('Error getting balance:', error);
        throw error;
      }
    }

    return null;
  }

  /**
   * Get network information
   */
  async getNetwork() {
    if (this.walletType === 'kasware' && window.kasware) {
      try {
        return await window.kasware.getNetwork();
      } catch (error) {
        console.error('Error getting network:', error);
        return 'mainnet';
      }
    }
    return 'mainnet';
  }

  /**
   * Sign a message (for content certification)
   */
  async signMessage(message) {
    if (!this.currentAddress) {
      throw new Error('No wallet connected. Please connect your wallet first.');
    }

    if (this.walletType === 'kasware') {
      try {
        console.log('✍️ Signing message with KasWare...');
        const signature = await window.kasware.signMessage(message);

        return {
          signature: signature,
          address: this.currentAddress,
          message: message,
          timestamp: Date.now()
        };
      } catch (error) {
        console.error('❌ Message signing failed:', error);
        throw error;
      }
    }

    if (this.walletType === 'kastle') {
      try {
        console.log('✍️ Signing message with Kastle...');
        const signature = await window.kastle.signMessage(message);

        return {
          signature: signature,
          address: this.currentAddress,
          message: message,
          timestamp: Date.now()
        };
      } catch (error) {
        console.error('❌ Kastle message signing failed:', error);
        throw error;
      }
    }

    throw new Error(`Signing not supported for wallet type: ${this.walletType}`);
  }

  /**
   * Send KAS transaction
   */
  async sendKaspa(toAddress, amount) {
    if (!this.currentAddress) {
      throw new Error('No wallet connected');
    }

    if (this.walletType === 'kasware') {
      try {
        console.log(`💸 Sending ${amount} sompi to ${toAddress}...`);
        const txid = await window.kasware.sendKaspa(toAddress, amount);

        return {
          txid: txid,
          from: this.currentAddress,
          to: toAddress,
          amount: amount,
          timestamp: Date.now()
        };
      } catch (error) {
        console.error('❌ Transaction failed:', error);
        throw error;
      }
    }

    throw new Error(`Transactions not supported for wallet type: ${this.walletType}`);
  }

  /**
   * Sign KRC-20 token transaction (for Igra rewards)
   */
  async signKRC20Transaction(transferJson, type, destAddr) {
    if (!this.currentAddress) {
      throw new Error('No wallet connected');
    }

    if (this.walletType === 'kasware') {
      try {
        console.log('🪙 Signing KRC-20 transaction...');
        const txid = await window.kasware.signKRC20Transaction(
          transferJson,
          type,
          destAddr
        );

        return {
          txid: txid,
          from: this.currentAddress,
          timestamp: Date.now()
        };
      } catch (error) {
        console.error('❌ KRC-20 transaction failed:', error);
        throw error;
      }
    }

    throw new Error(`KRC-20 not supported for wallet type: ${this.walletType}`);
  }

  /**
   * Event listener registration
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Emit event to all listeners
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Check if wallet is connected
   */
  isConnected() {
    return this.currentAddress !== null;
  }

  /**
   * Get wallet info
   */
  getWalletInfo() {
    return {
      connected: this.isConnected(),
      address: this.currentAddress,
      walletType: this.walletType,
      availableWallets: this.detectWallets()
    };
  }
}

// Export as global singleton
window.KaspaWallet = new KaspaWalletIntegration();

// Helper functions for easy access
window.connectKaspaWallet = async (type = 'auto') => {
  return await window.KaspaWallet.connect(type);
};

window.disconnectKaspaWallet = () => {
  window.KaspaWallet.disconnect();
};

window.getKaspaAddress = async () => {
  return await window.KaspaWallet.getAddress();
};

window.signKaspaMessage = async (message) => {
  return await window.KaspaWallet.signMessage(message);
};

console.log('🛡️ CertiKAS Wallet Integration loaded');
