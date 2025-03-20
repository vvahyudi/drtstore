"use client"
import { useState, useEffect, useMemo } from "react"
import Head from "next/head"
import { useParams } from "next/navigation"
import { motion } from "motion/react"
import SquareImageSlider from "@/components/SquareImageSlider"

const products = [
	{ name: "Kaos Keren 1", image: "/1.png" },
	{ name: "Kaos Keren 2", image: "/2.png" },
	{ name: "Kaos Keren 3", image: "/3.png" },
]

const features = [
	{
		icon: "🌿",
		text: "Bahan Premium, Adem & Nyaman – Dibuat dari material berkualitas tinggi yang ringan dan breathable. Nggak bikin gerah, cocok buat Lebaran atau dipakai harian!",
	},
	{
		icon: "👕",
		text: "Unisex & Fleksibel – Modelnya simpel dan modern, bisa dipakai cowok atau cewek. Mau tampil rapi atau casual? Bebas, tinggal mix & match!",
	},
	{
		icon: "🖤",
		text: "Desain Minimalis, Tetap Stylish – Cocok buat acara formal maupun santai. Mau dipakai ke kantor, nongkrong, atau silaturahmi? Gas terus!",
	},
	{
		icon: "💰",
		text: "Super Hemat! 100 Ribu Dapat 2 – Serius, nggak perlu mikir dua kali! Beli 2 cuma 100 ribu, bisa buat sendiri atau kembaran sama sahabat/pasangan!",
	},
	{
		icon: "⏳",
		text: "STOK TERBATAS! – Udah banyak yang checkout, jangan sampai kehabisan! Harga spesial ini cuma berlaku selama promo Lebaran!",
	},
	{
		icon: "🚀",
		text: "ORDER SEKARANG, JANGAN TUNGGU BESOK! – Klik tombol PESAN SEKARANG sebelum kehabisan! Makin lama mikir, makin besar risiko nggak kebagian! 😱🔥",
	},
]

const testimonials = [
	{ name: "Andi", review: "Kaosnya keren banget!", image: "/placeholder.avif" },
	{
		name: "Rina",
		review: "Bahan nyaman dipakai seharian.",
		image: "/placeholder.avif",
	},
]

export default function DetailProductPage() {
	const params = useParams<{ slug: string }>()
	console.log(params)
	const [seconds, setSeconds] = useState(24 * 60 * 60)

	const images_product = useMemo(
		() => Array.from({ length: 66 }, (_, i) => `/celana_product/${i + 1}.png`),
		[],
	)

	useEffect(() => {
		const timer = setInterval(() => {
			setSeconds((prev) => (prev > 0 ? prev - 1 : 0))
		}, 1000)
		return () => clearInterval(timer)
	}, [])

	const formatTime = (secs: number) => {
		const hours = Math.floor(secs / 3600)
		const minutes = Math.floor((secs % 3600) / 60)
		const sec = secs % 60
		return `${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
	}

	return (
		<>
			<Head>
				<title>Promo Bundle Kaos - 100K Dapat 2</title>
				<meta
					name="description"
					content="Dapatkan promo kaos keren! Hanya 100K dapat 2 pcs, bahan premium dan nyaman dipakai."
				/>
				<meta property="og:title" content="Promo Bundle Kaos - 100K Dapat 2" />
				<meta
					property="og:description"
					content="Jangan sampai kehabisan! Promo terbatas untuk kaos premium."
				/>
			</Head>

			<header className="sticky top-0 bg-yellow-400 uppercase shadow-md p-4 text-center font-bold text-lg z-10">
				Promo Berakhir dalam {formatTime(seconds)}
			</header>

			<main className="@container mx-auto p-6 flex flex-col items-center ">
				<h1 className="text-3xl font-bold text-center">
					🔥 Promo Spesial! 100K Dapat 2 Kaos 🔥
				</h1>

				<section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
					{products.map((product, index) => (
						<div key={index} className="text-center">
							<img
								src={product.image}
								alt={product.name}
								className="w-full rounded-lg shadow-lg"
							/>
							<p className="mt-2 font-semibold">{product.name}</p>
						</div>
					))}
				</section>

				<h2 className="text-2xl font-semibold text-center mt-8">
					Kenapa Harus Beli?
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
					{features.map((feature, index) => (
						<motion.div
							key={index}
							className="bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-blue-500 p-6"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							whileHover={{ y: -5, scale: 1.02 }}
						>
							<div className="flex flex-col h-full items-center text-center">
								<div className="mb-4 text-6xl">{feature.icon}</div>
								<motion.p
									className="text-gray-700 font-medium leading-relaxed"
									initial={{ scale: 0.98 }}
									whileHover={{ scale: 1.02 }}
									transition={{ duration: 0.2 }}
								>
									{feature.text}
								</motion.p>
							</div>
						</motion.div>
					))}
				</div>

				<div className="p-6 @container w-full max-w-2xl">
					<h1 className="text-4xl font-serif font-bold mb-4 text-center">
						Celana
					</h1>
					<SquareImageSlider
						images={images_product}
						showArrows={true}
						autoPlayInterval={4000}
					/>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 @container w-full">
					{testimonials.map((testi, index) => (
						<motion.div
							key={index}
							className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 flex flex-col items-center text-center"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							whileHover={{ scale: 1.02 }}
						>
							<div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
								<img
									src={testi.image}
									alt={testi.name}
									className="w-full h-full object-cover"
								/>
							</div>
							<p className="font-semibold mt-4 text-lg">{testi.name}</p>
							<p className="italic mt-2 text-gray-600">"{testi.review}"</p>
							<div className="mt-4 text-2xl text-gray-400">⭐️⭐️⭐️⭐️⭐️</div>
						</motion.div>
					))}
				</div>

				<div className="text-center mt-8 z-100">
					<a
						href="https://wa.me/628xxxxxx"
						className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-green-600 transition"
					>
						Order Sekarang
					</a>
				</div>
			</main>
		</>
	)
}
