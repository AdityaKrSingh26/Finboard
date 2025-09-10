// Widget configuration templates based on API data structure analysis
export const WIDGET_CONFIGS = {
	// Stock Quote Table Configuration
	stockQuotes: {
		type: 'table',
		dataSource: 'stocks',
		displayFields: ['symbol', 'c', 'd', 'dp', 'h', 'l', 'o'],
		columns: [
			{ key: 'symbol', label: 'Symbol', width: '15%', type: 'text' },
			{ key: 'c', label: 'Current Price', width: '15%', type: 'currency' },
			{ key: 'd', label: 'Change', width: '15%', type: 'number' },
			{ key: 'dp', label: 'Change %', width: '15%', type: 'percentage' },
			{ key: 'h', label: 'High', width: '15%', type: 'currency' },
			{ key: 'l', label: 'Low', width: '15%', type: 'currency' },
			{ key: 'o', label: 'Open', width: '10%', type: 'currency' }
		],
		sortBy: 'symbol',
		sortOrder: 'asc',
		refreshInterval: 30
	},

	// Company Profile Table Configuration
	companyProfiles: {
		type: 'table',
		dataSource: 'stocks',
		displayFields: ['symbol', 'name', 'marketCapitalization', 'shareOutstanding', 'country', 'exchange'],
		columns: [
			{ key: 'symbol', label: 'Symbol', width: '12%', type: 'text' },
			{ key: 'name', label: 'Company Name', width: '30%', type: 'text' },
			{ key: 'marketCapitalization', label: 'Market Cap', width: '15%', type: 'currency' },
			{ key: 'shareOutstanding', label: 'Shares', width: '15%', type: 'number' },
			{ key: 'country', label: 'Country', width: '13%', type: 'text' },
			{ key: 'exchange', label: 'Exchange', width: '15%', type: 'text' }
		],
		sortBy: 'marketCapitalization',
		sortOrder: 'desc',
		refreshInterval: 300
	},

	// Enhanced Stock Table (combines quote + profile data)
	enhancedStocks: {
		type: 'table',
		dataSource: 'stocks',
		displayFields: ['symbol', 'name', 'c', 'd', 'dp', 'marketCapitalization', 'country'],
		columns: [
			{ key: 'symbol', label: 'Symbol', width: '12%', type: 'text' },
			{ key: 'name', label: 'Company Name', width: '25%', type: 'text' },
			{ key: 'c', label: 'Price', width: '13%', type: 'currency' },
			{ key: 'd', label: 'Change', width: '12%', type: 'number' },
			{ key: 'dp', label: 'Change %', width: '12%', type: 'percentage' },
			{ key: 'marketCapitalization', label: 'Market Cap', width: '15%', type: 'currency' },
			{ key: 'country', label: 'Country', width: '11%', type: 'text' }
		],
		sortBy: 'marketCapitalization',
		sortOrder: 'desc',
		refreshInterval: 60
	},

	// Compact Stock Table (key metrics only)
	compactStocks: {
		type: 'table',
		dataSource: 'stocks',
		displayFields: ['symbol', 'c', 'd', 'dp'],
		columns: [
			{ key: 'symbol', label: 'Symbol', width: '25%', type: 'text' },
			{ key: 'c', label: 'Price', width: '25%', type: 'currency' },
			{ key: 'd', label: 'Change', width: '25%', type: 'number' },
			{ key: 'dp', label: 'Change %', width: '25%', type: 'percentage' }
		],
		sortBy: 'dp',
		sortOrder: 'desc',
		refreshInterval: 15
	},

	// Trading-focused Table (OHLC + Volume)
	tradingView: {
		type: 'table',
		dataSource: 'stocks',
		displayFields: ['symbol', 'o', 'h', 'l', 'c', 'volume'],
		columns: [
			{ key: 'symbol', label: 'Symbol', width: '15%', type: 'text' },
			{ key: 'o', label: 'Open', width: '17%', type: 'currency' },
			{ key: 'h', label: 'High', width: '17%', type: 'currency' },
			{ key: 'l', label: 'Low', width: '17%', type: 'currency' },
			{ key: 'c', label: 'Close', width: '17%', type: 'currency' },
			{ key: 'volume', label: 'Volume', width: '17%', type: 'number' }
		],
		sortBy: 'volume',
		sortOrder: 'desc',
		refreshInterval: 30
	},

	// Card Widget Configurations
	marketSummary: {
		type: 'card',
		dataSource: 'market_summary',
		displayMetrics: ['total_volume', 'gainers_count', 'losers_count'],
		refreshInterval: 60
	},

	// Chart Widget Configurations
	stockPriceChart: {
		type: 'chart',
		dataSource: 'chart_data',
		chartType: 'line',
		timeframe: 'daily',
		displayFields: ['date', 'close', 'volume'],
		refreshInterval: 30
	},

	stockCandlestickChart: {
		type: 'chart',
		dataSource: 'chart_data', 
		chartType: 'candlestick',
		timeframe: 'daily',
		displayFields: ['date', 'open', 'high', 'low', 'close', 'volume'],
		refreshInterval: 30
	},

	cryptoPriceChart: {
		type: 'chart',
		dataSource: 'crypto',
		chartType: 'area',
		timeframe: 'daily',
		displayFields: ['symbol', 'price', 'change_percent_24h'],
		refreshInterval: 60
	},

	marketOverviewChart: {
		type: 'chart',
		dataSource: 'stocks',
		chartType: 'line',
		timeframe: 'current',
		displayFields: ['symbol', 'price', 'change_percent'],
		refreshInterval: 60
	}
}

