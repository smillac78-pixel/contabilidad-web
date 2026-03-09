import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") ||
                      request.nextUrl.pathname.startsWith("/register");
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isVerifyPage = request.nextUrl.pathname.startsWith("/auth/verify");

  // Sin sesión intentando entrar al dashboard → login
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user) {
    // Email+password sin verificar → página de verificación
    const isEmailUser = user.app_metadata?.provider === "email";
    const isVerified = !!user.email_confirmed_at;
    if (isEmailUser && !isVerified && isDashboard) {
      return NextResponse.redirect(new URL("/auth/verify", request.url));
    }

    // Ya verificado intentando entrar a login/register → dashboard
    if (isAuthRoute && (!isEmailUser || isVerified)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Ya verificado intentando entrar a /auth/verify → dashboard
    if (isVerifyPage && isVerified) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/auth/verify"],
};
