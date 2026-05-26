import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Optional edge guard. Enable only when frontend and backend share a cookie domain.
  if (process.env.EDGE_GUARD !== "true") {
    return NextResponse.next();
  }

  const csrf = req.cookies.get("csrf_token")?.value;
  if (!csrf) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*"],
};

