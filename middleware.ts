import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the user is authenticated for protected routes
  const isAuthenticated = request.cookies.has("idToken")
  const isAuthPage = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register"
  const isHomePage = request.nextUrl.pathname === "/"

  // Allow access to home page without authentication
  if (isHomePage) {
    return NextResponse.next()
  }

  // If trying to access auth pages while logged in, redirect to chat
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/chat", request.url))
  }

  // If trying to access protected pages while logged out, redirect to login
  if (!isAuthPage && !isAuthenticated && request.nextUrl.pathname.startsWith("/chat")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/chat/:path*", "/login", "/register"],
}
