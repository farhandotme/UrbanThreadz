import { sign } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = sign({ email: email }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });
      const response = NextResponse.json(
        { message: "Login successful" },
        {
          status: 200,
        }
      );
      response.cookies.set("adminToken", token, {
        httpOnly: true,
      });
      return response;
    } else {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }
}