// Configuration mapping for different widget types
export const WIDGET_TYPE_CONFIGS = {
	'Stock Quotes': 'stockQuotes',
	'Company Profiles': 'companyProfiles',
	'Enhanced Stocks': 'enhancedStocks',
	'Compact View': 'compactStocks',
	'Trading View': 'tradingView',
	'Market Summary': 'marketSummary',
	'Stock Price Chart': 'stockPriceChart',
	'Stock Candlestick Chart': 'stockCandlestickChart',
	'Crypto Price Chart': 'cryptoPriceChart',
	'Market Overview Chart': 'marketOverviewChart'
}

// Default configuration templates for auto-configuration
export const DEFAULT_CONFIGS = {
	table: {
		type: 'table',
		columns: [
			{ key: 'symbol', label: 'Symbol', width: '20%', type: 'text' },
			{ key: 'c', label: 'Price', width: '20%', type: 'currency' },
			{ key: 'd', label: 'Change', width: '20%', type: 'number' },
			{ key: 'dp', label: 'Change %', width: '20%', type: 'percentage' },
			{ key: 'volume', label: 'Volume', width: '20%', type: 'number' }
		],
		sortBy: 'symbol',
		sortOrder: 'asc',
		refreshInterval: 60
	},

	card: {
		type: 'card',
		displayMetrics: ['value', 'change', 'change_percent'],
		refreshInterval: 60
	},

	chart: {
		type: 'chart',
		chartType: 'line',
		timeframe: 'daily',
		displayFields: ['date', 'close'],
		refreshInterval: 60
	}
}

// Field type detection based on API analysis
export const FIELD_TYPE_MAPPING = {
	// Price-related fields
	'c': 'currency',      // Current price
	'o': 'currency',      // Open price
	'h': 'currency',      // High price
	'l': 'currency',      // Low price
	'pc': 'currency',     // Previous close
	'price': 'currency',
	'open': 'currency',
	'high': 'currency',
	'low': 'currency',
	'close': 'currency',
	'marketCapitalization': 'currency',

	// Percentage fields
	'dp': 'percentage',   // Daily percentage change
	'change_percent': 'percentage',
	'change_24h': 'percentage',

	// Number fields
	'd': 'number',        // Daily change
	'change': 'number',
	'volume': 'number',
	'shareOutstanding': 'number',
	't': 'number',        // Timestamp

	// Text fields
	'symbol': 'text',
	'name': 'text',
	'company': 'text',
	'ticker': 'text',
	'country': 'text',
	'currency': 'text',
	'exchange': 'text',
	'finnhubIndustry': 'text',
	'ipo': 'text',
	'weburl': 'text',
	'phone': 'text'
}

