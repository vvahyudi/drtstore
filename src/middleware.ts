import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname

	// Check if the path starts with /admin and is not the login page
	const isAdminPath = path.startsWith("/admin")
	const isLoginPath = path === "/admin/login"

	// Public paths that don't require authentication
	const isPublicPath = isLoginPath

	if (isAdminPath && !isPublicPath) {
		// This is a protected Admin route, verify authentication
		const token = await getToken({
			req: request,
			secret: process.env.NEXTAUTH_SECRET,
		})

		if (!token) {
			// User is not authenticated, redirect to login page
			const url = new URL("/admin/login", request.url)
			// Add the callback URL to return after login
			url.searchParams.set("callbackUrl", encodeURI(request.url))
			return NextResponse.redirect(url)
		}
	} else if (isLoginPath) {
		// If trying to access login page while already authenticated,
		// redirect to dashboard
		const token = await getToken({
			req: request,
			secret: process.env.NEXTAUTH_SECRET,
		})

		if (token) {
			return NextResponse.redirect(new URL("/admin/dashboard", request.url))
		}
	}

	return NextResponse.next()
}

// Specify which routes this middleware applies to
export const config = {
	matcher: [
		// Match all admin routes
		"/admin/:path*",
	],
}
