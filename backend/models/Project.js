import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    icon: {
      type: String,
      default: '🚀',
      trim: true,
    },
    stack: {
      type: [String],
      default: [],
    },
    github: {
      type: String,
      default: '#',
      trim: true,
    },
    live: {
      type: String,
      default: '#',
      trim: true,
    },
    featured: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;
