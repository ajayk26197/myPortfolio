import express from 'express';
import Project from '../models/Project.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/projects (Public - Visitors & Admin)
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message,
    });
  }
});

// GET /api/projects/:id (Public)
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }
    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Error fetching project:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message,
    });
  }
});

// POST /api/projects (Protected - Admin Only)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, icon, stack, github, live, featured, order } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
    }

    const newProject = await Project.create({
      title: title.trim(),
      description: description.trim(),
      icon: icon ? icon.trim() : '🚀',
      stack: Array.isArray(stack)
        ? stack
        : typeof stack === 'string'
        ? stack.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      github: github ? github.trim() : '#',
      live: live ? live.trim() : '#',
      featured: featured !== undefined ? featured : true,
      order: order !== undefined ? Number(order) : 0,
    });

    res.status(201).json({
      success: true,
      message: 'Project added successfully',
      data: newProject,
    });
  } catch (error) {
    console.error('Error creating project:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message,
    });
  }
});

// PUT /api/projects/:id (Protected - Admin Only)
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, icon, stack, github, live, featured, order } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (title !== undefined) project.title = title.trim();
    if (description !== undefined) project.description = description.trim();
    if (icon !== undefined) project.icon = icon.trim();
    if (stack !== undefined) {
      project.stack = Array.isArray(stack)
        ? stack
        : typeof stack === 'string'
        ? stack.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    }
    if (github !== undefined) project.github = github.trim();
    if (live !== undefined) project.live = live.trim();
    if (featured !== undefined) project.featured = featured;
    if (order !== undefined) project.order = Number(order);

    const updatedProject = await project.save();

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject,
    });
  } catch (error) {
    console.error('Error updating project:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message,
    });
  }
});

// DELETE /api/projects/:id (Protected - Admin Only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    console.error('Error deleting project:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message,
    });
  }
});

export default router;
