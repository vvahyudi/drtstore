"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateCategory, useDeleteCategory } from "@/hooks/use-products"
import { toast } from "sonner"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, PlusCircle, Tag, Loader2 } from "lucide-react"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Category } from "@/types/api"
import { generateSlug } from "@/lib/utils"

// Form schema
const formSchema = z.object({
	name: z.string().min(2, {
		message: "Category name must be at least 2 characters.",
	}),
	description: z.string().optional(),
	slug: z.string().optional(),
	image_url: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CategoryManagementProps {
	categories: Category[]
	isLoading: boolean
}

export function CategoryManagement({
	categories,
	isLoading,
}: CategoryManagementProps) {
	const [selectedCategory, setSelectedCategory] = useState<Category | null>(
		null,
	)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

	// Mutations
	const { mutateAsync: createCategory, isPending: isCreating } =
		useCreateCategory()
	const { mutateAsync: deleteCategory, isPending: isDeleting } =
		useDeleteCategory()

	// Form setup
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			slug: "",
			image_url: "",
		},
	})

	// Watch name field to auto-generate slug
	const name = form.watch("name")

	// Set slug based on name
	useEffect(() => {
		if (name && !form.getValues("slug")) {
			form.setValue("slug", generateSlug(name))
		}
	}, [name, form])

	// Form submission handler
	const onSubmit = async (data: FormValues) => {
		try {
			// Ensure slug is set
			const finalData = {
				...data,
				slug: data.slug || generateSlug(data.name),
			}

			await createCategory(finalData)
			form.reset()
		} catch (error) {
			console.error("Error creating category:", error)
			toast.error("Failed to create category")
		}
	}

	// Delete handler
	const handleDeleteClick = (category: Category) => {
		setSelectedCategory(category)
		setIsDeleteDialogOpen(true)
	}

	// Confirm delete
	const confirmDelete = async () => {
		if (!selectedCategory) return

		try {
			await deleteCategory(selectedCategory.id)
			setIsDeleteDialogOpen(false)
			setSelectedCategory(null)
		} catch (error) {
			console.error("Error deleting category:", error)
			toast.error("Failed to delete category")
		}
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Add New Category</CardTitle>
					<CardDescription>
						Create a new product category for better organization.
					</CardDescription>
				</CardHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Category Name</FormLabel>
											<FormControl>
												<Input placeholder="e.g., Men's Clothing" {...field} />
											</FormControl>
											<FormDescription>
												Enter a descriptive name for the category.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="slug"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Slug</FormLabel>
											<FormControl>
												<Input placeholder="e.g., mens-clothing" {...field} />
											</FormControl>
											<FormDescription>
												URL-friendly identifier (auto-generated from name).
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem className="col-span-1 md:col-span-2">
											<FormLabel>Description</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Describe this category..."
													{...field}
													rows={3}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="image_url"
									render={({ field }) => (
										<FormItem className="col-span-1 md:col-span-2">
											<FormLabel>Image URL (Optional)</FormLabel>
											<FormControl>
												<Input
													placeholder="https://example.com/image.jpg"
													{...field}
												/>
											</FormControl>
											<FormDescription>
												Provide a URL for a category image (will be displayed in
												category listings).
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</CardContent>
						<CardFooter className="flex justify-between">
							<Button
								variant="outline"
								type="button"
								onClick={() => form.reset()}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isCreating}>
								{isCreating ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating...
									</>
								) : (
									<>
										<PlusCircle className="mr-2 h-4 w-4" />
										Create Category
									</>
								)}
							</Button>
						</CardFooter>
					</form>
				</Form>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Categories</CardTitle>
					<CardDescription>
						Manage your existing product categories.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : categories.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-center">
							<Tag className="h-12 w-12 text-muted-foreground mb-4" />
							<p className="text-muted-foreground">No categories found</p>
							<p className="text-sm text-muted-foreground mt-1">
								Create your first category to get started.
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>ID</TableHead>
									<TableHead>Category Name</TableHead>
									<TableHead>Slug</TableHead>
									<TableHead>Description</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{categories.map((category) => (
									<TableRow key={category.id}>
										<TableCell>{category.id}</TableCell>
										<TableCell className="font-medium">
											<Badge variant="outline" className="px-2 py-1">
												{category.name}
											</Badge>
										</TableCell>
										<TableCell>{category.slug}</TableCell>
										<TableCell className="max-w-xs truncate">
											{category.description || "—"}
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleDeleteClick(category)}
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will delete the category &quot;{selectedCategory?.name}
							&quot;. This action may affect products in this category.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault() // Prevent the dialog from closing automatically
								confirmDelete()
							}}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={isDeleting}
						>
							{isDeleting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								"Delete"
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
