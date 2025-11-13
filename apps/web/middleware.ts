import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup"]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/assets/")) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get("ACCESS_TOKEN");

  const redirectToLogin = () => {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (pathname !== "/login") {
      url.searchParams.set("redirect", pathname + (search ? search : ""));
    }
    return NextResponse.redirect(url);
  };

  if (isPublicPath(pathname)) {
    if (pathname !== "/login" && pathname !== "/signup") {
      return NextResponse.next();
    }

    if (accessToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  if (!accessToken) {
    return redirectToLogin();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|webp)$).*)",
  ],
};
