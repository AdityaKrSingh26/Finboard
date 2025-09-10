import { BaseAPIClient } from './base-client.js'
import { API_CONFIG, CACHE_CONFIG } from '../config/api-config.js'

export class CoinGeckoClient extends BaseAPIClient {
	constructor() {
		super(API_CONFIG.COINGECKO)
	}

	// Check if response contains API error
	isErrorResponse(data) {
		return data.error || (data.status && data.status.error_code)
	}

	// Extract error message from API response
	extractErrorMessage(data) {
		if (data.error) return data.error
		if (data.status?.error_message) return data.status.error_message
		return 'Unknown CoinGecko API error'
	}

	// Get headers (CoinGecko Pro API uses query params, not headers)
	getHeaders() {
		return {}; // No headers needed for CoinGecko
	}

	// Get auth query parameters for CoinGecko API
	getAuthParams() {
		const params = {};
		if (this.config.API_KEY && this.config.API_KEY !== '') {
			if (!this.config.API_KEY.startsWith('CG-')) {
				params.x_cg_demo_api_key = this.config.API_KEY;
			}
		}
		return params;
	}

	// Enhanced makeRequest with Pro API fallback
	async makeRequest(url, options = {}, useCache = true, cacheTTL = undefined) {
		try {
			// Add proper authentication headers for Pro API
			if (this.config.API_KEY && this.config.API_KEY.startsWith('CG-') && url.includes('pro-api.coingecko.com')) {
				options.headers = {
					...options.headers,
					'x-cg-pro-api-key': this.config.API_KEY
				};
				if (options.params && options.params.x_cg_pro_api_key) {
					delete options.params.x_cg_pro_api_key;
				}
			}

			return await super.makeRequest(url, options, useCache, cacheTTL);
		} catch (error) {
			// If using Pro API and it fails, try falling back to public API
			if (this.config.API_KEY && this.config.API_KEY.startsWith('CG-') && url.includes('pro-api.coingecko.com')) {
				const fallbackUrl = url.replace('https://pro-api.coingecko.com/api/v3', 'https://api.coingecko.com/api/v3');
				const fallbackOptions = { ...options };
				if (fallbackOptions.params) {
					const { x_cg_pro_api_key, x_cg_demo_api_key, ...cleanParams } = fallbackOptions.params;
					fallbackOptions.params = cleanParams;
				}
				if (fallbackOptions.headers) {
					const { 'x-cg-pro-api-key': removed, ...cleanHeaders } = fallbackOptions.headers;
					fallbackOptions.headers = cleanHeaders;
				}
				return await super.makeRequest(fallbackUrl, fallbackOptions, useCache, cacheTTL);
			}
			throw error;
		}
	}

	// Get cryptocurrency market data
	async getCryptoMarkets(vsCurrency = 'usd', limit = 50) {
		const params = {
			vs_currency: vsCurrency,
			order: 'market_cap_desc',
			per_page: limit,
			page: 1,
			sparkline: false,
			price_change_percentage: '24h,7d',
			...this.getAuthParams() // Add auth params to query
		}

		const data = await this.makeRequest(
			`${this.config.BASE_URL}${this.config.ENDPOINTS.COINS_MARKETS}`,
			{
				params,
				headers: this.getHeaders()
			},
			true,
			CACHE_CONFIG.SHORT_TTL
		)

		return data.map(coin => ({
			id: coin.id,
			name: coin.name,
			symbol: coin.symbol.toUpperCase(),
			price: coin.current_price,
			market_cap: coin.market_cap,
			market_cap_rank: coin.market_cap_rank,
			volume_24h: coin.total_volume,
			change_24h: coin.price_change_24h,
			change_percent_24h: coin.price_change_percentage_24h,
			change_7d: coin.price_change_percentage_7d_in_currency,
			circulating_supply: coin.circulating_supply,
			max_supply: coin.max_supply,
			ath: coin.ath,
			atl: coin.atl,
			image: coin.image,
			last_updated: coin.last_updated,
		}))
	}

	// Get specific cryptocurrency data
	async getCryptoData(coinId) {
		const data = await this.makeRequest(
			`${this.config.BASE_URL}${this.config.ENDPOINTS.COIN_DATA}/${coinId}`,
			{
				params: {
					localization: false,
					tickers: false,
					market_data: true,
					community_data: false,
					developer_data: false,
					sparkline: false,
					...this.getAuthParams() // Add auth params to query
				},
				headers: this.getHeaders()
			},
			true,
			CACHE_CONFIG.DEFAULT_TTL
		)

		const marketData = data.market_data
		return {
			id: data.id,
			name: data.name,
			symbol: data.symbol.toUpperCase(),
			description: data.description?.en?.substring(0, 200) + '...',
			image: data.image?.large,
			price: marketData.current_price?.usd,
			market_cap: marketData.market_cap?.usd,
			market_cap_rank: data.market_cap_rank,
			volume_24h: marketData.total_volume?.usd,
			change_24h: marketData.price_change_24h,
			change_percent_24h: marketData.price_change_percentage_24h,
			change_7d: marketData.price_change_percentage_7d,
			change_30d: marketData.price_change_percentage_30d,
			circulating_supply: marketData.circulating_supply,
			max_supply: marketData.max_supply,
			ath: marketData.ath?.usd,
			atl: marketData.atl?.usd,
			ath_date: marketData.ath_date?.usd,
			atl_date: marketData.atl_date?.usd,
			last_updated: marketData.last_updated,
		}
	}

