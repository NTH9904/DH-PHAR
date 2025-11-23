const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  let useSecret = secret;
  if (!useSecret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT secret is not configured. Set JWT_SECRET in environment variables.');
    }
    // In development, ensure there's a secret available (server should set it at startup).
    // If not present, generate a temporary one to avoid insecure defaults.
    try {
      const crypto = require('crypto');
      useSecret = crypto.randomBytes(32).toString('hex');
      process.env.JWT_SECRET = useSecret;
      console.info('Info: Generated temporary JWT secret for development.');
    } catch (e) {
      useSecret = 'dev-secret';
      console.info('Info: Using fallback dev JWT secret.');
    }
  }

  return jwt.sign({ id }, useSecret, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = { generateToken };

