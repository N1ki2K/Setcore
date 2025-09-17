const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('first_name')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('First name can only contain letters and spaces'),

  body('last_name')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('Last name can only contain letters and spaces'),
];

const loginValidation = [
  body('email')
    .custom((value) => {
      // Allow either email format or username format
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isUsername = /^[a-zA-Z0-9_]+$/.test(value);
      return isEmail || isUsername;
    })
    .withMessage('Please provide a valid email address or username'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation
};