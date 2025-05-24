import { NextResponse } from 'next/server';
import { connectDB } from '@/DB/dbConfig';
import ProductModel from '@/models/productModels';

export async function GET() {
  try {
    await connectDB();
    const products = await ProductModel.find({});
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch products', error }, { status: 500 });
  }
}

