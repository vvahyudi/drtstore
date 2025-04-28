"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

/**
 * Hook for handling admin authentication
 */
export function useAdminAuth() {
	const { data: session, status } = useSession()
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	/**
	 * Login with credentials
	 */
	const login = async (username: string, password: string) => {
		setIsLoading(true)

		try {
			const result = await signIn("credentials", {
				username,
				password,
				redirect: false,
			})

			if (result?.error) {
				toast.error("Invalid username or password")
				return false
			}

			if (result?.ok) {
				toast.success("Login successful")
				router.push("/admin/dashboard")
				router.refresh()
				return true
			}

			return false
		} catch (error) {
			console.error("Login error:", error)
			toast.error("An error occurred during login")
			return false
		} finally {
			setIsLoading(false)
		}
	}

	/**
	 * Logout the user
	 */
	const logout = async () => {
		setIsLoading(true)

		try {
			await signOut({ redirect: false })
			toast.success("Logged out successfully")
			router.push("/admin/login")
			router.refresh()
		} catch (error) {
			console.error("Logout error:", error)
			toast.error("An error occurred during logout")
		} finally {
			setIsLoading(false)
		}
	}

	return {
		session,
		isLoading,
		isAuthenticated: status === "authenticated",
		isUnauthenticated: status === "unauthenticated",
		login,
		logout,
	}
}
