import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/DB/dbConfig";
import User from "@/models/userModels";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

export async function GET() {
  await connectDB();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await User.findOne({ email: session.user.email }).select(
      "fullname email"
    );
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ name: user.fullname, email: user.email });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  await connectDB();
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { name, email } = await req.json();
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { fullname: name, email },
      { new: true, runValidators: true }
    ).select("fullname email");
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ name: user.fullname, email: user.email });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
