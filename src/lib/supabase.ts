import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for Supabase tables
export type Product = {
	id: number
	name: string
	price: number
	description: string
	category: string
	is_new: boolean
	details: {
		material: string
		fit: string
		care: string
		origin: string
	}
	sizes: string[]
	colors: string[]
	created_at: string
}

export type ProductImage = {
	id: number
	product_id: number
	image_url: string
	cloudinary_id: string
	is_primary: boolean
	created_at: string
}

export type User = {
	id: string
	email: string
	full_name?: string
	avatar_url?: string
	created_at: string
}

export type Order = {
	id: number
	user_id: string
	status: "pending" | "processing" | "completed" | "cancelled"
	total_amount: number
	shipping_address: {
		address: string
		city: string
		state: string
		postal_code: string
		country: string
	}
	payment_method: string
	created_at: string
}

export type OrderItem = {
	id: number
	order_id: number
	product_id: number
	quantity: number
	size?: string
	color?: string
	price: number
	created_at: string
}
