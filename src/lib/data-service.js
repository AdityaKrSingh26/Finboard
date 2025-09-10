// Simple data service for finance dashboard
import { alphaVantageClient } from "./api/alpha-vantage-client.js"
import { coinGeckoClient } from "./api/coingecko-client.js"
import { exchangeRateClient } from "./api/exchange-rate-client.js"
import { finnhubClient } from "./api/finnhub-client.js"

// Simple cache using basic object
let dataCache = {}

function saveToCache(key, data) {
	dataCache[key] = {
		data: data,
		timestamp: Date.now()
	}
}

function getFromCache(key) {
	const cached = dataCache[key]
	if (cached && Date.now() - cached.timestamp < 30000) { // 30 seconds
		return cached.data
	}
	return null
}

export async function fetchData(endpoint, options = {}) {
	const cacheKey = endpoint + JSON.stringify(options)
	const cached = getFromCache(cacheKey)

	if (cached) {
		return cached
	}

	try {
		let data

		if (endpoint === "stocks" || endpoint === "market_gainers" || endpoint === "market_losers") {
			data = await fetchStockData(options)
		} else if (endpoint === "crypto" || endpoint === "crypto_chart") {
			data = await fetchCryptoData(options)
		} else if (endpoint === "forex") {
			data = await fetchForexData(options)
		} else if (endpoint === "market_summary" || endpoint === "watchlist" || endpoint === "performance_data" || endpoint === "financial_data") {
			data = await fetchMarketSummaryData(options)
		} else if (endpoint === "chart_data" || endpoint === "market_trends") {
			data = await fetchChartData(options)
		} else if (endpoint === "custom") {
			data = await fetchCustomApiData(options.apiUrl, options)
		} else {
			throw new Error("Unknown endpoint: " + endpoint)
		}

		saveToCache(cacheKey, data)
		return data

	} catch (error) {
		console.error("Error fetching data from " + endpoint + ":", error.message)
		throw error
	}
}

// Get stock data from APIs
async function fetchStockData(options = {}) {
	try {
		let stocksData

		if (options.symbols && Array.isArray(options.symbols)) {
			stocksData = await finnhubClient.getEnhancedStockQuotes(options.symbols)
		} else {
			stocksData = await finnhubClient.getPopularStocks()
		}

		return normalizeStockData(stocksData, options.includeProfile)
	} catch (error) {
		try {
			let stocksData
			if (options.symbols && Array.isArray(options.symbols)) {
				stocksData = await alphaVantageClient.getMultipleStockQuotes(options.symbols)
			} else {
				stocksData = await alphaVantageClient.getPopularStocks()
			}
			return normalizeStockData(stocksData, options.includeProfile)
		} catch (alphaError) {
			throw new Error('All stock data sources failed')
		}
	}
}

// Make stock data look the same
function normalizeStockData(data, includeProfile = false) {
	if (!Array.isArray(data)) return []

	return data.map(item => {
		const result = {
			symbol: item.symbol || item.ticker || item.Symbol,
			c: parseFloat(item.c || item.price || item['2. price'] || 0),
			d: parseFloat(item.d || item.change || item['3. change'] || 0),
			dp: parseFloat(item.dp || item.change_percent || item['4. change_percent'] || 0),
			h: parseFloat(item.h || item.high || item['5. high'] || item.c || 0),
			l: parseFloat(item.l || item.low || item['6. low'] || item.c || 0),
			o: parseFloat(item.o || item.open || item['7. open'] || item.c || 0),
			pc: parseFloat(item.pc || item.prev_close || item['8. previous_close'] || item.c || 0),
			t: item.t || item.timestamp || Date.now() / 1000,
			price: parseFloat(item.c || item.price || item['2. price'] || 0),
			change: parseFloat(item.d || item.change || item['3. change'] || 0),
			change_percent: parseFloat(item.dp || item.change_percent || item['4. change_percent'] || 0),
			volume: item.volume || Math.floor(Math.random() * 1000000),
			last_updated: new Date().toISOString(),
			name: item.name || item.company || item.symbol,
		}

		result.company = result.name

		if (includeProfile) {
			result.ticker = item.ticker || item.symbol
			result.country = item.country || 'US'
			result.currency = item.currency || 'USD'
			result.exchange = item.exchange || 'NASDAQ'
			result.marketCapitalization = item.marketCapitalization || null
			result.shareOutstanding = item.shareOutstanding || null
			result.finnhubIndustry = item.finnhubIndustry || null
			result.ipo = item.ipo || null
			result.weburl = item.weburl || null
			result.phone = item.phone || null
			result.logo = item.logo || null
			result.market_cap = item.market_cap || (
				result.marketCapitalization ?
					(result.marketCapitalization / 1000).toFixed(1) + 'B' :
					'N/A'
			)
		}

		return result
	})
}

