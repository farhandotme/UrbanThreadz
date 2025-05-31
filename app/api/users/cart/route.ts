import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/DB/dbConfig";
import User from "@/models/userModels";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import userModels from "@/models/userModels";

// GET /api/users/cart - Get cart items
export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await userModels.findOne({ email: session.user.email }).populate('cart.productId');
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Handle case where cart might be undefined
  if (!user.cart) {
    return NextResponse.json([]);
  }

  // Transform the cart data to include quantities
  interface CartProduct {
    _id: string;
    name: string;
    price: number;
    // Add other product fields as needed
  }

  interface CartItem {
    productId: CartProduct & { toObject(): CartProduct };
    quantity?: number;
  }

  interface TransformedCartItem extends CartProduct {
    quantity: number;
  }

  const cartItems: TransformedCartItem[] = user.cart
    .filter((item: CartItem) => item.productId) // Filter out any null items
    .map((item: CartItem) => ({
      ...item.productId.toObject(),
      quantity: item.quantity || 1
    }));

  return NextResponse.json(cartItems);
}

// POST /api/users/cart - Add/Update cart item
export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { productId, quantity = 1 } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  // Validate quantity
  if (quantity < 1 || quantity > 10) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
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
  
  // Initialize cart if it doesn't exist
  if (!Array.isArray(user.cart)) {
    user.cart = [];
  }

  try {
    interface CartItemBase {
      productId: {
      toString(): string;
      };
    }

    const existingItemIndex: number = user.cart.findIndex(
      (item: CartItemBase) => item.productId && item.productId.toString() === productId
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      user.cart[existingItemIndex].quantity = quantity;
    } else {
      // Add new item
      user.cart.push({ productId, quantity });
    }

    await user.save();
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// PATCH /api/users/cart - Update cart item quantity
export async function PATCH(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, quantity } = await req.json();
  if (!productId || !quantity) {
    return NextResponse.json({ error: "Product ID and quantity required" }, { status: 400 });
  }

  // Validate quantity
  if (quantity < 1 || quantity > 10) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    if (!Array.isArray(user.cart)) {
      user.cart = [];
    }

    interface CartItemBase {
      productId: {
      toString(): string;
      };
      quantity: number;
    }
    const cartItem = user.cart.find((item: CartItemBase): boolean => item.productId && item.productId.toString() === productId);
    if (!cartItem) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    cartItem.quantity = quantity;
    await user.save();
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// DELETE /api/users/cart - Remove from cart
export async function DELETE(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    if (!Array.isArray(user.cart)) {
      user.cart = [];
      await user.save();
      return NextResponse.json({ success: true });
    }

    // Check if any item was actually removed
    const originalLength = user.cart.length;
    interface CartItem {
      productId?: {
      toString(): string;
      };
    }

    user.cart = user.cart.filter((item: CartItem) => {
      try {
      return item && item.productId && item.productId.toString() !== productId;
      } catch (err: unknown) {
      console.error('Error comparing productId:', err);
      return true; // Keep items that can't be compared
      }
    });

    if (user.cart.length === originalLength) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    await user.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json({ error: "Failed to remove item from cart" }, { status: 500 });
  }
}
