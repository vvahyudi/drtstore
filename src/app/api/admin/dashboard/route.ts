import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
	try {
		// Authenticate admin user
		const session = await auth.getSession(request)

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		// Check if user is an admin
		const isAdmin = await auth.hasRole(session.user.id, "admin")

		if (!isAdmin) {
			return NextResponse.json(
				{ error: "Forbidden: Admin access required" },
				{ status: 403 },
			)
		}

		// Get dashboard statistics
		const [
			productsResult,
			ordersResult,
			recentOrdersResult,
			productStatsResult,
			revenueResult,
			topProductsResult,
		] = await Promise.all([
			// Total product count
			supabase.from("products").select("id", { count: "exact", head: true }),

			// Order statistics by status
			supabase.from("orders").select("status", { count: "exact", head: false }),

			// Recent orders
			supabase
				.from("orders")
				.select(
					`
          id,
          user_id,
          status,
          total_amount,
          created_at,
          shipping_address,
          users!inner(email)
        `,
				)
				.order("created_at", { ascending: false })
				.limit(10),

			// Product category statistics
			supabase.from("products").select("category"),

			// Revenue statistics (monthly)
			supabase
				.from("orders")
				.select("created_at, total_amount, status")
				.gte(
					"created_at",
					new Date(
						new Date().setMonth(new Date().getMonth() - 6),
					).toISOString(),
				)
				.eq("status", "completed"),

			// Top selling products
			supabase
				.from("order_items")
				.select(
					`
          product_id,
          quantity,
          products!inner(name)
        `,
				)
				.order("quantity", { ascending: false })
				.limit(5),
		])

		// Check for errors
		if (
			productsResult.error ||
			ordersResult.error ||
			recentOrdersResult.error ||
			productStatsResult.error ||
			revenueResult.error ||
			topProductsResult.error
		) {
			console.error("Error fetching dashboard data:", {
				products: productsResult.error,
				orders: ordersResult.error,
				recentOrders: recentOrdersResult.error,
				productStats: productStatsResult.error,
				revenue: revenueResult.error,
				topProducts: topProductsResult.error,
			})

			return NextResponse.json(
				{ error: "Failed to fetch dashboard data" },
				{ status: 500 },
			)
		}

		// Process order status counts
		const orderStatusCounts = {
			pending: 0,
			processing: 0,
			completed: 0,
			cancelled: 0,
			total: ordersResult.count || 0,
		}

		ordersResult.data?.forEach((order) => {
			const status = order.status as keyof typeof orderStatusCounts
			if (status in orderStatusCounts) {
				orderStatusCounts[status]++
			}
		})

		// Process product categories
		const categoryStats = productStatsResult.data?.reduce(
			(acc: Record<string, number>, item) => {
				acc[item.category] = (acc[item.category] || 0) + 1
				return acc
			},
			{},
		)

		// Process monthly revenue
		const monthlyRevenue = processMonthlyRevenue(revenueResult.data || [])

		// Format top products
		const topProducts =
			topProductsResult.data?.map((item) => ({
				id: item.product_id,
				name: item.products?.name,
				totalSold: item.quantity,
			})) || []

		return NextResponse.json({
			summary: {
				products: productsResult.count || 0,
				orders: orderStatusCounts.total,
				revenue:
					revenueResult.data?.reduce(
						(sum, order) => sum + (order.total_amount || 0),
						0,
					) || 0,
				pendingOrders: orderStatusCounts.pending,
			},
			orderStats: orderStatusCounts,
			recentOrders: recentOrdersResult.data,
			categoryStats,
			monthlyRevenue,
			topProducts,
		})
	} catch (error) {
		console.error("Error in dashboard API:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		)
	}
}

/**
 * Process monthly revenue data into a format suitable for charts
 */
function processMonthlyRevenue(orders: any[]) {
	const sixMonthsAgo = new Date()
	sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
	sixMonthsAgo.setDate(1)
	sixMonthsAgo.setHours(0, 0, 0, 0)

	// Initialize monthly data with zeros
	const monthlyData: Record<string, number> = {}

	// Generate all month names for the last 6 months
	for (let i = 0; i < 6; i++) {
		const date = new Date()
		date.setMonth(date.getMonth() - i)
		const monthYear = `${date.toLocaleString("default", {
			month: "short",
		})} ${date.getFullYear()}`
		monthlyData[monthYear] = 0
	}

	// Fill in revenue data
	orders.forEach((order) => {
		const orderDate = new Date(order.created_at)
		const monthYear = `${orderDate.toLocaleString("default", {
			month: "short",
		})} ${orderDate.getFullYear()}`

		// Only include orders from the last 6 months
		if (orderDate >= sixMonthsAgo && monthlyData[monthYear] !== undefined) {
			monthlyData[monthYear] += order.total_amount || 0
		}
	})

	// Convert to array format for charts
	return Object.entries(monthlyData)
		.map(([month, amount]) => ({ month, amount }))
		.reverse() // Most recent month last
}
