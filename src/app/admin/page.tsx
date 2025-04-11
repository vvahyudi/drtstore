"use client"

import { useState, useEffect } from "react"
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts"
import { ChevronUp, ChevronDown, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface SummaryData {
	products: number
	orders: number
	revenue: number
	pendingOrders: number
}

interface OrderStats {
	pending: number
	processing: number
	completed: number
	cancelled: number
	total: number
}

interface RecentOrder {
	id: number
	customer: string
	amount: number
	status: string
	date: string
}

interface MonthlyRevenue {
	month: string
	amount: number
}

interface CategoryStat {
	name: string
	value: number
}

// Format currency to IDR
const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount)
}

// StatusBadge component
const StatusBadge = ({ status }: { status: string }) => {
	const statusStyles: Record<string, string> = {
		pending: "bg-yellow-100 text-yellow-800",
		processing: "bg-blue-100 text-blue-800",
		completed: "bg-green-100 text-green-800",
		cancelled: "bg-red-100 text-red-800",
		shipped: "bg-purple-100 text-purple-800",
	}

	return (
		<Badge
			className={`${
				statusStyles[status] || "bg-gray-100 text-gray-800"
			} font-medium`}
			variant="outline"
		>
			{status.charAt(0).toUpperCase() + status.slice(1)}
		</Badge>
	)
}

