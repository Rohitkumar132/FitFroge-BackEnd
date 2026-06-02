import mongoose, { Document, Schema } from 'mongoose';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type VideoProvider = 'youtube' | 'cloudinary';

export interface ICategory extends Document {
  name: string;
  slug: string;
  type: 'workout' | 'diet' | 'blog' | 'challenge';
  icon: string;
  image: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ITrainer extends Document {
  name: string;
  email: string;
  title: string;
  bio: string;
  avatar: string;
  specialties: string[];
  experienceYears: number;
  certifications: string[];
  rating: number;
  clientsCount: number;
  isFeatured: boolean;
  isActive: boolean;
}

export interface IWorkout extends Document {
  title: string;
  slug: string;
  category: string;
  goal: string;
  thumbnail: string;
  difficulty: Difficulty;
  durationMinutes: number;
  caloriesBurned: number;
  description: string;
  trainer?: mongoose.Types.ObjectId;
  equipment: string[];
  targetMuscles: string[];
  exercises: {
    name: string;
    sets: number;
    reps: string;
    restSeconds: number;
    steps: string[];
  }[];
  video?: mongoose.Types.ObjectId;
  isFeatured: boolean;
  isPremium: boolean;
  isActive: boolean;
}

export interface IWorkoutVideo extends Document {
  title: string;
  slug: string;
  provider: VideoProvider;
  url: string;
  thumbnail: string;
  category: string;
  trainer?: mongoose.Types.ObjectId;
  durationMinutes: number;
  difficulty: Difficulty;
  tags: string[];
  isActive: boolean;
}

export interface IDietPlan extends Document {
  title: string;
  slug: string;
  category: string;
  image: string;
  goal: string;
  calories: number;
  macros: { protein: number; carbs: number; fats: number };
  meals: { name: string; time: string; calories: number; items: string[] }[];
  tips: string[];
  trainer?: mongoose.Types.ObjectId;
  isFeatured: boolean;
  isActive: boolean;
}

export interface IProgress extends Document {
  user: mongoose.Types.ObjectId;
  workout: mongoose.Types.ObjectId;
  completedAt: Date;
  durationMinutes: number;
  caloriesBurned: number;
  exercises: { name: string; sets: number; reps: string; weightKg?: number }[];
}

export interface IBMIRecord extends Document {
  user: mongoose.Types.ObjectId;
  heightCm: number;
  weightKg: number;
  age?: number;
  gender?: string;
  bmi: number;
  status: string;
  suggestion: string;
}

export interface IFoodLog extends Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface IChallenge extends Document {
  title: string;
  slug: string;
  image: string;
  description: string;
  category: string;
  startDate: Date;
  endDate: Date;
  participants: mongoose.Types.ObjectId[];
  rewards: string[];
  isActive: boolean;
}

export interface ICommunityPost extends Document {
  author: mongoose.Types.ObjectId;
  type: 'post' | 'transformation';
  title: string;
  content: string;
  image?: string;
  beforeImage?: string;
  afterImage?: string;
  likes: mongoose.Types.ObjectId[];
  saves: mongoose.Types.ObjectId[];
  comments: { user: mongoose.Types.ObjectId; text: string; createdAt: Date }[];
  isActive: boolean;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  authorName: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  readMinutes: number;
  views: number;
  isFeatured: boolean;
  isActive: boolean;
}

export interface ISubscription extends Document {
  name: string;
  slug: string;
  price: number;
  interval: 'monthly' | 'quarterly' | 'yearly';
  features: string[];
  razorpayPlanId?: string;
  isPopular: boolean;
  isActive: boolean;
}

export interface ITestimonial extends Document {
  name: string;
  role: string;
  image: string;
  quote: string;
  rating: number;
  metric: string;
  isActive: boolean;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    type: { type: String, enum: ['workout', 'diet', 'blog', 'challenge'], required: true, index: true },
    icon: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const trainerSchema = new Schema<ITrainer>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    title: { type: String, required: true },
    bio: { type: String, required: true },
    avatar: { type: String, required: true },
    specialties: [{ type: String }],
    experienceYears: { type: Number, default: 1 },
    certifications: [{ type: String }],
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    clientsCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const workoutSchema = new Schema<IWorkout>(
  {
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: { type: String, required: true, index: true },
    goal: { type: String, required: true, index: true },
    thumbnail: { type: String, required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true, index: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    caloriesBurned: { type: Number, required: true, min: 1 },
    description: { type: String, required: true },
    trainer: { type: Schema.Types.ObjectId, ref: 'Trainer' },
    equipment: [{ type: String }],
    targetMuscles: [{ type: String }],
    exercises: [
      {
        name: { type: String, required: true },
        sets: { type: Number, required: true },
        reps: { type: String, required: true },
        restSeconds: { type: Number, default: 45 },
        steps: [{ type: String }],
      },
    ],
    video: { type: Schema.Types.ObjectId, ref: 'WorkoutVideo' },
    isFeatured: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);
workoutSchema.index({ title: 'text', description: 'text', category: 'text', goal: 'text', targetMuscles: 'text' });

const workoutVideoSchema = new Schema<IWorkoutVideo>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    provider: { type: String, enum: ['youtube', 'cloudinary'], required: true },
    url: { type: String, required: true },
    thumbnail: { type: String, required: true },
    category: { type: String, required: true, index: true },
    trainer: { type: Schema.Types.ObjectId, ref: 'Trainer' },
    durationMinutes: { type: Number, required: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const dietPlanSchema = new Schema<IDietPlan>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: { type: String, required: true, index: true },
    image: { type: String, required: true },
    goal: { type: String, required: true },
    calories: { type: Number, required: true },
    macros: {
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fats: { type: Number, required: true },
    },
    meals: [
      {
        name: String,
        time: String,
        calories: Number,
        items: [String],
      },
    ],
    tips: [{ type: String }],
    trainer: { type: Schema.Types.ObjectId, ref: 'Trainer' },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const progressSchema = new Schema<IProgress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workout: { type: Schema.Types.ObjectId, ref: 'Workout', required: true },
    completedAt: { type: Date, default: Date.now, index: true },
    durationMinutes: { type: Number, required: true },
    caloriesBurned: { type: Number, required: true },
    exercises: [
      {
        name: String,
        sets: Number,
        reps: String,
        weightKg: Number,
      },
    ],
  },
  { timestamps: true }
);

const bmiRecordSchema = new Schema<IBMIRecord>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    heightCm: { type: Number, required: true },
    weightKg: { type: Number, required: true },
    age: Number,
    gender: String,
    bmi: { type: Number, required: true },
    status: { type: String, required: true },
    suggestion: { type: String, required: true },
  },
  { timestamps: true }
);

const foodLogSchema = new Schema<IFoodLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, default: Date.now, index: true },
    mealType: { type: String, enum: ['breakfast', 'lunch', 'snack', 'dinner'], required: true },
    foodName: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const challengeSchema = new Schema<IChallenge>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    rewards: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const communityPostSchema = new Schema<ICommunityPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['post', 'transformation'], default: 'post', index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: String,
    beforeImage: String,
    afterImage: String,
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    saves: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, required: true },
    category: { type: String, required: true, index: true },
    authorName: { type: String, required: true },
    tags: [{ type: String }],
    seoTitle: { type: String, required: true },
    seoDescription: { type: String, required: true },
    readMinutes: { type: Number, default: 5 },
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });

