import mongoose from 'mongoose';

const itinerarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() {
        return !this.isSample;
      },
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: function() {
        return `Trip to ${this.destination}`;
      },
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    tripType: {
      type: String,
    },
    budget: {
      type: String,
    },
    activityLevel: {
      type: String,
    },
    travelGroup: {
      type: String,
    },
    interests: {
      type: [String],
      default: [],
    },
    itinerary: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    selectedRecommendations: {
      type: [String],
      default: [],
    },
    isSample: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
itinerarySchema.index({ user: 1, createdAt: -1 });
itinerarySchema.index({ isSample: 1 });

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

export default Itinerary;

