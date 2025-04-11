import { NextRequest } from "next/server"
import { supabase } from "./supabase"

// Simple auth helper to work with Next.js App Router
export const auth = {
	/**
	 * Get the current session from a request
	 */
	async getSession(request: NextRequest) {
		// Extract the token from the request cookies
		const cookieHeader = request.headers.get("cookie")
		const cookies = parseCookies(cookieHeader || "")

		// If using supabase auth, the cookie will be named 'sb-<project-ref>-auth-token'
		// For simplicity, we'll assume there's a cookie named 'session'
		const sessionCookie = Object.entries(cookies).find(
			([key]) => key.startsWith("sb-") && key.endsWith("-auth-token"),
		)

		if (!sessionCookie) return null

		// Extract the JWT from the cookie
		const token = JSON.parse(decodeURIComponent(sessionCookie[1])).access_token

		// Set supabase auth token for this request
		supabase.auth.setSession({ access_token: token, refresh_token: "" })

		// Get user from session
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser()

		if (error || !user) {
			return null
		}

		return {
			user: {
				id: user.id,
				email: user.email,
				// Add other user properties as needed
			},
		}
	},

	/**
	 * Check if a user has specific roles
	 */
	async hasRole(userId: string, role: string) {
		const { data } = await supabase
			.from("user_roles")
			.select("role")
			.eq("user_id", userId)
			.eq("role", role)
			.single()

		return !!data
	},
}

/**
 * Parse cookies from a cookie header string
 */
function parseCookies(cookieHeader: string) {
	const cookies: Record<string, string> = {}

	cookieHeader.split(";").forEach((cookie) => {
		const [name, value] = cookie.split("=").map((c) => c.trim())
		if (name && value) cookies[name] = value
	})

	return cookies
}
