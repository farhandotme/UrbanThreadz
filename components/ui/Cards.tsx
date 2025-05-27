"use client"
import Image from "next/image"
import { Heart, ShoppingCart } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import axios from "axios"

interface ProductImage {
  url: string
  alt: string
  isMain: boolean
}

interface ProductSize {
  name: string
  stock: number
}

interface Product {
  _id: string
  name: string
  images: ProductImage[]
  realPrice: number
  discountedPrice: number
  description: string
  shortDescription: string
  sizes: ProductSize[]
  category: string
  tags: string[]
  isAvailable: boolean
  totalStock: number
  avgRating?: number
  numReviews?: number
  discountPercentage?: number
}
export default function ProductCard({ product }: { product: Product }) {
  const { data: session } = useSession()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const images = Array.isArray(product.images) ? product.images : []
  const mainImage = images.find((img) => img.isMain) || images[0] || { url: "/logo.png", alt: product.name }

  const handleWishlist = async () => {
    if (!session) {
      signIn()
      return
    }
    setLoading(true)
    try {
      // Call your wishlist API (assume /api/users/wishlist)
      const res = await axios.post("/api/users/wishlist", { productId: product._id })
      if (res.status === 200) setIsWishlisted((prev) => !prev)
    } finally {
      setLoading(false)
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
      className="group relative bg-white border border-gray-200 rounded-xl shadow-md transition-all duration-300 p-2 sm:p-3 overflow-hidden h-[380px] sm:h-[400px] w-full max-w-[280px] sm:max-w-[380px] mx-auto flex flex-col hover:z-20"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* Image */}
      <div className="relative w-full h-[240px] sm:h-[260px] mb-2 sm:mb-3 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center">
        <Image
          src={mainImage.url || "/placeholder.svg"}
          alt={mainImage.alt}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        {product.discountPercentage && product.discountPercentage > 0 && (
          <div className="absolute top-1 left-1 bg-black text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow">
            -{product.discountPercentage}%
          </div>
        )}
      </div>
      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-h-0">
        <div className="overflow-hidden">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 line-clamp-1 tracking-tight">
            {product.name}
          </h2>
          <p className="text-xs text-gray-500 mb-1 line-clamp-2">{product.shortDescription}</p>
        </div>
        <div className="flex items-end gap-2 mt-1">
          <span className="text-base sm:text-lg font-bold text-black">
            ₹
            {typeof product.discountedPrice === "number"
              ? product.discountedPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : "0.00"}
          </span>
          {typeof product.discountedPrice === "number" &&
            typeof product.realPrice === "number" &&
            product.discountedPrice < product.realPrice && (
              <span className="text-xs line-through text-gray-400">
                ₹{product.realPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
        </div>
        {!product.isAvailable || product.totalStock === 0 ? (
          <div className="mt-1 text-xs font-semibold text-red-600">Out of Stock</div>
        ) : null}
      </div>

      {/* Animated Actions on Hover */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={showDetails ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className={`absolute inset-0 bg-white/95 rounded-xl p-4 flex flex-col justify-between z-20 group-hover:shadow-2xl ${showDetails ? "pointer-events-auto" : "pointer-events-none"}`}
        style={{ backdropFilter: "blur(2px)" }}
      >
        <div className="w-full flex-1 flex flex-col mt-10 justify-between">
          <div>
            <h3 className="text-lg font-bold text-black mb-2 text-center">{product.name}</h3>
            <p className="text-sm text-gray-700 mb-2 text-center line-clamp-4">{product.description}</p>
            <div className="flex flex-wrap gap-2 justify-center mb-2">
              {product.sizes?.map((size) => (
                <span key={size.name} className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-700">
                  {size.name}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {product.tags?.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-black text-white rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 w-full justify-center mt-auto pt-2">
            <button
              className={`p-2 rounded-full border border-gray-300 bg-white/80 hover:bg-gray-100 transition-colors ${loading ? "opacity-60 pointer-events-none" : ""}`}
              aria-label="Add to wishlist"
              onClick={handleWishlist}
            >
              <Heart
                className={`w-6 h-6 ${isWishlisted ? "fill-black text-black animate-pulse" : "text-gray-500"} transition-all`}
              />
            </button>
            <button
              className="flex-1 bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors text-xs font-semibold shadow disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!product.isAvailable || product.totalStock === 0}
            >
              Buy Now
            </button>
            <button
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ProductsGrid({ heading, products }: { heading?: string; products?: Product[] }) {
  const [internalProducts, setInternalProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (products) {
      setInternalProducts(products)
      setLoading(false)
      setError(null)
      return
    }
    async function fetchProducts() {
      try {
        setLoading(true)
        const res = await fetch("/api/products")
        if (!res.ok) throw new Error("Failed to fetch products")
        const data = await res.json()
        setInternalProducts(data)
      } catch (err) {
        setError((err as Error).message || "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [products])

  if (loading) return <div className="text-center text-white py-10">Loading products...</div>
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>
  if (!internalProducts.length) return <div className="text-center text-gray-400 py-10">No products found.</div>

  let displayProducts = internalProducts
  if (heading) {
    // Filter products by category matching heading (case-insensitive)
    const filtered = internalProducts.filter((p) => p.category?.toLowerCase() === heading.toLowerCase())
    displayProducts = filtered.slice(0, 7)
    if (!displayProducts.length)
      return <div className="text-center text-gray-400 py-10">No products found for this category.</div>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 justify-items-center px-2 sm:px-0">
      {displayProducts.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}
