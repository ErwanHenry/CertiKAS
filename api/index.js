/**
 * CertiKAS Server - Express application
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import adapters
import { KaspaAdapter } from '../src/infrastructure/kaspa/KaspaAdapter.js';
import { KasplexAdapter } from '../src/infrastructure/kasplex/KasplexAdapter.js';

// Import services
import { CertificationService } from '../src/application/services/CertificationService.js';

// Import API routes (we'll create these next)
import { createApiRouter } from '../src/interfaces/api/routes.js';

// Logger
import winston from 'winston';

// Environment configuration
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/certikas.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    })
  ]
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.kaspa.org", "https://api.kasplex.org"]
    }
  }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: process.env.CORS_CREDENTIALS === 'true',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Static files (frontend) - disabled for Vercel, use /public routes
// app.use(express.static(path.join(__dirname, '../public')));

// Initialize blockchain adapters
let kaspaAdapter, kasplexAdapter, certificationService;

async function initializeServices() {
  try {
    logger.info('Initializing CertiKAS services...');

    // Initialize Kaspa adapter
    kaspaAdapter = new KaspaAdapter({
      nodeUrl: process.env.KASPA_NODE_URL,
      network: process.env.KASPA_NETWORK,
      walletAddress: process.env.KASPA_WALLET_ADDRESS,
      privateKey: process.env.KASPA_PRIVATE_KEY,
      mockMode: process.env.MOCK_BLOCKCHAIN === 'true'
    });
    await kaspaAdapter.initialize();

    // Initialize Kasplex adapter
    kasplexAdapter = new KasplexAdapter({
      apiUrl: process.env.KASPLEX_API_URL,
      contractAddress: process.env.KASPLEX_CONTRACT_ADDRESS,
      igraTokenAddress: process.env.IGRA_TOKEN_ADDRESS,
      enabled: process.env.FEATURE_IGRA_BRIDGE === 'true',
      mockMode: process.env.MOCK_BLOCKCHAIN === 'true'
    });
    await kasplexAdapter.initialize();

    // Initialize mock repositories (in production, use real database)
    const certificateRepository = {
      save: async (cert) => cert,
      findById: async (id) => null,
      findByContentHash: async (hash) => null,
      findByCreator: async (address, options) => [],
      update: async (cert) => cert,
      search: async (query, options) => [],
      getStatistics: async () => ({
        total: 0,
        confirmed: 0,
        pending: 0,
        byContentType: {},
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      })
    };

    const userRepository = {
      findByWalletAddress: async (address) => ({
        id: '1',
        walletAddress: address,
        reputationScore: 85,
        isVerified: true,
        canCertify: () => true,
        incrementCertifications: () => {},
        incrementVerifications: () => {}
      }),
      update: async (user) => user
    };

    // Initialize certification service
    certificationService = new CertificationService({
      kaspaAdapter,
      kasplexAdapter,
      certificateRepository,
      userRepository,
      logger
    });

    logger.info('✅ All services initialized successfully');
  } catch (error) {
    logger.error('❌ Service initialization failed:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const kaspaHealth = await kaspaAdapter.checkHealth();
    const kasplexHealth = await kasplexAdapter.checkHealth();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        kaspa: kaspaHealth,
        kasplex: kasplexHealth
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// API routes
app.use('/api/v1', createApiRouter({ certificationService, kaspaAdapter, kasplexAdapter, logger }));

// Serve frontend - handled by Vercel routing
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/index.html'));
// });

// app.get('/verify/:certificateId', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/verify.html'));
// });

// app.get('/dashboard', (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/dashboard.html'));
// });

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Initialize services on startup
initializeServices().catch(error => {
  logger.error('Failed to initialize services:', error);
});

// Export for Vercel
export default app;
