import Image from "next/image"
import Link from "next/link"
import React from "react"

const Navbar = () => {
	return (
		<nav className="navbar bg-base-100 shadow-sm mx-auto p-2">
			<div className="navbar-start"></div>
			<div className="navbar-center rounded-full bg-accent">
				<Link className="text-xl" href="/">
					<Image
						className="scale-150"
						src={"/logo-drtsurf.png"}
						width={100}
						height={100}
						alt="DRT Store"
					/>
				</Link>
			</div>
			<div className="navbar-end"></div>
		</nav>
	)
}

export default Navbar