	// Get simple price data for multiple coins
	async getSimplePrices(coinIds, vsCurrencies = ['usd'], includeChange = true) {
		const params = {
			ids: Array.isArray(coinIds) ? coinIds.join(',') : coinIds,
			vs_currencies: Array.isArray(vsCurrencies) ? vsCurrencies.join(',') : vsCurrencies,
			include_24hr_change: includeChange,
			include_24hr_vol: includeChange,
			include_last_updated_at: true,
			...this.getAuthParams() // Add auth params to query
		}

		const data = await this.makeRequest(
			`${this.config.BASE_URL}${this.config.ENDPOINTS.PRICE}`,
			{
				params,
				headers: this.getHeaders()
			},
			true,
			CACHE_CONFIG.SHORT_TTL
		)

		// Transform data to consistent format
		const result = []
		Object.keys(data).forEach(coinId => {
			const coinData = data[coinId]
			result.push({
				id: coinId,
				price: coinData.usd,
				change_24h: coinData.usd_24h_change,
				volume_24h: coinData.usd_24h_vol,
				last_updated: new Date(coinData.last_updated_at * 1000).toISOString(),
			})
		})

		return result
	}

	// Get cryptocurrency historical data
	async getCryptoHistory(coinId, days = 30, vsCurrency = 'usd') {
		const params = {
			vs_currency: vsCurrency,
			days: days,
			interval: days <= 1 ? 'hourly' : 'daily',
			...this.getAuthParams() // Add auth params to query
		}

		const data = await this.makeRequest(
			`${this.config.BASE_URL}${this.config.ENDPOINTS.COIN_DATA}/${coinId}/market_chart`,
			{
				params,
				headers: this.getHeaders()
			},
			true,
			CACHE_CONFIG.DEFAULT_TTL
		)

		// Transform data to OHLC format (CoinGecko provides prices and volumes)
		const prices = data.prices || []
		const volumes = data.total_volumes || []

		return prices.map((priceData, index) => {
			const timestamp = priceData[0]
			const price = priceData[1]
			const volume = volumes[index] ? volumes[index][1] : 0

			return {
				date: new Date(timestamp).toISOString().split('T')[0],
				timestamp: timestamp,
				open: price, // CoinGecko doesn't provide OHLC, so we use price for all
				high: price,
				low: price,
				close: price,
				volume: volume,
			}
		})
	}

	// Get trending cryptocurrencies
	async getTrendingCrypto() {
		const params = this.getAuthParams(); // Add auth params to query
		
		const data = await this.makeRequest(
			`${this.config.BASE_URL}/search/trending`,
			{
				...(Object.keys(params).length > 0 && { params }),
				headers: this.getHeaders()
			},
			true,
			CACHE_CONFIG.DEFAULT_TTL
		)

		if (data.coins) {
			return data.coins.map(coin => ({
				id: coin.item.id,
				name: coin.item.name,
				symbol: coin.item.symbol,
				market_cap_rank: coin.item.market_cap_rank,
				image: coin.item.large,
				price_btc: coin.item.price_btc,
				score: coin.item.score,
			}))
		}

		return []
	}

	// Get top gainers/losers
	async getGainersLosers(vsCurrency = 'usd', timePeriod = '24h') {
		const marketData = await this.getCryptoMarkets(vsCurrency, 100)

		const gainers = marketData
			.filter(coin => coin.change_percent_24h > 0)
			.sort((a, b) => b.change_percent_24h - a.change_percent_24h)
			.slice(0, 10)

		const losers = marketData
			.filter(coin => coin.change_percent_24h < 0)
			.sort((a, b) => a.change_percent_24h - b.change_percent_24h)
			.slice(0, 10)

		return { gainers, losers }
	}

	// Simple ping test for API connectivity
	async ping() {
		try {
			// Use the simplest possible endpoint
			const params = this.getAuthParams();
			const url = `${this.config.BASE_URL}/ping`;
			
			const response = await this.makeRequest(
				url,
				{
					...(Object.keys(params).length > 0 && { params }),
					headers: this.getHeaders()
				},
				false, // Don't cache ping results
				0
			);
			
			return { success: true, data: response };
		} catch (error) {
			console.warn('CoinGecko ping failed, trying fallback:', error.message);
			
			// If ping fails, try a simple market data request as fallback
			try {
				const result = await this.getCryptoMarkets('usd', 1);
				return { success: true, fallback: true, data: result };
			} catch (fallbackError) {
				throw new Error(`Both ping and fallback failed: ${fallbackError.message}`);
			}
		}
	}

	// Get supported coins list
	async getSupportedCoins() {
		const params = this.getAuthParams(); // Add auth params to query
		
		const data = await this.makeRequest(
			`${this.config.BASE_URL}${this.config.ENDPOINTS.COINS_LIST}`,
			{
				...(Object.keys(params).length > 0 && { params }),
				headers: this.getHeaders()
			},
			true,
			CACHE_CONFIG.LONG_TTL // Cache for a long time as this rarely changes
		)

		return data.map(coin => ({
			id: coin.id,
			symbol: coin.symbol,
			name: coin.name,
		}))
	}

	// Search for cryptocurrencies
	async searchCrypto(query) {
		const params = { 
			query,
			...this.getAuthParams() // Add auth params to query
		};
		
		const data = await this.makeRequest(
			`${this.config.BASE_URL}/search`,
			{
				params,
				headers: this.getHeaders()
			},
			true,
			CACHE_CONFIG.DEFAULT_TTL
		)

		if (data.coins) {
			return data.coins.map(coin => ({
				id: coin.id,
				name: coin.name,
				symbol: coin.symbol,
				market_cap_rank: coin.market_cap_rank,
				image: coin.large,
			}))
		}

		return []
	}
}

// Export singleton instance
export const coinGeckoClient = new CoinGeckoClient()
