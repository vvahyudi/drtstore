import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const imageIdValue = searchParams.get("id")

		if (!imageIdValue) {
			return NextResponse.json(
				{ error: "Valid image ID is required" },
				{ status: 400 },
			)
		}

		const imageId = parseInt(imageIdValue)

		if (isNaN(imageId)) {
			return NextResponse.json(
				{ error: "Image ID must be a valid number" },
				{ status: 400 },
			)
		}

		// Get the image to ensure it exists and get the product_id
		const { data: image, error: fetchError } = await supabase
			.from("product_images")
			.select("product_id")
			.eq("id", imageId)
			.single()

		if (fetchError) {
			return NextResponse.json(
				{ error: fetchError.message },
				{ status: fetchError.code === "PGRST116" ? 404 : 400 },
			)
		}

		// First, unset any existing primary images for this product
		const { error: updateError1 } = await supabase
			.from("product_images")
			.update({ is_primary: false })
			.eq("product_id", image.product_id)
			.eq("is_primary", true)

		if (updateError1) {
			return NextResponse.json({ error: updateError1.message }, { status: 400 })
		}

		// Then, set this image as primary
		const { error: updateError2 } = await supabase
			.from("product_images")
			.update({ is_primary: true })
			.eq("id", imageId)

		if (updateError2) {
			return NextResponse.json({ error: updateError2.message }, { status: 400 })
		}

		return NextResponse.json({
			message: "Primary image set successfully",
		})
	} catch (error) {
		console.error("Error setting primary image:", error)
		return NextResponse.json(
			{ error: "Failed to set primary image" },
			{ status: 500 },
		)
	}
}
