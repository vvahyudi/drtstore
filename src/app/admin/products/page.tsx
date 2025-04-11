"use client"

import { useState, useEffect } from "react"
import {
	Search,
	Plus,
	Edit,
	Trash2,
	Eye,
	AlertCircle,
	MoreHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { Product } from "@/types/api"
import { toast } from "sonner"

// Format currency to IDR
const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount)
}

// Extended Product interface with additional admin-specific fields
interface AdminProduct extends Product {
	stock: number
	status: "active" | "out_of_stock"
}

export default function ProductsPage() {
	// State for products and UI
	const [products, setProducts] = useState<AdminProduct[]>([])
	const [filteredProducts, setFilteredProducts] = useState<AdminProduct[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Search and filter state
	const [searchTerm, setSearchTerm] = useState("")
	const [categoryFilter, setCategoryFilter] = useState("all")
	const [statusFilter, setStatusFilter] = useState("all")

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage] = useState(10)

	// Dialog state for product form
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(
		null,
	)

	// Form state
	const [formData, setFormData] = useState<Partial<AdminProduct>>({
		name: "",
		price: 0,
		description: "",
		category: "",
		isNew: false,
		stock: 0,
		images: [],
		sizes: [],
		colors: [],
		details: {
			material: "",
			fit: "",
			care: "",
			origin: "",
		},
	})

	// Fetch products from Supabase
	useEffect(() => {
		const fetchProducts = async () => {
			setLoading(true)
			setError(null)

			try {
				const { data, error } = await supabase.from("products").select(`
            *,
            images:product_images(*)
          `)

				if (error) throw error

				// Transform data to match AdminProduct interface
				const transformedProducts: AdminProduct[] = data.map((product) => ({
					...product,
					image:
						product.images.find((img: any) => img.is_primary)?.image_url ||
						product.images[0]?.image_url,
					images: product.images.map((img: any) => img.image_url),
					stock: product.stock || 0, // Assuming you have a stock column
					status:
						product.stock && product.stock > 0 ? "active" : "out_of_stock",
				}))

				setProducts(transformedProducts)
				setFilteredProducts(transformedProducts)
			} catch (err) {
				console.error("Error fetching products:", err)
				setError("Failed to load products. Please try again.")
				toast.error("Failed to load products")
			} finally {
				setLoading(false)
			}
		}

		fetchProducts()
	}, [])

	// Apply filters whenever search or filters change
	useEffect(() => {
		let filtered = [...products]

		// Apply search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(product) =>
					product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					product.description.toLowerCase().includes(searchTerm.toLowerCase()),
			)
		}

		// Apply category filter
		if (categoryFilter !== "all") {
			filtered = filtered.filter(
				(product) => product.category === categoryFilter,
			)
		}

		// Apply status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter((product) => product.status === statusFilter)
		}

		setFilteredProducts(filtered)
		// Reset to first page when filters change
		setCurrentPage(1)
	}, [searchTerm, categoryFilter, statusFilter, products])

	// Calculate pagination
	const indexOfLastItem = currentPage * itemsPerPage
	const indexOfFirstItem = indexOfLastItem - itemsPerPage
	const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
	const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

	// Get unique categories for filter dropdown
	const categories = Array.from(
		new Set(products.map((product) => product.category)),
	)

	// Handle form input changes
	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value, type } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: type === "number" ? Number(value) : value,
		}))
	}

	// Handle product creation/update
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		try {
			if (selectedProduct) {
				// Update existing product
				const { data, error } = await supabase
					.from("products")
					.update(formData)
					.eq("id", selectedProduct.id)
					.select()

				if (error) throw error

				// Update local state
				setProducts((prev) =>
					prev.map((p) =>
						p.id === selectedProduct.id ? { ...p, ...data[0] } : p,
					),
				)

				toast.success("Product updated successfully")
			} else {
				// Create new product
				const { data, error } = await supabase
					.from("products")
					.insert(formData)
					.select()

				if (error) throw error

				// Add to local state
				setProducts((prev) => [...prev, data[0]])

				toast.success("Product created successfully")
			}

			// Close dialog and reset form
			setIsAddDialogOpen(false)
			setIsEditDialogOpen(false)
			setSelectedProduct(null)
			setFormData({
				name: "",
				price: 0,
				description: "",
				category: "",
				isNew: false,
				stock: 0,
				images: [],
				sizes: [],
				colors: [],
				details: {
					material: "",
					fit: "",
					care: "",
					origin: "",
				},
			})
		} catch (err) {
			console.error("Error saving product:", err)
			toast.error("Failed to save product")
		}
	}

	// Handle product deletion
	const handleDeleteProduct = async () => {
		if (!selectedProduct) return

		try {
			const { error } = await supabase
				.from("products")
				.delete()
				.eq("id", selectedProduct.id)

			if (error) throw error

			// Remove from local state
			setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id))

			toast.success("Product deleted successfully")
		} catch (err) {
			console.error("Error deleting product:", err)
			toast.error("Failed to delete product")
		}
	}

	// Render loading state
	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				Loading products...
			</div>
		)
	}

	// Render error state
	if (error) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="flex items-center gap-2 text-red-500">
					<AlertCircle className="h-5 w-5" />
					<span>{error}</span>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader className="flex flex-row items-start justify-between space-y-0">
					<div>
						<CardTitle>Products</CardTitle>
						<CardDescription className="mt-2">
							Manage your product inventory, pricing, and details.
						</CardDescription>
					</div>
					<Button
						onClick={() => {
							setSelectedProduct(null)
							setIsAddDialogOpen(true)
						}}
					>
						<Plus className="mr-2 h-4 w-4" /> Add Product
					</Button>
				</CardHeader>
				<CardContent>
					{/* Filtering and search UI remains the same as previous implementation */}
					{/* ... */}
				</CardContent>
			</Card>

			{/* Add/Edit Product Dialog */}
			<Dialog
				open={isAddDialogOpen || isEditDialogOpen}
				onOpenChange={() => {
					setIsAddDialogOpen(false)
					setIsEditDialogOpen(false)
					setSelectedProduct(null)
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{selectedProduct ? "Edit Product" : "Add New Product"}
						</DialogTitle>
						<DialogDescription>
							{selectedProduct
								? "Update the details of this product"
								: "Create a new product for your store"}
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Add form fields for product details */}
						<div className="space-y-2">
							<Label>Name</Label>
							<Input
								name="name"
								value={formData.name || ""}
								onChange={handleInputChange}
								required
							/>
						</div>
						{/* Add more form fields for price, description, etc. */}
						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</DialogClose>
							<Button type="submit">
								{selectedProduct ? "Update Product" : "Create Product"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}
