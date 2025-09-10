"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ApiLoader, Spinner } from "@/components/ui/loader"
import ApiResponseExplorer from "./api-response-explorer"
import {
	X,
	BarChart3,
	Table,
	CreditCard,
	Database,
	Settings,
	CheckCircle,
	AlertCircle,
	Loader2,
	TrendingUp,
	TrendingDown,
	DollarSign,
	Globe,
	Activity,
	Zap,
	Search
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { testApiConnection, selectApiTestResult, selectApiTesting, clearApiTestResult } from "@/lib/store/slices/widgets-slice"

const DATA_SOURCES = {
	table: [
		{
			id: "stocks",
			name: "Stock Market",
			icon: TrendingUp,
			description: "Stock prices, market data with pagination",
			defaultFields: ["company", "symbol", "price", "change_percent", "volume"],
			sampleUrl: "https://api.example.com/stocks"
		},
		{
			id: "crypto",
			name: "Cryptocurrency Table",
			icon: DollarSign,
			description: "Crypto prices in table format",
			defaultFields: ["name", "symbol", "price", "change_percent_24h", "market_cap"],
			sampleUrl: "https://api.coinbase.com/v2/exchange-rates"
		},
		{
			id: "market_gainers",
			name: "Market Gainers",
			icon: TrendingUp,
			description: "Top performing stocks",
			defaultFields: ["company", "symbol", "price", "change_percent"],
			sampleUrl: "https://api.example.com/gainers"
		},
		{
			id: "market_losers",
			name: "Market Losers",
			icon: TrendingDown,
			description: "Worst performing stocks",
			defaultFields: ["company", "symbol", "price", "change_percent"],
			sampleUrl: "https://api.example.com/losers"
		}
	],
	card: [
		{
			id: "watchlist",
			name: "Watchlist",
			icon: Activity,
			description: "Your favorite stocks overview",
			defaultFields: ["symbol", "price", "change_percent"],
			sampleUrl: "https://api.example.com/watchlist"
		},
		{
			id: "market_summary",
			name: "Market Summary",
			icon: Activity,
			description: "Market overview, gainers, losers",
			defaultFields: ["total_volume", "gainers_count", "losers_count"],
			sampleUrl: "https://api.example.com/market-summary"
		},
		{
			id: "performance_data",
			name: "Performance Data",
			icon: TrendingUp,
			description: "Performance metrics and indicators",
			defaultFields: ["symbol", "performance", "trend"],
			sampleUrl: "https://api.example.com/performance"
		},
		{
			id: "financial_data",
			name: "Financial Data",
			icon: DollarSign,
			description: "Financial metrics and ratios",
			defaultFields: ["symbol", "pe_ratio", "market_cap", "dividend_yield"],
			sampleUrl: "https://api.example.com/financials"
		}
	],
	chart: [
		{
			id: "chart_data",
			name: "Chart Data",
			icon: BarChart3,
			description: "Historical price data for charts",
			defaultFields: ["date", "open", "high", "low", "close", "volume"],
			sampleUrl: "https://api.example.com/chart-data"
		},
		{
			id: "crypto_chart",
			name: "Cryptocurrency Chart",
			icon: DollarSign,
			description: "Crypto price history",
			defaultFields: ["date", "price", "volume"],
			sampleUrl: "https://api.coinbase.com/v2/exchange-rates"
		},
		{
			id: "market_trends",
			name: "Market Trends",
			icon: TrendingUp,
			description: "Market trend analysis",
			defaultFields: ["date", "index_value", "volume"],
			sampleUrl: "https://api.example.com/trends"
		}
	]
}

const WIDGET_TYPES = [
	{
		id: "card",
		name: "Card",
		icon: CreditCard,
		description: "Display key metrics and summaries"
	},
	{
		id: "table",
		name: "Table",
		icon: Table,
		description: "Show data in rows and columns"
	},
	{
		id: "chart",
		name: "Chart",
		icon: BarChart3,
		description: "Visualize data with interactive charts"
	}
]

export default function AddWidgetModal({ isOpen, onClose, onCreateWidget }) {
	const dispatch = useAppDispatch()
	const apiTestResult = useAppSelector(selectApiTestResult)
	const apiTesting = useAppSelector(selectApiTesting)

	const [step, setStep] = useState(1) // 1: Basic, 2: Data Source, 3: Field Selection, 4: Configuration
	const [showFieldExplorer, setShowFieldExplorer] = useState(false)
	const [widgetConfig, setWidgetConfig] = useState({
		title: "",
		type: "table",
		dataSource: "stocks",
		customUrl: "",
		displayFields: [],
		customFields: [], // New: fields selected via JSON explorer
		refreshInterval: 30,
		itemsPerPage: 20,
		cardType: "summary",
		chartType: "line",
		timeframe: "daily",
		symbol: "AAPL",
		enableSearch: true,
		enableSorting: true,
		enablePagination: true,
		showVolume: true,
		showTrend: true,
		showPercentage: true,
		useCustomFields: false // Toggle between predefined and custom fields
	})

	const selectedDataSource = DATA_SOURCES[widgetConfig.type]?.find(ds => ds.id === widgetConfig.dataSource)
	const selectedWidgetType = WIDGET_TYPES.find(wt => wt.id === widgetConfig.type)

	useEffect(() => {
		if (selectedDataSource && widgetConfig.displayFields.length === 0) {
			setWidgetConfig(prev => ({
				...prev,
				displayFields: [...selectedDataSource.defaultFields]
			}))
		}
	}, [selectedDataSource, widgetConfig.displayFields.length])

	// Reset data source when widget type changes
	useEffect(() => {
		const availableDataSources = DATA_SOURCES[widgetConfig.type] || []
		if (availableDataSources.length > 0 && !availableDataSources.find(ds => ds.id === widgetConfig.dataSource)) {
			setWidgetConfig(prev => ({
				...prev,
				dataSource: availableDataSources[0].id,
				displayFields: [...availableDataSources[0].defaultFields]
			}))
		}
	}, [widgetConfig.type])

	const handleTestApi = () => {
		const url = widgetConfig.dataSource === "custom" ? widgetConfig.customUrl : selectedDataSource?.sampleUrl
		if (url) {
			dispatch(testApiConnection({ url }))
		}
	}

	const handleCreateWidget = () => {
		const config = {
			dataSource: widgetConfig.dataSource,
			displayFields: widgetConfig.displayFields,
			refreshInterval: widgetConfig.refreshInterval,
			...(widgetConfig.type === "table" && {
				itemsPerPage: widgetConfig.itemsPerPage,
				sortBy: widgetConfig.displayFields[0],
				sortOrder: "desc"
			}),
			...(widgetConfig.type === "card" && {
				cardType: widgetConfig.cardType
			}),
			...(widgetConfig.type === "chart" && {
				chartType: widgetConfig.chartType,
				timeframe: widgetConfig.timeframe,
				...(widgetConfig.dataSource === "chart_data" && {
					symbol: widgetConfig.symbol
				})
			}),
			...(widgetConfig.dataSource === "custom" && {
				apiUrl: widgetConfig.customUrl
			})
		}

		const newWidget = {
			type: widgetConfig.type,
			title: widgetConfig.title || `${selectedWidgetType?.name} Widget`,
			config
		}

		onCreateWidget(newWidget)
		handleClose()
	}

	const handleClose = () => {
		setStep(1)
		setWidgetConfig({
			title: "",
			type: "table",
			dataSource: "stocks",
			customUrl: "",
			displayFields: [],
			customFields: [],
			refreshInterval: 30,
			itemsPerPage: 20,
			cardType: "summary",
			chartType: "line",
			timeframe: "daily",
			symbol: "AAPL",
			enableSearch: true,
			enableSorting: true,
			enablePagination: true,
			showVolume: true,
			showTrend: true,
			showPercentage: true,
			useCustomFields: false
		})
		dispatch(clearApiTestResult())
		setShowFieldExplorer(false)
		onClose()
	}

	const handleFieldToggle = (field, checked) => {
		setWidgetConfig(prev => ({
			...prev,
			displayFields: checked
				? [...prev.displayFields, field]
				: prev.displayFields.filter(f => f !== field)
		}))
	}

	// Handle custom fields from JSON explorer
	const handleCustomFieldsSelected = (data) => {
		setWidgetConfig(prev => ({
			...prev,
			customFields: data.fields,
			displayFields: data.fields,
			useCustomFields: true,
			...(data.apiUrl && { customUrl: data.apiUrl }),
			...(data.dataSource && data.dataSource !== "custom" && { 
				dataSource: "custom",
				customUrl: data.apiUrl || prev.customUrl 
			})
		}))
		setShowFieldExplorer(false)
	}

	const canProceedToNext = () => {
		if (step === 1) return widgetConfig.title.trim()
		if (step === 2) {
			if (widgetConfig.dataSource === "custom") {
				return widgetConfig.customUrl.trim() && apiTestResult?.success
			}
			return true
		}
		if (step === 3) {
			// Field selection step - require at least one field
			return widgetConfig.displayFields.length > 0
		}
		if (step === 4) {
			// All widgets can proceed from step 4 as they have default configurations
			return true
		}
		return false
	}

	const renderStep1 = () => (
		<div className="space-y-6">
			<div className="space-y-2">
				<Label htmlFor="title">Widget Title</Label>
				<Input
					id="title"
					placeholder="e.g., Stock Market Overview"
					value={widgetConfig.title}
					onChange={(e) => setWidgetConfig(prev => ({ ...prev, title: e.target.value }))}
					className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
				/>
			</div>

			<div className="space-y-3">
				<Label>Widget Type</Label>
				<div className="grid grid-cols-1 gap-3">
					{WIDGET_TYPES.map((type) => {
						const Icon = type.icon
						return (
							<Card
								key={type.id}
								className={`cursor-pointer transition-colors ${widgetConfig.type === type.id
										? "bg-teal-500/20 border-teal-500"
										: "bg-slate-800 border-slate-600 hover:bg-slate-700"
									}`}
								onClick={() => setWidgetConfig(prev => ({ ...prev, type: type.id }))}
							>
								<CardContent className="p-4">
									<div className="flex items-center gap-3">
										<Icon className="w-5 h-5 text-teal-400" />
										<div>
											<div className="font-medium text-white">{type.name}</div>
											<div className="text-sm text-slate-400">{type.description}</div>
										</div>
									</div>
								</CardContent>
							</Card>
						)
					})}
				</div>
			</div>
		</div>
	)

	const renderStep2 = () => (
		<div className="space-y-6">
			<div className="space-y-3">
				<Label>Data Source</Label>
				<div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
					{(DATA_SOURCES[widgetConfig.type] || []).map((source) => {
						const Icon = source.icon
						return (
							<Card
								key={source.id}
								className={`cursor-pointer transition-colors ${widgetConfig.dataSource === source.id
										? "bg-teal-500/20 border-teal-500"
										: "bg-slate-800 border-slate-600 hover:bg-slate-700"
									}`}
								onClick={() => {
									setWidgetConfig(prev => ({
										...prev,
										dataSource: source.id,
										displayFields: [...source.defaultFields]
									}))
									dispatch(clearApiTestResult())
								}}
							>
								<CardContent className="p-4">
									<div className="flex items-center gap-3">
										<Icon className="w-5 h-5 text-teal-400" />
										<div>
											<div className="font-medium text-white">{source.name}</div>
											<div className="text-sm text-slate-400">{source.description}</div>
										</div>
									</div>
								</CardContent>
							</Card>
						)
					})}
				</div>
			</div>

			{widgetConfig.dataSource === "custom" && (
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="customUrl">API URL</Label>
						<Input
							id="customUrl"
							placeholder="https://api.example.com/data"
							value={widgetConfig.customUrl}
							onChange={(e) => setWidgetConfig(prev => ({ ...prev, customUrl: e.target.value }))}
							className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
						/>
					</div>

					<div className="flex items-center gap-3">
						<Button
							variant="outline"
							size="sm"
							onClick={handleTestApi}
							disabled={!widgetConfig.customUrl.trim() || apiTesting}
							className="border-slate-600 text-slate-300 hover:bg-slate-700"
						>
							{apiTesting ? (
								<Spinner size="sm" className="mr-2" />
							) : (
								<Database className="w-4 h-4 mr-2" />
							)}
							Test Connection
						</Button>

						{apiTestResult && (
							<div className={`flex items-center gap-2 text-sm ${apiTestResult.success ? "text-green-400" : "text-red-400"
								}`}>
								{apiTestResult.success ? (
									<CheckCircle className="w-4 h-4" />
								) : (
									<AlertCircle className="w-4 h-4" />
								)}
								{apiTestResult.success ? "Connection successful" : apiTestResult.error}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)

	const renderStep3 = () => (
		<div className="space-y-6">
			<div className="text-center mb-6">
				<h3 className="text-lg font-semibold text-white mb-2">Select Data Fields</h3>
				<p className="text-slate-400 text-sm">
					Choose which data fields to display in your widget
				</p>
			</div>

			{/* Field Selection Method Toggle */}
			<Card className="bg-slate-800 border-slate-700">
				<CardContent className="p-4">
					<div className="flex items-center justify-between mb-4">
						<Label className="text-white text-sm font-medium">Field Selection Method</Label>
						<div className="flex gap-2">
							<Button
								variant={!widgetConfig.useCustomFields ? "default" : "outline"}
								size="sm"
								onClick={() => setWidgetConfig(prev => ({ 
									...prev, 
									useCustomFields: false,
									displayFields: selectedDataSource?.defaultFields || []
								}))}
								className={!widgetConfig.useCustomFields 
									? "bg-teal-500 hover:bg-teal-600 text-white" 
									: "border-slate-600 text-slate-300 hover:bg-slate-700"
								}
							>
								Predefined Fields
							</Button>
							<Button
								variant={widgetConfig.useCustomFields ? "default" : "outline"}
								size="sm"
								onClick={() => setWidgetConfig(prev => ({ ...prev, useCustomFields: true }))}
								className={widgetConfig.useCustomFields 
									? "bg-teal-500 hover:bg-teal-600 text-white" 
									: "border-slate-600 text-slate-300 hover:bg-slate-700"
								}
							>
								<Zap className="w-3 h-3 mr-1" />
								Custom Fields
							</Button>
						</div>
					</div>

					{!widgetConfig.useCustomFields ? (
						// Predefined fields selection
						<div className="space-y-3">
							<p className="text-slate-400 text-xs">
								Select from predefined fields for {selectedDataSource?.name || 'this data source'}:
							</p>
							<div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
								{(selectedDataSource?.defaultFields || []).map((field) => (
									<div key={field} className="flex items-center space-x-2">
										<Checkbox
											id={field}
											checked={widgetConfig.displayFields.includes(field)}
											onCheckedChange={(checked) => handleFieldToggle(field, checked)}
											className="border-slate-500 data-[state=checked]:bg-teal-500"
										/>
										<Label htmlFor={field} className="text-sm text-slate-300 font-mono">
											{field}
										</Label>
									</div>
								))}
							</div>
						</div>
					) : (
						// Custom fields selection
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<p className="text-slate-400 text-xs">
									Use the JSON Field Explorer to select custom fields from API responses:
								</p>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowFieldExplorer(true)}
									className="border-teal-600 text-teal-300 hover:bg-teal-600 hover:text-white"
								>
									<Search className="w-3 h-3 mr-1" />
									Explore API Fields
								</Button>
							</div>

							{widgetConfig.customFields.length > 0 && (
								<div className="mt-4 p-3 bg-slate-700 rounded border border-slate-600">
									<div className="text-sm text-green-400 mb-2 flex items-center gap-2">
										<CheckCircle className="w-4 h-4" />
										Selected Custom Fields ({widgetConfig.customFields.length})
									</div>
									<div className="flex flex-wrap gap-2">
										{widgetConfig.customFields.map((field, index) => (
											<span
												key={index}
												className="px-2 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded text-xs font-mono"
											>
												{field}
											</span>
										))}
									</div>
								</div>
							)}

							{widgetConfig.customFields.length === 0 && (
								<div className="p-4 border border-dashed border-slate-600 rounded text-center">
									<Database className="w-8 h-8 text-slate-500 mx-auto mb-2" />
									<p className="text-slate-400 text-sm">
										No custom fields selected yet
									</p>
									<p className="text-slate-500 text-xs mt-1">
										Click "Explore API Fields" to analyze API responses and select fields
									</p>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Field Preview */}
			{widgetConfig.displayFields.length > 0 && (
				<Card className="bg-slate-800 border-slate-700">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm text-green-400 flex items-center gap-2">
							<CheckCircle className="w-4 h-4" />
							Selected Fields Preview
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-sm text-slate-300">
							<div className="mb-2">
								<strong>Widget Type:</strong> {widgetConfig.type.charAt(0).toUpperCase() + widgetConfig.type.slice(1)}
							</div>
							<div className="mb-2">
								<strong>Data Source:</strong> {selectedDataSource?.name || widgetConfig.dataSource}
							</div>
							<div className="mb-3">
								<strong>Fields ({widgetConfig.displayFields.length}):</strong>
							</div>
							<div className="grid grid-cols-3 gap-2">
								{widgetConfig.displayFields.map((field, index) => (
									<div
										key={index}
										className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs font-mono text-slate-200"
									>
										{field}
									</div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)

	const renderStep4 = () => (
		<div className="space-y-6">
			{/* Refresh Interval - Common for all widgets */}
			<div className="space-y-3">
				<Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
				<Input
					id="refreshInterval"
					type="number"
					min="10"
					max="3600"
					value={widgetConfig.refreshInterval}
					onChange={(e) => setWidgetConfig(prev => ({
						...prev,
						refreshInterval: parseInt(e.target.value) || 30
					}))}
					className="bg-slate-700 border-slate-600 text-white"
				/>
			</div>

			{/* Table-specific configurations */}
			{widgetConfig.type === "table" && (
				<div className="space-y-4">
					<div className="space-y-3">
						<Label htmlFor="itemsPerPage">Items per Page</Label>
						<Input
							id="itemsPerPage"
							type="number"
							min="5"
							max="50"
							value={widgetConfig.itemsPerPage}
							onChange={(e) => setWidgetConfig(prev => ({
								...prev,
								itemsPerPage: parseInt(e.target.value) || 10
							}))}
							className="bg-slate-700 border-slate-600 text-white"
						/>
					</div>

					<div className="space-y-3">
						<Label>Table Features</Label>
						<div className="grid grid-cols-2 gap-3">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="enableSearch"
									checked={widgetConfig.enableSearch !== false}
									onCheckedChange={(checked) => setWidgetConfig(prev => ({ ...prev, enableSearch: checked }))}
								/>
								<Label htmlFor="enableSearch" className="text-sm text-slate-300">
									Enable Search
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="enableSorting"
									checked={widgetConfig.enableSorting !== false}
									onCheckedChange={(checked) => setWidgetConfig(prev => ({ ...prev, enableSorting: checked }))}
								/>
								<Label htmlFor="enableSorting" className="text-sm text-slate-300">
									Enable Sorting
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="enablePagination"
									checked={widgetConfig.enablePagination !== false}
									onCheckedChange={(checked) => setWidgetConfig(prev => ({ ...prev, enablePagination: checked }))}
								/>
								<Label htmlFor="enablePagination" className="text-sm text-slate-300">
									Enable Pagination
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="showVolume"
									checked={widgetConfig.showVolume !== false}
									onCheckedChange={(checked) => setWidgetConfig(prev => ({ ...prev, showVolume: checked }))}
								/>
								<Label htmlFor="showVolume" className="text-sm text-slate-300">
									Show Volume
								</Label>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Card-specific configurations */}
			{widgetConfig.type === "card" && (
				<div className="space-y-4">
					<div className="space-y-3">
						<Label>Card Type</Label>
						<div className="flex gap-2">
							{[
								{ id: "summary", name: "Summary", desc: "Key metrics overview" },
								{ id: "metric", name: "Single Metric", desc: "Focus on one value" },
								{ id: "list", name: "List", desc: "Multiple items" }
							].map((type) => (
								<Card
									key={type.id}
									className={`cursor-pointer transition-colors p-3 ${widgetConfig.cardType === type.id
											? "bg-teal-500/20 border-teal-500"
											: "bg-slate-800 border-slate-600 hover:bg-slate-700"
										}`}
									onClick={() => setWidgetConfig(prev => ({ ...prev, cardType: type.id }))}
								>
									<div className="text-center">
										<div className="font-medium text-white text-sm">{type.name}</div>
										<div className="text-xs text-slate-400">{type.desc}</div>
									</div>
								</Card>
							))}
						</div>
					</div>

					<div className="space-y-3">
						<Label>Display Options</Label>
						<div className="grid grid-cols-2 gap-3">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="showTrend"
									checked={widgetConfig.showTrend !== false}
									onCheckedChange={(checked) => setWidgetConfig(prev => ({ ...prev, showTrend: checked }))}
								/>
								<Label htmlFor="showTrend" className="text-sm text-slate-300">
									Show Trend
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<Checkbox
									id="showPercentage"
									checked={widgetConfig.showPercentage !== false}
									onCheckedChange={(checked) => setWidgetConfig(prev => ({ ...prev, showPercentage: checked }))}
								/>
								<Label htmlFor="showPercentage" className="text-sm text-slate-300">
									Show Percentage
								</Label>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Chart-specific configurations */}
			{widgetConfig.type === "chart" && (
				<div className="space-y-4">
					<div className="space-y-3">
						<Label>Chart Type</Label>
						<div className="flex gap-2">
							{[
								{ id: "line", name: "Line" },
								{ id: "area", name: "Area" },
								{ id: "candlestick", name: "Candlestick" }
							].map((type) => (
								<Button
									key={type.id}
									variant={widgetConfig.chartType === type.id ? "default" : "outline"}
									size="sm"
									onClick={() => setWidgetConfig(prev => ({ ...prev, chartType: type.id }))}
									className={widgetConfig.chartType === type.id
										? "bg-teal-500 hover:bg-teal-600"
										: "border-slate-600 text-slate-300 hover:bg-slate-700"
									}
								>
									{type.name}
								</Button>
							))}
						</div>
					</div>
					
					<div className="space-y-3">
						<Label>Timeframe</Label>
						<div className="flex gap-2">
							{[
								{ id: "daily", name: "Daily" },
								{ id: "weekly", name: "Weekly" },
								{ id: "monthly", name: "Monthly" }
							].map((frame) => (
								<Button
									key={frame.id}
									variant={widgetConfig.timeframe === frame.id ? "default" : "outline"}
									size="sm"
									onClick={() => setWidgetConfig(prev => ({ ...prev, timeframe: frame.id }))}
									className={widgetConfig.timeframe === frame.id
										? "bg-teal-500 hover:bg-teal-600"
										: "border-slate-600 text-slate-300 hover:bg-slate-700"
									}
								>
									{frame.name}
								</Button>
							))}
						</div>
					</div>

					{widgetConfig.dataSource === "chart_data" && (
						<div className="space-y-3">
							<Label htmlFor="symbol">Stock Symbol</Label>
							<Input
								id="symbol"
								type="text"
								placeholder="e.g., AAPL, MSFT, TSLA"
								value={widgetConfig.symbol}
								onChange={(e) => setWidgetConfig(prev => ({ 
									...prev, 
									symbol: e.target.value.toUpperCase() 
								}))}
								className="bg-slate-700 border-slate-600 text-white"
							/>
						</div>
					)}
				</div>
			)}
		</div>
	)

	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<Card className="w-full max-w-2xl bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-hidden">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
					<div>
						<CardTitle className="text-xl font-semibold">Add New Widget</CardTitle>
						<div className="flex items-center gap-2 mt-2">
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className={`w-6 h-1 rounded-full ${i <= step ? "bg-teal-500" : "bg-slate-600"
										}`}
								/>
							))}
						</div>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleClose}
						className="text-slate-400 hover:text-white"
					>
						<X className="w-4 h-4" />
					</Button>
				</CardHeader>

				<CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
					{step === 1 && renderStep1()}
					{step === 2 && renderStep2()}
					{step === 3 && renderStep3()}
					{step === 4 && renderStep4()}
				</CardContent>

				<div className="flex justify-between p-6 border-t border-slate-700">
					<Button
						variant="outline"
						onClick={step === 1 ? handleClose : () => setStep(step - 1)}
						className="border-slate-600 text-slate-300 hover:bg-slate-700"
					>
						{step === 1 ? "Cancel" : "Back"}
					</Button>

					{step < 4 ? (
						<Button
							onClick={() => setStep(step + 1)}
							disabled={!canProceedToNext()}
							className="bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50"
						>
							Next
						</Button>
					) : (
						<Button
							onClick={handleCreateWidget}
							disabled={!canProceedToNext()}
							className="bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50"
						>
							Create Widget
						</Button>
					)}
				</div>
			</Card>

			{/* API Response Explorer Modal */}
			<ApiResponseExplorer
				isOpen={showFieldExplorer}
				onClose={() => setShowFieldExplorer(false)}
				onFieldsSelected={handleCustomFieldsSelected}
				initialUrl={widgetConfig.customUrl}
				dataSource={widgetConfig.dataSource}
				widgetType={widgetConfig.type}
			/>
		</div>
	)
}
