import { Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import {
  BMIRecord,
  Blog,
  Category,
  Challenge,
  CommunityPost,
  DietPlan,
  FoodLog,
  Progress,
  Subscription,
  Testimonial,
  Trainer,
  Workout,
  WorkoutVideo,
} from '../models/Fitness';

const toPage = (value: unknown) => Math.max(1, parseInt(String(value || '1'), 10));
const toLimit = (value: unknown) => Math.min(50, Math.max(1, parseInt(String(value || '12'), 10)));

type AnyModel = Model<any>;

const list = async <T>(model: Model<T>, req: Request, res: Response, filter: Record<string, unknown> = {}) => {
  const page = toPage(req.query.page);
  const limit = toLimit(req.query.limit);
  const [items, total] = await Promise.all([
    model.find({ isActive: true, ...filter }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    model.countDocuments({ isActive: true, ...filter }),
  ]);
  sendPaginated(res, items as T[], total, page, limit);
};

export const getHome = async (_req: Request, res: Response): Promise<void> => {
  const [workouts, categories, trainers, dietPlans, testimonials, subscriptions, blogs, challenges] = await Promise.all([
    Workout.find({ isActive: true, isFeatured: true }).populate('trainer').limit(8).lean(),
    Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
    Trainer.find({ isActive: true, isFeatured: true }).limit(4).lean(),
    DietPlan.find({ isActive: true, isFeatured: true }).limit(4).lean(),
    Testimonial.find({ isActive: true }).limit(6).lean(),
    Subscription.find({ isActive: true }).sort({ price: 1 }).lean(),
    Blog.find({ isActive: true, isFeatured: true }).sort({ views: -1 }).limit(3).lean(),
    Challenge.find({ isActive: true }).limit(3).lean(),
  ]);
  sendSuccess(res, { workouts, categories, trainers, dietPlans, testimonials, subscriptions, blogs, challenges });
};

export const getWorkouts = async (req: Request, res: Response): Promise<void> => {
  const filter: Record<string, unknown> = {};
  ['category', 'difficulty', 'goal'].forEach(key => {
    if (req.query[key]) filter[key] = req.query[key];
  });
  if (req.query.q) filter.$text = { $search: String(req.query.q) };
  await list(Workout, req, res, filter);
};

export const getWorkoutBySlug = async (req: Request, res: Response): Promise<void> => {
  const workout = await Workout.findOne({ slug: req.params.slug, isActive: true }).populate('trainer').populate('video');
  if (!workout) {
    sendError(res, 'Workout not found', 404);
    return;
  }
  sendSuccess(res, workout);
};

export const getVideos = async (req: Request, res: Response): Promise<void> => {
  const filter: Record<string, unknown> = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;
  await list(WorkoutVideo, req, res, filter);
};

export const getDietPlans = async (req: Request, res: Response): Promise<void> => {
  const filter: Record<string, unknown> = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.goal) filter.goal = req.query.goal;
  await list(DietPlan, req, res, filter);
};

export const getTrainers = async (req: Request, res: Response): Promise<void> => list(Trainer, req, res);
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  const filter: Record<string, unknown> = {};
  if (req.query.type) filter.type = req.query.type;
  await list(Category, req, res, filter);
};
export const getTestimonials = async (req: Request, res: Response): Promise<void> => list(Testimonial, req, res);
export const getSubscriptions = async (req: Request, res: Response): Promise<void> => list(Subscription, req, res);
export const getChallenges = async (req: Request, res: Response): Promise<void> => list(Challenge, req, res);

export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  const filter: Record<string, unknown> = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.q) filter.$text = { $search: String(req.query.q) };
  await list(Blog, req, res, filter);
};

export const getBlogBySlug = async (req: Request, res: Response): Promise<void> => {
  const blog = await Blog.findOneAndUpdate({ slug: req.params.slug, isActive: true }, { $inc: { views: 1 } }, { new: true });
  if (!blog) {
    sendError(res, 'Blog not found', 404);
    return;
  }
  sendSuccess(res, blog);
};

export const getCommunityPosts = async (req: Request, res: Response): Promise<void> => {
  const filter: Record<string, unknown> = {};
  if (req.query.type) filter.type = req.query.type;
  await list(CommunityPost, req, res, filter);
};

export const createCommunityPost = async (req: AuthRequest, res: Response): Promise<void> => {
  const post = await CommunityPost.create({ ...req.body, author: req.user?.userId });
  sendSuccess(res, post, 'Community post created', 201);
};

export const likeCommunityPost = async (req: AuthRequest, res: Response): Promise<void> => {
  const post = await CommunityPost.findById(req.params.id);
  if (!post) {
    sendError(res, 'Post not found', 404);
    return;
  }
  const userId = new mongoose.Types.ObjectId(req.user?.userId);
  const exists = post.likes.some(id => id.toString() === userId.toString());
  post.likes = exists ? post.likes.filter(id => id.toString() !== userId.toString()) : [...post.likes, userId];
  await post.save();
  sendSuccess(res, post, exists ? 'Like removed' : 'Post liked');
};

