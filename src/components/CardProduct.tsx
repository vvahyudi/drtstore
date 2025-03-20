import React from "react"
import Image from "next/image"

const CardProduct = () => {
	return (
		<a
			href="#"
			className="relative block rounded-tr-3xl border border-gray-100"
		>
			<span className="absolute -right-px -top-px rounded-bl-3xl rounded-tr-3xl bg-rose-600 px-6 py-4 font-medium uppercase tracking-widest text-white">
				Save 10%
			</span>

			<Image
				src="/placeholder.avif"
				alt=""
				className="-ml-6 -mt-6 h-80 w-full rounded-bl-3xl rounded-tr-3xl border border-gray-300 object-cover"
				width={2672}
				height={1781}
			/>

			<div className="p-4 text-center">
				<strong className="text-xl font-medium text-gray-900">
					{" "}
					Aloe Vera{" "}
				</strong>

				<p className="mt-2 text-pretty text-gray-700">
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet officia
					rem vel voluptatum in eum vitae aliquid at sed dignissimos.
				</p>

				<span className="mt-4 block rounded-md border border-indigo-900 bg-indigo-900 px-5 py-3 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-indigo-900">
					Learn More
				</span>
			</div>
		</a>
	)
}

export default CardProduct
