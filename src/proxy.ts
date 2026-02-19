import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LAUNCH_DATE = new Date("2026-03-10T00:00:00Z");
const PREVIEW_COOKIE = "ov_preview";

function getDomainRewriteResponse(req: NextRequest): NextResponse | null {
    const url = req.nextUrl;
    const hostname = (req.headers.get("host") || "").toLowerCase();
    const mainDomain = "opsvantagedigital.online";
    const mainDomainWithWww = `www.${mainDomain}`;

    if (
        hostname === mainDomain ||
        hostname === mainDomainWithWww ||
        hostname === "localhost:3000"
    ) {
        return null;
    }

    if (url.pathname.startsWith("/api") || url.pathname.startsWith("/_next") || /\.[^/]+$/.test(url.pathname)) {
        return null;
    }

    const searchParams = url.searchParams.toString();
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;
    let subdomain = hostname.replace(`.${mainDomain}`, "");

    if (subdomain === "www" || subdomain === hostname) {
        subdomain = hostname;
    }

    return NextResponse.rewrite(new URL(`/[subdomain]${path}`, req.url).toString().replace("[subdomain]", subdomain));
}

export async function proxy(req: NextRequest) {
    const now = new Date();
    const { pathname, origin, searchParams } = req.nextUrl;
    const isPublicAsset = /\.[^/]+$/.test(pathname);
    const launchMode = (process.env.NEXT_PUBLIC_LAUNCH_MODE ?? "BETA").toUpperCase();

    const launchModeBypassPaths = ["/sovereign-access", "/admin/dashboard", "/api/admin/telemetry"];
    if (launchModeBypassPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    const adminToken = req.cookies.get("zenith_admin_token")?.value;
    const isSovereignAdmin = Boolean(adminToken);

    if (isSovereignAdmin && pathname.startsWith("/admin/dashboard")) {
        return NextResponse.next();
    }

    const allowPrefixes = ["/api", "/_next"];
    const allowExact = new Set([
        "/",
        "/coming-soon",
        "/favicon.ico",
        "/robots.txt",
        "/sitemap.xml",
        "/sovereign-access",
    ]);
    const isMarzChatRoute = pathname === "/marz/chat" || pathname.startsWith("/marz/chat/");

    let globalLaunchActive = false;
    if (!pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
        try {
            const response = await fetch(`${origin}/api/admin/kill-switch`, {
                method: "GET",
                cache: "no-store",
            });
            if (response.ok) {
                const payload = (await response.json()) as { globalLaunchActive?: boolean };
                globalLaunchActive = Boolean(payload.globalLaunchActive);
            }
        } catch {
            globalLaunchActive = false;
        }
    }

    if (isPublicAsset || isMarzChatRoute || allowExact.has(pathname) || allowPrefixes.some((prefix) => pathname.startsWith(prefix))) {
        const response = NextResponse.next();
        response.headers.set("x-zenith-authorized", isSovereignAdmin.toString());
        return response;
    }

    if (!isSovereignAdmin && !globalLaunchActive) {
        const isPreLaunch = now < LAUNCH_DATE;
        const isReleaseOverride = launchMode === "RELEASE" || launchMode === "PRODUCTION" || launchMode === "PUBLIC";

        const hasPreviewParam = searchParams.get("preview") === "true";
        const hasPreviewCookie = req.cookies.get(PREVIEW_COOKIE)?.value === "1";
        const allowPrelaunchBypass = hasPreviewParam || hasPreviewCookie;

        if (hasPreviewParam && !hasPreviewCookie) {
            const res = NextResponse.next();
            res.cookies.set(PREVIEW_COOKIE, "1", {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 7,
                path: "/",
            });
            res.headers.set("x-zenith-authorized", isSovereignAdmin.toString());
            return res;
        }

        if (isPreLaunch && !isReleaseOverride && !allowPrelaunchBypass) {
            const response = NextResponse.redirect(`${origin}/`);
            response.headers.set("x-zenith-authorized", isSovereignAdmin.toString());
            return response;
        }
    }

    const domainRewriteResponse = getDomainRewriteResponse(req);
    if (domainRewriteResponse) {
        domainRewriteResponse.headers.set("x-global-launch-active", globalLaunchActive.toString());
        domainRewriteResponse.headers.set("x-zenith-authorized", isSovereignAdmin.toString());
        return domainRewriteResponse;
    }

    const needsAuth = pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
    if (!needsAuth || isSovereignAdmin) {
        const response = NextResponse.next();
        response.headers.set("x-global-launch-active", globalLaunchActive.toString());
        response.headers.set("x-zenith-authorized", isSovereignAdmin.toString());
        return response;
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "dev-nextauth-secret" });
    if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        const response = NextResponse.redirect(loginUrl);
        response.headers.set("x-global-launch-active", globalLaunchActive.toString());
        response.headers.set("x-zenith-authorized", isSovereignAdmin.toString());
        return response;
    }

    const response = NextResponse.next();
    response.headers.set("x-global-launch-active", globalLaunchActive.toString());
    response.headers.set("x-zenith-authorized", isSovereignAdmin.toString());
    return response;
}

export const config = {
    matcher: ["/admin/:path*", "/dashboard/:path*", "/((?!_next/static|_next/image|api/webhooks|.*\\..*).*)"],
};
