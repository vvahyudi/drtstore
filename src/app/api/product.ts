import axios from "@/lib/axios"
import type { Product, ProductFilterParams } from "@/types/api"

export interface ProductFormInput {
	name: string
	slug?: string
	price: number
	description: string
	categoryId: string
	isNew?: boolean
	isFeatured?: boolean
	stock?: number
	details?: {
		material?: string
		fit?: string
		care?: string
		origin?: string
	}
	sizes?: string[]
	colors?: string[]
}

export const productApi = {
	// Get all products with filtering
	async getProducts(filters?: ProductFilterParams) {
		const params = new URLSearchParams()

		if (filters?.categoryId)
			params.append("category", filters.categoryId.toString())
		if (filters?.categorySlug)
			params.append("categorySlug", filters.categorySlug)
		if (filters?.isNew !== undefined)
			params.append("isNew", String(filters.isNew))
		if (filters?.isFeatured !== undefined)
			params.append("isFeatured", String(filters.isFeatured))
		if (filters?.limit) params.append("limit", String(filters.limit))
		if (filters?.offset) params.append("offset", String(filters.offset))
		if (filters?.search) params.append("search", filters.search)
		if (filters?.orderBy) params.append("orderBy", filters.orderBy)
		if (filters?.orderDirection)
			params.append("orderDirection", filters.orderDirection)

		const response = await axios.get(`/products?${params.toString()}`)
		return response.data
	},

	// Get a single product by ID
	async getProduct(id: number) {
		const response = await axios.get(`/products/${id}`)
		return response.data
	},

	// Create a new product
	async createProduct(data: ProductFormInput) {
		const response = await axios.post("/products", data)
		return response.data
	},

	// Update an existing product
	async updateProduct(id: number, data: Partial<ProductFormInput>) {
		const response = await axios.put(`/products/${id}`, data)
		return response.data
	},

	// Delete a product
	async deleteProduct(id: number) {
		const response = await axios.delete(`/products/${id}`)
		return response.data
	},

	// Get product categories
	async getCategories() {
		const response = await axios.get("/products/categories")
		return response.data.categories
	},

	// Upload product image
	async uploadProductImage(
		productId: number,
		file: File,
		isPrimary: boolean = false,
	) {
		const formData = new FormData()
		formData.append("product_id", productId.toString())
		formData.append("image", file)
		formData.append("is_primary", isPrimary.toString())

		const response = await axios.post("/products/images", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		})

		return response.data
	},

	// Set primary image
	async setPrimaryImage(imageId: number) {
		const response = await axios.put(`/products/images/primary?id=${imageId}`)
		return response.data
	},

	// Delete product image
	async deleteProductImage(imageId: number) {
		const response = await axios.delete(`/products/images?id=${imageId}`)
		return response.data
	},
}
