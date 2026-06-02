import mongoose, { Document, Schema } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  logo: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Brand = mongoose.model<IBrand>('Brand', brandSchema);
