"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Send, Loader2 } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { useFeaturedProducts } from "@/hooks/use-products"
import { Product } from "@/types/api"

export function FeaturedProducts() {
	const { data: products, isLoading, isError } = useFeaturedProducts(4)

	if (isLoading) {
		return (
			<section className="space-y-8 py-10">
				<div className="flex flex-col items-center text-center space-y-3">
					<h2 className="text-3xl font-bold tracking-tight text-primary">
						Produk Unggulan
					</h2>
					<p className="text-muted-foreground max-w-[600px] text-lg">
						<Loader2 className="h-8 w-8 animate-spin mx-auto" />
						Memuat produk unggulan...
					</p>
					<div className="w-24 h-1 bg-primary rounded-full mt-2"></div>
				</div>
			</section>
		)
	}

	if (isError) {
		return (
			<section className="space-y-8 py-10">
				<div className="flex flex-col items-center text-center space-y-3">
					<h2 className="text-3xl font-bold tracking-tight text-primary">
						Produk Unggulan
					</h2>
					<p className="text-muted-foreground max-w-[600px] text-lg">
						Gagal memuat produk unggulan. Silakan coba lagi nanti.
					</p>
					<div className="w-24 h-1 bg-primary rounded-full mt-2"></div>
				</div>
			</section>
		)
	}

	return (
		<section
			className="space-y-8 py-10"
			aria-labelledby="featured-products-heading"
		>
			<div className="flex flex-col items-center text-center space-y-3 gap-2">
				<h2
					id="featured-products-heading"
					className="text-3xl font-bold tracking-tight text-primary"
				>
					Produk Unggulan
				</h2>
				<p className="text-muted-foreground max-w-[600px] text-lg">
					Koleksi item populer yang dipilih khusus untuk Anda
				</p>
				<div className="w-24 h-1 bg-primary rounded-full mt-2"></div>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
				{products?.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>
		</section>
	)
}

interface ProductCardProps {
	product: Product
}

function ProductCard({ product }: ProductCardProps) {
	const { addToCart } = useCart()
	const [showConfirmation, setShowConfirmation] = useState(false)
	const phoneNumber = "628175753345"
	const router = useRouter()

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault()

		if (
			(product.sizes && product.sizes.length > 0) ||
			(product.colors && product.colors.length > 0)
		) {
			router.push(`/products/${product.slug || product.id}`)
			return
		}

		addToCart({
			...product,
			quantity: 1,
		})

		setShowConfirmation(true)
	}

	const handleWhatsAppInquiry = () => {
		const productUrl = `${window.location.origin}/products/${
			product.slug || product.id
		}`
		const message = `Halo, saya tertarik dengan produk:\n\n*${
			product.name
		}*\nHarga: ${formatCurrency(
			product.price,
		)}\n\nApakah produk ini masih tersedia?`

		const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
			message,
		)}`
		window.open(whatsappUrl, "_blank")
	}

	return (
		<>
			<Card className="overflow-hidden group h-full flex flex-col gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
				<Link
					href={`/products/${product.slug || product.id}`}
					className="block flex-1"
				>
					<div className="relative aspect-square overflow-hidden">
						<Image
							src={product.image || "/placeholder.svg"}
							alt={product.name}
							fill
							sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
							className="object-cover transition-transform group-hover:scale-110 duration-500"
						/>
						{product.isNew && (
							<Badge
								className="absolute top-3 right-3 px-3 py-1 text-sm font-medium"
								variant="secondary"
							>
								Baru
							</Badge>
						)}
					</div>
					<CardContent className="p-5">
						<div className="text-sm text-muted-foreground mb-1 uppercase">
							{product.category === "men"
								? "Pria"
								: product.category === "women"
								? "Wanita"
								: product.category === "accessories"
								? "Aksesoris"
								: "Unisex"}
						</div>
						<h3 className="font-medium text-lg line-clamp-2 min-h-[56px] group-hover:text-primary transition-colors">
							{product.name}
						</h3>
						<p className="font-bold mt-2 text-lg">
							{formatCurrency(product.price)}
						</p>
					</CardContent>
				</Link>
				<CardFooter className="p-5 pt-0 flex gap-2">
					<Button
						className="flex-1 bg-primary hover:bg-primary/90 transition-colors"
						size="sm"
						onClick={handleAddToCart}
						aria-label={`Tambahkan ${product.name} ke keranjang`}
					>
						<ShoppingCart className="h-4 w-4 mr-2" />
						Beli
					</Button>

					<Button
						className="flex-1 bg-green-600 hover:bg-green-700 transition-colors"
						size="sm"
						onClick={handleWhatsAppInquiry}
						aria-label={`Tanya via WhatsApp tentang ${product.name}`}
					>
						<Send className="h-4 w-4 mr-2" />
						WhatsApp
					</Button>
				</CardFooter>
			</Card>

			<AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Produk Ditambahkan ke Keranjang</AlertDialogTitle>
						<AlertDialogDescription>
							<strong>{product.name}</strong> telah ditambahkan ke keranjang
							belanja Anda. Apa yang ingin Anda lakukan selanjutnya?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setShowConfirmation(false)}>
							Lanjut Belanja
						</AlertDialogCancel>
						<AlertDialogAction asChild>
							<Link href="/cart">
								<Button>Lihat Keranjang</Button>
							</Link>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
