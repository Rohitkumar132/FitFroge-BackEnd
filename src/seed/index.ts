import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { User } from '../models/User';
import {
  Blog,
  Category,
  Challenge,
  CommunityPost,
  DietPlan,
  Subscription,
  Testimonial,
  Trainer,
  Workout,
  WorkoutVideo,
} from '../models/Fitness';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI ?? '';

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in backend/.env');
  }

  await mongoose.connect(MONGODB_URI);
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Trainer.deleteMany({}),
    Workout.deleteMany({}),
    WorkoutVideo.deleteMany({}),
    DietPlan.deleteMany({}),
    Subscription.deleteMany({}),
    Testimonial.deleteMany({}),
    Blog.deleteMany({}),
    Challenge.deleteMany({}),
    CommunityPost.deleteMany({}),
  ]);

  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'Forge',
    email: 'admin@fitforge.com',
    password: 'admin@123456',
    role: 'admin',
    isEmailVerified: true,
  });

  const member = await User.create({
    firstName: 'Aarav',
    lastName: 'Mehta',
    email: 'member@fitforge.com',
    password: 'member@123456',
    goal: 'fat_loss',
    fitnessLevel: 'beginner',
    equipmentAccess: ['bodyweight', 'dumbbells'],
    preferredTraining: ['HIIT', 'Strength'],
    isEmailVerified: true,
  });

  await Category.insertMany([
    { name: 'Home Workout', slug: 'home-workout', type: 'workout', icon: 'Home', image: image('photo-1518611012118-696072aa579a'), description: 'No commute, no excuses. Train in compact spaces.', sortOrder: 1 },
    { name: 'Gym Workout', slug: 'gym-workout', type: 'workout', icon: 'Building2', image: image('photo-1534438327276-14e5300c3a48'), description: 'Machines, cables, barbells, and focused gym sessions.', sortOrder: 2 },
    { name: 'Strength Training', slug: 'strength-training', type: 'workout', icon: 'Dumbbell', image: image('photo-1581009146145-b5ef050c2e1e'), description: 'Progressive programs for muscle and power.', sortOrder: 3 },
    { name: 'Bodyweight Training', slug: 'bodyweight-training', type: 'workout', icon: 'PersonStanding', image: image('photo-1599058917212-d750089bc07e'), description: 'Calisthenics and body-control workouts anywhere.', sortOrder: 4 },
    { name: 'Cardio', slug: 'cardio', type: 'workout', icon: 'Activity', image: image('photo-1476480862126-209bfaa8edc8'), description: 'Conditioning sessions for stamina and heart health.', sortOrder: 5 },
    { name: 'HIIT', slug: 'hiit', type: 'workout', icon: 'Flame', image: image('photo-1517836357463-d25dfeac3438'), description: 'Fast conditioning blocks for fat loss.', sortOrder: 6 },
    { name: 'Yoga', slug: 'yoga', type: 'workout', icon: 'Leaf', image: image('photo-1544367567-0f2fcb009e0b'), description: 'Mobility, recovery, breath, and balance.', sortOrder: 7 },
    { name: 'Indian Diet', slug: 'indian-diet', type: 'diet', icon: 'Utensils', image: image('photo-1546069901-ba9599a7e63c'), description: 'Macro-aware Indian meals for real life.', sortOrder: 8 },
    { name: 'Fitness Science', slug: 'fitness-science', type: 'blog', icon: 'BookOpen', image: image('photo-1571019613454-1cb2f99b2d8b'), description: 'Evidence-led training and nutrition guides.', sortOrder: 9 },
  ]);

  const trainers = await Trainer.insertMany([
    { name: 'Riya Kapoor', email: 'riya@fitforge.com', title: 'Strength & Fat Loss Coach', bio: 'Builds sustainable body recomposition plans for beginners and busy professionals.', avatar: image('photo-1594381898411-846e7d193883'), specialties: ['Fat Loss', 'Strength', 'Women Fitness'], experienceYears: 8, certifications: ['ACE CPT', 'Sports Nutrition'], rating: 4.9, clientsCount: 420, isFeatured: true },
    { name: 'Kabir Singh', email: 'kabir@fitforge.com', title: 'Hypertrophy Specialist', bio: 'Helps lifters gain muscle with clean volume, smart deloads, and food discipline.', avatar: image('photo-1583454110551-21f2fa2afe61'), specialties: ['Muscle Gain', 'Bodybuilding', 'Power'], experienceYears: 10, certifications: ['NSCA CPT'], rating: 4.8, clientsCount: 380, isFeatured: true },
    { name: 'Ananya Rao', email: 'ananya@fitforge.com', title: 'Yoga & Mobility Coach', bio: 'Blends yoga, corrective exercise, and recovery for pain-free movement.', avatar: image('photo-1548690312-e3b507d8c110'), specialties: ['Yoga', 'Mobility', 'Recovery'], experienceYears: 7, certifications: ['RYT 500'], rating: 4.9, clientsCount: 260, isFeatured: true },
  ]);

  const videos = await WorkoutVideo.insertMany([
    { title: '20 Minute Fat Burn HIIT', slug: '20-minute-fat-burn-hiit', provider: 'youtube', url: 'https://www.youtube.com/embed/ml6cT4AZdqI', thumbnail: image('photo-1605296867304-46d5465a13f1'), category: 'hiit', trainer: trainers[0]._id, durationMinutes: 20, difficulty: 'beginner', tags: ['fat loss', 'home'] },
    { title: 'Cloudinary Strength Session Placeholder', slug: 'cloudinary-strength-session', provider: 'cloudinary', url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4', thumbnail: image('photo-1581009146145-b5ef050c2e1e'), category: 'strength-training', trainer: trainers[1]._id, durationMinutes: 35, difficulty: 'intermediate', tags: ['strength', 'weights'] },
    { title: 'Home Bodyweight Starter', slug: 'home-bodyweight-starter', provider: 'youtube', url: 'https://www.youtube.com/embed/UBMk30rjy0o', thumbnail: image('photo-1518611012118-696072aa579a'), category: 'home-workout', trainer: trainers[0]._id, durationMinutes: 18, difficulty: 'beginner', tags: ['home', 'bodyweight', 'beginner'] },
    { title: 'Gym Pull Day Placeholder', slug: 'gym-pull-day-placeholder', provider: 'youtube', url: 'https://www.youtube.com/embed/eMjyvIQbn9M', thumbnail: image('photo-1534438327276-14e5300c3a48'), category: 'gym-workout', trainer: trainers[1]._id, durationMinutes: 42, difficulty: 'intermediate', tags: ['gym', 'back', 'biceps'] },
    { title: 'Lower Body Strength Placeholder', slug: 'lower-body-strength-placeholder', provider: 'cloudinary', url: 'https://res.cloudinary.com/demo/video/upload/dog.mp4', thumbnail: image('photo-1574680096145-d05b474e2155'), category: 'strength-training', trainer: trainers[1]._id, durationMinutes: 40, difficulty: 'advanced', tags: ['legs', 'strength', 'barbell'] },
    { title: 'Cardio Engine Session', slug: 'cardio-engine-session', provider: 'youtube', url: 'https://www.youtube.com/embed/50kH47ZztHs', thumbnail: image('photo-1476480862126-209bfaa8edc8'), category: 'cardio', trainer: trainers[0]._id, durationMinutes: 28, difficulty: 'beginner', tags: ['cardio', 'stamina', 'fat loss'] },
    { title: 'Yoga Recovery Flow', slug: 'yoga-recovery-flow', provider: 'youtube', url: 'https://www.youtube.com/embed/v7AYKMP6rOE', thumbnail: image('photo-1544367567-0f2fcb009e0b'), category: 'yoga', trainer: trainers[2]._id, durationMinutes: 30, difficulty: 'beginner', tags: ['yoga', 'mobility', 'recovery'] },
  ]);

  const workouts = await Workout.insertMany([
    {
      title: 'Forge Chest Builder',
      slug: 'forge-chest-builder',
      category: 'gym-workout',
      goal: 'muscle_gain',
      thumbnail: image('photo-1581009146145-b5ef050c2e1e'),
      difficulty: 'intermediate',
      durationMinutes: 45,
      caloriesBurned: 380,
      description: 'A progressive push session built around presses, controlled tempo, and strong lockouts.',
      trainer: trainers[1]._id,
      equipment: ['bench', 'dumbbells', 'barbell'],
      targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
      video: videos[1]._id,
      isFeatured: true,
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '6-8', restSeconds: 120, steps: ['Brace your core', 'Lower under control', 'Drive through the bar'] },
        { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restSeconds: 90, steps: ['Set a 30 degree incline', 'Keep wrists stacked', 'Squeeze at top'] },
      ],
    },
    {
      title: 'Apartment HIIT Ignite',
      slug: 'apartment-hiit-ignite',
      category: 'home-workout',
      goal: 'fat_loss',
      thumbnail: image('photo-1518611012118-696072aa579a'),
      difficulty: 'beginner',
      durationMinutes: 24,
      caloriesBurned: 260,
      description: 'Low-space, high-energy intervals for beginners who want a sweat without gym equipment.',
      trainer: trainers[0]._id,
      equipment: ['bodyweight'],
      targetMuscles: ['Full Body', 'Core', 'Legs'],
      video: videos[0]._id,
      isFeatured: true,
      exercises: [
        { name: 'Squat to Reach', sets: 3, reps: '40 sec', restSeconds: 20, steps: ['Sit hips back', 'Reach tall', 'Keep chest proud'] },
        { name: 'Mountain Climbers', sets: 3, reps: '30 sec', restSeconds: 20, steps: ['Stack shoulders', 'Drive knees', 'Keep hips steady'] },
      ],
    },
    {
      title: 'Mobility Reset Flow',
      slug: 'mobility-reset-flow',
      category: 'yoga',
      goal: 'mobility',
      thumbnail: image('photo-1544367567-0f2fcb009e0b'),
      difficulty: 'beginner',
      durationMinutes: 30,
      caloriesBurned: 140,
      description: 'A recovery-first flow for hips, hamstrings, spine, and breath control.',
      trainer: trainers[2]._id,
      equipment: ['mat'],
      targetMuscles: ['Hips', 'Back', 'Hamstrings'],
      isFeatured: true,
      exercises: [{ name: 'World Greatest Stretch', sets: 3, reps: '5/side', restSeconds: 30, steps: ['Lunge long', 'Open chest', 'Rotate slowly'] }],
    },
    {
      title: 'Living Room Bodyweight Base',
      slug: 'living-room-bodyweight-base',
      category: 'bodyweight-training',
      goal: 'general_fitness',
      thumbnail: image('photo-1599058917212-d750089bc07e'),
      difficulty: 'beginner',
      durationMinutes: 22,
      caloriesBurned: 210,
      description: 'A no-equipment bodyweight workout with squats, pushups, lunges, and core work for home training.',
      trainer: trainers[0]._id,
      equipment: ['bodyweight'],
      targetMuscles: ['Full Body', 'Core', 'Legs'],
      video: videos[2]._id,
      isFeatured: true,
      exercises: [
        { name: 'Incline Pushup', sets: 3, reps: '8-12', restSeconds: 45, steps: ['Hands elevated', 'Brace core', 'Lower chest under control'] },
        { name: 'Reverse Lunge', sets: 3, reps: '10/side', restSeconds: 45, steps: ['Step back softly', 'Keep knee stacked', 'Drive through front heel'] },
      ],
    },
    {
      title: 'Gym Pull Day Blueprint',
      slug: 'gym-pull-day-blueprint',
      category: 'gym-workout',
      goal: 'muscle_gain',
      thumbnail: image('photo-1534438327276-14e5300c3a48'),
      difficulty: 'intermediate',
      durationMinutes: 48,
      caloriesBurned: 420,
      description: 'A gym-based back and biceps session using pulldowns, rows, rear delts, and curls.',
      trainer: trainers[1]._id,
      equipment: ['lat pulldown', 'cable row', 'dumbbells'],
      targetMuscles: ['Back', 'Biceps', 'Rear Delts'],
      video: videos[3]._id,
      isFeatured: true,
      exercises: [
        { name: 'Lat Pulldown', sets: 4, reps: '8-10', restSeconds: 90, steps: ['Lean slightly back', 'Pull elbows down', 'Control the stretch'] },
        { name: 'Seated Cable Row', sets: 3, reps: '10-12', restSeconds: 75, steps: ['Neutral spine', 'Drive elbows back', 'Pause at ribs'] },
      ],
    },
    {
      title: 'Forge Legs Heavy',
      slug: 'forge-legs-heavy',
      category: 'strength-training',
      goal: 'strength',
      thumbnail: image('photo-1574680096145-d05b474e2155'),
      difficulty: 'advanced',
      durationMinutes: 52,
      caloriesBurned: 510,
      description: 'Heavy lower-body strength session with squats, hinges, split squats, and loaded carries.',
      trainer: trainers[1]._id,
      equipment: ['barbell', 'rack', 'dumbbells'],
      targetMuscles: ['Quads', 'Hamstrings', 'Glutes'],
      video: videos[4]._id,
      isFeatured: true,
      exercises: [
        { name: 'Back Squat', sets: 5, reps: '5', restSeconds: 150, steps: ['Brace hard', 'Sit between hips', 'Drive upward with speed'] },
        { name: 'Romanian Deadlift', sets: 4, reps: '8', restSeconds: 120, steps: ['Soft knees', 'Hinge back', 'Keep lats tight'] },
      ],
    },
    {
      title: 'Cardio Engine Builder',
      slug: 'cardio-engine-builder',
      category: 'cardio',
      goal: 'endurance',
      thumbnail: image('photo-1476480862126-209bfaa8edc8'),
      difficulty: 'beginner',
      durationMinutes: 28,
      caloriesBurned: 300,
      description: 'A stamina-focused cardio workout with intervals that beginners can scale.',
      trainer: trainers[0]._id,
      equipment: ['treadmill optional', 'bodyweight'],
      targetMuscles: ['Heart', 'Lungs', 'Legs'],
      video: videos[5]._id,
      isFeatured: true,
      exercises: [
        { name: 'Fast Walk Intervals', sets: 6, reps: '90 sec', restSeconds: 45, steps: ['Walk tall', 'Breathe through nose when possible', 'Recover fully'] },
        { name: 'Step Jacks', sets: 4, reps: '45 sec', restSeconds: 30, steps: ['Step wide', 'Reach overhead', 'Keep rhythm smooth'] },
      ],
    },
    {
      title: 'Shoulder Armor Gym Session',
      slug: 'shoulder-armor-gym-session',
      category: 'gym-workout',
      goal: 'muscle_gain',
      thumbnail: image('photo-1571019613914-85f342c1d95e'),
      difficulty: 'intermediate',
      durationMinutes: 38,
      caloriesBurned: 340,
      description: 'A focused gym workout for delts, traps, and shoulder stability with press and raise variations.',
      trainer: trainers[1]._id,
      equipment: ['dumbbells', 'cables', 'bench'],
      targetMuscles: ['Shoulders', 'Traps', 'Core'],
      video: videos[1]._id,
      isFeatured: true,
      exercises: [
        { name: 'Seated Dumbbell Press', sets: 4, reps: '8-10', restSeconds: 90, steps: ['Set shoulder blades', 'Press overhead', 'Lower slowly'] },
        { name: 'Cable Lateral Raise', sets: 3, reps: '12-15', restSeconds: 60, steps: ['Lead with elbow', 'Stop at shoulder height', 'Control down'] },
      ],
    },
    {
      title: 'Morning Yoga Recovery',
      slug: 'morning-yoga-recovery',
      category: 'yoga',
      goal: 'mobility',
      thumbnail: image('photo-1506126613408-eca07ce68773'),
      difficulty: 'beginner',
      durationMinutes: 25,
      caloriesBurned: 110,
      description: 'A gentle morning flow for spine, hips, hamstrings, and breathing before work or training.',
      trainer: trainers[2]._id,
      equipment: ['mat'],
      targetMuscles: ['Spine', 'Hips', 'Hamstrings'],
      video: videos[6]._id,
      isFeatured: true,
      exercises: [
        { name: 'Cat Cow', sets: 2, reps: '60 sec', restSeconds: 15, steps: ['Move with breath', 'Round spine', 'Open chest'] },
        { name: 'Low Lunge Flow', sets: 3, reps: '5/side', restSeconds: 20, steps: ['Step long', 'Sink hips', 'Reach tall'] },
      ],
    },
  ]);

  await DietPlan.insertMany([
    {
      title: 'Indian Fat Loss 1800',
      slug: 'indian-fat-loss-1800',
      category: 'indian-diet',
      image: image('photo-1546069901-ba9599a7e63c'),
      goal: 'fat_loss',
      calories: 1800,
      macros: { protein: 140, carbs: 190, fats: 50 },
      trainer: trainers[0]._id,
      isFeatured: true,
      meals: [
        { name: 'Protein poha bowl', time: '08:00', calories: 420, items: ['Poha', 'Peanuts', 'Paneer', 'Curd'] },
        { name: 'Dal rice plate', time: '13:30', calories: 560, items: ['Dal', 'Rice', 'Salad', 'Chicken/Tofu'] },
        { name: 'Tandoori dinner', time: '20:00', calories: 620, items: ['Roti', 'Paneer tikka', 'Vegetables'] },
      ],
      tips: ['Prioritize protein every meal', 'Keep weekend meals planned', 'Walk after dinner'],
    },
    {
      title: 'Lean Muscle 2600',
      slug: 'lean-muscle-2600',
      category: 'high-protein',
      image: image('photo-1490645935967-10de6ba17061'),
      goal: 'muscle_gain',
      calories: 2600,
      macros: { protein: 180, carbs: 320, fats: 70 },
      trainer: trainers[1]._id,
      isFeatured: true,
      meals: [
        { name: 'Oats and whey', time: '07:30', calories: 520, items: ['Oats', 'Whey', 'Banana', 'Almonds'] },
        { name: 'Rice chicken bowl', time: '13:00', calories: 760, items: ['Rice', 'Chicken/Paneer', 'Curd', 'Veggies'] },
      ],
      tips: ['Use a small surplus', 'Track weekly weight average', 'Hydrate during training'],
    },
  ]);

  await Subscription.insertMany([
    { name: 'Starter', slug: 'starter', price: 0, interval: 'monthly', features: ['Free workouts', 'BMI calculator', 'Community access'], isPopular: false },
    { name: 'Forge Pro', slug: 'forge-pro', price: 999, interval: 'monthly', features: ['Premium plans', 'Trainer check-ins', 'Macros tracking', 'Progress analytics'], razorpayPlanId: 'plan_test_pro', isPopular: true },
    { name: 'Elite Coaching', slug: 'elite-coaching', price: 2999, interval: 'monthly', features: ['Dedicated trainer', 'Custom diet plans', 'Weekly review calls', 'Priority support'], razorpayPlanId: 'plan_test_elite', isPopular: false },
  ]);

  await Testimonial.insertMany([
    { name: 'Neha Sharma', role: 'Home workout member', image: image('photo-1494790108377-be9c29b29330'), quote: 'FitForge made training feel premium and practical. I lost 9 kg without crash dieting.', rating: 5, metric: '-9 kg in 14 weeks' },
    { name: 'Rohan Iyer', role: 'Muscle gain member', image: image('photo-1500648767791-00dcc994a43e'), quote: 'The tracking dashboard helped me finally understand volume, calories, and consistency.', rating: 5, metric: '+6 kg lean mass' },
  ]);

  await Blog.insertMany([
    { title: 'How to Build a 4 Day Workout Split', slug: 'build-4-day-workout-split', excerpt: 'A simple split for Indian gym-goers balancing work, recovery, and progressive overload.', content: 'A strong split balances push, pull, legs, and full-body accessories. Start with compounds, keep isolation work intentional, and progress one variable at a time.', coverImage: image('photo-1571019613454-1cb2f99b2d8b'), category: 'fitness-science', authorName: 'FitForge Lab', tags: ['strength', 'programming'], seoTitle: 'Best 4 Day Workout Split for Strength and Muscle', seoDescription: 'Build muscle with a practical 4 day workout split for beginners and intermediates.', readMinutes: 6, views: 1200, isFeatured: true },
    { title: 'Indian High Protein Diet Without Boring Food', slug: 'indian-high-protein-diet', excerpt: 'Protein-rich Indian meals that fit fat loss and muscle gain goals.', content: 'Use curd, paneer, eggs, chicken, dal, soy, whey, and legumes strategically. Keep portions measurable and protein consistent across meals.', coverImage: image('photo-1490645935967-10de6ba17061'), category: 'nutrition', authorName: 'Riya Kapoor', tags: ['diet', 'protein'], seoTitle: 'Indian High Protein Diet Plan', seoDescription: 'High-protein Indian diet ideas for fat loss and muscle gain.', readMinutes: 5, views: 980, isFeatured: true },
  ]);

  await Challenge.insertMany([
    { title: '21 Day Fat Loss Forge', slug: '21-day-fat-loss-forge', image: image('photo-1517836357463-d25dfeac3438'), description: 'Complete 15 workouts and log calories for 21 days.', category: 'fat_loss', startDate: new Date(), endDate: new Date(Date.now() + 21 * 86400000), participants: [member._id], rewards: ['Forge Pro discount', 'Leaderboard badge'] },
    { title: '10K Steps League', slug: '10k-steps-league', image: image('photo-1476480862126-209bfaa8edc8'), description: 'Stack daily walking streaks and climb the leaderboard.', category: 'endurance', startDate: new Date(), endDate: new Date(Date.now() + 30 * 86400000), participants: [member._id, admin._id], rewards: ['Community badge'] },
  ]);

  await CommunityPost.create({
    author: member._id,
    type: 'transformation',
    title: 'From inconsistent to 5 workouts a week',
    content: 'Small daily wins, meal prep, and progressive workouts changed everything.',
    beforeImage: image('photo-1571019613914-85f342c1d95e'),
    afterImage: image('photo-1583454110551-21f2fa2afe61'),
    likes: [admin._id],
  });

  console.log(`Seeded FitForge with ${workouts.length} workouts.`);
  console.log('Admin: admin@fitforge.com / admin@123456');
  console.log('Member: member@fitforge.com / member@123456');
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
