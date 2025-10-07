// Simple test endpoint for Vercel
export default function handler(req, res) {
  res.status(200).json({
    message: 'CertiKAS API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    status: 'healthy'
  });
}
