"use client"

import { useState } from "react"
import { use } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Minus, Plus, ShoppingCart, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/components/cart-provider"
import { SimpleWhatsAppButton } from "@/components/whatsapp-button"
import { Product } from "@/types/api" // Import the consistent Product type
// Mock product data - in a real app, you would fetch this from an API
const products: Product[] = [
	{
		id: 1,
		name: "Kaca Mata Stylish Rimless",
		price: 39999,
		image: "/kacamata.jpg?height=400&width=300",
		category: "unisex",
		isNew: true,
		description: "Kacamata stylish dengan desain rimless yang elegan",
		details: {
			material: "Metal",
			fit: "Regular",
			care: "Bersihkan dengan kain microfiber",
			origin: "Imported",
		},
		sizes: [],
		colors: ["Black", "Silver", "Gold"],
		images: ["/kacamata.jpg"],
	},
	{
		id: 2,
		name: "Case iPhone Transparan - Lindungi iPhone Anda dengan Gaya!",
		price: 19999,
		image: "/iphone-case.jpg?height=400&width=300",
		category: "accessories",
		isNew: false,
		description: "Case iPhone transparan dengan perlindungan premium",
		details: {
			material: "TPU",
			fit: "Custom",
			care: "Bersihkan dengan kain lembut",
			origin: "Local",
		},
		sizes: [],
		colors: ["Clear", "Black", "Blue"],
		images: ["/iphone-case.jpg"],
	},
	{
		id: 3,
		name: "Sandal Jepit Flipper Classic - Gaya Kasual, Harga Spesial!",
		price: 19999,
		image: "/sendal.jpg?height=400&width=300",
		category: "unisex",
		isNew: true,
		description: "Sandal jepit klasik dengan kenyamanan maksimal",
		details: {
			material: "Rubber",
			fit: "Regular",
			care: "Cuci dengan air dan sabun ringan",
			origin: "Local",
		},
		sizes: ["36", "37", "38", "39", "40", "41", "42"],
		colors: ["Black", "Blue", "Red"],
		images: ["/sendal.jpg"],
	},
	{
		id: 4,
		name: "Jam Tangan Alba Quartz - Koleksi Terbaru, Gaya Elegan, Harga Spesial!",
		price: 59999,
		image: "/jamtangan.jpg?height=400&width=300",
		category: "men",
		isNew: false,
		description: "Jam tangan quartz dengan desain elegan dan tahan air",
		details: {
			material: "Stainless Steel",
			fit: "Regular",
			care: "Hindari terkena air panas dan bahan kimia keras",
			origin: "Japan",
		},
		sizes: [],
		colors: ["Silver", "Gold", "Black"],
		images: ["/jamtangan.jpg"],
	},
]

export default function ProductPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	// First, let's define proper types at the top of your file
	type Product = {
		id: number
		name: string
		price: number
		image: string
		category: string
		isNew: boolean
		description: string
		details: {
			material: string
			fit: string
			care: string
			origin: string
		}
		sizes: string[]
		colors: string[]
		images: string[]
	}

	type CartItem = Product & {
		quantity: number
		selectedSize: string
		selectedColor: string
	}

	const resolvedParams = use(params)
	const productId = Number.parseInt(resolvedParams.id)
	const product = products.find((p) => p.id === productId)

	const [quantity, setQuantity] = useState(1)
	const [selectedSize, setSelectedSize] = useState("")
	const [selectedColor, setSelectedColor] = useState("")
	const [selectedImage, setSelectedImage] = useState(0)

	const { addToCart } = useCart()
	const phoneNumber = "628175753345" // Your WhatsApp number

	if (!product) {
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

	const handleAddToCart = () => {
		if (!selectedSize || !selectedColor) return

		const cartItem: CartItem = {
			...product,
			quantity,
			selectedSize,
			selectedColor,
		}

		addToCart(cartItem)
	}

	// Create the WhatsApp message for direct purchase
	const createWhatsAppMessage = () => {
		if (!selectedSize || !selectedColor) return

		const formattedPrice = new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(product.price)

		const message = `Halo, saya tertarik untuk membeli produk:\n\n*${product.name}*\nHarga: ${formattedPrice}\nUkuran: ${selectedSize}\nWarna: ${selectedColor}\nJumlah: ${quantity}\n\nMohon informasi selanjutnya untuk proses pembelian. Terima kasih!`

		return message
	}

	return (
		<div className="container px-4 py-12 mx-auto">
			<div className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
				<Link href="/" className="hover:text-foreground">
					Home
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
							src={product.images[selectedImage] || "/placeholder-wide.png"}
							alt={product.name}
							fill
							className="object-cover"
						/>
						{product.isNew && (
							<Badge className="absolute top-4 right-4">New</Badge>
						)}
					</div>

					<div className="flex gap-4">
						{product.images.map((image, index) => (
							<button
								key={index}
								className={`relative aspect-square w-20 overflow-hidden rounded-md border ${
									selectedImage === index ? "ring-2 ring-primary" : ""
								}`}
								onClick={() => setSelectedImage(index)}
							>
								<Image
									src={image || "/placeholder-wide.png"}
									alt={`${product.name} - Image ${index + 1}`}
									fill
									className="object-cover"
								/>
							</button>
						))}
					</div>
				</div>

				<div className="space-y-6">
					<div>
						<h1 className="text-3xl font-bold">{product.name}</h1>
						<p className="text-2xl font-bold mt-2">
							${product.price.toFixed(2)}
						</p>
					</div>

					<p className="text-muted-foreground">{product.description}</p>

					<div className="space-y-4">
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

					<div className="flex flex-col gap-4 sm:flex-row">
						<Button
							size="lg"
							className="flex-1"
							disabled={!selectedSize || !selectedColor}
							onClick={handleAddToCart}
						>
							<ShoppingCart className="h-5 w-5 mr-2" />
							Add to Cart
						</Button>

						<SimpleWhatsAppButton
							phoneNumber={phoneNumber}
							message={createWhatsAppMessage() || ""}
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
								<div>
									<h4 className="font-medium">Material</h4>
									<p className="text-sm text-muted-foreground">
										{product.details.material}
									</p>
								</div>
								<div>
									<h4 className="font-medium">Fit</h4>
									<p className="text-sm text-muted-foreground">
										{product.details.fit}
									</p>
								</div>
								<div>
									<h4 className="font-medium">Care</h4>
									<p className="text-sm text-muted-foreground">
										{product.details.care}
									</p>
								</div>
								<div>
									<h4 className="font-medium">Origin</h4>
									<p className="text-sm text-muted-foreground">
										{product.details.origin}
									</p>
								</div>
							</div>
						</TabsContent>
						<TabsContent value="shipping" className="space-y-4 pt-4">
							<div>
								<h4 className="font-medium">Shipping</h4>
								<p className="text-sm text-muted-foreground">
									Free standard shipping on all orders over $100. Delivery
									within 3-5 business days.
								</p>
							</div>
							<div>
								<h4 className="font-medium">Returns</h4>
								<p className="text-sm text-muted-foreground">
									We accept returns within 30 days of delivery. Items must be
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
