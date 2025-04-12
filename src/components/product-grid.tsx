"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Send } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { Product } from "@/types/api"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
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

export function ProductGrid({ products }: { products: Product[] }) {
	if (!products || products.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-muted-foreground">No products found</p>
			</div>
		)
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
			{products.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</div>
	)
}

function ProductCard({ product }: { product: Product }) {
	const { addToCart } = useCart()
	const [showConfirmation, setShowConfirmation] = useState(false)
	const router = useRouter()
	const phoneNumber = "628175753345"

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault()

		// If the product has options, navigate to the product page
		if (
			(product.sizes && product.sizes.length > 0) ||
			(product.colors && product.colors.length > 0)
		) {
			router.push(`/products/${product.slug || product.id}`)
			return
		}

		// Otherwise add directly to cart
		addToCart({
			...product,
			quantity: 1,
		})

		setShowConfirmation(true)
	}

	const handleWhatsAppInquiry = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

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
			<Card className="overflow-hidden group h-full flex flex-col">
				<Link
					href={`/products/${product.slug || product.id}`}
					className="flex-1 flex flex-col"
				>
					<div className="relative aspect-square overflow-hidden">
						<Image
							src={product.image || "/placeholder.svg"}
							alt={product.name}
							fill
							sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
							className="object-cover transition-transform group-hover:scale-105 duration-300"
						/>
						{product.isNew && (
							<Badge className="absolute top-2 right-2">Baru</Badge>
						)}
					</div>
					<CardContent className="p-4 flex-grow">
						<div className="text-sm text-muted-foreground mb-1 uppercase">
							{product.category === "men"
								? "Pria"
								: product.category === "women"
								? "Wanita"
								: product.category === "accessories"
								? "Aksesoris"
								: product.category}
						</div>
						<h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
							{product.name}
						</h3>
						<p className="font-bold mt-1">{formatCurrency(product.price)}</p>
					</CardContent>
				</Link>
				<CardFooter className="p-4 pt-0 flex gap-2">
					<Button
						className="flex-1 bg-primary hover:bg-primary/90"
						size="sm"
						onClick={handleAddToCart}
					>
						<ShoppingCart className="h-4 w-4 mr-2" />
						Beli
					</Button>
					<Button
						className="flex-1 bg-green-600 hover:bg-green-700"
						size="sm"
						onClick={handleWhatsAppInquiry}
					>
						<Send className="h-4 w-4 mr-2" />
						WhatsApp
					</Button>
				</CardFooter>
			</Card>

			{/* Confirmation Dialog */}
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
						<AlertDialogCancel>Lanjut Belanja</AlertDialogCancel>
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
