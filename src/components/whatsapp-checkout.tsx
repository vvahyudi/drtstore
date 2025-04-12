import React from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Send } from "lucide-react"
import { useCart } from "@/components/cart-provider"

interface WhatsAppCheckoutProps {
	phoneNumber: string
	className?: string
}

export function WhatsAppCheckout({
	phoneNumber,
	className = "",
}: WhatsAppCheckoutProps) {
	const { cartItems, subtotal } = useCart()

	const handleCheckout = () => {
		if (cartItems.length === 0) return

		// Format cart items for WhatsApp message
		const formatPrice = (price: number) => {
			return new Intl.NumberFormat("id-ID", {
				style: "currency",
				currency: "IDR",
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			}).format(price)
		}

		const formattedItems = cartItems
			.map((item) => {
				const itemDetails = [
					`*${item.name}*`,
					`Harga: ${formatPrice(item.price)}`,
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

		const message = `Halo, saya ingin memesan produk berikut:\n\n${formattedItems}\n\n*Total: ${formatPrice(
			subtotal,
		)}*\n\nMohon informasi selanjutnya untuk proses pembayaran. Terima kasih!`

		// Create WhatsApp URL with encoded message
		const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
			message,
		)}`

		// Open WhatsApp in a new tab
		window.open(whatsappUrl, "_blank")
	}

	return (
		<Button
			onClick={handleCheckout}
			className={`bg-green-600 hover:bg-green-700 flex items-center gap-2 ${className}`}
			disabled={cartItems.length === 0}
		>
			<Send className="h-5 w-5" />
			Checkout via WhatsApp
		</Button>
	)
}
