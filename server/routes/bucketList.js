import express from 'express';
import jwt from 'jsonwebtoken';
import BucketListItem from '../models/BucketList.js';

const router = express.Router();

// JWT Secret (should match auth.js)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Authorization denied.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

// @route   GET /api/bucketlist
// @desc    Get user's bucket list items
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { completed } = req.query;
    let query = { user: req.userId };
    
    if (completed !== undefined) {
      query.isCompleted = completed === 'true';
    }
    
    const items = await BucketListItem.find(query)
      .sort({ priority: -1, createdAt: -1 });
    
    res.json({
      success: true,
      data: {
        items,
      },
    });
  } catch (error) {
    console.error('Error fetching bucket list:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message,
    });
  }
});

// @route   POST /api/bucketlist
// @desc    Add item to bucket list
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { destination, notes, priority, tags } = req.body;

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: 'Destination is required.',
      });
    }

    const newItem = await BucketListItem.create({
      user: req.userId,
      destination,
      notes: notes || '',
      priority: priority || 'medium',
      tags: tags || [],
    });

    res.status(201).json({
      success: true,
      message: 'Item added to bucket list successfully',
      data: {
        item: newItem,
      },
    });
  } catch (error) {
    console.error('Error adding bucket list item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message,
    });
  }
});

// @route   PUT /api/bucketlist/:id
// @desc    Update bucket list item
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { destination, notes, priority, tags, isCompleted } = req.body;
    
    const item = await BucketListItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Bucket list item not found.',
      });
    }

    // Check if user owns this item
    if (item.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item.',
      });
    }

    // Update fields
    if (destination !== undefined) item.destination = destination;
    if (notes !== undefined) item.notes = notes;
    if (priority !== undefined) item.priority = priority;
    if (tags !== undefined) item.tags = tags;
    if (isCompleted !== undefined) {
      item.isCompleted = isCompleted;
      item.completedAt = isCompleted ? new Date() : null;
    }

    await item.save();

    res.json({
      success: true,
      message: 'Bucket list item updated successfully',
      data: {
        item,
      },
    });
  } catch (error) {
    console.error('Error updating bucket list item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message,
    });
  }
});

// @route   DELETE /api/bucketlist/:id
// @desc    Delete bucket list item
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await BucketListItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Bucket list item not found.',
      });
    }

    // Check if user owns this item
    if (item.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item.',
      });
    }

    await BucketListItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Bucket list item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting bucket list item:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message,
    });
  }
});

export default router;

