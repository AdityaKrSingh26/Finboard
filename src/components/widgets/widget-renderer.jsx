"use client"

import { useState, useEffect } from "react"
import TableWidget from "./table-widget"
import CardWidget from "./card-widget"
import ChartWidget from "./chart-widget"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WidgetLoader } from "@/components/ui/loader"
import { useAppDispatch } from "@/lib/store/hooks"
import { fetchWidgetData, clearWidgetError } from "@/lib/store/slices/widgets-slice"

export default function WidgetRenderer({ widget, searchQuery = "", dragHandleProps, onSettings, onRemove, title }) {
	const dispatch = useAppDispatch()
	const [retryCount, setRetryCount] = useState(0)
	const maxRetries = 3

	// Handle data processing based on widget config
	const processWidgetData = (widget) => {
		if (!widget?.data) return null

		const { data, config } = widget

		// Handle different data sources from our mock data structure
		switch (config?.dataSource) {
			case "stocks":
				return data // Already in correct format

			case "crypto":
				return data // Already in correct format

			case "forex":
				return data // Already in correct format

			case "chart_data":
				// For chart data, return as-is since it's already in the correct format
				return data

			case "market_summary":
				// Return the market summary object with nested data
				return {
					watchlist: data.watchlist || [],
					gainers: data.gainers || [],
					losers: data.losers || [],
					indices: data.indices || [],
					commodities: data.commodities || [],
				}

			default:
				return data
		}
	}

	const processedWidget = {
		...widget,
		data: processWidgetData(widget)
	}

	const handleRetry = () => {
		if (retryCount < maxRetries) {
			setRetryCount(prev => prev + 1)
			dispatch(clearWidgetError(widget.id))
			dispatch(fetchWidgetData({
				widgetId: widget.id,
				config: { ...widget.config, forceRefresh: true }
			}))
		}
	}

	// Reset retry count when widget loads successfully
	useEffect(() => {
		if (widget.data && !widget.error) {
			setRetryCount(0)
		}
	}, [widget.data, widget.error])

	if (widget.loading && !widget.data) {
		return <WidgetLoader
			type={widget.type}
			message={`Loading ${widget.title || widget.type} data`}
			showProgress={true}
		/>
	}

	if (widget.error) {
		return (
			<div className="flex flex-col items-center justify-center h-32 text-center space-y-3">
				<AlertCircle className="w-8 h-8 text-red-400" />
				<div>
					<div className="text-red-400 text-sm font-medium">Failed to load data</div>
					<div className="text-slate-500 text-xs mt-1">{widget.error}</div>
				</div>
				{retryCount < maxRetries && (
					<Button
						variant="outline"
						size="sm"
						onClick={handleRetry}
						className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
					>
						<RotateCcw className="w-3 h-3 mr-2" />
						Retry ({retryCount + 1}/{maxRetries})
					</Button>
				)}
			</div>
		)
	}

	if (!processedWidget.data) {
		return (
			<div className="flex items-center justify-center h-32">
				<div className="text-center">
					<div className="text-slate-400 text-sm">No data available</div>
					<div className="text-slate-500 text-xs mt-1">Check your widget configuration</div>
				</div>
			</div>
		)
	}

	try {
		switch (widget.type) {
			case "table":
				return <TableWidget
					widget={processedWidget}
					searchQuery={searchQuery}
					dragHandleProps={dragHandleProps}
					onSettings={onSettings}
					onRemove={onRemove}
					title={title}
				/>

			case "card":
				return <CardWidget widget={processedWidget} searchQuery={searchQuery} />

			case "chart":
				return <ChartWidget
					widget={processedWidget}
					dragHandleProps={dragHandleProps}
					onSettings={onSettings}
					onRemove={onRemove}
					title={title}
				/>

			default:
				return (
					<div className="flex items-center justify-center h-32">
						<div className="text-center">
							<AlertCircle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
							<div className="text-slate-400 text-sm">Unsupported widget type</div>
							<div className="text-slate-500 text-xs">Type: {widget.type}</div>
						</div>
					</div>
				)
		}
	} catch (error) {
		console.error("Error rendering widget:", error)

		return (
			<div className="flex flex-col items-center justify-center h-32 text-center space-y-2">
				<AlertCircle className="w-6 h-6 text-red-400" />
				<div>
					<div className="text-red-400 text-sm">Rendering Error</div>
					<div className="text-slate-500 text-xs">
						{error.message || "An unexpected error occurred"}
					</div>
				</div>
			</div>
		)
	}
}
