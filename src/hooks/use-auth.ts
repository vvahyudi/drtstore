// src/hooks/use-auth.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import authService, { LoginCredentials } from "@/services/auth-service"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

/**
 * Hook for login functionality
 */
export function useLogin() {
	const router = useRouter()

	return useMutation({
		mutationFn: (credentials: LoginCredentials) =>
			authService.login(credentials),
		onSuccess: (data) => {
			// Store tokens in localStorage
			authService.setTokens(data.access_token, data.refresh_token)
			toast.success("Login successful")

			// Redirect to dashboard or home page
			router.push("/admin/dashboard")
		},
		onError: (error) => {
			console.error("Login failed:", error)
			toast.error("Login failed. Please check your credentials.")
		},
	})
}

/**
 * Hook for logout functionality
 */
export function useLogout() {
	const router = useRouter()
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: () => authService.logout(),
		onSuccess: () => {
			// Clear any cached queries
			queryClient.clear()
			toast.success("Logged out successfully")

			// Redirect to login page
			router.push("/admin/login")
		},
		onError: (error) => {
			console.error("Logout failed:", error)
			toast.error("Logout failed")

			// Still clear tokens and redirect even if API call fails
			localStorage.removeItem("accessToken")
			localStorage.removeItem("refreshToken")
			router.push("/admin/login")
		},
	})
}

/**
 * Hook for registration functionality
 */
export function useRegister() {
	const router = useRouter()

	return useMutation({
		mutationFn: (userData: {
			fullname: string
			username: string
			password: string
		}) => authService.register(userData),
		onSuccess: () => {
			toast.success("Registration successful. Please login.")
			router.push("/admin/login")
		},
		onError: (error) => {
			console.error("Registration failed:", error)
			toast.error("Registration failed. Please try again.")
		},
	})
}

/**
 * Utility hook to check if user is authenticated
 */
export function useAuthStatus() {
	const isLoggedIn = authService.isLoggedIn()

	return {
		isAuthenticated: isLoggedIn,
		accessToken: authService.getAccessToken(),
	}
}
