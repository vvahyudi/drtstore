import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import authService from "@/services/auth-service"

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				username: { label: "Username", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.username || !credentials?.password) {
					return null
				}

				try {
					const response = await authService.login({
						username: credentials.username,
						password: credentials.password,
					})

					if (!response || !response.access_token) {
						return null
					}

					// Return the user object with tokens
					return {
						id: response.username,
						name: response.username,
						accessToken: response.access_token,
						refreshToken: response.refresh_token,
					}
				} catch (error) {
					console.error("Authentication error:", error)
					return null
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			// Initial sign in
			if (user) {
				token.accessToken = user.accessToken
				token.refreshToken = user.refreshToken
				token.id = user.id
			}

			// On subsequent calls, check if access token is expired
			// and refresh token if needed
			const tokenExpiryTime = 60 * 60 // 1 hour in seconds
			const tokenCreationTime = token.iat as number
			const currentTime = Math.floor(Date.now() / 1000)

			if (currentTime - tokenCreationTime > tokenExpiryTime) {
				try {
					// Token expired, try to refresh
					if (token.refreshToken) {
						const refreshedTokens = await authService.refreshToken({
							refresh_token: token.refreshToken as string,
						})

						if (refreshedTokens.access_token) {
							token.accessToken = refreshedTokens.access_token
							token.refreshToken = refreshedTokens.refresh_token
							// Update token creation time (iat) for next expiry check
							token.iat = Math.floor(Date.now() / 1000)
						}
					}
				} catch (error) {
					console.error("Failed to refresh token", error)
					// If refresh fails, invalidate the token to force re-login
					return {}
				}
			}

			return token
		},
		async session({ session, token }) {
			if (token) {
				session.user = {
					...session.user,
					id: token.id as string,
				}
				session.accessToken = token.accessToken as string
				session.refreshToken = token.refreshToken as string
			}

			return session
		},
	},
	pages: {
		signIn: "/admin/login",
		error: "/admin/login",
	},
	session: {
		strategy: "jwt",
		maxAge: 24 * 60 * 60, // 1 day
	},
	secret: process.env.NEXTAUTH_SECRET,
}

// Define global types for NextAuth
declare module "next-auth" {
	interface User {
		accessToken?: string
		refreshToken?: string
	}

	interface Session {
		accessToken?: string
		refreshToken?: string
		user: {
			id: string
			name?: string | null
			email?: string | null
			image?: string | null
		}
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		accessToken?: string
		refreshToken?: string
	}
}
