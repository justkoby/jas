import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "./config";

/**
 * Refreshes the Supabase session cookie on every request and
 * guards the /admin area. Role enforcement happens again on
 * the server for every privileged operation — this is only the
 * first line of defence.
 */
export async function updateSession(request: NextRequest) {
  // When Supabase is not configured yet, let every request pass.
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

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

  // Important: do not remove. This keeps sessions fresh for
  // Server Components without extra round-trips.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (isAdminRoute && !user) {
    const redirectUrl = new URL("/account/login", request.url);
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAdminRoute && user) {
    // Lightweight role gate: non-staff users are bounced before
    // any admin page renders. Server actions re-check roles.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isStaffRole =
      profile && ["staff", "admin", "super_admin"].includes(profile.role);

    if (!isStaffRole) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}
