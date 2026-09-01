import express from 'express';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const adminUser = process.env.ADMIN_USERNAME || 'ajaypatel';
    const adminPass = process.env.ADMIN_PASSWORD || 'ajay@110';

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password',
      });
    }

    if (username.trim() === adminUser && password === adminPass) {
      const token = jwt.sign(
        { username: adminUser, role: 'admin' },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Admin logged in successfully',
        token,
        admin: {
          username: adminUser,
          role: 'admin',
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin username or password',
      });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
    });
  }
});

// GET /api/auth/verify
router.get('/verify', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    admin: req.admin,
  });
});

export default router;
