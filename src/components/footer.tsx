import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
	return (
		<footer className="border-t bg-background">
			<div className="container px-4 py-12 mx-auto">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-4">
					<div className="space-y-4">
						<h3 className="text-lg font-bold">StyleHub</h3>
						<p className="text-sm text-muted-foreground">
							Premium clothing for every occasion. Quality materials, timeless
							designs.
						</p>
						<div className="flex space-x-4">
							<Link
								href="#"
								className="text-muted-foreground hover:text-foreground"
							>
								<Facebook className="h-5 w-5" />
								<span className="sr-only">Facebook</span>
							</Link>
							<Link
								href="#"
								className="text-muted-foreground hover:text-foreground"
							>
								<Instagram className="h-5 w-5" />
								<span className="sr-only">Instagram</span>
							</Link>
							<Link
								href="#"
								className="text-muted-foreground hover:text-foreground"
							>
								<Twitter className="h-5 w-5" />
								<span className="sr-only">Twitter</span>
							</Link>
						</div>
					</div>
					<div className="space-y-4">
						<h3 className="text-sm font-bold">Shop</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									href="/products/men"
									className="text-muted-foreground hover:text-foreground"
								>
									Men&apos;s Collection
								</Link>
							</li>
							<li>
								<Link
									href="/products/women"
									className="text-muted-foreground hover:text-foreground"
								>
									Women&apos;s Collection
								</Link>
							</li>
							<li>
								<Link
									href="/products/new"
									className="text-muted-foreground hover:text-foreground"
								>
									New Arrivals
								</Link>
							</li>
							<li>
								<Link
									href="/products/sale"
									className="text-muted-foreground hover:text-foreground"
								>
									Sale
								</Link>
							</li>
						</ul>
					</div>
					<div className="space-y-4">
						<h3 className="text-sm font-bold">Company</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									href="/about"
									className="text-muted-foreground hover:text-foreground"
								>
									About Us
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="text-muted-foreground hover:text-foreground"
								>
									Contact
								</Link>
							</li>
							<li>
								<Link
									href="/careers"
									className="text-muted-foreground hover:text-foreground"
								>
									Careers
								</Link>
							</li>
							<li>
								<Link
									href="/stores"
									className="text-muted-foreground hover:text-foreground"
								>
									Store Locator
								</Link>
							</li>
						</ul>
					</div>
					<div className="space-y-4">
						<h3 className="text-sm font-bold">Customer Service</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									href="/help"
									className="text-muted-foreground hover:text-foreground"
								>
									Help Center
								</Link>
							</li>
							<li>
								<Link
									href="/shipping"
									className="text-muted-foreground hover:text-foreground"
								>
									Shipping & Returns
								</Link>
							</li>
							<li>
								<Link
									href="/size-guide"
									className="text-muted-foreground hover:text-foreground"
								>
									Size Guide
								</Link>
							</li>
							<li>
								<Link
									href="/faq"
									className="text-muted-foreground hover:text-foreground"
								>
									FAQ
								</Link>
							</li>
						</ul>
					</div>
				</div>
				<div className="flex flex-col items-center justify-between gap-4 border-t pt-8 mt-8 md:flex-row">
					<p className="text-xs text-muted-foreground">
						© {new Date().getFullYear()} StyleHub. All rights reserved.
					</p>
					<div className="flex gap-4 text-xs text-muted-foreground">
						<Link href="/privacy" className="hover:text-foreground">
							Privacy Policy
						</Link>
						<Link href="/terms" className="hover:text-foreground">
							Terms of Service
						</Link>
						<Link href="/cookies" className="hover:text-foreground">
							Cookie Policy
						</Link>
					</div>
				</div>
			</div>
		</footer>
	)
}
