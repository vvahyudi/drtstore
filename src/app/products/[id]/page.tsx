"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import Image from "next/image"
import Link from "next/link"
import {
	ChevronRight,
	Minus,
	Plus,
	Send,
	ArrowLeft,
	Star,
	Truck,
	Shield,
	RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { SimpleWhatsAppButton } from "@/components/whatsapp-button"
import { Card, CardContent } from "@/components/ui/card"
import { Product } from "@/types/api"

// Mock product data - in a real app, you would fetch this from an API
const products: Product[] = [
	{
		id: 1,
		name: "Kaca Mata Stylish Rimless",
		price: 39999,
		image: "/kacamata.jpg?height=400&width=300",
		category: "unisex",
		isNew: true,
		description:
			"Kacamata stylish dengan desain rimless yang elegan dan modern. Cocok untuk semua bentuk wajah, ringan, dan nyaman dipakai sepanjang hari. Lensa melindungi dari sinar blue light dan UV, menjadikannya pilihan ideal untuk pengguna gadget dan aktivitas outdoor.",
		details: {
			material: "Metal",
			fit: "Regular",
			care: "Bersihkan dengan kain microfiber",
			origin: "Imported",
		},
		sizes: [],
		colors: ["Black", "Silver", "Gold"],
		images: ["/kacamata.jpg", "/kacamata.jpg", "/kacamata.jpg"],
	},
	{
		id: 2,
		name: "Case iPhone Transparan - Lindungi iPhone Anda dengan Gaya!",
		price: 19999,
		image: "/iphone-case.jpg?height=400&width=300",
		category: "accessories",
		isNew: false,
		description:
			"Case iPhone transparan dengan perlindungan premium. Dibuat dari material berkualitas tinggi yang tahan benturan namun tetap tipis dan ringan. Desainnya yang transparan memungkinkan keindahan desain iPhone Anda tetap terlihat, sementara sudut yang diperkuat memberikan perlindungan ekstra terhadap jatuh.",
		details: {
			material: "TPU",
			fit: "Custom",
			care: "Bersihkan dengan kain lembut",
			origin: "Local",
		},
		sizes: [],
		colors: ["Clear", "Black", "Blue"],
		images: ["/iphone-case.jpg", "/iphone-case.jpg", "/iphone-case.jpg"],
	},
	{
		id: 3,
		name: "Sandal Jepit Flipper Classic - Gaya Kasual, Harga Spesial!",
		price: 19999,
		image: "/sendal.jpg?height=400&width=300",
		category: "unisex",
		isNew: true,
		description:
			"Sandal jepit klasik dengan kenyamanan maksimal. Sol yang empuk memberikan dukungan pada kaki saat berjalan, sementara tali yang kuat dan fleksibel mencegah lecet. Ideal untuk santai di rumah, ke pantai, atau untuk penggunaan sehari-hari.",
		details: {
			material: "Rubber",
			fit: "Regular",
			care: "Cuci dengan air dan sabun ringan",
			origin: "Local",
		},
		sizes: ["36", "37", "38", "39", "40", "41", "42"],
		colors: ["Black", "Blue", "Red"],
		images: ["/sendal.jpg", "/sendal.jpg", "/sendal.jpg"],
	},
	{
		id: 4,
		name: "Jam Tangan Alba Quartz - Koleksi Terbaru, Gaya Elegan, Harga Spesial!",
		price: 59999,
		image: "/jamtangan.jpg?height=400&width=300",
		category: "men",
		isNew: false,
		description:
			"Jam tangan quartz dengan desain elegan dan tahan air. Tali stainless steel yang kokoh dan nyaman dipakai sepanjang hari. Dilengkapi dengan fitur tanggal dan water resistant hingga 30 meter. Mesin quartz Jepang yang presisi menjamin akurasi waktu yang tepat.",
		details: {
			material: "Stainless Steel",
			fit: "Regular",
			care: "Hindari terkena air panas dan bahan kimia keras",
			origin: "Japan",
		},
		sizes: [],
		colors: ["Silver", "Gold", "Black"],
		images: ["/jamtangan.jpg", "/jamtangan.jpg", "/jamtangan.jpg"],
	},
]

// Format price to IDR
const formatPrice = (price: number) => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

export default function ProductPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const resolvedParams = use(params)
	const productId = Number.parseInt(resolvedParams.id)
	const product = products.find((p) => p.id === productId)

	const [quantity, setQuantity] = useState(1)
	const [selectedSize, setSelectedSize] = useState("")
	const [selectedColor, setSelectedColor] = useState("")
	const [selectedImage, setSelectedImage] = useState(0)

	// Select the first color and size by default
	useEffect(() => {
		if (product) {
			if (product.colors.length > 0 && !selectedColor) {
				setSelectedColor(product.colors[0])
			}
			if (product.sizes.length > 0 && !selectedSize) {
				setSelectedSize(product.sizes[0])
			}
		}
	}, [product, selectedColor, selectedSize])

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

	// Create the WhatsApp message for direct purchase
	const createWhatsAppMessage = () => {
		const needsSize = product.sizes.length > 0
		const needsColor = product.colors.length > 0

		if ((needsSize && !selectedSize) || (needsColor && !selectedColor)) {
			return ""
		}

		let message = `Halo, saya tertarik untuk membeli produk:\n\n*${
			product.name
		}*\nHarga: ${formatPrice(product.price)}\nJumlah: ${quantity}\n`

		if (needsSize) {
			message += `Ukuran: ${selectedSize}\n`
		}

		if (needsColor) {
			message += `Warna: ${selectedColor}\n`
		}

		message += `\nMohon informasi selanjutnya untuk proses pembelian. Terima kasih!`

		return message
	}

	return (
		<div className="container px-4 py-6 lg:py-12 mx-auto">
			{/* Breadcrumb navigation */}
			<div className="flex items-center gap-1 text-sm text-muted-foreground mb-4 md:mb-8">
				<Link href="/" className="hover:text-foreground">
					Home
				</Link>
				<ChevronRight className="h-4 w-4" />
				<Link href="/products" className="hover:text-foreground">
					Products
				</Link>
				<ChevronRight className="h-4 w-4" />
				<span className="text-foreground font-medium line-clamp-1">
					{product.name}
				</span>
			</div>

			{/* Back button (mobile) */}
			<div className="flex md:hidden mb-4">
				<Button variant="outline" size="sm" asChild>
					<Link href="/products">
						<ArrowLeft className="h-4 w-4 mr-1" /> Kembali
					</Link>
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
				{/* Product image gallery */}
				<div className="space-y-4">
					<div className="relative aspect-square overflow-hidden rounded-lg border bg-white">
						<Image
							src={product.images[selectedImage] || "/placeholder-wide.png"}
							alt={product.name}
							fill
							className="object-contain p-2"
							priority
						/>
						{product.isNew && (
							<Badge className="absolute top-4 right-4 px-3 py-1 text-sm">
								Baru
							</Badge>
						)}
					</div>

					{/* Thumbnail gallery */}
					<div className="flex gap-3 overflow-auto pb-2 snap-x">
						{product.images.map((image, index) => (
							<button
								key={index}
								className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-md border snap-start ${
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

				{/* Product details */}
				<div className="space-y-6">
					{/* Product info */}
					<div className="space-y-3">
						<div className="flex items-start justify-between gap-2">
							<div>
								<h1 className="text-2xl md:text-3xl font-bold leading-tight">
									{product.name}
								</h1>
								<div className="flex items-center gap-1 mt-2">
									<div className="flex text-yellow-400">
										{[...Array(5)].map((_, i) => (
											<Star key={i} className="h-4 w-4 fill-current" />
										))}
									</div>
									<span className="text-sm text-muted-foreground">
										(24 ulasan)
									</span>
								</div>
							</div>
							<div className="text-right">
								<div className="text-2xl md:text-3xl font-bold text-primary">
									{formatPrice(product.price)}
								</div>
								<div className="text-sm text-green-600 font-medium">
									Stok Tersedia
								</div>
							</div>
						</div>

						<Separator className="my-4" />

						<div className="prose prose-sm max-w-none text-muted-foreground">
							<p>{product.description}</p>
						</div>
					</div>

					{/* Product options */}
					<div className="space-y-6">
						{/* Size selection */}
						{product.sizes.length > 0 && (
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<h3 className="font-medium">Ukuran</h3>
									<Link
										href="#"
										className="text-sm text-primary hover:underline"
									>
										Panduan Ukuran
									</Link>
								</div>
								<div className="flex flex-wrap gap-2">
									{product.sizes.map((size) => (
										<Button
											key={size}
											variant={selectedSize === size ? "default" : "outline"}
											size="sm"
											className="min-w-[60px]"
											onClick={() => setSelectedSize(size)}
										>
											{size}
										</Button>
									))}
								</div>
							</div>
						)}

						{/* Color selection */}
						{product.colors.length > 0 && (
							<div className="space-y-2">
								<h3 className="font-medium">Warna</h3>
								<div className="flex flex-wrap gap-2">
									{product.colors.map((color) => (
										<Button
											key={color}
											variant={selectedColor === color ? "default" : "outline"}
											size="sm"
											className="min-w-[80px]"
											onClick={() => setSelectedColor(color)}
										>
											{color}
										</Button>
									))}
								</div>
							</div>
						)}

						{/* Quantity selection */}
						<div className="space-y-2">
							<h3 className="font-medium">Jumlah</h3>
							<div className="flex items-center">
								<Button
									variant="outline"
									size="icon"
									onClick={() => setQuantity(Math.max(1, quantity - 1))}
									disabled={quantity <= 1}
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

					{/* WhatsApp Purchase Button */}
					<SimpleWhatsAppButton
						phoneNumber={phoneNumber}
						message={createWhatsAppMessage() || ""}
						size="lg"
						variant="default"
						className="w-full text-base h-12 bg-green-600 hover:bg-green-700"
					>
						<Send className="h-5 w-5 mr-2" />
						Beli via WhatsApp
					</SimpleWhatsAppButton>

					{/* Benefits section */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Truck className="h-5 w-5 flex-shrink-0 text-primary" />
							<span>Pengiriman Cepat</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Shield className="h-5 w-5 flex-shrink-0 text-primary" />
							<span>Garansi Produk</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<RefreshCw className="h-5 w-5 flex-shrink-0 text-primary" />
							<span>30 Hari Pengembalian</span>
						</div>
					</div>
				</div>
			</div>

			{/* Product details tabs */}
			<div className="mt-12">
				<Tabs defaultValue="details" className="w-full">
					<TabsList className="w-full max-w-md mx-auto grid grid-cols-3">
						<TabsTrigger value="details">Detail Produk</TabsTrigger>
						<TabsTrigger value="shipping">Pengiriman</TabsTrigger>
						<TabsTrigger value="reviews">Ulasan</TabsTrigger>
					</TabsList>
					<div className="mt-6 border rounded-lg p-6">
						<TabsContent value="details" className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<h4 className="font-medium">Material</h4>
									<p className="text-sm text-muted-foreground mt-1">
										{product.details.material}
									</p>
								</div>
								<div>
									<h4 className="font-medium">Fit</h4>
									<p className="text-sm text-muted-foreground mt-1">
										{product.details.fit}
									</p>
								</div>
								<div>
									<h4 className="font-medium">Perawatan</h4>
									<p className="text-sm text-muted-foreground mt-1">
										{product.details.care}
									</p>
								</div>
								<div>
									<h4 className="font-medium">Asal Produk</h4>
									<p className="text-sm text-muted-foreground mt-1">
										{product.details.origin}
									</p>
								</div>
							</div>

							<Separator />

							<div>
								<h4 className="font-medium mb-2">Deskripsi</h4>
								<p className="text-sm text-muted-foreground">
									{product.description}
								</p>
							</div>
						</TabsContent>

						<TabsContent value="shipping">
							<div className="space-y-6">
								<div>
									<h4 className="font-medium">Informasi Pengiriman</h4>
									<ul className="mt-2 space-y-2 text-sm text-muted-foreground">
										<li className="flex items-start gap-2">
											<span className="font-medium min-w-[120px]">
												Pengiriman Reguler:
											</span>
											<span>
												Estimasi 2-5 hari kerja (Jabodetabek 1-2 hari)
											</span>
										</li>
										<li className="flex items-start gap-2">
											<span className="font-medium min-w-[120px]">
												Pengiriman Express:
											</span>
											<span>Estimasi 1-2 hari kerja (tergantung wilayah)</span>
										</li>
										<li className="flex items-start gap-2">
											<span className="font-medium min-w-[120px]">
												Ongkos Kirim:
											</span>
											<span>
												Bervariasi berdasarkan alamat pengiriman dan kurir yang
												dipilih
											</span>
										</li>
										<li className="flex items-start gap-2">
											<span className="font-medium min-w-[120px]">Kurir:</span>
											<span>
												JNE, J&T, SiCepat, AnterAja, GoSend (khusus area
												tertentu)
											</span>
										</li>
									</ul>
								</div>

								<Separator />

								<div>
									<h4 className="font-medium">Kebijakan Pengembalian</h4>
									<ul className="mt-2 space-y-2 text-sm text-muted-foreground">
										<li className="flex items-start gap-2">
											<span className="font-medium min-w-[120px]">
												Periode:
											</span>
											<span>30 hari sejak barang diterima</span>
										</li>
										<li className="flex items-start gap-2">
											<span className="font-medium min-w-[120px]">
												Kondisi:
											</span>
											<span>
												Produk belum digunakan, dalam kondisi asli, dengan label
												dan kemasan lengkap
											</span>
										</li>
										<li className="flex items-start gap-2">
											<span className="font-medium min-w-[120px]">
												Pengembalian Dana:
											</span>
											<span>
												Diproses dalam 7 hari kerja setelah barang diterima dan
												diverifikasi
											</span>
										</li>
										<li className="flex items-start gap-2">
											<span className="font-medium min-w-[120px]">
												Biaya Pengembalian:
											</span>
											<span>
												Ditanggung pembeli, kecuali untuk produk cacat atau
												kesalahan pengiriman
											</span>
										</li>
									</ul>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="reviews">
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<div>
										<h4 className="font-medium">Ulasan Pelanggan</h4>
										<div className="flex items-center gap-2 mt-1">
											<div className="flex text-yellow-400">
												{[...Array(5)].map((_, i) => (
													<Star key={i} className="h-4 w-4 fill-current" />
												))}
											</div>
											<span className="text-sm text-muted-foreground">
												4.8 dari 5 (24 ulasan)
											</span>
										</div>
									</div>
									<Button variant="outline" size="sm">
										Tulis Ulasan
									</Button>
								</div>

								<Separator />

								{/* Sample reviews */}
								<div className="space-y-6">
									{[
										{
											name: "Budi Santoso",
											date: "12 Mar 2025",
											rating: 5,
											review:
												"Produk sangat bagus dan sesuai dengan ekspektasi. Pengiriman juga cepat. Sangat puas dengan pembelian ini!",
										},
										{
											name: "Siti Rahayu",
											date: "5 Mar 2025",
											rating: 4,
											review:
												"Barang bagus sesuai dengan deskripsi. Pengiriman agak lambat tapi masih dalam estimasi yang dijanjikan.",
										},
										{
											name: "Ahmad Hidayat",
											date: "28 Feb 2025",
											rating: 5,
											review:
												"Saya sangat suka dengan produk ini. Kualitasnya premium dan sangat worth it dengan harganya. Recommended!",
										},
									].map((review, index) => (
										<div key={index} className="space-y-2">
											<div className="flex justify-between items-start">
												<div>
													<h5 className="font-medium">{review.name}</h5>
													<div className="flex text-yellow-400 mt-1">
														{[...Array(5)].map((_, i) => (
															<Star
																key={i}
																className={`h-3.5 w-3.5 ${
																	i < review.rating
																		? "fill-current"
																		: "stroke-current fill-none"
																}`}
															/>
														))}
													</div>
												</div>
												<div className="text-sm text-muted-foreground">
													{review.date}
												</div>
											</div>
											<p className="text-sm">{review.review}</p>
										</div>
									))}
								</div>

								<div className="flex justify-center mt-4">
									<Button variant="outline" size="sm">
										Lihat Semua Ulasan
									</Button>
								</div>
							</div>
						</TabsContent>
					</div>
				</Tabs>
			</div>

			{/* Related products section */}
			<section className="mt-16">
				<h2 className="text-2xl font-bold">Produk Serupa</h2>
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
					{products
						.filter(
							(p) => p.id !== product.id && p.category === product.category,
						)
						.slice(0, 4)
						.map((relatedProduct) => (
							<Card key={relatedProduct.id} className="overflow-hidden h-full">
								<Link href={`/products/${relatedProduct.id}`}>
									<div className="relative aspect-square">
										<Image
											src={relatedProduct.image || "/placeholder.svg"}
											alt={relatedProduct.name}
											fill
											className="object-cover transition-transform hover:scale-105"
										/>
									</div>
									<CardContent className="p-4">
										<h3 className="font-medium line-clamp-2 min-h-[48px] text-sm">
											{relatedProduct.name}
										</h3>
										<p className="font-bold mt-2">
											{formatPrice(relatedProduct.price)}
										</p>
									</CardContent>
								</Link>
							</Card>
						))}
				</div>
			</section>
		</div>
	)
}
