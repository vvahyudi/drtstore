import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Roboto_Serif } from "next/font/google"

import "@/styles/globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartProvider } from "@/components/cart-provider"
import Providers from "@/providers/providers"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})
const robotoSerif = Roboto_Serif({
	variable: "--font-roboto-serif",
	subsets: ["latin"],
})
export const metadata: Metadata = {
	title: "DRT STORE",
	description: "One Stop Shop for all your needs",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${robotoSerif.variable} antialiased mx-auto p-8 w-full`}
			>
				<Providers>
					<CartProvider>
						<div className="flex flex-col min-h-screen">
							<Header />
							<main className="flex-1">{children}</main>
							<Footer />
						</div>
					</CartProvider>
				</Providers>
			</body>
		</html>
	)
}
