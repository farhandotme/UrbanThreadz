"use client"

import { useState } from "react"
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100),
  sku: z.string().min(1, "SKU is required"),
  images: z.array(z.object({
    url: z.string().min(1, "Image URL is required"),
    alt: z.string().optional(),
    isMain: z.boolean().default(false)
  })).min(1, "At least one image is required"),
  realPrice: z.number().min(0, "Price cannot be negative"),
  discountedPrice: z.number().min(0, "Price cannot be negative")
    .refine((val) => val >= 0, "Discounted price must be positive"),
  description: z.string().min(1, "Description is required").max(2000),
  shortDescription: z.string().min(1, "Short description is required").max(200),
  sizes: z.array(z.object({
    name: z.enum(["S", "M", "L", "XL", "XXL"]),
    stock: z.number().min(0, "Stock cannot be negative")
  })).min(1, "At least one size is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string().min(1, "Tag cannot be empty")),
  isAvailable: z.boolean().default(true)
})

type ProductFormValues = z.infer<typeof productSchema>

export default function AddNewProduct() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      images: [{ url: "", alt: "", isMain: true }],
      sizes: [{ name: "M", stock: 0 }],
      tags: [""],
      isAvailable: true
    }
  })

  const { fields: imageFields, append: appendImage, remove: removeImage } = 
    useFieldArray({ control, name: "images" })
  
  const { fields: sizeFields, append: appendSize, remove: removeSize } = 
    useFieldArray({ control, name: "sizes" })
  
  const { fields: tagFields, append: appendTag, remove: removeTag } = 
    useFieldArray({ control, name: "tags" })


  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      setIsSubmitting(true)
      
      if (data.discountedPrice > data.realPrice) {
        toast.error("Discounted price cannot be greater than real price")
        return
      }

      console.log(data)
      toast.success("Product created successfully!")
      
    } catch (error) {
      toast.error("Failed to create product")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  {...register("name")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  {...register("sku")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Real Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("realPrice", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
                {errors.realPrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.realPrice.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discounted Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("discountedPrice", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
                {errors.discountedPrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.discountedPrice.message}</p>
                )}
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              {imageFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-4 mb-2">
                  <input
                    {...register(`images.${index}.url`)}
                    placeholder="Image URL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                  <input
                    {...register(`images.${index}.alt`)}
                    placeholder="Alt text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                  <input
                    type="checkbox"
                    {...register(`images.${index}.isMain`)}
                    className="ml-2"
                  />
                  <span className="text-xs text-gray-600">Main</span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendImage({ url: "", alt: "", isMain: false })}
                className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus size={20} className="mr-2" />
                Add Image
              </button>
            </div>

            {/* Descriptions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <textarea
                {...register("shortDescription")}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
              {errors.shortDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.shortDescription.message}</p>
              )}

              <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">
                Full Description
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sizes and Stock
              </label>
              {sizeFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-4 mb-2">
                  <select
                    {...register(`sizes.${index}.name`)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  >
                    {["S", "M", "L", "XL", "XXL"].map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    {...register(`sizes.${index}.stock`, { valueAsNumber: true })}
                    placeholder="Stock"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={() => removeSize(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendSize({ name: "M", stock: 0 })}
                className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Plus size={20} className="mr-2" />
                Add Size
              </button>
            </div>

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  {...register("category")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                {tagFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2 mb-2">
                    <input
                      {...register(`tags.${index}`)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => appendTag("")}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus size={20} className="mr-2" />
                  Add Tag
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}