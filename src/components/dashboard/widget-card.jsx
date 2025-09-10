"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, X, GripVertical, AlertCircle } from "lucide-react"

export default function WidgetCard({
	title,
	children,
	onSettings,
	onRemove,
	isDragging = false,
	loading = false,
	error = null,
	lastUpdated = null,
	dragHandleProps = {},
	isTableWidget = false,
}) {
	if (isTableWidget) {
		// For table widgets, render without card container and floating header
		return (
			<div className={`relative transition-all duration-200 ${isDragging ? "opacity-50 shadow-2xl ring-2 ring-primary/50 rotate-2" : ""
				}`}>
				{error ? (
					<div className="text-center py-4">
						<p className="text-destructive text-sm">{error}</p>
					</div>
				) : (
					React.cloneElement(children, {
						dragHandleProps,
						onSettings,
						onRemove,
						title
					})
				)}
			</div>
		)
	}

	return (
		<Card
			className={`bg-card border-border theme-transition ${isDragging ? "opacity-50 shadow-2xl ring-2 ring-primary/50 rotate-2" : "hover:shadow-lg"
				} ${isTableWidget ? "overflow-hidden" : ""}`}
		>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium text-card-foreground flex items-center gap-2">
					<div
						{...dragHandleProps}
						className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-accent transition-colors"
					>
						<GripVertical className="w-4 h-4 text-muted-foreground" />
					</div>
					{title}
					{loading && <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />}
					{error && <AlertCircle className="w-4 h-4 text-destructive" />}
				</CardTitle>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						onClick={onSettings}
						className="h-8 w-8 p-0 text-muted-foreground hover:text-card-foreground hover:bg-accent"
					>
						<Settings className="w-4 h-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={onRemove}
						className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-accent"
					>
						<X className="w-4 h-4" />
					</Button>
				</div>
			</CardHeader>
			<CardContent className={isTableWidget ? "p-0" : ""}>
				{error ? (
					<div className="text-center py-4">
						<p className="text-destructive text-sm">{error}</p>
					</div>
				) : (
					<div className={isTableWidget ? "p-4" : ""}>
						{children}
					</div>
				)}
				{lastUpdated && !isTableWidget && (
					<div className="pt-2 mt-2 border-t border-border">
						<p className="text-xs text-muted-foreground">Last updated: {new Date(lastUpdated).toLocaleTimeString()}</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
