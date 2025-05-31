import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/DB/dbConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import userModels from "@/models/userModels";

interface CartProduct {
  _id: string;
  name: string;
  images: Array<{ url: string; alt: string }>;
  realPrice: number;
  discountedPrice: number;
  shortDescription: string;
  isAvailable: boolean;
  totalStock: number;
  toObject?: () => CartProduct;
}

interface CartItem {
  productId: CartProduct;
  quantity: number;
}

// GET /api/users/cart - Get cart items
export async function GET() {
  let dbConnected = false;
  try {
    console.log("Starting cart fetch operation");
    
    // Ensure DB connection with retry
    let retries = 3;
    while (retries > 0) {
      try {
        await connectDB();
        dbConnected = true;
        break;
      } catch (error) {
        retries--;
        console.error(`DB connection attempt failed, retries left: ${retries}`, error);
        if (retries === 0) throw new Error("Database connection failed after all retries");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Validate session
    const session = await getServerSession(authOptions);
    console.log("Session state:", {
      exists: !!session,
      hasUser: !!session?.user,
      hasEmail: !!session?.user?.email
    });
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user and populate cart
    console.log("Fetching cart for user:", session.user.email);
    const user = await userModels.findOne({ 
      email: session.user.email.toLowerCase() 
    }).populate({
      path: 'cart.productId',
      select: '_id name images realPrice discountedPrice shortDescription isAvailable totalStock'
    });
    
    if (!user) {
      console.log("User not found:", session.user.email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure cart array exists
    if (!Array.isArray(user.cart)) {
      console.log("Initializing empty cart for user");
      user.cart = [];
      await user.save();
      return NextResponse.json([]);
    }

    console.log(`Processing ${user.cart.length} cart items`);
    
    // Transform and validate cart items
    interface TransformedCartItem {
      _id: string;
      name: string;
      images: Array<{ url: string; alt: string }>;
      realPrice: number;
      discountedPrice: number;
      shortDescription: string;
      isAvailable: boolean;
      totalStock: number;
      quantity: number;
    }

    interface CartItemWithProduct extends CartItem {
      productId: CartProduct & {
      toObject?: () => CartProduct;
      };
    }

    const cartItems: TransformedCartItem[] = user.cart
      .filter((item: CartItemWithProduct): item is CartItemWithProduct => {
      const isValid = item && item.productId && typeof item.productId === 'object';
      if (!isValid) console.log("Filtering out invalid cart item:", item);
      return isValid;
      })
      .map((item: CartItemWithProduct): TransformedCartItem | null => {
      try {
        if (!item.productId) {
        console.log("Skipping item with no productId");
        return null;
        }

        const product = item.productId.toObject ? item.productId.toObject() : item.productId;
        
        if (!product || !product._id) {
        console.log("Invalid product data:", product);
        return null;
        }

        return {
        _id: product._id.toString(),
        name: product.name || 'Unknown Product',
        images: Array.isArray(product.images) ? product.images : [],
        realPrice: Number(product.realPrice) || 0,
        discountedPrice: Number(product.discountedPrice) || 0,
        shortDescription: product.shortDescription || '',
        isAvailable: Boolean(product.isAvailable),
        totalStock: Number(product.totalStock) || 0,
        quantity: Number(item.quantity) || 1
        };
      } catch (err) {
        console.error('Error transforming cart item:', err);
        return null;
      }
      })
      .filter((item: TransformedCartItem | null): item is TransformedCartItem => item !== null);

    console.log(`Returning ${cartItems.length} valid cart items`);
    return NextResponse.json(cartItems);
    
  } catch (error) {
    console.error('Cart fetch error:', {
      error,
      dbConnected,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined
    });
    
    // Return appropriate error response
    if (!dbConnected) {
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503 }
      );
    }
    
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
