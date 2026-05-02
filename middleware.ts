import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Middleware for authentication and request processing.
 * This uses the Edge Runtime and can inspect/modify requests before they reach your app.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Use NextAuth JWT in middleware to check session presence.
  try {
    const token = await getToken({ 
      req: request as any, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    // You can inspect `token` and conditionally redirect/protect routes here.
  } catch (error) {
    console.error('Token validation error:', error);
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static assets and images
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
