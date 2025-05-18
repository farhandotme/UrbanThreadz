import { NextResponse } from "next/server";
import ProductModel from "@/models/productModels";

export async function GET() {
  try {
    const products = await ProductModel.find();
    return NextResponse.json(products);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } 
  }
}
