"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Define a type that matches the structure used in your app
type Product = {
	id: number
	name: string
	price: number
	image: string
	category: string
	isNew: boolean
	quantity?: number
	selectedSize?: string
	selectedColor?: string
	sizes?: string[]
	colors?: string[]
}

type CartContextType = {
	cartItems: Product[]
	addToCart: (product: Product) => void
	removeFromCart: (productId: number) => void
	updateQuantity: (productId: number, quantity: number) => void
	clearCart: () => void
	totalItems: number
	subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [cartItems, setCartItems] = useState<Product[]>([])

	// Load cart from localStorage on client side
	useEffect(() => {
		try {
			const savedCart = localStorage.getItem("cart")
			if (savedCart) {
				setCartItems(JSON.parse(savedCart))
			}
		} catch (error) {
			console.error("Failed to parse cart from localStorage:", error)
			// If there's an error, clear the invalid cart data
			localStorage.removeItem("cart")
		}
	}, [])

	// Save cart to localStorage whenever it changes
	useEffect(() => {
		try {
			if (cartItems.length > 0) {
				localStorage.setItem("cart", JSON.stringify(cartItems))
			} else {
				localStorage.removeItem("cart")
			}
		} catch (error) {
			console.error("Failed to save cart to localStorage:", error)
		}
	}, [cartItems])

	const addToCart = (product: Product) => {
		setCartItems((prevItems) => {
			// Make a copy of the product to avoid modifying the original
			const productToAdd = { ...product }

			// Ensure quantity is set
			if (!productToAdd.quantity) {
				productToAdd.quantity = 1
			}

			// Check if product requires size/color but doesn't have them selected
			if (
				(productToAdd.sizes &&
					productToAdd.sizes.length > 0 &&
					!productToAdd.selectedSize) ||
				(productToAdd.colors &&
					productToAdd.colors.length > 0 &&
					!productToAdd.selectedColor)
			) {
				console.warn("Attempted to add product without required size/color")
				return prevItems
			}

			// Find if the product already exists in cart
			const existingItemIndex = prevItems.findIndex((item) => {
				const idMatch = item.id === productToAdd.id

				// For products with selections, check if selections match
				if (productToAdd.selectedSize || productToAdd.selectedColor) {
					const sizeMatch = item.selectedSize === productToAdd.selectedSize
					const colorMatch = item.selectedColor === productToAdd.selectedColor
					return idMatch && sizeMatch && colorMatch
				}

				// For simple products, just match by id if no selections present
				return idMatch && !item.selectedSize && !item.selectedColor
			})

			if (existingItemIndex >= 0) {
				// Update existing item
				const updatedItems = [...prevItems]
				const existingItem = updatedItems[existingItemIndex]
				updatedItems[existingItemIndex] = {
					...existingItem,
					quantity: (existingItem.quantity || 1) + (productToAdd.quantity || 1),
				}
				return updatedItems
			} else {
				// Add new item
				return [...prevItems, productToAdd]
			}
		})
	}

	const removeFromCart = (productId: number) => {
		setCartItems((prevItems) => {
			return prevItems.filter((item) => item.id !== productId)
		})
	}

	const updateQuantity = (productId: number, quantity: number) => {
		if (quantity < 1) return // Don't allow quantities less than 1

		setCartItems((prevItems) =>
			prevItems.map((item) =>
				item.id === productId ? { ...item, quantity } : item,
			),
		)
	}

	const clearCart = () => {
		setCartItems([])
		try {
			localStorage.removeItem("cart")
		} catch (error) {
			console.error("Failed to clear cart from localStorage:", error)
		}
	}

	// Calculate total items in cart
	const totalItems = cartItems.reduce(
		(total, item) => total + (item.quantity || 1),
		0,
	)

	// Calculate subtotal of all items in cart
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
