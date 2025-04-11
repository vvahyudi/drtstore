/**
 * File: src/middleware.ts
 * This middleware protects the admin routes by checking authentication
 */

import { NextRequest, NextResponse } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
	const res = NextResponse.next()
	const supabase = createMiddlewareClient({ req, res })

	// Check if the user is authenticated
	const {
		data: { session },
	} = await supabase.auth.getSession()

	// If not authenticated and trying to access admin routes
	if (!session && req.nextUrl.pathname.startsWith("/admin")) {
		// If the user is trying to access the login page, let them through
		if (req.nextUrl.pathname === "/admin/login") {
			return res
		}

		// Redirect to login page
		const redirectUrl = new URL("/admin/login", req.url)
		return NextResponse.redirect(redirectUrl)
	}

	// If authenticated, check if the user is an admin for admin routes
	if (session && req.nextUrl.pathname.startsWith("/admin")) {
		// Skip this check for the login page
		if (req.nextUrl.pathname === "/admin/login") {
			// If already logged in, redirect to dashboard
			const redirectUrl = new URL("/admin/dashboard", req.url)
			return NextResponse.redirect(redirectUrl)
		}

		try {
			// Check if the user has the admin role
			const { data: roleData, error: roleError } = await supabase
				.from("user_roles")
				.select("role")
				.eq("user_id", session.user.id)
				.eq("role", "admin")
				.single()

			if (roleError || !roleData) {
				// User doesn't have admin role, redirect to unauthorized page
				const redirectUrl = new URL("/unauthorized", req.url)
				return NextResponse.redirect(redirectUrl)
			}
		} catch (error) {
			console.error("Error checking admin role:", error)
			// On error, redirect to login page
			const redirectUrl = new URL("/admin/login", req.url)
			return NextResponse.redirect(redirectUrl)
		}
	}

	return res
}

// Only run the middleware on admin routes
export const config = {
	matcher: ["/admin/:path*"],
}
