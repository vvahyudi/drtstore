"use client"

import { useState, useEffect } from "react"
import {
	Search,
	Filter,
	Eye,
	Package,
	Truck,
	CheckCircle,
	XCircle,
	AlertCircle,
	MoreHorizontal,
	Calendar,
	Clock,
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
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { supabase } from "@/lib/supabase"

// Format currency to IDR
const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount)
}

interface OrderItem {
	id: number
	product_id: number
	name: string
	price: number
	quantity: number
	size?: string
	color?: string
	image?: string
}

interface Order {
	id: string
	customer: string
	email?: string
	phone?: string
	date: string
	items: OrderItem[]
	total: number
	status: "pending" | "processing" | "shipped" | "completed" | "cancelled"
	payment: string
	shipping_address: {
		address: string
		city: string
		state: string
		postal_code: string
		country: string
	}
}

export default function OrdersPage() {
	// State for orders and UI
	const [orders, setOrders] = useState<Order[]>([])
	const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Search and filter state
	const [searchTerm, setSearchTerm] = useState("")
	const [statusFilter, setStatusFilter] = useState("all")
	const [dateFilter, setDateFilter] = useState("all")

	// Pagination state
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage] = useState(10)

	// Order detail dialog state
	const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false)
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

	// Status update dialog
	const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false)
	const [newStatus, setNewStatus] = useState<string>("")
	const [statusNote, setStatusNote] = useState("")

	useEffect(() => {
		const fetchOrders = async () => {
			setLoading(true)
			setError(null)

			try {
				// In a real application, you would fetch from your API
				// const response = await fetch('/api/admin/orders')
				// const data = await response.json()

				// Mock orders data for demonstration
				const mockOrders: Order[] = [
					{
						id: "ORD-001",
						customer: "Ahmad Santoso",
						email: "ahmad@example.com",
						phone: "081234567890",
						date: "2025-04-10T08:30:00",
						items: [
							{
								id: 1,
								product_id: 1,
								name: "Kaca Mata Stylish Rimless",
								price: 39999,
								quantity: 1,
								image: "/kacamata.jpg",
							},
							{
								id: 2,
								product_id: 3,
								name: "Sandal Jepit Flipper Classic",
								price: 19999,
								quantity: 2,
								size: "42",
								color: "Black",
								image: "/sendal.jpg",
							},
						],
						total: 79997,
						status: "completed",
						payment: "Card",
						shipping_address: {
							address: "Jl. Sudirman No. 123",
							city: "Jakarta",
							state: "DKI Jakarta",
							postal_code: "10110",
							country: "Indonesia",
						},
					},
					{
						id: "ORD-002",
						customer: "Budi Setiawan",
						email: "budi@example.com",
						phone: "081234567891",
						date: "2025-04-10T10:15:00",
						items: [
							{
								id: 3,
								product_id: 2,
								name: "Case iPhone Transparan",
								price: 19999,
								quantity: 1,
								color: "Clear",
								image: "/iphone-case.jpg",
							},
							{
								id: 4,
								product_id: 4,
								name: "Jam Tangan Alba Quartz",
								price: 59999,
								quantity: 1,
								color: "Silver",
								image: "/jamtangan.jpg",
							},
						],
						total: 79998,
						status: "processing",
						payment: "PayPal",
						shipping_address: {
							address: "Jl. Gatot Subroto No. 45",
							city: "Jakarta",
							state: "DKI Jakarta",
							postal_code: "10270",
							country: "Indonesia",
						},
					},
					{
						id: "ORD-003",
						customer: "Citra Dewi",
						email: "citra@example.com",
						phone: "081234567892",
						date: "2025-04-09T14:20:00",
						items: [
							{
								id: 5,
								product_id: 1,
								name: "Kaca Mata Stylish Rimless",
								price: 39999,
								quantity: 1,
								color: "Gold",
								image: "/kacamata.jpg",
							},
						],
						total: 39999,
						status: "pending",
						payment: "COD",
						shipping_address: {
							address: "Jl. Merdeka No. 17",
							city: "Bandung",
							state: "Jawa Barat",
							postal_code: "40115",
							country: "Indonesia",
						},
					},
					{
						id: "ORD-004",
						customer: "Dewi Anggraini",
						email: "dewi@example.com",
						phone: "081234567893",
						date: "2025-04-09T16:45:00",
						items: [
							{
								id: 6,
								product_id: 5,
								name: "Headphone Wireless",
								price: 89999,
								quantity: 1,
								color: "Black",
								image: "/headphone.jpg",
							},
							{
								id: 7,
								product_id: 3,
								name: "Sandal Jepit Flipper Classic",
								price: 19999,
								quantity: 2,
								size: "38",
								color: "Blue",
								image: "/sendal.jpg",
							},
							{
								id: 8,
								product_id: 2,
								name: "Case iPhone Transparan",
								price: 19999,
								quantity: 1,
								color: "Black",
								image: "/iphone-case.jpg",
							},
						],
						total: 149996,
						status: "shipped",
						payment: "Card",
						shipping_address: {
							address: "Jl. Diponegoro No. 78",
							city: "Surabaya",
							state: "Jawa Timur",
							postal_code: "60241",
							country: "Indonesia",
						},
					},
					{
						id: "ORD-005",
						customer: "Eko Prasetyo",
						email: "eko@example.com",
						phone: "081234567894",
						date: "2025-04-08T09:10:00",
						items: [
							{
								id: 9,
								product_id: 4,
								name: "Jam Tangan Alba Quartz",
								price: 59999,
								quantity: 1,
								color: "Gold",
								image: "/jamtangan.jpg",
							},
						],
						total: 59999,
						status: "cancelled",
						payment: "Bank Transfer",
						shipping_address: {
							address: "Jl. Ahmad Yani No. 100",
							city: "Semarang",
							state: "Jawa Tengah",
							postal_code: "50252",
							country: "Indonesia",
						},
					},
					{
						id: "ORD-006",
						customer: "Fani Wijaya",
						email: "fani@example.com",
						phone: "081234567895",
						date: "2025-04-08T11:30:00",
						items: [
							{
								id: 10,
								product_id: 1,
								name: "Kaca Mata Stylish Rimless",
								price: 39999,
								quantity: 1,
								color: "Silver",
								image: "/kacamata.jpg",
							},
							{
								id: 11,
								product_id: 2,
								name: "Case iPhone Transparan",
								price: 19999,
								quantity: 1,
								color: "Clear",
								image: "/iphone-case.jpg",
							},
						],
						total: 59998,
						status: "completed",
						payment: "Card",
						shipping_address: {
							address: "Jl. Pemuda No. 56",
							city: "Yogyakarta",
							state: "DIY",
							postal_code: "55221",
							country: "Indonesia",
						},
					},
				]

				setOrders(mockOrders)
				setFilteredOrders(mockOrders)
			} catch (err) {
				console.error("Error fetching orders:", err)
				setError("Failed to load orders. Please try again.")
			} finally {
				setLoading(false)
			}
		}

		fetchOrders()
	}, [])

	// Apply filters whenever search or filters change
	useEffect(() => {
		let filtered = [...orders]

		// Apply search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(order) =>
					order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
					order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(order.email &&
						order.email.toLowerCase().includes(searchTerm.toLowerCase())),
			)
		}

		// Apply status filter
		if (statusFilter !== "all") {
			filtered = filtered.filter((order) => order.status === statusFilter)
		}

		// Apply date filter
		if (dateFilter !== "all") {
			const today = new Date()
			const startOfToday = new Date(today.setHours(0, 0, 0, 0))

			filtered = filtered.filter((order) => {
				const orderDate = new Date(order.date)

				switch (dateFilter) {
					case "today":
						return orderDate >= startOfToday
					case "yesterday":
						const yesterday = new Date(startOfToday)
						yesterday.setDate(yesterday.getDate() - 1)
						return orderDate >= yesterday && orderDate < startOfToday
					case "last7days":
						const last7Days = new Date(startOfToday)
						last7Days.setDate(last7Days.getDate() - 7)
						return orderDate >= last7Days
					case "last30days":
						const last30Days = new Date(startOfToday)
						last30Days.setDate(last30Days.getDate() - 30)
						return orderDate >= last30Days
					default:
						return true
				}
			})
		}

		setFilteredOrders(filtered)
		// Reset to first page when filters change
		setCurrentPage(1)
	}, [searchTerm, statusFilter, dateFilter, orders])

	// Calculate pagination
	const indexOfLastItem = currentPage * itemsPerPage
	const indexOfFirstItem = indexOfLastItem - itemsPerPage
	const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem)
	const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)

	// Handle viewing order details
	const handleViewOrderDetails = (order: Order) => {
		setSelectedOrder(order)
		setIsOrderDetailOpen(true)
	}

	// Handle opening status update dialog
	const handleStatusUpdateClick = (order: Order) => {
		setSelectedOrder(order)
		setNewStatus(order.status)
		setStatusNote("")
		setIsStatusUpdateOpen(true)
	}

	// Handle status update submission
	const handleStatusUpdateSubmit = async () => {
		if (!selectedOrder || !newStatus) return

		// In a real app, you would send this to your API
		console.log("Updating order status:", {
			orderId: selectedOrder.id,
			status: newStatus,
			note: statusNote,
		})

		// Update UI optimistically
		const updatedOrders = orders.map((order) =>
			order.id === selectedOrder.id
				? { ...order, status: newStatus as Order["status"] }
				: order,
		)
		setOrders(updatedOrders)

		// Close the dialog
		setIsStatusUpdateOpen(false)
		setSelectedOrder(null)
	}

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "pending":
				return <Clock className="h-4 w-4 text-yellow-500" />
			case "processing":
				return <Package className="h-4 w-4 text-blue-500" />
			case "shipped":
				return <Truck className="h-4 w-4 text-purple-500" />
			case "completed":
				return <CheckCircle className="h-4 w-4 text-green-500" />
			case "cancelled":
				return <XCircle className="h-4 w-4 text-red-500" />
			default:
				return null
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
			case "processing":
				return "bg-blue-100 text-blue-800 hover:bg-blue-200"
			case "shipped":
				return "bg-purple-100 text-purple-800 hover:bg-purple-200"
			case "completed":
				return "bg-green-100 text-green-800 hover:bg-green-200"
			case "cancelled":
				return "bg-red-100 text-red-800 hover:bg-red-200"
			default:
				return "bg-gray-100 text-gray-800 hover:bg-gray-200"
		}
	}

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				Loading orders...
			</div>
		)
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
						<CardTitle>Orders</CardTitle>
						<CardDescription className="mt-2">
							Manage customer orders, process payments, and update order status.
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-4 mb-6">
						<div className="relative flex-1">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search orders by ID or customer..."
								className="pl-8"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className="flex flex-col sm:flex-row gap-4">
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="processing">Processing</SelectItem>
									<SelectItem value="shipped">Shipped</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
								</SelectContent>
							</Select>

							<Select value={dateFilter} onValueChange={setDateFilter}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Date Range" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Time</SelectItem>
									<SelectItem value="today">Today</SelectItem>
									<SelectItem value="yesterday">Yesterday</SelectItem>
									<SelectItem value="last7days">Last 7 Days</SelectItem>
									<SelectItem value="last30days">Last 30 Days</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{currentItems.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12">
							<div className="rounded-full bg-muted p-3 mb-4">
								<AlertCircle className="h-6 w-6 text-muted-foreground" />
							</div>
							<h3 className="font-medium text-lg mb-1">No orders found</h3>
							<p className="text-muted-foreground text-center max-w-sm mb-4">
								We couldn't find any orders matching your search criteria. Try
								adjusting your filters.
							</p>
							<Button
								variant="outline"
								onClick={() => {
									setSearchTerm("")
									setStatusFilter("all")
									setDateFilter("all")
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
											<TableHead>Order ID</TableHead>
											<TableHead>Customer</TableHead>
											<TableHead>Date</TableHead>
											<TableHead>Total</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Payment</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{currentItems.map((order) => (
											<TableRow key={order.id}>
												<TableCell className="font-medium">
													{order.id}
												</TableCell>
												<TableCell>{order.customer}</TableCell>
												<TableCell>
													{format(new Date(order.date), "dd MMM yyyy")}
												</TableCell>
												<TableCell>{formatCurrency(order.total)}</TableCell>
												<TableCell>
													<Badge className={getStatusColor(order.status)}>
														<span className="flex items-center gap-1">
															{getStatusIcon(order.status)}
															<span>
																{order.status.charAt(0).toUpperCase() +
																	order.status.slice(1)}
															</span>
														</span>
													</Badge>
												</TableCell>
												<TableCell>{order.payment}</TableCell>
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
															<DropdownMenuItem
																onClick={() => handleViewOrderDetails(order)}
															>
																<Eye className="h-4 w-4 mr-2" />
																View Details
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => handleStatusUpdateClick(order)}
															>
																<Package className="h-4 w-4 mr-2" />
																Update Status
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
									Showing{" "}
									<span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
									<span className="font-medium">
										{Math.min(indexOfLastItem, filteredOrders.length)}
									</span>{" "}
									of{" "}
									<span className="font-medium">{filteredOrders.length}</span>{" "}
									orders
								</div>

								<Pagination>
									<PaginationContent>
										<PaginationItem>
											<PaginationPrevious
												href="#"
												onClick={(e) => {
													e.preventDefault()
													setCurrentPage((prev) => Math.max(prev - 1, 1))
												}}
												aria-disabled={currentPage === 1}
												className={
													currentPage === 1
														? "pointer-events-none opacity-50"
														: ""
												}
											/>
										</PaginationItem>

										{Array.from({ length: Math.min(totalPages, 5) }).map(
											(_, i) => {
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
														>
															{pageNumber}
														</PaginationLink>
													</PaginationItem>
												)
											},
										)}

										<PaginationItem>
											<PaginationNext
												href="#"
												onClick={(e) => {
													e.preventDefault()
													setCurrentPage((prev) =>
														Math.min(prev + 1, totalPages),
													)
												}}
												aria-disabled={currentPage === totalPages}
												className={
													currentPage === totalPages
														? "pointer-events-none opacity-50"
														: ""
												}
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* Order Details Dialog */}
			<Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
				<DialogContent className="sm:max-w-[700px]">
					<DialogHeader>
						<DialogTitle>Order Details</DialogTitle>
						<DialogDescription>
							Detailed information about order {selectedOrder?.id}
						</DialogDescription>
					</DialogHeader>

					{selectedOrder && (
						<div className="py-4 space-y-6">
							{/* Order Summary */}
							<div className="flex flex-col sm:flex-row justify-between gap-4">
								<div>
									<h3 className="font-semibold text-sm text-muted-foreground">
										Order ID
									</h3>
									<p className="font-medium">{selectedOrder.id}</p>
								</div>
								<div>
									<h3 className="font-semibold text-sm text-muted-foreground">
										Date
									</h3>
									<p>{format(new Date(selectedOrder.date), "PPP p")}</p>
								</div>
								<div>
									<h3 className="font-semibold text-sm text-muted-foreground">
										Status
									</h3>
									<Badge className={getStatusColor(selectedOrder.status)}>
										<span className="flex items-center gap-1">
											{getStatusIcon(selectedOrder.status)}
											<span>
												{selectedOrder.status.charAt(0).toUpperCase() +
													selectedOrder.status.slice(1)}
											</span>
										</span>
									</Badge>
								</div>
								<div>
									<h3 className="font-semibold text-sm text-muted-foreground">
										Payment
									</h3>
									<p>{selectedOrder.payment}</p>
								</div>
							</div>

							<Separator />

							{/* Customer Information */}
							<div>
								<h3 className="font-semibold mb-2">Customer Information</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Name
										</p>
										<p>{selectedOrder.customer}</p>
									</div>
									{selectedOrder.email && (
										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Email
											</p>
											<p>{selectedOrder.email}</p>
										</div>
									)}
									{selectedOrder.phone && (
										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Phone
											</p>
											<p>{selectedOrder.phone}</p>
										</div>
									)}
								</div>
							</div>

							<Separator />

							{/* Shipping Address */}
							<div>
								<h3 className="font-semibold mb-2">Shipping Address</h3>
								<p>{selectedOrder.shipping_address.address}</p>
								<p>
									{selectedOrder.shipping_address.city},{" "}
									{selectedOrder.shipping_address.state}{" "}
									{selectedOrder.shipping_address.postal_code}
								</p>
								<p>{selectedOrder.shipping_address.country}</p>
							</div>

							<Separator />

							{/* Order Items */}
							<div>
								<h3 className="font-semibold mb-2">Order Items</h3>
								<div className="space-y-4">
									{selectedOrder.items.map((item) => (
										<div key={item.id} className="flex items-center gap-4">
											<div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
												{item.image && (
													<img
														src={item.image}
														alt={item.name}
														className="h-full w-full object-cover"
													/>
												)}
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-medium truncate">{item.name}</p>
												<div className="flex text-sm text-muted-foreground">
													{item.size && (
														<p className="mr-2">Size: {item.size}</p>
													)}
													{item.color && <p>Color: {item.color}</p>}
												</div>
											</div>
											<div className="text-right">
												<p>{formatCurrency(item.price)}</p>
												<p className="text-sm text-muted-foreground">
													Qty: {item.quantity}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>

							<Separator />

							{/* Order Total */}
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="font-medium">Subtotal</span>
									<span>{formatCurrency(selectedOrder.total)}</span>
								</div>
								<div className="flex justify-between">
									<span className="font-medium">Shipping</span>
									<span>Calculated at checkout</span>
								</div>
								<div className="flex justify-between font-bold text-lg pt-2">
									<span>Total</span>
									<span>{formatCurrency(selectedOrder.total)}</span>
								</div>
							</div>
						</div>
					)}

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsOrderDetailOpen(false)}
						>
							Close
						</Button>
						<Button
							onClick={() => {
								setIsOrderDetailOpen(false)
								selectedOrder && handleStatusUpdateClick(selectedOrder)
							}}
						>
							Update Status
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Status Update Dialog */}
			<Dialog open={isStatusUpdateOpen} onOpenChange={setIsStatusUpdateOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>Update Order Status</DialogTitle>
						<DialogDescription>
							Change the status for order {selectedOrder?.id}
						</DialogDescription>
					</DialogHeader>

					<div className="py-4 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="status">Status</Label>
							<Select value={newStatus} onValueChange={setNewStatus}>
								<SelectTrigger id="status">
									<SelectValue placeholder="Select a status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="processing">Processing</SelectItem>
									<SelectItem value="shipped">Shipped</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="note">Status Note (Optional)</Label>
							<Textarea
								id="note"
								placeholder="Add a note about this status change"
								value={statusNote}
								onChange={(e) => setStatusNote(e.target.value)}
								rows={3}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsStatusUpdateOpen(false)}
						>
							Cancel
						</Button>
						<Button onClick={handleStatusUpdateSubmit}>Update Status</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
