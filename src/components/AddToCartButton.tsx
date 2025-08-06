import React, { useState } from 'react';
import { ShoppingCart, Plus } from 'lucide-react';
import { cartService } from '../services/cart';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface AddToCartButtonProps {
  artworkId: string;
  artworkTitle: string;
  price: number;
  className?: string;
  variant?: 'default' | 'icon' | 'text';
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  artworkId,
  artworkTitle,
  price,
  className = '',
  variant = 'default'
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      setLoading(true);
      await cartService.addToCart(artworkId, 1);
      toast.success(`${artworkTitle} added to cart`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (variant === 'icon') {
    return (
      <button
        onClick={handleAddToCart}
        disabled={loading}
        className={`p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors ${className}`}
        title="Add to cart"
      >
        <ShoppingCart className="w-4 h-4" />
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleAddToCart}
        disabled={loading}
        className={`text-blue-600 hover:text-blue-700 font-medium ${className}`}
      >
        {loading ? 'Adding...' : 'Add to Cart'}
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className={`flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <Plus className="w-4 h-4" />
      )}
      <span>{loading ? 'Adding...' : 'Add to Cart'}</span>
    </button>
  );
}; 