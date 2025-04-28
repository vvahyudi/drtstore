import apiClient from "@/lib/axios"

export interface LoginCredentials {
	username: string
	password: string
}

export interface AuthResponse {
	username: string
	access_token: string
	refresh_token: string
}

export interface RefreshTokenRequest {
	refresh_token: string
}

export interface RefreshTokenResponse {
	access_token: string
	refresh_token: string
}

class AuthService {
	/**
	 * Login user and get tokens
	 */
	async login(credentials: LoginCredentials): Promise<AuthResponse> {
		const response = await apiClient.post("/auth/login", credentials)
		return response.data.data
	}

	/**
	 * Logout user (blacklist token)
	 */
	async logout(): Promise<void> {
		await apiClient.post("/auth/logout")
		// Clear tokens from localStorage
		localStorage.removeItem("accessToken")
		localStorage.removeItem("refreshToken")
	}

	/**
	 * Register a new user
	 */
	async register(userData: {
		fullname: string
		username: string
		password: string
	}): Promise<any> {
		const response = await apiClient.post("/user/register", userData)
		return response.data.data
	}

	/**
	 * Refresh access token using refresh token
	 */
	async refreshToken(
		refreshTokenRequest: RefreshTokenRequest,
	): Promise<RefreshTokenResponse> {
		const response = await apiClient.post("/auth/refresh", refreshTokenRequest)
		return response.data.data
	}

	/**
	 * Check if user is logged in
	 */
	isLoggedIn(): boolean {
		if (typeof window === "undefined") return false
		return !!localStorage.getItem("accessToken")
	}

	/**
	 * Get current access token
	 */
	getAccessToken(): string | null {
		if (typeof window === "undefined") return null
		return localStorage.getItem("accessToken")
	}

	/**
	 * Get current refresh token
	 */
	getRefreshToken(): string | null {
		if (typeof window === "undefined") return null
		return localStorage.getItem("refreshToken")
	}

	/**
	 * Store auth tokens
	 */
	setTokens(accessToken: string, refreshToken: string): void {
		localStorage.setItem("accessToken", accessToken)
		localStorage.setItem("refreshToken", refreshToken)
	}
}

export const authService = new AuthService()
export default authService
