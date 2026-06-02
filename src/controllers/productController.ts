import { Request, Response } from 'express';
import { SortOrder } from 'mongoose';
import { Product } from '../models/Product';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const {
    category,
    brand,
    minPrice,
    maxPrice,
    isBestseller,
    isNew,
    tags,
    sortBy = 'reviews',
    sortOrder = 'desc',
    page = '1',
    limit = '20',
    q,
  } = req.query;

  const filter: Record<string, unknown> = { isActive: true };

  if (category) filter.category = category;
  if (brand) {
    // Support slug-style brand filter (loreal => L'Oréal lookup is done by slug field)
    filter['brand'] = { $regex: new RegExp((brand as string).replace(/-/g, '.'), 'i') };
  }
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) (filter.price as Record<string, number>).$gte = Number(minPrice);
    if (maxPrice) (filter.price as Record<string, number>).$lte = Number(maxPrice);
  }
  if (isBestseller === 'true') filter.isBestseller = true;
  if (isNew === 'true') filter.isNew = true;
  if (tags) filter.tags = { $in: (tags as string).split(',') };

  // Full-text search
  if (q) {
    filter.$text = { $search: q as string };
  }

  const sortMap: Record<string, string> = {
    popularity: 'reviews',
    rating: 'rating',
    'price-low': 'price',
    'price-high': 'price',
    newest: 'createdAt',
  };

  const sortField = sortMap[sortBy as string] || 'reviews';
  const order: SortOrder = (sortBy as string) === 'price-low' ? 1 : -1;
  const sort: Record<string, SortOrder> = { [sortField]: order };

  const pageNum = Math.max(1, parseInt(page as string));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
    Product.countDocuments(filter),
  ]);

  sendPaginated(res, products, total, pageNum, limitNum);
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const product = await Product.findOne({ _id: req.params.id, isActive: true });
  if (!product) {
    sendError(res, 'Product not found', 404);
    return;
  }
  sendSuccess(res, product);
};

export const getRelatedProducts = async (req: Request, res: Response): Promise<void> => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    sendError(res, 'Product not found', 404);
    return;
  }

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .sort({ rating: -1 })
    .limit(4)
    .lean();

  sendSuccess(res, related);
};

export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  const [bestsellers, newArrivals, trending] = await Promise.all([
    Product.find({ isBestseller: true, isActive: true }).sort({ reviews: -1 }).limit(8).lean(),
    Product.find({ isNew: true, isActive: true }).sort({ createdAt: -1 }).limit(6).lean(),
    Product.find({ rating: { $gte: 4.3 }, isActive: true }).sort({ rating: -1 }).limit(8).lean(),
  ]);

  sendSuccess(res, { bestsellers, newArrivals, trending });
};

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  const { q, limit = '10' } = req.query;

  if (!q || (q as string).trim().length < 2) {
    sendSuccess(res, []);
    return;
  }

  const products = await Product.find(
    { $text: { $search: q as string }, isActive: true },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit as string))
    .lean();

  sendSuccess(res, products);
};

// Admin only
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await Product.create(req.body);
  sendSuccess(res, product, 'Product created', 201);
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    sendError(res, 'Product not found', 404);
    return;
  }
  sendSuccess(res, product, 'Product updated');
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!product) {
    sendError(res, 'Product not found', 404);
    return;
  }
  sendSuccess(res, null, 'Product deleted');
};
