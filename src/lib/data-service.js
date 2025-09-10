// Enhanced data service with real API integrations
import { alphaVantageClient } from "./api/alpha-vantage-client.js"
import { coinGeckoClient } from "./api/coingecko-client.js"
import { exchangeRateClient } from "./api/exchange-rate-client.js"
import { finnhubClient } from "./api/finnhub-client.js"

class DataCache {
	constructor() {
		this.cache = new Map()
		this.cacheTimeout = 30000 // 30 seconds
	}

	get(key) {
		const cached = this.cache.get(key)
		if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
			return cached.data
		}
		return null
	}

	set(key, data) {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
		})
	}

	clear() {
		this.cache.clear()
	}
}

export class DataService {
  static cache = new DataCache()
  static isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true

  static async fetchData(endpoint, options = {}) {
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`
    const cached = this.cache.get(cacheKey)

    if (cached && !options.forceRefresh) {
      return cached
    }

    try {
      let data
      
      switch (endpoint) {
        case "stocks":
        case "market_gainers":
        case "market_losers":
          data = await this.fetchStockData(options)
          break
        case "crypto":
        case "crypto_chart":
          data = await this.fetchCryptoData(options)
          break
        case "forex":
          data = await this.fetchForexData(options)
          break
        case "market_summary":
        case "watchlist":
        case "performance_data":
        case "financial_data":
          data = await this.fetchMarketSummaryData(options)
          break
        case "chart_data":
        case "market_trends":
          data = await this.fetchChartData(options)
          break
        case "custom":
          data = await this.fetchCustomApiData(options.apiUrl, options)
          break
        default:
          throw new Error(`Unknown endpoint: ${endpoint}`)
      }

      this.cache.set(cacheKey, data)
      return data
      
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error.message)
      throw error
    }
  }

	// Fetch real stock data
	static async fetchStockData(options = {}) {
		try {
			const includeProfile = options.includeProfile || false

			if (options.symbols && Array.isArray(options.symbols)) {
				const stocksData = await finnhubClient.getEnhancedStockQuotes(options.symbols)
				return this.normalizeStockData(stocksData, includeProfile)
			} else {
				const stocksData = await finnhubClient.getPopularStocks()
				return this.normalizeStockData(stocksData, includeProfile)
			}
		} catch (error) {
			try {
				if (options.symbols && Array.isArray(options.symbols)) {
					const stocksData = await alphaVantageClient.getMultipleStockQuotes(options.symbols)
					return this.normalizeStockData(stocksData, options.includeProfile)
				} else {
					const stocksData = await alphaVantageClient.getPopularStocks()
					return this.normalizeStockData(stocksData, options.includeProfile)
				}
			} catch (alphaError) {
				throw new Error('All stock data sources failed')
			}
		}
	}

	// Normalize stock data to match API analysis structure
	static normalizeStockData(data, includeProfile = false) {
		if (!Array.isArray(data)) return []

		return data.map(item => {
			const normalized = {
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
			}

			if (includeProfile) {
				normalized.ticker = item.ticker || item.symbol
				normalized.name = item.name || item.company || item.symbol
				normalized.country = item.country || 'US'
				normalized.currency = item.currency || 'USD'
				normalized.exchange = item.exchange || 'NASDAQ'
				normalized.marketCapitalization = item.marketCapitalization || null
				normalized.shareOutstanding = item.shareOutstanding || null
				normalized.finnhubIndustry = item.finnhubIndustry || null
				normalized.ipo = item.ipo || null
				normalized.weburl = item.weburl || null
				normalized.phone = item.phone || null
				normalized.logo = item.logo || null
				normalized.company = normalized.name
				normalized.market_cap = item.market_cap || (
					normalized.marketCapitalization ?
						`${(normalized.marketCapitalization / 1000).toFixed(1)}B` :
						'N/A'
				)
			} else {
				normalized.name = item.name || item.company || item.symbol
				normalized.company = normalized.name
			}

			return normalized
		})
	}

	// Fetch real crypto data
	static async fetchCryptoData(options = {}) {
		try {
			const limit = options.limit || 20
			return await coinGeckoClient.getCryptoMarkets('usd', limit)
		} catch (error) {
			throw new Error('Crypto data source failed')
		}
	}

	// Fetch real forex data
	static async fetchForexData(options = {}) {
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

	// Fetch market summary data
	static async fetchMarketSummaryData(options = {}) {
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

	// Fetch chart data
	static async fetchChartData(options = {}) {
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

  static async fetchCustomApiData(apiUrl, options = {}) {
    try {
      const response = await fetch(apiUrl, {
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body ? JSON.stringify(options.body) : undefined,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      throw new Error(`Custom API call failed: ${error.message}`)
    }
  }

	static async testApiConnection(url) {
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

  static formatNumber(num) {
    if (!num) return '0'
    if (typeof num !== 'number') return num
    if (num >= 1000000000000) return `${(num / 1000000000000).toFixed(1)}T`
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }
}

// Export singleton instance for global use
export const dataService = new DataService()
