"use client"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Send } from "lucide-react"
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
import { Product } from "@/types/api"

interface ProductCardProps {
	product: Product
	phoneNumber?: string
	showWhatsAppButton?: boolean
}

export function ProductCard({
	product,
	phoneNumber = "628175753345",
	showWhatsAppButton = true,
}: ProductCardProps) {
	const [showConfirmation, setShowConfirmation] = useState(false)
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
	const router = useRouter()

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price)
	}

	const handleWhatsAppInquiry = (e: React.MouseEvent) => {
		e.preventDefault()

		const productUrl = `${baseUrl}/products/${product.id}`
		const message = `Halo, saya tertarik dengan produk:\n\n*${
			product.name
		}*\nHarga: ${formatPrice(
			product.price,
		)}\n\nLink produk: ${productUrl}\n\nApakah produk ini masih tersedia?`

		const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
			message,
		)}`
		window.open(whatsappUrl, "_blank")
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
				{showWhatsAppButton && (
					<CardFooter className="p-5 pt-0">
						<Button
							className="w-full bg-green-600 hover:bg-green-700 transition-colors"
							size="sm"
							onClick={handleWhatsAppInquiry}
							aria-label={`Tanya via WhatsApp tentang ${product.name}`}
						>
							<Send className="h-4 w-4 mr-2" />
							Tanya via WhatsApp
						</Button>
					</CardFooter>
				)}
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
