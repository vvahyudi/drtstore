"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Loader2, X, Plus, Image as ImageIcon, Trash2 } from "lucide-react"
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
import { ProductFormData } from "@/services/product-service"
import { CloudinaryService } from "@/services/cloudinary-service"
import { Product } from "@/types/api"
import { toast } from "sonner"
import Image from "next/image"
import { generateSlug } from "@/lib/utils"

interface ProductFormProps {
	product?: Product
	isOpen: boolean
	onClose: () => void
	onSubmit: (data: ProductFormData) => Promise<Product>
	title: string
	categories: string[]
}

export function ProductForm({
	product,
	isOpen,
	onClose,
	onSubmit,
	title,
	categories,
}: ProductFormProps) {
	// Form state
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ProductFormData>({
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

	// Watch form fields
	const watchName = watch("name")
	const watchSlug = watch("slug")

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
	const [sizes, setSizes] = useState<string[]>(product?.sizes || [])
	const [newColor, setNewColor] = useState("")
	const [colors, setColors] = useState<string[]>(product?.colors || [])

	// Set sizes and colors
	useEffect(() => {
		if (product) {
			setSizes(product.sizes || [])
			setColors(product.colors || [])
		} else {
			setSizes([])
			setColors([])
		}
	}, [product])

	// Update form values when product changes
	useEffect(() => {
		if (product) {
			reset({
				name: product.name,
				slug: product.slug || "",
				price: product.price,
				description: product.description,
				category: product.category,
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
			reset({
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
	}, [product, reset, categories])

	// Auto-generate slug
	useEffect(() => {
		if (watchName && (!watchSlug || watchSlug === "")) {
			setValue("slug", generateSlug(watchName))
		}
	}, [watchName, watchSlug, setValue])

	// Handler for form submission
	const handleFormSubmit = async (data: ProductFormData) => {
		try {
			// Add sizes and colors to form data
			data.sizes = sizes
			data.colors = colors

			// Submit the form
			const savedProduct = await onSubmit(data)

			// If we have new images to upload, do it now
			if (productImages.some((img) => img.isNew)) {
				setIsUploading(true)

				// Upload new images
				for (const image of productImages.filter((img) => img.isNew)) {
					try {
						// Convert dataURL to File object
						const file = await dataURLtoFile(
							image.url,
							`product-${savedProduct.id}.jpg`,
						)

						// Upload the image
						await CloudinaryService.uploadProductImage(
							savedProduct.id,
							file,
							image.isPrimary || false,
						)
					} catch (error) {
						console.error("Error uploading image:", error)
						toast.error("Failed to upload one or more images")
					}
				}

				setIsUploading(false)
			}

			toast.success(
				product
					? "Product updated successfully"
					: "Product created successfully",
			)
			onClose()
		} catch (error) {
			console.error("Error saving product:", error)
			toast.error(
				product ? "Failed to update product" : "Failed to create product",
			)
		}
	}

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
		if (newSize && !sizes.includes(newSize)) {
			setSizes([...sizes, newSize])
			setNewSize("")
		}
	}

	// Remove size handler
	const handleRemoveSize = (size: string) => {
		setSizes(sizes.filter((s) => s !== size))
	}

	// Add color handler
	const handleAddColor = () => {
		if (newColor && !colors.includes(newColor)) {
			setColors([...colors, newColor])
			setNewColor("")
		}
	}

	// Remove color handler
	const handleRemoveColor = (color: string) => {
		setColors(colors.filter((c) => c !== color))
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

				<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Product Name */}
						<div className="space-y-2">
							<Label htmlFor="name">Product Name *</Label>
							<Input
								id="name"
								{...register("name", { required: "Product name is required" })}
								placeholder="Enter product name"
							/>
							{errors.name && (
								<p className="text-sm text-destructive">
									{errors.name.message}
								</p>
							)}
						</div>

						{/* Slug */}
						<div className="space-y-2">
							<Label htmlFor="slug">Slug</Label>
							<Input
								id="slug"
								{...register("slug")}
								placeholder="product-url-slug"
							/>
							<p className="text-xs text-muted-foreground">
								Auto-generated from name if left empty
							</p>
						</div>

						{/* Price */}
						<div className="space-y-2">
							<Label htmlFor="price">Price (IDR) *</Label>
							<Input
								id="price"
								type="number"
								{...register("price", {
									required: "Price is required",
									min: { value: 0, message: "Price cannot be negative" },
								})}
								placeholder="0"
							/>
							{errors.price && (
								<p className="text-sm text-destructive">
									{errors.price.message}
								</p>
							)}
						</div>

						{/* Stock */}
						<div className="space-y-2">
							<Label htmlFor="stock">Stock</Label>
							<Input
								id="stock"
								type="number"
								{...register("stock", {
									min: { value: 0, message: "Stock cannot be negative" },
								})}
								placeholder="0"
							/>
							{errors.stock && (
								<p className="text-sm text-destructive">
									{errors.stock.message}
								</p>
							)}
						</div>

						{/* Category */}
						<div className="space-y-2">
							<Label htmlFor="category">Category *</Label>
							<Select
								value={watch("category")}
								onValueChange={(value) => setValue("category", value)}
							>
								<SelectTrigger id="category">
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem key={category} value={category}>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.category && (
								<p className="text-sm text-destructive">
									{errors.category.message}
								</p>
							)}
						</div>

						{/* Features */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<Label htmlFor="isNew">Mark as New</Label>
								<Switch
									id="isNew"
									checked={watch("isNew")}
									onCheckedChange={(checked) => setValue("isNew", checked)}
								/>
							</div>
							<div className="flex items-center justify-between">
								<Label htmlFor="isFeatured">Feature on Homepage</Label>
								<Switch
									id="isFeatured"
									checked={watch("isFeatured")}
									onCheckedChange={(checked) => setValue("isFeatured", checked)}
								/>
							</div>
						</div>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							{...register("description")}
							placeholder="Enter product description"
							rows={4}
						/>
					</div>

					{/* Product Details */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium">Product Details</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="material">Material</Label>
								<Input
									id="material"
									{...register("details.material")}
									placeholder="e.g., Cotton, Leather"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="fit">Fit/Style</Label>
								<Input
									id="fit"
									{...register("details.fit")}
									placeholder="e.g., Regular, Slim"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="care">Care Instructions</Label>
								<Input
									id="care"
									{...register("details.care")}
									placeholder="e.g., Hand wash only"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="origin">Origin</Label>
								<Input
									id="origin"
									{...register("details.origin")}
									placeholder="e.g., Imported, Local"
								/>
							</div>
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
							{sizes.map((size) => (
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
							{colors.map((color) => (
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
												<span className="text-xs font-medium">Primary</span>
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
			</DialogContent>
		</Dialog>
	)
}
