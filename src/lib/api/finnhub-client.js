import { API_CONFIG } from '../config/api-config.js'

const BASE_URL = API_CONFIG.FINNHUB.BASE_URL
const API_KEY = API_CONFIG.FINNHUB.API_KEY

// Simple fetch function
async function fetchData(url) {
	try {
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error(`API Error: ${response.status}`)
		}
		const data = await response.json()
		return data
	} catch (error) {
		console.error('Fetch error:', error)
		throw error
	}
}

// Get stock quote
export async function getStockQuote(symbol) {
	const url = `${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`
	const data = await fetchData(url)
	
	return {
		symbol: symbol,
		price: data.c,
		change: data.d,
		change_percent: data.dp,
		high: data.h,
		low: data.l,
		open: data.o,
		previous_close: data.pc
	}
}

// Get company info
export async function getCompanyProfile(symbol) {
	const url = `${BASE_URL}/stock/profile2?symbol=${symbol}&token=${API_KEY}`
	const data = await fetchData(url)
	
	if (data.name) {
		return {
			symbol: symbol,
			name: data.name,
			country: data.country,
			currency: data.currency,
			exchange: data.exchange,
			logo: data.logo
		}
	}
	return null
}

// Get multiple stock quotes
export async function getEnhancedStockQuotes(symbols) {
	const results = []

	for (const symbol of symbols) {
		try {
			const quote = await getStockQuote(symbol)
			const profile = await getCompanyProfile(symbol)

			results.push({
				symbol: symbol,
				name: profile?.name || symbol,
				price: quote.price,
				change: quote.change,
				change_percent: quote.change_percent,
				market_cap: 'N/A',
				company: profile?.name || symbol,
				// Keep the original API field names for compatibility
				c: quote.price,
				d: quote.change,
				dp: quote.change_percent,
				h: quote.high,
				l: quote.low,
				o: quote.open,
				pc: quote.previous_close
			})

			// Simple delay to avoid hitting rate limits
			await new Promise(resolve => setTimeout(resolve, 1000))
		} catch (error) {
			console.error(`Error getting data for ${symbol}:`, error)
		}
	}

	return results
}

// Get chart data
export async function getCandleData(symbol, resolution = 'D') {
	// Get last 30 days
	const to = Math.floor(Date.now() / 1000)
	const from = to - (30 * 24 * 60 * 60)

	const url = `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`
	const data = await fetchData(url)

	if (data.s === 'ok' && data.c) {
		const candles = []
		for (let i = 0; i < data.c.length; i++) {
			candles.push({
				date: new Date(data.t[i] * 1000).toISOString().split('T')[0],
				open: data.o[i],
				high: data.h[i],
				low: data.l[i],
				close: data.c[i],
				volume: data.v[i]
			})
		}
		return candles
	}
	return []
}

// Get some popular stocks
export async function getPopularStocks() {
	const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX']
	return getEnhancedStockQuotes(symbols)
}

export async function getTechStocks() {
	const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NFLX', 'NVDA', 'ADBE']
	return getEnhancedStockQuotes(symbols)
}

export const finnhubClient = {
	getStockQuote,
	getCompanyProfile,
	getEnhancedStockQuotes,
	getCandleData,
	getPopularStocks,
	getTechStocks
}
