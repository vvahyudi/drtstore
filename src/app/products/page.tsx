import { ProductGrid } from "@/components/product-grid"

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

export default function ProductsPage() {
	return (
		<div className="container px-4 py-12 mx-auto">
			<div className="flex flex-col items-center text-center space-y-2 mb-12">
				<h1 className="text-3xl font-bold tracking-tight">All Products</h1>
				<p className="text-muted-foreground max-w-[600px]">
					Browse our complete collection of premium clothing
				</p>
			</div>
			<ProductGrid products={products} />
		</div>
	)
}
