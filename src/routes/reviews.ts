import { Router } from 'express';
import { body } from 'express-validator';
import { getProductReviews, createReview, markHelpful } from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router({ mergeParams: true });

router.get('/', getProductReviews);

router.post(
  '/',
  authenticate,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
    body('title').trim().notEmpty().withMessage('Review title required'),
    body('comment').trim().isLength({ min: 10 }).withMessage('Comment must be at least 10 chars'),
  ],
  validate,
  createReview
);

router.post('/:reviewId/helpful', authenticate, markHelpful);

export default router;
