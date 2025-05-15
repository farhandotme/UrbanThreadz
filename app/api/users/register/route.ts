import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/DB/dbConfig";
import userModels from "@/models/userModels";

connectDB();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("incomming body", body);
    const { fullname, email, password } = body;

    const existingUser = await userModels.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
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
      { message: "User registered successfully", newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("🔴 Registration error:", error);
    console.error(
      "🧪 Full error details:",
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    );

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
