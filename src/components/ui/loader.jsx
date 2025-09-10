"use client"

import { useState, useEffect } from "react"
import { Loader2, Database, TrendingUp, BarChart3, CreditCard } from "lucide-react"

// Spinning loader component
export function Spinner({ size = "md", className = "" }) {
	const sizeClasses = {
		sm: "w-4 h-4",
		md: "w-5 h-5",
		lg: "w-6 h-6",
		xl: "w-8 h-8"
	}

	return (
		<div className={`${sizeClasses[size]} border-2 border-teal-500 border-t-transparent rounded-full animate-spin ${className}`} />
	)
}

// Pulsing skeleton loader
export function Skeleton({ className = "", width = "100%", height = "1rem" }) {
	return (
		<div
			className={`bg-slate-700 rounded animate-pulse ${className}`}
			style={{ width, height }}
		/>
	)
}

// Widget-specific loading states
export function WidgetLoader({ type = "generic", message = "Loading...", showProgress = false }) {
	const [dots, setDots] = useState("")
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			setDots(prev => prev.length >= 3 ? "" : prev + ".")
		}, 500)

		return () => clearInterval(interval)
	}, [])

	useEffect(() => {
		if (showProgress) {
			const interval = setInterval(() => {
				setProgress(prev => {
					if (prev >= 90) return 90
					return prev + Math.random() * 15
				})
			}, 200)

			return () => clearInterval(interval)
		}
	}, [showProgress])

	const getIcon = () => {
		switch (type) {
			case "table":
				return <Database className="w-6 h-6 text-teal-400" />
			case "chart":
				return <BarChart3 className="w-6 h-6 text-teal-400" />
			case "card":
				return <CreditCard className="w-6 h-6 text-teal-400" />
			case "api":
				return <TrendingUp className="w-6 h-6 text-teal-400" />
			default:
				return <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
		}
	}

	return (
		<div className="flex flex-col items-center justify-center h-32 space-y-3">
			<div className="flex items-center gap-3">
				{getIcon()}
				<div className="text-slate-300">
					{message}{dots}
				</div>
			</div>

			{showProgress && (
				<div className="w-32 bg-slate-700 rounded-full h-2">
					<div
						className="bg-teal-500 h-2 rounded-full transition-all duration-300"
						style={{ width: `${progress}%` }}
					/>
				</div>
			)}
		</div>
	)
}

// Table skeleton loader
export function TableSkeleton({ rows = 5, columns = 3 }) {
	return (
		<div className="space-y-3">
			{/* Header */}
			<div className="grid gap-4 p-4 bg-slate-800 rounded-lg" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
				{[...Array(columns)].map((_, i) => (
					<Skeleton key={i} height="1rem" className="bg-slate-600" />
				))}
			</div>

			{/* Rows */}
			{[...Array(rows)].map((_, rowIndex) => (
				<div key={rowIndex} className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
					{[...Array(columns)].map((_, colIndex) => (
						<Skeleton key={colIndex} height="1rem" className="bg-slate-700" />
					))}
				</div>
			))}
		</div>
	)
}

// Chart skeleton loader
export function ChartSkeleton() {
	return (
		<div className="h-64 relative bg-slate-800/50 rounded-lg overflow-hidden">
			{/* Chart area */}
			<div className="absolute inset-4">
				{/* Y-axis labels */}
				<div className="absolute left-0 top-0 bottom-0 w-8 space-y-4">
					{[...Array(5)].map((_, i) => (
						<Skeleton key={i} width="100%" height="0.75rem" />
					))}
				</div>

				{/* Chart bars/lines simulation */}
				<div className="ml-12 h-full flex items-end gap-2">
					{[...Array(12)].map((_, i) => (
						<div key={i} className="flex-1 space-y-1">
							<Skeleton
								height={`${Math.random() * 60 + 20}%`}
								className="w-full bg-slate-600"
							/>
							<Skeleton height="0.75rem" className="w-full" />
						</div>
					))}
				</div>
			</div>

			{/* Loading overlay */}
			<div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
				<div className="flex items-center gap-2">
					<Spinner size="md" />
					<span className="text-slate-400 text-sm">Loading chart...</span>
				</div>
			</div>
		</div>
	)
}

// Card skeleton loader
export function CardSkeleton({ variant = "summary" }) {
	if (variant === "watchlist") {
		return (
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<Skeleton width="1rem" height="1rem" />
					<Skeleton width="4rem" height="1rem" />
				</div>

				<div className="space-y-3">
					{[...Array(5)].map((_, i) => (
						<div key={i} className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Skeleton width="2rem" height="1rem" />
								<Skeleton width="6rem" height="0.875rem" />
							</div>
							<div className="text-right space-y-1">
								<Skeleton width="3rem" height="1rem" />
								<Skeleton width="2.5rem" height="0.75rem" />
							</div>
						</div>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{/* Main metric */}
			<div className="text-center space-y-2">
				<Skeleton width="8rem" height="2rem" className="mx-auto" />
				<Skeleton width="4rem" height="1rem" className="mx-auto" />
			</div>

			{/* Sub metrics */}
			<div className="grid grid-cols-2 gap-4">
				{[...Array(4)].map((_, i) => (
					<div key={i} className="text-center space-y-1">
						<Skeleton width="3rem" height="1rem" className="mx-auto" />
						<Skeleton width="2rem" height="0.75rem" className="mx-auto" />
					</div>
				))}
			</div>
		</div>
	)
}

// Full-page loading overlay
export function PageLoader({ message = "Loading dashboard..." }) {
	return (
		<div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
			<div className="text-center space-y-4">
				<div className="flex items-center justify-center">
					<div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
				</div>
				<div className="text-xl text-slate-300">{message}</div>
			</div>
		</div>
	)
}

// API loading states
export function ApiLoader({ service = "API", status = "connecting" }) {
	const statusMessages = {
		connecting: "Connecting to service...",
		authenticating: "Authenticating...",
		fetching: "Fetching data...",
		processing: "Processing response...",
	}

	return (
		<div className="flex items-center gap-3 p-4 bg-slate-800 rounded-lg">
			<Spinner size="sm" />
			<div className="text-sm">
				<div className="text-slate-300 font-medium">{service}</div>
				<div className="text-slate-400">{statusMessages[status] || status}</div>
			</div>
		</div>
	)
}
