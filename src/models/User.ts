import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'user' | 'trainer' | 'admin';
export type FitnessGoal = 'fat_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'mobility' | 'general_fitness';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  age?: number;
  heightCm?: number;
  weightKg?: number;
  goal: FitnessGoal;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredTraining: string[];
  equipmentAccess: string[];
  assignedTrainer?: mongoose.Types.ObjectId;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true },
    avatar: { type: String },
    role: { type: String, enum: ['user', 'trainer', 'admin'], default: 'user', index: true },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    age: { type: Number, min: 10, max: 100 },
    heightCm: { type: Number, min: 80, max: 260 },
    weightKg: { type: Number, min: 25, max: 350 },
    goal: {
      type: String,
      enum: ['fat_loss', 'muscle_gain', 'strength', 'endurance', 'mobility', 'general_fitness'],
      default: 'general_fitness',
    },
    fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    preferredTraining: [{ type: String }],
    equipmentAccess: [{ type: String }],
    assignedTrainer: { type: Schema.Types.ObjectId, ref: 'Trainer' },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
