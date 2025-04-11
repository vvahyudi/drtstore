"use client"

import { useState, FormEvent, useEffect } from "react"
import Link from "next/link"
import {
	ChevronLeft,
	CreditCard,
	ShieldCheck,
	AlertCircle,
	ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/components/cart-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Product } from "@/types/api" // Import consistent types

// Define an interface for form data
interface CheckoutFormData {
	firstName: string
	lastName: string
	email: string
	phone: string
	address: string
	apartment?: string
	city: string
	state: string
	zip: string
	paymentMethod: "card" | "paypal" | "cod"
	shippingMethod: "standard" | "express"
	// Card details (only needed for card payment)
	cardName?: string
	cardNumber?: string
	expiry?: string
	cvc?: string
}

export default function CheckoutPage() {
	const { cartItems, subtotal, clearCart } = useCart()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isComplete, setIsComplete] = useState(false)
	const [formData, setFormData] = useState<CheckoutFormData>({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		address: "",
		apartment: "",
		city: "",
		state: "",
		zip: "",
		paymentMethod: "card",
		shippingMethod: "standard",
	})
	const [formErrors, setFormErrors] = useState<Record<string, string>>({})
	const [serverError, setServerError] = useState<string | null>(null)

	// Check if cart is empty on mount and after changes
	useEffect(() => {
		if ((!cartItems || cartItems.length === 0) && !isComplete) {
			// You could redirect here if needed
		}
	}, [cartItems, isComplete])

	if ((!cartItems || cartItems.length === 0) && !isComplete) {
		return (
			<div className="container px-4 py-12 mx-auto text-center">
				<h1 className="text-2xl font-bold">Your cart is empty</h1>
				<p className="mt-4">
					You need to add items to your cart before checking out.
				</p>
				<Button asChild className="mt-6">
					<Link href="/products">Browse Products</Link>
				</Button>
			</div>
		)
	}

	if (isComplete) {
		return (
			<div className="container px-4 py-12 mx-auto max-w-md">
				<Card className="text-center">
					<CardHeader>
						<div className="flex justify-center mb-4">
							<div className="rounded-full bg-green-100 p-3">
								<ShieldCheck className="h-8 w-8 text-green-600" />
							</div>
						</div>
						<CardTitle className="text-2xl">Order Confirmed!</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p>
							Thank you for your purchase. Your order has been confirmed and
							will be shipped soon.
						</p>
						<div className="bg-muted p-4 rounded-lg">
							<p className="font-medium">Order #12345</p>
							<p className="text-sm text-muted-foreground">
								A confirmation email has been sent to your email address.
							</p>
						</div>
					</CardContent>
					<CardFooter className="flex justify-center">
						<Button asChild>
							<Link href="/">Return to Home</Link>
						</Button>
					</CardFooter>
				</Card>
			</div>
		)
	}

	const validateForm = (): boolean => {
		const errors: Record<string, string> = {}

		// Required fields validation
		const requiredFields = [
			"firstName",
			"lastName",
			"email",
			"phone",
			"address",
			"city",
			"state",
			"zip",
		]
		requiredFields.forEach((field) => {
			if (!formData[field as keyof CheckoutFormData]) {
				errors[field] = "This field is required"
			}
		})

		// Email validation
		if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
			errors.email = "Please enter a valid email address"
		}

		// Phone validation - simple validation for demo
		if (
			formData.phone &&
			!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ""))
		) {
			errors.phone = "Please enter a valid phone number"
		}

		// Card validation (only if payment method is card)
		if (formData.paymentMethod === "card") {
			if (!formData.cardName) errors.cardName = "Card name is required"
			if (!formData.cardNumber) errors.cardNumber = "Card number is required"
			if (!formData.expiry) errors.expiry = "Expiry date is required"
			if (!formData.cvc) errors.cvc = "CVC is required"

			// Additional card validations
			if (
				formData.cardNumber &&
				!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))
			) {
				errors.cardNumber = "Please enter a valid 16-digit card number"
			}

			if (formData.expiry && !/^\d{2}\/\d{2}$/.test(formData.expiry)) {
				errors.expiry = "Please use MM/YY format"
			}

			if (formData.cvc && !/^\d{3,4}$/.test(formData.cvc)) {
				errors.cvc = "CVC must be 3 or 4 digits"
			}
		}

		setFormErrors(errors)
		return Object.keys(errors).length === 0
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))

		// Clear error for this field when user types
		if (formErrors[name]) {
			setFormErrors((prev) => {
				const newErrors = { ...prev }
				delete newErrors[name]
				return newErrors
			})
		}
	}

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		setServerError(null)

		// Validate form
		if (!validateForm()) {
			// Scroll to the first error
			const firstErrorField = Object.keys(formErrors)[0]
			const element = document.querySelector(`[name="${firstErrorField}"]`)
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "center" })
			}
			return
		}

		setIsSubmitting(true)

		try {
			// Prepare shipping address
			const shippingAddress = {
				address: formData.address,
				apartment: formData.apartment,
				city: formData.city,
				state: formData.state,
				postal_code: formData.zip,
				country: "Indonesia", // Default for this example
			}

			// Prepare order items
			const items = cartItems.map((item) => ({
				id: item.id,
				quantity: item.quantity || 1,
				selectedSize: item.selectedSize,
				selectedColor: item.selectedColor,
				price: item.price,
			}))

			// In a real application, you would send this data to your API
			// const response = await fetch('/api/orders', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({
			//     items,
			//     shippingAddress,
			//     totalAmount: subtotal + (formData.shippingMethod === 'express' ? 40000 : 20000),
			//     paymentMethod: formData.paymentMethod,
			//     customer: {
			//       firstName: formData.firstName,
			//       lastName: formData.lastName,
			//       email: formData.email,
			//       phone: formData.phone
			//     }
			//   })
			// });

			// Simulate API call delay
			await new Promise((resolve) => setTimeout(resolve, 2000))

			// Simulate successful order
			// if (!response.ok) {
			//   throw new Error('Failed to create order. Please try again.');
			// }

			// Clear cart and show completion screen
			clearCart()
			setIsComplete(true)
		} catch (error) {
			console.error("Checkout error:", error)
			setServerError(
				error instanceof Error
					? error.message
					: "An unexpected error occurred. Please try again.",
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	// Calculate shipping cost
	const shippingCost = formData.shippingMethod === "express" ? 40000 : 20000

	// Calculate total
	const total = subtotal + shippingCost

	// Format price in IDR
	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price)
	}

	return (
		<div className="container px-4 py-12 mx-auto">
			<div className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
				<Link href="/" className="hover:text-foreground">
					Home
				</Link>
				<ChevronRight className="h-4 w-4" />
				<Link href="/cart" className="hover:text-foreground">
					Cart
				</Link>
				<ChevronRight className="h-4 w-4" />
				<span className="text-foreground">Checkout</span>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
				{/* Checkout Form */}
				<div>
					<h1 className="text-3xl font-bold mb-8">Checkout</h1>

					{serverError && (
						<Alert variant="destructive" className="mb-6">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{serverError}</AlertDescription>
						</Alert>
					)}

					<form onSubmit={handleSubmit} className="space-y-8">
						{/* Contact Information */}
						<div className="space-y-4">
							<h2 className="text-xl font-semibold">Contact Information</h2>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="firstName">First Name</Label>
									<Input
										id="firstName"
										name="firstName"
										value={formData.firstName}
										onChange={handleInputChange}
										className={formErrors.firstName ? "border-destructive" : ""}
									/>
									{formErrors.firstName && (
										<p className="text-sm text-destructive">
											{formErrors.firstName}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="lastName">Last Name</Label>
									<Input
										id="lastName"
										name="lastName"
										value={formData.lastName}
										onChange={handleInputChange}
										className={formErrors.lastName ? "border-destructive" : ""}
									/>
									{formErrors.lastName && (
										<p className="text-sm text-destructive">
											{formErrors.lastName}
										</p>
									)}
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email Address</Label>
								<Input
									id="email"
									name="email"
									type="email"
									value={formData.email}
									onChange={handleInputChange}
									className={formErrors.email ? "border-destructive" : ""}
								/>
								{formErrors.email && (
									<p className="text-sm text-destructive">{formErrors.email}</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="phone">Phone Number</Label>
								<Input
									id="phone"
									name="phone"
									value={formData.phone}
									onChange={handleInputChange}
									className={formErrors.phone ? "border-destructive" : ""}
								/>
								{formErrors.phone && (
									<p className="text-sm text-destructive">{formErrors.phone}</p>
								)}
							</div>
						</div>

						<Separator />

						{/* Shipping Address */}
						<div className="space-y-4">
							<h2 className="text-xl font-semibold">Shipping Address</h2>

							<div className="space-y-2">
								<Label htmlFor="address">Street Address</Label>
								<Input
									id="address"
									name="address"
									value={formData.address}
									onChange={handleInputChange}
									className={formErrors.address ? "border-destructive" : ""}
								/>
								{formErrors.address && (
									<p className="text-sm text-destructive">
										{formErrors.address}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="apartment">
									Apartment, Suite, etc. (Optional)
								</Label>
								<Input
									id="apartment"
									name="apartment"
									value={formData.apartment}
									onChange={handleInputChange}
								/>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="city">City</Label>
									<Input
										id="city"
										name="city"
										value={formData.city}
										onChange={handleInputChange}
										className={formErrors.city ? "border-destructive" : ""}
									/>
									{formErrors.city && (
										<p className="text-sm text-destructive">
											{formErrors.city}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="state">State/Province</Label>
									<Input
										id="state"
										name="state"
										value={formData.state}
										onChange={handleInputChange}
										className={formErrors.state ? "border-destructive" : ""}
									/>
									{formErrors.state && (
										<p className="text-sm text-destructive">
											{formErrors.state}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="zip">Postal Code</Label>
									<Input
										id="zip"
										name="zip"
										value={formData.zip}
										onChange={handleInputChange}
										className={formErrors.zip ? "border-destructive" : ""}
									/>
									{formErrors.zip && (
										<p className="text-sm text-destructive">{formErrors.zip}</p>
									)}
								</div>
							</div>
						</div>

						<Separator />

						{/* Shipping Method */}
						<div className="space-y-4">
							<h2 className="text-xl font-semibold">Shipping Method</h2>

							<RadioGroup
								value={formData.shippingMethod}
								onValueChange={(value) =>
									handleSelectChange("shippingMethod", value)
								}
								className="gap-6"
							>
								<div className="flex items-start space-x-4 rounded-md border p-4">
									<RadioGroupItem id="standard" value="standard" />
									<div className="flex-1 space-y-1">
										<Label htmlFor="standard" className="font-medium">
											Standard Shipping
										</Label>
										<p className="text-sm text-muted-foreground">
											Delivery in 3-5 business days
										</p>
									</div>
									<div className="font-medium">{formatPrice(20000)}</div>
								</div>

								<div className="flex items-start space-x-4 rounded-md border p-4">
									<RadioGroupItem id="express" value="express" />
									<div className="flex-1 space-y-1">
										<Label htmlFor="express" className="font-medium">
											Express Shipping
										</Label>
										<p className="text-sm text-muted-foreground">
											Delivery in 1-2 business days
										</p>
									</div>
									<div className="font-medium">{formatPrice(40000)}</div>
								</div>
							</RadioGroup>
						</div>

						<Separator />

						{/* Payment Method */}
						<div className="space-y-4">
							<h2 className="text-xl font-semibold">Payment Method</h2>

							<Tabs
								value={formData.paymentMethod}
								onValueChange={(value) =>
									handleSelectChange(
										"paymentMethod",
										value as "card" | "paypal" | "cod",
									)
								}
								className="w-full"
							>
								<TabsList className="w-full">
									<TabsTrigger value="card" className="flex-1">
										Card
									</TabsTrigger>
									<TabsTrigger value="paypal" className="flex-1">
										PayPal
									</TabsTrigger>
									<TabsTrigger value="cod" className="flex-1">
										Cash on Delivery
									</TabsTrigger>
								</TabsList>

								<TabsContent value="card" className="space-y-4 pt-4">
									<div className="space-y-2">
										<Label htmlFor="cardName">Name on Card</Label>
										<Input
											id="cardName"
											name="cardName"
											value={formData.cardName || ""}
											onChange={handleInputChange}
											className={
												formErrors.cardName ? "border-destructive" : ""
											}
										/>
										{formErrors.cardName && (
											<p className="text-sm text-destructive">
												{formErrors.cardName}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="cardNumber">Card Number</Label>
										<Input
											id="cardNumber"
											name="cardNumber"
											value={formData.cardNumber || ""}
											onChange={handleInputChange}
											placeholder="1234 5678 9012 3456"
											className={
												formErrors.cardNumber ? "border-destructive" : ""
											}
										/>
										{formErrors.cardNumber && (
											<p className="text-sm text-destructive">
												{formErrors.cardNumber}
											</p>
										)}
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="expiry">Expiry Date</Label>
											<Input
												id="expiry"
												name="expiry"
												value={formData.expiry || ""}
												onChange={handleInputChange}
												placeholder="MM/YY"
												className={
													formErrors.expiry ? "border-destructive" : ""
												}
											/>
											{formErrors.expiry && (
												<p className="text-sm text-destructive">
													{formErrors.expiry}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<Label htmlFor="cvc">CVC</Label>
											<Input
												id="cvc"
												name="cvc"
												value={formData.cvc || ""}
												onChange={handleInputChange}
												placeholder="123"
												className={formErrors.cvc ? "border-destructive" : ""}
											/>
											{formErrors.cvc && (
												<p className="text-sm text-destructive">
													{formErrors.cvc}
												</p>
											)}
										</div>
									</div>
								</TabsContent>

								<TabsContent value="paypal" className="p-4 text-center">
									<p className="mb-4">
										You'll be redirected to PayPal to complete your purchase.
									</p>
									<div className="flex justify-center">
										<img src="/paypal-logo.png" alt="PayPal" className="h-10" />
									</div>
								</TabsContent>

								<TabsContent value="cod" className="p-4">
									<p className="text-muted-foreground">
										Pay with cash upon delivery. Please ensure someone is
										available to receive the package and make the payment.
									</p>
								</TabsContent>
							</Tabs>
						</div>

						<Button
							type="submit"
							className="w-full"
							size="lg"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Processing..." : "Complete Order"}
						</Button>
					</form>
				</div>

				{/* Order Summary */}
				<div>
					<Card>
						<CardHeader>
							<CardTitle>Order Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Order Items */}
							<div className="space-y-4">
								{cartItems.map((item) => (
									<div
										key={item.id}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-3">
											<div className="relative w-16 h-16 overflow-hidden rounded-md bg-secondary">
												{item.image && (
													<img
														src={item.image}
														alt={item.name}
														className="object-cover"
													/>
												)}
												<div className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
													{item.quantity || 1}
												</div>
											</div>
											<div>
												<p className="font-medium">{item.name}</p>
												{item.selectedSize && (
													<p className="text-xs text-muted-foreground">
														Size: {item.selectedSize}
													</p>
												)}
												{item.selectedColor && (
													<p className="text-xs text-muted-foreground">
														Color: {item.selectedColor}
													</p>
												)}
											</div>
										</div>
										<p className="font-medium">
											{formatPrice(item.price * (item.quantity || 1))}
										</p>
									</div>
								))}
							</div>

							<Separator />

							{/* Price Breakdown */}
							<div className="space-y-2">
								<div className="flex justify-between">
									<span>Subtotal</span>
									<span>{formatPrice(subtotal)}</span>
								</div>
								<div className="flex justify-between">
									<span>Shipping</span>
									<span>{formatPrice(shippingCost)}</span>
								</div>
								<Separator />
								<div className="flex justify-between font-bold text-lg">
									<span>Total</span>
									<span>{formatPrice(total)}</span>
								</div>
							</div>
						</CardContent>
						<CardFooter className="flex flex-col gap-4">
							<Button
								type="submit"
								className="w-full"
								size="lg"
								form="checkout-form"
								disabled={isSubmitting}
								onClick={handleSubmit}
							>
								{isSubmitting ? "Processing..." : "Complete Order"}
							</Button>

							<div className="text-center text-sm text-muted-foreground">
								<p>By placing your order, you agree to our</p>
								<div className="flex justify-center gap-1">
									<Link
										href="/terms"
										className="underline hover:text-foreground"
									>
										Terms of Service
									</Link>
									<span>and</span>
									<Link
										href="/privacy"
										className="underline hover:text-foreground"
									>
										Privacy Policy
									</Link>
								</div>
							</div>
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	)
}
