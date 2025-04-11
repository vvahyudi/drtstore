export interface CartItem {
	id: string
	name: string
	price: number
	image?: string
	quantity?: number
	selectedSize?: string
	selectedColor?: string
}

export interface CartContextType {
	cartItems: CartItem[]
	addToCart: (item: CartItem) => void
	removeFromCart: (id: string) => void
	updateQuantity: (id: string, quantity: number) => void
	subtotal: number
	clearCart: () => void
}
