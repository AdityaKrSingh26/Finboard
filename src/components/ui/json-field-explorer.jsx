"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
	ChevronRight,
	ChevronDown,
	Search,
	Hash,
	Type,
	Calendar,
	ToggleLeft,
	Database,
	List,
	CheckCircle2,
	Eye,
	EyeOff,
	Filter,
	Zap,
	Code,
	Copy,
	RefreshCw
} from "lucide-react"

// Field type detection utilities
const detectFieldType = (value) => {
	if (value === null || value === undefined) return "null"
	if (typeof value === "boolean") return "boolean"
	if (typeof value === "string") {
		if (/^\d{4}-\d{2}-\d{2}/.test(value)) return "date"
		if (/^https?:\/\//.test(value)) return "url"
		if (/^[A-Z]{2,10}$/.test(value)) return "symbol"
		if (/^\d+(\.\d+)?%$/.test(value)) return "percentage"
		if (/^\$\d+/.test(value)) return "currency"
		return "string"
	}
	if (typeof value === "number") {
		if (Number.isInteger(value) && value > 1000000000) return "timestamp"
		if (value > 1000000) return "large_number"
		if (value < 1 && value > 0) return "decimal"
		return "number"
	}
	if (Array.isArray(value)) return "array"
	if (typeof value === "object") return "object"
	return "unknown"
}

const getFieldIcon = (type) => {
	const iconProps = { className: "w-3 h-3", strokeWidth: 2 }
	switch (type) {
		case "string":
		case "symbol":
			return <Type {...iconProps} className="w-3 h-3 text-blue-400" />
		case "number":
		case "decimal":
		case "large_number":
		case "currency":
		case "percentage":
			return <Hash {...iconProps} className="w-3 h-3 text-green-400" />
		case "boolean":
			return <ToggleLeft {...iconProps} className="w-3 h-3 text-purple-400" />
		case "date":
		case "timestamp":
			return <Calendar {...iconProps} className="w-3 h-3 text-yellow-400" />
		case "array":
			return <List {...iconProps} className="w-3 h-3 text-orange-400" />
		case "object":
			return <Database {...iconProps} className="w-3 h-3 text-cyan-400" />
		case "url":
			return <Zap {...iconProps} className="w-3 h-3 text-pink-400" />
		default:
			return <Code {...iconProps} className="w-3 h-3 text-gray-400" />
	}
}

const getTypeColor = (type) => {
	switch (type) {
		case "string":
		case "symbol":
			return "bg-blue-500/20 text-blue-300 border-blue-500/30"
		case "number":
		case "decimal":
		case "large_number":
		case "currency":
		case "percentage":
			return "bg-green-500/20 text-green-300 border-green-500/30"
		case "boolean":
			return "bg-purple-500/20 text-purple-300 border-purple-500/30"
		case "date":
		case "timestamp":
			return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
		case "array":
			return "bg-orange-500/20 text-orange-300 border-orange-500/30"
		case "object":
			return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
		case "url":
			return "bg-pink-500/20 text-pink-300 border-pink-500/30"
		default:
			return "bg-gray-500/20 text-gray-300 border-gray-500/30"
	}
}

// Tree node component for displaying JSON structure
const TreeNode = ({ 
	path, 
	value, 
	level = 0, 
	isExpanded, 
	onToggleExpand, 
	selectedFields, 
	onFieldSelect,
	searchQuery = "",
	onPreview
}) => {
	const fieldPath = path.join(".")
	const fieldType = detectFieldType(value)
	const isSelected = selectedFields.includes(fieldPath)
	const isArray = Array.isArray(value)
	const isObject = typeof value === "object" && value !== null && !isArray
	const isExpandable = isArray || isObject
	const expanded = isExpanded[fieldPath] || false

	// Check if this node or its children match the search
	const matchesSearch = searchQuery === "" || 
		fieldPath.toLowerCase().includes(searchQuery.toLowerCase()) ||
		(typeof value === "string" && value.toLowerCase().includes(searchQuery.toLowerCase()))

	// For arrays, show sample of first few elements
	const displayValue = useMemo(() => {
		if (isArray) {
			const length = value.length
			if (length === 0) return "[]"
			const sample = value.slice(0, 3).map(item => {
				if (typeof item === "object") return "{...}"
				return String(item).slice(0, 20)
			}).join(", ")
			return `[${sample}${length > 3 ? `, ...${length - 3} more` : ""}]`
		}
		if (isObject) {
			const keys = Object.keys(value)
			return `{${keys.length} fields}`
		}
		if (typeof value === "string") {
			return value.length > 50 ? `"${value.slice(0, 50)}..."` : `"${value}"`
		}
		return String(value)
	}, [value, isArray, isObject])

	if (!matchesSearch && level > 0) return null

	return (
		<div className="w-full">
			<div
				className={`flex items-center gap-2 py-1.5 px-2 rounded text-sm hover:bg-slate-700/50 transition-colors ${
					level === 0 ? "font-medium" : ""
				}`}
				style={{ paddingLeft: `${level * 16 + 8}px` }}
			>
				{/* Expand/Collapse button */}
				{isExpandable && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onToggleExpand(fieldPath)}
						className="h-4 w-4 p-0 hover:bg-slate-600"
					>
						{expanded ? (
							<ChevronDown className="w-3 h-3" />
						) : (
							<ChevronRight className="w-3 h-3" />
						)}
					</Button>
				)}

				{!isExpandable && <div className="w-4" />}

				{/* Field selection checkbox */}
				{!isExpandable && (
					<Checkbox
						checked={isSelected}
						onCheckedChange={(checked) => onFieldSelect(fieldPath, checked)}
						className="border-slate-500 data-[state=checked]:bg-teal-500"
					/>
				)}

				{/* Field type icon */}
				{getFieldIcon(fieldType)}

				{/* Field name */}
				<span className="text-slate-200 font-mono">
					{path[path.length - 1]}
				</span>

				{/* Field type badge */}
				<Badge variant="outline" className={`text-xs px-1.5 py-0 ${getTypeColor(fieldType)}`}>
					{fieldType}
				</Badge>

				{/* Field value preview */}
				<span className="text-slate-400 text-xs flex-1 truncate ml-2 font-mono">
					{displayValue}
				</span>

				{/* Preview button for objects/arrays */}
				{isExpandable && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onPreview(fieldPath, value)}
						className="h-6 w-6 p-0 hover:bg-slate-600"
					>
						<Eye className="w-3 h-3 text-slate-400" />
					</Button>
				)}
			</div>

			{/* Render children if expanded */}
			{expanded && isExpandable && (
				<div className="ml-2">
					{isArray && value.slice(0, 5).map((item, index) => (
						<TreeNode
							key={index}
							path={[...path, `[${index}]`]}
							value={item}
							level={level + 1}
							isExpanded={isExpanded}
							onToggleExpand={onToggleExpand}
							selectedFields={selectedFields}
							onFieldSelect={onFieldSelect}
							searchQuery={searchQuery}
							onPreview={onPreview}
						/>
					))}
					{isObject && Object.entries(value).map(([key, val]) => (
						<TreeNode
							key={key}
							path={[...path, key]}
							value={val}
							level={level + 1}
							isExpanded={isExpanded}
							onToggleExpand={onToggleExpand}
							selectedFields={selectedFields}
							onFieldSelect={onFieldSelect}
							searchQuery={searchQuery}
							onPreview={onPreview}
						/>
					))}
				</div>
			)}
		</div>
	)
}

