import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/**
 * Generate a URL-friendly slug from a string
 * @param str - The string to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(str: string): string {
	return str
		.toLowerCase()
		.replace(/[^\w\s-]/g, "") // Remove non-word chars
		.replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
		.replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
}

/**
 * Format a price in IDR currency format
 * @param price - The price to format
 * @returns Formatted price string (e.g., "Rp 100.000")
 */
export function formatCurrency(price: number): string {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

/**
 * Format a date to a readable string
 * @param date - The date to format
 * @returns Formatted date string (e.g. "January 1, 2023")
 */
export function formatDate(date: string | Date): string {
	return new Date(date).toLocaleDateString("id-ID", {
		year: "numeric",
		month: "long",
		day: "numeric",
	})
}

/**
 * Truncate a string to a specific length
 * @param str - The string to truncate
 * @param length - The maximum length
 * @returns Truncated string with ellipsis if needed
 */
export function truncateString(str: string, length: number): string {
	if (str.length <= length) return str
	return str.slice(0, length) + "..."
}
