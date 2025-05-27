"use client"
import { useState, useEffect } from "react"
import { ProductsGrid } from "@/components/ui/Cards"
import { Filter, X, RotateCcw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import Navbar from "@/components/Navbar"

// Define Product type to match Cards.tsx
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

export default function SalePage() {
  const [loading, setLoading] = useState(true)
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(10000)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [animateCount, setAnimateCount] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        const res = await axios.get("/api/products")
        const data: Product[] = res.data
        setProducts(data)
        const prices = data.map((p) => p.discountedPrice || p.realPrice || 0)
        setMinPrice(Math.min(...prices))
        setMaxPrice(Math.max(...prices))
        setPriceRange([Math.min(...prices), Math.max(...prices)])
      } catch {
        setError("Failed to fetch products")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = products.filter((p) => {
    const price = p.discountedPrice || p.realPrice || 0
    const priceMatch = price >= priceRange[0] && price <= priceRange[1]
    const tagMatch = selectedTags.length === 0 || selectedTags.some((tag) => p.tags.includes(tag))
    return priceMatch && tagMatch
  })

  useEffect(() => {
    setAnimateCount((prev) => prev + 1)
  }, [filteredProducts.length])

  const handleRangeChange = (index: number, value: number) => {
    const newRange: [number, number] = [...priceRange]
    newRange[index] = value

    // Ensure min doesn't exceed max and vice versa
    if (index === 0 && value > priceRange[1]) {
      newRange[1] = value
    } else if (index === 1 && value < priceRange[0]) {
      newRange[0] = value
    }

    setPriceRange(newRange)
  }

  const resetFilters = () => {
    setPriceRange([minPrice, maxPrice])
    setSelectedTags([])
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const allTags = [...new Set(products.flatMap((p) => p.tags))]

  const PriceRangeSlider = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Price Range</h3>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
            <span className="text-sm font-medium text-gray-900">₹{priceRange[0].toLocaleString("en-IN")}</span>
          </div>
          <div className="text-gray-400 text-sm">to</div>
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
            <span className="text-sm font-medium text-gray-900">₹{priceRange[1].toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="relative px-2 py-4">
          <div className="relative h-2">
            {/* Track */}
            <div className="absolute w-full h-2 bg-gray-100 rounded-full" />

            {/* Active range */}
            <div
              className="absolute h-2 bg-gray-900 rounded-full transition-all duration-200"
              style={{
                left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                width: `${((priceRange[1] - priceRange[0]) / (maxPrice - minPrice)) * 100}%`,
              }}
            />

            {/* Min range input */}
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceRange[0]}
              onChange={(e) => handleRangeChange(0, Number(e.target.value))}
              className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer range-slider"
              style={{ zIndex: 1 }}
            />

            {/* Max range input */}
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => handleRangeChange(1, Number(e.target.value))}
              className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer range-slider"
              style={{ zIndex: 2 }}
            />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white mt-20">
      <Navbar/>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-8xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-1">Discover our curated collection</p>
            </div>
            <motion.div
              key={animateCount}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="hidden sm:flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full"
            >
              <span className="text-sm font-medium">{filteredProducts.length}</span>
              <span className="text-sm text-gray-300">items</span>
            </motion.div>
          </div>
        </div>
      </div>

      <main className="max-w-8xl mx-auto px-4 py-8 ">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 mr-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm sticky top-8">
              <PriceRangeSlider />

              {/* Tags Filter */}
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                <div className="space-y-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`w-full text-left px-3 py-2 rounded-lg border transition-all duration-200 ${
                        selectedTags.includes(tag)
                          ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="font-medium">{tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  key={animateCount}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-full"
                >
                  <span className="text-sm font-medium">{filteredProducts.length}</span>
                  <span className="text-xs text-gray-300">items</span>
                </motion.div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
                <span className="font-medium">Filters</span>
              </button>
            </div>

            {/* Mobile Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <PriceRangeSlider />

                    <div className="mt-8 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {allTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                              selectedTags.includes(tag)
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Content */}
          <section className="flex-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {loading ? (
                <div className="flex flex-col justify-center items-center h-96 gap-6">
                  <div className="relative">
                    <div className="w-12 h-12 border-3 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold text-gray-900 mb-2">Loading Products</p>
                    <p className="text-gray-500">Finding the perfect items for you...</p>
                  </div>
                </div>
              ) : error ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-8 max-w-md mx-auto">
                    <p className="text-red-900 font-semibold text-lg mb-2">Something went wrong</p>
                    <p className="text-red-700">{error}</p>
                  </div>
                </motion.div>
              ) : filteredProducts.length === 0 ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 max-w-md mx-auto">
                    <p className="text-gray-900 font-semibold text-xl mb-2">No products found</p>
                    <p className="text-gray-600 mb-6">Try adjusting your filters to see more results</p>
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset Filters
                    </button>
                  </div>
                </motion.div>
              ) : (
                <ProductsGrid products={filteredProducts} />
              )}
            </motion.div>
          </section>
        </div>
      </main>

      <style jsx global>{`
        .range-slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: 3px solid #111827;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }
        
        .range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
        
        .range-slider::-webkit-slider-thumb:active {
          transform: scale(1.05);
        }
        
        .range-slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: 3px solid #111827;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }
        
        .range-slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
        
        .range-slider:focus {
          outline: none;
        }
        
        .range-slider::-webkit-slider-track {
          background: transparent;
        }
        
        .range-slider::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  )
}
