import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
	try {
		// Fetch all distinct categories from products
		const { data, error } = await supabase
			.from("products")
			.select("category")
			.not("category", "is", null)

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		// Extract unique categories
		const categories = [...new Set(data.map((item) => item.category))].filter(
			Boolean,
		)

		return NextResponse.json({
			categories,
			count: categories.length,
		})
	} catch (error) {
		console.error("Error fetching categories:", error)
		return NextResponse.json(
			{ error: "Failed to fetch categories" },
			{ status: 500 },
		)
	}
}