// Main JSON Field Explorer component
export default function JsonFieldExplorer({
	data,
	selectedFields = [],
	onFieldSelect,
	onFieldsChange,
	maxHeight = "400px",
	showPreview = true,
	enableSearch = true,
	enableFilters = true,
	className = ""
}) {
	const [isExpanded, setIsExpanded] = useState({})
	const [searchQuery, setSearchQuery] = useState("")
	const [typeFilter, setTypeFilter] = useState("all")
	const [previewData, setPreviewData] = useState(null)
	const [showPreviewModal, setShowPreviewModal] = useState(false)

	// Auto-expand root level on first load
	useEffect(() => {
		if (data && Object.keys(isExpanded).length === 0) {
			const rootExpansion = {}
			if (Array.isArray(data)) {
				rootExpansion["root"] = true
				if (data.length > 0) {
					rootExpansion["root[0]"] = true
				}
			} else if (typeof data === "object" && data !== null) {
				rootExpansion["root"] = true
				// Auto-expand first level
				Object.keys(data).forEach(key => {
					if (typeof data[key] === "object" && data[key] !== null) {
						rootExpansion[`root.${key}`] = true
					}
				})
			}
			setIsExpanded(rootExpansion)
		}
	}, [data])

	// Handle expand/collapse
	const handleToggleExpand = (path) => {
		setIsExpanded(prev => ({
			...prev,
			[path]: !prev[path]
		}))
	}

	// Handle field selection
	const handleFieldSelect = (fieldPath, checked) => {
		let newFields
		if (checked) {
			newFields = [...selectedFields, fieldPath]
		} else {
			newFields = selectedFields.filter(f => f !== fieldPath)
		}
		
		onFieldSelect?.(fieldPath, checked)
		onFieldsChange?.(newFields)
	}

	// Handle preview
	const handlePreview = (path, value) => {
		setPreviewData({ path, value })
		setShowPreviewModal(true)
	}

	// Get available field types for filtering
	const availableTypes = useMemo(() => {
		const types = new Set()
		
		const extractTypes = (obj, path = []) => {
			if (Array.isArray(obj)) {
				types.add("array")
				obj.slice(0, 3).forEach((item, index) => {
					extractTypes(item, [...path, `[${index}]`])
				})
			} else if (typeof obj === "object" && obj !== null) {
				types.add("object")
				Object.entries(obj).forEach(([key, value]) => {
					types.add(detectFieldType(value))
					if (typeof value === "object" && value !== null) {
						extractTypes(value, [...path, key])
					}
				})
			} else {
				types.add(detectFieldType(obj))
			}
		}

		if (data) extractTypes(data)
		return Array.from(types).sort()
	}, [data])

	// Smart field suggestions based on widget type
	const getSmartSuggestions = (widgetType = "table") => {
		if (!data) return []

		const suggestions = {
			table: ["symbol", "name", "price", "change", "volume", "market_cap"],
			card: ["title", "value", "change", "trend", "status"],
			chart: ["date", "time", "open", "high", "low", "close", "volume"]
		}

		const targetFields = suggestions[widgetType] || suggestions.table
		const allFields = []

		const extractFields = (obj, path = []) => {
			if (Array.isArray(obj) && obj.length > 0) {
				extractFields(obj[0], path)
			} else if (typeof obj === "object" && obj !== null) {
				Object.entries(obj).forEach(([key, value]) => {
					const fieldPath = [...path, key].join(".")
					allFields.push({
						path: fieldPath,
						key: key.toLowerCase(),
						type: detectFieldType(value),
						value: value
					})
					if (typeof value === "object" && value !== null && !Array.isArray(value)) {
						extractFields(value, [...path, key])
					}
				})
			}
		}

		extractFields(data)

		return targetFields.map(target => {
			const matches = allFields.filter(field => 
				field.key.includes(target.toLowerCase()) || 
				target.toLowerCase().includes(field.key)
			)
			return {
				target,
				matches: matches.slice(0, 3)
			}
		}).filter(suggestion => suggestion.matches.length > 0)
	}

	const smartSuggestions = getSmartSuggestions()

	if (!data) {
		return (
			<Card className="bg-slate-800 border-slate-700">
				<CardContent className="p-6 text-center">
					<Database className="w-12 h-12 text-slate-500 mx-auto mb-3" />
					<p className="text-slate-400">No data available to explore</p>
					<p className="text-slate-500 text-sm mt-1">
						Connect to an API or provide sample data to explore its structure
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className={`space-y-4 ${className}`}>
			{/* Header with search and filters */}
			{(enableSearch || enableFilters) && (
				<div className="flex items-center gap-3">
					{enableSearch && (
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
							<Input
								placeholder="Search fields..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
							/>
						</div>
					)}

					{enableFilters && (
						<select
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value)}
							className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
						>
							<option value="all">All Types</option>
							{availableTypes.map(type => (
								<option key={type} value={type}>
									{type.charAt(0).toUpperCase() + type.slice(1)}
								</option>
							))}
						</select>
					)}

					<Badge variant="outline" className="text-slate-300 border-slate-500">
						{selectedFields.length} selected
					</Badge>
				</div>
			)}

			{/* Smart suggestions */}
			{smartSuggestions.length > 0 && (
				<Card className="bg-slate-800 border-slate-700">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm text-teal-400 flex items-center gap-2">
							<Zap className="w-4 h-4" />
							Smart Field Suggestions
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
							{smartSuggestions.slice(0, 4).map((suggestion, index) => (
								<div key={index} className="text-xs">
									<span className="text-slate-400">Looking for "{suggestion.target}"?</span>
									<div className="flex flex-wrap gap-1 mt-1">
										{suggestion.matches.map((match, matchIndex) => (
											<Button
												key={matchIndex}
												variant="outline"
												size="sm"
												onClick={() => handleFieldSelect(match.path, true)}
												className="h-6 px-2 text-xs border-slate-600 text-slate-300 hover:bg-slate-600"
											>
												{match.path}
											</Button>
										))}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* JSON Tree Explorer */}
			<Card className="bg-slate-800 border-slate-700">
				<CardHeader className="pb-3">
					<CardTitle className="text-sm text-white flex items-center gap-2">
						<Database className="w-4 h-4" />
						API Response Structure
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								// Expand all first level
								const newExpanded = { ...isExpanded }
								if (Array.isArray(data)) {
									newExpanded["root"] = true
									if (data.length > 0) {
										Object.keys(data[0] || {}).forEach(key => {
											newExpanded[`root[0].${key}`] = true
										})
									}
								} else if (typeof data === "object" && data !== null) {
									newExpanded["root"] = true
									Object.keys(data).forEach(key => {
										newExpanded[`root.${key}`] = true
									})
								}
								setIsExpanded(newExpanded)
							}}
							className="ml-auto h-6 px-2 text-xs text-slate-400 hover:text-white"
						>
							<RefreshCw className="w-3 h-3 mr-1" />
							Expand All
						</Button>
					</CardTitle>
				</CardHeader>
				<CardContent 
					className="p-0 overflow-y-auto" 
					style={{ maxHeight }}
				>
					<div className="p-3">
						<TreeNode
							path={["root"]}
							value={data}
							level={0}
							isExpanded={isExpanded}
							onToggleExpand={handleToggleExpand}
							selectedFields={selectedFields}
							onFieldSelect={handleFieldSelect}
							searchQuery={searchQuery}
							onPreview={handlePreview}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Selected fields summary */}
			{selectedFields.length > 0 && (
				<Card className="bg-slate-800 border-slate-700">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm text-green-400 flex items-center gap-2">
							<CheckCircle2 className="w-4 h-4" />
							Selected Fields ({selectedFields.length})
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<div className="flex flex-wrap gap-2">
							{selectedFields.map((field, index) => (
								<Badge
									key={index}
									variant="secondary"
									className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs"
								>
									{field}
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleFieldSelect(field, false)}
										className="ml-1 h-3 w-3 p-0 hover:bg-red-500/20"
									>
										<span className="text-red-400">×</span>
									</Button>
								</Badge>
							))}
						</div>
						<div className="mt-3 flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									navigator.clipboard.writeText(JSON.stringify(selectedFields, null, 2))
								}}
								className="h-6 px-2 text-xs border-slate-600 text-slate-300 hover:bg-slate-600"
							>
								<Copy className="w-3 h-3 mr-1" />
								Copy Fields
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onFieldsChange?.([])}
								className="h-6 px-2 text-xs border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
							>
								Clear All
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Preview Modal */}
			{showPreviewModal && previewData && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
					<Card className="w-full max-w-2xl max-h-[80vh] bg-slate-800 border-slate-700">
						<CardHeader>
							<CardTitle className="text-white flex items-center justify-between">
								<span>Preview: {previewData.path}</span>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setShowPreviewModal(false)}
									className="text-slate-400 hover:text-white"
								>
									<EyeOff className="w-4 h-4" />
								</Button>
							</CardTitle>
						</CardHeader>
						<CardContent className="overflow-y-auto">
							<pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded overflow-auto">
								{JSON.stringify(previewData.value, null, 2)}
							</pre>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	)
}
