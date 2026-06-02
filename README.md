# FitForge Backend

Express + TypeScript + MongoDB API for the FitForge gym and fitness platform.

## Features
- JWT auth with `user`, `trainer`, and `admin` roles
- Email verification and password reset token flow with SMTP env placeholders
- Workouts, videos, trainers, categories, diet plans, BMI records, progress, food logs
- Community posts, transformation stories, comments, likes, challenges, leaderboard-ready data
- Blog system with SEO fields
- Admin CRUD resource routes and analytics
- Razorpay test/dummy payment order structure
- Cloudinary-ready video URL fields

## Setup
```bash
npm install
npm run seed
npm run dev
```

## Environment
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=FitForge <no-reply@fitforge.com>
```

## Core APIs
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`
- `GET /api/home`
- `GET /api/workouts`
- `GET /api/workouts/:slug`
- `GET /api/videos`
- `GET /api/diet-plans`
- `POST /api/bmi`
- `GET /api/dashboard`
- `POST /api/progress/complete`
- `POST /api/food-logs`
- `POST /api/ai/recommendations`
- `GET /api/community`
- `GET /api/blogs`
- `GET /api/blogs/:slug`
- `GET /api/admin/analytics`
- `GET|POST|PUT|DELETE /api/admin/:resource`

## Seed Accounts
- Admin: `admin@fitforge.com` / `admin@123456`
- Member: `member@fitforge.com` / `member@123456`

## Render Deployment
1. Create a Render Web Service.
2. Set build command: `npm install && npm run build`.
3. Set start command: `npm start`.
4. Add the environment variables above.
5. Use MongoDB Atlas for `MONGODB_URI`.
