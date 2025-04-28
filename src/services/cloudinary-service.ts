import apiClient from "@/lib/axios"

export interface UploadedImage {
	id: number
	image_url: string
	cloudinary_id: string
	is_primary: boolean
	width?: number
	height?: number
	format?: string
}

class CloudinaryApiService {
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
	): Promise<UploadedImage> {
		try {
			const formData = new FormData()
			formData.append("images", file)

			const response = await apiClient.post(
				`/product-image/${productId}/upload`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				},
			)

			// If this is the first image or isPrimary is true, set it as primary
			const uploadedImage = response.data.data[0]

			if (isPrimary && !uploadedImage.is_primary) {
				await this.setPrimaryImage(productId, uploadedImage.id)
			}

			return uploadedImage
		} catch (error) {
			console.error("Error uploading image:", error)
			throw error
		}
	}

	/**
	 * Set an image as the primary image for a product
	 * @param productId - The ID of the product
	 * @param imageId - The ID of the image to set as primary
	 */
	async setPrimaryImage(
		productId: number,
		imageId: number,
	): Promise<UploadedImage> {
		try {
			const response = await apiClient.patch(
				`/product-image/${productId}/primary/${imageId}`,
			)
			return response.data.data
		} catch (error) {
			console.error("Error setting primary image:", error)
			throw error
		}
	}
}

export const cloudinaryApiService = new CloudinaryApiService()
export default cloudinaryApiService
