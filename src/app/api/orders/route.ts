import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
	try {
		// Authenticate user
		const session = await auth.getSession(request)

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const userId = session.user.id

		// Get all orders for this user
		const { data: orders, error } = await supabase
			.from("orders")
			.select(
				`
        *,
        items:order_items(
          *,
          product:products(id, name, price)
        )
      `,
			)
			.eq("user_id", userId)
			.order("created_at", { ascending: false })

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		return NextResponse.json(orders)
	} catch (error) {
		console.error("Error fetching orders:", error)
		return NextResponse.json(
			{ error: "Failed to fetch orders" },
			{ status: 500 },
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()

		// Validate request
		if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
			return NextResponse.json(
				{ error: "Order must include at least one item" },
				{ status: 400 },
			)
		}

		if (!body.shippingAddress) {
			return NextResponse.json(
				{ error: "Shipping address is required" },
				{ status: 400 },
			)
		}

		// Get the authenticated user
		const session = await auth.getSession(request)
		const userId = session?.user?.id

		// For guest checkout, we can skip user authentication
		// or create a temporary user

		// Start a transaction
		const { data: order, error: orderError } = await supabase
			.from("orders")
			.insert({
				user_id: userId,
				status: "pending",
				total_amount: body.totalAmount,
				shipping_address: body.shippingAddress,
				payment_method: body.paymentMethod || "cod", // Cash on delivery by default
			})
			.select()
			.single()

		if (orderError) {
			return NextResponse.json({ error: orderError.message }, { status: 400 })
		}

		// Insert order items
		const orderItems = body.items.map((item: any) => ({
			order_id: order.id,
			product_id: item.id,
			quantity: item.quantity || 1,
			size: item.selectedSize,
			color: item.selectedColor,
			price: item.price,
		}))

		const { error: itemsError } = await supabase
			.from("order_items")
			.insert(orderItems)

		if (itemsError) {
			// In a real application, we'd want to rollback the order
			// but for simplicity, we'll just return an error
			return NextResponse.json({ error: itemsError.message }, { status: 400 })
		}

		return NextResponse.json(
			{
				message: "Order created successfully",
				orderId: order.id,
			},
			{ status: 201 },
		)
	} catch (error) {
		console.error("Error creating order:", error)
		return NextResponse.json(
			{ error: "Failed to create order" },
			{ status: 500 },
		)
	}
}
