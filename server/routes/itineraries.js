import express from 'express';
import jwt from 'jsonwebtoken';
import Itinerary from '../models/Itinerary.js';

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

// @route   GET /api/itineraries/samples
// @desc    Get sample itineraries (public)
// @access  Public
router.get('/samples', async (req, res) => {
  try {
    const sampleItineraries = await Itinerary.find({ isSample: true })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: {
        itineraries: sampleItineraries,
      },
    });
  } catch (error) {
    console.error('Error fetching sample itineraries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message,
    });
  }
});

// @route   GET /api/itineraries
// @desc    Get user's saved itineraries
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ 
      user: req.userId,
      isSample: false 
    })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: {
        itineraries,
      },
    });
  } catch (error) {
    console.error('Error fetching user itineraries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message,
    });
  }
});

// @route   POST /api/itineraries
// @desc    Save/bookmark an itinerary
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      destination,
      title,
      startDate,
      endDate,
      tripType,
      budget,
      activityLevel,
      travelGroup,
      interests,
      itinerary,
      selectedRecommendations,
    } = req.body;

    if (!destination || !itinerary) {
      return res.status(400).json({
        success: false,
        message: 'Destination and itinerary data are required.',
      });
    }

    const newItinerary = await Itinerary.create({
      user: req.userId,
      destination,
      title: title || `Trip to ${destination}`,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      tripType,
      budget,
      activityLevel,
      travelGroup,
      interests: interests || [],
      itinerary,
      selectedRecommendations: selectedRecommendations || [],
      isSample: false,
    });

    res.status(201).json({
      success: true,
      message: 'Itinerary saved successfully',
      data: {
        itinerary: newItinerary,
      },
    });
  } catch (error) {
    console.error('Error saving itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message,
    });
  }
});

// @route   DELETE /api/itineraries/:id
// @desc    Delete a saved itinerary
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found.',
      });
    }

    // Check if user owns this itinerary
    if (itinerary.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this itinerary.',
      });
    }

    await Itinerary.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Itinerary deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message,
    });
  }
});

// @route   GET /api/itineraries/:id
// @desc    Get a specific itinerary
// @access  Private (or Public if sample)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found.',
      });
    }

    // Allow access if it's a sample or if user owns it
    if (!itinerary.isSample && itinerary.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this itinerary.',
      });
    }

    res.json({
      success: true,
      data: {
        itinerary,
      },
    });
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message,
    });
  }
});

export default router;

