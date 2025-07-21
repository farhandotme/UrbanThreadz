"use client";
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useState, useCallback } from 'react'
import { X, ShoppingCart, Trash2, Minus, Plus } from 'lucide-react'
import axios from 'axios'
import Image from 'next/image'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CartItem {
  _id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  images: { url: string }[];
  isAvailable: boolean;
  totalStock: number;
  quantity: number;
  size?: string;
}

const Cart = ({ isOpen, onClose }: CartProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const fetchCartItems = useCallback(async (retry = true) => {
    if (!session?.user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('/api/users/cart');
      if (process.env.NODE_ENV === 'development') {
        console.log('Cart API response:', response.data);
      }
      let items: CartItem[] = [];
      if (Array.isArray(response.data)) {
        items = response.data;
      } else if (response.data && Array.isArray(response.data.cart)) {
        items = response.data.cart;
      }
      if (Array.isArray(items)) {
        const validItems = items.filter(item =>
          item && typeof item === 'object' &&
          item._id && item.name && Array.isArray(item.images)
        );
        setCartItems(validItems);
      } else {
        setCartItems([]);
        console.error('Invalid cart data received:', response.data);
        toast.error('Cart data format error.');
      }
    } catch (error) {
      setCartItems([]);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error('Please sign in to view your cart');
        } else if (error.response?.status === 500 && retry) {
          console.log('Retrying cart fetch...');
          setTimeout(() => fetchCartItems(false), 1000);
          return;
        } else {
          toast.error('Failed to load cart items. Please try again.');
          if (error.response) {
            console.error('Cart API error response:', error.response.data);
          }
        }
      } else {
        toast.error('An unexpected error occurred');
        console.error('Cart fetch error:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (isOpen) {
      fetchCartItems();
    }
  }, [isOpen, fetchCartItems]);

  const handleQuantityChange = async (productId: string, delta: number) => {
    if (!session) {
      toast.error('Please sign in to update cart');
      return;
    }

    const item = cartItems.find(i => i._id === productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity < 1 || newQuantity > 10) {
      toast.error('Quantity must be between 1 and 10');
      return;
    }

    try {
      await axios.patch('/api/users/cart', { productId, quantity: newQuantity });
      setCartItems(prev =>
        prev.map(item =>
          item._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      toast.success(`Updated quantity to ${newQuantity}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error('Please sign in to update cart');
      } else {
        toast.error(`Failed to update quantity: ${errorMessage}`);
      }
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!session) {
      toast.error('Please sign in to remove items from cart');
      return;
    }

    try {
      const response = await axios.delete('/api/users/cart', {
        data: { productId },
        withCredentials: true // Include credentials in the request
      });

      if (response.data.success) {
        setCartItems(prev => prev.filter(item => item._id !== productId));
        toast.success('Item removed from cart');
      } else {
        throw new Error(response.data.error || 'Failed to remove item');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error('Please sign in to remove items from cart');
      } else {
        toast.error(`Failed to remove item: ${errorMessage}`);
        console.error('Error removing item from cart:', error);
      }
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.discountedPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    window.location.href = '/checkout';
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-[var(--background)] shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-[var(--foreground)]">Shopping cart</Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-[var(--secondary)] hover:text-[var(--foreground)]"
                            onClick={onClose}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Close panel</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          {loading ? (
                            <div className="space-y-6">
                              {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex py-6 animate-pulse">
                                  {/* Product image skeleton */}
                                  <div className="h-24 w-24 flex-shrink-0 rounded-md bg-[var(--neutral)]" />

                                  <div className="ml-4 flex flex-1 flex-col">
                                    {/* Product details skeleton */}
                                    <div className="flex justify-between mb-4">
                                      <div className="space-y-3 flex-1">
                                        <div className="h-4 bg-[var(--neutral)] rounded w-3/4" />
                                        <div className="h-3 bg-[var(--neutral)] rounded w-1/2" />
                                      </div>
                                      <div className="h-4 w-16 bg-[var(--neutral)] rounded ml-4" />
                                    </div>

                                    {/* Actions skeleton */}
                                    <div className="flex items-end justify-between mt-auto">
                                      <div className="flex items-center space-x-2">
                                        <div className="h-8 w-8 bg-[var(--neutral)] rounded" />
                                        <div className="h-6 w-8 bg-[var(--neutral)] rounded" />
                                        <div className="h-8 w-8 bg-[var(--neutral)] rounded" />
                                      </div>
                                      <div className="h-8 w-8 bg-[var(--neutral)] rounded" />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {/* Skeleton footer */}
                              <div className="border-t border-[var(--border)] pt-6 mt-6">
                                <div className="flex justify-between mb-4">
                                  <div className="h-4 w-20 bg-[var(--neutral)] rounded" />
                                  <div className="h-4 w-24 bg-[var(--neutral)] rounded" />
                                </div>
                                <div className="h-10 w-full bg-[var(--neutral)] rounded mt-4" />
                              </div>
                            </div>
                          ) : cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                              <ShoppingCart className="h-16 w-16 text-[var(--secondary)] mb-4" />
                              <p className="text-[var(--secondary)] text-lg mb-8">Your cart is empty</p>
                              <button
                                onClick={onClose}
                                className="inline-flex items-center px-4 py-2 border border-[var(--foreground)] text-sm font-medium rounded-md text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors"
                              >
                                Continue Shopping
                              </button>
                            </div>
                          ) : (
                            <ul role="list" className="-my-6 divide-y divide-[var(--border)]">
                              {cartItems.map((item) => (
                                <li key={item._id} className="flex py-6">
                                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-[var(--border)]">
                                    <Image
                                      src={item.images[0].url}
                                      alt={item.name}
                                      fill
                                      className="object-cover object-center"
                                    />
                                  </div>

                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                      <div className="flex justify-between text-base font-medium text-[var(--foreground)]">
                                        <h3>{item.name}</h3>
                                        <p className="ml-4">₹{item.discountedPrice || item.price}</p>
                                      </div>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      <div className="flex items-center space-x-3">
                                        <button
                                          onClick={() => handleQuantityChange(item._id, -1)}
                                          disabled={item.quantity === 1}
                                          className="p-1 rounded-full hover:bg-[var(--neutral)] disabled:opacity-50 text-[var(--foreground)]"
                                        >
                                          <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="font-medium text-[var(--foreground)]">{item.quantity}</span>
                                        <button
                                          onClick={() => handleQuantityChange(item._id, 1)}
                                          disabled={item.quantity === 10}
                                          className="p-1 rounded-full hover:bg-[var(--neutral)] disabled:opacity-50 text-[var(--foreground)]"
                                        >
                                          <Plus className="h-4 w-4" />
                                        </button>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => removeFromCart(item._id)}
                                        className="font-medium text-red-600 hover:text-red-500"
                                      >
                                        <Trash2 className="h-5 w-5" />
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    {cartItems.length > 0 && (
                      <div className="border-t border-[var(--border)] px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-[var(--foreground)]">
                          <p>Subtotal</p>
                          <p>₹{calculateSubtotal().toLocaleString('en-IN')}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-[var(--secondary)]">Shipping and taxes calculated at checkout.</p>
                        <div className="mt-6">
                          <button
                            type="button"
                            onClick={handleCheckout}
                            className="w-full flex items-center justify-center rounded-md border border-transparent bg-[var(--primary)] px-6 py-3 text-base font-medium text-[var(--primary-foreground)] shadow-sm hover:opacity-90"
                          >
                            Checkout
                          </button>
                        </div>
                        <div className="mt-6 flex justify-center text-center text-sm text-[var(--secondary)]">
                          <p>
                            or{' '}
                            <button
                              type="button"
                              className="font-medium text-[var(--foreground)] hover:opacity-80"
                              onClick={onClose}
                            >
                              Continue Shopping
                              <span aria-hidden="true"> &rarr;</span>
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default Cart
