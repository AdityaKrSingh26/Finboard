"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import ApiResponseExplorer from "./api-response-explorer"
import { WIDGET_CONFIGS, WIDGET_TYPE_CONFIGS, generateWidgetConfig } from "@/lib/widget-configs"
import {
	Settings,
	Table,
	TrendingUp,
	Layers,
	Database,
	Columns,
	Eye,
	Clock,
	Hash,
	ArrowUpDown,
	CheckCircle,
	Save,
	RefreshCw,
	Copy,
	Trash2,
	Zap,
	Search
} from "lucide-react"
import { useAppDispatch } from "@/lib/store/hooks"
import {
	updateWidget,
	duplicateWidget,
	removeWidget,
	fetchWidgetData
} from "@/lib/store/slices/widgets-slice"

export default function WidgetSettingsModal({
	isOpen,
	onClose,
	widget,
	onSave
}) {
	const dispatch = useAppDispatch()
	const [settings, setSettings] = useState({
		title: "",
		type: "table",
		config: {
			dataSource: "stocks",
			displayFields: [],
			columns: [],
			sortBy: "symbol",
			sortOrder: "asc",
			refreshInterval: 30,
			itemsPerPage: 15,
			symbols: [],
			includeProfile: false,
			useCustomFields: false,
			customFields: []
		}
	})
	const [saving, setSaving] = useState(false)
	const [saveSuccess, setSaveSuccess] = useState(false)
	const [showFieldExplorer, setShowFieldExplorer] = useState(false)

	// Predefined configurations based on API analysis
	const configTemplates = {
		"Live Stock Quotes": {
			...WIDGET_CONFIGS.stockQuotes,
			symbols: ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA", "AMZN", "META", "NFLX", "AMD", "CRM"],
			includeProfile: false
		},
		"Company Profiles": {
			...WIDGET_CONFIGS.companyProfiles,
			symbols: ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA"],
			includeProfile: true
		},
		"Enhanced Stock Data": {
			...WIDGET_CONFIGS.enhancedStocks,
			symbols: ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA", "AMZN"],
			includeProfile: true
		},
		"Compact View": {
			...WIDGET_CONFIGS.compactStocks,
			symbols: ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA", "AMZN", "META", "NFLX"],
			includeProfile: false
		},
		"Trading View": {
			...WIDGET_CONFIGS.tradingView,
			symbols: ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA"],
			includeProfile: false
		}
	}

	useEffect(() => {
		if (widget) {
			setSettings({
				title: widget.title || "",
				type: widget.type || "table",
				config: {
					dataSource: "stocks",
					displayFields: [],
					columns: [],
					sortBy: "symbol",
					sortOrder: "asc",
					refreshInterval: 30,
					itemsPerPage: 15,
					symbols: [],
					includeProfile: false,
					...widget.config
				}
			})
			setSaveSuccess(false)
		}
	}, [widget])

	const handleTemplateSelect = (templateName) => {
		const template = configTemplates[templateName]
		if (template) {
			setSettings(prev => ({
				...prev,
				title: templateName,
				config: {
					...prev.config,
					...template
				}
			}))
		}
	}

	const handleSymbolsChange = (symbolsText) => {
		const symbols = symbolsText
			.split(',')
			.map(s => s.trim().toUpperCase())
			.filter(s => s.length > 0)

		setSettings(prev => ({
			...prev,
			config: {
				...prev.config,
				symbols
			}
		}))
	}

	const handleColumnToggle = (columnKey, checked) => {
		setSettings(prev => {
			const allColumns = [
				...WIDGET_CONFIGS.stockQuotes.columns,
				...WIDGET_CONFIGS.companyProfiles.columns
			]

			const newColumns = checked
				? [...prev.config.columns, allColumns.find(col => col.key === columnKey)]
				: prev.config.columns.filter(col => col.key !== columnKey)

			return {
				...prev,
				config: {
					...prev.config,
					columns: newColumns.filter(Boolean),
					displayFields: newColumns.map(col => col.key)
				}
			}
		})
	}

	// Handle custom fields from JSON explorer
	const handleCustomFieldsSelected = (data) => {
		setSettings(prev => ({
			...prev,
			config: {
				...prev.config,
				customFields: data.fields,
				displayFields: data.fields,
				useCustomFields: true,
				...(data.apiUrl && { apiUrl: data.apiUrl })
			}
		}))
		setShowFieldExplorer(false)
	}

	const handleSave = async () => {
		if (widget) {
			setSaving(true)

			try {
				const updatePayload = {
					id: widget.id,
					updates: {
						title: settings.title,
						config: settings.config
					}
				}

				console.log("Saving widget settings:", updatePayload)

				// Update widget configuration
				dispatch(updateWidget(updatePayload))

				// Force refresh the widget data with new config
				const refreshConfig = {
					...settings.config,
					forceRefresh: true
				}

				console.log("Refreshing widget data with config:", refreshConfig)

				dispatch(fetchWidgetData({
					widgetId: widget.id,
					config: refreshConfig
				}))

				// Provide user feedback
				setSaveSuccess(true)

				// Close modal after successful save
				setTimeout(() => {
					setSaving(false)
					onClose()
				}, 1500)

			} catch (error) {
				console.error("Failed to save widget settings:", error)
				setSaving(false)
			}
		}
	}

	const handleRefresh = () => {
		if (widget) {
			dispatch(fetchWidgetData({
				widgetId: widget.id,
				config: { ...widget.config, forceRefresh: true }
			}))
		}
	}

	const handleDuplicate = () => {
		if (widget) {
			dispatch(duplicateWidget(widget.id))
			onClose()
		}
	}

	const handleDelete = () => {
		if (widget && confirm("Are you sure you want to delete this widget?")) {
			dispatch(removeWidget(widget.id))
			onClose()
		}
	}

	if (!isOpen || !widget) return null

	const availableColumns = [
		{ key: "symbol", label: "Symbol", description: "Stock ticker symbol", category: "basic" },
		{ key: "c", label: "Current Price", description: "Real-time stock price", category: "price" },
		{ key: "d", label: "Change", description: "Daily price change", category: "price" },
		{ key: "dp", label: "Change %", description: "Daily percentage change", category: "price" },
		{ key: "h", label: "High", description: "Daily high price", category: "price" },
		{ key: "l", label: "Low", description: "Daily low price", category: "price" },
		{ key: "o", label: "Open", description: "Opening price", category: "price" },
		{ key: "name", label: "Company Name", description: "Full company name", category: "profile" },
		{ key: "marketCapitalization", label: "Market Cap", description: "Market capitalization", category: "profile" },
		{ key: "shareOutstanding", label: "Shares Outstanding", description: "Total shares", category: "profile" },
		{ key: "country", label: "Country", description: "Country of operation", category: "profile" },
		{ key: "exchange", label: "Exchange", description: "Stock exchange", category: "profile" }
	]

	const basicColumns = availableColumns.filter(col => col.category === "basic")
	const priceColumns = availableColumns.filter(col => col.category === "price")
	const profileColumns = availableColumns.filter(col => col.category === "profile")

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
				<DialogHeader>
					<DialogTitle className="text-xl text-white flex items-center gap-2">
						<Settings className="w-5 h-5" />
						Widget Settings - {widget.title}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Basic Settings */}
					<Card className="p-4 bg-slate-800 border-slate-700">
						<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
							<Layers className="w-5 h-5" />
							Basic Settings
						</h3>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="title" className="text-slate-300">Widget Title</Label>
								<Input
									id="title"
									value={settings.title}
									onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
									className="bg-slate-700 border-slate-600 text-white"
									placeholder="Enter widget title"
								/>
							</div>
							<div>
								<Label htmlFor="refreshInterval" className="text-slate-300">Refresh Interval (seconds)</Label>
								<Input
									id="refreshInterval"
									type="number"
									value={settings.config.refreshInterval}
									onChange={(e) => setSettings(prev => ({
										...prev,
										config: { ...prev.config, refreshInterval: parseInt(e.target.value) || 30 }
									}))}
									className="bg-slate-700 border-slate-600 text-white"
									min="5"
								/>
							</div>
						</div>
					</Card>

					{/* Template Selection */}
					<Card className="p-4 bg-slate-800 border-slate-700">
						<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
							<Database className="w-5 h-5" />
							Configuration Templates (Based on API Analysis)
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							{Object.keys(configTemplates).map((templateName) => (
								<Button
									key={templateName}
									variant="outline"
									onClick={() => handleTemplateSelect(templateName)}
									className="h-auto p-4 text-left bg-slate-700 border-slate-600 hover:bg-slate-600 text-white group"
								>
									<div className="w-full">
										<div className="flex items-center justify-between">
											<div className="font-medium">{templateName}</div>
											<CheckCircle className="w-4 h-4 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
										</div>
										<div className="text-sm text-slate-400 mt-1">
											{configTemplates[templateName].columns?.length || 0} columns,
											{" "}{configTemplates[templateName].symbols?.length || 0} symbols
										</div>
									</div>
								</Button>
							))}
						</div>
					</Card>

					{/* Stock Symbols */}
					<Card className="p-4 bg-slate-800 border-slate-700">
						<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
							<TrendingUp className="w-5 h-5" />
							Stock Symbols
						</h3>
						<div>
							<Label htmlFor="symbols" className="text-slate-300">
								Stock Symbols (comma-separated)
							</Label>
							<Input
								id="symbols"
								value={settings.config.symbols?.join(', ') || ''}
								onChange={(e) => handleSymbolsChange(e.target.value)}
								className="bg-slate-700 border-slate-600 text-white"
								placeholder="AAPL, GOOGL, MSFT, TSLA, NVDA"
							/>
							<p className="text-sm text-slate-400 mt-1">
								Current: {settings.config.symbols?.length || 0} symbols configured
							</p>
						</div>
					</Card>

					{/* Column Configuration */}
					<Card className="p-4 bg-slate-800 border-slate-700">
						<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
							<Columns className="w-5 h-5" />
							Data Fields Configuration
						</h3>

						{/* Field Selection Method Toggle */}
						<div className="mb-6">
							<div className="flex items-center justify-between mb-4">
								<Label className="text-white text-sm font-medium">Field Selection Method</Label>
								<div className="flex gap-2">
									<Button
										variant={!settings.config.useCustomFields ? "default" : "outline"}
										size="sm"
										onClick={() => setSettings(prev => ({ 
											...prev, 
											config: {
												...prev.config,
												useCustomFields: false,
												displayFields: prev.config.columns?.map(col => col.key) || []
											}
										}))}
										className={!settings.config.useCustomFields 
											? "bg-teal-500 hover:bg-teal-600 text-white" 
											: "border-slate-600 text-slate-300 hover:bg-slate-700"
										}
									>
										Predefined Fields
									</Button>
									<Button
										variant={settings.config.useCustomFields ? "default" : "outline"}
										size="sm"
										onClick={() => setSettings(prev => ({ 
											...prev, 
											config: { ...prev.config, useCustomFields: true } 
										}))}
										className={settings.config.useCustomFields 
											? "bg-teal-500 hover:bg-teal-600 text-white" 
											: "border-slate-600 text-slate-300 hover:bg-slate-700"
										}
									>
										<Zap className="w-3 h-3 mr-1" />
										Custom Fields
									</Button>
								</div>
							</div>

							{settings.config.useCustomFields ? (
								// Custom fields interface
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<p className="text-slate-400 text-sm">
											Use the JSON Field Explorer to analyze API responses and select custom fields:
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

									{settings.config.customFields?.length > 0 && (
										<div className="p-3 bg-slate-700 rounded border border-slate-600">
											<div className="text-sm text-green-400 mb-2 flex items-center gap-2">
												<CheckCircle className="w-4 h-4" />
												Custom Fields Selected ({settings.config.customFields.length})
											</div>
											<div className="flex flex-wrap gap-2">
												{settings.config.customFields.map((field, index) => (
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

									{(!settings.config.customFields || settings.config.customFields.length === 0) && (
										<div className="p-4 border border-dashed border-slate-600 rounded text-center">
											<Database className="w-8 h-8 text-slate-500 mx-auto mb-2" />
											<p className="text-slate-400 text-sm">
												No custom fields configured
											</p>
											<p className="text-slate-500 text-xs mt-1">
												Click "Explore API Fields" to analyze API responses
											</p>
										</div>
									)}
								</div>
							) : (
								// Predefined fields interface
								<div>
									{/* Basic Columns */}
									<div className="mb-6">
										<h4 className="text-md font-medium text-teal-400 mb-3">Basic Fields</h4>
										<div className="grid grid-cols-1 gap-3">
											{basicColumns.map((column) => (
												<div key={column.key} className="flex items-start space-x-3">
													<Checkbox
														id={column.key}
														checked={settings.config.displayFields?.includes(column.key) || false}
														onCheckedChange={(checked) => handleColumnToggle(column.key, checked)}
														className="mt-1 border-slate-600 data-[state=checked]:bg-teal-500"
													/>
													<div className="flex-1">
														<Label htmlFor={column.key} className="text-white font-medium">
															{column.label}
														</Label>
														<p className="text-sm text-slate-400">{column.description}</p>
													</div>
												</div>
											))}
										</div>
									</div>

									{/* Price Columns */}
									<div className="mb-6">
										<h4 className="text-md font-medium text-blue-400 mb-3">Price Data (API Fields: c, d, dp, h, l, o)</h4>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
											{priceColumns.map((column) => (
												<div key={column.key} className="flex items-start space-x-3">
													<Checkbox
														id={column.key}
														checked={settings.config.displayFields?.includes(column.key) || false}
														onCheckedChange={(checked) => handleColumnToggle(column.key, checked)}
														className="mt-1 border-slate-600 data-[state=checked]:bg-teal-500"
													/>
													<div className="flex-1">
														<Label htmlFor={column.key} className="text-white font-medium">
															{column.label}
														</Label>
														<p className="text-sm text-slate-400">{column.description}</p>
													</div>
												</div>
											))}
										</div>
									</div>

									{/* Profile Columns */}
									<div>
										<h4 className="text-md font-medium text-orange-400 mb-3">Company Profile Data</h4>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
											{profileColumns.map((column) => (
												<div key={column.key} className="flex items-start space-x-3">
													<Checkbox
														id={column.key}
														checked={settings.config.displayFields?.includes(column.key) || false}
														onCheckedChange={(checked) => handleColumnToggle(column.key, checked)}
														className="mt-1 border-slate-600 data-[state=checked]:bg-teal-500"
													/>
													<div className="flex-1">
														<Label htmlFor={column.key} className="text-white font-medium">
															{column.label}
														</Label>
														<p className="text-sm text-slate-400">{column.description}</p>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							)}
						</div>
					</Card>

					{/* Sorting & Display */}
					<Card className="p-4 bg-slate-800 border-slate-700">
						<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
							<ArrowUpDown className="w-5 h-5" />
							Sorting & Display Options
						</h3>
						<div className="grid grid-cols-3 gap-4">
							<div>
								<Label htmlFor="sortBy" className="text-slate-300">Sort By</Label>
								<select
									id="sortBy"
									value={settings.config.sortBy}
									onChange={(e) => setSettings(prev => ({
										...prev,
										config: { ...prev.config, sortBy: e.target.value }
									}))}
									className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
								>
									{settings.config.displayFields?.map(field => (
										<option key={field} value={field}>
											{availableColumns.find(col => col.key === field)?.label || field}
										</option>
									))}
								</select>
							</div>
							<div>
								<Label htmlFor="sortOrder" className="text-slate-300">Sort Order</Label>
								<select
									id="sortOrder"
									value={settings.config.sortOrder}
									onChange={(e) => setSettings(prev => ({
										...prev,
										config: { ...prev.config, sortOrder: e.target.value }
									}))}
									className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
								>
									<option value="asc">Ascending</option>
									<option value="desc">Descending</option>
								</select>
							</div>
							<div>
								<Label htmlFor="itemsPerPage" className="text-slate-300">Items Per Page</Label>
								<Input
									id="itemsPerPage"
									type="number"
									value={settings.config.itemsPerPage}
									onChange={(e) => setSettings(prev => ({
										...prev,
										config: { ...prev.config, itemsPerPage: parseInt(e.target.value) || 15 }
									}))}
									className="bg-slate-700 border-slate-600 text-white"
									min="5"
									max="50"
								/>
							</div>
						</div>

						<div className="mt-4">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="includeProfile"
									checked={settings.config.includeProfile || false}
									onCheckedChange={(checked) => setSettings(prev => ({
										...prev,
										config: { ...prev.config, includeProfile: checked }
									}))}
									className="border-slate-600 data-[state=checked]:bg-teal-500"
								/>
								<Label htmlFor="includeProfile" className="text-white">
									Include company profile data (name, market cap, country, etc.)
								</Label>
							</div>
						</div>
					</Card>

					{/* Configuration Preview */}
					<Card className="p-4 bg-slate-800 border-slate-700">
						<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
							<Eye className="w-5 h-5" />
							Configuration Preview
						</h3>
						<div className="text-sm text-slate-300 space-y-2">
							<div><strong>Selected Fields:</strong> {settings.config.displayFields?.length || 0} columns</div>
							<div><strong>Symbols:</strong> {settings.config.symbols?.length || 0} configured</div>
							<div><strong>Sort:</strong> {settings.config.sortBy} ({settings.config.sortOrder})</div>
							<div><strong>Profile Data:</strong> {settings.config.includeProfile ? "Enabled" : "Disabled"}</div>
							<div><strong>Refresh:</strong> Every {settings.config.refreshInterval}s</div>
							<div><strong>Page Size:</strong> {settings.config.itemsPerPage} items</div>
						</div>
					</Card>

					{/* Action Buttons */}
					<div className="flex justify-between pt-4 border-t border-slate-700">
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleRefresh}
								className="border-slate-600 text-slate-300 hover:bg-slate-700"
							>
								<RefreshCw className="w-4 h-4 mr-2" />
								Refresh
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleDuplicate}
								className="border-slate-600 text-slate-300 hover:bg-slate-700"
							>
								<Copy className="w-4 h-4 mr-2" />
								Duplicate
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleDelete}
								className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
							>
								<Trash2 className="w-4 h-4 mr-2" />
								Delete
							</Button>
						</div>

						<div className="flex items-center gap-3">
							{saveSuccess && (
								<div className="text-green-400 text-sm flex items-center">
									✓ Settings saved successfully!
								</div>
							)}
							<Button
								variant="outline"
								onClick={onClose}
								disabled={saving}
								className="border-slate-600 text-slate-300 hover:bg-slate-700"
							>
								Cancel
							</Button>
							<Button
								onClick={handleSave}
								disabled={saving}
								className="bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50"
							>
								{saving ? (
									<>
										<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<Save className="w-4 h-4 mr-2" />
										Save Configuration
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>

			{/* API Response Explorer Modal */}
			<ApiResponseExplorer
				isOpen={showFieldExplorer}
				onClose={() => setShowFieldExplorer(false)}
				onFieldsSelected={handleCustomFieldsSelected}
				initialUrl={settings.config.apiUrl || ""}
				dataSource={settings.config.dataSource || "stocks"}
				widgetType={settings.type}
			/>
		</Dialog>
	)
}
