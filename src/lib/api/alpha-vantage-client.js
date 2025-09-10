import { API_CONFIG } from '../config/api-config.js'

const BASE_URL = API_CONFIG.ALPHA_VANTAGE.BASE_URL
const API_KEY = API_CONFIG.ALPHA_VANTAGE.API_KEY

// Simple fetch function for Alpha Vantage API
async function fetchData(url) {
	try {
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error(`API Error: ${response.status}`)
		}
		const data = await response.json()
		
		// Check for Alpha Vantage specific errors
		if (data['Error Message']) {
			throw new Error(data['Error Message'])
		}
		if (data['Note']) {
			throw new Error('API rate limit exceeded. Please try again later.')
		}
		if (data['Information'] && data['Information'].includes('call frequency')) {
			throw new Error('API rate limit exceeded. Please try again later.')
		}
		
		return data
	} catch (error) {
		console.error('Fetch error:', error)
		throw error
	}
}

// Get stock quote
export async function getStockQuote(symbol) {
	const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol.toUpperCase()}&apikey=${API_KEY}`
	const data = await fetchData(url)

	if (data['Global Quote']) {
		const quote = data['Global Quote']
		return {
			symbol: quote['01. symbol'],
			company: quote['01. symbol'], // Alpha Vantage doesn't provide company name in quote
			price: parseFloat(quote['05. price']),
			change: parseFloat(quote['09. change']),
			change_percent: parseFloat(quote['10. change percent'].replace('%', '')),
			volume: parseInt(quote['06. volume']),
			high: parseFloat(quote['03. high']),
			low: parseFloat(quote['04. low']),
			open: parseFloat(quote['02. open']),
			previous_close: parseFloat(quote['08. previous close']),
			last_updated: quote['07. latest trading day']
		}
	}

	throw new Error(`No quote data found for symbol: ${symbol}`)
}

// Get multiple stock quotes (simplified)
export async function getMultipleStockQuotes(symbols) {
	const quotes = []

	// Process symbols one by one with delays (Alpha Vantage has strict rate limits)
	for (const symbol of symbols) {
		try {
			const quote = await getStockQuote(symbol)
			quotes.push(quote)

			// Add delay between requests (5 requests per minute limit)
			if (symbols.indexOf(symbol) < symbols.length - 1) {
				await new Promise(resolve => setTimeout(resolve, 12000)) // 12 seconds delay
			}
		} catch (error) {
			console.error(`Error getting quote for ${symbol}:`, error)
		}
	}

	return quotes
}

// Get daily data for charts
export async function getDailyData(symbol, outputsize = 'compact') {
	const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol.toUpperCase()}&outputsize=${outputsize}&apikey=${API_KEY}`
	const data = await fetchData(url)

	if (data['Time Series (Daily)']) {
		const timeSeries = data['Time Series (Daily)']
		return Object.keys(timeSeries).map(date => ({
			date,
			open: parseFloat(timeSeries[date]['1. open']),
			high: parseFloat(timeSeries[date]['2. high']),
			low: parseFloat(timeSeries[date]['3. low']),
			close: parseFloat(timeSeries[date]['4. close']),
			volume: parseInt(timeSeries[date]['5. volume'])
		})).reverse() // Get chronological order
	}

	throw new Error(`No daily data found for symbol: ${symbol}`)
}

// Get popular stocks
export async function getPopularStocks() {
	const popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']
	return getMultipleStockQuotes(popularSymbols)
}

// For backward compatibility - create a simple object with all functions
export const alphaVantageClient = {
	getStockQuote,
	getMultipleStockQuotes,
	getDailyData,
	getPopularStocks
}
