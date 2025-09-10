import { Suspense } from "react"
import ReduxProvider from "@/components/providers/redux-provider"
import { ThemeProvider } from "next-themes"
import "./globals.css"

export const metadata = {
	title: "FinBoard - Customizable Finance Dashboard",
	description: "Real-time customizable finance dashboard for tracking stocks, crypto, forex, and market data with drag-and-drop widgets",
	keywords: "finance, dashboard, stocks, crypto, forex, real-time, customizable",
	authors: [{ name: "FinBoard Team" }],
	generator: "Next.js",
	robots: "index, follow",
}

export const viewport = {
	width: "device-width",
	initialScale: 1,
}

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="font-sans antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem={true}
					disableTransitionOnChange={false}
					themes={["light", "dark", "system"]}
				>
					<ReduxProvider>
						<Suspense fallback={
							<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
								<div className="flex items-center gap-2">
									<div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
									<span>Loading FinBoard...</span>
								</div>
							</div>
						}>
							{children}
						</Suspense>
					</ReduxProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
