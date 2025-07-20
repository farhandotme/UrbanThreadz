/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useTheme } from "@/components/ThemeProvider";
import Image from "next/image";
import {
  CreditCard,
  Truck,
  MapPin,
  ShoppingBag,
  Lock,
  CheckCircle,
  User,
  Phone,
  Mail,
  Building,
  Shield,
  Gift,
  Edit3,
  Plus,
  Star,
  Package,
  Clock,
  Tag
} from "lucide-react";

export default function CheckoutPage() {
  const { theme } = useTheme();

  // Address management
  const [address, setAddress] = useState({
    street: "",
    landmark: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });

  const [contactInfo, setContactInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    alternatePhone: "",
  });

  const [showAddressForm, setShowAddressForm] = useState(false);

  // Payment and order management
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const [expressDelivery, setExpressDelivery] = useState(false);

  interface CartItem {
    _id: string;
    name: string;
    quantity: number;
    price: number;
    discountedPrice?: number;
    size?: string;
    color?: string;
    image?: string;
    category?: string;
    brand?: string;
    rating?: number;
  }

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [itemsPrice, setItemsPrice] = useState(0);
  const [addressLoaded, setAddressLoaded] = useState(false);
  const [step] = useState(1);

  // Always use real cart items and images from API response

  useEffect(() => {
    // Prefill address from user profile if available
    axios.get("/api/users/profile").then(res => {
      if (res.data?.address) {
        setAddress((prev) => ({ ...prev, ...res.data.address }));
      }
      // Prefill contact info from user profile fields if available
      setContactInfo((prev) => ({
        ...prev,
        fullName: res.data?.name || prev.fullName,
        email: res.data?.email || prev.email,
        phone: res.data?.phone || prev.phone,
      }));
      setAddressLoaded(true);
    }).catch(() => setAddressLoaded(true));

    // Fetch cart
    axios.get("/api/users/cart").then(res => {
      const items = (res.data || []).map((item: any) => ({
        ...item,
        image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0].url : '',
      }));
      setCartItems(items);
      setItemsPrice(
        items.reduce((total: number, item: CartItem) => total + ((item.discountedPrice || item.price) * item.quantity), 0)
      );
    }).catch(() => {
      // Fallback to empty cart
      setCartItems([]);
      setItemsPrice(0);
    });
  }, []);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactInfo({ ...contactInfo, [e.target.name]: e.target.value });
  };

  const applyPromoCode = () => {
    if (promoCode === "SAVE10") {
      setPromoDiscount(itemsPrice * 0.1);
      toast.success("Promo code applied! 10% discount added.");
    } else if (promoCode === "NEWUSER") {
      setPromoDiscount(200);
      toast.success("Welcome bonus applied! ₹200 off.");
    } else {
      toast.error("Invalid promo code");
      setPromoDiscount(0);
    }
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

      if (!contactInfo.fullName || !contactInfo.email || !contactInfo.phone) {
        toast.error("Please fill all contact information");
        setLoading(false);
        return;
      }

      // Simulate order placement
      setTimeout(() => {
        toast.success("Order placed successfully!");
        setLoading(false);
      }, 2000);

    } catch {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    return address.street && address.city && address.state && address.zipCode &&
      address.country && contactInfo.fullName && contactInfo.email && contactInfo.phone;
  };

  const codCharge = paymentMethod === "COD" ? 29 : 0;
  const totalPrice = itemsPrice - promoDiscount + (expressDelivery ? 99 : 0) + (giftWrap ? 49 : 0) + codCharge;
  const savings = cartItems.reduce((total, item) => total + ((item.price - (item.discountedPrice || item.price)) * item.quantity), 0);

  return (
    <div className={`min-h-screen py-4 px-2 sm:py-8 sm:px-4 transition-all duration-300 ${theme === 'dark'
      ? 'bg-gradient-to-br from-[#18181c] via-[#101014] to-[#18181c]'
      : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className={`text-3xl sm:text-5xl font-bold mb-2 sm:mb-3 ${theme === 'dark' ? 'text-[#f5f5fa]' : 'text-black'}`}>
            Secure Checkout
          </h1>
          <p className={`text-base sm:text-xl ${theme === 'dark' ? 'text-[#bdbdd7]' : 'text-gray-600'}`}>
            Complete your order with confidence
          </p>
          <div className={`mt-3 sm:mt-4 inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${theme === 'dark' ? 'bg-[#23232b] text-green-400' : 'bg-green-50 text-green-700'
            }`}>
            <Shield className="w-4 h-4 mr-2" />
            256-bit SSL Encrypted
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 sm:mb-12">
          <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-4 sm:mb-6">
            {[
              { num: 1, label: "Address & Contact" },
              { num: 2, label: "Payment Method" },
              { num: 3, label: "Review & Place Order" }
            ].map((stepInfo, idx) => (
              <div key={stepInfo.num} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= stepInfo.num
                  ? theme === 'dark' ? 'bg-[#23232b] text-[#f5f5fa] border border-[#39394a]' : 'bg-black text-white'
                  : theme === 'dark' ? 'bg-[#23232b] text-[#39394a] border border-[#23232b]' : 'bg-gray-200 text-gray-500'
                  }`}>
                  {step > stepInfo.num ? <CheckCircle className="w-6 h-6" /> : stepInfo.num}
                </div>
                {idx < 2 && (
                  <div className={`w-20 h-0.5 mx-3 ${step > stepInfo.num
                    ? theme === 'dark' ? 'bg-[#39394a]' : 'bg-black'
                    : theme === 'dark' ? 'bg-[#23232b]' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-4 sm:space-x-12 text-xs sm:text-sm font-medium">
            {[
              { num: 1, label: "Address & Contact" },
              { num: 2, label: "Payment Method" },
              { num: 3, label: "Review & Place Order" }
            ].map((stepInfo) => (
              <span key={stepInfo.num} className={`text-center ${step >= stepInfo.num ? (theme === 'dark' ? 'text-[#f5f5fa]' : 'text-black') : 'text-gray-500'
                }`}>
                {stepInfo.label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 order-2 lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-8 border transition-all duration-300 ${theme === 'dark'
                ? 'bg-[#23232b]/80 border-[#39394a] hover:border-[#4a4a5a]'
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-lg'
                }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-2">
                  <div className="flex items-center">
                    <User className={`w-7 h-7 mr-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                    <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      Contact Information
                    </h2>
                  </div>
                  <Edit3 className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                  <div className="relative">
                    <User className={`absolute left-4 top-4 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      name="fullName"
                      placeholder="Full Name"
                      value={contactInfo.fullName}
                      onChange={handleContactChange}
                      required
                      className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 ${theme === 'dark'
                        ? 'bg-[#18181c] border-[#39394a] text-[#f5f5fa] placeholder-[#bdbdd7] focus:border-[#bdbdd7] focus:ring-[#39394a]'
                        : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black/10'
                        }`}
                    />
                  </div>

                  <div className="relative">
                    <Mail className={`absolute left-4 top-4 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      value={contactInfo.email}
                      onChange={handleContactChange}
                      required
                      className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 ${theme === 'dark'
                        ? 'bg-black border-gray-700 text-white placeholder-gray-500 focus:border-white focus:ring-gray-800'
                        : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black/10'
                        }`}
                    />
                  </div>

                  <div className="relative">
                    <Phone className={`absolute left-4 top-4 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="Phone Number"
                      value={contactInfo.phone}
                      onChange={handleContactChange}
                      required
                      className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 ${theme === 'dark'
                        ? 'bg-black border-gray-700 text-white placeholder-gray-500 focus:border-white focus:ring-gray-800'
                        : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black/10'
                        }`}
                    />
                  </div>

                  <div className="relative">
                    <Phone className={`absolute left-4 top-4 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      name="alternatePhone"
                      type="tel"
                      placeholder="Alternate Phone (Optional)"
                      value={contactInfo.alternatePhone}
                      onChange={handleContactChange}
                      className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 ${theme === 'dark'
                        ? 'bg-black border-gray-700 text-white placeholder-gray-500 focus:border-white focus:ring-gray-800'
                        : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black/10'
                        }`}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-8 border transition-all duration-300 ${theme === 'dark'
                ? 'bg-[#23232b]/80 border-[#39394a] hover:border-[#4a4a5a]'
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-lg'
                }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-2">
                  <div className="flex items-center">
                    <MapPin className={`w-7 h-7 mr-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                    <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      Shipping Address
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'dark'
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                      }`}
                  >
                    <Plus className="w-4 h-4 mr-2 inline" />
                    Add New
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="md:col-span-2 relative">
                    <Building className={`absolute left-4 top-4 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      name="street"
                      placeholder="Street Address, Building Name, Floor"
                      value={address.street}
                      onChange={handleAddressChange}
                      required
                      className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 ${theme === 'dark'
                        ? 'bg-black border-gray-700 text-white placeholder-gray-500 focus:border-white focus:ring-gray-800'
                        : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black/10'
                        }`}
                    />
                  </div>

                  {/* Landmark (optional) */}
                  <div className="md:col-span-2 relative">
                    <MapPin className={`absolute left-4 top-4 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      name="landmark"
                      placeholder="Landmark (Optional)"
                      value={address.landmark}
                      onChange={handleAddressChange}
                      className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 ${theme === 'dark'
                        ? 'bg-black border-gray-700 text-white placeholder-gray-500 focus:border-white focus:ring-gray-800'
                        : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black/10'
                        }`}
                    />
                  </div>

                  <input
                    name="city"
                    placeholder="City"
                    value={address.city}
                    onChange={handleAddressChange}
                    required
                    className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 ${theme === 'dark'
                      ? 'bg-black border-gray-700 text-white placeholder-gray-500 focus:border-white focus:ring-gray-800'
                      : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black/10'
                      }`}
                  />

                  <input
                    name="state"
                    placeholder="State / Province"
                    value={address.state}
                    onChange={handleAddressChange}
                    required
                    className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 ${theme === 'dark'
                      ? 'bg-black border-gray-700 text-white placeholder-gray-500 focus:border-white focus:ring-gray-800'
                      : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black/10'
                      }`}
                  />

                  <input
                    name="zipCode"
                    placeholder="PIN Code / Postal Code"
                    value={address.zipCode}
                    onChange={handleAddressChange}
                    required
                    className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 ${theme === 'dark'
                      ? 'bg-black border-gray-700 text-white placeholder-gray-500 focus:border-white focus:ring-gray-800'
                      : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black/10'
                      }`}
                  />

                  <input
                    name="country"
                    placeholder="Country"
                    value="India"
                    disabled
                    className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 cursor-not-allowed ${theme === 'dark'
                      ? 'bg-black border-gray-700 text-white placeholder-gray-500 focus:border-white focus:ring-gray-800 opacity-70'
                      : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black/10 opacity-70'
                      }`}
                  />
                </div>
              </div>

              {/* Delivery Options */}
              <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-8 border transition-all duration-300 ${theme === 'dark'
                ? 'bg-[#23232b]/80 border-[#39394a] hover:border-[#4a4a5a]'
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-lg'
                }`}>
                <div className="flex items-center mb-4 sm:mb-6">
                  <Truck className={`w-7 h-7 mr-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                  <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Delivery Options
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <label className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${!expressDelivery
                    ? theme === 'dark'
                      ? 'border-white bg-gray-800'
                      : 'border-black bg-black/5'
                    : theme === 'dark'
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-300 hover:border-gray-400'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="delivery"
                          checked={!expressDelivery}
                          onChange={() => setExpressDelivery(false)}
                          className="sr-only"
                        />
                        <Package className="w-6 h-6 mr-4" />
                        <div>
                          <div className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            Standard Delivery
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            5-7 business days
                          </div>
                        </div>
                      </div>
                      <span className={`font-bold text-lg ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                        FREE
                      </span>
                    </div>
                  </label>

                  <label className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${expressDelivery
                    ? theme === 'dark'
                      ? 'border-white bg-gray-800'
                      : 'border-black bg-black/5'
                    : theme === 'dark'
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-300 hover:border-gray-400'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="delivery"
                          checked={expressDelivery}
                          onChange={() => setExpressDelivery(true)}
                          className="sr-only"
                        />
                        <Clock className="w-6 h-6 mr-4" />
                        <div>
                          <div className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            Express Delivery
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            1-2 business days
                          </div>
                        </div>
                      </div>
                      <span className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        ₹99
                      </span>
                    </div>
                  </label>
                </div>

                {/* Gift Wrap Option */}
                <div className="mt-4 sm:mt-6">
                  <label className={`cursor-pointer flex items-center p-4 rounded-xl border-2 transition-all duration-300 ${giftWrap
                    ? theme === 'dark'
                      ? 'border-white bg-gray-800'
                      : 'border-black bg-black/5'
                    : theme === 'dark'
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-300 hover:border-gray-400'
                    }`}>
                    <input
                      type="checkbox"
                      checked={giftWrap}
                      onChange={(e) => setGiftWrap(e.target.checked)}
                      className="sr-only"
                    />
                    <Gift className="w-6 h-6 mr-4" />
                    <div className="flex-1">
                      <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        Gift Wrapping
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Beautiful gift wrap with ribbon
                      </div>
                    </div>
                    <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                      ₹49
                    </span>
                  </label>
                </div>
              </div>

              {/* Payment Method */}
              <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-8 border transition-all duration-300 ${theme === 'dark'
                ? 'bg-[#23232b]/80 border-[#39394a] hover:border-[#4a4a5a]'
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-lg'
                }`}>
                <div className="flex items-center mb-6 sm:mb-8">
                  <CreditCard className={`w-7 h-7 mr-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                  <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Payment Method
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Cash on Delivery */}
                  <label className={`cursor-pointer px-3 py-4 sm:p-6 rounded-xl border-2 flex items-center transition-all duration-300 ${paymentMethod === "COD"
                    ? theme === 'dark'
                      ? 'border-white bg-gray-800'
                      : 'border-black bg-black/5'
                    : theme === 'dark'
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-300 hover:border-gray-400'
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="sr-only"
                    />
                    <Truck className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-base sm:text-lg flex items-center ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                        Cash on Delivery
                        <span className="font-normal text-xs ml-2 px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 whitespace-nowrap">+₹29 COD charge</span>
                      </div>
                      <div className={`text-xs sm:text-sm mt-0.5 sm:mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Pay with cash when your order arrives. <span className="font-semibold">Extra ₹29 charge applies.</span>
                      </div>
                    </div>
                  </label>

                  {/* Online Payment / UPI */}
                  <label className={`cursor-pointer px-3 py-4 sm:p-6 rounded-xl border-2 flex items-center transition-all duration-300 ${paymentMethod === "UPI"
                    ? theme === 'dark'
                      ? 'border-white bg-gray-800'
                      : 'border-black bg-black/5'
                    : theme === 'dark'
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-300 hover:border-gray-400'
                    }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={paymentMethod === "UPI"}
                      onChange={() => setPaymentMethod("UPI")}
                      className="sr-only"
                    />
                    <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-base sm:text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Online Payment / UPI</div>
                      <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                        <Image src="/gpay.png" alt="GPay" width={20} height={20} className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
                        <Image src="/phonepe.png" alt="PhonePe" width={20} height={20} className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
                        <Image src="/bhim.png" alt="BHIM" width={20} height={20} className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
                      </div>
                      <div className={`text-xs sm:text-sm mt-0.5 sm:mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Pay securely with UPI, Cards, Net Banking & Wallets</div>
                    </div>
                  </label>
                </div>

                {paymentMethod === "UPI" && (
                  <div className={`mt-6 p-6 rounded-xl ${theme === 'dark' ? 'bg-black border border-gray-800' : 'bg-gray-50'
                    }`}>
                    <div className="flex items-center text-sm mb-4">
                      <Lock className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                        Secured by Razorpay SSL encryption. Supports UPI, Cards, Net Banking & Digital Wallets
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Image src="/gpay.png" alt="GPay" width={32} height={32} className="h-8 w-8 rounded" />
                      <Image src="/phonepe.png" alt="PhonePe" width={32} height={32} className="h-8 w-8 rounded" />
                      <Image src="/bhim.png" alt="BHIM" width={32} height={32} className="h-8 w-8 rounded" />
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700 border'}`}>Visa</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700 border'}`}>Mastercard</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700 border'}`}>PayTM</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-8 border transition-all duration-300 ${theme === 'dark'
                ? 'bg-[#23232b]/80 border-[#39394a] hover:border-[#4a4a5a]'
                : 'bg-white border-gray-200 hover:border-gray-300 shadow-lg'
                }`}>
                <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  Special Instructions (Optional)
                </h3>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Any special instructions for delivery or packaging..."
                  rows={3}
                  className={`w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 resize-none text-sm sm:text-base ${theme === 'dark'
                    ? 'bg-black border-gray-700 text-white placeholder-gray-500 focus:border-white focus:ring-gray-800'
                    : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black/10'
                    }`}
                />
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading || !addressLoaded || !validateForm()}
                className={`w-full py-4 sm:py-6 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-50 ${theme === 'dark'
                  ? 'bg-white text-black hover:bg-gray-100 shadow-2xl'
                  : 'bg-black text-white hover:bg-gray-800 shadow-2xl'
                  } disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-current border-t-transparent mr-2 sm:mr-3" />
                    <span className="text-sm sm:text-base">Processing Your Order...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    <span>Place Secure Order - ₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </button>

              <div className={`text-center text-xs sm:text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                By placing this order, you agree to our Terms of Service and Privacy Policy
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-8 border sticky top-4 sm:top-8 ${theme === 'dark'
              ? 'bg-[#23232b]/80 border-[#39394a]'
              : 'bg-white border-gray-200 shadow-lg'
              }`}>
              <div className="flex items-center mb-6 sm:mb-8">
                <ShoppingBag className={`w-6 h-6 sm:w-7 sm:h-7 mr-3 sm:mr-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
                <h2 className={`text-xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  Order Summary
                </h2>
              </div>

              {/* Promo Code */}
              <div className="mb-6 sm:mb-8">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className={`absolute left-4 top-4 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-2 ${theme === 'dark'
                        ? 'bg-black border-gray-700 text-white placeholder-gray-500 focus:border-white focus:ring-gray-800'
                        : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:border-black focus:ring-black/10'
                        }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyPromoCode}
                    className={`px-6 py-4 rounded-xl font-bold transition-all duration-300 ${theme === 'dark'
                      ? 'bg-white text-black hover:bg-gray-100'
                      : 'bg-black text-white hover:bg-gray-800'
                      }`}
                  >
                    Apply
                  </button>
                </div>
                {promoDiscount > 0 && (
                  <div className={`mt-3 flex items-center text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Promo applied! You saved ₹{promoDiscount.toLocaleString('en-IN')}
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <ShoppingBag className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-base sm:text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Your cart is empty
                    </p>
                  </div>
                ) : (
                  cartItems.map((item, idx) => (
                    <div key={item._id || idx} className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-6 rounded-xl sm:rounded-2xl ${theme === 'dark' ? 'bg-[#18181c] border border-[#39394a]' : 'bg-gray-50'
                      }`}>
                      {/* Product Image and Quantity Badge */}
                      <div className="relative">
                        <Image
                          src={item.image && item.image.trim() !== '' ? item.image : "/logo.png"}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-lg sm:rounded-xl"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/logo.png";
                          }}
                          unoptimized={!!item.image && item.image.startsWith("http")}
                        />
                        <div className={`absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'
                          }`}>
                          {item.quantity}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-base sm:text-lg mb-1 sm:mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'} truncate`}>
                          {item.name}
                        </h4>

                        <div className="space-y-0.5 sm:space-y-1">
                          {item.brand && (
                            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              by {item.brand}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm">
                            {item.size && (
                              <span className={`px-2 py-1 rounded-md ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600 border'
                                }`}>
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className={`px-2 py-1 rounded-md ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600 border'
                                }`}>
                                {item.color}
                              </span>
                            )}
                          </div>

                          {item.rating && (
                            <div className="flex items-center gap-0.5 sm:gap-1">
                              <Star className={`w-3 h-3 sm:w-4 sm:h-4 fill-current ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
                              <span className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                {item.rating}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className={`font-bold text-base sm:text-lg ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                          ₹{((item.discountedPrice || item.price) * item.quantity).toLocaleString('en-IN')}
                        </div>
                        {item.discountedPrice && item.discountedPrice < item.price && (
                          <div className={`text-xs sm:text-sm line-through ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Order Totals */}
              {cartItems.length > 0 && (
                <div className={`space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t ${theme === 'dark' ? 'border-[#39394a]' : 'border-gray-200'}`}>
                  <div className="flex justify-between text-lg">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Subtotal</span>
                    <span className={theme === 'dark' ? 'text-white' : 'text-black'}>
                      ₹{itemsPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-lg">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>You Save</span>
                      <span className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                        -₹{savings.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-lg">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Promo Discount</span>
                      <span className={`font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                        -₹{promoDiscount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Shipping</span>
                    <span className={`font-semibold ${expressDelivery
                      ? (theme === 'dark' ? 'text-white' : 'text-black')
                      : (theme === 'dark' ? 'text-green-400' : 'text-green-600')
                      }`}>
                      {expressDelivery ? '₹99' : 'FREE'}
                    </span>
                  </div>

                  {giftWrap && (
                    <div className="flex justify-between text-lg">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Gift Wrapping</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-black'}>₹49</span>
                    </div>
                  )}

                  {paymentMethod === "COD" && (
                    <div className="flex justify-between text-lg">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Cash on Delivery Charge</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-black'}>₹29</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg">
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Tax (GST)</span>
                    <span className={theme === 'dark' ? 'text-white' : 'text-black'}>Included</span>
                  </div>

                  <div className={`flex justify-between text-xl sm:text-2xl font-bold pt-3 sm:pt-4 border-t ${theme === 'dark' ? 'border-gray-800 text-white' : 'border-gray-200 text-black'
                    }`}>
                    <span>Total</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>

                  <div className={`text-center text-xs sm:text-sm pt-1 sm:pt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Inclusive of all taxes
                  </div>
                </div>
              )}

              {/* Trust Indicators */}
              <div className={`mt-6 sm:mt-8 pt-4 sm:pt-6 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center">
                    <Shield className={`w-5 h-5 mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      Secure Payment
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Truck className={`w-5 h-5 mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      Free Returns
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className={`w-5 h-5 mr-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      Quality Assured
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Phone className={`w-5 h-5 mr-2 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      24/7 Support
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className={`mt-8 sm:mt-12 text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl ${theme === 'dark' ? 'bg-[#23232b]/80 border border-[#39394a]' : 'bg-gray-50'
          }`}>
          <div className="flex items-center justify-center mb-2 sm:mb-3">
            <Lock className={`w-5 h-5 sm:w-6 sm:h-6 mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
            <span className={`text-base sm:text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              Your information is protected
            </span>
          </div>
          <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            We use industry-standard encryption to protect your personal and payment information.
            <br />
            Your data is never stored or shared with third parties without your consent.
          </p>
        </div>
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
