// src/hooks/use-categories.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import categoryService, {
	Category,
	CategoryFormData,
	CategoryQueryParams,
} from "@/services/category-service"
import { toast } from "sonner"

// Query keys
export const categoryKeys = {
	all: ["categories"] as const,
	lists: () => [...categoryKeys.all, "list"] as const,
	list: (filters: CategoryQueryParams) =>
		[...categoryKeys.lists(), filters] as const,
	details: () => [...categoryKeys.all, "detail"] as const,
	detail: (id: number) => [...categoryKeys.details(), id] as const,
	bySlug: (slug: string) => [...categoryKeys.details(), "slug", slug] as const,
}

/**
 * Hook for fetching categories with optional filtering
 */
export function useCategories(params: CategoryQueryParams = {}) {
	return useQuery({
		queryKey: categoryKeys.list(params),
		queryFn: () => categoryService.getAllCategories(params),
	})
}

/**
 * Hook for fetching a category by ID
 */
export function useCategory(id: number | null) {
	return useQuery({
		queryKey: categoryKeys.detail(id || 0),
		queryFn: () => categoryService.getCategoryById(id || 0),
		enabled: !!id,
	})
}

/**
 * Hook for fetching a category by slug
 */
export function useCategoryBySlug(slug: string | null) {
	return useQuery({
		queryKey: categoryKeys.bySlug(slug || ""),
		queryFn: () => categoryService.getCategoryBySlug(slug || ""),
		enabled: !!slug,
	})
}

/**
 * Hook for creating a category
 */
export function useCreateCategory() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CategoryFormData) =>
			categoryService.createCategory(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
			toast.success("Category created successfully")
		},
		onError: (error) => {
			console.error("Failed to create category:", error)
			toast.error("Failed to create category")
		},
	})
}

/**
 * Hook for updating a category
 */
export function useUpdateCategory() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number
			data: Partial<CategoryFormData>
		}) => categoryService.updateCategory(id, data),
		onSuccess: (updatedCategory) => {
			queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
			queryClient.invalidateQueries({
				queryKey: categoryKeys.detail(updatedCategory.id),
			})
			toast.success("Category updated successfully")
		},
		onError: (error) => {
			console.error("Failed to update category:", error)
			toast.error("Failed to update category")
		},
	})
}

/**
 * Hook for deleting a category
 */
export function useDeleteCategory() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: number) => categoryService.deleteCategory(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
			toast.success("Category deleted successfully")
		},
		onError: (error) => {
			console.error("Failed to delete category:", error)
			toast.error("Failed to delete category")
		},
	})
}
