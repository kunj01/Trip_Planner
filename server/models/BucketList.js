import mongoose from 'mongoose';

const bucketListItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
bucketListItemSchema.index({ user: 1, createdAt: -1 });
bucketListItemSchema.index({ user: 1, isCompleted: 1 });

const BucketListItem = mongoose.model('BucketListItem', bucketListItemSchema);

export default BucketListItem;

