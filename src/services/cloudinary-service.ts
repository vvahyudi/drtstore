/**
 * CloudinaryService - Handles all image upload operations
 * Uses the server-side API routes for secure handling of uploads
 */
export const CloudinaryService = {
	/**
	 * Upload a product image
	 * @param productId - The ID of the product
	 * @param file - The image file to upload
	 * @param isPrimary - Whether this should be set as the primary image
	 */
	async uploadProductImage(
		productId: number,
		file: File,
		isPrimary: boolean = false,
	): Promise<{
		id: number
		image_url: string
		cloudinary_id: string
		is_primary: boolean
	}> {
		try {
			const formData = new FormData()
			formData.append("product_id", productId.toString())
			formData.append("image", file)
			formData.append("is_primary", isPrimary.toString())

			const response = await fetch("/api/products/images", {
				method: "POST",
				body: formData,
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || "Failed to upload image")
			}

			const result = await response.json()
			return result.image
		} catch (error) {
			console.error("Error uploading image:", error)
			throw error
		}
	},

	/**
	 * Delete a product image
	 * @param imageId - The ID of the image record
	 */
	async deleteProductImage(imageId: number): Promise<boolean> {
		try {
			const response = await fetch(`/api/products/images?id=${imageId}`, {
				method: "DELETE",
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || "Failed to delete image")
			}

			return true
		} catch (error) {
			console.error("Error deleting image:", error)
			throw error
		}
	},

	/**
	 * Set an image as the primary image for a product
	 * @param imageId - The ID of the image to set as primary
	 */
	async setPrimaryImage(imageId: number): Promise<boolean> {
		try {
			const response = await fetch(
				`/api/products/images/primary?id=${imageId}`,
				{
					method: "PUT",
				},
			)

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || "Failed to set primary image")
			}

			return true
		} catch (error) {
			console.error("Error setting primary image:", error)
			throw error
		}
	},
}
