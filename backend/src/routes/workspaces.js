const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Workspace = require('../models/Workspace');

// Get all workspaces for authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const workspaces = await Workspace.findByUserId(req.user.id);
    res.json(workspaces);
  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get workspace by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user owns this workspace
    if (workspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(workspace);
  } catch (error) {
    console.error('Get workspace error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new workspace
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { id, name, description, color } = req.body;

    if (!id || !name) {
      return res.status(400).json({ message: 'ID and name are required' });
    }

    // Check if workspace ID already exists
    if (await Workspace.exists(id)) {
      return res.status(400).json({ message: 'Workspace ID already exists' });
    }

    const workspace = new Workspace({
      id,
      name,
      description,
      color,
      user_id: req.user.id
    });

    await workspace.save();
    res.status(201).json({ message: 'Workspace created successfully', id });
  } catch (error) {
    console.error('Create workspace error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update workspace
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user owns this workspace
    if (workspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const updatedWorkspace = new Workspace({
      id: req.params.id,
      name,
      description,
      color
    });

    await updatedWorkspace.update();
    res.json({ message: 'Workspace updated successfully' });
  } catch (error) {
    console.error('Update workspace error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete workspace
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user owns this workspace
    if (workspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Workspace.delete(req.params.id);
    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('Delete workspace error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;