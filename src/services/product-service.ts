import { supabase } from "@/lib/supabase"
import { Product, ProductImage } from "@/types/api"

export interface ProductQueryParams {
	category?: string
	isNew?: boolean
	isFeatured?: boolean
	limit?: number
	offset?: number
	search?: string
	orderBy?: string
	orderDirection?: "asc" | "desc"
}

/**
 * Interface for product creation and updates
 */
export interface ProductFormData {
	name: string
	slug?: string
	price: number
	description: string
	category: string
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

/**
 * Product Service - Handles all product-related data operations
 */
export const ProductService = {
	/**
	 * Get all products with optional filtering
	 */
	async getAllProducts(params: ProductQueryParams = {}): Promise<Product[]> {
		try {
			let query = supabase.from("products").select(`
          *,
          images:product_images(*)
        `)

			// Apply filters if provided
			if (params.category) {
				query = query.eq("category", params.category)
			}

			if (params.isNew !== undefined) {
				query = query.eq("is_new", params.isNew)
			}

			if (params.isFeatured !== undefined) {
				query = query.eq("is_featured", params.isFeatured)
			}

			if (params.search) {
				query = query.or(
					`name.ilike.%${params.search}%,description.ilike.%${params.search}%`,
				)
			}

			// Apply pagination
			if (params.limit) {
				query = query.limit(params.limit)
			}

			if (params.offset) {
				query = query.range(
					params.offset,
					params.offset + (params.limit || 100) - 1,
				)
			}

			// Apply ordering
			if (params.orderBy) {
				query = query.order(params.orderBy, {
					ascending: params.orderDirection === "asc",
				})
			} else {
				query = query.order("created_at", { ascending: false })
			}

			const { data, error } = await query

			if (error) {
				console.error("Error fetching products:", error)
				throw error
			}

			// Transform the data to match the Product interface
			return data.map((item) => transformProductData(item))
		} catch (error) {
			console.error("Product service error:", error)
			throw error
		}
	},

	/**
	 * Get featured products
	 */
	async getFeaturedProducts(limit = 8): Promise<Product[]> {
		return this.getAllProducts({
			isFeatured: true,
			limit,
			orderBy: "created_at",
			orderDirection: "desc",
		})
	},

	/**
	 * Get new products
	 */
	async getNewProducts(limit = 8): Promise<Product[]> {
		return this.getAllProducts({
			isNew: true,
			limit,
			orderBy: "created_at",
			orderDirection: "desc",
		})
	},

	/**
	 * Get a single product by ID
	 */
	async getProductById(id: number): Promise<Product | null> {
		try {
			const { data, error } = await supabase
				.from("products")
				.select(
					`
          *,
          images:product_images(*)
        `,
				)
				.eq("id", id)
				.single()

			if (error) {
				if (error.code === "PGRST116") {
					// Product not found
					return null
				}
				console.error("Error fetching product:", error)
				throw error
			}

			return transformProductData(data)
		} catch (error) {
			console.error("Product service error:", error)
			throw error
		}
	},

	/**
	 * Get a single product by slug
	 */
	async getProductBySlug(slug: string): Promise<Product | null> {
		try {
			const { data, error } = await supabase
				.from("products")
				.select(
					`
          *,
          images:product_images(*)
        `,
				)
				.eq("slug", slug)
				.single()

			if (error) {
				if (error.code === "PGRST116") {
					// Product not found
					return null
				}
				console.error("Error fetching product:", error)
				throw error
			}

			return transformProductData(data)
		} catch (error) {
			console.error("Product service error:", error)
			throw error
		}
	},

	/**
	 * Search products
	 */
	async searchProducts(query: string, limit = 10): Promise<Product[]> {
		return this.getAllProducts({
			search: query,
			limit,
		})
	},

	/**
	 * Create a new product
	 */
	async createProduct(productData: Partial<Product>): Promise<Product> {
		try {
			// Extract images from the data to handle separately
			const { images, ...productInfo } = productData

			// Insert the product
			const { data, error } = await supabase
				.from("products")
				.insert(productInfo)
				.select()
				.single()

			if (error) {
				console.error("Error creating product:", error)
				throw error
			}

			// Return the created product (images will be handled separately)
			return {
				...transformProductData(data),
				images: [],
			}
		} catch (error) {
			console.error("Product service error:", error)
			throw error
		}
	},

	/**
	 * Update an existing product
	 */
	async updateProduct(
		id: number,
		productData: Partial<Product>,
	): Promise<Product> {
		try {
			// Extract images from the data to handle separately
			const { images, ...productInfo } = productData

			// Update the product
			const { data, error } = await supabase
				.from("products")
				.update(productInfo)
				.eq("id", id)
				.select()
				.single()

			if (error) {
				console.error("Error updating product:", error)
				throw error
			}

			// Fetch the images to include in the response
			const { data: imageData } = await supabase
				.from("product_images")
				.select("*")
				.eq("product_id", id)

			// Return the updated product with its images
			return {
				...transformProductData(data),
				images: imageData?.map((img) => img.image_url) || [],
			}
		} catch (error) {
			console.error("Product service error:", error)
			throw error
		}
	},

	/**
	 * Delete a product
	 */
	async deleteProduct(id: number): Promise<boolean> {
		try {
			// Fetch images first (for Cloudinary cleanup)
			const { data: images } = await supabase
				.from("product_images")
				.select("cloudinary_id")
				.eq("product_id", id)

			// Delete the product (will cascade delete images in DB)
			const { error } = await supabase.from("products").delete().eq("id", id)

			if (error) {
				console.error("Error deleting product:", error)
				throw error
			}

			// Return the Cloudinary IDs for cleanup
			return true
		} catch (error) {
			console.error("Product service error:", error)
			throw error
		}
	},

	/**
	 * Get product categories
	 */
	async getCategories(): Promise<string[]> {
		try {
			const { data, error } = await supabase
				.from("products")
				.select("category")
				.not("category", "is", null)

			if (error) {
				console.error("Error fetching categories:", error)
				throw error
			}

			// Extract unique categories
			const categories = [...new Set(data.map((item) => item.category))]
			return categories
		} catch (error) {
			console.error("Product service error:", error)
			throw error
		}
	},
}

/**
 * Transform the raw database product data to match the Product interface
 */
function transformProductData(data: any): Product {
	return {
		id: data.id,
		name: data.name,
		slug: data.slug || "",
		price: data.price,
		description: data.description || "",
		category: data.category,
		isNew: data.is_new || false,
		isFeatured: data.is_featured || false,
		stock: data.stock || 0,
		image:
			data.images?.find((img: any) => img.is_primary)?.image_url ||
			(data.images && data.images.length > 0
				? data.images[0]?.image_url
				: "/placeholder.svg"),
		images: data.images?.map((img: any) => img.image_url) || [],
		details: data.details || {
			material: "",
			fit: "",
			care: "",
			origin: "",
		},
		sizes: data.sizes || [],
		colors: data.colors || [],
	}
}
