import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");
const ADMIN_EMAIL = "bezzo19@gmx.de";

// Routes that don't need auth
const PUBLIC_PATHS = ["/login", "/api/auth/login", "/_next", "/favicon", "/lyqdex-icon", "/api/market"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow landing page and public assets
  if (pathname === "/" || PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Block /register entirely
  if (pathname.startsWith("/register") || pathname.startsWith("/api/auth/register")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const email = (payload as { email?: string }).email;

    if (email !== ADMIN_EMAIL) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("token");
      return res;
    }
  } catch {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
