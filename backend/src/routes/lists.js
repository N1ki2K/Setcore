const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const List = require('../models/List');
const Board = require('../models/Board');
const Workspace = require('../models/Workspace');

// Get all lists for a board
router.get('/board/:boardId', authMiddleware, async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user owns the workspace this board belongs to
    const workspace = await Workspace.findById(board.workspace_id);
    if (!workspace || workspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const lists = await List.findByBoardId(req.params.boardId);
    res.json(lists);
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get list by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Check if user owns the workspace this list belongs to
    const board = await Board.findById(list.board_id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const workspace = await Workspace.findById(board.workspace_id);
    if (!workspace || workspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(list);
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new list
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { id, title, board_id, position } = req.body;

    if (!id || !title || !board_id) {
      return res.status(400).json({ message: 'ID, title, and board_id are required' });
    }

    // Check if user owns the workspace this board belongs to
    const board = await Board.findById(board_id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const workspace = await Workspace.findById(board.workspace_id);
    if (!workspace || workspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if list ID already exists
    if (await List.exists(id)) {
      return res.status(400).json({ message: 'List ID already exists' });
    }

    const list = new List({
      id,
      title,
      board_id,
      position
    });

    await list.save();
    res.status(201).json({ message: 'List created successfully', id });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update list
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Check if user owns the workspace this list belongs to
    const board = await Board.findById(list.board_id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const workspace = await Workspace.findById(board.workspace_id);
    if (!workspace || workspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, position } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const updatedList = new List({
      id: req.params.id,
      title,
      position: position !== undefined ? position : list.position
    });

    await updatedList.update();
    res.json({ message: 'List updated successfully' });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update multiple list positions
router.put('/positions/batch', authMiddleware, async (req, res) => {
  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ message: 'Updates array is required' });
    }

    // Verify user owns all lists being updated
    for (const update of updates) {
      const list = await List.findById(update.id);
      if (!list) {
        return res.status(404).json({ message: `List ${update.id} not found` });
      }

      const board = await Board.findById(list.board_id);
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const workspace = await Workspace.findById(board.workspace_id);
      if (!workspace || workspace.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    await List.updatePositions(updates);
    res.json({ message: 'List positions updated successfully' });
  } catch (error) {
    console.error('Update list positions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete list
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Check if user owns the workspace this list belongs to
    const board = await Board.findById(list.board_id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const workspace = await Workspace.findById(board.workspace_id);
    if (!workspace || workspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await List.delete(req.params.id);
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;