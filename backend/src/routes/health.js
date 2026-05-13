import express from 'express';
import mongoose from 'mongoose';
import { getEmailStatus } from '../controllers/emailController.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const checks = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      node: `v${process.version}`,
      env: process.env.NODE_ENV || 'development'
    },
    dependencies: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      email: getEmailStatus(),
    },
    memory: process.memoryUsage(),
    endpoints: {
      payment: '/api/payment/providers',
      auth: '/api/auth/login',
      tools: '/api/tools'
    }
  };

  res.json({
    status: 'healthy',
    checks
  });
});

export default router;

