import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value);
                    });

                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        },
    );

    let user = null;

    try {
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch {
        // Supabase unreachable.
        // Public routes remain accessible.
        // Protected routes will be redirected to login.
    }

    const url = request.nextUrl.clone();
    const pathname = url.pathname;

    const isRootPage = pathname === "/";
    const isAuthRoute = pathname.startsWith("/auth");

    /*
     * These routes must remain accessible even when
     * the user is already authenticated.
     *
     * forgot-password:
     * Allows an authenticated user to request a
     * password reset email.
     *
     * reset-password:
     * Allows the user to set a new password after
     * clicking the Supabase recovery link.
     *
     * callback:
     * Handles OAuth and password recovery callbacks.
     */
    const isAllowedAuthenticatedAuthRoute =
        pathname === "/auth/forgot-password" ||
        pathname === "/auth/reset-password" ||
        pathname.startsWith("/auth/callback");

    const isPublicPage = isRootPage || isAuthRoute;

    /*
     * Unauthenticated users cannot access protected
     * application routes.
     */
    if (!user && !isPublicPage) {
        url.pathname = "/auth/login";
        url.searchParams.set("next", pathname);

        return NextResponse.redirect(url);
    }

    /*
     * Authenticated users should not access normal
     * authentication pages such as login/signup.
     *
     * Password recovery and callback routes are
     * explicitly allowed above.
     */
    if (user && isAuthRoute && !isAllowedAuthenticatedAuthRoute) {
        url.pathname = "/dashboard";

        return NextResponse.redirect(url);
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
