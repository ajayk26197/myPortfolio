import mongoose from 'mongoose';

const viewCounterSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'portfolio',
      unique: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    lastVisitedAt: {
      type: Date,
      default: Date.now,
    },
    firstVisitedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const ViewCounter = mongoose.model('ViewCounter', viewCounterSchema);

export default ViewCounter;
