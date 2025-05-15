import mongoose from "mongoose";

interface User extends mongoose.Document {
  fullname: string;
  email: string;
  password: string;
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
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<User>("User", userSchema);
