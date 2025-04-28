import apiClient from "@/lib/axios"

export interface SummaryData {
	products: number
	orders: number
	revenue: number
	pendingOrders: number
}

export interface OrderStats {
	pending: number
	processing: number
	completed: number
	cancelled: number
	total: number
}

export interface RecentOrder {
	id: number
	customer: string
	amount: number
	status: string
	date: string
}

export interface MonthlyRevenue {
	month: string
	amount: number
}

export interface CategoryStat {
	name: string
	value: number
}

class AdminStatsService {
	/**
	 * Get summary statistics for dashboard
	 */
	async getDashboardSummary(): Promise<{
		summary: SummaryData
		orderStats: OrderStats
		recentOrders: RecentOrder[]
		monthlyRevenue: MonthlyRevenue[]
		categoryStats: CategoryStat[]
	}> {
		try {
			const response = await apiClient.get("/admin/dashboard")
			return response.data.data
		} catch (error) {
			console.error("Error fetching dashboard data:", error)

			// Return mock data for development until backend API is ready
			return this.getMockDashboardData()
		}
	}

	/**
	 * Get mock dashboard data for development
	 */
	private getMockDashboardData() {
		// Mock summary data
		const summary: SummaryData = {
			products: 145,
			orders: 326,
			revenue: 43500000, // 43.5 million IDR
			pendingOrders: 15,
		}

		// Mock order statistics
		const orderStats: OrderStats = {
			pending: 15,
			processing: 23,
			completed: 278,
			cancelled: 10,
			total: 326,
		}

		// Mock recent orders
		const recentOrders: RecentOrder[] = [
			{
				id: 1001,
				customer: "John Doe",
				amount: 450000,
				status: "completed",
				date: new Date().toISOString(),
			},
			{
				id: 1002,
				customer: "Jane Smith",
				amount: 780000,
				status: "processing",
				date: new Date().toISOString(),
			},
			{
				id: 1003,
				customer: "Bob Johnson",
				amount: 320000,
				status: "pending",
				date: new Date().toISOString(),
			},
			{
				id: 1004,
				customer: "Alice Brown",
				amount: 650000,
				status: "completed",
				date: new Date().toISOString(),
			},
			{
				id: 1005,
				customer: "Charlie Wilson",
				amount: 900000,
				status: "cancelled",
				date: new Date().toISOString(),
			},
		]

		// Mock monthly revenue
		const monthlyRevenue: MonthlyRevenue[] = Array.from({ length: 6 }).map(
			(_, i) => {
				const date = new Date()
				date.setMonth(date.getMonth() - 5 + i)
				return {
					month: date.toLocaleString("default", {
						month: "short",
						year: "numeric",
					}),
					amount: Math.floor(Math.random() * 15000000) + 5000000, // Random between 5M and 20M
				}
			},
		)

		// Mock category statistics
		const categoryStats: CategoryStat[] = [
			{ name: "Kacamata", value: 45 },
			{ name: "Jam Tangan", value: 35 },
			{ name: "Aksesoris", value: 30 },
			{ name: "Pakaian", value: 25 },
		]

		return {
			summary,
			orderStats,
			recentOrders,
			monthlyRevenue,
			categoryStats,
		}
	}
}

export const adminStatsService = new AdminStatsService()
export default adminStatsService
