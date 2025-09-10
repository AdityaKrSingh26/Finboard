"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TableSkeleton } from "@/components/ui/loader"
import {
	ChevronUp,
	ChevronDown,
	Search,
	TrendingUp,
	TrendingDown,
	RefreshCw,
	Clock,
	GripVertical,
	Settings,
	X
} from "lucide-react"

export default function TableWidget({ widget, searchQuery = "", dragHandleProps, onSettings, onRemove, title }) {
	const { data, loading, error, config } = widget
	const [localSearchQuery, setLocalSearchQuery] = useState("")
	const [sortConfig, setSortConfig] = useState({
		key: "company",
		direction: "asc"
	})
	const [currentPage, setCurrentPage] = useState(1)

	const itemsPerPage = config?.itemsPerPage || 20
	const effectiveSearchQuery = localSearchQuery || searchQuery

	// Helper functions for dynamic column generation
	const getFieldLabel = (field) => {
		const labelMap = {
			// Stock quote fields (Finnhub format)
			'symbol': 'Symbol',
			'c': 'Current Price',
			'd': 'Change',
			'dp': 'Change %',
			'h': 'High',
			'l': 'Low',
			'o': 'Open',
			'pc': 'Prev Close',
			't': 'Timestamp',
			
			// Company profile fields
			'ticker': 'Symbol',
			'name': 'Company Name',
			'marketCapitalization': 'Market Cap',
			'shareOutstanding': 'Shares Outstanding',
			'country': 'Country',
			'exchange': 'Exchange',
			'currency': 'Currency',
			'finnhubIndustry': 'Industry',
			'ipo': 'IPO Date',
			'weburl': 'Website',
			'phone': 'Phone',
			'logo': 'Logo',
			
			// Legacy fields
			'price': 'Price',
			'change': 'Change',
			'change_percent': 'Change %',
			'volume': 'Volume',
			'market_cap': 'Market Cap',
			'company': 'Company',
			'52_week_high': '52W High',
			'52_week_low': '52W Low'
		}
		
		return labelMap[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
	}

	const getFieldType = (field) => {
		const typeMap = {
			// Currency fields
			'c': 'currency',
			'h': 'currency', 
			'l': 'currency',
			'o': 'currency',
			'pc': 'currency',
			'price': 'currency',
			'marketCapitalization': 'currency',
			'52_week_high': 'currency',
			'52_week_low': 'currency',
			
			// Percentage fields
			'dp': 'percentage',
			'change_percent': 'percentage',
			
			// Number fields
			'd': 'number',
			'change': 'number',
			'shareOutstanding': 'number',
			'volume': 'number',
			't': 'timestamp',
			
			// Text fields
			'symbol': 'text',
			'ticker': 'text',
			'name': 'text',
			'company': 'text',
			'country': 'text',
			'exchange': 'text',
			'currency': 'text',
			'finnhubIndustry': 'text',
			'ipo': 'date',
			'weburl': 'url',
			'phone': 'text',
			'logo': 'image'
		}
		
		return typeMap[field] || 'text'
	}

	// Dynamic columns from widget configuration
	const tableColumns = useMemo(() => {
		if (config?.columns && config.columns.length > 0) {
			return config.columns
		}

		// Fallback: generate columns from displayFields
		if (config?.displayFields && config.displayFields.length > 0) {
			const columnWidth = `${Math.floor(100 / config.displayFields.length)}%`
			return config.displayFields.map(field => ({
				key: field,
				label: getFieldLabel(field),
				width: columnWidth,
				type: getFieldType(field)
			}))
		}

		// Default fallback columns
		return [
			{ key: "symbol", label: "Symbol", width: "15%", type: "text" },
			{ key: "c", label: "Current Price", width: "20%", type: "currency" },
			{ key: "d", label: "Change", width: "15%", type: "number" },
			{ key: "dp", label: "Change %", width: "15%", type: "percentage" },
			{ key: "h", label: "High", width: "15%", type: "currency" },
			{ key: "l", label: "Low", width: "20%", type: "currency" }
		]
	}, [config?.columns, config?.displayFields])

	// Process and filter data
	const processedData = useMemo(() => {
		if (!data || !Array.isArray(data)) return []

		let processed = [...data]

		// Apply search filter
		if (effectiveSearchQuery) {
			processed = processed.filter((item) =>
				item.company?.toString().toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
				item.symbol?.toString().toLowerCase().includes(effectiveSearchQuery.toLowerCase())
			)
		}

		// Apply sorting
		if (sortConfig.key) {
			processed.sort((a, b) => {
				let aVal = a[sortConfig.key]
				let bVal = b[sortConfig.key]

				// Handle price, 52_week_high, and volume as numbers
				if (sortConfig.key === "price" || sortConfig.key === "52_week_high" || sortConfig.key === "volume") {
					aVal = parseFloat(aVal) || 0
					bVal = parseFloat(bVal) || 0
					return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
				}

				// Handle company name as string
				const aStr = aVal?.toString().toLowerCase() || ''
				const bStr = bVal?.toString().toLowerCase() || ''

				if (sortConfig.direction === 'asc') {
					return aStr.localeCompare(bStr)
				} else {
					return bStr.localeCompare(aStr)
				}
			})
		}

		return processed
	}, [data, effectiveSearchQuery, sortConfig])

	// Pagination
	const totalPages = Math.ceil(processedData.length / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const paginatedData = processedData.slice(startIndex, startIndex + itemsPerPage)

	const handleSort = (column) => {
		setSortConfig(prev => ({
			key: column,
			direction: prev.key === column && prev.direction === 'asc' ? 'desc' : 'asc'
		}))
	}

	// Enhanced formatters for different data types
	const formatters = {
		currency: (value) => {
			if (value == null || value === undefined || value === '') return 'N/A'
			const num = typeof value === 'string' ? parseFloat(value) : value
			if (isNaN(num)) return value
			return new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			}).format(num)
		},
		
		percentage: (value) => {
			if (value == null || value === undefined || value === '') return 'N/A'
			const num = typeof value === 'string' ? parseFloat(value) : value
			if (isNaN(num)) return value
			return `${num.toFixed(2)}%`
		},
		
		number: (value) => {
			if (value == null || value === undefined || value === '') return 'N/A'
			const num = typeof value === 'string' ? parseFloat(value) : value
			if (isNaN(num)) return value
			return new Intl.NumberFormat('en-US').format(num)
		},
		
		timestamp: (value) => {
			if (!value) return 'N/A'
			try {
				const date = new Date(parseInt(value) * 1000)
				return date.toLocaleDateString('en-US')
			} catch {
				return value
			}
		},
		
		date: (value) => {
			if (!value) return 'N/A'
			try {
				const date = new Date(value)
				return date.toLocaleDateString('en-US')
			} catch {
				return value
			}
		},
		
		url: (value) => {
			if (!value) return 'N/A'
			return (
				<a 
					href={value} 
					target="_blank" 
					rel="noopener noreferrer"
					className="text-blue-600 hover:text-blue-800 underline"
				>
					{value.length > 30 ? `${value.substring(0, 30)}...` : value}
				</a>
			)
		},
		
		image: (value) => {
			if (!value) return 'N/A'
			return (
				<img 
					src={value} 
					alt="Logo" 
					className="w-8 h-8 object-contain rounded"
					onError={(e) => {
						e.target.style.display = 'none'
					}}
				/>
			)
		},
		
		text: (value) => {
			if (value == null || value === undefined || value === '') return 'N/A'
			return String(value)
		}
	}

	// Get formatted value based on column type
	const getCellValue = (item, column) => {
		const value = getNestedValue(item, column.key)
		const formatter = formatters[column.type] || formatters.text
		return formatter(value)
	}

	// Helper to get nested values (e.g., 'profile.name')
	const getNestedValue = (obj, key) => {
		return key.split('.').reduce((current, prop) => {
			return current && current[prop] !== undefined ? current[prop] : undefined
		}, obj)
	}

	// Legacy formatters for compatibility
	const formatVolume = (volume) => {
		if (!volume || isNaN(volume)) return "—"

		const num = parseInt(volume)
		if (num >= 1000000000) {
			return `${(num / 1000000000).toFixed(1)}B`
		} else if (num >= 1000000) {
			return `${(num / 1000000).toFixed(1)}M`
		} else if (num >= 1000) {
			return `${(num / 1000).toFixed(1)}K`
		}
		return num.toLocaleString()
	}

	const formatPrice = (value) => {
		const numValue = parseFloat(value)
		if (isNaN(numValue)) return "—"
		return `$${numValue.toFixed(2)}`
	}

	const formatCompanyName = (company, symbol) => {
		if (!company && !symbol) return "—"
		return (
			<div className="flex flex-col">
				<span className="font-medium text-white">{company || symbol}</span>
				{company && symbol && company !== symbol && (
					<span className="text-xs text-slate-400">{symbol}</span>
				)}
			</div>
		)
	}

	if (loading && !data) {
		return (
			<div className="w-full">
				{/* Loading header */}
				<div className="flex items-center justify-between mb-6">
					<div className="h-6 w-48 bg-muted rounded animate-pulse" />
					<div className="h-10 w-64 bg-muted rounded animate-pulse" />
				</div>

				{/* Enhanced loading table with proper column count */}
				<TableSkeleton rows={10} columns={4} />
			</div>
		)
	}

	if (error) {
		return (
			<div className="w-full text-center py-12">
				<div className="text-destructive mb-2 text-lg">Error loading data</div>
				<div className="text-muted-foreground">{error}</div>
			</div>
		)
	}

	if (!data || data.length === 0) {
		return (
			<div className="w-full text-center py-12">
				<Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
				<p className="text-muted-foreground text-lg">No data available</p>
				<p className="text-muted-foreground">Check your data source configuration</p>
			</div>
		)
	}

	return (
		<div className="min-h-[600px] flex flex-col -mx-4 my-3" style={{ width: 'calc(100vw - 10px)' }}>
			{/* Header with Search - no duplicate title */}
			<div className="flex items-center justify-between mb-6 px-6 pt-4">
				<div className="flex items-center gap-4">
					<div className="text-sm text-muted-foreground">
						{processedData.length} companies
					</div>
				</div>

				<div className="relative w-80 px-6">
					<Search className="absolute left-9 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
					<Input
						placeholder="Search companies..."
						value={localSearchQuery}
						onChange={(e) => setLocalSearchQuery(e.target.value)}
						className="pl-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary h-12 text-base"
					/>
				</div>
			</div>

			{/* Full Width Table */}
			<div className="flex-1 flex flex-col px-6">
				<div className="overflow-hidden rounded-lg border border-border bg-background w-full theme-transition">
					{/* Title and Controls Row */}
					<div className="bg-card border-b border-border">
						<div className="grid grid-cols-4 gap-6 px-8 py-4">
							<div className="col-span-4 flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div
										{...dragHandleProps}
										className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-accent transition-colors"
									>
										<GripVertical className="w-4 h-4 text-muted-foreground" />
									</div>
									<h3 className="text-lg font-semibold text-foreground">
										{title || "Stock Market Overview"}
									</h3>
								</div>
								<div className="flex items-center gap-1">
									<Button
										variant="ghost"
										size="sm"
										onClick={onSettings}
										className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
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
							</div>
						</div>
					</div>

					{/* Table Header */}
					<div className="bg-card border-b border-border">
						<div className="px-8 py-3" style={{ display: 'grid', gridTemplateColumns: tableColumns.map(col => col.width || 'auto').join(' ') }}>
							{tableColumns.map((column) => (
								<div
									key={column.key}
									className="flex items-center gap-2 text-sm font-semibold text-secondary-foreground cursor-pointer hover:text-foreground transition-colors"
									onClick={() => handleSort(column.key)}
								>
									<span>{column.label}</span>
									{sortConfig.key === column.key && (
										sortConfig.direction === 'asc' ? (
											<ChevronUp className="w-4 h-4" />
										) : (
											<ChevronDown className="w-4 h-4" />
										)
									)}
								</div>
							))}
						</div>
					</div>

					{/* Table Body */}
					<div className="bg-background">
						{paginatedData.length === 0 ? (
							<div className="text-center py-12">
								<Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
								<p className="text-muted-foreground">No results found</p>
								<p className="text-muted-foreground text-sm">Try adjusting your search</p>
							</div>
						) : (
							paginatedData.map((item, index) => (
								<div
									key={startIndex + index}
									className="px-8 py-2 hover:bg-accent/50 transition-colors border-b border-border/50 last:border-b-0"
									style={{ display: 'grid', gridTemplateColumns: tableColumns.map(col => col.width || 'auto').join(' ') }}
								>
									{tableColumns.map((column) => (
										<div key={column.key} className="flex items-center justify-start">
											<span className="text-foreground font-medium">
												{getCellValue(item, column)}
											</span>
										</div>
									))}
								</div>
							))
						)}

						{/* Last Updated Row - inside table */}
						<div className="grid grid-cols-4 px-8 py-3 bg-muted/30 border-t border-border">
							<div className="col-span-4 flex items-center justify-center gap-2 text-muted-foreground">
								<Clock className="w-4 h-4" />
								<span className="text-sm">
									Last updated: {widget.lastUpdated
										? new Date(widget.lastUpdated).toLocaleString('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
											second: '2-digit'
										})
										: 'Never'
									}
								</span>
								<Button
									variant="ghost"
									size="sm"
									className="ml-2 h-6 px-2 text-muted-foreground hover:text-foreground"
									onClick={() => window.location.reload()}
								>
									<RefreshCw className="w-3 h-3" />
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between mt-6 px-6">
						<div className="text-muted-foreground">
							Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, processedData.length)} of {processedData.length} results
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
								disabled={currentPage === 1}
								className="border-border text-muted-foreground hover:bg-accent bg-transparent disabled:opacity-50"
							>
								Previous
							</Button>

							<div className="flex items-center gap-1">
								{Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
									let pageNum
									if (totalPages <= 7) {
										pageNum = i + 1
									} else if (currentPage <= 4) {
										pageNum = i + 1
									} else if (currentPage >= totalPages - 3) {
										pageNum = totalPages - 6 + i
									} else {
										pageNum = currentPage - 3 + i
									}

									return (
										<Button
											key={pageNum}
											variant={currentPage === pageNum ? "default" : "outline"}
											onClick={() => setCurrentPage(pageNum)}
											className={`w-10 h-10 p-0 ${currentPage === pageNum
													? "bg-primary hover:bg-primary/90 text-primary-foreground"
													: "border-border text-muted-foreground hover:bg-accent bg-transparent"
												}`}
										>
											{pageNum}
										</Button>
									)
								})}
							</div>

							<Button
								variant="outline"
								onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
								disabled={currentPage === totalPages}
								className="border-border text-muted-foreground hover:bg-accent bg-transparent disabled:opacity-50"
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
