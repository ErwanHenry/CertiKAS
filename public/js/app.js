/**
 * CertiKAS Frontend Application
 */

const API_BASE_URL = window.location.origin + '/api/v1';

// State
let selectedFile = null;
let currentWalletAddress = null;

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  console.log('CertiKAS initializing...');

  await loadStatistics();
  setupEventListeners();
  setupWalletListeners();
  checkWalletConnection();
});

// Load statistics
async function loadStatistics() {
  try {
    const response = await fetch(`${API_BASE_URL}/statistics`);
    const data = await response.json();

    if (data.success) {
      const stats = data.statistics;
      document.getElementById('statTotalCerts').textContent = stats.totalCertificates.toLocaleString();
      document.getElementById('statConfirmed').textContent = stats.confirmedCertificates.toLocaleString();
      document.getElementById('statToday').textContent = stats.certificationsToday.toLocaleString();
    }

    // Get blockchain health for block height
    const healthResponse = await fetch(`${API_BASE_URL}/blockchain/health`);
    const healthData = await healthResponse.json();

    if (healthData.success) {
      document.getElementById('statBlockHeight').textContent =
        healthData.blockchain.blockHeight.toLocaleString();
    }
  } catch (error) {
    console.error('Failed to load statistics:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // File upload
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');

  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-purple-500');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-purple-500');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-purple-500');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  });

  // Certify form
  document.getElementById('certifyForm').addEventListener('submit', handleCertify);

  // Verify button
  document.getElementById('verifyBtn').addEventListener('click', handleVerify);

  // Connect wallet
  document.getElementById('connectWallet').addEventListener('click', connectWallet);
}

// Handle file selection
function handleFileSelect(file) {
  selectedFile = file;

  document.getElementById('dropZoneText').classList.add('hidden');
  document.getElementById('filePreview').classList.remove('hidden');
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = formatFileSize(file.size);

  // Auto-detect content type
  const contentType = document.getElementById('contentType');
  if (file.type.startsWith('image/')) {
    contentType.value = 'image';
  } else if (file.type.startsWith('video/')) {
    contentType.value = 'video';
  } else if (file.type === 'application/pdf') {
    contentType.value = 'document';
  } else if (file.type.startsWith('audio/')) {
    contentType.value = 'audio';
  }
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Handle certification
async function handleCertify(e) {
  e.preventDefault();

  if (!selectedFile) {
    showError('Please select a file to certify');
    return;
  }

  const walletAddress = document.getElementById('walletAddress').value.trim();
  if (!walletAddress) {
    showError('Please enter your Kaspa wallet address');
    return;
  }

  if (!walletAddress.startsWith('kaspa:')) {
    showError('Invalid Kaspa wallet address format');
    return;
  }

  // Show loading state
  const btn = document.getElementById('certifyBtn');
  const btnText = document.getElementById('certifyBtnText');
  const btnLoading = document.getElementById('certifyBtnLoading');

  btn.disabled = true;
  btnText.classList.add('hidden');
  btnLoading.classList.remove('hidden');

  // Hide previous messages
  document.getElementById('certifySuccess').classList.add('hidden');
  document.getElementById('certifyError').classList.add('hidden');

  try {
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('content_type', document.getElementById('contentType').value);
    formData.append('creator_wallet_address', walletAddress);

    const metadata = {
      title: document.getElementById('metaTitle').value,
      description: document.getElementById('metaDescription').value,
      filename: selectedFile.name,
      filesize: selectedFile.size,
      mimetype: selectedFile.type
    };
    formData.append('metadata', JSON.stringify(metadata));

    const response = await fetch(`${API_BASE_URL}/certify`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      // Show success message
      document.getElementById('successCertId').textContent = data.certificate.id;
      document.getElementById('successTxLink').href = data.blockchain_explorer;
      document.getElementById('successViewCert').href = `/verify/${data.certificate.id}`;
      document.getElementById('certifySuccess').classList.remove('hidden');

      // Reset form
      document.getElementById('certifyForm').reset();
      selectedFile = null;
      document.getElementById('dropZoneText').classList.remove('hidden');
      document.getElementById('filePreview').classList.add('hidden');

      // Reload statistics
      await loadStatistics();
    } else {
      throw new Error(data.error || 'Certification failed');
    }
  } catch (error) {
    showError(error.message);
  } finally {
    btn.disabled = false;
    btnText.classList.remove('hidden');
    btnLoading.classList.add('hidden');
  }
}

// Handle verification
async function handleVerify() {
  const input = document.getElementById('verifyInput').value.trim();

  if (!input) {
    alert('Please enter a certificate ID or content hash');
    return;
  }

  const resultDiv = document.getElementById('verifyResult');
  resultDiv.innerHTML = '<p class="text-center text-gray-600">Verifying...</p>';
  resultDiv.classList.remove('hidden');

  try {
    let response;

    // Check if input is a certificate ID or hash
    if (input.startsWith('cert_')) {
      response = await fetch(`${API_BASE_URL}/verify/${input}`);
    } else {
      response = await fetch(`${API_BASE_URL}/verify/hash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content_hash: input
        })
      });
    }

    const data = await response.json();

    if (data.success && data.certificate) {
      const cert = data.certificate;
      const isConfirmed = cert.is_confirmed;

      resultDiv.innerHTML = `
        <div class="p-6 ${isConfirmed ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'} rounded-lg">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              ${isConfirmed ?
                '<svg class="h-8 w-8 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>' :
                '<svg class="h-8 w-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>'
              }
            </div>
            <div class="ml-4 flex-1">
              <h3 class="text-lg font-semibold ${isConfirmed ? 'text-green-800' : 'text-yellow-800'}">
                ${isConfirmed ? '✓ Content Certified & Confirmed' : '⚠ Content Certified (Pending Confirmation)'}
              </h3>
              <div class="mt-4 space-y-2 text-sm ${isConfirmed ? 'text-green-700' : 'text-yellow-700'}">
                <p><strong>Certificate ID:</strong> <span class="font-mono">${cert.id}</span></p>
                <p><strong>Content Hash:</strong> <span class="font-mono text-xs">${cert.content_hash.substring(0, 32)}...</span></p>
                <p><strong>Content Type:</strong> ${cert.content_type}</p>
                <p><strong>Creator:</strong> <span class="font-mono text-xs">${cert.creator_wallet_address}</span></p>
                <p><strong>Certified At:</strong> ${new Date(cert.created_at).toLocaleString()}</p>
                <p><strong>Blockchain Confirmations:</strong> ${cert.blockchain_confirmations}</p>
                <p><strong>Status:</strong> <span class="font-semibold">${cert.status}</span></p>
                ${cert.metadata.title ? `<p><strong>Title:</strong> ${cert.metadata.title}</p>` : ''}
                ${data.blockchain_explorer ? `<p class="mt-2"><a href="${data.blockchain_explorer}" target="_blank" class="underline font-semibold">View on Blockchain Explorer →</a></p>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (data.exists === false) {
      resultDiv.innerHTML = `
        <div class="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center">
            <svg class="h-8 w-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <div class="ml-4">
              <h3 class="text-lg font-semibold text-red-800">❌ Content Not Certified</h3>
              <p class="text-sm text-red-700 mt-2">This content has not been certified in the CertiKAS database.</p>
            </div>
          </div>
        </div>
      `;
    } else {
      throw new Error(data.error || 'Verification failed');
    }
  } catch (error) {
    resultDiv.innerHTML = `
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-800"><strong>Error:</strong> ${error.message}</p>
      </div>
    `;
  }
}

// Show error message
function showError(message) {
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('certifyError').classList.remove('hidden');

  setTimeout(() => {
    document.getElementById('certifyError').classList.add('hidden');
  }, 5000);
}

// Setup wallet event listeners
function setupWalletListeners() {
  const connectBtn = document.getElementById('connectWallet');
  const modal = document.getElementById('walletModal');
  const closeModal = document.getElementById('closeModal');
  const kaswareBtn = document.getElementById('connectKasWare');
  const webWalletBtn = document.getElementById('connectWebWallet');
  const chaingeBtn = document.getElementById('connectChainge');

  // Open modal
  connectBtn.addEventListener('click', () => {
    if (window.KaspaWallet.isConnected()) {
      // Already connected, disconnect
      disconnectWallet();
    } else {
      // Show wallet selection modal
      modal.classList.remove('hidden');
    }
  });

  // Close modal
  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Close modal on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });

  // KasWare wallet
  kaswareBtn.addEventListener('click', async () => {
    try {
      await connectWallet('kasware');
      modal.classList.add('hidden');
    } catch (error) {
      alert(error.message);
    }
  });

  // Web wallet
  webWalletBtn.addEventListener('click', async () => {
    try {
      await connectWallet('webwallet');
      modal.classList.add('hidden');
    } catch (error) {
      alert(error.message);
    }
  });

  // Chainge wallet (uses KasWare API)
  chaingeBtn.addEventListener('click', async () => {
    try {
      await connectWallet('kasware'); // Chainge uses KasWare API
      modal.classList.add('hidden');
    } catch (error) {
      alert(error.message);
    }
  });

  // Listen for wallet events
  window.KaspaWallet.on('connect', (data) => {
    console.log('Wallet connected:', data);
    updateWalletUI(data.address);
    localStorage.setItem('certikas_wallet', data.address);
    showNotification('Wallet connected successfully!', 'success');
  });

  window.KaspaWallet.on('disconnect', () => {
    console.log('Wallet disconnected');
    updateWalletUI(null);
    localStorage.removeItem('certikas_wallet');
    showNotification('Wallet disconnected', 'info');
  });

  window.KaspaWallet.on('accountChange', (address) => {
    console.log('Account changed:', address);
    updateWalletUI(address);
    localStorage.setItem('certikas_wallet', address);
    showNotification('Wallet account changed', 'info');
  });

  window.KaspaWallet.on('error', (error) => {
    console.error('Wallet error:', error);
    showNotification('Wallet error: ' + error.message, 'error');
  });
}

// Connect wallet
async function connectWallet(type = 'auto') {
  try {
    const result = await window.KaspaWallet.connect(type);
    if (result.success) {
      currentWalletAddress = result.address;
      document.getElementById('walletAddress').value = result.address;
      return result;
    }
  } catch (error) {
    console.error('Wallet connection failed:', error);
    throw error;
  }
}

// Disconnect wallet
function disconnectWallet() {
  window.KaspaWallet.disconnect();
  currentWalletAddress = null;
  document.getElementById('walletAddress').value = '';
}

// Update wallet UI
function updateWalletUI(address) {
  const connectBtn = document.getElementById('connectWallet');

  if (address) {
    currentWalletAddress = address;
    document.getElementById('walletAddress').value = address;
    connectBtn.textContent = address.substring(0, 10) + '...' + address.slice(-8);
    connectBtn.classList.remove('gradient-bg');
    connectBtn.classList.add('bg-green-600', 'hover:bg-green-700');
  } else {
    currentWalletAddress = null;
    document.getElementById('walletAddress').value = '';
    connectBtn.textContent = 'Connect Wallet';
    connectBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
    connectBtn.classList.add('gradient-bg');
  }
}

// Check wallet connection on load
async function checkWalletConnection() {
  try {
    const savedWallet = localStorage.getItem('certikas_wallet');
    if (savedWallet && window.KaspaWallet) {
      // Try to reconnect automatically
      const address = await window.KaspaWallet.getAddress();
      if (address) {
        updateWalletUI(address);
        currentWalletAddress = address;
      }
    }
  } catch (error) {
    console.log('Auto-reconnect failed:', error);
    localStorage.removeItem('certikas_wallet');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const colors = {
    success: 'bg-green-100 border-green-400 text-green-800',
    error: 'bg-red-100 border-red-400 text-red-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800'
  };

  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg border ${colors[type]} shadow-lg z-50 transition-opacity`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Auto-refresh statistics every 30 seconds
setInterval(loadStatistics, 30000);
