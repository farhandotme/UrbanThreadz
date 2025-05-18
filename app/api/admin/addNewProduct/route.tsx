// Fixed route.ts file - make sure to save this at /app/api/products/route.ts
import { connectDB } from "@/DB/dbConfig";
import { NextResponse } from "next/server";
import ProductModel from "@/models/productModels";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // Format tags correctly from the form data
    if (body.tags && Array.isArray(body.tags)) {
      body.tags = body.tags.map((tag: { value: string }) => tag.value);
    }

    // Create the product without the extra data wrapper
    const newProduct = await ProductModel.create(body);

    return NextResponse.json(
      { message: "Product created successfully", product: newProduct },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error in POST /api/products:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS'
    }
  });
}