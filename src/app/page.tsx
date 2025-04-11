import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeaturedProducts } from "@/components/featured-products"
import { HeroSection } from "@/components/hero-section"
import { CategorySection } from "@/components/category-section"

export default function Home() {
	return (
		<div className="flex flex-col items-center min-h-screen">
			<HeroSection />
			<div className="container px-4 py-12 mx-auto space-y-16">
				<CategorySection />
				<FeaturedProducts />
				<div className="flex flex-col items-center justify-center space-y-4 text-center">
					<h2 className="text-3xl font-bold tracking-tight">
						Ready to upgrade your style?
					</h2>
					<p className="max-w-[600px] text-muted-foreground">
						Discover our latest collections and find your perfect fit.
					</p>
					<Button asChild size="lg">
						<Link href="/products">
							<ShoppingBag className="w-4 h-4 mr-2" />
							Shop Now
						</Link>
					</Button>
				</div>
			</div>
		</div>
	)
}
