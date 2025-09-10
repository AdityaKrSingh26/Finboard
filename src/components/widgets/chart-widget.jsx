"use client"

import { useState, useMemo, useEffect } from "react"
import {
	LineChart,
	Line,
	AreaChart,
	Area,
	ComposedChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ReferenceLine
} from "recharts"
import { Button } from "@/components/ui/button"
import { ChartSkeleton } from "@/components/ui/loader"
import { Dropdown, DropdownItem } from "@/components/ui/dropdown"
import {
	TrendingUp,
	TrendingDown,
	BarChart3,
	LineChart as LineChartIcon,
	Activity,
	RefreshCw,
	Calendar,
	GripVertical,
	Settings,
	X,
	ChevronDown
} from "lucide-react"
import { useAppDispatch } from "@/lib/store/hooks"
import { fetchWidgetData } from "@/lib/store/slices/widgets-slice"

export default function ChartWidget({ widget, dragHandleProps, onSettings, onRemove, title }) {
	const { data, loading, error, config } = widget
	const [chartType, setChartType] = useState(config?.chartType || "line")
	const [timeframe, setTimeframe] = useState(config?.timeframe || "daily")
	const dispatch = useAppDispatch()

	const handleRefreshData = () => {
		console.log("🔄 Manually refreshing chart data for widget:", widget.id)
		dispatch(fetchWidgetData({ widgetId: widget.id, config: { ...widget.config, forceRefresh: true } }))
	}

	// Generate chart data from the widget data
	const chartData = useMemo(() => {
		console.log("🔍 Chart Widget Debug:", {
			title: title || widget.title,
			data: data,
			dataType: typeof data,
			isArray: Array.isArray(data),
			dataLength: data?.length,
			firstItem: data?.[0],
			config: widget.config
		})

		if (!data || !Array.isArray(data)) return []

		let processedData = [...data]

		// Handle different data formats
		if (data[0]?.date) {
			// Check for different chart data types
			if (data[0]?.index_value !== undefined) {
				// Market trends data format
				processedData = data.map(item => ({
					...item,
					date: new Date(item.date).toLocaleDateString('en-US', { 
						month: 'short', 
						day: 'numeric' 
					}),
					value: item.index_value,
					close: item.index_value // For compatibility with existing chart logic
				}))
			} else if (data[0]?.open !== undefined) {
				// OHLC format from chart_data
				processedData = data.map(item => ({
					...item,
					date: new Date(item.date).toLocaleDateString('en-US', { 
						month: 'short', 
						day: 'numeric' 
					})
				}))
			} else {
				// Simple time series data
				processedData = data.map(item => ({
					...item,
					date: new Date(item.date).toLocaleDateString('en-US', { 
						month: 'short', 
						day: 'numeric' 
					})
				}))
			}
		} else if (data[0]?.timestamp) {
			// Time series data with timestamp
			processedData = data.map(item => ({
				...item,
				date: new Date(item.timestamp).toLocaleDateString('en-US', { 
					month: 'short', 
					day: 'numeric' 
				})
			}))
		} else if (data[0]?.symbol) {
			// Current stock data - create a simple price chart
			processedData = data.map((item, index) => ({
				symbol: item.symbol,
				price: item.price || item.c,
				change: item.change || item.d,
				change_percent: item.change_percent || item.dp,
				volume: item.volume,
				index: index + 1
			}))
		}

		// Apply timeframe filtering for time series data
		if (processedData.length > 0 && (processedData[0]?.date || processedData[0]?.timestamp)) {
			const now = new Date()
			let filterDays

			switch (timeframe) {
				case 'weekly':
					filterDays = 7
					break
				case 'monthly':
					filterDays = 30
					break
				case 'daily':
				default:
					filterDays = processedData.length > 30 ? 30 : processedData.length
					break
			}

			// Take the last N data points based on timeframe
			processedData = processedData.slice(-filterDays)
		}

		return processedData
	}, [data, timeframe])

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

		if (type === "volume") {
			const num = parseFloat(value)
			if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
			if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
			if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
			return num.toString()
		}

		return value
	}

	const getChangeColor = (value) => {
		const num = parseFloat(value)
		if (num > 0) return "#10b981" // green-500
		if (num < 0) return "#ef4444" // red-500
		return "#6b7280" // gray-500
	}

	const CustomTooltip = ({ active, payload, label }) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload

			return (
				<div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
					<p className="text-slate-200 font-medium mb-2">{label}</p>
					{payload.map((item, index) => (
						<div key={index} className="flex items-center justify-between gap-4 text-sm">
							<span className="text-slate-400">{item.name}:</span>
							<span style={{ color: item.color }}>
								{item.name.includes('Price') || item.name.includes('Close') || 
								 item.name.includes('Open') || item.name.includes('High') || 
								 item.name.includes('Low') ? 
									formatValue(item.value, "currency") : 
								 item.name.includes('Volume') ? 
									formatValue(item.value, "volume") :
								 item.name.includes('Change') && item.name.includes('%') ?
									formatValue(item.value, "percentage") :
									formatValue(item.value, "number")
								}
							</span>
						</div>
					))}
				</div>
			)
		}
		return null
	}

	const renderLineChart = () => {
		const hasOHLC = chartData[0]?.open !== undefined
		const hasIndexValue = chartData[0]?.index_value !== undefined || chartData[0]?.value !== undefined
		
		if (hasOHLC) {
			// OHLC Line Chart
			return (
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
						<XAxis 
							dataKey="date" 
							stroke="#9ca3af"
							fontSize={12}
							tickMargin={5}
						/>
						<YAxis 
							stroke="#9ca3af"
							fontSize={12}
							tickFormatter={(value) => formatValue(value, "currency")}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Line 
							type="monotone" 
							dataKey="close" 
							stroke="#10b981" 
							strokeWidth={2}
							dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
							activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
							name="Close Price"
						/>
						<Line 
							type="monotone" 
							dataKey="high" 
							stroke="#3b82f6" 
							strokeWidth={1}
							strokeDasharray="5 5"
							dot={false}
							name="High"
						/>
						<Line 
							type="monotone" 
							dataKey="low" 
							stroke="#ef4444" 
							strokeWidth={1}
							strokeDasharray="5 5"
							dot={false}
							name="Low"
						/>
					</LineChart>
				</ResponsiveContainer>
			)
		} else if (hasIndexValue) {
			// Market trends or index value chart
			return (
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
						<XAxis 
							dataKey="date" 
							stroke="#9ca3af"
							fontSize={12}
							tickMargin={5}
						/>
						<YAxis 
							stroke="#9ca3af"
							fontSize={12}
							tickFormatter={(value) => formatValue(value, "number")}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Line 
							type="monotone" 
							dataKey={chartData[0]?.index_value !== undefined ? "index_value" : "value"} 
							stroke="#10b981" 
							strokeWidth={2}
							dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
							activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
							name="Index Value"
						/>
					</LineChart>
				</ResponsiveContainer>
			)
		} else {
			// Simple price chart for current data
			return (
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
						<XAxis 
							dataKey="symbol" 
							stroke="#9ca3af"
							fontSize={12}
							angle={-45}
							textAnchor="end"
							height={60}
						/>
						<YAxis 
							stroke="#9ca3af"
							fontSize={12}
							tickFormatter={(value) => formatValue(value, "currency")}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Line 
							type="monotone" 
							dataKey="price" 
							stroke="#10b981" 
							strokeWidth={2}
							dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
							activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
							name="Price"
						/>
					</LineChart>
				</ResponsiveContainer>
			)
		}
	}

	const renderAreaChart = () => {
		const hasOHLC = chartData[0]?.open !== undefined
		const hasIndexValue = chartData[0]?.index_value !== undefined || chartData[0]?.value !== undefined
		
		return (
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart data={chartData}>
					<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
					<XAxis 
						dataKey={hasOHLC || hasIndexValue ? "date" : "symbol"} 
						stroke="#9ca3af"
						fontSize={12}
						angle={hasOHLC || hasIndexValue ? 0 : -45}
						textAnchor={hasOHLC || hasIndexValue ? "middle" : "end"}
						height={hasOHLC || hasIndexValue ? 30 : 60}
					/>
					<YAxis 
						stroke="#9ca3af"
						fontSize={12}
						tickFormatter={(value) => formatValue(value, hasIndexValue ? "number" : "currency")}
					/>
					<Tooltip content={<CustomTooltip />} />
					<Area 
						type="monotone" 
						dataKey={
							hasOHLC ? "close" : 
							hasIndexValue ? (chartData[0]?.index_value !== undefined ? "index_value" : "value") : 
							"price"
						} 
						stroke="#10b981" 
						fill="#10b981"
						fillOpacity={0.3}
						strokeWidth={2}
						name={hasOHLC ? "Close Price" : hasIndexValue ? "Index Value" : "Price"}
					/>
				</AreaChart>
			</ResponsiveContainer>
		)
	}

	const renderCandlestickChart = () => {
		const hasOHLC = chartData[0]?.open !== undefined
		
		if (!hasOHLC) {
			// For non-OHLC data, show a composed chart with price and volume
			return (
				<ResponsiveContainer width="100%" height="100%">
					<ComposedChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
						<XAxis 
							dataKey="symbol" 
							stroke="#9ca3af"
							fontSize={12}
							angle={-45}
							textAnchor="end"
							height={60}
						/>
						<YAxis 
							yAxisId="price"
							stroke="#9ca3af"
							fontSize={12}
							tickFormatter={(value) => formatValue(value, "currency")}
						/>
						<YAxis 
							yAxisId="volume"
							orientation="right"
							stroke="#9ca3af"
							fontSize={12}
							tickFormatter={(value) => formatValue(value, "volume")}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Bar 
							yAxisId="volume"
							dataKey="volume" 
							fill="#374151"
							fillOpacity={0.6}
							name="Volume"
						/>
						<Line 
							yAxisId="price"
							type="monotone" 
							dataKey="price" 
							stroke="#10b981" 
							strokeWidth={2}
							dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
							name="Price"
						/>
					</ComposedChart>
				</ResponsiveContainer>
			)
		}

		// Simulated candlestick using composed chart
		const candlestickData = chartData.map(item => ({
			...item,
			bullish: item.close >= item.open,
			bodyHeight: Math.abs(item.close - item.open),
			bodyStart: Math.min(item.open, item.close)
		}))

		return (
			<ResponsiveContainer width="100%" height="100%">
				<ComposedChart data={candlestickData}>
					<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
					<XAxis 
						dataKey="date" 
						stroke="#9ca3af"
						fontSize={12}
					/>
					<YAxis 
						stroke="#9ca3af"
						fontSize={12}
						tickFormatter={(value) => formatValue(value, "currency")}
					/>
					<Tooltip content={<CustomTooltip />} />
					
					{/* High-Low wicks */}
					<Bar dataKey="high" fill="transparent" />
					
					{/* Candle bodies */}
					<Bar 
						dataKey="bodyHeight" 
						stackId="candle"
						fill={(entry) => entry.bullish ? "#10b981" : "#ef4444"}
						name="OHLC"
					/>
					
					{/* Reference line for opening prices */}
					<ReferenceLine y={0} stroke="#6b7280" strokeDasharray="2 2" />
				</ComposedChart>
			</ResponsiveContainer>
		)
	}

	const renderChart = () => {
		switch (chartType) {
			case "area":
				return renderAreaChart()
			case "candlestick":
				return renderCandlestickChart()
			case "line":
			default:
				return renderLineChart()
		}
	}

	const getChartStats = () => {
		if (!chartData || chartData.length === 0) return null

		const hasOHLC = chartData[0]?.open !== undefined
		const hasIndexValue = chartData[0]?.index_value !== undefined || chartData[0]?.value !== undefined
		
		if (hasOHLC) {
			const latest = chartData[chartData.length - 1]
			const previous = chartData[chartData.length - 2]
			const change = previous ? latest.close - previous.close : 0
			const changePercent = previous ? ((change / previous.close) * 100) : 0

			return {
				current: latest.close,
				change,
				changePercent,
				high: Math.max(...chartData.map(d => d.high)),
				low: Math.min(...chartData.map(d => d.low)),
				volume: latest.volume
			}
		} else if (hasIndexValue) {
			const valueKey = chartData[0]?.index_value !== undefined ? "index_value" : "value"
			const latest = chartData[chartData.length - 1]
			const previous = chartData[chartData.length - 2]
			const change = previous ? latest[valueKey] - previous[valueKey] : 0
			const changePercent = previous ? ((change / previous[valueKey]) * 100) : 0

			return {
				current: latest[valueKey],
				change,
				changePercent,
				high: Math.max(...chartData.map(d => d[valueKey])),
				low: Math.min(...chartData.map(d => d[valueKey])),
				volume: latest.volume
			}
		} else {
			const prices = chartData.map(d => d.price).filter(p => p != null)
			const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
			const maxPrice = Math.max(...prices)
			const minPrice = Math.min(...prices)

			return {
				current: avgPrice,
				change: maxPrice - minPrice,
				changePercent: ((maxPrice - minPrice) / minPrice) * 100,
				high: maxPrice,
				low: minPrice,
				count: chartData.length
			}
		}
	}

	const stats = getChartStats()

	if (loading && !data) {
		return <ChartSkeleton />
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
				<Activity className="w-8 h-8 text-red-400" />
				<div>
					<div className="text-red-400 text-sm font-medium">Failed to load chart data</div>
					<div className="text-slate-500 text-xs mt-1">{error}</div>
				</div>
			</div>
		)
	}

	if (!chartData || chartData.length === 0) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<BarChart3 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
					<div className="text-slate-400 text-sm">No chart data available</div>
					<div className="text-slate-500 text-xs mt-1">
						{loading ? "Loading chart data..." : 
						 error ? `Error: ${error}` :
						 !data ? "No data received from API" :
						 !Array.isArray(data) ? "Invalid data format received" :
						 data.length === 0 ? "Empty data set received" :
						 "Check your data source configuration"}
					</div>
					{widget.config?.dataSource && (
						<div className="text-slate-500 text-xs mt-1">
							Data Source: {widget.config.dataSource}
							{widget.config.symbol && ` (${widget.config.symbol})`}
						</div>
					)}
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					{dragHandleProps && (
						<div {...dragHandleProps} className="cursor-move text-slate-400 hover:text-slate-300">
							<GripVertical className="w-4 h-4" />
						</div>
					)}
					<div>
						<h3 className="text-lg font-semibold text-black">
							{title || widget.title || "Price Chart"}
						</h3>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{/* Timeframe Selector Dropdown */}
					<Dropdown
						trigger={
							<Button
								variant="ghost"
								size="sm"
								className="text-slate-400 hover:text-white h-8 px-3 gap-2"
							>
								<Calendar className="w-4 h-4" />
								<span className="capitalize">{timeframe}</span>
								<ChevronDown className="w-3 h-3" />
							</Button>
						}
						align="left"
					>
						<DropdownItem
							onClick={() => setTimeframe("daily")}
							className={timeframe === "daily" ? "bg-slate-700 text-white" : ""}
						>
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4" />
								<span>Daily View</span>
							</div>
						</DropdownItem>
						<DropdownItem
							onClick={() => setTimeframe("weekly")}
							className={timeframe === "weekly" ? "bg-slate-700 text-white" : ""}
						>
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4" />
								<span>Weekly View</span>
							</div>
						</DropdownItem>
						<DropdownItem
							onClick={() => setTimeframe("monthly")}
							className={timeframe === "monthly" ? "bg-slate-700 text-white" : ""}
						>
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4" />
								<span>Monthly View</span>
							</div>
						</DropdownItem>
					</Dropdown>

					{/* Chart Type Selector */}
					<Dropdown
						trigger={
							<Button
								variant="ghost"
								size="sm"
								className="text-slate-400 hover:text-white h-8 px-3 gap-2"
							>
								{chartType === "line" && <LineChartIcon className="w-4 h-4" />}
								{chartType === "area" && <Activity className="w-4 h-4" />}
								{chartType === "candlestick" && <BarChart3 className="w-4 h-4" />}
								<span className="capitalize">{chartType}</span>
								<ChevronDown className="w-3 h-3" />
							</Button>
						}
						align="left"
					>
						<DropdownItem
							onClick={() => setChartType("line")}
							className={chartType === "line" ? "bg-slate-700 text-white" : ""}
						>
							<div className="flex items-center gap-2">
								<LineChartIcon className="w-4 h-4" />
								<span>Line Chart</span>
							</div>
						</DropdownItem>
						<DropdownItem
							onClick={() => setChartType("area")}
							className={chartType === "area" ? "bg-slate-700 text-white" : ""}
						>
							<div className="flex items-center gap-2">
								<Activity className="w-4 h-4" />
								<span>Area Chart</span>
							</div>
						</DropdownItem>
						<DropdownItem
							onClick={() => setChartType("candlestick")}
							className={chartType === "candlestick" ? "bg-slate-700 text-white" : ""}
						>
							<div className="flex items-center gap-2">
								<BarChart3 className="w-4 h-4" />
								<span>Candlestick</span>
							</div>
						</DropdownItem>
					</Dropdown>

					{/* Action Buttons */}
					<Button
						variant="ghost"
						size="sm"
						onClick={handleRefreshData}
						disabled={loading}
						className="text-slate-400 hover:text-white h-8 w-8 p-0"
						title="Refresh Data"
					>
						<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
					</Button>

					{onSettings && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onSettings}
							className="text-slate-400 hover:text-white h-8 w-8 p-0"
						>
							<Settings className="w-4 h-4" />
						</Button>
					)}

					{onRemove && (
						<Button
							variant="ghost"
							size="sm"
							onClick={onRemove}
							className="text-slate-400 hover:text-red-400 h-8 w-8 p-0"
						>
							<X className="w-4 h-4" />
						</Button>
					)}
				</div>
			</div>

			{/* Stats Summary */}
			{stats && (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-slate-800/50 rounded-lg">
					<div className="text-center">
						<div className="text-xs text-black mb-1">Current</div>
						<div className="text-sm font-medium text-black">
							{formatValue(stats.current, chartData[0]?.index_value !== undefined ? "number" : "currency")}
						</div>
					</div>
					<div className="text-center">
						<div className="text-xs text-black mb-1">Change</div>
						<div className={`text-sm font-medium flex items-center justify-center gap-1`}
							 style={{ color: getChangeColor(stats.change) }}>
							{stats.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
							{formatValue(stats.changePercent, "percentage")}
						</div>
					</div>
					<div className="text-center">
						<div className="text-xs text-black mb-1">High</div>
						<div className="text-sm font-medium text-black">
							{formatValue(stats.high, chartData[0]?.index_value !== undefined ? "number" : "currency")}
						</div>
					</div>
					<div className="text-center">
						<div className="text-xs text-black mb-1">Low</div>
						<div className="text-sm font-medium text-black">
							{formatValue(stats.low, chartData[0]?.index_value !== undefined ? "number" : "currency")}
						</div>
					</div>
				</div>
			)}

			{/* Chart */}
			<div className="bg-slate-900/50 rounded-lg h-64 p-4">
				{renderChart()}
			</div>

			{/* Chart Info Summary */}
			<div className="flex items-center justify-center gap-2 py-2 text-xs text-black">
				<span className="capitalize">{timeframe} View</span>
				<span>•</span>
				<span>{chartData.length} data points</span>
				<span>•</span>
				{timeframe === 'weekly' && <span>Last 7 days</span>}
				{timeframe === 'monthly' && <span>Last 30 days</span>}
				{timeframe === 'daily' && <span>Last {chartData.length} days</span>}
			</div>
		</div>
	)
}
