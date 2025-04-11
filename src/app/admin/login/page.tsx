"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, AlertCircle, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function AdminLoginPage() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	// This would check if the user is already logged in and is an admin
	// useEffect(() => {
	//   const checkAuth = async () => {
	//     const { data } = await supabase.auth.getSession()
	//     if (data.session) {
	//       router.push("/admin/dashboard")
	//     }
	//   }
	//   checkAuth()
	// }, [])

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		setIsLoading(true)

		try {
			// Authenticate with Supabase
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			})

			if (error) throw error

			// Check if user has admin role (you need to implement this)
			// This is just an example - you would check your user_roles table
			const { data: roleData, error: roleError } = await supabase
				.from("user_roles")
				.select("role")
				.eq("user_id", data.user?.id)
				.eq("role", "admin")
				.single()

			if (roleError || !roleData) {
				throw new Error("Unauthorized access. You don't have admin privileges.")
			}

			// Redirect to admin dashboard
			router.push("/admin/dashboard")
		} catch (err) {
			console.error("Login error:", err)
			setError(
				err instanceof Error
					? err.message
					: "Failed to login. Please check your credentials.",
			)
		} finally {
			setIsLoading(false)
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
							<Label htmlFor="email">Email address</Label>
							<Input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
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
