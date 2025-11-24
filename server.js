const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Ensure JWT secret is present in production, provide a dev fallback otherwise
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET is not set. Set JWT_SECRET in environment variables.');
    process.exit(1);
  } else {
    // Generate a secure temporary secret for development so we don't use a weak hardcoded value
    try {
      const crypto = require('crypto');
      const tmpSecret = crypto.randomBytes(32).toString('hex');
      process.env.JWT_SECRET = tmpSecret;
      console.info('Info: JWT_SECRET was not set. A secure temporary secret has been generated for this development run.');
      console.info('Tip: To persist the secret, set JWT_SECRET in your environment or in a .env file.');
    } catch (e) {
      // Fallback to a predictable development secret if crypto is not available
      process.env.JWT_SECRET = 'dev-secret';
      console.info('Info: JWT_SECRET not set and crypto unavailable — using fallback dev secret.');
    }
  }
}

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use(express.static('frontend'));
app.use('/admin', express.static('admin'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dh-pharmacy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/products', require('./backend/routes/products'));
app.use('/api/orders', require('./backend/routes/orders'));
app.use('/api/users', require('./backend/routes/users'));
app.use('/api/prescriptions', require('./backend/routes/prescriptions'));

// Dev-only debug routes
if (process.env.NODE_ENV !== 'production') {
  try {
    app.use('/api/debug', require('./backend/routes/debug'));
    console.info('Dev debug routes mounted at /api/debug');
  } catch (e) {
    console.warn('Could not mount debug routes:', e && e.message);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(require('./backend/middleware/errorHandler'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

