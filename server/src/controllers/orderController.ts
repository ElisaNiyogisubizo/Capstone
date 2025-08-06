import { Request, Response } from 'express';
import Stripe from 'stripe';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Artwork from '../models/Artwork';
import User from '../models/User';

// Create checkout session
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    // Initialize Stripe only if the secret key is available
    const stripe = process.env.STRIPE_SECRET_KEY ? 
      new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-06-30.basil',
      }) : null;

    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: 'Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.',
      });
    }

    const userId = req.user?._id;
    const { shippingAddress } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items.artwork',
        select: 'title images price artist status',
        populate: {
          path: 'artist',
          select: 'name avatar',
        },
      });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    // Validate all items are available
    const validItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const artwork = await Artwork.findById(item.artwork);
      if (!artwork || artwork.status !== 'available') {
        return res.status(400).json({
          success: false,
          message: `Artwork "${artwork?.title || 'Unknown'}" is not available`,
        });
      }
      validItems.push({
        artwork: artwork._id,
        quantity: item.quantity,
        price: artwork.price,
        title: artwork.title,
      });
      totalAmount += artwork.price * item.quantity;
    }

    // Create order
    const order = new Order({
      user: userId,
      items: validItems,
      totalAmount,
      shippingAddress,
    });

    await order.save();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: validItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
            images: [], // You can add artwork images here
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString(),
      },
    });

    // Update order with session ID
    order.stripeSessionId = session.id;
    await order.save();

    return res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
        orderId: order._id,
      },
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message,
    });
  }
};

// Handle Stripe webhook
export const handleStripeWebhook = async (req: Request, res: Response) => {
  // Initialize Stripe only if the secret key is available
  const stripe = process.env.STRIPE_SECRET_KEY ? 
    new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    }) : null;

  if (!stripe) {
    return res.status(500).json({
      success: false,
      message: 'Stripe is not configured',
    });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(failedPaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Handle successful checkout session
const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const order = await Order.findById(orderId);
  if (!order) return;

  order.status = 'paid';
  order.stripePaymentIntentId = session.payment_intent as string;
  order.paidAt = new Date();
  await order.save();

  // Update artwork status to sold
  for (const item of order.items) {
    await Artwork.findByIdAndUpdate(item.artwork, { status: 'sold' });
  }

  // Clear user's cart
  await Cart.findOneAndUpdate(
    { user: order.user },
    { items: [] }
  );

  // Update artist's total sales
  for (const item of order.items) {
    const artwork = await Artwork.findById(item.artwork);
    if (artwork) {
      await User.findByIdAndUpdate(artwork.artist, {
        $inc: { totalSales: item.price }
      });
    }
  }
};

// Handle successful payment intent
const handlePaymentIntentSucceeded = async (paymentIntent: Stripe.PaymentIntent) => {
  const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
  if (!order) return;

  order.status = 'paid';
  order.paidAt = new Date();
  await order.save();
};

// Handle failed payment intent
const handlePaymentIntentFailed = async (paymentIntent: Stripe.PaymentIntent) => {
  const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
  if (!order) return;

  order.status = 'cancelled';
  order.cancelledAt = new Date();
  await order.save();
};

// Get user's orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { page = 1, limit = 10, status } = req.query;

    const query: any = { user: userId };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.artwork', 'title images price artist')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    const pages = Math.ceil(total / Number(limit));

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages,
        hasNext: Number(page) < pages,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

// Get order by ID
export const getOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const order = await Order.findById(id)
      .populate('items.artwork', 'title images price artist')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user is authorized to view this order
    if (order.user.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message,
    });
  }
};

// Cancel order
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if user is authorized to cancel this order
    if (order.user.toString() !== userId.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    if (order.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a paid order',
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message,
    });
  }
}; 