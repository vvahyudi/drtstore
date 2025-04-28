"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
	Loader2,
	X,
	Plus,
	Image as ImageIcon,
	Trash2,
	Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { useUploadProductImage } from "@/hooks/use-products"
import { productFormSchema, ProductFormValues } from "@/schemas/product-schema"
import { Product } from "@/types/api"
import { toast } from "sonner"
import Image from "next/image"
import { generateSlug } from "@/lib/utils"

interface ProductFormProps {
	product?: Product
	isOpen: boolean
	onClose: () => void
	onSubmit: (data: ProductFormValues) => void
	isSubmitting: boolean
	title: string
	categories: string[]
}

export function ProductForm({
	product,
	isOpen,
	onClose,
	onSubmit,
	isSubmitting,
	title,
	categories,
}: ProductFormProps) {
	// Setup form with zod validation
	const form = useForm<ProductFormValues>({
		resolver: zodResolver(productFormSchema),
		defaultValues: {
			name: product?.name || "",
			slug: product?.slug || "",
			price: product?.price || 0,
			description: product?.description || "",
			category:
				product?.category || (categories.length > 0 ? categories[0] : ""),
			isNew: product?.isNew || false,
			isFeatured: product?.isFeatured || false,
			stock: product?.stock || 0,
			details: product?.details || {
				material: "",
				fit: "",
				care: "",
				origin: "",
			},
			sizes: product?.sizes || [],
			colors: product?.colors || [],
		},
	})

	// Additional state for UI
	const [isUploading, setIsUploading] = useState(false)
	const [productImages, setProductImages] = useState<
		Array<{ id?: number; url: string; isNew?: boolean; isPrimary?: boolean }>
	>(
		product?.images?.map((url, index) => ({
			url,
			isNew: false,
			isPrimary: url === product.image,
		})) || [],
	)

	// Size and color inputs
	const [newSize, setNewSize] = useState("")
	const [newColor, setNewColor] = useState("")

	// Image upload mutation
	const { mutateAsync: uploadImage } = useUploadProductImage()

	// Watch form values for slug auto-generation
	const watchName = form.watch("name")
	const watchSlug = form.watch("slug")

	// Update form values when product changes
	useEffect(() => {
		if (product) {
			form.reset({
				name: product?.name || "",
				slug: product.slug || "",
				price: product.price,
				description: product.description,

				categoryId: product?.categoryId || categories[0]?.id || 1,
				isNew: product.isNew,
				isFeatured: product.isFeatured,
				stock: product.stock || 0,
				details: product.details,
				sizes: product.sizes,
				colors: product.colors,
			})
			setProductImages(
				product.images?.map((url, index) => ({
					url,
					isNew: false,
					isPrimary: url === product.image,
				})) || [],
			)
		} else {
			form.reset({
				name: "",
				slug: "",
				price: 0,
				description: "",
				category: categories.length > 0 ? categories[0] : "",
				isNew: false,
				isFeatured: false,
				stock: 0,
				details: {
					material: "",
					fit: "",
					care: "",
					origin: "",
				},
				sizes: [],
				colors: [],
			})
			setProductImages([])
		}
	}, [product, form, categories])

	// Auto-generate slug
	useEffect(() => {
		if (watchName && (!watchSlug || watchSlug === "")) {
			form.setValue("slug", generateSlug(watchName))
		}
	}, [watchName, watchSlug, form])

	// Handler for image upload
	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (!files || files.length === 0) return

		// Process each file
		Array.from(files).forEach((file) => {
			const reader = new FileReader()
			reader.onload = (event) => {
				if (event.target?.result) {
					setProductImages((prev) => [
						...prev,
						{
							url: event.target?.result as string,
							isNew: true,
							isPrimary: prev.length === 0, // First image is primary by default
						},
					])
				}
			}
			reader.readAsDataURL(file)
		})

		// Clear the input
		e.target.value = ""
	}

	// Handler for removing an image
	const handleRemoveImage = (index: number) => {
		setProductImages((prev) => {
			const newImages = [...prev]
			newImages.splice(index, 1)

			// If we removed the primary image, set the first image as primary
			if (prev[index]?.isPrimary && newImages.length > 0) {
				newImages[0].isPrimary = true
			}

			return newImages
		})
	}

	// Handler for setting primary image
	const handleSetPrimaryImage = (index: number) => {
		setProductImages((prev) => {
			return prev.map((img, i) => ({
				...img,
				isPrimary: i === index,
			}))
		})
	}

	// Convert data URL to File
	const dataURLtoFile = async (
		dataUrl: string,
		filename: string,
	): Promise<File> => {
		const res = await fetch(dataUrl)
		const blob = await res.blob()
		return new File([blob], filename, { type: blob.type })
	}

	// Add size handler
	const handleAddSize = () => {
		if (newSize && !form.getValues("sizes").includes(newSize)) {
			form.setValue("sizes", [...form.getValues("sizes"), newSize])
			setNewSize("")
		}
	}

	// Remove size handler
	const handleRemoveSize = (size: string) => {
		form.setValue(
			"sizes",
			form.getValues("sizes").filter((s) => s !== size),
		)
	}

	// Add color handler
	const handleAddColor = () => {
		if (newColor && !form.getValues("colors").includes(newColor)) {
			form.setValue("colors", [...form.getValues("colors"), newColor])
			setNewColor("")
		}
	}

	// Remove color handler
	const handleRemoveColor = (color: string) => {
		form.setValue(
			"colors",
			form.getValues("colors").filter((c) => c !== color),
		)
	}

	// Submit handler
	const handleFormSubmit = async (data: ProductFormValues) => {
		try {
			// Submit the form data
			onSubmit(data)
		} catch (error) {
			console.error("Error saving product:", error)
			toast.error("Failed to save product")
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						{product
							? "Edit the details of your product"
							: "Add a new product to your store"}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleFormSubmit)}
						className="space-y-6"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Product Name */}
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Product Name *</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Enter product name" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Slug */}
							<FormField
								control={form.control}
								name="slug"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Slug</FormLabel>
										<FormControl>
											<Input {...field} placeholder="product-url-slug" />
										</FormControl>
										<p className="text-xs text-muted-foreground">
											Auto-generated from name if left empty
										</p>
									</FormItem>
								)}
							/>

							{/* Price */}
							<FormField
								control={form.control}
								name="price"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Price (IDR) *</FormLabel>
										<FormControl>
											<Input
												type="number"
												{...field}
												placeholder="0"
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Stock */}
							<FormField
								control={form.control}
								name="stock"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Stock</FormLabel>
										<FormControl>
											<Input
												type="number"
												{...field}
												placeholder="0"
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Category */}
							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Category *</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select category" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{categories.map((category) => (
													<SelectItem
														key={category.id}
														value={category.id.toString()}
													>
														{category.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* Features */}
							<div className="space-y-4">
								<FormField
									control={form.control}
									name="isNew"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
											<div className="space-y-0.5">
												<FormLabel>Mark as New</FormLabel>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="isFeatured"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
											<div className="space-y-0.5">
												<FormLabel>Feature on Homepage</FormLabel>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Description */}
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder="Enter product description"
											rows={4}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Product Details */}
						<div className="space-y-4">
							<h3 className="text-sm font-medium">Product Details</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="details.material"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Material</FormLabel>
											<FormControl>
												<Input {...field} placeholder="e.g., Cotton, Leather" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="details.fit"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Fit/Style</FormLabel>
											<FormControl>
												<Input {...field} placeholder="e.g., Regular, Slim" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="details.care"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Care Instructions</FormLabel>
											<FormControl>
												<Input {...field} placeholder="e.g., Hand wash only" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="details.origin"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Origin</FormLabel>
											<FormControl>
												<Input {...field} placeholder="e.g., Imported, Local" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Sizes */}
						<div className="space-y-4">
							<h3 className="text-sm font-medium">Sizes</h3>
							<div className="flex gap-2 items-end">
								<div className="flex-1">
									<Input
										placeholder="Enter size (e.g., S, M, L, XL or 38, 39, 40)"
										value={newSize}
										onChange={(e) => setNewSize(e.target.value)}
									/>
								</div>
								<Button type="button" onClick={handleAddSize}>
									Add
								</Button>
							</div>
							<div className="flex flex-wrap gap-2">
								{form.getValues("sizes").map((size) => (
									<div
										key={size}
										className="flex items-center gap-1 bg-muted px-3 py-1 rounded-md"
									>
										<span>{size}</span>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="h-5 w-5"
											onClick={() => handleRemoveSize(size)}
										>
											<X className="h-3 w-3" />
										</Button>
									</div>
								))}
							</div>
						</div>

						{/* Colors */}
						<div className="space-y-4">
							<h3 className="text-sm font-medium">Colors</h3>
							<div className="flex gap-2 items-end">
								<div className="flex-1">
									<Input
										placeholder="Enter color (e.g., Blue, Red, Black)"
										value={newColor}
										onChange={(e) => setNewColor(e.target.value)}
									/>
								</div>
								<Button type="button" onClick={handleAddColor}>
									Add
								</Button>
							</div>
							<div className="flex flex-wrap gap-2">
								{form.getValues("colors").map((color) => (
									<div
										key={color}
										className="flex items-center gap-1 bg-muted px-3 py-1 rounded-md"
									>
										<span>{color}</span>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="h-5 w-5"
											onClick={() => handleRemoveColor(color)}
										>
											<X className="h-3 w-3" />
										</Button>
									</div>
								))}
							</div>
						</div>

						{/* Images */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium">Product Images</h3>
								<Label
									htmlFor="image-upload"
									className="cursor-pointer flex items-center gap-2 text-sm text-primary"
								>
									<Plus className="h-4 w-4" />
									Add Images
									<Input
										id="image-upload"
										type="file"
										accept="image/*"
										multiple
										className="hidden"
										onChange={handleImageUpload}
									/>
								</Label>
							</div>

							{productImages.length === 0 ? (
								<div className="border border-dashed rounded-lg p-8 text-center">
									<ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
									<p className="mt-2 text-sm text-muted-foreground">
										No images uploaded yet
									</p>
									<Label
										htmlFor="image-upload-empty"
										className="mt-4 cursor-pointer inline-flex items-center gap-2 text-sm text-primary"
									>
										<Plus className="h-4 w-4" />
										Add Images
										<Input
											id="image-upload-empty"
											type="file"
											accept="image/*"
											multiple
											className="hidden"
											onChange={handleImageUpload}
										/>
									</Label>
								</div>
							) : (
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
									{productImages.map((image, index) => (
										<div
											key={index}
											className={`relative group border rounded-lg overflow-hidden aspect-square ${
												image.isPrimary ? "ring-2 ring-primary" : ""
											}`}
										>
											<Image
												src={image.url}
												alt={`Product image ${index + 1}`}
												fill
												className="object-cover"
											/>
											<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
												<Button
													type="button"
													variant="secondary"
													size="icon"
													className="h-8 w-8"
													onClick={() => handleSetPrimaryImage(index)}
													disabled={image.isPrimary}
												>
													<Check className="h-4 w-4" />
												</Button>
												<Button
													type="button"
													variant="destructive"
													size="icon"
													className="h-8 w-8"
													onClick={() => handleRemoveImage(index)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
											{image.isPrimary && (
												<div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
													Primary
												</div>
											)}
											{image.isNew && (
												<div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
													New
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={isSubmitting || isUploading}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting || isUploading}>
								{(isSubmitting || isUploading) && (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								)}
								{product ? "Update Product" : "Create Product"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
