"use client"

import SessionProvider from "./session-provider"
import TanStackProvider from "./tanstack-provider"
import { Toaster } from "@/components/ui/sonner"

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			<TanStackProvider>
				{children}
				<Toaster />
			</TanStackProvider>
		</SessionProvider>
	)
}
