"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function SettingsPage() {
	const [activeTab, setActiveTab] = useState("general")

	// General settings form state
	const [generalSettings, setGeneralSettings] = useState({
		storeName: "DRT Store",
		storeEmail: "contact@drtstore.com",
		storePhone: "+62 817-5753-345",
		currency: "IDR",
		language: "id",
	})

	// Payment settings form state
	const [paymentSettings, setPaymentSettings] = useState({
		enableCod: true,
		enableBankTransfer: true,
		enableCreditCard: false,
		enablePaypal: false,
		bankAccountNumber: "1234567890",
		bankAccountName: "DRT Store",
		bankName: "Bank Central Asia",
	})

	// Shipping settings form state
	const [shippingSettings, setShippingSettings] = useState({
		enableFreeShipping: true,
		freeShippingMinimum: "200000",
		standardShippingCost: "20000",
		expressShippingCost: "40000",
		originAddress: "Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta",
	})

	// Notifications settings form state
	const [notificationSettings, setNotificationSettings] = useState({
		emailOrderConfirmation: true,
		emailShippingUpdates: true,
		emailOrderCancellation: true,
		whatsappNotifications: true,
		marketingEmails: false,
	})

	// User settings form state
	const [userSettings, setUserSettings] = useState({
		adminEmail: "admin@drtstore.com",
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	})

	// Handle form submissions
	const handleGeneralSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		toast.success("General settings updated successfully")
	}

	const handlePaymentSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		toast.success("Payment settings updated successfully")
	}

	const handleShippingSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		toast.success("Shipping settings updated successfully")
	}

	const handleNotificationsSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		toast.success("Notification settings updated successfully")
	}

	const handlePasswordChange = (e: React.FormEvent) => {
		e.preventDefault()

		// Validate passwords
		if (userSettings.newPassword !== userSettings.confirmPassword) {
			toast.error("Passwords do not match")
			return
		}

		if (userSettings.newPassword.length < 8) {
			toast.error("Password must be at least 8 characters")
			return
		}

		toast.success("Password updated successfully")

		// Reset fields
		setUserSettings({
			...userSettings,
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		})
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Settings</h1>
				<p className="text-muted-foreground">
					Manage your store settings and preferences
				</p>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="general">General</TabsTrigger>
					<TabsTrigger value="payment">Payment</TabsTrigger>
					<TabsTrigger value="shipping">Shipping</TabsTrigger>
					<TabsTrigger value="notifications">Notifications</TabsTrigger>
					<TabsTrigger value="account">Account</TabsTrigger>
				</TabsList>

				{/* General Settings */}
				<TabsContent value="general">
					<Card>
						<CardHeader>
							<CardTitle>General Settings</CardTitle>
							<CardDescription>
								Configure basic information about your store
							</CardDescription>
						</CardHeader>
						<form onSubmit={handleGeneralSubmit}>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="store-name">Store Name</Label>
									<Input
										id="store-name"
										value={generalSettings.storeName}
										onChange={(e) =>
											setGeneralSettings({
												...generalSettings,
												storeName: e.target.value,
											})
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="store-email">Email Address</Label>
									<Input
										id="store-email"
										type="email"
										value={generalSettings.storeEmail}
										onChange={(e) =>
											setGeneralSettings({
												...generalSettings,
												storeEmail: e.target.value,
											})
										}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="store-phone">Phone Number</Label>
									<Input
										id="store-phone"
										value={generalSettings.storePhone}
										onChange={(e) =>
											setGeneralSettings({
												...generalSettings,
												storePhone: e.target.value,
											})
										}
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="currency">Currency</Label>
										<Select
											value={generalSettings.currency}
											onValueChange={(value) =>
												setGeneralSettings({
													...generalSettings,
													currency: value,
												})
											}
										>
											<SelectTrigger id="currency">
												<SelectValue placeholder="Select currency" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="IDR">
													Indonesian Rupiah (IDR)
												</SelectItem>
												<SelectItem value="USD">US Dollar (USD)</SelectItem>
												<SelectItem value="EUR">Euro (EUR)</SelectItem>
												<SelectItem value="SGD">
													Singapore Dollar (SGD)
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="language">Language</Label>
										<Select
											value={generalSettings.language}
											onValueChange={(value) =>
												setGeneralSettings({
													...generalSettings,
													language: value,
												})
											}
										>
											<SelectTrigger id="language">
												<SelectValue placeholder="Select language" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="id">Bahasa Indonesia</SelectItem>
												<SelectItem value="en">English</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</CardContent>
							<CardFooter>
								<Button type="submit">Save Changes</Button>
							</CardFooter>
						</form>
					</Card>
				</TabsContent>

				{/* Payment Settings */}
				<TabsContent value="payment">
					<Card>
						<CardHeader>
							<CardTitle>Payment Settings</CardTitle>
							<CardDescription>
								Configure payment methods and options
							</CardDescription>
						</CardHeader>
						<form onSubmit={handlePaymentSubmit}>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									<h3 className="text-sm font-medium">Payment Methods</h3>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="cod">Cash on Delivery (COD)</Label>
											<p className="text-sm text-muted-foreground">
												Allow customers to pay when they receive their order
											</p>
										</div>
										<Switch
											id="cod"
											checked={paymentSettings.enableCod}
											onCheckedChange={(checked) =>
												setPaymentSettings({
													...paymentSettings,
													enableCod: checked,
												})
											}
										/>
									</div>

									<Separator />

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="bank-transfer">Bank Transfer</Label>
											<p className="text-sm text-muted-foreground">
												Allow customers to pay via bank transfer
											</p>
										</div>
										<Switch
											id="bank-transfer"
											checked={paymentSettings.enableBankTransfer}
											onCheckedChange={(checked) =>
												setPaymentSettings({
													...paymentSettings,
													enableBankTransfer: checked,
												})
											}
										/>
									</div>

									{paymentSettings.enableBankTransfer && (
										<div className="space-y-4 pl-6 pt-2">
											<div className="space-y-2">
												<Label htmlFor="bank-name">Bank Name</Label>
												<Input
													id="bank-name"
													value={paymentSettings.bankName}
													onChange={(e) =>
														setPaymentSettings({
															...paymentSettings,
															bankName: e.target.value,
														})
													}
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="account-number">Account Number</Label>
												<Input
													id="account-number"
													value={paymentSettings.bankAccountNumber}
													onChange={(e) =>
														setPaymentSettings({
															...paymentSettings,
															bankAccountNumber: e.target.value,
														})
													}
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="account-name">Account Name</Label>
												<Input
													id="account-name"
													value={paymentSettings.bankAccountName}
													onChange={(e) =>
														setPaymentSettings({
															...paymentSettings,
															bankAccountName: e.target.value,
														})
													}
												/>
											</div>
										</div>
									)}

									<Separator />

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="credit-card">Credit Card</Label>
											<p className="text-sm text-muted-foreground">
												Allow customers to pay with credit/debit cards
											</p>
										</div>
										<Switch
											id="credit-card"
											checked={paymentSettings.enableCreditCard}
											onCheckedChange={(checked) =>
												setPaymentSettings({
													...paymentSettings,
													enableCreditCard: checked,
												})
											}
										/>
									</div>

									<Separator />

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="paypal">PayPal</Label>
											<p className="text-sm text-muted-foreground">
												Allow customers to pay with PayPal
											</p>
										</div>
										<Switch
											id="paypal"
											checked={paymentSettings.enablePaypal}
											onCheckedChange={(checked) =>
												setPaymentSettings({
													...paymentSettings,
													enablePaypal: checked,
												})
											}
										/>
									</div>
								</div>
							</CardContent>
							<CardFooter>
								<Button type="submit">Save Changes</Button>
							</CardFooter>
						</form>
					</Card>
				</TabsContent>

				{/* Shipping Settings */}
				<TabsContent value="shipping">
					<Card>
						<CardHeader>
							<CardTitle>Shipping Settings</CardTitle>
							<CardDescription>
								Configure shipping options and rates
							</CardDescription>
						</CardHeader>
						<form onSubmit={handleShippingSubmit}>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="free-shipping">Free Shipping</Label>
											<p className="text-sm text-muted-foreground">
												Offer free shipping on orders above a minimum amount
											</p>
										</div>
										<Switch
											id="free-shipping"
											checked={shippingSettings.enableFreeShipping}
											onCheckedChange={(checked) =>
												setShippingSettings({
													...shippingSettings,
													enableFreeShipping: checked,
												})
											}
										/>
									</div>

									{shippingSettings.enableFreeShipping && (
										<div className="space-y-2 pl-6 pt-2">
											<Label htmlFor="free-minimum">
												Minimum Order Amount (IDR)
											</Label>
											<Input
												id="free-minimum"
												type="number"
												value={shippingSettings.freeShippingMinimum}
												onChange={(e) =>
													setShippingSettings({
														...shippingSettings,
														freeShippingMinimum: e.target.value,
													})
												}
											/>
										</div>
									)}

									<Separator />

									<div className="space-y-2">
										<Label htmlFor="standard-shipping">
											Standard Shipping Cost (IDR)
										</Label>
										<Input
											id="standard-shipping"
											type="number"
											value={shippingSettings.standardShippingCost}
											onChange={(e) =>
												setShippingSettings({
													...shippingSettings,
													standardShippingCost: e.target.value,
												})
											}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="express-shipping">
											Express Shipping Cost (IDR)
										</Label>
										<Input
											id="express-shipping"
											type="number"
											value={shippingSettings.expressShippingCost}
											onChange={(e) =>
												setShippingSettings({
													...shippingSettings,
													expressShippingCost: e.target.value,
												})
											}
										/>
									</div>

									<Separator />

									<div className="space-y-2">
										<Label htmlFor="origin-address">
											Store Address (Shipping Origin)
										</Label>
										<Textarea
											id="origin-address"
											value={shippingSettings.originAddress}
											onChange={(e) =>
												setShippingSettings({
													...shippingSettings,
													originAddress: e.target.value,
												})
											}
											rows={3}
										/>
									</div>
								</div>
							</CardContent>
							<CardFooter>
								<Button type="submit">Save Changes</Button>
							</CardFooter>
						</form>
					</Card>
				</TabsContent>

				{/* Notifications Settings */}
				<TabsContent value="notifications">
					<Card>
						<CardHeader>
							<CardTitle>Notification Settings</CardTitle>
							<CardDescription>
								Configure when and how you receive notifications
							</CardDescription>
						</CardHeader>
						<form onSubmit={handleNotificationsSubmit}>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									<h3 className="text-sm font-medium">Email Notifications</h3>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="order-confirmation">
												Order Confirmations
											</Label>
											<p className="text-sm text-muted-foreground">
												Send email when a new order is placed
											</p>
										</div>
										<Switch
											id="order-confirmation"
											checked={notificationSettings.emailOrderConfirmation}
											onCheckedChange={(checked) =>
												setNotificationSettings({
													...notificationSettings,
													emailOrderConfirmation: checked,
												})
											}
										/>
									</div>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="shipping-updates">Shipping Updates</Label>
											<p className="text-sm text-muted-foreground">
												Send email when an order's shipping status changes
											</p>
										</div>
										<Switch
											id="shipping-updates"
											checked={notificationSettings.emailShippingUpdates}
											onCheckedChange={(checked) =>
												setNotificationSettings({
													...notificationSettings,
													emailShippingUpdates: checked,
												})
											}
										/>
									</div>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="order-cancellation">
												Order Cancellations
											</Label>
											<p className="text-sm text-muted-foreground">
												Send email when an order is cancelled
											</p>
										</div>
										<Switch
											id="order-cancellation"
											checked={notificationSettings.emailOrderCancellation}
											onCheckedChange={(checked) =>
												setNotificationSettings({
													...notificationSettings,
													emailOrderCancellation: checked,
												})
											}
										/>
									</div>

									<Separator />

									<h3 className="text-sm font-medium">
										WhatsApp Notifications
									</h3>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="whatsapp-notifications">
												WhatsApp Updates
											</Label>
											<p className="text-sm text-muted-foreground">
												Receive order updates and notifications via WhatsApp
											</p>
										</div>
										<Switch
											id="whatsapp-notifications"
											checked={notificationSettings.whatsappNotifications}
											onCheckedChange={(checked) =>
												setNotificationSettings({
													...notificationSettings,
													whatsappNotifications: checked,
												})
											}
										/>
									</div>

									<Separator />

									<h3 className="text-sm font-medium">
										Marketing Notifications
									</h3>

									<div className="flex items-center justify-between">
										<div className="space-y-0.5">
											<Label htmlFor="marketing-emails">Marketing Emails</Label>
											<p className="text-sm text-muted-foreground">
												Receive marketing and promotional emails
											</p>
										</div>
										<Switch
											id="marketing-emails"
											checked={notificationSettings.marketingEmails}
											onCheckedChange={(checked) =>
												setNotificationSettings({
													...notificationSettings,
													marketingEmails: checked,
												})
											}
										/>
									</div>
								</div>
							</CardContent>
							<CardFooter>
								<Button type="submit">Save Changes</Button>
							</CardFooter>
						</form>
					</Card>
				</TabsContent>

				{/* Account Settings */}
				<TabsContent value="account">
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Account Information</CardTitle>
								<CardDescription>
									View and update your account details
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="admin-email">Email Address</Label>
									<Input
										id="admin-email"
										type="email"
										value={userSettings.adminEmail}
										onChange={(e) =>
											setUserSettings({
												...userSettings,
												adminEmail: e.target.value,
											})
										}
										readOnly
									/>
									<p className="text-sm text-muted-foreground">
										This is your admin account email
									</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Change Password</CardTitle>
								<CardDescription>Update your account password</CardDescription>
							</CardHeader>
							<form onSubmit={handlePasswordChange}>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="current-password">Current Password</Label>
										<Input
											id="current-password"
											type="password"
											value={userSettings.currentPassword}
											onChange={(e) =>
												setUserSettings({
													...userSettings,
													currentPassword: e.target.value,
												})
											}
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="new-password">New Password</Label>
										<Input
											id="new-password"
											type="password"
											value={userSettings.newPassword}
											onChange={(e) =>
												setUserSettings({
													...userSettings,
													newPassword: e.target.value,
												})
											}
											required
										/>
										<p className="text-sm text-muted-foreground">
											Password must be at least 8 characters long
										</p>
									</div>

									<div className="space-y-2">
										<Label htmlFor="confirm-password">
											Confirm New Password
										</Label>
										<Input
											id="confirm-password"
											type="password"
											value={userSettings.confirmPassword}
											onChange={(e) =>
												setUserSettings({
													...userSettings,
													confirmPassword: e.target.value,
												})
											}
											required
										/>
									</div>
								</CardContent>
								<CardFooter>
									<Button type="submit">Update Password</Button>
								</CardFooter>
							</form>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
