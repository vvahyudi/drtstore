import { useState, useEffect, useCallback } from "react"
import {
	ApiResponse,
	Product,
	Order,
	ProductFilterParams,
	CreateOrderRequest,
} from "@/types/api"

// Generic API fetcher with error handling
async function fetchApi<T>(
	url: string,
	options?: RequestInit,
): Promise<ApiResponse<T>> {
	try {
		const response = await fetch(url, {
			...options,
			headers: {
				"Content-Type": "application/json",
				...options?.headers,
			},
		})

		const data = await response.json()

		if (!response.ok) {
			return { error: data.error || "Something went wrong" }
		}

		return { data }
	} catch (error) {
		console.error("API request error:", error)
		return { error: "Network error occurred" }
	}
}

// Product hooks
export function useProducts(filters?: ProductFilterParams) {
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchProducts = async () => {
			setLoading(true)

			// Build query string from filters
			const params = new URLSearchParams()
			if (filters?.category) params.append("category", filters.category)
			if (filters?.isNew !== undefined)
				params.append("isNew", String(filters.isNew))
			if (filters?.limit) params.append("limit", String(filters.limit))
			if (filters?.offset) params.append("offset", String(filters.offset))

			const queryString = params.toString() ? `?${params.toString()}` : ""

			const { data, error } = await fetchApi<Product[]>(
				`/api/products${queryString}`,
			)

			setLoading(false)

			if (error) {
				setError(error)
				return
			}

			setProducts(data || [])
			setError(null)
		}

		fetchProducts()
	}, [filters?.category, filters?.isNew, filters?.limit, filters?.offset])

	return { products, loading, error }
}

export function useProduct(id: number | null) {
	const [product, setProduct] = useState<Product | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!id) return

		const fetchProduct = async () => {
			setLoading(true)

			const { data, error } = await fetchApi<Product>(`/api/products/${id}`)

			setLoading(false)

			if (error) {
				setError(error)
				return
			}

			setProduct(data || null)
			setError(null)
		}

		fetchProduct()
	}, [id])

	return { product, loading, error }
}

// Order hooks
export function useOrders() {
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchOrders = async () => {
			setLoading(true)

			const { data, error } = await fetchApi<Order[]>("/api/orders")

			setLoading(false)

			if (error) {
				setError(error)
				return
			}

			setOrders(data || [])
			setError(null)
		}

		fetchOrders()
	}, [])

	return { orders, loading, error }
}

export function useOrder(id: number | null) {
	const [order, setOrder] = useState<Order | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!id) return

		const fetchOrder = async () => {
			setLoading(true)

			const { data, error } = await fetchApi<Order>(`/api/orders/${id}`)

			setLoading(false)

			if (error) {
				setError(error)
				return
			}

			setOrder(data || null)
			setError(null)
		}

		fetchOrder()
	}, [id])

	return { order, loading, error }
}

// Order creation
export function useCreateOrder() {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [orderId, setOrderId] = useState<number | null>(null)

	const createOrder = useCallback(async (orderData: CreateOrderRequest) => {
		setLoading(true)
		setError(null)
		setOrderId(null)

		const { data, error } = await fetchApi<{ orderId: number }>("/api/orders", {
			method: "POST",
			body: JSON.stringify(orderData),
		})

		setLoading(false)

		if (error) {
			setError(error)
			return false
		}

		setOrderId(data?.orderId || null)
		return true
	}, [])

	return { createOrder, loading, error, orderId }
}

// Product image upload
export function useUploadProductImage() {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [imageUrl, setImageUrl] = useState<string | null>(null)

	const uploadImage = useCallback(
		async (productId: number, file: File, isPrimary: boolean = false) => {
			setLoading(true)
			setError(null)
			setImageUrl(null)

			const formData = new FormData()
			formData.append("product_id", productId.toString())
			formData.append("image", file)
			formData.append("is_primary", isPrimary.toString())

			try {
				const response = await fetch("/api/products/images", {
					method: "POST",
					body: formData,
				})

				const result = await response.json()

				setLoading(false)

				if (!response.ok) {
					setError(result.error || "Failed to upload image")
					return false
				}

				setImageUrl(result.image.image_url)
				return true
			} catch (err) {
				setLoading(false)
				setError("Network error occurred")
				console.error("Upload error:", err)
				return false
			}
		},
		[],
	)

	return { uploadImage, loading, error, imageUrl }
}
