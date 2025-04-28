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
        category:categories(*),
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
			category: product.category?.name || "",
			categoryId: product.category_id,
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
			body.slug = body.name
				.toLowerCase()
				.replace(/\s+/g, "-")
				.replace(/[^a-z0-9-]/g, "")
		}

		// Transform data from frontend format to database format
		const productData: any = {}

		// Map direct fields
		if (body.name !== undefined) productData.name = body.name
		if (body.slug !== undefined) productData.slug = body.slug
		if (body.price !== undefined) productData.price = body.price
		if (body.description !== undefined)
			productData.description = body.description
		if (body.categoryId !== undefined) productData.category_id = body.categoryId
		if (body.isNew !== undefined) productData.is_new = body.isNew
		if (body.isFeatured !== undefined) productData.is_featured = body.isFeatured
		if (body.stock !== undefined) productData.stock = body.stock
		if (body.details !== undefined) productData.details = body.details
		if (body.sizes !== undefined) productData.sizes = body.sizes
		if (body.colors !== undefined) productData.colors = body.colors

		// Update product in database
		const { data: product, error } = await supabase
			.from("products")
			.update(productData)
			.eq("id", id)
			.select(
				`
        *,
        category:categories(*),
        images:product_images(*)
      `,
			)
			.single()

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		// Transform for response in the same way as GET
		const formattedProduct = {
			id: product.id,
			name: product.name,
			slug: product.slug,
			price: product.price,
			image:
				product.images.find((img: any) => img.is_primary)?.image_url ||
				(product.images.length > 0 ? product.images[0]?.image_url : null),
			category: product.category?.name || "",
			categoryId: product.category_id,
			isNew: product.is_new,
			isFeatured: product.is_featured,
			stock: product.stock,
			description: product.description,
			details: product.details,
			sizes: product.sizes,
			colors: product.colors,
			images: product.images.map((img: any) => img.image_url),
		}

		return NextResponse.json({
			message: "Product updated successfully",
			product: formattedProduct,
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
