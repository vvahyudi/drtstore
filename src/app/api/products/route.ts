import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const category = searchParams.get("category")
		const isNew = searchParams.get("isNew")
		const limit = parseInt(searchParams.get("limit") || "100")
		const offset = parseInt(searchParams.get("offset") || "0")

		let query = supabase
			.from("products")
			.select(
				`
        *,
        images:product_images(*)
      `,
			)
			.order("created_at", { ascending: false })
			.limit(limit)
			.range(offset, offset + limit - 1)

		if (category) {
			query = query.eq("category", category)
		}

		if (isNew) {
			query = query.eq("is_new", isNew === "true")
		}

		const { data, error } = await query

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		// Transform data to match your frontend structure
		const products = data.map((product) => ({
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
		}))

		return NextResponse.json(products)
	} catch (error) {
		console.error("Error fetching products:", error)
		return NextResponse.json(
			{ error: "Failed to fetch products" },
			{ status: 500 },
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()

		// Validate request body
		if (!body.name || !body.price || !body.category) {
			return NextResponse.json(
				{ error: "Name, price, and category are required" },
				{ status: 400 },
			)
		}

		// Insert product into database
		const { data: product, error } = await supabase
			.from("products")
			.insert({
				name: body.name,
				price: body.price,
				description: body.description || "",
				category: body.category,
				is_new: body.isNew || false,
				details: body.details || {},
				sizes: body.sizes || [],
				colors: body.colors || [],
			})
			.select()
			.single()

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		// Handle images separately through the image upload API

		return NextResponse.json(
			{
				message: "Product created successfully",
				product,
			},
			{ status: 201 },
		)
	} catch (error) {
		console.error("Error creating product:", error)
		return NextResponse.json(
			{ error: "Failed to create product" },
			{ status: 500 },
		)
	}
}
