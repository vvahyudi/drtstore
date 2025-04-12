// API Response types
export interface ApiResponse<T> {
	data?: T
	error?: string
	message?: string
	pagination?: Pagination
}

export interface Pagination {
	total: number
	page: number
	limit: number
	totalPages: number
}

// Product types
export interface ProductImage {
	id: number
	product_id: number
	image_url: string
	cloudinary_id: string
	is_primary: boolean
	width?: number
	height?: number
	format?: string
}

export interface ProductDetails {
	material?: string
	fit?: string
	care?: string
	origin?: string
}

export interface Product {
	id: number
	name: string
	slug: string
	price: number
	image: string
	category: string
	isNew: boolean
	isFeatured?: boolean
	stock?: number
	description: string
	details: ProductDetails
	sizes: string[]
	colors: string[]
	images: string[]
	quantity?: number
	selectedSize?: string
	selectedColor?: string
}

// Filter and search types
export interface ProductFilter {
	category?: string
	isNew?: boolean
	isFeatured?: boolean
	minPrice?: number
	maxPrice?: number
	sizes?: string[]
	colors?: string[]
	search?: string
}

// Cart types
export interface CartItem extends Product {
	quantity: number
	selectedSize?: string
	selectedColor?: string
}

export interface CartSummary {
	subtotal: number
	shipping: number
	total: number
}
