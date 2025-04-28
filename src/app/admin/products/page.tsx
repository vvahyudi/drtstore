"use client"

import { useState } from "react"
import { ProductList } from "@/components/admin/product-list"
import { ProductForm } from "@/components/admin/product-form"
import { Product } from "@/types/api"
import { toast } from "sonner"
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
import { Loader2 } from "lucide-react"
import { useCategories } from "@/hooks/use-categories"
import {
	useCreateProduct,
	useUpdateProduct,
	useDeleteProduct,
} from "@/hooks/use-products"
import { useRouter } from "next/navigation"

export default function ProductsPage() {
	// State for form and dialog
	const [isFormOpen, setIsFormOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

	const router = useRouter()

	// Get categories for product form
	const { data: categoriesData } = useCategories()
	const categories = categoriesData ? categoriesData.map((c) => c.name) : []

	// Mutations for product operations
	const { mutate: createProduct, isPending: isCreating } = useCreateProduct()
	const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct()
	const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct()

	// Handle adding a new product
	const handleAddProduct = () => {
		setSelectedProduct(null)
		setIsFormOpen(true)
	}

	// Handle editing a product
	const handleEditProduct = (product: Product) => {
		setSelectedProduct(product)
		setIsFormOpen(true)
	}

	// Handle viewing a product
	const handleViewProduct = (product: Product) => {
		// Redirect to the product page on the frontend
		window.open(`/products/${product.slug || product.id}`, "_blank")
	}

	// Handle deleting a product
	const handleDeleteClick = (product: Product) => {
		setSelectedProduct(product)
		setIsDeleteDialogOpen(true)
	}

	// Confirm delete
	const confirmDelete = async () => {
		if (!selectedProduct) return

		deleteProduct(selectedProduct.id, {
			onSuccess: () => {
				setIsDeleteDialogOpen(false)
				setSelectedProduct(null)
			},
			onError: (error) => {
				console.error("Error deleting product:", error)
				toast.error("Failed to delete product")
			},
		})
	}

	// Handle form submission
	const handleFormSubmit = async (data: any) => {
		try {
			if (selectedProduct) {
				// Update existing product
				updateProduct(
					{
						id: selectedProduct.id,
						data,
					},
					{
						onSuccess: () => {
							setIsFormOpen(false)
						},
					},
				)
			} else {
				// Create new product
				createProduct(data, {
					onSuccess: () => {
						setIsFormOpen(false)
					},
				})
			}
			return selectedProduct || { id: 0 } // Return something to satisfy the form
		} catch (error) {
			console.error("Error submitting product:", error)
			toast.error(
				selectedProduct
					? "Failed to update product"
					: "Failed to create product",
			)
			throw error
		}
	}

	return (
		<>
			<ProductList
				onAdd={handleAddProduct}
				onEdit={handleEditProduct}
				onDelete={handleDeleteClick}
				onView={handleViewProduct}
			/>

			{/* Product Form Dialog */}
			<ProductForm
				product={selectedProduct || undefined}
				isOpen={isFormOpen}
				onClose={() => setIsFormOpen(false)}
				onSubmit={handleFormSubmit}
				title={selectedProduct ? "Edit Product" : "Add New Product"}
				categories={categories}
				isSubmitting={false}
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
							{isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
