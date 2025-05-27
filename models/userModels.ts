import mongoose from "mongoose";

interface User extends mongoose.Document {
  fullname: string;
  email: string;
  password: string;
  wishlist: mongoose.Types.ObjectId[];
  cart: mongoose.Types.ObjectId[];
}

const userSchema = new mongoose.Schema<User>(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<User>("User", userSchema);
