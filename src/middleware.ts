import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  let user = null;
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseUrl = (rawUrl && rawUrl.startsWith("http")) ? rawUrl : null;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              );
              response = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              );
            },
          },
        }
      );

      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch (err) {
      console.error("Middleware Supabase auth check failed:", err);
    }
  }

  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/ibu-restifashop-dashboard")) {
    // 1. If not logged in and trying to access admin dashboard, redirect to login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/ibu-restifashop";
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/ibu-restifashop") {
    // 2. If logged in and trying to access login page, redirect to dashboard
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/ibu-restifashop-dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/ibu-restifashop-dashboard/:path*", "/ibu-restifashop"],
};
