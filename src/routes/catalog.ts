import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  getBrands,
  getBrandBySlug,
  createCategory,
  createBrand,
} from '../controllers/categoryController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/categories', getCategories);
router.get('/categories/:slug', getCategoryBySlug);
router.get('/brands', getBrands);
router.get('/brands/:slug', getBrandBySlug);

// Admin
router.post('/categories', authenticate, requireAdmin, createCategory);
router.post('/brands', authenticate, requireAdmin, createBrand);

export default router;
