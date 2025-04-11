"use client"

import { useState, useEffect } from "react"
import { 
  BarChart, Bar, 
  LineChart, Line, 
  XAxis, YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts"
import { ChevronUp, ChevronDown, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

// Dashboard data types
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
      className={`${statusStyles[status] || "bg-gray-100 text-gray-800"} font-medium`}
      variant="outline"
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

// StatCard component
const StatCard = ({ 
  title, 
  value, 
  change, 
  positive 
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
            <span className={`ml-2 flex items-center text-sm ${
              positive ? "text-green-600" : "text-red-600"
            }`}>
              {positive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {change}
            </span>
          </div>
      
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
                    <td className="px-4 py-3 whitespace-nowrap">{order.customer}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(order.amount)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
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
              <span className="text-2xl font-bold">{orderStats.processing}</span>
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
                  { name: 'Pending', value: orderStats.pending },
                  { name: 'Processing', value: orderStats.processing },
                  { name: 'Completed', value: orderStats.completed },
                  { name: 'Cancelled', value: orderStats.cancelled },
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
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
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
  const [categoryStats, setCategoryStats] = useState<{ name: string; value: number }[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)

      try {
        // In a real app, you would fetch this from your API
        // const response = await fetch('/api/admin/dashboard')
        // const data = await response.json()
        
        // For demo purposes, we'll use mock data similar to what would come from the API
        // This simulates the dashboard API response
        const mockData = {
          summary: {
            products: 156,
            orders: 254,
            revenue: 12500000,
            pendingOrders: 15,
          },
          orderStats: {
            pending: 15,
            processing: 25,
            completed: 196,
            cancelled: 18,
            total: 254,
          },
          recentOrders: [
            { id: 1, customer: "Ahmad Santoso", amount: 200000, status: "completed", date: "2025-04-10" },
            { id: 2, customer: "Budi Setiawan", amount: 350000, status: "processing", date: "2025-04-10" },
            { id: 3, customer: "Citra Dewi", amount: 120000, status: "pending", date: "2025-04-09" },
            { id: 4, customer: "Dewi Anggraini", amount: 500000, status: "completed", date: "2025-04-09" },
            { id: 5, customer: "Eko Prasetyo", amount: 150000, status: "cancelled", date: "2025-04-08" },
          ],
          monthlyRevenue: [
            { month: "Nov 2024", amount: 2500000 },
            { month: "Dec 2024", amount: 1800000 },
            { month: "Jan 2025", amount: 2200000 },
            { month: "Feb 2025", amount: 2800000 },
            { month: "Mar 2025", amount: 3100000 },
            { month: "Apr 2025", amount: 2100000 },
          ],
          categoryStats: [
            { name: "Kacamata", value: 400 },
            { name: "Jam Tangan", value: 300 },
            { name: "Sendal", value: 300 },
            { name: "Aksesoris", value: 200 },
          ],
        }

        // Set state with the fetched data
        setSummary(mockData.summary)
        setOrderStats(mockData.orderStats)
        setRecentOrders(mockData.recentOrders)
        setMonthlyRevenue(mockData.monthlyRevenue)
        setCategoryStats(mockData.categoryStats)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Define colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading dashboard data...</div>
  }

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