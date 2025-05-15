import { NextResponse } from "next/server";
import { getDataFromToken } from "@/utils/getDataFromToken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const userData = getDataFromToken();
    
    if (!userData) {
      return NextResponse.json(
        { message: "Not authenticated" }, 
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        image: userData.image
      }
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { message: "Internal server error" }, 
      { status: 500 }
    );
  }
}