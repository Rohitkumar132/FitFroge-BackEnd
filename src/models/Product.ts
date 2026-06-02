import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  category: string;
  subcategory: string;
  description: string;
  isBestseller: boolean;
  isNewProduct: boolean;
  tags: string[];
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    brand: { type: String, required: true, trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 },
    image: { type: String, required: true },
    images: [{ type: String }],
    category: { type: String, required: true, index: true },
    subcategory: { type: String, required: true },
    description: { type: String, required: true },
    isBestseller: { type: Boolean, default: false, index: true },
    isNewProduct: { type: Boolean, default: false, index: true },
    tags: [{ type: String }],
    stock: { type: Number, default: 100, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Compound indexes for common queries
productSchema.index({ category: 1, rating: -1 });
productSchema.index({ brand: 1, price: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: 'text', brand: 'text', description: 'text', tags: 'text' });

export const Product = mongoose.model<IProduct>('Product', productSchema);
