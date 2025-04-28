import { ProductGrid } from "@/components/product-grid"
import { productApiService } from "@/services/product-service"
import { Suspense } from "react"

// This component loads products server-side using React Server Components
async function ProductsContent() {
	// Fetch products from the API with a 60-second revalidation period
	const products = await productApiService.getAllProducts()

	return (
		<>
			<div className="flex flex-col items-center text-center space-y-2 mb-12">
				<h1 className="text-3xl font-bold tracking-tight">All Products</h1>
				<p className="text-muted-foreground max-w-[600px]">
					Browse our complete collection of premium products
				</p>
			</div>

			{products.length > 0 ? (
				<ProductGrid products={products} />
			) : (
				<div className="text-center py-12">
					<p className="text-muted-foreground">No products found</p>
				</div>
			)}
		</>
	)
}

export default function ProductsPage() {
	return (
		<div className="container px-4 py-12 mx-auto">
			<Suspense
				fallback={<div className="text-center py-12">Loading products...</div>}
			>
				<ProductsContent />
			</Suspense>
		</div>
	)
}
