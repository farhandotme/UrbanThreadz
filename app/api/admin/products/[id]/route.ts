import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/DB/dbConfig";
import ProductModel from "@/models/productModels";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }
    const body = await req.json();
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}
