import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { generateSlug } from "@/lib/utils"

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const category = searchParams.get("category")
		const isNew = searchParams.get("isNew")
		const isFeatured = searchParams.get("isFeatured")
		const limit = parseInt(searchParams.get("limit") || "100")
		const offset = parseInt(searchParams.get("offset") || "0")
		const orderBy = searchParams.get("orderBy") || "created_at"
		const orderDirection = searchParams.get("orderDirection") || "desc"
		const search = searchParams.get("search")

		let query = supabase.from("products").select(
			`
        *,
        images:product_images(*)
      `,
		)

		// Apply filters
		if (category) {
			query = query.eq("category", category)
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
			? orderDirection === "asc"
			: "desc"

		query = query.order(sortField, { ascending: sortOrder === "asc" })

		// Apply pagination
		query = query.range(offset, offset + limit - 1).limit(limit)

		const { data, error, count } = await query

		if (error) {
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
			category: product.category,
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

		// Generate slug if not provided
		if (!body.slug) {
			body.slug = generateSlug(body.name)
		}

		// Format data for Supabase
		const productData = {
			name: body.name,
			slug: body.slug,
			price: body.price,
			description: body.description || "",
			category: body.category,
			is_new: body.isNew || false,
			is_featured: body.isFeatured || false,
			stock: body.stock || 0,
			details: body.details || {},
			sizes: body.sizes || [],
			colors: body.colors || [],
		}

		// Insert product into database
		const { data: product, error } = await supabase
			.from("products")
			.insert(productData)
			.select()
			.single()

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

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
			images: [],
			image: "",
		}

		return NextResponse.json(
			{
				message: "Product created successfully",
				product: transformedProduct,
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
