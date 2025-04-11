"use client"

import React, { useState, ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
	LayoutDashboard,
	Package,
	ShoppingCart,
	Users,
	Settings,
	LogOut,
	Menu,
	X,
	Bell,
	ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { supabase } from "@/lib/supabase"

interface AdminLayoutProps {
	children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	const pathname = usePathname()
	const router = useRouter()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	const handleSignOut = async () => {
		await supabase.auth.signOut()
		router.push("/admin/login")
	}

	const navItems = [
		{
			title: "Dashboard",
			href: "/admin/dashboard",
			icon: <LayoutDashboard className="w-5 h-5" />,
		},
		{
			title: "Products",
			href: "/admin/products",
			icon: <Package className="w-5 h-5" />,
		},
		{
			title: "Orders",
			href: "/admin/orders",
			icon: <ShoppingCart className="w-5 h-5" />,
		},
		{
			title: "Customers",
			href: "/admin/customers",
			icon: <Users className="w-5 h-5" />,
		},
		{
			title: "Settings",
			href: "/admin/settings",
			icon: <Settings className="w-5 h-5" />,
		},
	]

	return (
		<div className="flex h-screen bg-gray-100">
			{/* Sidebar - Desktop */}
			<div className="hidden md:flex md:w-64 md:flex-col">
				<div className="flex flex-col flex-grow pt-5 bg-gray-900 overflow-y-auto">
					<div className="flex items-center justify-center flex-shrink-0 px-4">
						<Link
							href="/admin/dashboard"
							className="text-2xl font-bold text-white"
						>
							DRT Admin
						</Link>
					</div>
					<div className="mt-8 flex-1 flex flex-col">
						<nav className="flex-1 px-3 space-y-1">
							{navItems.map((item) => {
								const isActive = pathname === item.href
								return (
									<Link
										key={item.href}
										href={item.href}
										className={`group flex items-center px-3 py-2 rounded-md font-medium transition-colors ${
											isActive
												? "bg-blue-700 text-white"
												: "text-gray-300 hover:bg-gray-800"
										}`}
									>
										{item.icon}
										<span className="ml-3">{item.title}</span>
									</Link>
								)
							})}
						</nav>
					</div>
					<div className="p-4">
						<Button
							variant="ghost"
							className="w-full justify-start text-red-400 hover:text-white hover:bg-red-600"
							onClick={handleSignOut}
						>
							<LogOut className="w-5 h-5 mr-3" />
							Logout
						</Button>
					</div>
				</div>
			</div>

			{/* Mobile Sidebar */}
			<Sheet>
				<SheetTrigger asChild>
					<Button
						variant="ghost"
						className="md:hidden p-2 m-3 absolute top-0 left-0"
					>
						<Menu className="w-6 h-6" />
					</Button>
				</SheetTrigger>
				<SheetContent side="left" className="bg-gray-900 text-white w-64 p-0">
					<div className="flex flex-col h-full">
						<div className="flex items-center justify-center px-4 py-5">
							<Link href="/admin/dashboard" className="text-2xl font-bold">
								DRT Admin
							</Link>
						</div>
						<nav className="flex-1 px-3 space-y-1 mt-8">
							{navItems.map((item) => {
								const isActive = pathname === item.href
								return (
									<Link
										key={item.href}
										href={item.href}
										className={`group flex items-center px-3 py-2 rounded-md font-medium transition-colors ${
											isActive
												? "bg-blue-700 text-white"
												: "text-gray-300 hover:bg-gray-800"
										}`}
									>
										{item.icon}
										<span className="ml-3">{item.title}</span>
									</Link>
								)
							})}
						</nav>
						<div className="p-4">
							<Button
								variant="ghost"
								className="w-full justify-start text-red-400 hover:text-white hover:bg-red-600"
								onClick={handleSignOut}
							>
								<LogOut className="w-5 h-5 mr-3" />
								Logout
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>

			{/* Main Content */}
			<div className="flex flex-col flex-1 overflow-hidden">
				{/* Top Navigation */}
				<header className="bg-white border-b border-gray-200 shadow-sm">
					<div className="flex items-center justify-between px-4 py-3">
						<h1 className="text-xl font-semibold text-gray-800 md:pl-4">
							{navItems.find((item) => item.href === pathname)?.title ||
								"Admin"}
						</h1>
						<div className="flex items-center space-x-4">
							<Button variant="ghost" className="relative" size="icon">
								<Bell className="w-5 h-5" />
								<span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="flex items-center gap-2"
										size="sm"
									>
										<Avatar className="w-8 h-8">
											<AvatarImage src="/default-avatar.png" alt="Admin" />
											<AvatarFallback>AD</AvatarFallback>
										</Avatar>
										<span className="hidden md:inline-block">Admin</span>
										<ChevronDown className="w-4 h-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>My Account</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem>Profile</DropdownMenuItem>
									<DropdownMenuItem>Settings</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={handleSignOut}
										className="text-red-600"
									>
										Log out
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
			</div>
		</div>
	)
}
