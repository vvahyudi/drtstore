"use client"

import { useState, FormEvent, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, CreditCard, ShieldCheck, AlertCircle } from "lucide-react"
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
		const errors: Record<string, string> = {};
		
		// Required fields validation
		const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city", "state", "zip"];
		requiredFields.forEach(field => {
			if (!formData[field as keyof CheckoutFormData]) {
				errors[field] = "This field is required";
			}
		});
		
		// Email validation
		if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
			errors.email = "Please enter a valid email address";
		}
		
		// Phone validation - simple validation for demo
		if (formData.phone && !/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
			errors.phone = "Please enter a valid phone number";
		}
		
		// Card validation (only if payment method is card)
		if (formData.paymentMethod === "card") {
			if (!formData.cardName) errors.cardName = "Card name is required";
			if (!formData.cardNumber) errors.cardNumber = "Card number is required";
			if (!formData.expiry) errors.expiry = "Expiry date is required";
			if (!formData.cvc) errors.cvc = "CVC is required";
			
			// Additional card validations
			if (formData.cardNumber && !/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
				errors.cardNumber = "Please enter a valid 16-digit card number";
			}
			
			if (formData.expiry && !/^\d{2}\/\d{2}$/.test(formData.expiry)) {
				errors.expiry = "Please use MM/YY format";
			}
			
			if (formData.cvc && !/^\d{3,4}$/.test(formData.cvc)) {
				errors.cvc = "CVC must be 3 or 4 digits";
			}
		}
		
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		
		// Clear error for this field when user types
		if (formErrors[name]) {
			setFormErrors(prev => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setServerError(null);
		
		// Validate form
		if (!validateForm()) {
			// Scroll to the first error
			const firstErrorField = Object.keys(formErrors)[0];
			const element = document.querySelector(`[name="${firstErrorField}"]`);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
			return;
		}
		
		setIsSubmitting(true);
		
		try {
			// Prepare shipping address
			const shippingAddress = {
				address: formData.address,
				apartment: formData.apartment,
				city: formData.city,
				state: formData.state,
				postal_code: formData.zip,
				country: "Indonesia" // Default for this example
			};
			
			// Prepare order items
			const items = cartItems.map(item => ({
				id: item.id,
				quantity: item.quantity || 1,
				selectedSize: item.selectedSize,
				selectedColor: item.selectedColor,
				price: item.price
			}));
			
			// In a real application, you would send this data to your API
			// const response = await fetch('/api/orders', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({
			//     items,
			//     shippingAddress,
			//     totalAmount: subtotal + (formData.shippingMethod === 'express' ? 9.99 : 0),
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
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			// Simulate successful order
			// if (!response.ok) {
			//   throw new Error('Failed to create order. Please try again.');
			// }
			
			// Clear cart and show completion screen
			clearCart();
			setIsComplete(true);
			
		} catch (error) {
			console.error('Checkout error:', error);
			setServerError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	}
	
		