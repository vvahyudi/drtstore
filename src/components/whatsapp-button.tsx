import { Button } from "@/components/ui/button"

interface SimpleWhatsAppButtonProps {
	phoneNumber: string
	message?: string
	children: React.ReactNode
	size?: "default" | "sm" | "lg" | "icon"
	variant?: "default" | "outline" | "ghost" // dan variant lainnya
	className?: string
}

export function SimpleWhatsAppButton({
	phoneNumber,
	message = "Halo, saya tertarik dengan produk Anda",
	children,
	size,
	variant,
	className,
}: SimpleWhatsAppButtonProps) {
	const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
		message,
	)}`

	return (
		<Button asChild size={size} variant={variant} className={className}>
			<a
				href={whatsappUrl}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Chat via WhatsApp"
			>
				{children}
			</a>
		</Button>
	)
}
