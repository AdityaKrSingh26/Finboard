"use client"

import { useState } from "react"
import {
	TrendingUp,
	TrendingDown,
	DollarSign,
	Eye,
	Star,
	Activity,
	BarChart3,
	ArrowUpCircle,
	ArrowDownCircle,
	Clock,
	Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardSkeleton } from "@/components/ui/loader"

export default function CardWidget({ widget, searchQuery = "" }) {
	const { data, loading, error, config } = widget
	const [selectedView, setSelectedView] = useState(config?.cardType || "summary")

	const formatValue = (value, type = "currency") => {
		if (value === null || value === undefined) return "—"

		if (type === "currency") {
			return `$${parseFloat(value).toLocaleString()}`
		}

		if (type === "percentage") {
			const num = parseFloat(value)
			return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
		}

		if (type === "number") {
			return parseFloat(value).toLocaleString()
		}

		return value
	}

	const getChangeColor = (value) => {
		const num = parseFloat(value)
		if (num > 0) return "text-green-400"
		if (num < 0) return "text-red-400"
		return "text-slate-400"
	}

	const getChangeIcon = (value) => {
		const num = parseFloat(value)
		if (num > 0) return <TrendingUp className="w-4 h-4" />
		if (num < 0) return <TrendingDown className="w-4 h-4" />
		return <Activity className="w-4 h-4" />
	}

	const renderWatchlist = (watchlistData) => (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-sm font-medium text-slate-300">
				<Star className="w-4 h-4" />
				Watchlist
			</div>
			<div className="space-y-2">
				{watchlistData.slice(0, 5).map((item, index) => (
					<div key={index} className="flex items-center justify-between py-2 px-3 bg-slate-800 rounded-lg">
						<div className="flex items-center gap-2">
							<div className="text-sm font-medium text-white">{item.symbol}</div>
							<div className="text-xs text-slate-400">{item.name}</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="text-sm text-white">{formatValue(item.price)}</div>
							<div className={`flex items-center gap-1 text-xs ${getChangeColor(item.change_percent)}`}>
								{getChangeIcon(item.change_percent)}
								{formatValue(item.change_percent, "percentage")}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)

	const renderGainersLosers = (gainersData, losersData) => (
		<div className="space-y-4">
			{/* Top Gainers */}
			<div className="space-y-2">
				<div className="flex items-center gap-2 text-sm font-medium text-green-400">
					<ArrowUpCircle className="w-4 h-4" />
					Top Gainers
				</div>
				<div className="space-y-1">
					{gainersData.slice(0, 3).map((item, index) => (
						<div key={index} className="flex items-center justify-between py-1 px-2 bg-green-500/10 rounded">
							<div className="text-xs text-white">{item.symbol}</div>
							<div className="text-xs text-green-400">+{item.change_percent.toFixed(2)}%</div>
						</div>
					))}
				</div>
			</div>

			{/* Top Losers */}
			<div className="space-y-2">
				<div className="flex items-center gap-2 text-sm font-medium text-red-400">
					<ArrowDownCircle className="w-4 h-4" />
					Top Losers
				</div>
				<div className="space-y-1">
					{losersData.slice(0, 3).map((item, index) => (
						<div key={index} className="flex items-center justify-between py-1 px-2 bg-red-500/10 rounded">
							<div className="text-xs text-white">{item.symbol}</div>
							<div className="text-xs text-red-400">{item.change_percent.toFixed(2)}%</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)

	const renderMarketIndices = (indicesData) => (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-sm font-medium text-slate-300">
				<BarChart3 className="w-4 h-4" />
				Market Indices
			</div>
			<div className="grid grid-cols-2 gap-2">
				{indicesData.map((index, i) => (
					<div key={i} className="p-3 bg-slate-800 rounded-lg">
						<div className="text-xs text-slate-400 mb-1">{index.name}</div>
						<div className="text-sm font-medium text-white">{formatValue(index.value, "number")}</div>
						<div className={`flex items-center gap-1 text-xs ${getChangeColor(index.change_percent)}`}>
							{getChangeIcon(index.change_percent)}
							{formatValue(index.change_percent, "percentage")}
						</div>
					</div>
				))}
			</div>
		</div>
	)

	const renderCommodities = (commoditiesData) => (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-sm font-medium text-slate-300">
				<Globe className="w-4 h-4" />
				Commodities
			</div>
			<div className="space-y-2">
				{commoditiesData.map((commodity, index) => (
					<div key={index} className="flex items-center justify-between py-2 px-3 bg-slate-800 rounded-lg">
						<div>
							<div className="text-sm font-medium text-white">{commodity.name}</div>
							<div className="text-xs text-slate-400">{commodity.unit}</div>
						</div>
						<div className="text-right">
							<div className="text-sm text-white">{formatValue(commodity.price)}</div>
							<div className={`flex items-center gap-1 text-xs ${getChangeColor(commodity.change_percent)}`}>
								{getChangeIcon(commodity.change_percent)}
								{formatValue(commodity.change_percent, "percentage")}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)

	const renderSingleMetric = (metricData) => {
		const value = metricData.value || metricData.price || metricData.rate
		const change = metricData.change || metricData.change_percent || metricData.change_24h
		const label = metricData.name || metricData.symbol || metricData.pair || "Value"

		return (
			<div className="text-center space-y-4">
				<div className="space-y-2">
					<div className="text-3xl font-bold text-white">
						{formatValue(value, metricData.type || "currency")}
					</div>
					<div className="text-sm text-slate-400">{label}</div>
				</div>

				{change !== undefined && (
					<div className="space-y-1">
						<div className={`flex items-center justify-center gap-2 text-lg font-semibold ${getChangeColor(change)}`}>
							{getChangeIcon(change)}
							{formatValue(change, "percentage")}
						</div>
						<div className="flex items-center justify-center gap-1 text-xs text-slate-400">
							<Clock className="w-3 h-3" />
							24h Change
						</div>
					</div>
				)}

				{metricData.volume && (
					<div className="pt-2 border-t border-slate-700">
						<div className="text-xs text-slate-400">Volume</div>
						<div className="text-sm text-white">{formatValue(metricData.volume, "number")}</div>
					</div>
				)}
			</div>
		)
	}

	if (loading && !data) {
		return <CardSkeleton variant={selectedView} />
	}

	if (error) {
		return (
			<div className="text-center py-8">
				<div className="text-red-400 mb-2">Error loading data</div>
				<div className="text-slate-500 text-sm">{error}</div>
			</div>
		)
	}

	if (!data) {
		return (
			<div className="text-center py-8">
				<Eye className="w-8 h-8 text-slate-400 mx-auto mb-2" />
				<p className="text-slate-400">No data available</p>
				<p className="text-slate-500 text-sm">Check your data source configuration</p>
			</div>
		)
	}

	// Handle different data sources from the mock data
	if (config?.dataSource === "market_summary" || 
		config?.dataSource === "watchlist" || 
		config?.dataSource === "performance_data" || 
		config?.dataSource === "financial_data") {
		
		// Show different views based on displayFields config or dataSource
		const { displayFields } = config

		// For watchlist data source, show watchlist by default
		if (config?.dataSource === "watchlist" && data.watchlist) {
			return renderWatchlist(data.watchlist)
		}

		// For performance_data, show gainers/losers by default
		if (config?.dataSource === "performance_data" && data.gainers && data.losers) {
			return renderGainersLosers(data.gainers, data.losers)
		}

		// For financial_data, show indices by default
		if (config?.dataSource === "financial_data" && data.indices) {
			return renderMarketIndices(data.indices)
		}

		// For market_summary, use displayFields to determine what to show
		if (config?.dataSource === "market_summary") {
			if (displayFields.includes("watchlist") && data.watchlist) {
				return renderWatchlist(data.watchlist)
			}

			if (displayFields.includes("gainers") && displayFields.includes("losers") && data.gainers && data.losers) {
				return renderGainersLosers(data.gainers, data.losers)
			}

			if (displayFields.includes("indices") && data.indices) {
				return renderMarketIndices(data.indices)
			}

			if (displayFields.includes("commodities") && data.commodities) {
				return renderCommodities(data.commodities)
			}
		}

		// Fallback: try to show any available data
		if (data.watchlist && data.watchlist.length > 0) {
			return renderWatchlist(data.watchlist)
		}
		if (data.gainers && data.losers) {
			return renderGainersLosers(data.gainers, data.losers)
		}
		if (data.indices && data.indices.length > 0) {
			return renderMarketIndices(data.indices)
		}
		if (data.commodities && data.commodities.length > 0) {
			return renderCommodities(data.commodities)
		}
	}

	// Handle array data - show summary or first item
	if (Array.isArray(data)) {
		if (data.length === 0) {
			return (
				<div className="text-center py-8">
					<div className="text-slate-400">No items to display</div>
				</div>
			)
		}

		// For array data, show the first item as a single metric
		return renderSingleMetric(data[0])
	}

	// Handle single object data
	return renderSingleMetric(data)
}
