import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  icon: string;
  slug: string;
  image: string;
  discount: string;
  isActive: boolean;
  sortOrder: number;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    image: { type: String, required: true },
    discount: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', categorySchema);
