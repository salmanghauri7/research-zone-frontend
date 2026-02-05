import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("authCookie")?.value;

  console.log("cookie", token);

  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/signup",
    "/auth/verifyotp",
    "/auth/forgotpassword",
    "/auth/resetpassword",
  ];

  // Check if current path is public or onboarding
  const pathname = req.nextUrl.pathname;
  const isPublic =
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/onboarding/");

  // If user is NOT logged in & trying to access protected route → redirect to login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // If user IS logged in & trying to access auth routes (not onboarding) → redirect to dashboard
  if (
    token &&
    (publicRoutes.includes(pathname) || pathname.startsWith("/auth/"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth/:path*",
    "/onboarding/:path*",
    "/dashboard/:path*",
    "/papers/:path*",
    "/projects/:path*",
    "/workspace/:path*",
  ],
};
