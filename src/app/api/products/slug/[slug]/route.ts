import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(
	request: NextRequest,
	{ params }: { params: { slug: string } },
) {
	try {
		const slug = params.slug

		if (!slug) {
			return NextResponse.json(
				{ error: "Product slug is required" },
				{ status: 400 },
			)
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
			.eq("slug", slug)
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
		console.error("Error fetching product by slug:", error)
		return NextResponse.json(
			{ error: "Failed to fetch product" },
			{ status: 500 },
		)
	}
}
