import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const id = parseInt(params.id)

		if (isNaN(id)) {
			return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
		}

		const { data: product, error } = await supabase
			.from("products")
			.select(
				`
        *,
        images:product_images(*)
      `,
			)
			.eq("id", id)
			.single()

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Product not found" },
					{ status: 404 },
				)
			}
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		// Transform data to match your frontend structure
		const formattedProduct = {
			id: product.id,
			name: product.name,
			price: product.price,
			image:
				product.images.find((img: any) => img.is_primary)?.image_url ||
				product.images[0]?.image_url,
			category: product.category,
			isNew: product.is_new,
			description: product.description,
			details: product.details,
			sizes: product.sizes,
			colors: product.colors,
			images: product.images.map((img: any) => img.image_url),
		}

		return NextResponse.json(formattedProduct)
	} catch (error) {
		console.error("Error fetching product:", error)
		return NextResponse.json(
			{ error: "Failed to fetch product" },
			{ status: 500 },
		)
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const id = parseInt(params.id)

		if (isNaN(id)) {
			return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
		}

		const body = await request.json()

		// Update product in database
		const { data: product, error } = await supabase
			.from("products")
			.update({
				name: body.name,
				price: body.price,
				description: body.description,
				category: body.category,
				is_new: body.isNew,
				details: body.details,
				sizes: body.sizes,
				colors: body.colors,
			})
			.eq("id", id)
			.select()
			.single()

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		return NextResponse.json({
			message: "Product updated successfully",
			product,
		})
	} catch (error) {
		console.error("Error updating product:", error)
		return NextResponse.json(
			{ error: "Failed to update product" },
			{ status: 500 },
		)
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const id = parseInt(params.id)

		if (isNaN(id)) {
			return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
		}

		// First, fetch all images for this product to delete from Cloudinary later
		const { data: images } = await supabase
			.from("product_images")
			.select("cloudinary_id")
			.eq("product_id", id)

		// Delete product from database (cascade should handle related images)
		const { error } = await supabase.from("products").delete().eq("id", id)

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		// Return the Cloudinary IDs so they can be deleted in a separate operation
		return NextResponse.json({
			message: "Product deleted successfully",
			cloudinaryIds: images?.map((img) => img.cloudinary_id) || [],
		})
	} catch (error) {
		console.error("Error deleting product:", error)
		return NextResponse.json(
			{ error: "Failed to delete product" },
			{ status: 500 },
		)
	}
}
