import { z } from "zod"

export const productFormSchema = z.object({
	name: z.string().min(1, "Nama produk wajib diisi"),
	slug: z
		.string()
		.max(100, "Slug terlalu panjang")
		.regex(/^[a-z0-9-]+$/, {
			message: "Slug hanya boleh huruf kecil, angka, dan tanda minus (-)",
		})
		.optional()
		.or(z.literal("")),

	price: z
		.number({
			required_error: "Harga wajib diisi",
			invalid_type_error: "Harga harus berupa angka",
		})
		.min(0, "Harga harus lebih besar dari atau sama dengan 0"),

	description: z.string().optional(),

	categoryId: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.refine((val) => !isNaN(val) && val > 0, {
			message: "Kategori wajib dipilih",
		}),

	isNew: z.boolean().default(false),
	isFeatured: z.boolean().default(false),

	stock: z
		.number({
			required_error: "Stok wajib diisi",
			invalid_type_error: "Stok harus berupa angka",
		})
		.min(0, "Stok harus lebih besar dari atau sama dengan 0")
		.default(0),

	details: z
		.object({
			material: z.string().optional(),
			fit: z.string().optional(),
			care: z.string().optional(),
			origin: z.string().optional(),
		})
		.default({
			material: "",
			fit: "",
			care: "",
			origin: "",
		}),

	sizes: z.array(z.string().min(1, "Ukuran tidak boleh kosong")).default([]),

	colors: z.array(z.string().min(1, "Warna tidak boleh kosong")).default([]),
})

export type ProductFormValues = z.infer<typeof productFormSchema>
