import {  NextResponse } from "next/server";
import { connectDB } from "@/DB/dbConfig";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import userModels from "@/models/userModels";

export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ products: [] });
  }
  const user = await userModels.findOne({ email: session.user.email }).populate("wishlist");
  if (!user) {
    return NextResponse.json({ products: [] });
  }
  // user.wishlist is an array of Product documents
  return NextResponse.json({ products: user.wishlist });
}
