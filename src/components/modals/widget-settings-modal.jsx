"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import ApiResponseExplorer from "./api-response-explorer"
import {
	Settings,
	TrendingUp,
	Database,
	Columns,
	Save,
	RefreshCw,
	Copy,
	Trash2
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
	
	// Simple state for widget settings
	const [title, setTitle] = useState("")
	const [symbols, setSymbols] = useState("")
	const [refreshTime, setRefreshTime] = useState(30)
	const [selectedFields, setSelectedFields] = useState([])
	const [saving, setSaving] = useState(false)
	const [showFieldExplorer, setShowFieldExplorer] = useState(false)

	// Simple preset configurations
	const presets = {
		"Popular Stocks": {
			symbols: "AAPL,GOOGL,MSFT,TSLA,NVDA",
			fields: ["symbol", "c", "d", "dp"]
		},
		"Tech Stocks": {
			symbols: "AAPL,GOOGL,MSFT,NVDA,META",
			fields: ["symbol", "name", "c", "d", "dp"]
		},
		"Full Data": {
			symbols: "AAPL,GOOGL,MSFT",
			fields: ["symbol", "name", "c", "d", "dp", "h", "l", "marketCapitalization"]
		}
	}

	// Available columns to choose from
	const availableFields = [
		{ key: "symbol", name: "Symbol" },
		{ key: "name", name: "Company Name" },
		{ key: "c", name: "Price" },
		{ key: "d", name: "Change" },
		{ key: "dp", name: "Change %" },
		{ key: "h", name: "High" },
		{ key: "l", name: "Low" },
		{ key: "o", name: "Open" },
		{ key: "marketCapitalization", name: "Market Cap" },
		{ key: "country", name: "Country" },
		{ key: "exchange", name: "Exchange" }
	]

	// Load widget data when modal opens
	useEffect(() => {
		if (widget) {
			setTitle(widget.title || "")
			setSymbols(widget.config?.symbols?.join(", ") || "")
			setRefreshTime(widget.config?.refreshInterval || 30)
			setSelectedFields(widget.config?.displayFields || [])
		}
	}, [widget])

	// Use a preset configuration
	function usePreset(presetName) {
		const preset = presets[presetName]
		if (preset) {
			setTitle(presetName)
			setSymbols(preset.symbols)
			setSelectedFields(preset.fields)
		}
	}

	// Toggle field selection
	function toggleField(fieldKey) {
		if (selectedFields.includes(fieldKey)) {
			setSelectedFields(selectedFields.filter(f => f !== fieldKey))
		} else {
			setSelectedFields([...selectedFields, fieldKey])
		}
	}

	// Save widget settings
	async function saveSettings() {
		if (!widget) return

		setSaving(true)

		try {
			// Convert symbols string to array
			const symbolsArray = symbols.split(",").map(s => s.trim().toUpperCase()).filter(s => s.length > 0)

			// Create widget config with required dataSource
			const widgetConfig = {
				symbols: symbolsArray,
				refreshInterval: refreshTime,
				displayFields: selectedFields,
				dataSource: "stocks" // Fix: Always set dataSource to stocks
			}

			// Update widget
			dispatch(updateWidget({
				id: widget.id,
				updates: {
					title: title,
					config: widgetConfig
				}
			}))

			// Refresh widget data with the same config
			dispatch(fetchWidgetData({
				widgetId: widget.id,
				config: {
					...widgetConfig,
					forceRefresh: true
				}
			}))

			// Close modal
			setTimeout(() => {
				setSaving(false)
				onClose()
			}, 1000)

		} catch (error) {
			console.error("Failed to save:", error)
			setSaving(false)
		}
	}

	// Refresh widget data
	function refreshWidget() {
		if (widget) {
			dispatch(fetchWidgetData({
				widgetId: widget.id,
				config: { ...widget.config, forceRefresh: true }
			}))
		}
	}

	// Copy widget
	function copyWidget() {
		if (widget) {
			dispatch(duplicateWidget(widget.id))
			onClose()
		}
	}

	// Delete widget
	function deleteWidget() {
		if (widget && confirm("Delete this widget?")) {
			dispatch(removeWidget(widget.id))
			onClose()
		}
	}

	// Handle custom fields from explorer
	function handleCustomFields(data) {
		setSelectedFields(data.fields)
		setShowFieldExplorer(false)
	}

	if (!isOpen || !widget) {
		return null
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border">
				<DialogHeader>
					<DialogTitle className="text-xl text-foreground flex items-center gap-2">
						<Settings className="w-5 h-5" />
						Widget Settings - {widget.title}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Basic Settings */}
					<Card className="p-4 bg-card border-border">
						<h3 className="text-lg font-semibold text-card-foreground mb-4">Basic Settings</h3>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label className="text-muted-foreground">Widget Title</Label>
								<Input
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className="bg-input border-border text-foreground"
									placeholder="Enter widget title"
								/>
							</div>
							<div>
								<Label className="text-muted-foreground">Refresh Time (seconds)</Label>
								<Input
									type="number"
									value={refreshTime}
									onChange={(e) => setRefreshTime(parseInt(e.target.value) || 30)}
									className="bg-input border-border text-foreground"
									min="5"
								/>
							</div>
						</div>
					</Card>

					{/* Quick Presets */}
					<Card className="p-4 bg-card border-border">
						<h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
							<Database className="w-5 h-5" />
							Quick Presets
						</h3>
						<div className="grid grid-cols-3 gap-3">
							{Object.keys(presets).map((presetName) => (
								<Button
									key={presetName}
									variant="outline"
									onClick={() => usePreset(presetName)}
									className="bg-muted border-border hover:bg-muted/80 text-card-foreground"
								>
									{presetName}
								</Button>
							))}
						</div>
					</Card>

					{/* Stock Symbols */}
					<Card className="p-4 bg-card border-border">
						<h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
							<TrendingUp className="w-5 h-5" />
							Stock Symbols
						</h3>
						<div>
							<Label className="text-muted-foreground">Stock Symbols (comma-separated)</Label>
							<Input
								value={symbols}
								onChange={(e) => setSymbols(e.target.value)}
								className="bg-input border-border text-foreground"
								placeholder="AAPL, GOOGL, MSFT, TSLA, NVDA"
							/>
							<p className="text-sm text-muted-foreground mt-1">
								Symbols: {symbols.split(',').filter(s => s.trim()).length}
							</p>
						</div>
					</Card>

					{/* Field Selection */}
					<Card className="p-4 bg-slate-800 border-slate-700">
						<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
							<Columns className="w-5 h-5" />
							Data Fields
						</h3>

						<div className="mb-4">
							<Button
								variant="outline"
								onClick={() => setShowFieldExplorer(true)}
								className="border-teal-600 text-teal-300 hover:bg-teal-600 hover:text-white"
							>
								Custom Field Explorer
							</Button>
						</div>

						<div className="grid grid-cols-2 gap-4">
							{availableFields.map((field) => (
								<div key={field.key} className="flex items-center space-x-2">
									<Checkbox
										checked={selectedFields.includes(field.key)}
										onCheckedChange={() => toggleField(field.key)}
										className="border-slate-600 data-[state=checked]:bg-teal-500"
									/>
									<Label className="text-white">{field.name}</Label>
								</div>
							))}
						</div>

						<p className="text-sm text-slate-400 mt-3">
							Selected: {selectedFields.length} fields
						</p>
					</Card>

					{/* Action Buttons */}
					<div className="flex justify-between pt-4 border-t border-slate-700">
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={refreshWidget}
								className="border-slate-600 text-slate-300 hover:bg-slate-700"
							>
								<RefreshCw className="w-4 h-4 mr-2" />
								Refresh
							</Button>
							<Button
								variant="outline"
								onClick={copyWidget}
								className="border-slate-600 text-slate-300 hover:bg-slate-700"
							>
								<Copy className="w-4 h-4 mr-2" />
								Copy
							</Button>
							<Button
								variant="outline"
								onClick={deleteWidget}
								className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
							>
								<Trash2 className="w-4 h-4 mr-2" />
								Delete
							</Button>
						</div>

						<div className="flex gap-3">
							<Button
								variant="outline"
								onClick={onClose}
								disabled={saving}
								className="border-slate-600 text-slate-300 hover:bg-slate-700"
							>
								Cancel
							</Button>
							<Button
								onClick={saveSettings}
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
										Save Settings
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>

			{/* Custom Field Explorer */}
			<ApiResponseExplorer
				isOpen={showFieldExplorer}
				onClose={() => setShowFieldExplorer(false)}
				onFieldsSelected={handleCustomFields}
				dataSource="stocks"
				widgetType="table"
			/>
		</Dialog>
	)
}
