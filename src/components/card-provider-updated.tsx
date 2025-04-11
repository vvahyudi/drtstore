"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { Product } from "@/types/api"

type CartProduct = Product & {
	quantity?: number
	selectedSize?: string
	selectedColor?: string
}

type CartContextType = {
	cartItems: CartProduct[]
	addToCart: (product: CartProduct) => void
	removeFromCart: (productId: number) => void
	updateQuantity: (productId: number, quantity: number) => void
	clearCart: () => void
	totalItems: number
	subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [cartItems, setCartItems] = useState<CartProduct[]>([])

	// Load cart from localStorage on client side
	useEffect(() => {
		const savedCart = localStorage.getItem("cart")
		if (savedCart) {
			try {
				setCartItems(JSON.parse(savedCart))
			} catch (error) {
				console.error("Failed to parse cart from localStorage:", error)
			}
		}
	}, [])

	// Save cart to localStorage whenever it changes
	useEffect(() => {
		if (cartItems.length > 0) {
			localStorage.setItem("cart", JSON.stringify(cartItems))
		} else {
			localStorage.removeItem("cart")
		}
	}, [cartItems])

	const addToCart = (product: CartProduct) => {
		setCartItems((prevItems) => {
			// Check if product requires size/color but doesn't have them selected
			if (
				(product.sizes?.length > 0 && !product.selectedSize) ||
				(product.colors?.length > 0 && !product.selectedColor)
			) {
				console.warn("Attempted to add product without required size/color")
				return prevItems
			}

			const existingItemIndex = prevItems.findIndex(
				(item) =>
					item.id === product.id &&
					item.selectedSize === product.selectedSize &&
					item.selectedColor === product.selectedColor,
			)

			if (existingItemIndex >= 0) {
				// Update existing item
				const updatedItems = [...prevItems]
				const existingItem = updatedItems[existingItemIndex]
				updatedItems[existingItemIndex] = {
					...existingItem,
					quantity: (existingItem.quantity || 1) + (product.quantity || 1),
				}
				return updatedItems
			} else {
				// Add new item
				return [...prevItems, { ...product, quantity: product.quantity || 1 }]
			}
		})
	}

	const removeFromCart = (productId: number) => {
		setCartItems((prevItems) => {
			const updatedItems = prevItems.filter((item) => item.id !== productId)
			return updatedItems
		})
	}

	const updateQuantity = (productId: number, quantity: number) => {
		if (quantity < 1) return

		setCartItems((prevItems) =>
			prevItems.map((item) =>
				item.id === productId ? { ...item, quantity } : item,
			),
		)
	}

	const clearCart = () => {
		setCartItems([])
		localStorage.removeItem("cart")
	}

	const totalItems = cartItems.reduce(
		(total, item) => total + (item.quantity || 1),
		0,
	)

	const subtotal = cartItems.reduce(
		(total, item) => total + item.price * (item.quantity || 1),
		0,
	)

	return (
		<CartContext.Provider
			value={{
				cartItems,
				addToCart,
				removeFromCart,
				updateQuantity,
				clearCart,
				totalItems,
				subtotal,
			}}
		>
			{children}
		</CartContext.Provider>
	)
}

export function useCart() {
	const context = useContext(CartContext)
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider")
	}
	return context
}
