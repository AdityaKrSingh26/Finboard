import { BaseAPIClient } from './base-client.js'
import { API_CONFIG, CACHE_CONFIG } from '../config/api-config.js'

export class FinnhubClient extends BaseAPIClient {
	constructor() {
		super(API_CONFIG.FINNHUB)
	}

	// Check if response contains API error
	isErrorResponse(data) {
		return data.error || (typeof data === 'string' && data.includes('API limit reached'))
	}

	// Extract error message from API response
	extractErrorMessage(data) {
		if (data.error) return data.error
		if (typeof data === 'string' && data.includes('API limit reached')) {
			return 'Finnhub API limit reached. Please try again later.'
		}
		return 'Unknown Finnhub API error'
	}

	// Get real-time stock quote
	async getStockQuote(symbol) {
		const url = `${this.config.BASE_URL}${this.config.ENDPOINTS.QUOTE}`
		const params = {
			symbol: symbol.toUpperCase(),
			token: this.config.API_KEY
		}

		const data = await this.makeRequest(
			url,
			{ params },
			true,
			CACHE_CONFIG.SHORT_TTL
		)

		if (data.c !== undefined) {
			return {
				symbol: symbol.toUpperCase(),
				price: data.c, // Current price
				change: data.d, // Change
				change_percent: data.dp, // Percent change
				high: data.h, // High price of the day
				low: data.l, // Low price of the day
				open: data.o, // Open price of the day
				previous_close: data.pc, // Previous close price
				timestamp: data.t, // Timestamp
				last_updated: new Date(data.t * 1000).toISOString(),
			}
		}

		throw new Error(`No quote data found for symbol: ${symbol}`)
	}

	// Get company profile
	async getCompanyProfile(symbol) {
		const url = `${this.config.BASE_URL}${this.config.ENDPOINTS.COMPANY_PROFILE}`
		const params = {
			symbol: symbol.toUpperCase(),
			token: this.config.API_KEY
		}

		const data = await this.makeRequest(
			url,
			{ params },
			true,
			CACHE_CONFIG.LONG_TTL
		)

		if (data.name) {
			return {
				symbol: symbol.toUpperCase(),
				name: data.name,
				country: data.country,
				currency: data.currency,
				exchange: data.exchange,
				ipo: data.ipo,
				market_capitalization: data.marketCapitalization,
				phone: data.phone,
				share_outstanding: data.shareOutstanding,
				ticker: data.ticker,
				weburl: data.weburl,
				logo: data.logo,
				finnhub_industry: data.finnhubIndustry,
			}
		}

		return null
	}

	// Get multiple stock quotes with company profiles
	async getEnhancedStockQuotes(symbols) {
		const enhancedQuotes = []

		for (const symbol of symbols) {
			try {
				// Get both quote and profile data
				const [quote, profile] = await Promise.all([
					this.getStockQuote(symbol),
					this.getCompanyProfile(symbol)
				])

				enhancedQuotes.push({
					// API response structure fields
					symbol: symbol.toUpperCase(),
					c: quote.price, // Current price
					d: quote.change, // Change
					dp: quote.change_percent, // Change percent
					h: quote.high, // High
					l: quote.low, // Low
					o: quote.open, // Open
					pc: quote.previous_close, // Previous close
					t: quote.timestamp, // Timestamp

					// Profile data with API field names
					ticker: symbol.toUpperCase(),
					name: profile?.name || symbol,
					country: profile?.country || 'US',
					currency: profile?.currency || 'USD',
					exchange: profile?.exchange || 'NASDAQ',
					marketCapitalization: profile?.market_capitalization || null,
					shareOutstanding: profile?.share_outstanding || null,
					finnhubIndustry: profile?.finnhub_industry || null,

					// Legacy fields for backward compatibility
					company: profile?.name || symbol,
					price: quote.price,
					change: quote.change,
					change_percent: quote.change_percent,
					market_cap: profile?.market_capitalization ? `${(profile.market_capitalization / 1000).toFixed(1)}B` : 'N/A',

					last_updated: new Date().toISOString(),
				})

				// Add delay to respect rate limits (60 requests/minute)
				if (symbols.indexOf(symbol) < symbols.length - 1) {
					await new Promise(resolve => setTimeout(resolve, 1000))
				}
			} catch (error) {
				console.error(`Failed to get enhanced quote for ${symbol}:`, error.message)
				// Continue with other symbols
			}
		}

		return enhancedQuotes
	}

	// Get historical candle data
	async getCandleData(symbol, resolution = 'D', from, to) {
		// Default to last 30 days if no dates provided
		if (!from || !to) {
			to = Math.floor(Date.now() / 1000)
			from = to - (30 * 24 * 60 * 60) // 30 days ago
		}

		const url = `${this.config.BASE_URL}${this.config.ENDPOINTS.CANDLES}`
		const params = {
			symbol: symbol.toUpperCase(),
			resolution,
			from: from.toString(),
			to: to.toString(),
			token: this.config.API_KEY
		}

		const data = await this.makeRequest(
			url,
			{ params },
			true,
			CACHE_CONFIG.MEDIUM_TTL
		)

		if (data.s === 'ok' && data.c && data.c.length > 0) {
			const candles = []
			for (let i = 0; i < data.c.length; i++) {
				candles.push({
					timestamp: data.t[i],
					date: new Date(data.t[i] * 1000).toISOString().split('T')[0],
					open: data.o[i],
					high: data.h[i],
					low: data.l[i],
					close: data.c[i],
					volume: data.v[i],
				})
			}
			return candles
		}

		return []
	}