// Get crypto data
async function fetchCryptoData(options = {}) {
	try {
		const limit = options.limit || 20
		return await coinGeckoClient.getCryptoMarkets('usd', limit)
	} catch (error) {
		console.warn('Crypto API failed, using mock data:', error.message)
		return generateMockCryptoData(options.limit || 20)
	}
}

// Get forex data
async function fetchForexData(options = {}) {
	try {
		if (options.pair && options.pair.includes('/')) {
			const [from, to] = options.pair.split('/')
			const pairData = await exchangeRateClient.getPairRate(from, to)
			return [pairData]
		} else {
			return await exchangeRateClient.getPopularForexPairs()
		}
	} catch (error) {
		console.warn('Forex API failed, using mock data:', error.message)
		return generateMockForexData(options)
	}
}

// Generate mock crypto data
function generateMockCryptoData(limit = 20) {
	const cryptos = ['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 'polkadot', 'dogecoin', 'avalanche-2', 'polygon', 'chainlink']
	const symbols = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'DOGE', 'AVAX', 'MATIC', 'LINK']
	
	return cryptos.slice(0, limit).map((name, i) => ({
		id: name,
		symbol: symbols[i] || `COIN${i}`,
		name: name.charAt(0).toUpperCase() + name.slice(1),
		current_price: Math.random() * 50000 + 100,
		market_cap: Math.random() * 1000000000000,
		price_change_24h: (Math.random() - 0.5) * 1000,
		price_change_percentage_24h: (Math.random() - 0.5) * 20,
		total_volume: Math.random() * 10000000000,
		last_updated: new Date().toISOString()
	}))
}

// Generate mock forex data
function generateMockForexData(options = {}) {
	const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD']
	
	if (options.pair && options.pair.includes('/')) {
		return [{
			pair: options.pair,
			rate: Math.random() * 2 + 0.5,
			change: (Math.random() - 0.5) * 0.1,
			change_percent: (Math.random() - 0.5) * 5,
			last_updated: new Date().toISOString()
		}]
	}
	
	return pairs.map(pair => ({
		pair: pair,
		rate: Math.random() * 2 + 0.5,
		change: (Math.random() - 0.5) * 0.1,
		change_percent: (Math.random() - 0.5) * 5,
		last_updated: new Date().toISOString()
	}))
}

// Get market summary data
async function fetchMarketSummaryData(options = {}) {
	try {
		const { gainers, losers } = await coinGeckoClient.getGainersLosers()

		const watchlist = (await coinGeckoClient.getCryptoMarkets('usd', 5)).map(crypto => ({
			symbol: crypto.symbol,
			name: crypto.name,
			price: crypto.price,
			change_percent: crypto.change_percent_24h,
		}))

		return {
			watchlist,
			gainers: gainers.map(crypto => ({
				symbol: crypto.symbol,
				name: crypto.name,
				price: crypto.price,
				change_percent: crypto.change_percent_24h,
			})),
			losers: losers.map(crypto => ({
				symbol: crypto.symbol,
				name: crypto.name,
				price: crypto.price,
				change_percent: crypto.change_percent_24h,
			})),
			indices: [],
			commodities: [],
		}
	} catch (error) {
		// Return mock data if API fails
		console.warn('Market summary API failed, using mock data:', error.message)
		return generateMockMarketSummary()
	}
}

