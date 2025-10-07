/**
 * Certificate Entity - Core Domain Model
 * Represents a blockchain-backed content certification
 */

export class Certificate {
  constructor({
    id,
    contentHash,
    contentType,
    blockchainTxId,
    creatorWalletAddress,
    metadata = {},
    status = 'pending',
    createdAt = new Date(),
    confirmedAt = null,
    blockchainConfirmations = 0,
    certificateUrl = null
  }) {
    this.id = id;
    this.contentHash = contentHash;
    this.contentType = contentType;
    this.blockchainTxId = blockchainTxId;
    this.creatorWalletAddress = creatorWalletAddress;
    this.metadata = metadata;
    this.status = status; // pending, confirmed, revoked
    this.createdAt = createdAt;
    this.confirmedAt = confirmedAt;
    this.blockchainConfirmations = blockchainConfirmations;
    this.certificateUrl = certificateUrl;
  }

  /**
   * Check if certificate is confirmed on blockchain
   */
  isConfirmed() {
    return this.status === 'confirmed' && this.blockchainConfirmations >= 6;
  }

  /**
   * Check if certificate is still pending
   */
  isPending() {
    return this.status === 'pending';
  }

  /**
   * Check if certificate has been revoked
   */
  isRevoked() {
    return this.status === 'revoked';
  }

  /**
   * Update blockchain confirmations
   */
  updateConfirmations(confirmations) {
    this.blockchainConfirmations = confirmations;

    if (confirmations >= 6 && this.status === 'pending') {
      this.status = 'confirmed';
      this.confirmedAt = new Date();
    }
  }

  /**
   * Revoke certificate (marks as invalid)
   */
  revoke() {
    if (this.status === 'revoked') {
      throw new Error('Certificate is already revoked');
    }

    this.status = 'revoked';
  }

  /**
   * Generate public verification URL
   */
  getVerificationUrl(baseUrl = 'https://certikas.org') {
    return `${baseUrl}/verify/${this.id}`;
  }

  /**
   * Generate QR code data for mobile verification
   */
  getQRCodeData() {
    return JSON.stringify({
      certificateId: this.id,
      contentHash: this.contentHash,
      verificationUrl: this.getVerificationUrl()
    });
  }

  /**
   * Calculate certificate age in days
   */
  getAgeInDays() {
    const now = new Date();
    const diffTime = Math.abs(now - this.createdAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Convert to plain object for API response
   */
  toJSON() {
    return {
      id: this.id,
      content_hash: this.contentHash,
      content_type: this.contentType,
      blockchain_tx_id: this.blockchainTxId,
      creator_wallet_address: this.creatorWalletAddress,
      metadata: this.metadata,
      status: this.status,
      created_at: this.createdAt.toISOString(),
      confirmed_at: this.confirmedAt ? this.confirmedAt.toISOString() : null,
      blockchain_confirmations: this.blockchainConfirmations,
      verification_url: this.getVerificationUrl(),
      is_confirmed: this.isConfirmed(),
      age_in_days: this.getAgeInDays()
    };
  }

  /**
   * Create certificate from database row
   */
  static fromDatabase(row) {
    return new Certificate({
      id: row.id,
      contentHash: row.content_hash,
      contentType: row.content_type,
      blockchainTxId: row.blockchain_tx_id,
      creatorWalletAddress: row.creator_wallet_address,
      metadata: row.metadata || {},
      status: row.status,
      createdAt: new Date(row.created_at),
      confirmedAt: row.confirmed_at ? new Date(row.confirmed_at) : null,
      blockchainConfirmations: row.blockchain_confirmations || 0,
      certificateUrl: row.certificate_url
    });
  }

  /**
   * Validate certificate data
   */
  validate() {
    const errors = [];

    if (!this.contentHash || this.contentHash.length !== 64) {
      errors.push('Invalid content hash (must be 64-character SHA-256)');
    }

    if (!['article', 'video', 'image', 'document', 'audio', 'tweet', 'post'].includes(this.contentType)) {
      errors.push('Invalid content type');
    }

    if (!this.creatorWalletAddress || !this.creatorWalletAddress.startsWith('kaspa:')) {
      errors.push('Invalid Kaspa wallet address');
    }

    if (errors.length > 0) {
      throw new Error(`Certificate validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}

export default Certificate;
