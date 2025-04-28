import axios from "@/lib/axios"

export interface Category {
	name: string
}

export const categoryApi = {
	// Get all categories
	async getCategories() {
		const response = await axios.get("/categories")
		return response.data.categories
	},

	// Create a new category
	async createCategory(name: string) {
		const response = await axios.post("/categories", { name })
		return response.data
	},

	// Delete a category
	// Note: This would require a proper categories table in a real app
	async deleteCategory(name: string) {
		// This is a placeholder since we don't have a proper category deletion endpoint
		// In a real app, you would have a DELETE /categories/:id endpoint
		const response = await axios.delete(
			`/categories?name=${encodeURIComponent(name)}`,
		)
		return response.data
	},
}
