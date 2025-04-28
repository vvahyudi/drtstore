import axios from "axios"

// Create a custom Axios instance with default config
const apiClient = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api",
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 10000, // 10 seconds
})

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
	(config) => {
		// Get the token from localStorage (client-side only)
		if (typeof window !== "undefined") {
			const token = localStorage.getItem("accessToken")
			if (token) {
				config.headers.Authorization = `Bearer ${token}`
			}
		}
		return config
	},
	(error) => {
		return Promise.reject(error)
	},
)

// Response interceptor for handling errors
apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config

		// If error is 401 and we haven't tried to refresh token yet
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true

			try {
				// Get the refresh token from localStorage
				const refreshToken = localStorage.getItem("refreshToken")
				if (!refreshToken) {
					// No refresh token, redirect to login
					if (typeof window !== "undefined") {
						window.location.href = "/login"
					}
					return Promise.reject(error)
				}

				// Call the refresh token endpoint
				const response = await axios.post(
					`${
						process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
					}/auth/refresh`,
					{ refresh_token: refreshToken },
				)

				// Store the new tokens
				const { access_token, refresh_token } = response.data.data
				localStorage.setItem("accessToken", access_token)
				localStorage.setItem("refreshToken", refresh_token)

				// Retry the original request with new token
				originalRequest.headers.Authorization = `Bearer ${access_token}`
				return apiClient(originalRequest)
			} catch (refreshError) {
				// If refresh token fails, clear tokens and redirect to login
				localStorage.removeItem("accessToken")
				localStorage.removeItem("refreshToken")

				if (typeof window !== "undefined") {
					window.location.href = "/login"
				}
				return Promise.reject(refreshError)
			}
		}

		return Promise.reject(error)
	},
)

export default apiClient
