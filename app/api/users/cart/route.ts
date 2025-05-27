import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/DB/dbConfig";
import User from "@/models/userModels";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST /api/users/cart
export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }
  // Find user
  let user = await User.findOne({ email: session.user.email });
  if (!user) {
    // If Google login, create user on the fly
    if (session.provider === "google") {
      user = await User.create({
        fullname: session.user.name || "Google User",
        email: session.user.email,
        password: "google-oauth-no-password",
        wishlist: [],
        cart: [],
      });
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  }
  // Add to cart (create cart array if not exists)
  if (!user.cart) user.cart = [];
  if (!user.cart.includes(productId)) {
    user.cart.push(productId);
    await user.save();
  }
  return NextResponse.json({ success: true });
}
