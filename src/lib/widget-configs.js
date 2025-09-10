// Simple widget configurations for dashboard
// Basic widget templates
export const WIDGET_CONFIGS = {
	// Stock table config
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

	// Company info table config
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

	// Enhanced stock table config
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

	// Simple stock table config
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

	// Trading table config
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

	// Card widget config
	marketSummary: {
		type: 'card',
		dataSource: 'market_summary',
		displayMetrics: ['total_volume', 'gainers_count', 'losers_count'],
		refreshInterval: 60
	},

	// Chart configs
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

// Widget type names
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

// Default configs for new widgets
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

// Field types for data formatting
export const FIELD_TYPE_MAPPING = {
	// Price fields
	'c': 'currency',
	'o': 'currency',
	'h': 'currency',
	'l': 'currency',
	'pc': 'currency',
	'price': 'currency',
	'open': 'currency',
	'high': 'currency',
	'low': 'currency',
	'close': 'currency',
	'marketCapitalization': 'currency',

	// Percentage fields
	'dp': 'percentage',
	'change_percent': 'percentage',
	'change_24h': 'percentage',

	// Number fields
	'd': 'number',
	'change': 'number',
	'volume': 'number',
	'shareOutstanding': 'number',
	't': 'number',

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

// Make widget config based on data
export function generateWidgetConfig(data, widgetType = 'table') {
	if (!data || !Array.isArray(data) || data.length === 0) {
		return DEFAULT_CONFIGS[widgetType] || DEFAULT_CONFIGS.table
	}

	const firstItem = data[0]
	const fields = Object.keys(firstItem)

	if (widgetType === 'table') {
		// Make table columns from data fields
		const columns = fields
			.filter(field => field !== 'last_updated' && field !== 'timestamp')
			.slice(0, 7) // Only show 7 columns max
			.map(field => ({
				key: field,
				label: makeFieldLabel(field),
				width: getColumnWidth(field, fields.length),
				type: FIELD_TYPE_MAPPING[field] || guessFieldType(firstItem[field])
			}))

		return {
			type: 'table',
			dataSource: 'stocks',
			displayFields: columns.map(col => col.key),
			columns: columns,
			sortBy: columns[0]?.key || 'symbol',
			sortOrder: 'asc',
			refreshInterval: 60
		}
	}

	return DEFAULT_CONFIGS[widgetType] || DEFAULT_CONFIGS.table
}

// Make nice field labels
function makeFieldLabel(field) {
	const labels = {
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

	if (labels[field]) {
		return labels[field]
	}

	// Make field name look nice
	return field
		.replace(/([A-Z])/g, ' $1')
		.replace(/^./, str => str.toUpperCase())
		.trim()
}

// Calculate column width
function getColumnWidth(field, totalFields) {
	const importantFields = ['symbol', 'name', 'company']

	if (importantFields.includes(field)) {
		if (totalFields <= 4) return '25%'
		if (totalFields <= 6) return '20%'
		return '15%'
	}

	if (field === 'name' || field === 'company') {
		return '30%'
	}

	const width = Math.floor(100 / totalFields)
	return width + '%'
}

// Guess field type from value
function guessFieldType(value) {
	if (typeof value === 'number') {
		if (value < 1 && value > -1) return 'percentage'
		return 'number'
	}

	if (typeof value === 'string') {
		// Check if it looks like money
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

// Get best config for data type
export function getOptimizedConfig(dataType, data) {
	if (dataType === 'stocks') {
		// Check if data has company info
		if (data && data[0]) {
			const hasCompanyInfo = data[0].marketCapitalization || data[0].shareOutstanding
			if (hasCompanyInfo) return WIDGET_CONFIGS.enhancedStocks
			return WIDGET_CONFIGS.stockQuotes
		}
		return WIDGET_CONFIGS.stockQuotes
	}

	if (dataType === 'crypto') {
		return {
			...WIDGET_CONFIGS.stockQuotes,
			dataSource: 'crypto',
			columns: WIDGET_CONFIGS.stockQuotes.columns.map(col => ({
				...col,
				label: col.label.replace('Stock', 'Crypto')
			}))
		}
	}

	if (dataType === 'forex') {
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
	}

	return generateWidgetConfig(data)
}
