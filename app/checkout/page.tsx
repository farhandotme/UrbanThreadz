"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useTheme } from "@/components/ThemeProvider";
import { CreditCard, Truck, MapPin, ShoppingBag, Lock, CheckCircle } from "lucide-react";

export default function CheckoutPage() {
  const { theme } = useTheme();
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  interface CartItem {
    _id: string;
    name: string;
    quantity: number;
    price: number;
    discountedPrice?: number;
    size?: string;
  }

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [itemsPrice, setItemsPrice] = useState(0);
  const [addressLoaded, setAddressLoaded] = useState(false);
  const [step] = useState(1);

  useEffect(() => {
    // Prefill address from user profile if available
    axios.get("/api/users/profile").then(res => {
      if (res.data?.address) {
        setAddress((prev) => ({ ...prev, ...res.data.address }));
      }
      setAddressLoaded(true);
    }).catch(() => setAddressLoaded(true));
    
    // Fetch cart
    axios.get("/api/users/cart").then(res => {
      setCartItems(res.data || []);
      setItemsPrice(
        (res.data || []).reduce((total: number, item: CartItem) => total + ((item.discountedPrice || item.price) * item.quantity), 0)
      );
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!address.street || !address.city || !address.state || !address.zipCode || !address.country) {
        toast.error("Please fill all address fields");
        setLoading(false);
        return;
      }

      
    } catch {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const validateAddress = () => {
    return address.street && address.city && address.state && address.zipCode && address.country;
  };

  return (
    <div className={`min-h-screen py-8 px-4 transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#18181c] via-[#101014] to-[#18181c]' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-[#f5f5fa]' : 'text-black'}`}>
            Checkout
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-[#bdbdd7]' : 'text-gray-600'}`}>
            Complete your order securely
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-center items-center space-x-4 mb-6">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step >= stepNum 
                    ? theme === 'dark' ? 'bg-[#23232b] text-[#f5f5fa] border border-[#39394a]' : 'bg-black text-white'
                    : theme === 'dark' ? 'bg-[#23232b] text-[#39394a]' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > stepNum ? <CheckCircle className="w-5 h-5" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNum 
                      ? theme === 'dark' ? 'bg-[#39394a]' : 'bg-black'
                      : theme === 'dark' ? 'bg-[#23232b]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-8 text-sm">
            <span className={step >= 1 ? (theme === 'dark' ? 'text-[#f5f5fa]' : 'text-black') : 'text-gray-500'}>
              Address
            </span>
            <span className={step >= 2 ? (theme === 'dark' ? 'text-[#f5f5fa]' : 'text-black') : 'text-gray-500'}>
              Payment
            </span>
            <span className={step >= 3 ? (theme === 'dark' ? 'text-[#f5f5fa]' : 'text-black') : 'text-gray-500'}>
              Review
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Address */}
              <div className={`rounded-2xl p-6 border-2 transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-[#23232b]/80 border-[#39394a] hover:border-[#4a4a5a]' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              } backdrop-blur-sm`}>
                <div className="flex items-center mb-6">
                  <MapPin className={`w-6 h-6 mr-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Shipping Address
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input
                      name="street"
                      placeholder="Street Address"
                      value={address.street}
                      onChange={handleChange}
                      required
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-offset-2 ${
                        theme === 'dark'
                          ? 'bg-[#18181c] border-[#39394a] text-[#f5f5fa] placeholder-[#bdbdd7] focus:border-[#bdbdd7] focus:ring-[#39394a]'
                          : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black'
                      }`}
                    />
                  </div>
                  <input
                    name="city"
                    placeholder="City"
                    value={address.city}
                    onChange={handleChange}
                    required
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-offset-2 ${
                      theme === 'dark'
                        ? 'bg-[#18181c] border-[#39394a] text-[#f5f5fa] placeholder-[#bdbdd7] focus:border-[#bdbdd7] focus:ring-[#39394a]'
                        : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black'
                    }`}
                  />
                  <input
                    name="state"
                    placeholder="State"
                    value={address.state}
                    onChange={handleChange}
                    required
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-offset-2 ${
                      theme === 'dark'
                        ? 'bg-[#18181c] border-[#39394a] text-[#f5f5fa] placeholder-[#bdbdd7] focus:border-[#bdbdd7] focus:ring-[#39394a]'
                        : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black'
                    }`}
                  />
                  <input
                    name="zipCode"
                    placeholder="PIN Code"
                    value={address.zipCode}
                    onChange={handleChange}
                    required
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-offset-2 ${
                      theme === 'dark'
                        ? 'bg-[#18181c] border-[#39394a] text-[#f5f5fa] placeholder-[#bdbdd7] focus:border-[#bdbdd7] focus:ring-[#39394a]'
                        : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black'
                    }`}
                  />
                  <input
                    name="country"
                    placeholder="Country"
                    value={address.country}
                    onChange={handleChange}
                    required
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-offset-2 ${
                      theme === 'dark'
                        ? 'bg-[#18181c] border-[#39394a] text-[#f5f5fa] placeholder-[#bdbdd7] focus:border-[#bdbdd7] focus:ring-[#39394a]'
                        : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black'
                    }`}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className={`rounded-2xl p-6 border-2 transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-[#23232b]/80 border-[#39394a] hover:border-[#4a4a5a]' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              } backdrop-blur-sm`}>
                <div className="flex items-center mb-6">
                  <CreditCard className={`w-6 h-6 mr-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                  <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Payment Method
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                    paymentMethod === "COD"
                      ? theme === 'dark' 
                        ? 'border-[#bdbdd7] bg-[#23232b]' 
                        : 'border-black bg-black/5'
                      : theme === 'dark' 
                        ? 'border-[#39394a] hover:border-[#bdbdd7]' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="sr-only"
                      />
                      <Truck className="w-5 h-5 mr-3" />
                      <div>
                        <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                          Cash on Delivery
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Pay when you receive
                        </div>
                      </div>
                    </div>
                  </label>

                  <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                    paymentMethod === "UPI"
                      ? theme === 'dark' 
                        ? 'border-[#bdbdd7] bg-[#23232b]' 
                        : 'border-black bg-black/5'
                      : theme === 'dark' 
                        ? 'border-[#39394a] hover:border-[#bdbdd7]' 
                        : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="UPI"
                        checked={paymentMethod === "UPI"}
                        onChange={() => setPaymentMethod("UPI")}
                        className="sr-only"
                      />
                      <CreditCard className="w-5 h-5 mr-3" />
                      <div>
                        <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                          UPI / Card
                        </div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Pay online securely
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                {paymentMethod === "UPI" && (
                  <div className={`mt-4 p-4 rounded-xl ${
                    theme === 'dark' ? 'bg-[#18181c]' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center text-sm">
                      <Lock className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        Secured by Razorpay. Supports UPI, Cards, Net Banking & Wallets
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading || !addressLoaded || !validateAddress()}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:opacity-50 ${
                  theme === 'dark'
                    ? 'bg-[#39394a] text-[#f5f5fa] hover:bg-[#23232b] shadow-lg hover:shadow-[#bdbdd7]/10'
                    : 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-black/10'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent mr-2" />
                    Processing...
                  </div>
                ) : (
                  `Place Order - ₹${itemsPrice.toLocaleString('en-IN')}`
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl p-6 border-2 sticky top-8 ${
              theme === 'dark' 
                ? 'bg-[#23232b]/80 border-[#39394a]' 
                : 'bg-white border-gray-200'
            } backdrop-blur-sm`}>
              <div className="flex items-center mb-6">
                <ShoppingBag className={`w-6 h-6 mr-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  Order Summary
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                {cartItems.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-[#39394a]' : 'text-gray-400'}`} />
                      <p className={`text-lg ${theme === 'dark' ? 'text-[#bdbdd7]' : 'text-gray-600'}`}>
                        Your cart is empty
                      </p>
                    </div>
                ) : (
                  cartItems.map((item, idx) => (
                    <div key={item._id || idx} className={`flex items-center justify-between p-4 rounded-xl ${
                      theme === 'dark' ? 'bg-[#18181c]' : 'bg-gray-50'
                    }`}>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                          {item.name}
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Qty: {item.quantity}
                          {item.size && ` • Size: ${item.size}`}
                        </p>
                      </div>
                      <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        ₹{((item.discountedPrice || item.price) * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-[#bdbdd7]' : 'text-gray-600'}>Subtotal</span>
                    <span className={theme === 'dark' ? 'text-[#f5f5fa]' : 'text-black'}>
                      ₹{itemsPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-[#bdbdd7]' : 'text-gray-600'}>Shipping</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      FREE
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={theme === 'dark' ? 'text-[#bdbdd7]' : 'text-gray-600'}>Tax</span>
                    <span className={theme === 'dark' ? 'text-[#f5f5fa]' : 'text-black'}>₹0</span>
                  </div>
                  <div className={`flex justify-between text-xl font-bold pt-3 border-t ${
                    theme === 'dark' ? 'border-[#39394a] text-[#f5f5fa]' : 'border-gray-200 text-black'
                  }`}>
                    <span>Total</span>
                    <span>₹{itemsPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}