import { Request, Response } from 'express';
import Cart from '../models/Cart';
import Artwork from '../models/Artwork';

// Get user's cart
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    let cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items.artwork',
        select: 'title images price artist status',
        populate: {
          path: 'artist',
          select: 'name avatar',
        },
      });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
    }

    if (!cart.items) cart.items = [];

    // Calculate total amount
    let totalAmount = 0;
    const itemsWithDetails = await Promise.all(
      cart.items.map(async (item) => {
        const artwork = await Artwork.findById(item.artwork);
        if (artwork && artwork.status === 'available') {
          totalAmount += artwork.price * item.quantity;
          return {
            artwork: item.artwork,
            quantity: item.quantity,
            addedAt: item.addedAt,
            artworkDetails: {
              ...artwork.toObject(),
              artist: artwork.artist,
            },
          };
        }
        return null;
      })
    );

    const validItems = itemsWithDetails.filter(item => item !== null);

    return res.status(200).json({
      success: true,
      data: {
        items: validItems,
        totalAmount,
        itemCount: validItems.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message,
    });
  }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const { artworkId, quantity = 1 } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    // Validate artwork
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found',
      });
    }

    if (artwork.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Artwork is not available for purchase',
      });
    }

    // Check if user is trying to buy their own artwork
    if (artwork.artist.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add your own artwork to cart',
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.artwork.toString() === artworkId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const existingItem = cart.items[existingItemIndex];
      if (existingItem) {
        existingItem.quantity += quantity;
      }
    } else {
      // Add new item
      cart.items.push({
        artwork: artworkId,
        quantity,
        addedAt: new Date(),
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.artwork',
        select: 'title images price artist status',
        populate: {
          path: 'artist',
          select: 'name avatar',
        },
      });

    return res.status(200).json({
      success: true,
      data: populatedCart,
      message: 'Item added to cart successfully',
    });
  } catch (error: any) {
    console.error('Error adding item to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message,
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { artworkId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.artwork.toString() === artworkId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    const item = cart.items[itemIndex];
    if (item) {
      item.quantity = quantity;
    }
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.artwork',
        select: 'title images price artist status',
        populate: {
          path: 'artist',
          select: 'name avatar',
        },
      });

    return res.status(200).json({
      success: true,
      data: populatedCart,
      message: 'Cart item updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message,
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { artworkId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = cart.items.filter(
      item => item.artwork.toString() !== artworkId
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.artwork',
        select: 'title images price artist status',
        populate: {
          path: 'artist',
          select: 'name avatar',
        },
      });

    return res.status(200).json({
      success: true,
      data: populatedCart,
      message: 'Item removed from cart successfully',
    });
  } catch (error: any) {
    console.error('Error removing item from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message,
    });
  }
};

// Clear cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = [];
    await cart.save();

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message,
    });
  }
}; 