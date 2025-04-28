import apiClient from "@/lib/axios"
import { Product, ProductFormData, ProductQueryParams } from "@/types/api"

class ProductApiService {
	/**
	 * Get all products with optional filtering
	 */
	async getAllProducts(params: ProductQueryParams = {}): Promise<Product[]> {
		// Convert params to query string parameters
		const queryParams = new URLSearchParams()

		if (params.page) queryParams.append("page", params.page.toString())
		if (params.limit) queryParams.append("limit", params.limit.toString())
		if (params.category) queryParams.append("category", params.category)
		if (params.search) queryParams.append("search", params.search)

		// Handle sort parameter (format: field.direction)
		if (params.orderBy) {
			const direction = params.orderDirection || "asc"
			queryParams.append("sort", `${params.orderBy}.${direction}`)
		}

		if (params.isNew !== undefined)
			queryParams.append("isNew", params.isNew.toString())
		if (params.isFeatured !== undefined)
			queryParams.append("isFeatured", params.isFeatured.toString())

		const response = await apiClient.get(`/product?${queryParams.toString()}`)
		return response.data.data
	}

	/**
	 * Get product by ID
	 */
	async getProductById(id: number): Promise<Product | null> {
		try {
			const response = await apiClient.get(`/product/${id}`)
			return response.data.data
		} catch (error) {
			if (error.response?.status === 404) {
				return null
			}
			throw error
		}
	}

	/**
	 * Get product by slug
	 */
	async getProductBySlug(slug: string): Promise<Product | null> {
		try {
			const response = await apiClient.get(`/product/slug/${slug}`)
			return response.data.data
		} catch (error) {
			if (error.response?.status === 404) {
				return null
			}
			throw error
		}
	}

	/**
	 * Create a new product
	 */
	async createProduct(product: ProductFormData): Promise<Product> {
		const response = await apiClient.post("/product", product)
		return response.data.data
	}

	/**
	 * Update an existing product
	 */
	async updateProduct(
		id: number,
		product: Partial<ProductFormData>,
	): Promise<Product> {
		const response = await apiClient.patch(`/product/${id}`, product)
		return response.data.data
	}

	/**
	 * Delete a product
	 */
	async deleteProduct(id: number): Promise<boolean> {
		await apiClient.delete(`/product/${id}`)
		return true
	}

	/**
	 * Get featured products
	 */
	async getFeaturedProducts(limit = 8): Promise<Product[]> {
		const params = new URLSearchParams()
		params.append("isFeatured", "true")
		params.append("limit", limit.toString())

		const response = await apiClient.get(`/product?${params.toString()}`)
		return response.data.data
	}

	/**
	 * Get new products
	 */
	async getNewProducts(limit = 8): Promise<Product[]> {
		const params = new URLSearchParams()
		params.append("isNew", "true")
		params.append("limit", limit.toString())

		const response = await apiClient.get(`/product?${params.toString()}`)
		return response.data.data
	}

	/**
	 * Search products
	 */
	async searchProducts(searchTerm: string, limit = 10): Promise<Product[]> {
		const params = new URLSearchParams()
		params.append("search", searchTerm)
		params.append("limit", limit.toString())

		const response = await apiClient.get(`/product?${params.toString()}`)
		return response.data.data
	}
}

export const productApiService = new ProductApiService()
export default productApiService
