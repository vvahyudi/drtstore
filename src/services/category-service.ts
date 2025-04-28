import apiClient from "@/lib/axios"

export interface Category {
	id: number
	name: string
	slug: string
	description: string
	image_url?: string
	created_at: string
	updated_at?: string
}

export interface CategoryFormData {
	name: string
	description: string
	image_url?: string
}

export interface CategoryQueryParams {
	page?: number
	limit?: number
	search?: string
	sort?: string
}

class CategoryService {
	/**
	 * Get all categories with optional filtering
	 */
	async getAllCategories(
		params: CategoryQueryParams = {},
	): Promise<Category[]> {
		const queryParams = new URLSearchParams()

		if (params.page) queryParams.append("page", params.page.toString())
		if (params.limit) queryParams.append("limit", params.limit.toString())
		if (params.search) queryParams.append("search", params.search)
		if (params.sort) queryParams.append("sort", params.sort)

		const response = await apiClient.get(`/category?${queryParams.toString()}`)
		return response.data.data
	}

	/**
	 * Get category by ID
	 */
	async getCategoryById(id: number): Promise<Category | null> {
		try {
			const response = await apiClient.get(`/category/${id}`)
			return response.data.data
		} catch (error) {
			if (error.response?.status === 404) {
				return null
			}
			throw error
		}
	}

	/**
	 * Get category by slug
	 */
	async getCategoryBySlug(slug: string): Promise<Category | null> {
		try {
			const response = await apiClient.get(`/category/slug/${slug}`)
			return response.data.data
		} catch (error) {
			if (error.response?.status === 404) {
				return null
			}
			throw error
		}
	}

	/**
	 * Create a new category
	 */
	async createCategory(category: CategoryFormData): Promise<Category> {
		const response = await apiClient.post("/category", category)
		return response.data.data
	}

	/**
	 * Update an existing category
	 */
	async updateCategory(
		id: number,
		category: Partial<CategoryFormData>,
	): Promise<Category> {
		const response = await apiClient.patch(`/category/${id}`, category)
		return response.data.data
	}

	/**
	 * Delete a category
	 */
	async deleteCategory(id: number): Promise<boolean> {
		await apiClient.delete(`/category/${id}`)
		return true
	}
}

export const categoryService = new CategoryService()
export default categoryService
