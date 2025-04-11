import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SimpleWhatsAppButton } from "./whatsapp-button"

export function HeroSection() {
	const phoneNumber = "628175753345"
	const defaultMessage = "Halo, saya tertarik dengan produk di toko Anda"

	return (
		<div className="relative w-full h-[70vh] overflow-hidden">
			{/* Background Image dengan Filter yang Lebih Menarik */}
			<div
				className="absolute inset-0 bg-[url('/herosection.png')] bg-cover bg-center 
        blur-[2px] scale-105"
			/>

			{/* Lapisan filter warna untuk efek yang lebih menarik */}
			<div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-purple-800/50 to-red-900/70 mix-blend-multiply" />

			{/* Tambahan overlay gradien untuk menyeimbangkan kontras dan keterbacaan teks */}
			<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

			{/* Efek cahaya di pojok kanan atas */}
			<div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-yellow-400/30 to-transparent rounded-full blur-xl" />

			<div className="relative h-full flex items-center justify-start container px-4 mx-auto">
				<div className="max-w-lg space-y-6">
					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-shadow-lg">
						<span className="text-white">Temukan</span>{" "}
						<span className="bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent">
							Produk
						</span>{" "}
						<span className="bg-gradient-to-r from-sky-300 to-emerald-300 bg-clip-text text-transparent">
							Terbaik
						</span>{" "}
						<span className="text-white">Anda</span>
					</h1>

					<p className="text-lg md:text-xl backdrop-blur-sm bg-black/10 p-3 rounded-lg border-l-4 border-sky-400 text-gray-100">
						Berbelanja dengan{" "}
						<span className="font-semibold text-yellow-300">mudah</span> dan{" "}
						<span className="font-semibold text-green-300">aman</span>. Koleksi
						produk <span className="italic text-pink-200">berkualitas</span>{" "}
						dengan harga terbaik.
					</p>

					<div className="flex flex-wrap gap-4">
						<SimpleWhatsAppButton
							phoneNumber={phoneNumber}
							message={defaultMessage}
							size="lg"
							className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-lg animate-pulse border border-green-300"
						>
							Konsultasi via WhatsApp
						</SimpleWhatsAppButton>
						<Button
							asChild
							size="lg"
							variant="outline"
							className="bg-white/10 border-white/70 text-white hover:bg-white/20 
              backdrop-blur-sm shadow-lg hover:shadow-white/20 transition-all duration-300"
						>
							<Link href="/products">Lihat Semua Produk</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
