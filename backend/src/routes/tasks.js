const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Task = require('../models/Task');
const List = require('../models/List');
const Board = require('../models/Board');
const Workspace = require('../models/Workspace');

// Get all tasks for a list
router.get('/list/:listId', authMiddleware, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
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

    const tasks = await Task.findByListId(req.params.listId);
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get task by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user owns the workspace this task belongs to
    const list = await List.findById(task.list_id);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const board = await Board.findById(list.board_id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const workspace = await Workspace.findById(board.workspace_id);
    if (!workspace || workspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { id, title, description, priority, assignee, list_id, position } = req.body;

    if (!id || !title || !list_id) {
      return res.status(400).json({ message: 'ID, title, and list_id are required' });
    }

    // Check if user owns the workspace this list belongs to
    const list = await List.findById(list_id);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const board = await Board.findById(list.board_id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const workspace = await Workspace.findById(board.workspace_id);
    if (!workspace || workspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if task ID already exists
    if (await Task.exists(id)) {
      return res.status(400).json({ message: 'Task ID already exists' });
    }

    const task = new Task({
      id,
      title,
      description,
      priority,
      assignee,
      list_id,
      position
    });

    await task.save();
    res.status(201).json({ message: 'Task created successfully', id });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update task
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user owns the workspace this task belongs to
    const list = await List.findById(task.list_id);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const board = await Board.findById(list.board_id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const workspace = await Workspace.findById(board.workspace_id);
    if (!workspace || workspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, priority, assignee, position } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const updatedTask = new Task({
      id: req.params.id,
      title,
      description,
      priority,
      assignee,
      position: position !== undefined ? position : task.position
    });

    await updatedTask.update();
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update multiple task positions or move tasks between lists
router.put('/positions/batch', authMiddleware, async (req, res) => {
  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ message: 'Updates array is required' });
    }

    // Verify user owns all tasks being updated
    for (const update of updates) {
      const task = await Task.findById(update.id);
      if (!task) {
        return res.status(404).json({ message: `Task ${update.id} not found` });
      }

      const list = await List.findById(task.list_id);
      if (!list) {
        return res.status(404).json({ message: 'List not found' });
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

    await Task.updatePositions(updates);
    res.json({ message: 'Task positions updated successfully' });
  } catch (error) {
    console.error('Update task positions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Move task to different list
router.put('/:id/move', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { new_list_id, position } = req.body;

    if (!new_list_id) {
      return res.status(400).json({ message: 'new_list_id is required' });
    }

    // Check if user owns both the original and target lists
    const originalList = await List.findById(task.list_id);
    const targetList = await List.findById(new_list_id);

    if (!originalList || !targetList) {
      return res.status(404).json({ message: 'List not found' });
    }

    const originalBoard = await Board.findById(originalList.board_id);
    const targetBoard = await Board.findById(targetList.board_id);

    if (!originalBoard || !targetBoard) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const originalWorkspace = await Workspace.findById(originalBoard.workspace_id);
    const targetWorkspace = await Workspace.findById(targetBoard.workspace_id);

    if (!originalWorkspace || !targetWorkspace ||
        originalWorkspace.user_id !== req.user.id ||
        targetWorkspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Task.moveToList(req.params.id, new_list_id, position || 0);
    res.json({ message: 'Task moved successfully' });
  } catch (error) {
    console.error('Move task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user owns the workspace this task belongs to
    const list = await List.findById(task.list_id);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const board = await Board.findById(list.board_id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const workspace = await Workspace.findById(board.workspace_id);
    if (!workspace || workspace.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Task.delete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;