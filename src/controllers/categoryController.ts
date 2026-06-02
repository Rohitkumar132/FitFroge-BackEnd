import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Brand } from '../models/Brand';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
  sendSuccess(res, categories);
};

export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) {
    sendError(res, 'Category not found', 404);
    return;
  }
  sendSuccess(res, category);
};

export const getBrands = async (_req: Request, res: Response): Promise<void> => {
  const brands = await Brand.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
  sendSuccess(res, brands);
};

export const getBrandBySlug = async (req: Request, res: Response): Promise<void> => {
  const brand = await Brand.findOne({ slug: req.params.slug, isActive: true });
  if (!brand) {
    sendError(res, 'Brand not found', 404);
    return;
  }
  sendSuccess(res, brand);
};

// Admin
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const category = await Category.create(req.body);
  sendSuccess(res, category, 'Category created', 201);
};

export const createBrand = async (req: Request, res: Response): Promise<void> => {
  const brand = await Brand.create(req.body);
  sendSuccess(res, brand, 'Brand created', 201);
};
