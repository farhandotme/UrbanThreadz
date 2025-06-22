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
      "fullname email phone address"
    );
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    
    return NextResponse.json({
      name: user.fullname || session.user.name,
      email: user.email || session.user.email,
      phone: user.phone || "",
      profileImage: session.user.image || "https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg",
      address: {
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        zipCode: user.address?.zipCode || "",
        country: user.address?.country || "",
      },
    });
  } catch (error) {
    console.error("Profile GET error:", error);
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
    const { name, email, phone, address } = await req.json();
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        fullname: name,
        email,
        phone: phone || "",
        address: {
          street: address?.street || "",
          city: address?.city || "",
          state: address?.state || "",
          zipCode: address?.zipCode || "",
          country: address?.country || "",
        },
      },
      { new: true, runValidators: true }
    ).select("fullname email phone address");
    
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    
    return NextResponse.json({
      name: user.fullname || session.user.name,
      email: user.email || session.user.email,
      phone: user.phone || "",
      profileImage: session.user.image || "https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg",
      address: {
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        zipCode: user.address?.zipCode || "",
        country: user.address?.country || "",
      },
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