	// Get market status
	async getMarketStatus(exchange = 'US') {
		const url = `${this.config.BASE_URL}${this.config.ENDPOINTS.MARKET_STATUS}`
		const params = {
			exchange,
			token: this.config.API_KEY
		}

		const data = await this.makeRequest(
			url,
			{ params },
			true,
			CACHE_CONFIG.SHORT_TTL
		)

		return {
			exchange,
			is_open: data.isOpen || false,
			session: data.session || 'unknown',
			timezone: data.timezone || 'US/Eastern',
			local_time: data.t ? new Date(data.t * 1000).toISOString() : new Date().toISOString(),
		}
	}

	// Get stock news
	async getStockNews(symbol, from, to) {
		// Default to last 7 days if no dates provided
		if (!from || !to) {
			to = new Date().toISOString().split('T')[0]
			const fromDate = new Date()
			fromDate.setDate(fromDate.getDate() - 7)
			from = fromDate.toISOString().split('T')[0]
		}

		const url = `${this.config.BASE_URL}${this.config.ENDPOINTS.NEWS}`
		const params = {
			symbol: symbol.toUpperCase(),
			from,
			to,
			token: this.config.API_KEY
		}

		const data = await this.makeRequest(
			url,
			{ params },
			true,
			CACHE_CONFIG.MEDIUM_TTL
		)

		if (Array.isArray(data)) {
			return data.slice(0, 10).map(article => ({
				id: article.id,
				headline: article.headline,
				summary: article.summary,
				url: article.url,
				image: article.image,
				source: article.source,
				category: article.category,
				datetime: new Date(article.datetime * 1000).toISOString(),
				related: article.related || symbol.toUpperCase(),
			}))
		}

		return []
	}

	// Get basic company information
	async getBasicFinancials(symbol, metric = 'all') {
		const url = `${this.config.BASE_URL}${this.config.ENDPOINTS.BASIC_FINANCIALS}`
		const params = {
			symbol: symbol.toUpperCase(),
			metric,
			token: this.config.API_KEY
		}

		const data = await this.makeRequest(
			url,
			{ params },
			true,
			CACHE_CONFIG.LONG_TTL
		)

		if (data.metric) {
			return {
				symbol: symbol.toUpperCase(),
				pe_ratio: data.metric.peBasicExclExtraTTM,
				market_cap: data.metric.marketCapitalization,
				enterprise_value: data.metric.enterpriseValue,
				revenue_ttm: data.metric.revenueTTM,
				net_income_ttm: data.metric.netIncomeTTM,
				debt_to_equity: data.metric.totalDebt / data.metric.totalEquity,
				current_ratio: data.metric.currentRatio,
				return_on_equity: data.metric.roeTTM,
				return_on_assets: data.metric.roaTTM,
				profit_margin: data.metric.netProfitMarginTTM,
				dividend_yield: data.metric.dividendYieldIndicatedAnnual,
				beta: data.metric.beta,
				fifty_two_week_high: data.metric['52WeekHigh'],
				fifty_two_week_low: data.metric['52WeekLow'],
			}
		}

		return {}
	}

	// Get index constituents (for major indices)
	async getIndexConstituents(symbol) {
		const url = `${this.config.BASE_URL}/index/constituents`
		const params = {
			symbol: symbol.toUpperCase(),
			token: this.config.API_KEY
		}

		const data = await this.makeRequest(
			url,
			{ params },
			true,
			CACHE_CONFIG.LONG_TTL
		)

		if (data.constituents && Array.isArray(data.constituents)) {
			return data.constituents.map(stock => ({
				symbol: stock.symbol,
				name: stock.displaySymbol,
				weight: stock.weight,
			}))
		}

		return []
	}

	// Utility methods for popular data sets
	async getPopularStocks() {
		const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX']
		return this.getEnhancedStockQuotes(symbols)
	}

	async getTechStocks() {
		const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NFLX', 'NVDA', 'ADBE', 'CRM', 'ORCL']
		return this.getEnhancedStockQuotes(symbols)
	}

	async getDowJones() {
		const symbols = ['AAPL', 'MSFT', 'UNH', 'GS', 'HD', 'CAT', 'AMGN', 'CRM', 'V', 'BA']
		return this.getEnhancedStockQuotes(symbols)
	}

	async getSP500Top() {
		const symbols = ['AAPL', 'MSFT', 'AMZN', 'NVDA', 'GOOGL', 'TSLA', 'META', 'BRK.B', 'UNH', 'JNJ']
		return this.getEnhancedStockQuotes(symbols)
	}

	async getCryptocurrencyStocks() {
		const symbols = ['COIN', 'MSTR', 'RIOT', 'MARA', 'CLSK', 'HUT', 'BITF', 'CAN']
		return this.getEnhancedStockQuotes(symbols)
	}

	// Get API health status
	async getAPIHealthStatus() {
		try {
			const testSymbol = 'AAPL'
			const quote = await this.getStockQuote(testSymbol)

			return {
				service: 'Finnhub',
				status: 'healthy',
				response_time: Date.now(),
				last_updated: new Date().toISOString(),
				sample_data: quote,
				rate_limit_remaining: this.rateLimiter?.remaining || 'Unknown',
			}
		} catch (error) {
			return {
				service: 'Finnhub',
				status: 'error',
				error: error.message,
				last_updated: new Date().toISOString(),
				rate_limit_remaining: this.rateLimiter?.remaining || 'Unknown',
			}
		}
	}
}

// Create and export a singleton instance
export const finnhubClient = new FinnhubClient()
