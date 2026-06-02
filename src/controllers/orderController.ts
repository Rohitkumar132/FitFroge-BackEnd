import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

const SHIPPING_THRESHOLD = 999;
const SHIPPING_COST = 99;

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { items, shippingAddress, paymentMethod, couponCode } = req.body;

  if (!items || items.length === 0) {
    sendError(res, 'Order must have at least one item', 400);
    return;
  }

  // Fetch and validate all products
  const productIds = items.map((i: { productId: string }) => i.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });

  if (products.length !== items.length) {
    sendError(res, 'One or more products not found or unavailable', 400);
    return;
  }

  const orderItems = items.map((item: { productId: string; quantity: number }) => {
    const product = products.find((p) => p._id.toString() === item.productId);
    if (!product) throw new Error('Product mismatch');
    return {
      product: product._id,
      name: product.name,
      brand: product.brand,
      image: product.image,
      price: product.price,
      quantity: item.quantity,
    };
  });

  const subtotal = orderItems.reduce(
    (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
    0
  );
  const shipping = subtotal > SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  const order = await Order.create({
    user: req.user?.userId,
    items: orderItems,
    shippingAddress,
    subtotal,
    shipping,
    discount: 0,
    total,
    couponCode,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    orderStatus: 'confirmed',
  });

  sendSuccess(res, order, 'Order placed successfully', 201);
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Math.max(1, parseInt((req.query.page as string) || '1'));
  const limit = 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user?.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments({ user: req.user?.userId }),
  ]);

  sendSuccess(res, orders, 'Orders fetched', 200, {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user?.userId,
  }).populate('items.product', 'name brand image');

  if (!order) {
    sendError(res, 'Order not found', 404);
    return;
  }
  sendSuccess(res, order);
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user?.userId });
  if (!order) {
    sendError(res, 'Order not found', 404);
    return;
  }

  if (!['pending', 'confirmed'].includes(order.orderStatus)) {
    sendError(res, 'Order cannot be cancelled at this stage', 400);
    return;
  }

  order.orderStatus = 'cancelled';
  await order.save();
  sendSuccess(res, order, 'Order cancelled');
};

// Admin
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  const { status, page = '1' } = req.query;
  const filter: Record<string, unknown> = {};
  if (status) filter.orderStatus = status;

  const pageNum = parseInt(page as string);
  const limit = 20;
  const skip = (pageNum - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  sendSuccess(res, orders, 'Orders fetched', 200, { total, page: pageNum, limit });
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { orderStatus, trackingNumber } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      orderStatus,
      ...(trackingNumber && { trackingNumber }),
      ...(orderStatus === 'delivered' && { deliveredAt: new Date() }),
    },
    { new: true }
  );
  if (!order) {
    sendError(res, 'Order not found', 404);
    return;
  }
  sendSuccess(res, order, 'Order status updated');
};
