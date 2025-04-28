import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductList } from "./product-list"
import { ProductForm } from "./product-form"
import { CategoryManagement } from "./category-management"
import { Button } from "@/components/ui/button"
import { Plus, BarChart } from "lucide-react"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	useProducts,
	useProductCategories,
	useCreateProduct,
	useUpdateProduct,
	useDeleteProduct,
} from "@/hooks/use-products"
import { ProductFormValues } from "@/schemas/product-schema"
import { Product } from "@/types/api"
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
import { formatCurrency } from "@/lib/utils"

export function ProductDashboard() {
	// State
	const [activeTab, setActiveTab] = useState("list")
	const [isFormOpen, setIsFormOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

	// Queries
	const { data: productsData, isLoading } = useProducts()
	const { data: categories = [] } = useProductCategories()

	// Mutations
	const { mutateAsync: createProduct, isPending: isCreating } =
		useCreateProduct()
	const { mutateAsync: updateProduct, isPending: isUpdating } =
		useUpdateProduct()
	const { mutateAsync: deleteProduct, isPending: isDeleting } =
		useDeleteProduct()

	// Derived data
	const totalProducts = productsData?.products?.length || 0
	const totalValue =
		productsData?.products?.reduce(
			(sum: number, product: Product) =>
				sum + product.price * (product.stock || 0),
			0,
		) || 0
	const outOfStockCount =
		productsData?.products?.filter(
			(product: Product) => (product.stock || 0) <= 0,
		).length || 0

	// Handlers
	const handleAddProduct = () => {
		setSelectedProduct(null)
		setIsFormOpen(true)
	}

	const handleEditProduct = (product: Product) => {
		setSelectedProduct(product)
		setIsFormOpen(true)
	}

	const handleViewProduct = (product: Product) => {
		window.open(`/products/${product.slug || product.id}`, "_blank")
	}

	const handleDeleteClick = (product: Product) => {
		setSelectedProduct(product)
		setIsDeleteDialogOpen(true)
	}

	const confirmDelete = async () => {
		if (!selectedProduct) return
		try {
			await deleteProduct(selectedProduct.id)
			setIsDeleteDialogOpen(false)
		} finally {
			setSelectedProduct(null)
		}
	}

	const handleFormSubmit = async (data: ProductFormValues) => {
		try {
			if (selectedProduct) {
				await updateProduct({ id: selectedProduct.id, data })
			} else {
				await createProduct(data)
			}
			setIsFormOpen(false)
		} catch (error) {
			console.error("Error submitting product:", error)
		}
	}

	return (
		<div className="space-y-8">
			<div className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Product Management</h1>
				<Button onClick={handleAddProduct}>
					<Plus className="mr-2 h-4 w-4" />
					Add Product
				</Button>
			</div>

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Products
						</CardTitle>
						<div className="h-4 w-4 text-muted-foreground">
							<BarChart className="h-4 w-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalProducts}</div>
						<p className="text-xs text-muted-foreground">
							{isLoading ? "Loading..." : "All active products"}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Inventory Value
						</CardTitle>
						<div className="h-4 w-4 text-muted-foreground">
							<BarChart className="h-4 w-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(totalValue)}
						</div>
						<p className="text-xs text-muted-foreground">
							{isLoading ? "Loading..." : "Based on current stock"}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
						<div className="h-4 w-4 text-muted-foreground">
							<BarChart className="h-4 w-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{outOfStockCount}</div>
						<p className="text-xs text-muted-foreground">
							{isLoading ? "Loading..." : "Products requiring restock"}
						</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="mb-6">
					<TabsTrigger value="list">Products List</TabsTrigger>
					<TabsTrigger value="categories">Categories</TabsTrigger>
				</TabsList>
				<TabsContent value="list">
					<ProductList
						products={productsData?.products || []}
						isLoading={isLoading}
						onAdd={handleAddProduct}
						onEdit={handleEditProduct}
						onView={handleViewProduct}
						onDelete={handleDeleteClick}
					/>
				</TabsContent>
				<TabsContent value="categories">
					<CategoryManagement categories={categories} isLoading={isLoading} />
				</TabsContent>
			</Tabs>

			{/* Product Form Dialog */}
			<ProductForm
				product={selectedProduct || undefined}
				isOpen={isFormOpen}
				onClose={() => setIsFormOpen(false)}
				onSubmit={handleFormSubmit}
				isSubmitting={isCreating || isUpdating}
				title={selectedProduct ? "Edit Product" : "Add New Product"}
				categories={categories}
			/>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete the product &quot;
							{selectedProduct?.name}&quot;. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault() // Prevent the dialog from closing automatically
								confirmDelete()
							}}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
