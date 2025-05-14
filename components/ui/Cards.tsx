"use client"

import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'

interface Product {
  image: string;
  name: string;
  price: number;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 overflow-hidden">
      {/* Image Container */}
      <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-lg">
        <Image 
          src={product.image} 
          alt={product.name} 
          fill
          className="object-cover transform group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
          {product.name}
        </h2>
        <p className="text-xl font-bold text-blue-600">
          ${product.price.toLocaleString()}
        </p>

        {/* Buttons Container */}
        <div className="flex gap-2 pt-3">
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Buy Now
          </button>
          <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" 
                  aria-label="Add to cart">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Sale Badge */}
      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
        SALE
      </div>
    </div>
  )
}