const subscriptionSchema = new Schema<ISubscription>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    price: { type: Number, required: true },
    interval: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },
    features: [{ type: String }],
    razorpayPlanId: String,
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    image: { type: String, required: true },
    quote: { type: String, required: true },
    rating: { type: Number, default: 5 },
    metric: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', categorySchema);
export const Trainer = mongoose.model<ITrainer>('Trainer', trainerSchema);
export const Workout = mongoose.model<IWorkout>('Workout', workoutSchema);
export const WorkoutVideo = mongoose.model<IWorkoutVideo>('WorkoutVideo', workoutVideoSchema);
export const DietPlan = mongoose.model<IDietPlan>('DietPlan', dietPlanSchema);
export const Progress = mongoose.model<IProgress>('Progress', progressSchema);
export const BMIRecord = mongoose.model<IBMIRecord>('BMIRecord', bmiRecordSchema);
export const FoodLog = mongoose.model<IFoodLog>('FoodLog', foodLogSchema);
export const Challenge = mongoose.model<IChallenge>('Challenge', challengeSchema);
export const CommunityPost = mongoose.model<ICommunityPost>('CommunityPost', communityPostSchema);
export const Blog = mongoose.model<IBlog>('Blog', blogSchema);
export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
export const Testimonial = mongoose.model<ITestimonial>('Testimonial', testimonialSchema);
