// API Response types
export interface ApiResponse<T> {
	data?: T
	error?: string
	message?: string
}

// Product types
export interface ProductImage {
	id: number
	product_id: number
	image_url: string
	cloudinary_id: string
	is_primary: boolean
}

export interface ProductDetails {
	material: string
	fit: string
	care: string
	origin: string
}

export interface Product {
	id: number
	name: string
	price: number
	image: string
	category: string
	isNew: boolean
	description: string
	details: ProductDetails
	sizes: string[]
	colors: string[]
	images: string[]
}

// Order types
export interface OrderItem {
	id: number
	order_id: number
	product_id: number
	product: Product
	quantity: number
	size?: string
	color?: string
	price: number
}

export interface ShippingAddress {
	address: string
	apartment?: string
	city: string
	state: string
	postal_code: string
	country: string
}

export interface Order {
	id: number
	user_id: string
	status: "pending" | "processing" | "completed" | "cancelled"
	total_amount: number
	shipping_address: ShippingAddress
	payment_method: string
	created_at: string
	items: OrderItem[]
}

// API request types
export interface CreateOrderRequest {
	items: Array<{
		id: number
		quantity: number
		selectedSize?: string
		selectedColor?: string
		price: number
	}>
	shippingAddress: ShippingAddress
	totalAmount: number
	paymentMethod: string
}

export interface ProductFilterParams {
	category?: string
	isNew?: boolean
	limit?: number
	offset?: number
}
