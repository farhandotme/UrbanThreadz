import { NextRequest, NextResponse } from "next/server";
import OrderModel from "@/models/orderModel";
import { connectDB } from "@/DB/dbConfig";
import { getDataFromToken } from "@/utils/getDataFromToken";

// GET: Get all orders for the authenticated user
export async function GET() {
  await connectDB();
  const tokenPayload = await getDataFromToken();
  const userId = tokenPayload?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const orders = await OrderModel.find({ user: userId }).sort({
      createdAt: -1,
    });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST: Create a new order
export async function POST(req: NextRequest) {
  await connectDB();
  const tokenPayload = await getDataFromToken();
  const userId = tokenPayload?.id;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = body;
    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: "No order items" }, { status: 400 });
    }
    const order = await OrderModel.create({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });
    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
