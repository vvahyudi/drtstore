"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2, ShoppingBag, ArrowLeft, Minus, Plus, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { formatCurrency } from "@/lib/utils"
import { SimpleWhatsAppButton } from "@/components/whatsapp-button"
import { WhatsAppCheckout } from "@/components/whatsapp-checkout"
import { Separator } from "@/components/ui/separator"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function CartPage() {
	const { cartItems, removeFromCart, updateQuantity, subtotal, clearCart } =
		useCart()
	const [isEmptyCartDialogOpen, setIsEmptyCartDialogOpen] = useState(false)
	const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false)

	const phoneNumber = "628175753345"
	const shipping = cartItems.length > 0 ? (subtotal >= 200000 ? 0 : 20000) : 0
	const total = subtotal + shipping

	// Handle quantity change
	const handleQuantityChange = (id: number, newQuantity: number) => {
		if (newQuantity < 1) return
		updateQuantity(id, newQuantity)
	}

	// Handle clear cart confirmation
	const handleClearCart = () => {
		if (cartItems.length === 0) return
		setIsEmptyCartDialogOpen(true)
	}

	// Empty cart
	const confirmClearCart = () => {
		clearCart()
		setIsEmptyCartDialogOpen(false)
	}

	// Format cart items for WhatsApp message
	const createWhatsAppMessage = () => {
		if (cartItems.length === 0) return ""

		const formattedItems = cartItems
			.map((item) => {
				const itemDetails = [
					`*${item.name}*`,
					`Harga: ${formatCurrency(item.price)}`,
					`Jumlah: ${item.quantity || 1}`,
				]

				if (item.selectedSize) {
					itemDetails.push(`Ukuran: ${item.selectedSize}`)
				}

				if (item.selectedColor) {
					itemDetails.push(`Warna: ${item.selectedColor}`)
				}

				return itemDetails.join("\n")
			})
			.join("\n\n")

		const message = `Halo, saya ingin memesan produk berikut:\n\n${formattedItems}\n\n*Subtotal: ${formatCurrency(
			subtotal,
		)}*\n*Pengiriman: ${formatCurrency(shipping)}*\n*Total: ${formatCurrency(
			total,
		)}*\n\nMohon informasi selanjutnya untuk proses pembayaran. Terima kasih!`

		return message
	}

	return (
		<div className="container px-4 py-12 mx-auto">
			<h1 className="text-3xl font-bold mb-10">Shopping Cart</h1>

			{cartItems.length === 0 ? (
				<div className="text-center py-16 flex flex-col items-center">
					<ShoppingBag className="h-16 w-16 text-muted-foreground mb-6" />
					<h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
					<p className="text-muted-foreground mb-8">
						Looks like you haven't added any products to your cart yet.
					</p>
					<Button asChild size="lg">
						<Link href="/products">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Continue Shopping
						</Link>
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
					{/* Cart Items */}
					<div className="lg:col-span-2 space-y-6">
						<div className="border rounded-lg overflow-hidden">
							<table className="w-full">
								<thead className="bg-muted/50">
									<tr>
										<th className="px-4 py-3 text-left font-medium">Product</th>
										<th className="px-4 py-3 text-center font-medium">
											Quantity
										</th>
										<th className="px-4 py-3 text-right font-medium">Price</th>
										<th className="px-4 py-3 text-right font-medium">
											<span className="sr-only">Actions</span>
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{cartItems.map((item) => (
										<tr
											key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
											className="hover:bg-muted/50"
										>
											<td className="px-4 py-4">
												<div className="flex items-center space-x-4">
													<div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
														<Image
															src={item.image || "/placeholder.svg"}
															alt={item.name}
															fill
															className="object-cover"
														/>
													</div>
													<div>
														<h3 className="font-medium">
															<Link
																href={`/products/${item.slug || item.id}`}
																className="hover:underline"
															>
																{item.name}
															</Link>
														</h3>
														{(item.selectedSize || item.selectedColor) && (
															<div className="text-sm text-muted-foreground mt-1">
																{item.selectedSize && (
																	<span className="mr-3">
																		Size: {item.selectedSize}
																	</span>
																)}
																{item.selectedColor && (
																	<span>Color: {item.selectedColor}</span>
																)}
															</div>
														)}
													</div>
												</div>
											</td>
											<td className="px-4 py-4">
												<div className="flex items-center justify-center">
													<Button
														variant="outline"
														size="icon"
														className="h-8 w-8"
														onClick={() =>
															handleQuantityChange(
																item.id,
																(item.quantity || 1) - 1,
															)
														}
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
															handleQuantityChange(
																item.id,
																(item.quantity || 1) + 1,
															)
														}
													>
														<Plus className="h-3 w-3" />
													</Button>
												</div>
											</td>
											<td className="px-4 py-4 text-right font-medium">
												{formatCurrency(item.price * (item.quantity || 1))}
											</td>
											<td className="px-4 py-4 text-right">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => removeFromCart(item.id)}
													aria-label={`Remove ${item.name} from cart`}
												>
													<Trash2 className="h-4 w-4 text-muted-foreground" />
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className="flex justify-between">
							<Button variant="outline" className="flex items-center" asChild>
								<Link href="/products">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Continue Shopping
								</Link>
							</Button>

							<Button
								variant="outline"
								className="text-destructive hover:text-destructive"
								onClick={handleClearCart}
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Empty Cart
							</Button>
						</div>
					</div>

					{/* Order Summary */}
					<div>
						<div className="bg-muted/20 rounded-lg p-6 space-y-6 sticky top-6">
							<h2 className="text-xl font-bold mb-4">Order Summary</h2>

							<div className="space-y-3">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Subtotal</span>
									<span className="font-medium">
										{formatCurrency(subtotal)}
									</span>
								</div>

								<div className="flex justify-between">
									<span className="text-muted-foreground">Shipping</span>
									<span className="font-medium">
										{shipping === 0 ? "Free" : formatCurrency(shipping)}
									</span>
								</div>

								<Separator />

								<div className="flex justify-between text-lg font-bold">
									<span>Total</span>
									<span>{formatCurrency(total)}</span>
								</div>

								{shipping === 0 ? (
									<p className="text-sm text-green-600">
										You qualified for free shipping!
									</p>
								) : (
									<p className="text-sm text-muted-foreground">
										Add {formatCurrency(200000 - subtotal)} more to qualify for
										free shipping.
									</p>
								)}
							</div>

							<div className="pt-4 space-y-3">
								<Button
									className="w-full"
									size="lg"
									onClick={() => setIsCheckoutDialogOpen(true)}
								>
									Proceed to Checkout
								</Button>

								<SimpleWhatsAppButton
									phoneNumber={phoneNumber}
									message={createWhatsAppMessage()}
									size="lg"
									className="w-full bg-green-600 hover:bg-green-700"
								>
									<Send className="mr-2 h-4 w-4" />
									Checkout via WhatsApp
								</SimpleWhatsAppButton>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Empty Cart Confirmation Dialog */}
			<AlertDialog
				open={isEmptyCartDialogOpen}
				onOpenChange={setIsEmptyCartDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Empty your cart?</AlertDialogTitle>
						<AlertDialogDescription>
							This will remove all items from your cart. Are you sure you want
							to continue?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmClearCart}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Empty Cart
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Checkout Dialog */}
			<AlertDialog
				open={isCheckoutDialogOpen}
				onOpenChange={setIsCheckoutDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Complete Your Order</AlertDialogTitle>
						<AlertDialogDescription>
							Currently, our checkout process is handled through WhatsApp for a
							more personalized service. Click below to continue with your
							order.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className="flex-col sm:flex-row gap-2">
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<WhatsAppCheckout
							phoneNumber={phoneNumber}
							className="sm:w-auto w-full"
						/>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
