const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const workspaceRoutes = require('./workspaces');
const boardRoutes = require('./boards');
const listRoutes = require('./lists');
const taskRoutes = require('./tasks');

router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/boards', boardRoutes);
router.use('/lists', listRoutes);
router.use('/tasks', taskRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Setcore API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;