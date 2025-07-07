import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/DB/dbConfig";
import Product from "@/models/productModels";

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  await connectDB();
  try {
    const { id } = context.params;
    if (!id) {
      return NextResponse.json(
        { message: "Product ID is required." },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Failed to fetch product." },
      { status: 500 }
    );
  }
}