export const addCommunityComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const post = await CommunityPost.findById(req.params.id);
  if (!post) {
    sendError(res, 'Post not found', 404);
    return;
  }
  post.comments.push({ user: new mongoose.Types.ObjectId(req.user?.userId), text: req.body.text, createdAt: new Date() });
  await post.save();
  sendSuccess(res, post, 'Comment added');
};

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [progress, bmiRecords, foodLogs, savedWorkouts] = await Promise.all([
    Progress.find({ user: userId }).populate('workout').sort({ completedAt: -1 }).limit(12).lean(),
    BMIRecord.find({ user: userId }).sort({ createdAt: -1 }).limit(12).lean(),
    FoodLog.find({ user: userId, date: { $gte: since } }).sort({ date: -1 }).lean(),
    Workout.find({ isActive: true }).limit(4).lean(),
  ]);

  const caloriesBurned = progress.reduce((sum, item) => sum + item.caloriesBurned, 0);
  const workoutsCompleted = progress.length;
  const streak = calculateStreak(progress.map(item => item.completedAt));
  const caloriesLogged = foodLogs.reduce((sum, item) => sum + item.calories, 0);

  sendSuccess(res, {
    stats: { workoutsCompleted, caloriesBurned, streak, caloriesLogged },
    progress,
    bmiRecords,
    foodLogs,
    recommendations: savedWorkouts,
  });
};

export const completeWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  const progress = await Progress.create({ ...req.body, user: req.user?.userId });
  sendSuccess(res, progress, 'Workout marked complete', 201);
};

export const createBMIRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  const { heightCm, weightKg, age, gender } = req.body;
  const bmi = Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1));
  const status = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy' : bmi < 30 ? 'Overweight' : 'Obese';
  const suggestion =
    status === 'Healthy'
      ? 'Maintain your current habits with strength training and balanced macros.'
      : 'Pair progressive training with a sustainable calorie target and weekly check-ins.';
  const record = await BMIRecord.create({ user: req.user?.userId, heightCm, weightKg, age, gender, bmi, status, suggestion });
  sendSuccess(res, record, 'BMI calculated', 201);
};

export const createFoodLog = async (req: AuthRequest, res: Response): Promise<void> => {
  const log = await FoodLog.create({ ...req.body, user: req.user?.userId });
  sendSuccess(res, log, 'Food logged', 201);
};

export const getAiRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.userId);
  const goal = req.body.goal || user?.goal || 'general_fitness';
  const level = req.body.fitnessLevel || user?.fitnessLevel || 'beginner';
  const equipment = req.body.equipmentAccess || user?.equipmentAccess || [];

  const category = equipment.includes('dumbbells') || equipment.includes('barbell') ? 'strength-training' : 'home-workout';
  const workouts = await Workout.find({ isActive: true, difficulty: level, $or: [{ goal }, { category }] }).limit(6).lean();
  const dietPlans = await DietPlan.find({ isActive: true, goal }).limit(3).lean();

  sendSuccess(res, {
    engine: 'rule-based-v1',
    futureProvider: 'openai-ready',
    summary: `Built for ${level} level with a ${goal.replace('_', ' ')} goal.`,
    workouts,
    dietPlans,
  });
};

export const createDummyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  sendSuccess(res, {
    provider: 'razorpay',
    mode: 'test-dummy',
    orderId: `rzp_test_${Date.now()}`,
    amount: req.body.amount,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  }, 'Dummy Razorpay order created', 201);
};

export const getAdminAnalytics = async (_req: Request, res: Response): Promise<void> => {
  const [users, trainers, workouts, videos, dietPlans, posts, blogs, challenges] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Trainer.countDocuments({ isActive: true }),
    Workout.countDocuments({ isActive: true }),
    WorkoutVideo.countDocuments({ isActive: true }),
    DietPlan.countDocuments({ isActive: true }),
    CommunityPost.countDocuments({ isActive: true }),
    Blog.countDocuments({ isActive: true }),
    Challenge.countDocuments({ isActive: true }),
  ]);
  sendSuccess(res, { users, trainers, workouts, videos, dietPlans, posts, blogs, challenges });
};

const adminModels: Record<string, AnyModel> = {
  workouts: Workout,
  videos: WorkoutVideo,
  trainers: Trainer,
  users: User,
  testimonials: Testimonial,
  blogs: Blog,
  subscriptions: Subscription,
  categories: Category,
  challenges: Challenge,
  dietPlans: DietPlan,
};

export const adminList = async (req: Request, res: Response): Promise<void> => {
  const model = adminModels[req.params.resource];
  if (!model) {
    sendError(res, 'Unknown admin resource', 404);
    return;
  }
  await list(model, req, res, {});
};

export const adminCreate = async (req: Request, res: Response): Promise<void> => {
  const model = adminModels[req.params.resource];
  if (!model) {
    sendError(res, 'Unknown admin resource', 404);
    return;
  }
  const item = await model.create(req.body);
  sendSuccess(res, item, 'Resource created', 201);
};

export const adminUpdate = async (req: Request, res: Response): Promise<void> => {
  const model = adminModels[req.params.resource];
  if (!model) {
    sendError(res, 'Unknown admin resource', 404);
    return;
  }
  const item = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) {
    sendError(res, 'Resource not found', 404);
    return;
  }
  sendSuccess(res, item, 'Resource updated');
};

export const adminDelete = async (req: Request, res: Response): Promise<void> => {
  const model = adminModels[req.params.resource];
  if (!model) {
    sendError(res, 'Unknown admin resource', 404);
    return;
  }
  await model.findByIdAndUpdate(req.params.id, { isActive: false });
  sendSuccess(res, null, 'Resource archived');
};

const calculateStreak = (dates: Date[]) => {
  const days = new Set(dates.map(date => new Date(date).toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};
