import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/DB/dbConfig";
import ProductModel from "@/models/productModels";
import mongoose from "mongoose";

export async function PUT(
  req: NextRequest,
  { params }: any
): Promise<NextResponse> {
  try {
    await connectDB();
    const id = params.id;

    // Check for valid MongoDB ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid or missing Product ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Transform tags to array of strings if needed
    if (body.tags && Array.isArray(body.tags)) {
      body.tags = body.tags.map((tag: string | { value: string }) => typeof tag === "string" ? tag : tag.value);
    }

    // Defensive: If realPrice is missing, null, empty string, or not a number, set to 0
    if (body.realPrice === undefined || body.realPrice === null || body.realPrice === "") {
      body.realPrice = 0;
    } else if (typeof body.realPrice !== "number") {
      body.realPrice = Number(body.realPrice);
      if (isNaN(body.realPrice)) body.realPrice = 0;
    }

    // Defensive: If discountedPrice is missing, null, empty string, or not a number, set to 0
    if (body.discountedPrice === undefined || body.discountedPrice === null || body.discountedPrice === "") {
      body.discountedPrice = 0;
    } else if (typeof body.discountedPrice !== "number") {
      body.discountedPrice = Number(body.discountedPrice);
      if (isNaN(body.discountedPrice)) body.discountedPrice = 0;
    }

    // Ensure discountedPrice is not greater than realPrice
    if (typeof body.discountedPrice === "number" && typeof body.realPrice === "number") {
      if (body.discountedPrice > body.realPrice) {
        return NextResponse.json(
          { message: "Discounted price cannot be greater than real price" },
          { status: 400 }
        );
      }
    }

    // Remove empty images and tags if needed
    if (Array.isArray(body.images)) {
      body.images = body.images.filter((img: { url: string }) => img.url && img.url.trim() !== "");
    }
    if (Array.isArray(body.tags)) {
      body.tags = body.tags.filter((tag: string) => tag && tag.trim() !== "");
    }

    // Log for debugging
    console.log("Updating product:", id, body);

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
  } catch (error: unknown) {
    console.error("Error updating product:", error);
    if (
      error &&
      typeof error === "object" &&
      error !== null &&
      "errors" in error
    ) {
      const mongooseErrors = (error as { errors: Record<string, { message: string }> }).errors;
      const details = Object.values(mongooseErrors)
        .map((err) => err && typeof err === "object" && "message" in err ? err.message : String(err))
        .join("; ");
      return NextResponse.json(
        { message: "Failed to update product", details },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to update product", details: (error as Error).message },
      { status: 500 }
    );
  }
}