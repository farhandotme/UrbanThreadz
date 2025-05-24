"use client";
import { useState, useCallback, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  X,
  Upload,
  Tag,
  Layers,
  Layout,
  Check,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { CldUploadWidget } from "next-cloudinary";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100),
  images: z
    .array(
      z.object({
        url: z.string().min(1, "Image URL is required"),
        alt: z.string().optional(),
        isMain: z.boolean(),
      })
    )
    .min(1, { message: "At least one image is required" })
    .refine((images) => images.some((img) => img.isMain), {
      message: "At least one image must be set as main",
    }),
  realPrice: z.number().min(0, "Price cannot be negative"),
  discountedPrice: z.number().min(0, "Price cannot be negative"),
  description: z.string().min(1, "Description is required").max(2000),
  shortDescription: z.string().min(1, "Short description is required").max(200),
  sizes: z
    .array(
      z.object({
        name: z.enum(["S", "M", "L", "XL", "XXL"]),
        stock: z.number().min(0, "Stock cannot be negative"),
      })
    )
    .min(1, "At least one size is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(
    z.object({
      value: z.string().min(1, "Tag cannot be empty"),
    })
  ),
  isAvailable: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function EditProduct() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("basic");
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      images: [{ url: "", alt: "", isMain: true }],
      realPrice: 0,
      discountedPrice: 0,
      description: "",
      shortDescription: "",
      sizes: [{ name: "M", stock: 0 }],
      category: "",
      tags: [],
      isAvailable: true,
    },
  });
  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({ control, name: "images" });

  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({ control, name: "sizes" });

  const {
    fields: tagFields,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({ control, name: "tags" });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        toast.error("Product ID is required");
        router.push("/admin/dashboard");
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(`/api/products/${productId}`);
        const productData = response.data;

        let processedTags = [];
        if (productData.tags) {
          if (Array.isArray(productData.tags)) {
            if (productData.tags.length > 0 && typeof productData.tags[0] === 'object' && productData.tags[0].value !== undefined) {
              processedTags = productData.tags;
            } else if (productData.tags.length > 0 && typeof productData.tags[0] === 'string') {
              processedTags = productData.tags.map((tag: string) => ({ value: tag }));
            }
          } else if (typeof productData.tags === 'string') {
            processedTags = productData.tags.split(',').map((tag: string) => ({ value: tag.trim() })).filter((tag: { value: string }) => tag.value);
          }
        }

        const formData = {
          name: productData.name || "",
          images: productData.images?.length > 0 ? productData.images : [{ url: "", alt: "", isMain: true }],
          realPrice: productData.realPrice || 0,
          discountedPrice: productData.discountedPrice || 0,
          description: productData.description || "",
          shortDescription: productData.shortDescription || "",
          sizes: productData.sizes?.length > 0 ? productData.sizes : [{ name: "M", stock: 0 }],
          category: productData.category || "",
          tags: processedTags,
          isAvailable: productData.isAvailable ?? true,
        };

        reset(formData);
        toast.success("Product data loaded successfully");
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product data");
        router.push("/admin/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, reset, router]);

  const onSubmit = async (data: ProductFormValues) => {
    console.log("id:", productId);
    try {
      setIsSubmitting(true);
      const filteredData = {
        ...data,
        tags: data.tags.filter(tag => tag.value && tag.value.trim() !== "")
      };
      const response = await axios.put(`/api/admin/products/${productId}`, filteredData, { withCredentials: true });
      console.log("Update response:", response.data);

      
      if (response.status === 200) {
        toast.success("Product updated successfully!");
        router.push("/admin/dashboard");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = useCallback(
    (index: number, results: { info: { secure_url: string } }) => {
      if (results?.info?.secure_url) {
        setValue(`images.${index}.url`, results.info.secure_url);
        if (imageFields.length === 1 && index === 0) {
          setValue(`images.${index}.isMain`, true);
        }
        const updatedImages = [...getValues("images")];
        setValue("images", updatedImages);
      }
    },
    [setValue, imageFields.length, getValues]
  );

  const renderSection = () => {
    switch (activeSection) {
      case "basic":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Product Name
              </label>
              <input
                type="text"
                {...register("name")}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Real Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    {...register("realPrice", { valueAsNumber: true })}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
                {errors.realPrice && (
                  <p className="text-sm text-red-500">
                    {errors.realPrice.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Discounted Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    {...register("discountedPrice", { valueAsNumber: true })}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="0.00"
                  />
                </div>
                {errors.discountedPrice && (
                  <p className="text-sm text-red-500">
                    {errors.discountedPrice?.message?.toString()}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                {...register("category")}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Enter product category"
              />
              {errors.category && (
                <p className="text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAvailable"
                {...register("isAvailable")}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isAvailable" className="text-sm text-gray-700">
                Product Available for Sale
              </label>
            </div>
          </div>
        );

      case "images":
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Product Images
              </label>
              {errors.images && (
                <p className="text-sm text-red-500 mb-4">
                  {errors.images.message}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {imageFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative border border-gray-200 rounded-lg p-2 hover:shadow-md transition-all"
                  >
                    {getValues(`images.${index}.url`) && getValues(`images.${index}.url`).trim() !== '' ? (
                      <div className="relative group">
                        <div className="w-full aspect-square bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                          <Image
                            src={getValues(`images.${index}.url`)}
                            alt="Product preview"
                            width={300}
                            height={300}
                            className="w-full h-full object-cover bg-white rounded-md"
                            style={{ backgroundColor: '#fff', minHeight: 0, minWidth: 0 }}
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image';
                              (e.target as HTMLImageElement).className = 'w-full h-full object-contain bg-gray-100 rounded-md';
                            }}
                            unoptimized
                            priority
                          />
                        </div>
                        {/* Overlay upload button always visible in top-right */}
                        <div className="absolute top-2 right-2 z-10">
                          <CldUploadWidget
                            onSuccess={(result) => {
                              if (
                                result &&
                                typeof result.info === 'object' &&
                                result.info !== null &&
                                'secure_url' in result.info &&
                                typeof result.info.secure_url === 'string'
                              ) {
                                handleImageUpload(index, { info: { secure_url: result.info.secure_url } });
                              }
                            }}
                            uploadPreset="UrbanThreadz"
                            options={{
                              maxFiles: 1,
                              maxFileSize: 10 * 1024 * 1024,
                              cropping: false,
                              sources: ['local'],
                              resourceType: 'image',
                              clientAllowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
                            }}
                          >
                            {({ open }) => (
                              <button
                                type="button"
                                onClick={() => open()}
                                className="p-2 bg-white rounded-full shadow hover:bg-indigo-100 transition-all border border-gray-200"
                                title="Change Image"
                              >
                                <Upload size={16} className="text-gray-800" />
                              </button>
                            )}
                          </CldUploadWidget>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-square flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-md bg-gray-50 text-gray-400 text-sm relative">
                        <span>No Image</span>
                        {/* Always show upload button */}
                        <div className="absolute top-2 right-2 z-10">
                          <CldUploadWidget
                            onSuccess={(result) => {
                              if (
                                result &&
                                typeof result.info === 'object' &&
                                result.info !== null &&
                                'secure_url' in result.info &&
                                typeof result.info.secure_url === 'string'
                              ) {
                                handleImageUpload(index, { info: { secure_url: result.info.secure_url } });
                              }
                            }}
                            uploadPreset="UrbanThreadz"
                            options={{
                              maxFiles: 1,
                              maxFileSize: 10 * 1024 * 1024,
                              cropping: false,
                              sources: ['local'],
                              resourceType: 'image',
                              clientAllowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
                            }}
                          >
                            {({ open }) => (
                              <button
                                type="button"
                                onClick={() => open()}
                                className="p-2 bg-white rounded-full shadow hover:bg-indigo-100 transition-all border border-gray-200"
                                title="Upload Image"
                              >
                                <Upload size={16} className="text-gray-800" />
                              </button>
                            )}
                          </CldUploadWidget>
                        </div>
                      </div>
                    )}
                    <input type="hidden" {...register(`images.${index}.url`)} />
                    {errors.images?.[index]?.url && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.images[index]?.url?.message}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`main-image-${index}`}
                          {...register(`images.${index}.isMain`)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          onChange={(e) => {
                            if (e.target.checked) {
                              const currentValues = getValues();
                              currentValues.images.forEach((_, i) => {
                                if (i !== index) {
                                  setValue(`images.${i}.isMain`, false);
                                }
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={`main-image-${index}`}
                          className="ml-1 text-xs text-gray-600"
                        >
                          Main Image
                        </label>
                      </div>
                      <button
                        type="button"
                        disabled={imageFields.length === 1}
                        onClick={() => removeImage(index)}
                        className="p-1 text-red-500 hover:text-red-700 disabled:opacity-30 transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    appendImage({ url: "", alt: "", isMain: false })
                  }
                  className="flex flex-col items-center justify-center w-full aspect-square border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all"
                >
                  <Plus size={24} className="text-gray-500" />
                  <span className="text-sm text-gray-500 mt-1">Add Image</span>
                </button>
              </div>
            </div>
          </div>
        );

      case "descriptions":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Short Description
              </label>
              <textarea
                {...register("shortDescription")}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Brief description of the product"
              />
              {errors.shortDescription && (
                <p className="text-sm text-red-500">
                  {errors.shortDescription.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Full Description
              </label>
              <textarea
                {...register("description")}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Detailed description of the product"
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        );

      case "inventory":
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Sizes and Stock
                </label>
                <button
                  type="button"
                  onClick={() => appendSize({ name: "M", stock: 0 })}
                  className="flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-all"
                >
                  <Plus size={16} className="mr-1" />
                  Add Size
                </button>
              </div>

              {errors.sizes && (
                <p className="text-sm text-red-500 mb-2">
                  {errors.sizes.message}
                </p>
              )}

              <div className="space-y-3">
                {sizeFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-all"
                  >
                    <div className="flex-grow flex items-center space-x-4">
                      <select
                        {...register(`sizes.${index}.name`)}
                        className="px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      >
                        {["S", "M", "L", "XL", "XXL"].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>

                      <div className="relative flex-grow">
                        <input
                          type="number"
                          {...register(`sizes.${index}.stock`, {
                            valueAsNumber: true,
                          })}
                          placeholder="Stock quantity"
                          className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                          units
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={sizeFields.length === 1}
                      onClick={() => removeSize(index)}
                      className="p-2 text-red-400 hover:text-red-600 disabled:opacity-30 transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "tags":
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Product Tags
                </label>
                <button
                  type="button"
                  onClick={() => appendTag({ value: "" })}
                  className="flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-all"
                >
                  <Plus size={16} className="mr-1" />
                  Add Tag
                </button>
              </div>

              {tagFields.length === 0 && (
                <div className="text-center py-8">
                  <Tag className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">No tags added yet</p>
                  <button
                    type="button"
                    onClick={() => appendTag({ value: "" })}
                    className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Add your first tag
                  </button>
                </div>
              )}

              {/* Tags grid */}
              {tagFields.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tagFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 hover:shadow-sm transition-all"
                    >
                      <Tag size={14} className="text-gray-500 mr-2 flex-shrink-0" />
                      <input
                        {...register(`tags.${index}.value`)}
                        className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm min-w-0"
                        placeholder="Enter tag"
                      />
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-2 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                        title="Remove tag"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tag validation errors */}
              {errors.tags && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">Tag errors:</p>
                  {tagFields.map((_, index) =>
                    errors.tags?.[index]?.value && (
                      <p key={index} className="text-xs text-red-500 mt-1">
                        Tag {index + 1}: {errors.tags[index]?.value?.message}
                      </p>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar Navigation */}
            <div className="md:w-64 bg-gray-50 p-6">
              <div className="flex items-center mb-8">
                <button
                  onClick={() => router.push("/admin/dashboard")}
                  className="mr-3 p-2 text-gray-600 hover:text-indigo-600 transition-all"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">
                  Edit Product
                </h1>
              </div>

              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveSection("basic")}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeSection === "basic"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <Layout className="mr-3 h-5 w-5" />
                  Basic Information
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("images")}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeSection === "images"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <ImageIcon className="mr-3 h-5 w-5" />
                  Product Images
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("descriptions")}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeSection === "descriptions"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <Layout className="mr-3 h-5 w-5" />
                  Descriptions
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("inventory")}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeSection === "inventory"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <Layers className="mr-3 h-5 w-5" />
                  Sizes & Inventory
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("tags")}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeSection === "tags"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <Tag className="mr-3 h-5 w-5" />
                  Tags
                </button>
              </nav>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Check className="mr-2 h-4 w-4" />
                      Update Product
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 md:p-8">
              <form onSubmit={handleSubmit(onSubmit)}>{renderSection()}</form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}