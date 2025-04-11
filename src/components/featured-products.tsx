"use client"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useRouter } from "next/navigation"
import { useState } from "react"
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

interface Product {
	id: number
	name: string
	price: number
	image: string
	category: string
	isNew: boolean
}

const products: Product[] = [
	{
		id: 1,
		name: "Kaca Mata Stylish Rimless",
		price: 39999,
		image: "/kacamata.jpg?height=400&width=300",
		category: "unisex",
		isNew: true,
	},
	{
		id: 2,
		name: "Case iPhone Transparan - Lindungi iPhone Anda dengan Gaya!",
		price: 19999,
		image: "/iphone-case.jpg?height=400&width=300",
		category: "accessories",
		isNew: false,
	},
	{
		id: 3,
		name: "Sandal Jepit Flipper Classic - Gaya Kasual, Harga Spesial!",
		price: 19999,
		image: "/sendal.jpg?height=400&width=300",
		category: "unisex",
		isNew: true,
	},
	{
		id: 4,
		name: "Jam Tangan Alba Quartz - Koleksi Terbaru, Gaya Elegan, Harga Spesial!",
		price: 59999,
		image: "/jamtangan.jpg?height=400&width=300",
		category: "men",
		isNew: false,
	},
]

export function FeaturedProducts() {
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
				{products.map((product) => (
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
	// const router = useRouter()
	const [showConfirmation, setShowConfirmation] = useState(false)
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price)
	}

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault()
		addToCart(product)
		setShowConfirmation(true)
	}

	const handleConfirm = () => {
		const productUrl = `${baseUrl}/products/${product.id}`
		const message = `Halo, saya ingin membeli produk:\n\n*${
			product.name
		}*\nHarga: ${formatPrice(
			product.price,
		)}\n\nLink produk: ${productUrl}\n\nApakah produk ini masih tersedia?`
		const encodedMessage = encodeURIComponent(message)
		const phoneNumber = "628175753345" // Ganti dengan nomor WhatsApp Anda

		window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank")
		setShowConfirmation(false)
	}

	const handleCancel = () => {
		setShowConfirmation(false)
	}

	return (
		<>
			<Card className="overflow-hidden group h-full flex flex-col gap-2 shadow-lg hover:shadow-xl transition-all duration-300">
				<Link href={`/products/${product.id}`} className="block flex-1">
					<div className="relative aspect-square overflow-hidden">
						<Image
							src={product.image || "/placeholder.svg"}
							alt={product.name}
							fill
							sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
							className="object-cover transition-transform group-hover:scale-110 duration-500"
							priority={product.id <= 4}
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
							{formatPrice(product.price)}
						</p>
					</CardContent>
				</Link>
				<CardFooter className="p-5 pt-0">
					<Button
						className="w-full bg-primary hover:bg-primary/90 transition-colors"
						size="sm"
						onClick={handleAddToCart}
						aria-label={`Tambahkan ${product.name} ke keranjang`}
					>
						<ShoppingCart className="h-4 w-4 mr-2" />
						Beli Sekarang
					</Button>
				</CardFooter>
			</Card>

			{/* Dialog Konfirmasi */}
			<AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Konfirmasi Pembelian</AlertDialogTitle>
						<AlertDialogDescription>
							Anda akan diarahkan ke WhatsApp untuk menyelesaikan pembelian
							produk:
							<br />
							<strong>{product.name}</strong>
							<br />
							Harga: {formatPrice(product.price)}
							<br />
							Link produk: {baseUrl}/products/{product.id}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={handleCancel}>Batal</AlertDialogCancel>
						<AlertDialogAction onClick={handleConfirm}>
							Lanjut ke WhatsApp
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
