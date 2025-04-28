import { useQuery } from "@tanstack/react-query"
import adminStatsService from "@/services/admin-stats-service"

// Query keys
export const adminDashboardKeys = {
	all: ["admin", "dashboard"] as const,
	stats: () => [...adminDashboardKeys.all, "stats"] as const,
}

/**
 * Hook for fetching dashboard statistics
 */
export function useAdminDashboardStats() {
	return useQuery({
		queryKey: adminDashboardKeys.stats(),
		queryFn: () => adminStatsService.getDashboardSummary(),
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	})
}
