/**
 * Certification Service - Core business logic for content certification
 */

import { Certificate } from '../../domain/entities/Certificate.js';
import { ContentHash } from '../../domain/value-objects/ContentHash.js';
import crypto from 'crypto';

export class CertificationService {
  constructor({ kaspaAdapter, kasplexAdapter, certificateRepository, userRepository, logger }) {
    this.kaspaAdapter = kaspaAdapter;
    this.kasplexAdapter = kasplexAdapter;
    this.certificateRepository = certificateRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  /**
   * Certify content and record on blockchain
   */
  async certifyContent({ contentBuffer, contentType, creatorWalletAddress, metadata = {} }) {
    try {
      this.logger.info('Starting content certification', { contentType, creator: creatorWalletAddress });

      // 1. Validate creator
      const user = await this.userRepository.findByWalletAddress(creatorWalletAddress);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.canCertify()) {
        throw new Error(`User cannot certify (reputation: ${user.reputationScore}, verified: ${user.isVerified})`);
      }

      // 2. Generate content hash
      const contentHash = await ContentHash.fromFile(contentBuffer);
      this.logger.info('Content hash generated', { hash: contentHash.getTruncated() });

      // 3. Check if content already certified
      const existing = await this.certificateRepository.findByContentHash(contentHash.toString());
      if (existing) {
        throw new Error(`Content already certified (Certificate ID: ${existing.id})`);
      }

      // 4. Create blockchain transaction
      const blockchainTx = await this.kaspaAdapter.createCertificationTransaction(
        contentHash.toString(),
        {
          contentType,
          creator: creatorWalletAddress,
          timestamp: Date.now(),
          ...metadata
        }
      );

      this.logger.info('Blockchain transaction created', { txId: blockchainTx.txId });

      // 5. Create certificate record
      const certificate = new Certificate({
        id: this.generateCertificateId(),
        contentHash: contentHash.toString(),
        contentType,
        blockchainTxId: blockchainTx.txId,
        creatorWalletAddress,
        metadata,
        status: 'pending',
        createdAt: new Date(),
        blockchainConfirmations: 0
      });

      // 6. Save certificate
      await this.certificateRepository.save(certificate);
      this.logger.info('Certificate saved', { certificateId: certificate.id });

      // 7. Update user stats
      user.incrementCertifications();
      await this.userRepository.update(user);

      // 8. Reward with Igra tokens (if enabled)
      if (this.kasplexAdapter.enabled) {
        const rewardAmount = this.kasplexAdapter.calculateReward(user.reputationScore, contentType);
        try {
          await this.kasplexAdapter.rewardCertification(
            creatorWalletAddress,
            rewardAmount,
            certificate.id
          );
          this.logger.info('Igra reward issued', { amount: rewardAmount });
        } catch (error) {
          this.logger.warn('Igra reward failed (non-critical)', { error: error.message });
        }
      }

      // 9. Start monitoring blockchain confirmations
      this.monitorCertificateConfirmations(certificate.id, blockchainTx.txId);

      return certificate;
    } catch (error) {
      this.logger.error('Certification failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Bulk certify multiple content items
   */
  async bulkCertify(contentItems, creatorWalletAddress) {
    this.logger.info('Starting bulk certification', { count: contentItems.length });

    const results = {
      successful: [],
      failed: []
    };

    for (const item of contentItems) {
      try {
        const certificate = await this.certifyContent({
          contentBuffer: item.buffer,
          contentType: item.type,
          creatorWalletAddress,
          metadata: item.metadata || {}
        });

        results.successful.push({
          certificateId: certificate.id,
          contentHash: certificate.contentHash,
          metadata: item.metadata
        });
      } catch (error) {
        results.failed.push({
          error: error.message,
          metadata: item.metadata
        });
      }
    }

    this.logger.info('Bulk certification completed', {
      successful: results.successful.length,
      failed: results.failed.length
    });

    return results;
  }

  /**
   * Get certificate by ID
   */
  async getCertificate(certificateId) {
    const certificate = await this.certificateRepository.findById(certificateId);

    if (!certificate) {
      throw new Error(`Certificate not found: ${certificateId}`);
    }

    // Update blockchain confirmations in real-time
    if (!certificate.isConfirmed() && certificate.blockchainTxId) {
      try {
        const confirmations = await this.kaspaAdapter.getTransactionConfirmations(
          certificate.blockchainTxId
        );
        certificate.updateConfirmations(confirmations);
        await this.certificateRepository.update(certificate);
      } catch (error) {
        this.logger.warn('Failed to update confirmations', { error: error.message });
      }
    }

    return certificate;
  }

  /**
   * Verify content against existing certificate
   */
  async verifyContent(contentBuffer) {
    const contentHash = await ContentHash.fromFile(contentBuffer);
    const certificate = await this.certificateRepository.findByContentHash(contentHash.toString());

    if (!certificate) {
      return {
        certified: false,
        message: 'Content not found in CertiKAS database'
      };
    }

    // Verify blockchain transaction
    const isConfirmed = await this.kaspaAdapter.isTransactionConfirmed(certificate.blockchainTxId);

    return {
      certified: true,
      confirmed: isConfirmed,
      certificate: certificate.toJSON(),
      blockchainExplorerUrl: this.kaspaAdapter.getExplorerUrl(certificate.blockchainTxId)
    };
  }

  /**
   * Check if content hash exists
   */
  async checkContentHash(contentHash) {
    const certificate = await this.certificateRepository.findByContentHash(contentHash);

    if (!certificate) {
      return {
        exists: false,
        certified: false
      };
    }

    return {
      exists: true,
      certified: true,
      certificateId: certificate.id,
      certifiedAt: certificate.createdAt,
      isConfirmed: certificate.isConfirmed()
    };
  }

  /**
   * Revoke certificate (admin only)
   */
  async revokeCertificate(certificateId, reason) {
    const certificate = await this.getCertificate(certificateId);

    certificate.revoke();
    certificate.metadata.revocationReason = reason;
    certificate.metadata.revokedAt = new Date().toISOString();

    await this.certificateRepository.update(certificate);

    this.logger.warn('Certificate revoked', { certificateId, reason });

    return certificate;
  }

  /**
   * Get certificates by creator
   */
  async getCertificatesByCreator(walletAddress, options = {}) {
    const { limit = 50, offset = 0, status = null } = options;

    return await this.certificateRepository.findByCreator(walletAddress, {
      limit,
      offset,
      status
    });
  }

  /**
   * Search certificates by metadata
   */
  async searchCertificates(query, options = {}) {
    const { limit = 50, offset = 0 } = options;

    return await this.certificateRepository.search(query, { limit, offset });
  }

  /**
   * Get certification statistics
   */
  async getStatistics() {
    const stats = await this.certificateRepository.getStatistics();

    return {
      totalCertificates: stats.total,
      confirmedCertificates: stats.confirmed,
      pendingCertificates: stats.pending,
      byContentType: stats.byContentType,
      certificationsToday: stats.today,
      certificationsThisWeek: stats.thisWeek,
      certificationsThisMonth: stats.thisMonth
    };
  }

  /**
   * Monitor blockchain confirmations for certificate
   */
  async monitorCertificateConfirmations(certificateId, txId) {
    this.logger.info('Starting confirmation monitoring', { certificateId, txId });

    await this.kaspaAdapter.monitorTransaction(txId, async ({ confirmations, confirmed }) => {
      try {
        const certificate = await this.certificateRepository.findById(certificateId);
        if (certificate) {
          certificate.updateConfirmations(confirmations);
          await this.certificateRepository.update(certificate);

          this.logger.info('Certificate confirmations updated', {
            certificateId,
            confirmations,
            confirmed
          });

          if (confirmed) {
            // Trigger webhook notification
            this.triggerWebhook('certificate.confirmed', certificate.toJSON());
          }
        }
      } catch (error) {
        this.logger.error('Failed to update confirmations', { error: error.message });
      }
    });
  }

  /**
   * Trigger webhook notification
   */
  async triggerWebhook(event, data) {
    // Implementation for webhook notifications
    this.logger.info('Webhook triggered', { event });
  }

  /**
   * Generate unique certificate ID
   */
  generateCertificateId() {
    const prefix = 'cert';
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(8).toString('hex');
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Calculate certification cost
   */
  async calculateCertificationCost(contentType, contentSize) {
    const baseCost = await this.kaspaAdapter.estimateTransactionFee();

    // Add premium for large files
    let sizePremium = 0;
    if (contentSize > 50 * 1024 * 1024) { // > 50MB
      sizePremium = 0.0005;
    }

    return {
      blockchainFee: baseCost.fee,
      sizePremium,
      totalCost: baseCost.fee + sizePremium,
      unit: baseCost.unit
    };
  }
}

export default CertificationService;
