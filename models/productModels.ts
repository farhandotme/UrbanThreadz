import mongoose, { Schema, Document } from "mongoose";

interface ProductImage {
  url: string;
  alt: string;
  isMain: boolean;
}

interface ProductSize {
  name: string;
  stock: number;
}

interface Product extends Document {
  name: string;
  slug: string;
  sku: string;
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
  avgRating: number;
  numReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<Product>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
    },
    images: [
      {
        url: {
          type: String,
          required: [true, "Image URL is required"],
        },
        alt: {
          type: String,
          default: "",
        },
        isMain: {
          type: Boolean,
          default: false,
        },
      },
    ],
    realPrice: {
      type: Number,
      required: [true, "Real price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountedPrice: {
      type: Number,
      required: [true, "Discounted price is required"],
      min: [0, "Price cannot be negative"],
      validate: {
        validator: function (this: Product, value: number) {
          return value <= this.realPrice;
        },
        message: "Discounted price cannot be greater than real price",
      },
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },
    sizes: [
      {
        name: {
          type: String,
          required: true,
          enum: {
            values: ["S", "M", "L", "XL", "XXL"],
            message: "Invalid size specified",
          },
        },
        stock: {
          type: Number,
          required: true,
          min: [0, "Stock cannot be negative"],
          default: 0,
        },
      },
    ],
    category: {
      type: String,
      required: [true, "Category is required"],
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    totalStock: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Middleware to generate slug from name
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  next();
});

// Middleware to update totalStock
productSchema.pre("save", function (next) {
  if (this.isModified("sizes")) {
    this.totalStock = this.sizes.reduce((total, size) => total + size.stock, 0);
  }
  next();
});

// Virtual for calculating discount percentage
productSchema.virtual("discountPercentage").get(function (this: Product) {
  if (!this.realPrice || !this.discountedPrice) return 0;
  return Math.round(
    ((this.realPrice - this.discountedPrice) / this.realPrice) * 100
  );
});

const ProductModel =
  mongoose.models.Product || mongoose.model<Product>("Product", productSchema);
export default ProductModel;
