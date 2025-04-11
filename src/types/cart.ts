/**
 * Types for the shopping cart functionality
 */

export interface CartItem {
	id: number
	name: string
	price: number
	image: string
	quantity?: number
	selectedSize?: string
	selectedColor?: string
	category: string
	isNew: boolean
	sizes?: string[]
	colors?: string[]
}

export interface CartContextType {
	cartItems: CartItem[]
	addToCart: (item: CartItem) => void
	removeFromCart: (id: number) => void
	updateQuantity: (id: number, quantity: number) => void
	subtotal: number
	clearCart: () => void
	totalItems: number
}
