"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, AlertCircle, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAdminAuth } from "@/hooks/use-admin-auth"

export default function AdminLoginPage() {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const { login, isLoading, isAuthenticated } = useAdminAuth()
	const searchParams = useSearchParams()
	const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard"

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)

		if (!username || !password) {
			setError("Please enter both username and password")
			return
		}

		try {
			const success = await login(username, password)
			if (!success) {
				setError("Invalid username or password")
			}
		} catch (err) {
			console.error("Login error:", err)
			setError("Failed to login. Please try again.")
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
				<div className="text-center">
					<div className="flex justify-center mb-2">
						<div className="p-2 bg-blue-100 rounded-full">
							<Lock className="h-8 w-8 text-blue-600" />
						</div>
					</div>
					<h2 className="mt-2 text-2xl font-bold text-gray-900">Admin Login</h2>
					<p className="mt-2 text-sm text-gray-600">
						Sign in to access the admin dashboard
					</p>
				</div>

				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<form className="mt-8 space-y-6" onSubmit={handleLogin}>
					<div className="space-y-4">
						<div>
							<Label htmlFor="username">Username</Label>
							<Input
								id="username"
								name="username"
								type="text"
								autoComplete="username"
								required
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="mt-1"
								/>
								<button
									type="button"
									className="absolute inset-y-0 right-0 pr-3 flex items-center"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<EyeOff className="h-5 w-5 text-gray-400" />
									) : (
										<Eye className="h-5 w-5 text-gray-400" />
									)}
								</button>
							</div>
						</div>
					</div>

					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? "Signing in..." : "Sign in"}
					</Button>
				</form>
			</div>
		</div>
	)
}
