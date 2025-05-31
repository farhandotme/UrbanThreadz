import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/DB/dbConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import userModels from "@/models/userModels";

// GET /api/users/cart - Get cart items
export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await userModels.findOne({ email: session.user.email }).populate({
      path: 'cart.productId',
      select: '_id name images realPrice discountedPrice shortDescription isAvailable totalStock'
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!Array.isArray(user.cart)) {
      user.cart = [];
      await user.save();
      return NextResponse.json([]);
    }

    interface CartItem {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      productId: any;
      quantity: number;
    }

    const cartItems = user.cart
      .filter((item: CartItem) => item && item.productId)
      .map((item: CartItem) => {
        try {
          const product = item.productId.toObject();
          if (!product) return null;
          return {
            ...product,
            quantity: item.quantity || 1
          };
        } catch (err) {
          console.error('Error transforming cart item:', err);
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { error: "Failed to fetch cart items" },
      { status: 500 }
    );
  }
}

// POST /api/users/cart - Add/Update cart item
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { productId, quantity = 1 } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    let user = await userModels.findOne({ email: session.user.email });
    if (!user) {
      if (session.provider === "google") {
        user = await userModels.create({
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

    if (!Array.isArray(user.cart)) {
      user.cart = [];
    }

    const existingItemIndex = user.cart.findIndex(
      (item: { productId?: { toString(): string } }) => item?.productId?.toString() === productId
    );

    if (existingItemIndex !== -1) {
      user.cart[existingItemIndex].quantity = quantity;
    } else {
      user.cart.push({ productId, quantity });
    }

    await user.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/cart - Update cart item quantity
export async function PATCH(req: NextRequest) {
  try {
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

    const user = await userModels.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!Array.isArray(user.cart)) {
      user.cart = [];
    }

    interface CartItemBase {
      productId: {
        toString(): string;
      };
      quantity: number;
    }
    
    const cartItem = user.cart.find(
      (item: CartItemBase) => item?.productId && item.productId.toString() === productId
    );
    
    if (!cartItem) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    cartItem.quantity = quantity;
    await user.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/cart - Remove from cart
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const user = await userModels.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
        return item?.productId && item.productId.toString() !== productId;
      } catch (err) {
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
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}
