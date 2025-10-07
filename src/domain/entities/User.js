/**
 * User Entity - Represents content creators and certifiers
 */

export class User {
  constructor({
    id,
    walletAddress,
    email = null,
    username = null,
    reputationScore = 100.0,
    totalCertifications = 0,
    totalVerifications = 0,
    igraTokenBalance = 0,
    isVerified = false,
    accountType = 'individual', // individual, journalist, organization
    metadata = {},
    createdAt = new Date(),
    lastActiveAt = new Date()
  }) {
    this.id = id;
    this.walletAddress = walletAddress;
    this.email = email;
    this.username = username;
    this.reputationScore = reputationScore;
    this.totalCertifications = totalCertifications;
    this.totalVerifications = totalVerifications;
    this.igraTokenBalance = igraTokenBalance;
    this.isVerified = isVerified;
    this.accountType = accountType;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.lastActiveAt = lastActiveAt;
  }

  /**
   * Calculate trust level based on reputation
   */
  getTrustLevel() {
    if (this.reputationScore >= 95) return 'platinum';
    if (this.reputationScore >= 85) return 'gold';
    if (this.reputationScore >= 70) return 'silver';
    if (this.reputationScore >= 50) return 'bronze';
    return 'unranked';
  }

  /**
   * Check if user can certify content
   */
  canCertify() {
    return this.reputationScore >= 50 && this.isVerified;
  }

  /**
   * Update reputation score after certification
   */
  updateReputation(delta) {
    this.reputationScore = Math.max(0, Math.min(100, this.reputationScore + delta));
  }

  /**
   * Increment certification count
   */
  incrementCertifications() {
    this.totalCertifications += 1;
    this.lastActiveAt = new Date();
  }

  /**
   * Increment verification count
   */
  incrementVerifications() {
    this.totalVerifications += 1;
    this.lastActiveAt = new Date();
  }

  /**
   * Add Igra token balance
   */
  addIgraTokens(amount) {
    if (amount < 0) {
      throw new Error('Cannot add negative token amount');
    }
    this.igraTokenBalance += amount;
  }

  /**
   * Deduct Igra token balance
   */
  deductIgraTokens(amount) {
    if (amount < 0) {
      throw new Error('Cannot deduct negative token amount');
    }
    if (this.igraTokenBalance < amount) {
      throw new Error('Insufficient Igra token balance');
    }
    this.igraTokenBalance -= amount;
  }

  /**
   * Calculate account age in days
   */
  getAccountAgeInDays() {
    const now = new Date();
    const diffTime = Math.abs(now - this.createdAt);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Check if user is active (activity in last 30 days)
   */
  isActive() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.lastActiveAt > thirtyDaysAgo;
  }

  /**
   * Convert to plain object for API response
   */
  toJSON() {
    return {
      id: this.id,
      wallet_address: this.walletAddress,
      username: this.username,
      reputation_score: this.reputationScore,
      trust_level: this.getTrustLevel(),
      total_certifications: this.totalCertifications,
      total_verifications: this.totalVerifications,
      igra_token_balance: this.igraTokenBalance,
      is_verified: this.isVerified,
      account_type: this.accountType,
      can_certify: this.canCertify(),
      account_age_days: this.getAccountAgeInDays(),
      is_active: this.isActive(),
      created_at: this.createdAt.toISOString(),
      last_active_at: this.lastActiveAt.toISOString()
    };
  }

  /**
   * Convert to public profile (hides sensitive data)
   */
  toPublicProfile() {
    return {
      username: this.username,
      wallet_address: this.walletAddress,
      reputation_score: this.reputationScore,
      trust_level: this.getTrustLevel(),
      total_certifications: this.totalCertifications,
      is_verified: this.isVerified,
      account_type: this.accountType
    };
  }

  /**
   * Create user from database row
   */
  static fromDatabase(row) {
    return new User({
      id: row.id,
      walletAddress: row.wallet_address,
      email: row.email,
      username: row.username,
      reputationScore: parseFloat(row.reputation_score) || 100.0,
      totalCertifications: parseInt(row.total_certifications) || 0,
      totalVerifications: parseInt(row.total_verifications) || 0,
      igraTokenBalance: parseFloat(row.igra_token_balance) || 0,
      isVerified: row.is_verified || false,
      accountType: row.account_type || 'individual',
      metadata: row.metadata || {},
      createdAt: new Date(row.created_at),
      lastActiveAt: new Date(row.last_active_at)
    });
  }

  /**
   * Validate user data
   */
  validate() {
    const errors = [];

    if (!this.walletAddress || !this.walletAddress.startsWith('kaspa:')) {
      errors.push('Invalid Kaspa wallet address');
    }

    if (this.email && !this.isValidEmail(this.email)) {
      errors.push('Invalid email format');
    }

    if (this.reputationScore < 0 || this.reputationScore > 100) {
      errors.push('Reputation score must be between 0 and 100');
    }

    if (!['individual', 'journalist', 'organization'].includes(this.accountType)) {
      errors.push('Invalid account type');
    }

    if (errors.length > 0) {
      throw new Error(`User validation failed: ${errors.join(', ')}`);
    }

    return true;
  }

  /**
   * Email validation helper
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default User;
