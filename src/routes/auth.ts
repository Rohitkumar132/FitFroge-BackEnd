import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, updateProfile, verifyEmail, forgotPassword, resetPassword } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['user', 'trainer']).withMessage('Invalid role'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email required'), body('password').notEmpty()],
  validate,
  login
);

router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateProfile);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', [body('email').isEmail().normalizeEmail()], validate, forgotPassword);
router.post('/reset-password/:token', [body('password').isLength({ min: 6 })], validate, resetPassword);

export default router;
