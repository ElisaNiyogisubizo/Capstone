import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { cartService } from '../services/cart';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface CartIconProps {
  className?: string;
}

export const CartIcon: React.FC<CartIconProps> = ({ className = '' }) => {
  const [cartCount, setCartCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await cartService.getCart();
      setCartItems(response.data.items || []);
      setCartCount(response.data.itemCount || 0);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const removeFromCart = async (artworkId: string) => {
    try {
      setLoading(true);
      await cartService.removeFromCart(artworkId);
      await fetchCart();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (artworkId: string, quantity: number) => {
    try {
      setLoading(true);
      await cartService.updateCartItem(artworkId, quantity);
      await fetchCart();
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartService.clearCart();
      await fetchCart();
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = cartItems.reduce((total, item) => {
    return total + (item.artworkDetails?.price || 0) * item.quantity;
  }, 0);

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`relative p-2 text-gray-600 hover:text-gray-900 transition-colors ${className}`}
      >
        <ShoppingCart className="w-6 h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>

      {/* Cart Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Shopping Cart</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.artwork} className="flex items-center space-x-3 p-3 border rounded">
                      <img
                        src={item.artworkDetails?.images?.[0] || '/placeholder.jpg'}
                        alt={item.artworkDetails?.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.artworkDetails?.title}</h3>
                        <p className="text-sm text-gray-600">
                          ${item.artworkDetails?.price}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.artwork, Math.max(1, item.quantity - 1))}
                            disabled={loading}
                            className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.artwork, item.quantity + 1)}
                            disabled={loading}
                            className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.artwork)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={clearCart}
                      disabled={loading}
                      className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
                    >
                      Clear Cart
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        // Navigate to checkout
                        window.location.href = '/checkout';
                      }}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}; 