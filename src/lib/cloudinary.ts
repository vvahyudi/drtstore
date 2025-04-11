import {
	v2 as cloudinary,
	UploadApiOptions,
	UploadApiResponse,
} from "cloudinary"

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	secure: true,
})

// Improved type definitions
export interface CloudinaryContext {
	[key: string]: string | { [key: string]: string }
}

export interface UploadResult {
	public_id: string
	secure_url: string
	format: string
	width: number
	height: number
	resource_type: "image" | "video" | "raw"
	created_at: string
	bytes: number
	tags?: string[]
	context?: CloudinaryContext
	metadata?: Record<string, any>
}

export interface DeleteResult {
	success: boolean
	result: string
}

type ResourceType = "image" | "video" | "raw" | "auto"

interface UploadOptions extends UploadApiOptions {
	folder?: string
	resource_type?: ResourceType
	transformation?: any[]
	tags?: string[]
	context?: CloudinaryContext
	overwrite?: boolean
	unique_filename?: boolean
	allowed_formats?: string[]
	metadata?: Record<string, any>
}

/**
 * Upload media to Cloudinary with proper typing
 */
export async function uploadMedia(
	file: Buffer | string,
	options: UploadOptions = {},
): Promise<UploadResult> {
	const defaultOptions: UploadOptions = {
		folder: "drt-store",
		resource_type: "image",
		overwrite: false,
		unique_filename: true,
	}

	const uploadOptions: UploadApiOptions = {
		...defaultOptions,
		...options,
	}

	try {
		let result: UploadApiResponse

		if (Buffer.isBuffer(file)) {
			result = await new Promise<UploadApiResponse>((resolve, reject) => {
				const uploadStream = cloudinary.uploader.upload_stream(
					uploadOptions,
					(error, result) => {
						if (error) reject(error)
						else if (!result)
							reject(new Error("Upload failed: No result returned"))
						else resolve(result)
					},
				)
				uploadStream.end(file)
			})
		} else {
			result = await cloudinary.uploader.upload(file, uploadOptions)
		}

		// Type-safe transformation of the response
		const uploadResult: UploadResult = {
			public_id: result.public_id,
			secure_url: result.secure_url,
			format: result.format,
			width: result.width,
			height: result.height,
			resource_type: result.resource_type as "image" | "video" | "raw",
			created_at: result.created_at,
			bytes: result.bytes,
		}

		// Optional fields
		if (result.tags) uploadResult.tags = result.tags
		if (result.context)
			uploadResult.context = result.context as CloudinaryContext
		if (result.metadata) uploadResult.metadata = result.metadata

		return uploadResult
	} catch (error) {
		console.error("Cloudinary upload error:", error)
		throw new Error(
			`Failed to upload media: ${
				error instanceof Error ? error.message : String(error)
			}`,
		)
	}
}

/**
 * Enhanced media deletion with better typing and error handling
 * @param publicId The public ID of the media to delete
 * @param options Deletion options
 */
export async function deleteMedia(
	publicId: string,
	options: {
		resource_type?: ResourceType
		invalidate?: boolean
	} = {},
): Promise<DeleteResult> {
	const defaultOptions = {
		resource_type: "image",
		invalidate: true, // CDN cache invalidation
	}

	const deleteOptions = { ...defaultOptions, ...options }

	try {
		const result = await new Promise<{ result: string }>((resolve, reject) => {
			cloudinary.uploader.destroy(publicId, deleteOptions, (error, result) => {
				if (error) reject(error)
				else resolve(result as { result: string })
			})
		})

		return {
			success: result.result === "ok",
			result: result.result,
		}
	} catch (error) {
		console.error("Cloudinary deletion error:", error)
		throw new Error(
			`Failed to delete media: ${
				error instanceof Error ? error.message : String(error)
			}`,
		)
	}
}
/**
 * Generate a secure URL for media with transformations
 */
export function generateMediaUrl(
	publicId: string,
	transformations?: Record<string, any>,
	options: {
		resource_type?: ResourceType
		format?: string
		secure?: boolean
	} = {},
): string {
	const config = {
		resource_type: options.resource_type || "image",
		secure: options.secure !== false,
		format: options.format,
		...transformations,
	}

	return cloudinary.url(publicId, config)
}

/**
 * List resources in a folder with pagination
 */
export async function listResources(
	options: {
		folder?: string
		resource_type?: ResourceType
		max_results?: number
		next_cursor?: string
	} = {},
): Promise<{
	resources: UploadResult[]
	next_cursor?: string
}> {
	const defaultOptions = {
		resource_type: "image",
		max_results: 10,
	}

	const listOptions = { ...defaultOptions, ...options }

	try {
		const result = await cloudinary.api.resources(listOptions)

		return {
			resources: result.resources.map((resource: any) => ({
				public_id: resource.public_id,
				secure_url: resource.secure_url,
				format: resource.format,
				width: resource.width,
				height: resource.height,
				resource_type: resource.resource_type,
				created_at: resource.created_at,
				bytes: resource.bytes,
			})),
			next_cursor: result.next_cursor,
		}
	} catch (error) {
		console.error("Cloudinary list resources error:", error)
		throw new Error(
			`Failed to list resources: ${
				error instanceof Error ? error.message : String(error)
			}`,
		)
	}
}
// Rest of your functions (deleteMedia, generateMediaUrl, listResources) remain the same
// with the updated types applied consistently
