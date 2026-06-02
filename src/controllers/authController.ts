import crypto from 'crypto';
import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateAccessToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const publicUser = (user: InstanceType<typeof User>) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  role: user.role,
  gender: user.gender,
  age: user.age,
  heightCm: user.heightCm,
  weightKg: user.weightKg,
  goal: user.goal,
  fitnessLevel: user.fitnessLevel,
  preferredTraining: user.preferredTraining,
  equipmentAccess: user.equipmentAccess,
  assignedTrainer: user.assignedTrainer,
  isEmailVerified: user.isEmailVerified,
});

const issueToken = (user: InstanceType<typeof User>) =>
  generateAccessToken({ userId: user._id.toString(), email: user.email, role: user.role });

const logEmailPlaceholder = (type: string, email: string, token?: string) => {
  logger.info(`[email:${type}] queued for ${email}${token ? ` token=${token}` : ''}`);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) {
    sendError(res, 'An account with this email already exists', 409);
    return;
  }

  const emailVerificationToken = crypto.randomBytes(24).toString('hex');
  const user = await User.create({ ...req.body, role: req.body.role || 'user', emailVerificationToken });
  logEmailPlaceholder('verify', user.email, emailVerificationToken);

  sendSuccess(res, { token: issueToken(user), user: publicUser(user) }, 'Account created successfully', 201);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findOne({ email: req.body.email, isActive: true }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) {
    sendError(res, 'Invalid email or password', 401);
    return;
  }

  sendSuccess(res, { token: issueToken(user), user: publicUser(user) }, 'Logged in successfully');
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.userId);
  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }
  sendSuccess(res, publicUser(user));
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const allowed = [
    'firstName',
    'lastName',
    'phone',
    'avatar',
    'gender',
    'age',
    'heightCm',
    'weightKg',
    'goal',
    'fitnessLevel',
    'preferredTraining',
    'equipmentAccess',
  ];
  const updates: Record<string, unknown> = {};
  allowed.forEach(key => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.user?.userId, updates, { new: true, runValidators: true });
  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }
  sendSuccess(res, publicUser(user), 'Profile updated');
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findOne({ emailVerificationToken: req.params.token }).select('+emailVerificationToken');
  if (!user) {
    sendError(res, 'Invalid verification token', 400);
    return;
  }
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();
  sendSuccess(res, null, 'Email verified successfully');
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findOne({ email: req.body.email }).select('+passwordResetToken +passwordResetExpires');
  if (user) {
    user.passwordResetToken = crypto.randomBytes(24).toString('hex');
    user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();
    logEmailPlaceholder('reset-password', user.email, user.passwordResetToken);
  }
  sendSuccess(res, null, 'If this email exists, a reset link has been sent');
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findOne({
    passwordResetToken: req.params.token,
    passwordResetExpires: { $gt: new Date() },
  }).select('+password +passwordResetToken +passwordResetExpires');

  if (!user) {
    sendError(res, 'Invalid or expired reset token', 400);
    return;
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  sendSuccess(res, { token: issueToken(user), user: publicUser(user) }, 'Password reset successfully');
};
