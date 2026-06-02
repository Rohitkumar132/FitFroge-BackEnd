import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  const page  = Math.max(1, parseInt((req.query.page as string) || '1'));
  const limit = 10;
  const skip  = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId, isActive: true })
      .sort({ helpful: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ product: req.params.productId, isActive: true }),
  ]);

  sendSuccess(res, reviews, 'Reviews fetched', 200, {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { rating, title, comment } = req.body;
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    sendError(res, 'Product not found', 404);
    return;
  }

  const existing = await Review.findOne({ product: productId, user: req.user?.userId });
  if (existing) {
    sendError(res, 'You have already reviewed this product', 409);
    return;
  }

  const review = await Review.create({
    product: productId,
    user: req.user?.userId,
    userName: req.body.userName || 'Anonymous',
    rating,
    title,
    comment,
    verified: true,
  });

  // Recalculate product rating
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), isActive: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviews: stats[0].count,
    });
  }

  sendSuccess(res, review, 'Review added', 201);
};

export const markHelpful = async (req: AuthRequest, res: Response): Promise<void> => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    sendError(res, 'Review not found', 404);
    return;
  }

  const userId = req.user?.userId as string;
  const hasVoted = review.helpfulVotes.some(id => id.toString() === userId);

  if (hasVoted) {
    sendError(res, 'You have already marked this as helpful', 400);
    return;
  }

  review.helpfulVotes.push(new mongoose.Types.ObjectId(userId) as unknown as typeof review.helpfulVotes[0]);
  review.helpful += 1;
  await review.save();

  sendSuccess(res, { helpful: review.helpful }, 'Marked as helpful');
};
