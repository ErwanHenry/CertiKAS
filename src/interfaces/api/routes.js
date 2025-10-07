/**
 * API Routes - REST endpoints for CertiKAS
 */

import express from 'express';
import multer from 'multer';
import crypto from 'crypto';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 50) * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'application/pdf',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  }
});

export function createApiRouter({ certificationService, kaspaAdapter, kasplexAdapter, logger }) {
  const router = express.Router();

  /**
   * POST /certify - Certify new content
   */
  router.post('/certify', upload.single('file'), async (req, res) => {
    try {
      const { content_type, creator_wallet_address, metadata } = req.body;

      if (!creator_wallet_address) {
        return res.status(400).json({
          error: 'creator_wallet_address is required'
        });
      }

      if (!req.file && !req.body.content_hash) {
        return res.status(400).json({
          error: 'Either file upload or content_hash is required'
        });
      }

      // Use uploaded file or generate hash from provided hash
      let contentBuffer = req.file ? req.file.buffer : null;

      const certificate = await certificationService.certifyContent({
        contentBuffer,
        contentType: content_type || 'document',
        creatorWalletAddress: creator_wallet_address,
        metadata: metadata ? JSON.parse(metadata) : {}
      });

      res.status(201).json({
        success: true,
        certificate: certificate.toJSON(),
        blockchain_explorer: kaspaAdapter.getExplorerUrl(certificate.blockchainTxId)
      });
    } catch (error) {
      logger.error('Certification error:', error);
      res.status(500).json({
        error: error.message
      });
    }
  });

  /**
   * POST /certify/hash - Certify by content hash only
   */
  router.post('/certify/hash', async (req, res) => {
    try {
      const { content_hash, content_type, creator_wallet_address, metadata } = req.body;

      if (!content_hash || !creator_wallet_address) {
        return res.status(400).json({
          error: 'content_hash and creator_wallet_address are required'
        });
      }

      // Create mock buffer from hash (in production, hash should be pre-computed)
      const contentBuffer = Buffer.from(content_hash, 'hex');

      const certificate = await certificationService.certifyContent({
        contentBuffer,
        contentType: content_type || 'document',
        creatorWalletAddress: creator_wallet_address,
        metadata: metadata || {}
      });

      res.status(201).json({
        success: true,
        certificate: certificate.toJSON()
      });
    } catch (error) {
      logger.error('Hash certification error:', error);
      res.status(500).json({
        error: error.message
      });
    }
  });

  /**
   * GET /verify/:certificate_id - Get certificate by ID
   */
  router.get('/verify/:certificate_id', async (req, res) => {
    try {
      const { certificate_id } = req.params;

      const certificate = await certificationService.getCertificate(certificate_id);

      res.json({
        success: true,
        certificate: certificate.toJSON(),
        blockchain_explorer: kaspaAdapter.getExplorerUrl(certificate.blockchainTxId)
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        res.status(404).json({
          error: error.message
        });
      } else {
        logger.error('Verification error:', error);
        res.status(500).json({
          error: error.message
        });
      }
    }
  });

  /**
   * POST /verify/hash - Check if content hash is certified
   */
  router.post('/verify/hash', async (req, res) => {
    try {
      const { content_hash } = req.body;

      if (!content_hash) {
        return res.status(400).json({
          error: 'content_hash is required'
        });
      }

      const result = await certificationService.checkContentHash(content_hash);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('Hash verification error:', error);
      res.status(500).json({
        error: error.message
      });
    }
  });

  /**
   * POST /verify/file - Verify uploaded file
   */
  router.post('/verify/file', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'File is required'
        });
      }

      const result = await certificationService.verifyContent(req.file.buffer);

      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      logger.error('File verification error:', error);
      res.status(500).json({
        error: error.message
      });
    }
  });

  /**
   * GET /certificates/creator/:wallet_address - Get certificates by creator
   */
  router.get('/certificates/creator/:wallet_address', async (req, res) => {
    try {
      const { wallet_address } = req.params;
      const { limit, offset, status } = req.query;

      const certificates = await certificationService.getCertificatesByCreator(wallet_address, {
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
        status
      });

      res.json({
        success: true,
        count: certificates.length,
        certificates: certificates.map(c => c.toJSON())
      });
    } catch (error) {
      logger.error('Get certificates error:', error);
      res.status(500).json({
        error: error.message
      });
    }
  });

  /**
   * GET /search - Search certificates
   */
  router.get('/search', async (req, res) => {
    try {
      const { q, limit, offset } = req.query;

      if (!q) {
        return res.status(400).json({
          error: 'Query parameter "q" is required'
        });
      }

      const results = await certificationService.searchCertificates(q, {
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0
      });

      res.json({
        success: true,
        query: q,
        count: results.length,
        results: results.map(c => c.toJSON())
      });
    } catch (error) {
      logger.error('Search error:', error);
      res.status(500).json({
        error: error.message
      });
    }
  });

  /**
   * GET /statistics - Get platform statistics
   */
  router.get('/statistics', async (req, res) => {
    try {
      const stats = await certificationService.getStatistics();

      res.json({
        success: true,
        statistics: stats
      });
    } catch (error) {
      logger.error('Statistics error:', error);
      res.status(500).json({
        error: error.message
      });
    }
  });

  /**
   * GET /blockchain/health - Kaspa blockchain health
   */
  router.get('/blockchain/health', async (req, res) => {
    try {
      const health = await kaspaAdapter.checkHealth();

      res.json({
        success: true,
        blockchain: health
      });
    } catch (error) {
      logger.error('Blockchain health error:', error);
      res.status(503).json({
        error: error.message
      });
    }
  });

  /**
   * GET /igra/status - Igra token bridge status
   */
  router.get('/igra/status', async (req, res) => {
    try {
      const tokenInfo = await kasplexAdapter.getTokenInfo();
      const bridgeReady = await kasplexAdapter.isBridgeReady();

      res.json({
        success: true,
        igra_token: tokenInfo,
        bridge_ready: bridgeReady
      });
    } catch (error) {
      logger.error('Igra status error:', error);
      res.status(500).json({
        error: error.message
      });
    }
  });

  /**
   * GET /igra/balance/:wallet_address - Get Igra balance
   */
  router.get('/igra/balance/:wallet_address', async (req, res) => {
    try {
      const { wallet_address } = req.params;

      const balance = await kasplexAdapter.getIgraBalance(wallet_address);

      res.json({
        success: true,
        wallet_address,
        balance,
        token: 'IGRA'
      });
    } catch (error) {
      logger.error('Igra balance error:', error);
      res.status(500).json({
        error: error.message
      });
    }
  });

  /**
   * POST /bulk/certify - Bulk certification
   */
  router.post('/bulk/certify', upload.array('files', 100), async (req, res) => {
    try {
      const { creator_wallet_address, metadata } = req.body;

      if (!creator_wallet_address) {
        return res.status(400).json({
          error: 'creator_wallet_address is required'
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: 'At least one file is required'
        });
      }

      const contentItems = req.files.map(file => ({
        buffer: file.buffer,
        type: 'document',
        metadata: {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        }
      }));

      const results = await certificationService.bulkCertify(contentItems, creator_wallet_address);

      res.json({
        success: true,
        total: contentItems.length,
        successful: results.successful.length,
        failed: results.failed.length,
        results
      });
    } catch (error) {
      logger.error('Bulk certification error:', error);
      res.status(500).json({
        error: error.message
      });
    }
  });

  /**
   * GET /cost/estimate - Estimate certification cost
   */
  router.get('/cost/estimate', async (req, res) => {
    try {
      const { content_type, content_size } = req.query;

      const cost = await certificationService.calculateCertificationCost(
        content_type || 'document',
        parseInt(content_size) || 0
      );

      res.json({
        success: true,
        cost
      });
    } catch (error) {
      logger.error('Cost estimation error:', error);
      res.status(500).json({
        error: error.message
      });
    }
  });

  return router;
}

export default createApiRouter;
