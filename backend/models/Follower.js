import mongoose from 'mongoose';

const followerSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    photoURL: {
      type: String,
      default: '',
    },
    followedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Follower = mongoose.model('Follower', followerSchema);

export default Follower;
