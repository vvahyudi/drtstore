import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { generateSlug } from "@/lib/utils"

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

		// Transform data to match the frontend structure
		const formattedProduct = {
			id: product.id,
			name: product.name,
			slug: product.slug,
			price: product.price,
			image:
				product.images.find((img: any) => img.is_primary)?.image_url ||
				(product.images.length > 0 ? product.images[0]?.image_url : null),
			category: product.category,
			isNew: product.is_new,
			isFeatured: product.is_featured,
			stock: product.stock,
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

		// Generate slug if not provided
		if (!body.slug && body.name) {
			body.slug = generateSlug(body.name)
		}

		// Format data for Supabase
		const productData = {
			...(body.name && { name: body.name }),
			...(body.slug && { slug: body.slug }),
			...(body.price !== undefined && { price: body.price }),
			...(body.description !== undefined && { description: body.description }),
			...(body.category && { category: body.category }),
			...(body.isNew !== undefined && { is_new: body.isNew }),
			...(body.isFeatured !== undefined && { is_featured: body.isFeatured }),
			...(body.stock !== undefined && { stock: body.stock }),
			...(body.details && { details: body.details }),
			...(body.sizes && { sizes: body.sizes }),
			...(body.colors && { colors: body.colors }),
		}

		// Update product in database
		const { data: product, error } = await supabase
			.from("products")
			.update(productData)
			.eq("id", id)
			.select()
			.single()

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		// Fetch the images to include in the response
		const { data: imageData } = await supabase
			.from("product_images")
			.select("*")
			.eq("product_id", id)

		// Transform the product data for response
		const transformedProduct = {
			id: product.id,
			name: product.name,
			slug: product.slug,
			price: product.price,
			description: product.description,
			category: product.category,
			isNew: product.is_new,
			isFeatured: product.is_featured,
			stock: product.stock,
			details: product.details,
			sizes: product.sizes,
			colors: product.colors,
			images: imageData?.map((img) => img.image_url) || [],
			image:
				imageData?.find((img) => img.is_primary)?.image_url ||
				(imageData && imageData.length > 0 ? imageData[0].image_url : ""),
		}

		return NextResponse.json({
			message: "Product updated successfully",
			product: transformedProduct,
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

		// Return the Cloudinary IDs so they can be deleted in a separate operation if needed
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
