const express = require('express');
const router = express.Router();
const { register, login, getProfile, verifyToken } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { registerValidation, loginValidation, handleValidationErrors } = require('../middleware/validation');

router.post('/register', registerValidation, handleValidationErrors, register);

router.post('/login', loginValidation, handleValidationErrors, login);

router.get('/profile', authMiddleware, getProfile);

router.get('/verify', authMiddleware, verifyToken);

module.exports = router;