// Auto-generate widget configuration based on data structure
export function generateWidgetConfig(data, widgetType = 'table') {
	if (!data || !Array.isArray(data) || data.length === 0) {
		return DEFAULT_CONFIGS[widgetType] || DEFAULT_CONFIGS.table
	}

	const sampleItem = data[0]
	const availableFields = Object.keys(sampleItem)

	if (widgetType === 'table') {
		// Generate table columns based on available fields
		const columns = availableFields
			.filter(field => field !== 'last_updated' && field !== 'timestamp')
			.slice(0, 7) // Limit to 7 columns for optimal display
			.map(field => ({
				key: field,
				label: formatFieldLabel(field),
				width: calculateColumnWidth(field, availableFields.length),
				type: FIELD_TYPE_MAPPING[field] || detectFieldType(sampleItem[field])
			}))

		return {
			type: 'table',
			dataSource: 'stocks',
			displayFields: columns.map(col => col.key),
			columns,
			sortBy: columns[0]?.key || 'symbol',
			sortOrder: 'asc',
			refreshInterval: 60
		}
	}

	return DEFAULT_CONFIGS[widgetType] || DEFAULT_CONFIGS.table
}

// Helper functions
function formatFieldLabel(field) {
	const labelMappings = {
		'c': 'Current Price',
		'd': 'Change',
		'dp': 'Change %',
		'h': 'High',
		'l': 'Low',
		'o': 'Open',
		'pc': 'Previous Close',
		'marketCapitalization': 'Market Cap',
		'shareOutstanding': 'Shares Outstanding',
		'finnhubIndustry': 'Industry'
	}

	if (labelMappings[field]) {
		return labelMappings[field]
	}

	// Auto-format field names
	return field
		.replace(/([A-Z])/g, ' $1')
		.replace(/^./, str => str.toUpperCase())
		.trim()
}

function calculateColumnWidth(field, totalFields) {
	// Distribute width based on field importance and type
	const primaryFields = ['symbol', 'name', 'company']
	const priceFields = ['c', 'price', 'o', 'h', 'l']

	if (primaryFields.includes(field)) {
		return totalFields <= 4 ? '25%' : totalFields <= 6 ? '20%' : '15%'
	}

	if (field === 'name' || field === 'company') {
		return '30%'
	}

	const remainingWidth = 100
	const remainingFields = totalFields
	return `${Math.floor(remainingWidth / remainingFields)}%`
}

function detectFieldType(value) {
	if (typeof value === 'number') {
		return value < 1 && value > -1 ? 'percentage' : 'number'
	}

	if (typeof value === 'string') {
		// Check if it's a currency value
		if (/^\$?[\d,]+\.?\d*$/.test(value)) {
			return 'currency'
		}

		// Check if it's a percentage
		if (/%$/.test(value)) {
			return 'percentage'
		}
	}

	return 'text'
}

// Get optimized configuration for specific data types
export function getOptimizedConfig(dataType, data) {
	switch (dataType) {
		case 'stocks':
			// Analyze the data to determine if it's basic quotes or enhanced profiles
			if (data && data[0]) {
				const hasProfileData = data[0].marketCapitalization || data[0].shareOutstanding
				return hasProfileData ? WIDGET_CONFIGS.enhancedStocks : WIDGET_CONFIGS.stockQuotes
			}
			return WIDGET_CONFIGS.stockQuotes

		case 'crypto':
			return {
				...WIDGET_CONFIGS.stockQuotes,
				dataSource: 'crypto',
				columns: WIDGET_CONFIGS.stockQuotes.columns.map(col => ({
					...col,
					label: col.label.replace('Stock', 'Crypto')
				}))
			}

		case 'forex':
			return {
				...WIDGET_CONFIGS.compactStocks,
				dataSource: 'forex',
				columns: [
					{ key: 'pair', label: 'Currency Pair', width: '30%', type: 'text' },
					{ key: 'rate', label: 'Exchange Rate', width: '25%', type: 'number' },
					{ key: 'change', label: 'Change', width: '22.5%', type: 'number' },
					{ key: 'change_percent', label: 'Change %', width: '22.5%', type: 'percentage' }
				]
			}

		default:
			return generateWidgetConfig(data)
	}
}
