"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Minus, Plus, Send, Home, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/components/cart-provider"
import { SimpleWhatsAppButton } from "@/components/whatsapp-button"
import { formatCurrency } from "@/lib/utils"
import { useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { useProductBySlug } from "@/hooks/use-products"

export default function ProductPage() {
	// Get slug from URL
	const params = useParams<{ slug: string }>()
	const slug = params.slug as string

	const [quantity, setQuantity] = useState(1)
	const [selectedSize, setSelectedSize] = useState("")
	const [selectedColor, setSelectedColor] = useState("")
	const [selectedImage, setSelectedImage] = useState(0)

	const { addToCart } = useCart()
	const phoneNumber = "628175753345" // Your WhatsApp number

	// Fetch product details using React Query
	const { data: product, isLoading, isError } = useProductBySlug(slug)

	// Set default selected size/color when product data loads
	React.useEffect(() => {
		if (product) {
			if (product.sizes && product.sizes.length > 0) {
				setSelectedSize(product.sizes[0])
			}

			if (product.colors && product.colors.length > 0) {
				setSelectedColor(product.colors[0])
			}
		}
	}, [product])

	// Handler for adding to cart
	const handleAddToCart = () => {
		if (!product) return

		// Validate size and color selection if needed
		if (product.sizes.length > 0 && !selectedSize) {
			alert("Please select a size")
			return
		}

		if (product.colors.length > 0 && !selectedColor) {
			alert("Please select a color")
			return
		}

		addToCart({
			...product,
			quantity,
			selectedSize,
			selectedColor,
		})

		alert("Added to cart!")
	}

	// Create the WhatsApp message for direct purchase
	const createWhatsAppMessage = () => {
		if (!product) return ""

		// Validate size and color selection if needed
		if (product.sizes.length > 0 && !selectedSize) {
			alert("Please select a size")
			return ""
		}

		if (product.colors.length > 0 && !selectedColor) {
			alert("Please select a color")
			return ""
		}

		const formattedPrice = formatCurrency(product.price)

		let message = `Halo, saya tertarik untuk membeli produk:\n\n*${product.name}*\nHarga: ${formattedPrice}\nJumlah: ${quantity}\n`

		if (selectedSize) {
			message += `Ukuran: ${selectedSize}\n`
		}

		if (selectedColor) {
			message += `Warna: ${selectedColor}\n`
		}

		message +=
			"\nMohon informasi selanjutnya untuk proses pembelian. Terima kasih!"

		return message
	}

	// Loading state
	if (isLoading) {
		return (
			<div className="container px-4 py-12 mx-auto">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
					<div className="space-y-4">
						<Skeleton className="h-[500px] w-full rounded-lg" />
						<div className="flex gap-4">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-20 w-20 rounded-md" />
							))}
						</div>
					</div>
					<div className="space-y-6">
						<Skeleton className="h-12 w-3/4" />
						<Skeleton className="h-8 w-1/4" />
						<Skeleton className="h-24 w-full" />
						<div className="space-y-4">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</div>
					</div>
				</div>
			</div>
		)
	}

	// Error state
	if (isError || !product) {
		return (
			<div className="container px-4 py-12 mx-auto text-center">
				<h1 className="text-2xl font-bold">Product not found</h1>
				<p className="mt-4">The product you are looking for does not exist.</p>
				<Button asChild className="mt-6">
					<Link href="/products">Back to Products</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="container px-4 py-12 mx-auto">
			<div className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
				<Link href="/" className="hover:text-foreground">
					<Home className="h-4 w-4" />
				</Link>
				<ChevronRight className="h-4 w-4" />
				<Link href="/products" className="hover:text-foreground">
					Products
				</Link>
				<ChevronRight className="h-4 w-4" />
				<span className="text-foreground">{product.name}</span>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-12">
				<div className="space-y-4">
					<div className="relative aspect-square overflow-hidden rounded-lg border">
						<Image
							src={product.images[selectedImage] || "/placeholder.svg"}
							alt={product.name}
							fill
							className="object-cover"
							priority
						/>
						{product.isNew && (
							<Badge className="absolute top-4 right-4">New</Badge>
						)}
					</div>

					{product.images.length > 1 && (
						<div className="flex gap-4 overflow-x-auto pb-2">
							{product.images.map((image, index) => (
								<button
									key={index}
									className={`relative aspect-square w-20 overflow-hidden rounded-md border ${
										selectedImage === index ? "ring-2 ring-primary" : ""
									}`}
									onClick={() => setSelectedImage(index)}
								>
									<Image
										src={image || "/placeholder.svg"}
										alt={`${product.name} - Image ${index + 1}`}
										fill
										className="object-cover"
									/>
								</button>
							))}
						</div>
					)}
				</div>

				<div className="space-y-6">
					<div>
						<h1 className="text-3xl font-bold">{product.name}</h1>
						<p className="text-2xl font-bold mt-2">
							{formatCurrency(product.price)}
						</p>
					</div>

					<p className="text-muted-foreground">{product.description}</p>

					<div className="space-y-4">
						{product.sizes.length > 0 && (
							<div>
								<h3 className="font-medium mb-2">Size</h3>
								<div className="flex flex-wrap gap-2">
									{product.sizes.map((size) => (
										<Button
											key={size}
											variant={selectedSize === size ? "default" : "outline"}
											className="min-w-[60px]"
											onClick={() => setSelectedSize(size)}
										>
											{size}
										</Button>
									))}
								</div>
								{!selectedSize && (
									<p className="text-sm text-muted-foreground mt-2">
										Please select a size
									</p>
								)}
							</div>
						)}

						{product.colors.length > 0 && (
							<div>
								<h3 className="font-medium mb-2">Color</h3>
								<div className="flex flex-wrap gap-2">
									{product.colors.map((color) => (
										<Button
											key={color}
											variant={selectedColor === color ? "default" : "outline"}
											className="min-w-[80px]"
											onClick={() => setSelectedColor(color)}
										>
											{color}
										</Button>
									))}
								</div>
								{!selectedColor && (
									<p className="text-sm text-muted-foreground mt-2">
										Please select a color
									</p>
								)}
							</div>
						)}

						<div>
							<h3 className="font-medium mb-2">Quantity</h3>
							<div className="flex items-center">
								<Button
									variant="outline"
									size="icon"
									onClick={() => setQuantity(Math.max(1, quantity - 1))}
								>
									<Minus className="h-4 w-4" />
								</Button>
								<span className="w-12 text-center">{quantity}</span>
								<Button
									variant="outline"
									size="icon"
									onClick={() => setQuantity(quantity + 1)}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-4">
						<Button onClick={handleAddToCart} className="flex-1" size="lg">
							Add to Cart
						</Button>

						<SimpleWhatsAppButton
							phoneNumber={phoneNumber}
							message={createWhatsAppMessage()}
							size="lg"
							variant="default"
							className="flex-1 bg-green-600 hover:bg-green-700"
						>
							<Send className="h-5 w-5 mr-2" />
							Buy via WhatsApp
						</SimpleWhatsAppButton>
					</div>

					<Tabs defaultValue="details">
						<TabsList className="w-full">
							<TabsTrigger value="details" className="flex-1">
								Details
							</TabsTrigger>
							<TabsTrigger value="shipping" className="flex-1">
								Shipping & Returns
							</TabsTrigger>
						</TabsList>
						<TabsContent value="details" className="space-y-4 pt-4">
							<div className="grid grid-cols-2 gap-4">
								{product.details.material && (
									<div>
										<h4 className="font-medium">Material</h4>
										<p className="text-sm text-muted-foreground">
											{product.details.material}
										</p>
									</div>
								)}
								{product.details.fit && (
									<div>
										<h4 className="font-medium">Fit</h4>
										<p className="text-sm text-muted-foreground">
											{product.details.fit}
										</p>
									</div>
								)}
								{product.details.care && (
									<div>
										<h4 className="font-medium">Care</h4>
										<p className="text-sm text-muted-foreground">
											{product.details.care}
										</p>
									</div>
								)}
								{product.details.origin && (
									<div>
										<h4 className="font-medium">Origin</h4>
										<p className="text-sm text-muted-foreground">
											{product.details.origin}
										</p>
									</div>
								)}
							</div>
						</TabsContent>
						<TabsContent value="shipping" className="space-y-4 pt-4">
							<div>
								<h4 className="font-medium">Shipping</h4>
								<p className="text-sm text-muted-foreground">
									Free standard shipping on all orders over Rp 200.000. Delivery
									within 3-5 business days.
								</p>
							</div>
							<div>
								<h4 className="font-medium">Returns</h4>
								<p className="text-sm text-muted-foreground">
									We accept returns within 7 days of delivery. Items must be
									unworn, unwashed, and with the original tags attached.
								</p>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	)
}
