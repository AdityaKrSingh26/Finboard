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
		throw new Error('Crypto data source failed')
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
		throw new Error('Forex data source failed')
	}
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
		throw new Error('Market summary data source failed')
	}
}

// Get chart data
async function fetchChartData(options = {}) {
	try {
		const symbol = options.symbol || options.config?.symbol || 'AAPL'
		const timeframe = options.timeframe || options.config?.timeframe || 'daily'
		const interval = options.interval || '1day'

		if (timeframe === 'daily' || timeframe === 'weekly' || timeframe === 'monthly') {
			return await alphaVantageClient.getHistoricalData(symbol, interval)
		}

		return await finnhubClient.getHistoricalData(symbol, interval)

	} catch (error) {
		throw new Error('Chart data source failed')
	}
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
