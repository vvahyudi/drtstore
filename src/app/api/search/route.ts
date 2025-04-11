import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const query = searchParams.get("q")
		const category = searchParams.get("category")
		const minPrice = searchParams.get("min_price")
		const maxPrice = searchParams.get("max_price")
		const sort = searchParams.get("sort") || "created_at"
		const order = searchParams.get("order") || "desc"
		const limit = parseInt(searchParams.get("limit") || "12")
		const page = parseInt(searchParams.get("page") || "1")

		// Calculate pagination
		const from = (page - 1) * limit
		const to = from + limit - 1

		// Start building query
		let supabaseQuery = supabase.from("products").select(`
        *,
        images:product_images(*)
      `)

		// Add search filters
		if (query) {
			supabaseQuery = supabaseQuery.or(
				`name.ilike.%${query}%,description.ilike.%${query}%`,
			)
		}

		if (category) {
			supabaseQuery = supabaseQuery.eq("category", category)
		}

		if (minPrice) {
			supabaseQuery = supabaseQuery.gte("price", parseFloat(minPrice))
		}

		if (maxPrice) {
			supabaseQuery = supabaseQuery.lte("price", parseFloat(maxPrice))
		}

		// Valid sort fields to prevent SQL injection
		const validSortFields = ["price", "created_at", "name"]
		const validOrders = ["asc", "desc"]

		const sortField = validSortFields.includes(sort) ? sort : "created_at"
		const sortOrder = validOrders.includes(order as any) ? order : "desc"

		// Apply sorting and pagination
		const {
			data: products,
			error,
			count,
		} = await supabaseQuery
			.order(sortField, { ascending: sortOrder === "asc" })
			.range(from, to)
			.limit(limit)

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		// Get total count for pagination
		const { count: totalCount } = await supabase
			.from("products")
			.select("*", { count: "exact", head: true })

		// Transform data to match your frontend structure
		const formattedProducts = products?.map((product) => ({
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

		return NextResponse.json({
			products: formattedProducts || [],
			pagination: {
				total: totalCount,
				page,
				limit,
				totalPages: Math.ceil((totalCount || 0) / limit),
			},
		})
	} catch (error) {
		console.error("Error in search API:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		)
	}
}
