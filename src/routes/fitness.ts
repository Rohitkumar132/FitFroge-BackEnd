import { Router } from 'express';
import { body } from 'express-validator';
import {
  addCommunityComment,
  adminCreate,
  adminDelete,
  adminList,
  adminUpdate,
  completeWorkout,
  createBMIRecord,
  createCommunityPost,
  createDummyPayment,
  createFoodLog,
  getAdminAnalytics,
  getAiRecommendations,
  getBlogBySlug,
  getBlogs,
  getCategories,
  getChallenges,
  getCommunityPosts,
  getDashboard,
  getDietPlans,
  getHome,
  getSubscriptions,
  getTestimonials,
  getTrainers,
  getVideos,
  getWorkoutBySlug,
  getWorkouts,
  likeCommunityPost,
} from '../controllers/fitnessController';
import { authenticate, requireAdmin, requireTrainerOrAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/home', getHome);
router.get('/workouts', getWorkouts);
router.get('/workouts/:slug', getWorkoutBySlug);
router.get('/videos', getVideos);
router.get('/diet-plans', getDietPlans);
router.get('/trainers', getTrainers);
router.get('/categories', getCategories);
router.get('/testimonials', getTestimonials);
router.get('/subscriptions', getSubscriptions);
router.get('/challenges', getChallenges);
router.get('/blogs', getBlogs);
router.get('/blogs/:slug', getBlogBySlug);
router.get('/community', getCommunityPosts);

router.get('/dashboard', authenticate, getDashboard);
router.post('/progress/complete', authenticate, completeWorkout);
router.post('/bmi', authenticate, [body('heightCm').isNumeric(), body('weightKg').isNumeric()], validate, createBMIRecord);
router.post('/food-logs', authenticate, createFoodLog);
router.post('/ai/recommendations', authenticate, getAiRecommendations);
router.post('/payments/razorpay/order', authenticate, createDummyPayment);
router.post('/community', authenticate, createCommunityPost);
router.post('/community/:id/like', authenticate, likeCommunityPost);
router.post('/community/:id/comments', authenticate, [body('text').trim().notEmpty()], validate, addCommunityComment);

router.get('/trainer/clients', authenticate, requireTrainerOrAdmin, getDashboard);
router.get('/admin/analytics', authenticate, requireAdmin, getAdminAnalytics);
router.get('/admin/:resource', authenticate, requireAdmin, adminList);
router.post('/admin/:resource', authenticate, requireAdmin, adminCreate);
router.put('/admin/:resource/:id', authenticate, requireAdmin, adminUpdate);
router.delete('/admin/:resource/:id', authenticate, requireAdmin, adminDelete);

export default router;
