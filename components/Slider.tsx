/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Circle, CircleDot } from 'lucide-react'

interface Slide {
  id: number
  image: string
  title: string
  description: string
}

const slides: Slide[] = [
  {
    id: 1,
    image: '/offer_banner_new_model_1_7dd2defe-6398-430e-9e25-5d0f26f71776.webp',
    title: 'New Collection',
    description: 'Discover our latest arrivals'
  },
  {
    id: 2,
    image: '/oversized_t-shirts_1_.avif',
    title: 'Summer Sale',
    description: 'Up to 50% off on selected items'
  },
  {
    id: 3,
    image: '/slide3.jpg',
    title: 'Limited Edition',
    description: 'Exclusive designs for a limited time'
  },
]

export default function ProductSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const nextSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  const prevSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-xl">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide
              ? 'translate-x-0'
              : index < currentSlide
              ? '-translate-x-full'
              : 'translate-x-full'
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
          />
          {/* Content Overlay */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="text-center text-white space-y-4 px-4">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                {slide.title}
              </h2>
              <p className="text-lg md:text-xl">
                {slide.description}
              </p>
              <button className="mt-4 px-6 py-2 bg-white text-black font-medium hover:bg-white/90 transition-colors">
                Shop Now
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        disabled={isAnimating}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
        disabled={isAnimating}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true)
                setCurrentSlide(index)
                setTimeout(() => setIsAnimating(false), 500)
              }
            }}
            className="p-1 hover:opacity-75 transition-opacity"
          >
            {index === currentSlide ? (
              <CircleDot className="w-4 h-4 text-white" />
            ) : (
              <Circle className="w-4 h-4 text-white" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}