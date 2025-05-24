import { NextRequest, NextResponse } from "next/server";
import ProductModel from "@/models/productModels";
import { connectDB } from "@/DB/dbConfig";

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  await connectDB();
  try {
    // In Next.js 15, context.params is always sync (not a Promise) in route handlers
    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { message: "Product ID is required." },
        { status: 400 }
      );
    }
    const product = await ProductModel.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch product", error },
      { status: 500 }
    );
  }
}