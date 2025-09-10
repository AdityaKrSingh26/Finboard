import { BaseAPIClient } from './base-client.js'
import { API_CONFIG, CACHE_CONFIG } from '../config/api-config.js'

export class AlphaVantageClient extends BaseAPIClient {
	constructor() {
		super(API_CONFIG.ALPHA_VANTAGE)
	}

	// Check if response contains API error
	isErrorResponse(data) {
		return data['Error Message'] ||
			data['Note'] ||
			(data['Information'] && data['Information'].includes('call frequency'))
	}

	// Extract error message from API response
	extractErrorMessage(data) {
		if (data['Error Message']) return data['Error Message']
		if (data['Note']) return 'API rate limit exceeded. Please try again later.'
		if (data['Information']) return data['Information']
		return 'Unknown Alpha Vantage API error'
	}

	// Get real-time stock quote
	async getStockQuote(symbol) {
		const params = {
			function: this.config.ENDPOINTS.QUOTE,
			symbol: symbol.toUpperCase(),
			apikey: this.config.API_KEY,
		}

		const data = await this.makeRequest(this.config.BASE_URL, { params }, true, CACHE_CONFIG.SHORT_TTL)

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
				last_updated: quote['07. latest trading day'],
			}
		}

		throw new Error(`No quote data found for symbol: ${symbol}`)
	}

	// Get multiple stock quotes
	async getMultipleStockQuotes(symbols) {
		const quotes = []

		// Process symbols in batches to respect rate limits
		for (const symbol of symbols) {
			try {
				const quote = await this.getStockQuote(symbol)
				quotes.push(quote)

				// Add delay between requests to respect rate limits (5 requests/minute)
				if (symbols.indexOf(symbol) < symbols.length - 1) {
					await new Promise(resolve => setTimeout(resolve, 12000)) // 12 seconds between requests
				}
			} catch (error) {
				console.error(`Failed to get quote for ${symbol}:`, error.message)
				// Continue with other symbols even if one fails
			}
		}

		return quotes
	}

	// Get intraday data for charts
	async getIntradayData(symbol, interval = '5min') {
		const params = {
			function: this.config.ENDPOINTS.INTRADAY,
			symbol: symbol.toUpperCase(),
			interval,
			apikey: this.config.API_KEY,
			outputsize: 'compact', // last 100 data points
		}

		const data = await this.makeRequest(this.config.BASE_URL, { params }, true, CACHE_CONFIG.DEFAULT_TTL)

		const timeSeriesKey = `Time Series (${interval})`
		if (data[timeSeriesKey]) {
			const timeSeries = data[timeSeriesKey]
			return Object.keys(timeSeries).map(timestamp => ({
				date: timestamp,
				open: parseFloat(timeSeries[timestamp]['1. open']),
				high: parseFloat(timeSeries[timestamp]['2. high']),
				low: parseFloat(timeSeries[timestamp]['3. low']),
				close: parseFloat(timeSeries[timestamp]['4. close']),
				volume: parseInt(timeSeries[timestamp]['5. volume']),
			})).reverse() // Reverse to get chronological order
		}

		throw new Error(`No intraday data found for symbol: ${symbol}`)
	}

	// Get daily data for charts
	async getDailyData(symbol, outputsize = 'compact') {
		const params = {
			function: this.config.ENDPOINTS.DAILY,
			symbol: symbol.toUpperCase(),
			apikey: this.config.API_KEY,
			outputsize, // compact = last 100 days, full = 20+ years
		}

		const data = await this.makeRequest(this.config.BASE_URL, { params }, true, CACHE_CONFIG.LONG_TTL)

		if (data['Time Series (Daily)']) {
			const timeSeries = data['Time Series (Daily)']
			return Object.keys(timeSeries).map(date => ({
				date,
				open: parseFloat(timeSeries[date]['1. open']),
				high: parseFloat(timeSeries[date]['2. high']),
				low: parseFloat(timeSeries[date]['3. low']),
				close: parseFloat(timeSeries[date]['4. close']),
				volume: parseInt(timeSeries[date]['5. volume']),
			})).reverse() // Reverse to get chronological order
		}

		throw new Error(`No daily data found for symbol: ${symbol}`)
	}

	// Get forex exchange rate
	async getForexRate(fromCurrency, toCurrency) {
		const params = {
			function: this.config.ENDPOINTS.FOREX,
			from_symbol: fromCurrency.toUpperCase(),
			to_symbol: toCurrency.toUpperCase(),
			apikey: this.config.API_KEY,
		}

		const data = await this.makeRequest(this.config.BASE_URL, { params }, true, CACHE_CONFIG.SHORT_TTL)

		if (data['Realtime Currency Exchange Rate']) {
			const rate = data['Realtime Currency Exchange Rate']
			return {
				pair: `${fromCurrency}/${toCurrency}`,
				rate: parseFloat(rate['5. Exchange Rate']),
				from_currency: rate['1. From_Currency Code'],
				to_currency: rate['3. To_Currency Code'],
				last_updated: rate['6. Last Refreshed'],
				timezone: rate['7. Time Zone'],
				bid: parseFloat(rate['8. Bid Price']),
				ask: parseFloat(rate['9. Ask Price']),
			}
		}

		throw new Error(`No forex data found for pair: ${fromCurrency}/${toCurrency}`)
	}

	// Search for symbols
	async searchSymbol(keywords) {
		const params = {
			function: this.config.ENDPOINTS.SEARCH,
			keywords,
			apikey: this.config.API_KEY,
		}

		const data = await this.makeRequest(this.config.BASE_URL, { params }, true, CACHE_CONFIG.LONG_TTL)

		if (data['bestMatches']) {
			return data['bestMatches'].map(match => ({
				symbol: match['1. symbol'],
				name: match['2. name'],
				type: match['3. type'],
				region: match['4. region'],
				market_open: match['5. marketOpen'],
				market_close: match['6. marketClose'],
				timezone: match['7. timezone'],
				currency: match['8. currency'],
				match_score: parseFloat(match['9. matchScore']),
			}))
		}

		return []
	}

	// Get popular stocks (using predefined list since Alpha Vantage doesn't have this endpoint)
	async getPopularStocks() {
		const popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX']
		return this.getMultipleStockQuotes(popularSymbols)
	}
}

// Export singleton instance
export const alphaVantageClient = new AlphaVantageClient()
