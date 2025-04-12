"use client"

import { useState, useEffect } from "react"
import { ProductList } from "@/components/admin/ProductList"
import { ProductForm } from "@/components/admin/ProductForm"
import { ProductService, ProductFormData } from "@/services/product-service"
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

export default function ProductsPage() {
	// State for products
	const [categories, setCategories] = useState<string[]>([])
	const [isFormOpen, setIsFormOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)

	// Load categories
	useEffect(() => {
		const loadCategories = async () => {
			try {
				const categories = await ProductService.getCategories()
				setCategories(categories)
			} catch (error) {
				console.error("Error loading categories:", error)
				toast.error("Failed to load categories")
			}
		}

		loadCategories()
	}, [])

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
		window.open(`/products/${product.id}`, "_blank")
	}

	// Handle deleting a product
	const handleDeleteClick = (product: Product) => {
		setSelectedProduct(product)
		setIsDeleteDialogOpen(true)
	}

	// Confirm delete
	const confirmDelete = async () => {
		if (!selectedProduct) return

		setIsDeleting(true)
		try {
			await ProductService.deleteProduct(selectedProduct.id)
			toast.success("Product deleted successfully")
			setIsDeleteDialogOpen(false)
			// Refresh the product list by triggering a re-render
			setSelectedProduct(null)
		} catch (error) {
			console.error("Error deleting product:", error)
			toast.error("Failed to delete product")
		} finally {
			setIsDeleting(false)
		}
	}

	// Handle form submission
	const handleFormSubmit = async (data: ProductFormData): Promise<Product> => {
		if (selectedProduct) {
			// Update existing product
			return await ProductService.updateProduct(selectedProduct.id, data)
		} else {
			// Create new product
			return await ProductService.createProduct(data)
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
