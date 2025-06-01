"use client"
import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import { ProductsGrid } from "@/components/ui/Cards"

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

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWishlist() {
      setLoading(true)
      const res = await fetch("/api/users/wishlistProducts")
      const data = await res.json()
      setProducts(data.products || [])
      setLoading(false)
    }
    fetchWishlist()
  }, [])

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10 mt-15">
        <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">Your Wishlist</h1>
        {loading ? (
          <div className="text-center py-20 text-[var(--secondary)]">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-[var(--secondary)]">No products in wishlist.</div>
        ) : (
          <ProductsGrid products={products} />
        )}
      </div>
    </div>
  )
}
