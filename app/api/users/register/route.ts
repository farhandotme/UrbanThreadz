import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/DB/dbConfig";
import userModels from "@/models/userModels";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { fullname, email, password } = await request.json();

    // Check for existing user
    const existingUser = await userModels.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await userModels.create({
      fullname,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      { 
        message: "Registration successful",
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.fullname
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 }
    );
  }
}