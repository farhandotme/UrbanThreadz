import { connectDB } from "@/DB/dbConfig";
import ProductModel from "@/models/productModels";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    connectDB();
    const { productId } = await req.json();
    console.log("Received productId:", productId);

    if (!productId) {
      return new Response("Product ID is required", { status: 400 });
    }
    const deleteResult = await ProductModel.deleteOne({ _id: productId });
    return NextResponse.json(
      {
        message: " Product deleted successfully",
        deleteResult,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in deleteProduct route:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
