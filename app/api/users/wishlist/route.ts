import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/DB/dbConfig";
import User from "@/models/userModels";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
  if (!user.wishlist) user.wishlist = [];
  interface WishlistItem {
    toString: () => string;
  }

  const idx: number = user.wishlist.findIndex((id: WishlistItem) => id.toString() === productId);
  if (idx === -1) {
    user.wishlist.push(productId);
  } else {
    user.wishlist.splice(idx, 1);
  }
  await user.save();
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ isWishlisted: false });
  }
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ isWishlisted: false });
  }
  const user = await User.findOne({ email: session.user.email });
  if (!user || !user.wishlist) {
    return NextResponse.json({ isWishlisted: false });
  }
  interface WishlistId {
    toString: () => string;
  }
  const isWishlisted: boolean = user.wishlist.some((id: WishlistId) => id.toString() === productId);
  return NextResponse.json({ isWishlisted });
}