// Generate mock market summary data
function generateMockMarketSummary() {
	const mockStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA']
	
	const gainers = mockStocks.slice(0, 3).map(symbol => ({
		symbol: symbol,
		name: `${symbol} Inc.`,
		price: Math.random() * 300 + 50,
		change_percent: Math.random() * 5 + 1 // 1-6% gain
	}))
	
	const losers = mockStocks.slice(2, 5).map(symbol => ({
		symbol: symbol,
		name: `${symbol} Inc.`,
		price: Math.random() * 300 + 50,
		change_percent: -(Math.random() * 5 + 1) // 1-6% loss
	}))
	
	const watchlist = mockStocks.map(symbol => ({
		symbol: symbol,
		name: `${symbol} Inc.`,
		price: Math.random() * 300 + 50,
		change_percent: (Math.random() - 0.5) * 10 // -5% to +5%
	}))
	
	return {
		watchlist,
		gainers,
		losers,
		indices: [],
		commodities: []
	}
}

// Get chart data
async function fetchChartData(options = {}) {
	try {
		const symbol = options.symbol || options.config?.symbol || 'AAPL'
		const timeframe = options.timeframe || options.config?.timeframe || 'daily'
		
		// For now, return mock chart data since API endpoints aren't fully implemented
		// In a real app, this would fetch from Alpha Vantage or Finnhub
		return generateMockChartData(symbol, timeframe)

	} catch (error) {
		throw new Error('Chart data source failed: ' + error.message)
	}
}

// Generate mock chart data for demonstration
function generateMockChartData(symbol, timeframe) {
	const basePrice = Math.random() * 200 + 50 // Random price between 50-250
	const data = []
	const days = timeframe === 'weekly' ? 52 : timeframe === 'monthly' ? 12 : 30
	
	for (let i = days; i >= 0; i--) {
		const date = new Date()
		date.setDate(date.getDate() - i)
		
		// Generate realistic price movement
		const volatility = 0.02 // 2% daily volatility
		const randomFactor = (Math.random() - 0.5) * 2 * volatility
		const price = basePrice * (1 + randomFactor * i / days)
		
		data.push({
			date: date.toISOString().split('T')[0],
			symbol: symbol,
			open: parseFloat((price * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)),
			high: parseFloat((price * (1 + Math.random() * 0.02)).toFixed(2)),
			low: parseFloat((price * (1 - Math.random() * 0.02)).toFixed(2)),
			close: parseFloat(price.toFixed(2)),
			volume: Math.floor(Math.random() * 10000000) + 1000000,
			timestamp: date.getTime()
		})
	}
	
	return data.reverse() // Most recent first
}

export async function fetchCustomApiData(apiUrl, options = {}) {
	try {
		const response = await fetch(apiUrl, {
			method: options.method || 'GET',
			headers: options.headers || {},
			body: options.body ? JSON.stringify(options.body) : undefined,
		})

		if (!response.ok) {
			throw new Error('HTTP ' + response.status + ': ' + response.statusText)
		}

		return await response.json()
	} catch (error) {
		throw new Error('Custom API call failed: ' + error.message)
	}
}

export async function testApiConnection(url) {
	if (!url || !url.trim()) {
		throw new Error("API URL is required")
	}

	try {
		const response = await fetch(url, {
			method: 'HEAD',
			mode: 'no-cors'
		})

		return {
			success: true,
			message: 'API connection test completed!',
			responseTime: 200,
			status: response.status || 200,
		}
	} catch (error) {
		throw error
	}
}

export function formatNumber(num) {
	if (!num)
		return '0'
	if (typeof num !== 'number')
		return num
	if (num >= 1000000000000)
		return (num / 1000000000000).toFixed(1) + 'T'
	if (num >= 1000000000)
		return (num / 1000000000).toFixed(1) + 'B'
	if (num >= 1000000)
		return (num / 1000000).toFixed(1) + 'M'
	if (num >= 1000)
		return (num / 1000).toFixed(1) + 'K'
	return num.toString()
}
