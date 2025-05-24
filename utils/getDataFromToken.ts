import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

interface TokenPayload {
  id: string;
  email: string;
  name: string;
  image?: string;
}

export const getDataFromToken = async (req: unknown) => {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return null;

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    return decodedToken;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};
