import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 },
  );

  // Delete the authCookie by setting it to empty with past expiration
  response.cookies.set("authCookie", "", {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: new Date(0),
  });

  // Delete CloudFront cookies
  const cloudFrontCookies = [
    "CloudFront-Key-Pair-Id",
    "CloudFront-Policy",
    "CloudFront-Signature",
  ];

  cloudFrontCookies.forEach((cookieName) => {
    response.cookies.set(cookieName, "", {
      path: "/",
      expires: new Date(0),
    });
  });

  return response;
}
