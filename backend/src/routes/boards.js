const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Board = require('../models/Board');
const Workspace = require('../models/Workspace');

// Get all boards for a workspace
router.get('/workspace/:workspaceId', authMiddleware, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user owns this workspace
    if (workspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const boards = await Board.findByWorkspaceId(req.params.workspaceId);
    res.json(boards);
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get board by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user owns the workspace this board belongs to
    const workspace = await Workspace.findById(board.workspace_id);
    if (!workspace || workspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(board);
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new board
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { id, title, description, workspace_id } = req.body;

    if (!id || !title || !workspace_id) {
      return res.status(400).json({ message: 'ID, title, and workspace_id are required' });
    }

    // Check if user owns the workspace
    const workspace = await Workspace.findById(workspace_id);
    if (!workspace || workspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if board ID already exists
    if (await Board.exists(id)) {
      return res.status(400).json({ message: 'Board ID already exists' });
    }

    const board = new Board({
      id,
      title,
      description,
      workspace_id
    });

    await board.save();
    res.status(201).json({ message: 'Board created successfully', id });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update board
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user owns the workspace this board belongs to
    const workspace = await Workspace.findById(board.workspace_id);
    if (!workspace || workspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const updatedBoard = new Board({
      id: req.params.id,
      title,
      description
    });

    await updatedBoard.update();
    res.json({ message: 'Board updated successfully' });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete board
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user owns the workspace this board belongs to
    const workspace = await Workspace.findById(board.workspace_id);
    if (!workspace || workspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Board.delete(req.params.id);
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;