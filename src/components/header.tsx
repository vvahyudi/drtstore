"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
	{ href: "/", label: "Home" },
	{ href: "/products", label: "All Products" },
	{ href: "/products/men", label: "Men" },
	{ href: "/products/women", label: "Women" },
	{ href: "/about", label: "About" },
	{ href: "/contact", label: "Contact" },
]

function NavLinks({ className }: { className?: string }) {
	return (
		<nav className={className}>
			{navItems.slice(0, 4).map(({ href, label }) => (
				<Link
					key={href}
					href={href}
					className="font-medium transition-colors hover:text-primary"
				>
					{label}
				</Link>
			))}
		</nav>
	)
}

function MobileNav() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" className="md:hidden">
					<Menu className="h-6 w-6" />
					<span className="sr-only">Toggle menu</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-[300px] sm:w-[400px]">
				<nav className="flex flex-col gap-4 mt-8">
					{navItems.map(({ href, label }) => (
						<Link key={href} href={href} className="text-lg font-medium">
							{label}
						</Link>
					))}
				</nav>
			</SheetContent>
		</Sheet>
	)
}

function SearchBar({
	isOpen,
	onClose,
	onOpen,
}: {
	isOpen: boolean
	onClose: () => void
	onOpen: () => void
}) {
	return isOpen ? (
		<div className="relative flex items-center">
			<Input
				type="search"
				placeholder="Search products..."
				className="w-[200px] md:w-[300px]"
				autoFocus
			/>
			<Button
				variant="ghost"
				size="icon"
				className="absolute right-0"
				onClick={onClose}
			>
				<X className="h-4 w-4" />
				<span className="sr-only">Close search</span>
			</Button>
		</div>
	) : (
		<Button variant="ghost" size="icon" onClick={onOpen}>
			<Search className="h-5 w-5" />
			<span className="sr-only">Search</span>
		</Button>
	)
}

export function Header() {
	const [isSearchOpen, setIsSearchOpen] = useState(false)

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background">
			<div className="container flex h-16 items-center px-4">
				<MobileNav />

				<Link href="/" className="ml-4 md:ml-0 flex items-center gap-2">
					<Image src="/logo.png" alt="Logo" width={150} height={150} />
				</Link>

				<NavLinks className="mx-6 hidden md:flex items-center gap-6 text-sm" />

				<div className="ml-auto flex items-center gap-2">
					<SearchBar
						isOpen={isSearchOpen}
						onClose={() => setIsSearchOpen(false)}
						onOpen={() => setIsSearchOpen(true)}
					/>
				</div>
			</div>
		</header>
	)
}
