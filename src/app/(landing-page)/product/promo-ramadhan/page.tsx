"use client"
import { useState, useEffect, useMemo } from "react"
import Head from "next/head"
import { useParams } from "next/navigation"
import { motion } from "motion/react"
import SquareImageSlider from "@/components/SquareImageSlider"
import Link from "next/link"
import Image from "next/image"

const products = [
	{ name: "Promo Ramadhan Kemeja Murah", image: "/1.png" },
	{ name: "Promo Ramadhan Kemeja Berkualitas", image: "/2.png" },
	{ name: "Promo Ramadhan Cuci Gudang", image: "/3.png" },
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
	{
		name: "Budi",
		review:
			"Diskonnya gila! Kemejanya premium tapi harganya tetap ramah di kantong!",
	},
	{
		name: "Sari",
		review:
			"Modelnya stylish banget, cocok buat acara formal atau santai. Apalagi pas promo begini!",
	},
	{
		name: "Dani",
		review:
			"Nggak nyesel beli! Kualitasnya top, cutting-an pas, dan promo ini bikin makin worth it!",
	},
	{
		name: "Maya",
		review:
			"Bahan adem, jahitan rapi, dan diskonnya bikin happy. Langsung borong deh!",
	},
	{
		name: "Rizky",
		review:
			"Beli pas promo, dapet harga miring tapi kualitas tetap juara! Recommended banget!",
	},
	{
		name: "Tina",
		review:
			"Kemeja ini nyaman banget, bahkan setelah dicuci berkali-kali tetap bagus!",
	},
	{
		name: "Arman",
		review: "Potongan dan fit-nya pas banget, bikin tampilan makin elegan!",
	},
	{
		name: "Lina",
		review:
			"Suka banget sama desainnya, simpel tapi tetap berkelas. Pas banget ada promo!",
	},
	{
		name: "Joko",
		review:
			"Pesen satu, nyesel nggak beli dua! Kualitasnya di atas ekspektasi!",
	},
	{
		name: "Dewi",
		review:
			"Fast delivery, harga terjangkau, dan bahannya super nyaman. Mantap!",
	},
]

export default function DetailProductPage() {
	const params = useParams<{ slug: string }>()
	console.log(params)
	const [seconds, setSeconds] = useState(24 * 60 * 60)

	const kemeja_pendek_product = useMemo(
		() => Array.from({ length: 20 }, (_, i) => `/kemeja_pendek/${i + 1}.png`),
		[],
	)
	const kemeja_panjang_product = useMemo(
		() => Array.from({ length: 20 }, (_, i) => `/kemeja_panjang/${i + 1}.png`),
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

			<header className="sticky top-0 bg-yellow-500 shadow-md p-4 text-center font-bold text-lg z-10">
				Promo Berakhir dalam {formatTime(seconds)}
			</header>

			<main className="@container mx-auto p-6 flex flex-col items-center gap-4 ">
				<h1 className="text-3xl font-bold text-center uppercase bg-green-600 text-white p-4 rounded-lg">
					🔥 Promo Spesial! 100K Dapat 2 Kaos 🔥
				</h1>

				<section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 py-6">
					{products.map((product, index) => (
						<div key={index} className="text-center">
							<Image
								src={product.image}
								alt={product.name}
								height={100}
								width={100}
								className="w-full rounded-lg shadow-lg"
							/>
							<p className="mt-2 font-semibold">{product.name}</p>
						</div>
					))}
				</section>

				<h2 className="text-3xl font-semibold text-center uppercase bg-green-600 text-white p-4 rounded-lg">
					Kenapa Harus Beli?
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
					{features.map((feature, index) => (
						<motion.div
							key={index}
							className="bg-gradient-to-br from-green-100 to-blue-100 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-emerald-500 p-6"
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
				<div className="flex flex-col w-full @container sm:flex-row items-center justify-center">
					<div className="p-6 @container w-full max-w-2xl">
						<h1 className="text-xl font-serif font-bold mb-4 text-center"></h1>
						<SquareImageSlider
							images={kemeja_pendek_product}
							showArrows={true}
							autoPlayInterval={4000}
						/>
					</div>
					<div className="p-6 @container w-full max-w-2xl">
						<h1 className="text-xl font-serif font-bold mb-4 text-center"></h1>
						<SquareImageSlider
							images={kemeja_panjang_product}
							showArrows={true}
							autoPlayInterval={4000}
						/>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full">
					{testimonials.map((testi, index) => (
						<motion.div
							key={index}
							className="relative bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							whileHover={{ scale: 1.02 }}
						>
							{/* Inisial Nama */}
							<div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white font-bold text-xl shadow-md">
								{testi.name.charAt(0)}
							</div>

							{/* Nama & Testimoni */}
							<p className="font-semibold mt-4 text-lg text-gray-800">
								{testi.name}
							</p>
							<p className="italic mt-2 text-gray-600 text-sm max-w-sm leading-relaxed">
								{testi.review}
							</p>

							{/* Rating Bintang */}
							<div className="mt-4 flex gap-1 text-yellow-500 text-2xl">
								{"⭐️⭐️⭐️⭐️⭐️"}
							</div>

							{/* Efek Dekoratif */}
							<div className="absolute -top-2 -right-2 w-6 h-6 bg-green-200 rounded-full opacity-60"></div>
							<div className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-200 rounded-full opacity-60"></div>
						</motion.div>
					))}
				</div>

				<div className="text-center mt-8 z-100 py-6 flex flex-col gap-2">
					<Link
						href="https://wa.me/628175753345"
						className="bg-green-500 uppercase text-white px-6 py-3 rounded-lg text-2xl font-bold font-mono shadow-md hover:bg-green-600 transition flex items-center justify-center gap-2"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="white"
						>
							<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
						</svg>
						Order Sekarang
					</Link>
				</div>
			</main>
		</>
	)
}
