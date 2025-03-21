import Image from "next/image"
import Link from "next/link"

const WhatsAppButton = () => {
	return (
		<Link
			href={`https://wa.me/628175753345`}
			target="_blank"
			className="flex bottom-0 right-0 p-8 fixed z-10 "
		>
			<Image
				src={`/whatsapp-logo.png`}
				alt="WhatsApp Logo"
				width={200}
				height={200}
				className="scale-150 object-cover w-14 h-14"
			/>
		</Link>
	)
}

export default WhatsAppButton
