"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCategories } from "@/hooks/use-categories"
import { Loader2 } from "lucide-react"

export function CategorySection() {
	const { data: categories, isLoading, isError } = useCategories()

	// Static image placeholders until API provides the real ones
	const categoryImages = {
		"Koleksi Kacamata": "/kacamata.jpg?height=600&width=400",
		"Koleksi Jam Tangan": "/jamtangan.jpg?height=600&width=400",
		Aksesoris: "/headphone.jpg?height=600&width=400",
	}

	if (isLoading) {
		return (
			<section className="py-16 px-4 space-y-12 bg-gradient-to-b from-slate-50 to-white">
				<div className="flex flex-col items-center text-center space-y-4">
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-10 w-72" />
					<Skeleton className="h-6 w-96" />
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-[350px] w-full rounded-xl" />
					))}
				</div>
			</section>
		)
	}

	if (isError) {
		return (
			<section className="py-16 px-4 space-y-12 bg-gradient-to-b from-slate-50 to-white">
				<div className="flex flex-col items-center text-center space-y-4">
					<span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
						KATEGORI PILIHAN
					</span>
					<h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
						Jelajahi Kategori
					</h2>
					<p className="text-red-500">
						Failed to load categories. Please try again later.
					</p>
				</div>
			</section>
		)
	}

	// Map categories from API to the format we need
	const mappedCategories =
		categories?.map((category) => ({
			name: category.name,
			image: categoryImages[category.name] || "/placeholder.svg",
			href: `/products/${category.slug}`,
			description: category.description,
		})) || []

	return (
		<section className="py-16 px-4 space-y-12 bg-gradient-to-b from-slate-50 to-white">
			<div className="flex flex-col items-center text-center space-y-4">
				<span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
					KATEGORI PILIHAN
				</span>
				<h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
					Jelajahi Kategori
				</h2>
				<p className="text-muted-foreground max-w-[600px] text-lg">
					Temukan gaya yang mencerminkan kepribadian Anda dari koleksi pilihan
					kami
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{mappedCategories.map((category) => (
					<Link
						key={category.name}
						href={category.href}
						className="group relative block"
					>
						<Card className="overflow-hidden h-[350px] border-none rounded-xl shadow-md transition-all group-hover:shadow-xl">
							<CardContent className="p-0 h-full relative">
								<div
									className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
									style={{ backgroundImage: `url(${category.image})` }}
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 transition-opacity duration-300" />

								<div className="absolute inset-x-0 bottom-0 p-6 text-white transform transition-transform duration-300 group-hover:translate-y-0 translate-y-4">
									<h3 className="text-2xl font-bold mb-2 group-hover:mb-3 transition-all">
										{category.name}
									</h3>
									<p className="text-white/70 text-sm transform opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-300 ease-in-out">
										{category.description}
									</p>
									<div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
										<span>Lihat Koleksi</span>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="ml-1"
										>
											<path d="M5 12h14"></path>
											<path d="m12 5 7 7-7 7"></path>
										</svg>
									</div>
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>

			<div className="flex justify-center mt-6">
				<Link
					href="/products"
					className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-400/20 hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1"
				>
					Lihat Semua Produk
				</Link>
			</div>
		</section>
	)
}
