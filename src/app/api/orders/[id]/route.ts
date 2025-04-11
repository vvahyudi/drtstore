import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { auth } from "@/lib/auth"

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const id = parseInt(params.id)

		if (isNaN(id)) {
			return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
		}

		// Authenticate user
		const session = await auth.getSession(request)

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const userId = session.user.id

		// Get order with items and product details
		const { data: order, error } = await supabase
			.from("orders")
			.select(
				`
        *,
        items:order_items(
          *,
          product:products(
            id, 
            name, 
            price,
            product_images(image_url, is_primary)
          )
        )
      `,
			)
			.eq("id", id)
			.eq("user_id", userId) // Ensure user can only access their own orders
			.single()

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json({ error: "Order not found" }, { status: 404 })
			}
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		// Format the order items to include primary image
		const formattedOrder = {
			...order,
			items: order.items.map((item: any) => ({
				...item,
				product: {
					...item.product,
					image:
						item.product.product_images.find((img: any) => img.is_primary)
							?.image_url || item.product.product_images[0]?.image_url,
				},
			})),
		}

		return NextResponse.json(formattedOrder)
	} catch (error) {
		console.error("Error fetching order:", error)
		return NextResponse.json(
			{ error: "Failed to fetch order" },
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
			return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
		}

		// Authenticate user (admin or owner)
		const session = await auth.getSession(request)

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const body = await request.json()

		// Only allow updating status and maybe shipping details
		// Don't allow modification of items or prices after order is created
		const { data: order, error } = await supabase
			.from("orders")
			.update({
				status: body.status,
				shipping_address: body.shippingAddress,
			})
			.eq("id", id)
			.select()
			.single()

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		return NextResponse.json({
			message: "Order updated successfully",
			order,
		})
	} catch (error) {
		console.error("Error updating order:", error)
		return NextResponse.json(
			{ error: "Failed to update order" },
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
			return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
		}

		// This should typically be an admin-only operation
		// or limited to cancelling pending orders

		// Authenticate user (admin)
		const session = await auth.getSession(request)

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		// In a real application, you would check user roles here

		// Check order status first
		const { data: existingOrder } = await supabase
			.from("orders")
			.select("status")
			.eq("id", id)
			.single()

		if (!existingOrder) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 })
		}

		// Only allow cancellation of pending or processing orders
		if (
			existingOrder.status !== "pending" &&
			existingOrder.status !== "processing"
		) {
			return NextResponse.json(
				{
					error: "Cannot delete orders that are already completed or cancelled",
				},
				{ status: 400 },
			)
		}

		// First delete order items (or use cascade)
		const { error: itemsError } = await supabase
			.from("order_items")
			.delete()
			.eq("order_id", id)

		if (itemsError) {
			return NextResponse.json({ error: itemsError.message }, { status: 400 })
		}

		// Then delete the order
		const { error } = await supabase.from("orders").delete().eq("id", id)

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		return NextResponse.json({
			message: "Order cancelled successfully",
		})
	} catch (error) {
		console.error("Error deleting order:", error)
		return NextResponse.json(
			{ error: "Failed to delete order" },
			{ status: 500 },
		)
	}
}
