// backend/server.js
// UPDATED WITH PAYMENT ROUTES

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// For Paystack webhooks, we need raw body
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Regular JSON parsing for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const socialMediaRoutes = require('./src/routes/social-media.routes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/social-media', socialMediaRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Meritlives Tools API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      payment: '/api/payment',
      socialMedia: '/api/social-media'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 =======================================');
  console.log('🚀  Meritlives Tools API Server Started');
  console.log('🚀 =======================================');
  console.log('');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`💳 Payment: http://localhost:${PORT}/api/payment`);
  console.log(`📱 Social Media: http://localhost:${PORT}/api/social-media`);
  console.log('');
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎯 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log('');
  console.log('✅ Server is ready to accept connections!');
  console.log('');
});

module.exports = app;
