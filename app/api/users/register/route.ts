import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/DB/dbConfig";
import userModels from "@/models/userModels";
import jwt from "jsonwebtoken";
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
        {
          status: 409,
        }
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

    // Create JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    // Send JWT token in response
    const response = NextResponse.json(
      { message: "User registered successfully", token },
      { status: 201 }
    );
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }
}