const StatCard = ({
	title,
	value,
	change,
	positive,
}: {
	title: string
	value: string
	change: string
	positive: boolean
}) => {
	return (
		<Card>
			<CardContent className="p-6">
				<div className="flex flex-col space-y-2">
					<p className="text-sm font-medium text-muted-foreground">{title}</p>
					<div className="flex items-center">
						<span className="text-2xl font-bold">{value}</span>
						<span
							className={`ml-2 flex items-center text-sm ${
								positive ? "text-green-600" : "text-red-600"
							}`}
						>
							{positive ? (
								<ChevronUp className="h-4 w-4" />
							) : (
								<ChevronDown className="h-4 w-4" />
							)}
							{change}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
// [Previous interfaces and helper functions remain the same]

export default function DashboardPage() {
	// [Previous state and useEffect remain the same]
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [summary, setSummary] = useState<SummaryData>({
		products: 0,
		orders: 0,
		revenue: 0,
		pendingOrders: 0,
	})
	const [orderStats, setOrderStats] = useState<OrderStats>({
		pending: 0,
		processing: 0,
		completed: 0,
		cancelled: 0,
		total: 0,
	})
	const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
	const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([])
	const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([])

	// Fetch dashboard data
	useEffect(() => {
		const fetchDashboardData = async () => {
			setLoading(true)
			setError(null)

			try {
				// Fetch products count
				const { count: productsCount, error: productsError } = await supabase
					.from("products")
					.select("*", { count: "exact", head: true })

				// Fetch orders statistics
				const { data: ordersData, error: ordersError } = await supabase
					.from("orders")
					.select("status")

				// Fetch total revenue
				const { data: revenueData, error: revenueError } = await supabase
					.from("orders")
					.select("total_amount")
					.eq("status", "completed")

				// Fetch recent orders
				const { data: recentOrdersData, error: recentOrdersError } =
					await supabase
						.from("orders")
						.select(
							`
            id,
            total_amount,
            status,
            created_at,
            user_id,
            users(email)
          `,
						)
						.order("created_at", { ascending: false })
						.limit(5)

				// Fetch monthly revenue
				const { data: monthlyRevenueData, error: monthlyRevenueError } =
					await supabase
						.from("orders")
						.select("created_at, total_amount")
						.eq("status", "completed")
						.gte(
							"created_at",
							new Date(
								new Date().setMonth(new Date().getMonth() - 6),
							).toISOString(),
						)

				// Fetch category statistics
				const { data: categoryData, error: categoryError } = await supabase
					.from("products")
					.select("category")

				// Check for any errors
				if (
					productsError ||
					ordersError ||
					revenueError ||
					recentOrdersError ||
					monthlyRevenueError ||
					categoryError
				) {
					throw new Error("Failed to fetch dashboard data")
				}

				// Process order statistics
				const orderStatistics: OrderStats = {
					pending: ordersData.filter((o) => o.status === "pending").length,
					processing: ordersData.filter((o) => o.status === "processing")
						.length,
					completed: ordersData.filter((o) => o.status === "completed").length,
					cancelled: ordersData.filter((o) => o.status === "cancelled").length,
					total: ordersData.length,
				}

				// Process recent orders
				const processedRecentOrders: RecentOrder[] = recentOrdersData.map(
					(order) => ({
						id: order.id,
						customer: "Unknown",
						amount: order.total_amount,
						status: order.status,
						date: order.created_at,
					}),
				)

				// Process monthly revenue
				const processedMonthlyRevenue =
					processMonthlyRevenue(monthlyRevenueData)

				// Process category statistics
				const processedCategoryStats = processCategoryStats(categoryData)

				// Set state
				setSummary({
					products: productsCount || 0,
					orders: ordersData.length,
					revenue: revenueData.reduce(
						(sum, order) => sum + order.total_amount,
						0,
					),
					pendingOrders: orderStatistics.pending,
				})
				setOrderStats(orderStatistics)
				setRecentOrders(processedRecentOrders)
				setMonthlyRevenue(processedMonthlyRevenue)
				setCategoryStats(processedCategoryStats)
			} catch (err) {
				console.error("Error fetching dashboard data:", err)
				setError("Failed to load dashboard data. Please try again.")
				toast.error("Failed to load dashboard data")
			} finally {
				setLoading(false)
			}
		}

		fetchDashboardData()
	}, [])

	// Process monthly revenue data
	const processMonthlyRevenue = (orders: any[]): MonthlyRevenue[] => {
		const monthlyData: Record<string, number> = {}

		// Generate last 6 months
		for (let i = 5; i >= 0; i--) {
			const date = new Date()
			date.setMonth(date.getMonth() - i)
			const monthYear = date.toLocaleString("default", {
				month: "short",
				year: "numeric",
			})
			monthlyData[monthYear] = 0
		}

		// Aggregate revenue
		orders.forEach((order) => {
			const date = new Date(order.created_at)
			const monthYear = date.toLocaleString("default", {
				month: "short",
				year: "numeric",
			})
			if (monthlyData.hasOwnProperty(monthYear)) {
				monthlyData[monthYear] += order.total_amount
			}
		})

		return Object.entries(monthlyData).map(([month, amount]) => ({
			month,
			amount,
		}))
	}

	// Process category statistics
	const processCategoryStats = (products: any[]): CategoryStat[] => {
		const categoryCount: Record<string, number> = {}

		products.forEach((product) => {
			const category = product.category
			categoryCount[category] = (categoryCount[category] || 0) + 1
		})

		return Object.entries(categoryCount).map(([name, value]) => ({
			name,
			value,
		}))
	}

	// Define colors for pie chart
	const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

	// Render loading state
	if (loading) {
		return (
			<div className="flex justify-center items-center h-full">
				Loading dashboard data...
			</div>
		)
	}

	// Render error state
	if (error) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="flex items-center gap-2 text-red-500">
					<AlertCircle className="h-5 w-5" />
					<span>{error}</span>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Summary Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard
					title="Total Sales"
					value={formatCurrency(summary.revenue)}
					change="+12.5%"
					positive={true}
				/>
				<StatCard
					title="Orders"
					value={summary.orders.toString()}
					change="+8.2%"
					positive={true}
				/>
				<StatCard
					title="Products"
					value={summary.products.toString()}
					change="+5.1%"
					positive={true}
				/>
				<StatCard
					title="Pending Orders"
					value={summary.pendingOrders.toString()}
					change="-3.1%"
					positive={false}
				/>
			</div>

			{/* Sales Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Sales Overview</CardTitle>
					</CardHeader>
					<CardContent className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={monthlyRevenue}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="month" />
								<YAxis />
								<Tooltip formatter={(value) => formatCurrency(Number(value))} />
								<Legend />
								<Line
									type="monotone"
									dataKey="amount"
									stroke="#3B82F6"
									strokeWidth={2}
									name="Revenue"
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Category Distribution */}
				<Card>
					<CardHeader>
						<CardTitle>Product Categories</CardTitle>
					</CardHeader>
					<CardContent className="h-80 flex items-center justify-center">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={categoryStats}
									cx="50%"
									cy="50%"
									labelLine={false}
									outerRadius={80}
									fill="#8884d8"
									dataKey="value"
									label={({ name, percent }) =>
										`${name} ${(percent * 100).toFixed(0)}%`
									}
								>
									{categoryStats.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>

			{/* Order Statistics */}
			<Card>
				<CardHeader>
					<CardTitle>Order Statistics</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
						<div className="flex flex-col items-center space-y-2 p-4 bg-muted/20 rounded-lg">
							<span className="text-2xl font-bold">{orderStats.pending}</span>
							<span className="text-sm text-muted-foreground">Pending</span>
						</div>
						<div className="flex flex-col items-center space-y-2 p-4 bg-muted/20 rounded-lg">
							<span className="text-2xl font-bold">
								{orderStats.processing}
							</span>
							<span className="text-sm text-muted-foreground">Processing</span>
						</div>
						<div className="flex flex-col items-center space-y-2 p-4 bg-muted/20 rounded-lg">
							<span className="text-2xl font-bold">{orderStats.completed}</span>
							<span className="text-sm text-muted-foreground">Completed</span>
						</div>
						<div className="flex flex-col items-center space-y-2 p-4 bg-muted/20 rounded-lg">
							<span className="text-2xl font-bold">{orderStats.cancelled}</span>
							<span className="text-sm text-muted-foreground">Cancelled</span>
						</div>
					</div>

					<div className="h-60">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={[
									{ name: "Pending", value: orderStats.pending },
									{ name: "Processing", value: orderStats.processing },
									{ name: "Completed", value: orderStats.completed },
									{ name: "Cancelled", value: orderStats.cancelled },
								]}
								margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="value" name="Orders" fill="#3B82F6" />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>

			{/* Recent Orders */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Orders</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-muted/50">
								<tr>
									<th className="px-4 py-3 text-left font-medium">Order ID</th>
									<th className="px-4 py-3 text-left font-medium">Customer</th>
									<th className="px-4 py-3 text-left font-medium">Amount</th>
									<th className="px-4 py-3 text-left font-medium">Status</th>
									<th className="px-4 py-3 text-left font-medium">Date</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-muted/20">
								{recentOrders.map((order) => (
									<tr key={order.id} className="hover:bg-muted/50">
										<td className="px-4 py-3 whitespace-nowrap">#{order.id}</td>
										<td className="px-4 py-3 whitespace-nowrap">
											{order.customer}
										</td>
										<td className="px-4 py-3 whitespace-nowrap">
											{formatCurrency(order.amount)}
										</td>
										<td className="px-4 py-3 whitespace-nowrap">
											<StatusBadge status={order.status} />
										</td>
										<td className="px-4 py-3 whitespace-nowrap">
											{new Date(order.date).toLocaleDateString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
