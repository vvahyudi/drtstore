import CardProduct from "@/components/CardProduct"
import { Hero } from "@/components/Hero"

export default function Home() {
	return (
		<main className="@container flex flex-col items-center p-4 justify-center gap-6">
			<Hero />

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<CardProduct />
				<CardProduct />
				<CardProduct />
				<CardProduct />
				<CardProduct />
				<CardProduct />
			</div>
		</main>
	)
}
