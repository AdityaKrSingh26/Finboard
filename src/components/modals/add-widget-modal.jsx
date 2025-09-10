"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/loader"
import ApiResponseExplorer from "./api-response-explorer"
import {
	X,
	BarChart3,
	Table,
	CreditCard,
	Database,
	CheckCircle,
	AlertCircle,
	DollarSign,
	Activity,
	Zap,
	Search
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { testApiConnection, selectApiTestResult, selectApiTesting, clearApiTestResult } from "@/lib/store/slices/widgets-slice"

// Simple data sources configuration
const dataSources = {
	table: [
		{
			id: "stocks",
			name: "Stock Market Table",
			icon: DollarSign,
			description: "Stock prices in table format",
			fields: ["symbol", "name", "c", "d", "dp", "marketCapitalization"],
			url: "stocks"
		},
		{
			id: "crypto",
			name: "Cryptocurrency Table", 
			icon: DollarSign,
			description: "Crypto prices in table format",
			fields: ["name", "symbol", "price", "change_percent_24h", "market_cap"],
			url: "https://api.coinbase.com/v2/exchange-rates"
		}
	],
	card: [
		{
			id: "stocks",
			name: "Stock Market Cards",
			icon: DollarSign,
			description: "Stock data in card format",
			fields: ["symbol", "name", "c", "d", "dp"],
			url: "stocks"
		}
	],
	chart: [
		{
			id: "stocks",
			name: "Stock Chart",
			icon: DollarSign,
			description: "Stock price charts",
			fields: ["date", "open", "high", "low", "close", "volume"],
			url: "stocks"
		},
		{
			id: "crypto_chart",
			name: "Cryptocurrency Chart",
			icon: DollarSign,
			description: "Crypto price history",
			fields: ["date", "price", "volume"],
			url: "https://api.coinbase.com/v2/exchange-rates"
		}
	]
}

// Widget types
const widgetTypes = [
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

	// Simple state management
	const [currentStep, setCurrentStep] = useState(1)
	const [showExplorer, setShowExplorer] = useState(false)
	const [config, setConfig] = useState({
		title: "",
		type: "table",
		dataSource: "stocks",
		customUrl: "",
		fields: [],
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

	// Get current data source
	let currentDataSource = null
	if (dataSources[config.type]) {
		for (let i = 0; i < dataSources[config.type].length; i++) {
			if (dataSources[config.type][i].id === config.dataSource) {
				currentDataSource = dataSources[config.type][i]
				break
			}
		}
	}

	// Get current widget type
	let currentWidgetType = null
	for (let i = 0; i < widgetTypes.length; i++) {
		if (widgetTypes[i].id === config.type) {
			currentWidgetType = widgetTypes[i]
			break
		}
	}

	// Set default fields when data source changes
	useEffect(() => {
		if (currentDataSource && config.fields.length === 0) {
			setConfig(prev => ({
				...prev,
				fields: [...currentDataSource.fields]
			}))
		}
	}, [currentDataSource, config.fields.length])

	// Reset data source when widget type changes
	useEffect(() => {
		const availableSources = dataSources[config.type] || []
		if (availableSources.length > 0) {
			let foundSource = false
			for (let i = 0; i < availableSources.length; i++) {
				if (availableSources[i].id === config.dataSource) {
					foundSource = true
					break
				}
			}
			if (!foundSource) {
				setConfig(prev => ({
					...prev,
					dataSource: availableSources[0].id,
					fields: [...availableSources[0].fields]
				}))
			}
		}
	}, [config.type])

	function testConnection() {
		let url = ""
		if (config.dataSource === "custom") {
			url = config.customUrl
		} else if (currentDataSource) {
			url = currentDataSource.url
		}
		
		if (url) {
			dispatch(testApiConnection({ url }))
		}
	}

	function createWidget() {
		let widgetConfig = {
			dataSource: config.dataSource,
			displayFields: config.fields,
			refreshInterval: config.refreshInterval
		}

		// Add type specific configs
		if (config.type === "table") {
			widgetConfig.itemsPerPage = config.itemsPerPage
			widgetConfig.sortBy = config.fields[0]
			widgetConfig.sortOrder = "desc"
		}

		if (config.type === "card") {
			widgetConfig.cardType = config.cardType
		}

		if (config.type === "chart") {
			widgetConfig.chartType = config.chartType
			widgetConfig.timeframe = config.timeframe
			if (config.dataSource === "chart_data") {
				widgetConfig.symbol = config.symbol
			}
		}

		if (config.dataSource === "custom") {
			widgetConfig.apiUrl = config.customUrl
		}

		const widget = {
			type: config.type,
			title: config.title || `${currentWidgetType?.name} Widget`,
			config: widgetConfig
		}

		onCreateWidget(widget)
		closeModal()
	}

	function closeModal() {
		setCurrentStep(1)
		setConfig({
			title: "",
			type: "table",
			dataSource: "stocks",
			customUrl: "",
			fields: [],
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
		setShowExplorer(false)
		onClose()
	}

	function toggleField(field, checked) {
		if (checked) {
			setConfig(prev => ({
				...prev,
				fields: [...prev.fields, field]
			}))
		} else {
			setConfig(prev => ({
				...prev,
				fields: prev.fields.filter(f => f !== field)
			}))
		}
	}

	function handleCustomFields(data) {
		setConfig(prev => ({
			...prev,
			customFields: data.fields,
			fields: data.fields,
			useCustomFields: true
		}))
		
		if (data.apiUrl) {
			setConfig(prev => ({
				...prev,
				customUrl: data.apiUrl
			}))
		}
		
		if (data.dataSource && data.dataSource !== "custom") {
			setConfig(prev => ({
				...prev,
				dataSource: "custom",
				customUrl: data.apiUrl || prev.customUrl
			}))
		}
		
		setShowExplorer(false)
	}

	function canGoNext() {
		if (currentStep === 1) {
			return config.title.trim().length > 0
		}
		if (currentStep === 2) {
			if (config.dataSource === "custom") {
				return config.customUrl.trim().length > 0 && apiTestResult?.success
			}
			return true
		}
		if (currentStep === 3) {
			return config.fields.length > 0
		}
		return true
	}

	// Step 1: Basic Info
	function renderStepOne() {
		return (
			<div className="space-y-6">
				<div className="space-y-2">
					<Label htmlFor="title">Widget Title</Label>
					<Input
						id="title"
						placeholder="e.g., Stock Market Overview"
						value={config.title}
						onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
						className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
					/>
				</div>

				<div className="space-y-3">
					<Label>Widget Type</Label>
					<div className="grid grid-cols-1 gap-3">
						{widgetTypes.map((type) => {
							const Icon = type.icon
							return (
								<Card
									key={type.id}
									className={`cursor-pointer transition-colors ${config.type === type.id
											? "bg-teal-500/20 border-teal-500"
											: "bg-slate-800 border-slate-600 hover:bg-slate-700"
										}`}
									onClick={() => setConfig(prev => ({ ...prev, type: type.id }))}
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
	}

	// Step 2: Data Source
	function renderStepTwo() {
		return (
			<div className="space-y-6">
				<div className="space-y-3">
					<Label>Data Source</Label>
					<div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
						{(dataSources[config.type] || []).map((source) => {
							const Icon = source.icon
							return (
								<Card
									key={source.id}
									className={`cursor-pointer transition-colors ${config.dataSource === source.id
											? "bg-teal-500/20 border-teal-500"
											: "bg-slate-800 border-slate-600 hover:bg-slate-700"
										}`}
									onClick={() => {
										setConfig(prev => ({
											...prev,
											dataSource: source.id,
											fields: [...source.fields]
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

				{config.dataSource === "custom" && (
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="customUrl">API URL</Label>
							<Input
								id="customUrl"
								placeholder="Enter your API endpoint URL"
								value={config.customUrl}
								onChange={(e) => setConfig(prev => ({ ...prev, customUrl: e.target.value }))}
								className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
							/>
						</div>

						<div className="flex items-center gap-3">
							<Button
								variant="outline"
								size="sm"
								onClick={testConnection}
								disabled={!config.customUrl.trim() || apiTesting}
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
	}

	// Step 3: Field Selection
	function renderStepThree() {
		return (
			<div className="space-y-6">
				<div className="text-center mb-6">
					<h3 className="text-lg font-semibold text-white mb-2">Select Data Fields</h3>
					<p className="text-slate-400 text-sm">
						Choose which data fields to display in your widget
					</p>
				</div>

				<Card className="bg-slate-800 border-slate-700">
					<CardContent className="p-4">
						<div className="flex items-center justify-between mb-4">
							<Label className="text-white text-sm font-medium">Field Selection Method</Label>
							<div className="flex gap-2">
								<Button
									variant={!config.useCustomFields ? "default" : "outline"}
									size="sm"
									onClick={() => setConfig(prev => ({ 
										...prev, 
										useCustomFields: false,
										fields: currentDataSource?.fields || []
									}))}
									className={!config.useCustomFields 
										? "bg-teal-500 hover:bg-teal-600 text-white" 
										: "border-slate-600 text-slate-300 hover:bg-slate-700"
									}
								>
									Predefined Fields
								</Button>
								<Button
									variant={config.useCustomFields ? "default" : "outline"}
									size="sm"
									onClick={() => setConfig(prev => ({ ...prev, useCustomFields: true }))}
									className={config.useCustomFields 
										? "bg-teal-500 hover:bg-teal-600 text-white" 
										: "border-slate-600 text-slate-300 hover:bg-slate-700"
									}
								>
									<Zap className="w-3 h-3 mr-1" />
									Custom Fields
								</Button>
							</div>
						</div>

						{!config.useCustomFields ? (
							<div className="space-y-3">
								<p className="text-slate-400 text-xs">
									Select from predefined fields for {currentDataSource?.name || 'this data source'}:
								</p>
								<div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
									{(currentDataSource?.fields || []).map((field) => (
										<div key={field} className="flex items-center space-x-2">
											<Checkbox
												id={field}
												checked={config.fields.includes(field)}
												onCheckedChange={(checked) => toggleField(field, checked)}
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
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<p className="text-slate-400 text-xs">
										Use the JSON Field Explorer to select custom fields from API responses:
									</p>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setShowExplorer(true)}
										className="border-teal-600 text-teal-300 hover:bg-teal-600 hover:text-white"
									>
										<Search className="w-3 h-3 mr-1" />
										Explore API Fields
									</Button>
								</div>

								{config.customFields.length > 0 && (
									<div className="mt-4 p-3 bg-slate-700 rounded border border-slate-600">
										<div className="text-sm text-green-400 mb-2 flex items-center gap-2">
											<CheckCircle className="w-4 h-4" />
											Selected Custom Fields ({config.customFields.length})
										</div>
										<div className="flex flex-wrap gap-2">
											{config.customFields.map((field, index) => (
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

								{config.customFields.length === 0 && (
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

				{config.fields.length > 0 && (
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
									<strong>Widget Type:</strong> {config.type.charAt(0).toUpperCase() + config.type.slice(1)}
								</div>
								<div className="mb-2">
									<strong>Data Source:</strong> {currentDataSource?.name || config.dataSource}
								</div>
								<div className="mb-3">
									<strong>Fields ({config.fields.length}):</strong>
								</div>
								<div className="grid grid-cols-3 gap-2">
									{config.fields.map((field, index) => (
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
	}

	// Step 4: Configuration
	function renderStepFour() {
		return (
			<div className="space-y-6">
				<div className="space-y-3">
					<Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
					<Input
						id="refreshInterval"
						type="number"
						min="10"
						max="3600"
						value={config.refreshInterval}
						onChange={(e) => setConfig(prev => ({
							...prev,
							refreshInterval: parseInt(e.target.value) || 30
						}))}
						className="bg-slate-700 border-slate-600 text-white"
					/>
				</div>

				{config.type === "table" && (
					<div className="space-y-4">
						<div className="space-y-3">
							<Label htmlFor="itemsPerPage">Items per Page</Label>
							<Input
								id="itemsPerPage"
								type="number"
								min="5"
								max="50"
								value={config.itemsPerPage}
								onChange={(e) => setConfig(prev => ({
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
										checked={config.enableSearch !== false}
										onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableSearch: checked }))}
									/>
									<Label htmlFor="enableSearch" className="text-sm text-slate-300">
										Enable Search
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="enableSorting"
										checked={config.enableSorting !== false}
										onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableSorting: checked }))}
									/>
									<Label htmlFor="enableSorting" className="text-sm text-slate-300">
										Enable Sorting
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="enablePagination"
										checked={config.enablePagination !== false}
										onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enablePagination: checked }))}
									/>
									<Label htmlFor="enablePagination" className="text-sm text-slate-300">
										Enable Pagination
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="showVolume"
										checked={config.showVolume !== false}
										onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showVolume: checked }))}
									/>
									<Label htmlFor="showVolume" className="text-sm text-slate-300">
										Show Volume
									</Label>
								</div>
							</div>
						</div>
					</div>
				)}

				{config.type === "card" && (
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
										className={`cursor-pointer transition-colors p-3 ${config.cardType === type.id
												? "bg-teal-500/20 border-teal-500"
												: "bg-slate-800 border-slate-600 hover:bg-slate-700"
											}`}
										onClick={() => setConfig(prev => ({ ...prev, cardType: type.id }))}
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
										checked={config.showTrend !== false}
										onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showTrend: checked }))}
									/>
									<Label htmlFor="showTrend" className="text-sm text-slate-300">
										Show Trend
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="showPercentage"
										checked={config.showPercentage !== false}
										onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showPercentage: checked }))}
									/>
									<Label htmlFor="showPercentage" className="text-sm text-slate-300">
										Show Percentage
									</Label>
								</div>
							</div>
						</div>
					</div>
				)}

				{config.type === "chart" && (
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
										variant={config.chartType === type.id ? "default" : "outline"}
										size="sm"
										onClick={() => setConfig(prev => ({ ...prev, chartType: type.id }))}
										className={config.chartType === type.id
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
										variant={config.timeframe === frame.id ? "default" : "outline"}
										size="sm"
										onClick={() => setConfig(prev => ({ ...prev, timeframe: frame.id }))}
										className={config.timeframe === frame.id
											? "bg-teal-500 hover:bg-teal-600"
											: "border-slate-600 text-slate-300 hover:bg-slate-700"
										}
									>
										{frame.name}
									</Button>
								))}
							</div>
						</div>

						{config.dataSource === "chart_data" && (
							<div className="space-y-3">
								<Label htmlFor="symbol">Stock Symbol</Label>
								<Input
									id="symbol"
									type="text"
									placeholder="e.g., AAPL, MSFT, TSLA"
									value={config.symbol}
									onChange={(e) => setConfig(prev => ({ 
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
	}

	// Don't show modal if not open
	if (!isOpen) {
		return null
	}

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<Card className="w-full max-w-2xl bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-hidden">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
					<div>
						<CardTitle className="text-xl font-semibold">Add New Widget</CardTitle>
						<div className="flex items-center gap-2 mt-2">
							{[1, 2, 3, 4].map((stepNum) => (
								<div
									key={stepNum}
									className={`w-6 h-1 rounded-full ${stepNum <= currentStep ? "bg-teal-500" : "bg-slate-600"
										}`}
								/>
							))}
						</div>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={closeModal}
						className="text-slate-400 hover:text-white"
					>
						<X className="w-4 h-4" />
					</Button>
				</CardHeader>

				<CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
					{currentStep === 1 && renderStepOne()}
					{currentStep === 2 && renderStepTwo()}
					{currentStep === 3 && renderStepThree()}
					{currentStep === 4 && renderStepFour()}
				</CardContent>

				<div className="flex justify-between p-6 border-t border-slate-700">
					<Button
						variant="outline"
						onClick={currentStep === 1 ? closeModal : () => setCurrentStep(currentStep - 1)}
						className="border-slate-600 text-slate-300 hover:bg-slate-700"
					>
						{currentStep === 1 ? "Cancel" : "Back"}
					</Button>

					{currentStep < 4 ? (
						<Button
							onClick={() => setCurrentStep(currentStep + 1)}
							disabled={!canGoNext()}
							className="bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50"
						>
							Next
						</Button>
					) : (
						<Button
							onClick={createWidget}
							disabled={!canGoNext()}
							className="bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50"
						>
							Create Widget
						</Button>
					)}
				</div>
			</Card>

			<ApiResponseExplorer
				isOpen={showExplorer}
				onClose={() => setShowExplorer(false)}
				onFieldsSelected={handleCustomFields}
				initialUrl={config.customUrl}
				dataSource={config.dataSource}
				widgetType={config.type}
			/>
		</div>
	)
}
