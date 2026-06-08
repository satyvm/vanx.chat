import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup"]);
const ACCESS_COOKIE = "ACCESS_TOKEN";
const REFRESH_COOKIE = "REFRESH_TOKEN";
const NEEDS_REFRESH_COOKIE = "VX_NEEDS_REFRESH";

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/assets/")) return true;
  return false;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_COOKIE);
  const refreshToken = request.cookies.get(REFRESH_COOKIE);

  const hasValidAccess = !!accessToken && !isJwtExpired(accessToken.value);
  const hasValidRefresh = !!refreshToken && !isJwtExpired(refreshToken.value);
  const needsRefresh = !hasValidAccess && hasValidRefresh;
  const shouldLogout = !hasValidAccess && !hasValidRefresh;

  const redirectToLogin = () => {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/login") {
      const redirectTarget = `${pathname}${search || ""}`;
      loginUrl.searchParams.set("redirect", redirectTarget);
    }
    const response = NextResponse.redirect(loginUrl);
    deleteCookie(response, ACCESS_COOKIE);
    deleteCookie(response, REFRESH_COOKIE);
    deleteCookie(response, NEEDS_REFRESH_COOKIE);
    return response;
  };

  if (isPublicPath(pathname)) {
    if ((pathname === "/login" || pathname === "/signup") && hasValidAccess) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  if (hasValidAccess) {
    const response = NextResponse.next();
    if (request.cookies.get(NEEDS_REFRESH_COOKIE)) {
      deleteCookie(response, NEEDS_REFRESH_COOKIE);
    }
    return response;
  }

  if (needsRefresh) {
    const response = NextResponse.next();
    response.cookies.set({
      name: NEEDS_REFRESH_COOKIE,
      value: "1",
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });
    return response;
  }

  if (shouldLogout) {
    return redirectToLogin();
  }

  return NextResponse.next();
}

function isJwtExpired(token?: string | null) {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  const exp =
    typeof payload.exp === "number" ? payload.exp : Number(payload.exp);
  if (!Number.isFinite(exp)) return true;
  return exp * 1000 <= Date.now();
}

function decodeJwt(token: string) {
  const parts = token.split(".");
  if (parts.length < 2 || !parts[1]) return null;
  const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = payload + "=".repeat((4 - (payload.length % 4 || 4)) % 4);
  try {
    if (typeof atob === "function") {
      return JSON.parse(atob(padded));
    }

    type NodeBufferLike = {
      from(
        data: string,
        encoding: string,
      ): { toString(encoding: string): string };
    };
    const nodeBuffer = (globalThis as { Buffer?: NodeBufferLike }).Buffer;
    if (nodeBuffer) {
      return JSON.parse(nodeBuffer.from(padded, "base64").toString("utf8"));
    }

    return null;
  } catch {
    return null;
  }
}

function deleteCookie(response: NextResponse, name: string) {
  response.cookies.set({
    name,
    value: "",
    path: "/",
    maxAge: 0,
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|webp)$).*)",
  ],
};
