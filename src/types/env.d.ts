declare global {
	namespace NodeJS {
		interface ProcessEnv {
			// Supabase
			NEXT_PUBLIC_SUPABASE_URL: string
			NEXT_PUBLIC_SUPABASE_ANON_KEY: string
			SUPABASE_SERVICE_ROLE_KEY?: string

			// Cloudinary
			CLOUDINARY_CLOUD_NAME: string
			CLOUDINARY_API_KEY: string
			CLOUDINARY_API_SECRET: string

			// Next.js
			NEXT_PUBLIC_SITE_URL: string

			// WhatsApp
			WHATSAPP_PHONE_NUMBER?: string

			// Optional: Payment Gateway
			STRIPE_SECRET_KEY?: string
			STRIPE_WEBHOOK_SECRET?: string
			NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string

			// Node environment
			NODE_ENV: "development" | "production" | "test"
		}
	}
}

// This export is necessary to make this a module
export {}
