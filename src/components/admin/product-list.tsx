"use client"

import { useState } from "react"
import {
	Search,
	Plus,
	Edit,
	Trash2,
	Eye,
	AlertCircle,
	MoreHorizontal,
	Filter,
	SortDesc,
	ArrowUpDown,
	Loader2,
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
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Product, ProductQueryParams } from "@/types/api"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useProducts, useDeleteProduct } from "@/hooks/use-products"
import { useCategories } from "@/hooks/use-categories"

// Format currency
const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount)
}

interface ProductListProps {
	onEdit: (product: Product) => void
	onDelete: (product: Product) => void
	onView: (product: Product) => void
	onAdd: () => void
}

export function ProductList({
	onEdit,
	onDelete,
	onView,
	onAdd,
}: ProductListProps) {
	// State for search and filter
	const [searchTerm, setSearchTerm] = useState("")
	const [categoryFilter, setCategoryFilter] = useState("all")
	const [stockFilter, setStockFilter] = useState("all")
	const [sortBy, setSortBy] = useState("created_at")
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage] = useState(10)

	// Query parameters
	const queryParams: ProductQueryParams = {
		page: currentPage,
		limit: itemsPerPage,
		orderBy: sortBy,
		orderDirection: sortOrder,
	}

	if (searchTerm) {
		queryParams.search = searchTerm
	}

	if (categoryFilter !== "all") {
		queryParams.category = categoryFilter
	}

	if (stockFilter === "in_stock") {
		// Logic for in stock filter
	} else if (stockFilter === "out_of_stock") {
		// Logic for out of stock filter
	}

	// Fetch products with React Query
	const {
		data: productsData,
		isLoading,
		isError,
		refetch,
	} = useProducts(queryParams)

	// Fetch categories for filtering
	const { data: categories = [] } = useCategories()

	// Delete product mutation
	const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct()

	// Handle search changes
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value)
		setCurrentPage(1) // Reset pagination when search changes
	}

	// Handle sort
	const handleSort = (field: string) => {
		if (sortBy === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc")
		} else {
			setSortBy(field)
			setSortOrder("asc")
		}
		setCurrentPage(1) // Reset pagination when sort changes
	}

	// Handle page change
	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage)
	}

	// Handle delete
	const handleDelete = (product: Product) => {
		if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
			deleteProduct(product.id, {
				onSuccess: () => {
					refetch()
				},
			})
		}
	}

	// Generate pagination links
	const totalProducts = productsData?.length || 0
	const totalPages = Math.ceil(totalProducts / itemsPerPage)

	const renderPaginationLinks = () => {
		const links = []

		// Show a maximum of 5 page links
		const startPage = Math.max(1, currentPage - 2)
		const endPage = Math.min(totalPages, startPage + 4)

		for (let i = startPage; i <= endPage; i++) {
			links.push(
				<PaginationItem key={i}>
					<PaginationLink
						isActive={i === currentPage}
						onClick={() => handlePageChange(i)}
					>
						{i}
					</PaginationLink>
				</PaginationItem>,
			)
		}

		return links
	}

	// Calculate current items to display
	const indexOfLastItem = currentPage * itemsPerPage
	const indexOfFirstItem = indexOfLastItem - itemsPerPage
	const currentItems =
		productsData?.slice(indexOfFirstItem, indexOfLastItem) || []

	// Render loading state
	if (isLoading && !productsData) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="ml-2 text-muted-foreground">Loading products...</p>
			</div>
		)
	}

	// Render error state
	if (isError) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="flex items-center gap-2 text-destructive">
					<AlertCircle className="h-5 w-5" />
					<span>Failed to load products. Please try again.</span>
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
					<Button onClick={onAdd}>
						<Plus className="mr-2 h-4 w-4" /> Add Product
					</Button>
				</CardHeader>
				<CardContent>
					{/* Filters */}
					<div className="mb-6 flex flex-col md:flex-row gap-4">
						<div className="relative w-full md:w-96">
							<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search products..."
								value={searchTerm}
								onChange={handleSearch}
								className="pl-8"
							/>
						</div>
						<div className="flex gap-4 flex-1 flex-wrap sm:flex-nowrap">
							<Select value={categoryFilter} onValueChange={setCategoryFilter}>
								<SelectTrigger className="w-full">
									<Filter className="mr-2 h-4 w-4" />
									<SelectValue placeholder="Category" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Categories</SelectItem>
									{categories.map((category) => (
										<SelectItem key={category.id} value={category.slug}>
											{category.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select value={stockFilter} onValueChange={setStockFilter}>
								<SelectTrigger className="w-full">
									<Filter className="mr-2 h-4 w-4" />
									<SelectValue placeholder="Stock" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Stock</SelectItem>
									<SelectItem value="in_stock">In Stock</SelectItem>
									<SelectItem value="out_of_stock">Out of Stock</SelectItem>
								</SelectContent>
							</Select>

							<Button variant="outline" onClick={() => refetch()}>
								Refresh
							</Button>
						</div>
					</div>

					{/* Products Table */}
					<div className="border rounded-md overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[80px]">Image</TableHead>
									<TableHead>
										<button
											className="flex items-center"
											onClick={() => handleSort("name")}
										>
											Product Name
											<ArrowUpDown className="ml-2 h-4 w-4" />
										</button>
									</TableHead>
									<TableHead>
										<button
											className="flex items-center"
											onClick={() => handleSort("price")}
										>
											Price
											<ArrowUpDown className="ml-2 h-4 w-4" />
										</button>
									</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>
										<button
											className="flex items-center"
											onClick={() => handleSort("stock")}
										>
											Stock
											<ArrowUpDown className="ml-2 h-4 w-4" />
										</button>
									</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{currentItems.length === 0 ? (
									<TableRow>
										<TableCell colSpan={7} className="text-center py-8">
											<div className="flex flex-col items-center justify-center text-muted-foreground">
												<p>No products found</p>
												<Button onClick={onAdd} variant="link" className="mt-2">
													Add your first product
												</Button>
											</div>
										</TableCell>
									</TableRow>
								) : (
									currentItems.map((product) => (
										<TableRow key={product.id} className="hover:bg-muted/50">
											<TableCell>
												<div className="relative aspect-square w-12 overflow-hidden rounded-md">
													<Image
														src={product.image || "/placeholder.svg"}
														alt={product.name}
														fill
														sizes="100px"
														className="object-cover"
													/>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex flex-col">
													<span className="font-medium truncate max-w-[200px]">
														{product.name}
													</span>
													{product.isNew && (
														<Badge variant="outline" className="mt-1 w-fit">
															New
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell>{formatCurrency(product.price)}</TableCell>
											<TableCell>{product.category}</TableCell>
											<TableCell>{product.stock}</TableCell>
											<TableCell>
												<Badge
													variant={
														product.stock && product.stock > 0
															? "default"
															: "destructive"
													}
													className="capitalize"
												>
													{product.stock && product.stock > 0
														? "In Stock"
														: "Out of Stock"}
												</Badge>
											</TableCell>
											<TableCell className="text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreHorizontal className="h-4 w-4" />
															<span className="sr-only">Actions</span>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem onClick={() => onView(product)}>
															<Eye className="mr-2 h-4 w-4" />
															View Details
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => onEdit(product)}>
															<Edit className="mr-2 h-4 w-4" />
															Edit
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() => handleDelete(product)}
															className="text-destructive"
															disabled={isDeleting}
														>
															{isDeleting ? (
																<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															) : (
																<Trash2 className="mr-2 h-4 w-4" />
															)}
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="mt-4">
							<Pagination>
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											onClick={() =>
												handlePageChange(Math.max(1, currentPage - 1))
											}
											disabled={currentPage === 1}
										/>
									</PaginationItem>

									{renderPaginationLinks()}

									<PaginationItem>
										<PaginationNext
											onClick={() =>
												handlePageChange(Math.min(totalPages, currentPage + 1))
											}
											disabled={currentPage === totalPages}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
