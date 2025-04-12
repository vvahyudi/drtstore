"use client"

import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, ShoppingBag, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/cart-provider"
import { WhatsAppCheckout } from "@/components/whatsapp-checkout"

export default function CartPage() {
	const { cartItems, removeFromCart, updateQuantity, subtotal, clearCart } =
		useCart()

	// Replace with your WhatsApp phone number (without '+' symbol)
	const phoneNumber = "628175753345"

	if (!cartItems || cartItems.length === 0) {
		return (
			<div className="container px-4 py-12 mx-auto">
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
					<h1 className="text-2xl font-bold">Your cart is empty</h1>
					<p className="text-muted-foreground mt-2">
						Looks like you haven&apos;t added anything to your cart yet.
					</p>
					<Button asChild className="mt-6">
						<Link href="/products">Continue Shopping</Link>
					</Button>
				</div>
			</div>
		)
	}

	const handleRemoveItem = (itemId: number) => {
		removeFromCart(itemId)
	}

	const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
		if (newQuantity < 1) return
		updateQuantity(itemId, newQuantity)
	}

	// Format price in IDR
	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price)
	}

	return (
		<div className="container px-4 py-12 mx-auto">
			<h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 space-y-4">
					{cartItems.map((item) => (
						<Card key={item.id} className="overflow-hidden">
							<CardContent className="p-0">
								<div className="flex flex-col sm:flex-row">
									<div className="relative w-full sm:w-[120px] h-[120px]">
										<Image
											src={item.image || "/placeholder.svg"}
											alt={item.name}
											fill
											className="object-cover"
											sizes="(max-width: 768px) 100vw, 120px"
											priority={false}
										/>
									</div>
									<div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center">
										<div className="flex-1">
											<h3 className="font-medium">{item.name}</h3>
											<p className="text-sm text-muted-foreground mt-1">
												{formatPrice(item.price)}
											</p>
											{item.selectedSize && (
												<p className="text-sm text-muted-foreground">
													Size: {item.selectedSize}
												</p>
											)}
											{item.selectedColor && (
												<p className="text-sm text-muted-foreground">
													Color: {item.selectedColor}
												</p>
											)}
										</div>
										<div className="flex items-center mt-4 sm:mt-0">
											<Button
												variant="outline"
												size="icon"
												className="h-8 w-8"
												onClick={() =>
													handleUpdateQuantity(
														item.id,
														Math.max(1, (item.quantity || 1) - 1),
													)
												}
												disabled={(item.quantity || 1) <= 1}
											>
												<Minus className="h-3 w-3" />
											</Button>
											<span className="w-10 text-center">
												{item.quantity || 1}
											</span>
											<Button
												variant="outline"
												size="icon"
												className="h-8 w-8"
												onClick={() =>
													handleUpdateQuantity(
														item.id,
														(item.quantity || 1) + 1,
													)
												}
											>
												<Plus className="h-3 w-3" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 ml-2"
												onClick={() => handleRemoveItem(item.id)}
											>
												<Trash className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}

					<div className="flex justify-between items-center">
						<Button variant="outline" onClick={clearCart}>
							Clear Cart
						</Button>
						<Button asChild variant="outline">
							<Link href="/products">Continue Shopping</Link>
						</Button>
					</div>
				</div>

				<div>
					<Card>
						<CardHeader>
							<CardTitle>Order Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex justify-between">
								<span>Subtotal</span>
								<span>{formatPrice(subtotal)}</span>
							</div>
							<div className="flex justify-between">
								<span>Shipping</span>
								<span>Calculated during checkout</span>
							</div>
							<div className="flex justify-between">
								<span>Tax</span>
								<span>Calculated during checkout</span>
							</div>
							<Separator />
							<div className="flex justify-between font-bold">
								<span>Total</span>
								<span>{formatPrice(subtotal)}</span>
							</div>
						</CardContent>
						<CardFooter>
							<WhatsAppCheckout phoneNumber={phoneNumber} className="w-full" />
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	)
}
