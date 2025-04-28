// src/hooks/use-products.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import productApiService from "@/services/product-service"
import { Product, ProductFormData, ProductQueryParams } from "@/types/api"
import { toast } from "sonner"

// Query keys
export const productKeys = {
	all: ["products"] as const,
	lists: () => [...productKeys.all, "list"] as const,
	list: (filters: ProductQueryParams) =>
		[...productKeys.lists(), filters] as const,
	details: () => [...productKeys.all, "detail"] as const,
	detail: (id: number) => [...productKeys.details(), id] as const,
	bySlug: (slug: string) => [...productKeys.details(), "slug", slug] as const,
	featured: () => [...productKeys.lists(), "featured"] as const,
	new: () => [...productKeys.lists(), "new"] as const,
}

/**
 * Hook for fetching products with optional filtering
 */
export function useProducts(params: ProductQueryParams = {}) {
	return useQuery({
		queryKey: productKeys.list(params),
		queryFn: () => productApiService.getAllProducts(params),
	})
}

/**
 * Hook for fetching a product by ID
 */
export function useProduct(id: number | null) {
	return useQuery({
		queryKey: productKeys.detail(id || 0),
		queryFn: () => productApiService.getProductById(id || 0),
		enabled: !!id,
	})
}

/**
 * Hook for fetching a product by slug
 */
export function useProductBySlug(slug: string | null) {
	return useQuery({
		queryKey: productKeys.bySlug(slug || ""),
		queryFn: () => productApiService.getProductBySlug(slug || ""),
		enabled: !!slug,
	})
}

/**
 * Hook for fetching featured products
 */
export function useFeaturedProducts(limit = 4) {
	return useQuery({
		queryKey: productKeys.featured(),
		queryFn: () => productApiService.getFeaturedProducts(limit),
	})
}

/**
 * Hook for fetching new products
 */
export function useNewProducts(limit = 4) {
	return useQuery({
		queryKey: productKeys.new(),
		queryFn: () => productApiService.getNewProducts(limit),
	})
}

/**
 * Hook for searching products
 */
export function useSearchProducts(searchTerm: string, limit = 10) {
	return useQuery({
		queryKey: [...productKeys.lists(), "search", searchTerm],
		queryFn: () => productApiService.searchProducts(searchTerm, limit),
		enabled: searchTerm.trim().length > 0,
	})
}

/**
 * Hook for creating a product
 */
export function useCreateProduct() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: ProductFormData) =>
			productApiService.createProduct(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: productKeys.lists() })
			toast.success("Product created successfully")
		},
		onError: (error) => {
			console.error("Failed to create product:", error)
			toast.error("Failed to create product")
		},
	})
}

/**
 * Hook for updating a product
 */
export function useUpdateProduct() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number
			data: Partial<ProductFormData>
		}) => productApiService.updateProduct(id, data),
		onSuccess: (updatedProduct) => {
			queryClient.invalidateQueries({ queryKey: productKeys.lists() })
			queryClient.invalidateQueries({
				queryKey: productKeys.detail(updatedProduct.id),
			})
			toast.success("Product updated successfully")
		},
		onError: (error) => {
			console.error("Failed to update product:", error)
			toast.error("Failed to update product")
		},
	})
}

/**
 * Hook for deleting a product
 */
export function useDeleteProduct() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: number) => productApiService.deleteProduct(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: productKeys.lists() })
			toast.success("Product deleted successfully")
		},
		onError: (error) => {
			console.error("Failed to delete product:", error)
			toast.error("Failed to delete product")
		},
	})
}
