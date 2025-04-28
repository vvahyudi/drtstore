"use client"

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
import { ChevronUp, ChevronDown, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAdminDashboardStats } from "@/hooks/use-admin-dashboard"

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

export default function DashboardPage() {
	// Fetch dashboard data using React Query
	const { data, isLoading, isError } = useAdminDashboardStats()

	// Define colors for pie chart
	const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

	// Render loading state
	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-full">
				<Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
				<span className="text-muted-foreground">Loading dashboard data...</span>
			</div>
		)
	}

	// Render error state
	if (isError) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="flex items-center gap-2 text-red-500">
					<AlertCircle className="h-5 w-5" />
					<span>Failed to load dashboard data. Please try again.</span>
				</div>
			</div>
		)
	}

	// Extract data
	const { summary, orderStats, recentOrders, monthlyRevenue, categoryStats } =
		data!

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
