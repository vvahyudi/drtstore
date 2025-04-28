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
	images?: string[]
}

// Filter and search types
export interface ProductQueryParams {
	category?: string
	isNew?: boolean
	isFeatured?: boolean
	search?: string
	page?: number
	limit?: number
	orderBy?: string
	orderDirection?: "asc" | "desc"
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

// Order types
export interface Order {
	id: number
	customer: {
		id: string
		name: string
		email: string
		phone?: string
	}
	items: OrderItem[]
	status: "pending" | "processing" | "completed" | "cancelled"
	shipping_address: Address
	payment_method: string
	total: number
	created_at: string
}

export interface OrderItem {
	id: number
	product_id: number
	product_name: string
	price: number
	quantity: number
	size?: string
	color?: string
}

export interface Address {
	address_line1: string
	address_line2?: string
	city: string
	state: string
	postal_code: string
	country: string
}
