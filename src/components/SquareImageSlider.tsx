import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ImageSliderProps {
	images: string[]
	autoPlayInterval?: number // in milliseconds
	showArrows?: boolean
}

const SquareImageSlider: React.FC<ImageSliderProps> = ({
	images,
	autoPlayInterval = 3000,
	showArrows = true,
}) => {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isAutoPlaying, setIsAutoPlaying] = useState(true)

	// Auto-play functionality
	useEffect(() => {
		let intervalId: NodeJS.Timeout

		if (isAutoPlaying) {
			intervalId = setInterval(() => {
				setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
			}, autoPlayInterval)
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId)
			}
		}
	}, [isAutoPlaying, autoPlayInterval, images.length])

	const goToPrevious = () => {
		setCurrentIndex((prevIndex) =>
			prevIndex === 0 ? images.length - 1 : prevIndex - 1,
		)
	}

	const goToNext = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
	}

	const goToSlide = (index: number) => {
		setCurrentIndex(index)
	}

	const handleMouseEnter = () => {
		setIsAutoPlaying(false)
	}

	const handleMouseLeave = () => {
		setIsAutoPlaying(true)
	}

	return (
		<section className="@container w-full max-w-2xl mx-auto p-4">
			<Card
				className="relative aspect-square overflow-hidden shadow-lg"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				{/* Images */}
				<div className="h-full w-full">
					{images.map((image, index) => (
						<div
							key={index}
							className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
								currentIndex === index ? "opacity-100" : "opacity-0"
							}`}
						>
							<img
								src={image}
								alt={`Slide ${index + 1}`}
								className="w-full h-full object-cover"
							/>
						</div>
					))}
				</div>

				{/* Navigation Arrows */}
				{showArrows && (
					<div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
						<Button
							variant="secondary"
							size="icon"
							className="rounded-full bg-white/70 hover:bg-white/90 shadow-md pointer-events-auto transition-transform hover:scale-110"
							onClick={goToPrevious}
						>
							<ChevronLeft className="h-5 w-5" />
						</Button>

						<Button
							variant="secondary"
							size="icon"
							className="rounded-full bg-white/70 hover:bg-white/90 shadow-md pointer-events-auto transition-transform hover:scale-110"
							onClick={goToNext}
						>
							<ChevronRight className="h-5 w-5" />
						</Button>
					</div>
				)}
			</Card>

			{/* Thumbnail Navigation */}
			<div className="mt-6 overflow-x-auto flex gap-3 scrollbar-hide px-2 py-2">
				{images.map((image, index) => (
					<button
						key={index}
						onClick={() => goToSlide(index)}
						className={`w-12 h-12 flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all ${
							currentIndex === index
								? "border-primary scale-110 shadow-md"
								: "border-gray-300 hover:border-gray-400"
						}`}
					>
						<img
							src={image}
							alt={`Thumbnail ${index}`}
							className="w-full h-full object-cover"
						/>
					</button>
				))}
			</div>
		</section>
	)
}

export default SquareImageSlider
