import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { uploadMedia, deleteMedia } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
	try {
		// This API expects a multipart form with:
		// - product_id: number
		// - image: File
		// - is_primary: boolean (optional)

		const formData = await request.formData()
		const productIdValue = formData.get("product_id")
		const file = formData.get("image")
		const isPrimaryValue = formData.get("is_primary")

		if (!productIdValue || typeof productIdValue !== "string") {
			return NextResponse.json(
				{ error: "Valid product_id is required" },
				{ status: 400 },
			)
		}

		const productId = parseInt(productIdValue)

		if (isNaN(productId)) {
			return NextResponse.json(
				{ error: "product_id must be a valid number" },
				{ status: 400 },
			)
		}

		if (!file || !(file instanceof File)) {
			return NextResponse.json(
				{ error: "Image file is required" },
				{ status: 400 },
			)
		}

		const isPrimary = isPrimaryValue === "true"

		// Check if product exists
		const { data: product, error: productError } = await supabase
			.from("products")
			.select("id")
			.eq("id", productId)
			.single()

		if (productError) {
			return NextResponse.json({ error: "Product not found" }, { status: 404 })
		}

		// If this is to be the primary image, unset any existing primary image
		if (isPrimary) {
			await supabase
				.from("product_images")
				.update({ is_primary: false })
				.eq("product_id", productId)
				.eq("is_primary", true)
		}

		// Upload image to Cloudinary
		const buffer = await file.arrayBuffer()
		const uploadResult = await uploadMedia(Buffer.from(buffer), {
			folder: `drt-store/products/${productId}`,
			resource_type: file.type.startsWith("video/") ? "video" : "image",
		})

		// Store image reference in Supabase
		const { data: imageData, error: imageError } = await supabase
			.from("product_images")
			.insert({
				product_id: productId,
				image_url: uploadResult.secure_url,
				cloudinary_id: uploadResult.public_id,
				is_primary: isPrimary,
				width: uploadResult.width || 0,
				height: uploadResult.height || 0,
				format: uploadResult.format || "",
			})
			.select()
			.single()

		if (imageError) {
			// If there was an error storing the reference, delete the uploaded image
			await deleteMedia(uploadResult.public_id, {
				resource_type: uploadResult.resource_type,
			})

			return NextResponse.json({ error: imageError.message }, { status: 400 })
		}

		return NextResponse.json(
			{
				message: "Image uploaded successfully",
				image: imageData,
			},
			{ status: 201 },
		)
	} catch (error) {
		console.error("Error uploading product image:", error)
		return NextResponse.json(
			{ error: "Failed to upload image" },
			{ status: 500 },
		)
	}
}

export async function DELETE(request: NextRequest) {
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

		// Get image details including Cloudinary ID
		const { data: image, error: fetchError } = await supabase
			.from("product_images")
			.select("*")
			.eq("id", imageId)
			.single()

		if (fetchError) {
			return NextResponse.json(
				{ error: fetchError.message },
				{ status: fetchError.code === "PGRST116" ? 404 : 400 },
			)
		}

		if (!image || !image.cloudinary_id) {
			return NextResponse.json(
				{ error: "Image data is invalid or incomplete" },
				{ status: 400 },
			)
		}

		// Delete image from Cloudinary
		const resourceType = image.image_url.includes("video") ? "video" : "image"
		await deleteMedia(image.cloudinary_id, { resource_type: resourceType })

		// Delete image record from Supabase
		const { error: deleteError } = await supabase
			.from("product_images")
			.delete()
			.eq("id", imageId)

		if (deleteError) {
			return NextResponse.json({ error: deleteError.message }, { status: 400 })
		}

		// If this was a primary image, set another image as primary if available
		if (image.is_primary) {
			const { data: otherImages } = await supabase
				.from("product_images")
				.select("id")
				.eq("product_id", image.product_id)
				.limit(1)

			if (otherImages && otherImages.length > 0) {
				await supabase
					.from("product_images")
					.update({ is_primary: true })
					.eq("id", otherImages[0].id)
			}
		}

		return NextResponse.json({
			message: "Image deleted successfully",
		})
	} catch (error) {
		console.error("Error deleting product image:", error)
		return NextResponse.json(
			{ error: "Failed to delete image" },
			{ status: 500 },
		)
	}
}
