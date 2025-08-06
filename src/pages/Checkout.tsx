import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { orderService } from '../services/order';
import { cartService } from '../services/cart';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface CartItem {
  artwork: string;
  quantity: number;
  artworkDetails: {
    title: string;
    price: number;
    images: string[];
    artist: {
      name: string;
    };
  };
}

const Checkout: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await cartService.getCart();
      setCartItems(response.data.items || []);
      setTotalAmount(response.data.totalAmount || 0);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
      toast.error('Please fill in all shipping address fields');
      return;
    }

    try {
      setLoading(true);
      const response = await orderService.createCheckoutSession(shippingAddress);
      
      // Redirect to Stripe checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to proceed to checkout');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (artworkId: string, quantity: number) => {
    try {
      await cartService.updateCartItem(artworkId, quantity);
      await fetchCart();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (artworkId: string) => {
    try {
      await cartService.removeFromCart(artworkId);
      await fetchCart();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Please Login</h2>
          <p className="text-gray-500 mb-4">You need to be logged in to checkout</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Order Summary
              </h2>

              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <button
                    onClick={() => navigate('/browse')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Browse Artwork
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.artwork} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <img
                        src={item.artworkDetails.images[0] || '/images/artwork-modern-1.jpeg'}
                        alt={item.artworkDetails.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.artworkDetails.title}</h3>
                        <p className="text-sm text-gray-600">by {item.artworkDetails.artist.name}</p>
                        <p className="text-sm text-gray-600">${item.artworkDetails.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.artwork, Math.max(1, item.quantity - 1))}
                          className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.artwork, item.quantity + 1)}
                          className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.artwork)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="NY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10001"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Total */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Order Total
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || cartItems.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                <span>{loading ? 'Processing...' : 'Proceed to Payment'}</span>
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                You will be redirected to Stripe to complete your payment securely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 