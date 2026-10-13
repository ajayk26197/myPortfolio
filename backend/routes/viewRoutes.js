import express from 'express';
import ViewCounter from '../models/ViewCounter.js';

const router = express.Router();

/**
 * POST /api/views/hit
 * Increments the portfolio view counter by 1.
 * Called on every page load / refresh / new tab — no deduplication.
 */
router.post('/hit', async (req, res) => {
  try {
    const counter = await ViewCounter.findOneAndUpdate(
      { key: 'portfolio' },
      {
        $inc: { count: 1 },
        $set: { lastVisitedAt: new Date() },
        $setOnInsert: { firstVisitedAt: new Date() },
      },
      { upsert: true, returnDocument: 'after' }
    );

    res.json({
      success: true,
      count: counter.count,
      lastVisitedAt: counter.lastVisitedAt,
      firstVisitedAt: counter.firstVisitedAt,
    });
  } catch (error) {
    console.error('View counter error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update view count' });
  }
});

/**
 * GET /api/views
 * Returns current view count without incrementing.
 */
router.get('/', async (req, res) => {
  try {
    const counter = await ViewCounter.findOne({ key: 'portfolio' });
    res.json({
      success: true,
      count: counter ? counter.count : 0,
      lastVisitedAt: counter ? counter.lastVisitedAt : null,
      firstVisitedAt: counter ? counter.firstVisitedAt : null,
    });
  } catch (error) {
    console.error('Get view count error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get view count' });
  }
});

export default router;
