import express from 'express';
import Follower from '../models/Follower.js';

const router = express.Router();

/**
 * POST /api/followers/follow
 * Add a new follower (or return existing).
 * Body: { uid, name, email, photoURL }
 */
router.post('/follow', async (req, res) => {
  try {
    const { uid, name, email, photoURL } = req.body;

    if (!uid || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'uid, name, and email are required',
      });
    }

    // Check if already following
    const existing = await Follower.findOne({ uid });
    if (existing) {
      const count = await Follower.countDocuments();
      return res.json({
        success: true,
        message: 'Already following',
        alreadyFollowing: true,
        data: existing,
        followerCount: count,
      });
    }

    const follower = await Follower.create({
      uid,
      name: name.trim(),
      email: email.trim(),
      photoURL: photoURL || '',
      followedAt: new Date(),
    });

    // Get updated count
    const count = await Follower.countDocuments();

    res.status(201).json({
      success: true,
      message: 'Followed successfully',
      alreadyFollowing: false,
      data: follower,
      followerCount: count,
    });
  } catch (error) {
    if (error.code === 11000) {
      const count = await Follower.countDocuments();
      return res.json({
        success: true,
        message: 'Already following',
        alreadyFollowing: true,
        followerCount: count,
      });
    }
    console.error('Follow error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to follow' });
  }
});

/**
 * POST /api/followers/unfollow
 * Remove a follower.
 * Body: { uid }
 */
router.post('/unfollow', async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'uid is required',
      });
    }

    const result = await Follower.findOneAndDelete({ uid });
    const count = await Follower.countDocuments();

    if (!result) {
      return res.json({
        success: true,
        message: 'Was not following',
        followerCount: count,
      });
    }

    res.json({
      success: true,
      message: 'Unfollowed successfully',
      followerCount: count,
    });
  } catch (error) {
    console.error('Unfollow error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to unfollow' });
  }
});

/**
 * GET /api/followers/status/:uid
 * Check if a specific user is following.
 */
router.get('/status/:uid', async (req, res) => {
  try {
    const follower = await Follower.findOne({ uid: req.params.uid });
    const count = await Follower.countDocuments();
    res.json({
      success: true,
      isFollowing: !!follower,
      followerCount: count,
    });
  } catch (error) {
    console.error('Status check error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to check status' });
  }
});

/**
 * GET /api/followers/count
 * Get the total follower count.
 */
router.get('/count', async (req, res) => {
  try {
    const count = await Follower.countDocuments();
    res.json({ success: true, followerCount: count });
  } catch (error) {
    console.error('Count error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to get count' });
  }
});

export default router;
