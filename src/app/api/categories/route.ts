import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
	try {
		// Fetch all categories
		const { data, error } = await supabase
			.from("categories")
			.select("*")
			.order("name", { ascending: true })

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		return NextResponse.json({
			categories: data,
			count: data.length,
		})
	} catch (error) {
		console.error("Error fetching categories:", error)
		return NextResponse.json(
			{ error: "Failed to fetch categories" },
			{ status: 500 },
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		const { name, slug, description, image_url } = await request.json()

		if (!name) {
			return NextResponse.json(
				{ error: "Category name is required" },
				{ status: 400 },
			)
		}

		// Generate slug if not provided
		const finalSlug = slug || name.toLowerCase().replace(/\s+/g, "-")

		// Check if the category already exists
		const { data: existingCategories, error: checkError } = await supabase
			.from("categories")
			.select("id")
			.eq("slug", finalSlug)
			.limit(1)

		if (checkError) {
			return NextResponse.json({ error: checkError.message }, { status: 400 })
		}

		if (existingCategories && existingCategories.length > 0) {
			return NextResponse.json(
				{ error: "Category with this slug already exists" },
				{ status: 400 },
			)
		}

		// Create the category
		const { data, error } = await supabase
			.from("categories")
			.insert({
				name,
				slug: finalSlug,
				description: description || `Products in the ${name} category`,
				image_url: image_url || null,
			})
			.select()
			.single()

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		return NextResponse.json(
			{
				message: "Category created successfully",
				category: data,
			},
			{ status: 201 },
		)
	} catch (error) {
		console.error("Error creating category:", error)
		return NextResponse.json(
			{ error: "Failed to create category" },
			{ status: 500 },
		)
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const id = searchParams.get("id")
		const slug = searchParams.get("slug")

		if (!id && !slug) {
			return NextResponse.json(
				{ error: "Category ID or slug is required" },
				{ status: 400 },
			)
		}

		let query = supabase.from("categories").delete()

		if (id) {
			query = query.eq("id", id)
		} else if (slug) {
			query = query.eq("slug", slug)
		}

		const { error } = await query

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		return NextResponse.json({
			message: "Category deleted successfully",
		})
	} catch (error) {
		console.error("Error deleting category:", error)
		return NextResponse.json(
			{ error: "Failed to delete category" },
			{ status: 500 },
		)
	}
}
