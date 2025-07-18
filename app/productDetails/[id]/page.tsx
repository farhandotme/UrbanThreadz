"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Heart, ShoppingCart, ChevronLeft, ChevronRight, Star, Tag } from "lucide-react";
import { toast, Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";

interface ProductImage {
  url: string;
  alt: string;
  isMain: boolean;
}
interface ProductSize {
  name: string;
  stock: number;
}
interface Product {
  _id: string;
  name: string;
  images: ProductImage[];
  realPrice: number;
  discountedPrice: number;
  description: string;
  shortDescription: string;
  sizes: ProductSize[];
  category: string;
  tags: string[];
  isAvailable: boolean;
  totalStock: number;
  avgRating?: number;
  numReviews?: number;
  discountPercentage?: number;
}
interface WishlistItem {
  _id: string;
  productId: string;
}

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0].name);
      } catch {
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    }
    async function checkWishlist() {
      if (session?.user) {
        try {
          const { data } = await axios.get("/api/users/wishlistProducts");
          // data.products is the array of wishlisted products
          const wishlistItems = Array.isArray(data.products) ? data.products : [];
          setIsWishlisted(wishlistItems.some((item: WishlistItem) => item._id === id));
        } catch {
          setIsWishlisted(false);
        }
      }
    }
    fetchProduct();
    checkWishlist();
  }, [id, session]);

  // Image slider logic
  const handlePrevImage = () => {
    if (isSliding || !product) return;
    setIsSliding(true);
    setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    setTimeout(() => setIsSliding(false), 300);
  };
  const handleNextImage = () => {
    if (isSliding || !product) return;
    setIsSliding(true);
    setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsSliding(false), 300);
  };
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!isSliding) {
      const swipeDistance = touchStart - touchEnd;
      const minSwipeDistance = 50;
      if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0) handleNextImage();
        else handlePrevImage();
      }
    }
  };

  // Cart and wishlist actions
  // const handleAddToCart = async () => {
  //   if (!session) {
  //     toast.error("Please sign in to add to cart");
  //     return;
  //   }
  //   if (!selectedSize) {
  //     toast.error("Please select a size");
  //     return;
  //   }
  //   try {
  //     await axios.post("/api/users/cart", { productId: id, quantity, size: selectedSize });
  //     toast.success("Added to cart!");
  //   } catch {
  //     toast.error("Failed to add to cart");
  //   }
  // };
  const handleWishlist = async () => {
    if (!session) {
      toast.error("Please sign in to use wishlist");
      return;
    }
    try {
      if (isWishlisted) {
        await axios.delete(`/api/users/wishlist?productId=${id}`);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await axios.post("/api/users/wishlist", { productId: id });
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-12 h-12 border-4 border-[var(--neutral)] border-t-[var(--primary)] rounded-full animate-spin" />
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 max-w-md mx-auto">
          <p className="text-red-900 font-semibold text-lg mb-2">Something went wrong</p>
          <p className="text-red-700">{error || "Product not found"}</p>
        </div>
      </div>
    );
  }

  const availableSizes = product.sizes.filter((s) => s.stock > 0);
  const discount = product.discountedPrice < product.realPrice ? Math.round(((product.realPrice - product.discountedPrice) / product.realPrice) * 100) : 0;

  return (
    <div className="min-h-screen bg-[var(--background)] pt-16 pb-4 flex flex-col">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--neutral)] transition-colors font-medium shadow"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block"><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </button>
      </div>
      <Toaster />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Slider */}
        <div className="relative w-full order-1 lg:order-1">
          <div
            className="aspect-square rounded-2xl overflow-hidden border-2 border-[var(--border)] max-h-[600px] bg-[var(--neutral)]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
              >
                <Image
                  src={product.images[currentImageIndex]?.url || "/placeholder.jpg"}
                  alt={product.images[currentImageIndex]?.alt || product.name}
                  fill
                  className="object-contain p-2"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-bold px-2 py-1 rounded-full shadow">
                    -{discount}%
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-10">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isSliding) {
                      setIsSliding(true);
                      setCurrentImageIndex(index);
                      setTimeout(() => setIsSliding(false), 300);
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${currentImageIndex === index
                    ? "bg-[var(--foreground)] w-4"
                    : "bg-[var(--border)] hover:bg-[var(--foreground)]"
                    }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>
          {/* Arrows */}
          {product.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 p-2 rounded-full bg-[var(--foreground)]/80 text-[var(--background)] hover:bg-[var(--foreground)] transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 p-2 rounded-full bg-[var(--foreground)]/80 text-[var(--background)] hover:bg-[var(--foreground)] transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight size={20} className="sm:w-6 sm:h-6" />
              </button>
            </>
          )}
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="mt-4 sm:mt-6 grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isSliding) {
                      setIsSliding(true);
                      setCurrentImageIndex(index);
                      setTimeout(() => setIsSliding(false), 300);
                    }
                  }}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${currentImageIndex === index
                    ? "border-[var(--foreground)] scale-95"
                    : "border-[var(--border)] hover:border-[var(--foreground)]"
                    }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={image.url}
                      alt={image.alt || `Product image ${index + 1}`}
                      fill
                      className="object-contain p-1"
                      sizes="(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 10vw"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Product Info */}
        <div className="flex flex-col gap-4 sm:gap-6 order-2 lg:order-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-3 tracking-tight leading-tight">
              {product.name}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
              <div className="flex items-center">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm font-medium">
                  {product.avgRating || 0} ({product.numReviews || 0} reviews)
                </span>
              </div>
              <span className="text-gray-300 hidden sm:block">|</span>
              <span className="text-sm text-[var(--secondary)]">
                Category: {product.category}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-3">
              <span className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                ₹{product.discountedPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <div className="flex items-center gap-2 sm:gap-4">
                {product.discountedPrice < product.realPrice && (
                  <span className="text-lg sm:text-xl text-[var(--secondary)] line-through">
                    ₹{product.realPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-green-500 font-medium text-sm sm:text-base">{discount}% off</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
              {product.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-[var(--neutral)] text-[var(--neutral-foreground)] rounded-full text-xs">
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
            <div className="mb-4">
              <p className="text-[var(--secondary)] text-sm mb-2">{product.shortDescription}</p>
              <p className="text-[var(--card-foreground)] text-sm sm:text-base whitespace-pre-line leading-relaxed">{product.description}</p>
            </div>
          </div>
          {/* Size Selector */}
          {availableSizes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-medium mb-3 text-[var(--foreground)]">Select Size</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {availableSizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size.name)}
                    className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg border-2 transition-all duration-200 text-sm font-semibold ${selectedSize === size.name
                      ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] hover:border-[var(--foreground)]"
                      }`}
                  >
                    {size.name}
                    {size.stock < 5 && (
                      <span className="block sm:inline sm:ml-2 text-xs text-red-500">Only {size.stock} left</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Quantity Selector */}
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-medium mb-3 text-[var(--foreground)]">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-lg border-2 border-[var(--border)] flex items-center justify-center hover:border-[var(--foreground)] transition-colors font-medium"
                disabled={quantity === 1}
              >
                -
              </button>
              <span className="text-lg font-medium min-w-[2rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((prev) => Math.min(product.totalStock, prev + 1))}
                className="w-10 h-10 rounded-lg border-2 border-[var(--border)] flex items-center justify-center hover:border-[var(--foreground)] transition-colors font-medium"
                disabled={quantity === product.totalStock}
              >
                +
              </button>
            </div>
          </div>
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <button
              onClick={async () => {
                if (!product.isAvailable || product.totalStock === 0) return;
                if (!session) {
                  toast.error("Please sign in to buy");
                  return;
                }
                if (!selectedSize) {
                  toast.error("Please select a size");
                  return;
                }
                try {
                  const orderPayload = {
                    orderItems: [
                      {
                        product: product._id,
                        name: product.name,
                        quantity,
                        price: product.discountedPrice,
                        size: selectedSize,
                      },
                    ],
                    shippingAddress: {
                      street: "",
                      city: "",
                      state: "",
                      zipCode: "",
                      country: "",
                    },
                    paymentMethod: "COD",
                    itemsPrice: product.discountedPrice * quantity,
                    taxPrice: 0,
                    shippingPrice: 0,
                    totalPrice: product.discountedPrice * quantity,
                  };
                  await axios.post("/api/orders", orderPayload);
                  toast.success("Order placed!");
                  window.location.href = "/profile"; // or /orders if you have an orders page
                } catch {
                  toast.error("Failed to place order");
                }
              }}
              disabled={!product.isAvailable || product.totalStock === 0}
              className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl font-semibold transition duration-200 hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
              {product.isAvailable ? (product.totalStock === 0 ? "Out of Stock" : "Buy Now") : "Not Available"}
            </button>
            <button
              onClick={handleWishlist}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-semibold border-2 transition duration-200 flex items-center justify-center gap-2 ${isWishlisted
                ? "border-red-500 text-red-500 bg-red-50 hover:bg-red-100"
                : "border-[var(--border)] text-[var(--foreground)] bg-[var(--card)] hover:bg-[var(--neutral)]"
                }`}
            >
              <Heart className={isWishlisted ? "fill-current" : ""} size={18} />
              {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}