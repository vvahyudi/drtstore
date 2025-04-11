"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  AlertCircle,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { Product } from "@/types/api"

// Format currency to IDR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

interface ProductWithCategory extends Product {
  category: string
  stock: number
  status: string
}

export default function ProductsPage() {
  // State for products and UI
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductWithCategory[]>([])
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    isNew: false,
    stock: "",
  })

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        // In a real application, you would fetch from your API
        // const response = await fetch('/api/admin/products')
        // const data = await response.json()
        
        // For demo, using mock data
        const mockProducts: ProductWithCategory[] = [
          {
            id: 1,
            name: "Kaca Mata Stylish Rimless",
            price: 39999,
            image: "/kacamata.jpg",
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
            stock: 15,
            status: "active",
          },
          {
            id: 2,
            name: "Case iPhone Transparan - Lindungi iPhone Anda dengan Gaya!",
            price: 19999,
            image: "/iphone-case.jpg",
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
            stock: 42,
            status: "active",
          },
          {
            id: 3,
            name: "Sandal Jepit Flipper Classic - Gaya Kasual, Harga Spesial!",
            price: 19999,
            image: "/sendal.jpg",
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
            stock: 28,
            status: "active",
          },
          {
            id: 4,
            name: "Jam Tangan Alba Quartz - Koleksi Terbaru, Gaya Elegan, Harga Spesial!",
            price: 59999,
            image: "/jamtangan.jpg",
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
            stock: 8,
            status: "active",
          },
          {
            id: 5,
            name: "Headphone Wireless",
            price: 89999,
            image: "/headphone.jpg",
            category: "electronics",
            isNew: true,
            description: "Headphone wireless dengan kualitas suara premium",
            details: {
              material: "Plastic, Metal",
              fit: "Over-ear",
              care: "Simpan di tempat kering dan bersih",
              origin: "China",
            },
            sizes: [],
            colors: ["Black", "White", "Blue"],
            images: ["/headphone.jpg"],
            stock: 0,
            status: "out_of_stock",
          },
        ]
        
        setProducts(mockProducts)
        setFilteredProducts(mockProducts)
      } catch (err) {
        console.error("Error fetching products:", err)
        setError("Failed to load products. Please try again.")
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
        product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(product => product.category === categoryFilter)
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(product => product.status === statusFilter)
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
  const categories = Array.from(new Set(products.map(product => product.category)))

  // Handle opening the edit dialog
  const handleEditClick = (product: ProductWithCategory) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category,
      isNew: product.isNew,
      stock: product.stock.toString(),
    })
    setIsEditDialogOpen(true)
  }

  // Handle opening the delete dialog
  const handleDeleteClick = (product: ProductWithCategory) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  // Handle form submission for add/edit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // In a real app, you would send this to your API
    console.log("Form submitted:", formData)
    
    // Close the dialog
    setIsAddDialogOpen(false)
    setIsEditDialogOpen(false)
    
    // Reset form data
    setFormData({
      name: "",
      price: "",
      description: "",
      category: "",
      isNew: false,
      stock: "",
    })
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return
    
    // In a real app, you would send a DELETE request to your API
    console.log("Delete product:", selectedProduct.id)
    
    // Update UI optimistically
    setProducts(products.filter(p => p.id !== selectedProduct.id))
    
    // Close the dialog
    setIsDeleteDialogOpen(false)
    setSelectedProduct(null)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading products...</div>
  }

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
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select 
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          </4
          
          {currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3 mb-4">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-lg mb-1">No products found</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-4">
                We couldn&apos;t find any products matching your search criteria. Try adjusting your filters.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("")
                  setCategoryFilter("all")
                  setStatusFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{product.name}</span>
                              <span className="text-xs text-muted-foreground">ID: #{product.id}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{product.category}</TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <Badge variant={product.status === "active" ? "default" : "destructive"}>
                            {product.status === "active" ? "Active" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => window.open(`/products/${product.id}`, '_blank')}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditClick(product)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteClick(product)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredProducts.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredProducts.length}</span> products
                </div>
                
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(prev => Math.max(prev - 1, 1))
                        }} 
                        aria-disabled={currentPage === 1}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                      let pageNumber: number
                      
                      if (totalPages <= 5) {
                        pageNumber = i + 1
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i
                      } else {
                        pageNumber = currentPage - 2 + i
                      }
                      
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault()
                              setCurrentPage(pageNumber)
                            }}
                            isActive={currentPage === pageNumber}
                          ></PaginationLink>