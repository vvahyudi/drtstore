import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const categoryId = searchParams.get("categoryId")
		const categorySlug = searchParams.get("categorySlug")
		const isNew = searchParams.get("isNew")
		const isFeatured = searchParams.get("isFeatured")
		const limit = parseInt(searchParams.get("limit") || "100")
		const offset = parseInt(searchParams.get("offset") || "0")
		const orderBy = searchParams.get("orderBy") || "created_at"
		const orderDirection = searchParams.get("orderDirection") || "desc"
		const search = searchParams.get("search")

		// Start building query
		let query = supabase.from("products").select(`
      *,
      category:categories(*),
      images:product_images(*)
    `)

		// Apply filters
		if (categoryId) {
			query = query.eq("category_id", categoryId)
		}

		if (categorySlug) {
			const { data: category } = await supabase
				.from("categories")
				.select("id")
				.eq("slug", categorySlug)
				.single()

			if (category) {
				query = query.eq("category_id", category.id)
			}
		}

		if (isNew) {
			query = query.eq("is_new", isNew === "true")
		}

		if (isFeatured) {
			query = query.eq("is_featured", isFeatured === "true")
		}

		if (search) {
			query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
		}

		// Apply sorting (with validation to prevent SQL injection)
		const validSortFields = ["name", "price", "created_at", "stock"]
		const validDirections = ["asc", "desc"]

		const sortField = validSortFields.includes(orderBy) ? orderBy : "created_at"
		const sortOrder = validDirections.includes(orderDirection as any)
			? orderDirection
			: "desc"

		query = query.order(sortField, { ascending: sortOrder === "asc" })

		// Apply pagination
		query = query.range(offset, offset + limit - 1).limit(limit)

		const { data, error, count } = await query

		if (error) {
			console.error("Error fetching products:", error)
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		// Transform data to match the frontend structure
		const products = data.map((product) => ({
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
		}))

		return NextResponse.json({
			products,
			pagination: {
				total: count || products.length,
				page: Math.floor(offset / limit) + 1,
				limit,
				totalPages: Math.ceil((count || products.length) / limit),
			},
		})
	} catch (error) {
		console.error("Error in products API:", error)
		return NextResponse.json(
			{ error: "Failed to fetch products" },
			{ status: 500 },
		)
	}
}
