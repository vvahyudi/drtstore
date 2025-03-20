import type { Metadata } from "next"
import { Geist, Geist_Mono, Roboto_Serif } from "next/font/google"
import "@/styles/globals.css"
import Navbar from "@/components/Navbar"

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
				className={`${geistSans.variable} ${geistMono.variable} ${robotoSerif.variable} antialiased`}
			>
				<Navbar />
				{children}
			</body>
		</html>
	)
}
