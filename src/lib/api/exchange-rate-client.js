import { BaseAPIClient } from './base-client.js'
import { API_CONFIG, CACHE_CONFIG } from '../config/api-config.js'

export class ExchangeRateClient extends BaseAPIClient {
	constructor() {
		super(API_CONFIG.EXCHANGE_RATE)
	}

	// Check if response contains API error
	isErrorResponse(data) {
		return data.result === 'error' || data['error-type']
	}

	// Extract error message from API response
	extractErrorMessage(data) {
		if (data['error-type']) {
			switch (data['error-type']) {
				case 'unknown-code':
					return 'Unknown currency code'
				case 'malformed-request':
					return 'Malformed request'
				case 'invalid-key':
					return 'Invalid API key'
				case 'inactive-account':
					return 'Inactive account'
				case 'quota-reached':
					return 'Monthly quota reached'
				default:
					return data['error-type']
			}
		}
		return 'Unknown Exchange Rate API error'
	}

	// Get latest exchange rates for a base currency
	async getLatestRates(baseCurrency = 'USD') {
		const data = await this.makeRequest(
			`${this.config.BASE_URL}/${this.config.API_KEY}${this.config.ENDPOINTS.LATEST}/${baseCurrency.toUpperCase()}`,
			{},
			true,
			CACHE_CONFIG.DEFAULT_TTL
		)

		if (data.result === 'success') {
			const rates = data.conversion_rates
			const baseCode = data.base_code
			const lastUpdate = data.time_last_update_unix

			// Transform to consistent format
			const forexPairs = []
			Object.keys(rates).forEach(currency => {
				if (currency !== baseCode) {
					forexPairs.push({
						pair: `${baseCode}/${currency}`,
						from_currency: baseCode,
						to_currency: currency,
						rate: rates[currency],
						last_updated: new Date(lastUpdate * 1000).toISOString(),
						timestamp: lastUpdate,
					})
				}
			})

			return {
				base_code: baseCode,
				last_updated: new Date(lastUpdate * 1000).toISOString(),
				rates: forexPairs,
				conversion_rates: rates,
			}
		}

		throw new Error('Failed to fetch exchange rates')
	}

	// Get exchange rate between two currencies
	async getPairRate(fromCurrency, toCurrency) {
		const data = await this.makeRequest(
			`${this.config.BASE_URL}/${this.config.API_KEY}${this.config.ENDPOINTS.PAIR}/${fromCurrency.toUpperCase()}/${toCurrency.toUpperCase()}`,
			{},
			true,
			CACHE_CONFIG.SHORT_TTL
		)

		if (data.result === 'success') {
			return {
				pair: `${fromCurrency}/${toCurrency}`,
				from_currency: data.base_code,
				to_currency: data.target_code,
				rate: data.conversion_rate,
				last_updated: new Date(data.time_last_update_unix * 1000).toISOString(),
				next_update: new Date(data.time_next_update_unix * 1000).toISOString(),
			}
		}

		throw new Error(`Failed to get exchange rate for ${fromCurrency}/${toCurrency}`)
	}

	// Get enriched exchange rate data (includes historical data)
	async getEnrichedRate(fromCurrency, toCurrency, amount = 1) {
		const data = await this.makeRequest(
			`${this.config.BASE_URL}/${this.config.API_KEY}${this.config.ENDPOINTS.ENRICHED}/${fromCurrency.toUpperCase()}/${toCurrency.toUpperCase()}/${amount}`,
			{},
			true,
			CACHE_CONFIG.DEFAULT_TTL
		)

		if (data.result === 'success') {
			return {
				pair: `${fromCurrency}/${toCurrency}`,
				from_currency: data.base_code,
				to_currency: data.target_code,
				rate: data.conversion_rate,
				amount: amount,
				converted_amount: data.conversion_result,
				last_updated: new Date(data.time_last_update_unix * 1000).toISOString(),
				next_update: new Date(data.time_next_update_unix * 1000).toISOString(),
			}
		}

		throw new Error(`Failed to get enriched rate for ${fromCurrency}/${toCurrency}`)
	}

	// Get popular forex pairs
	async getPopularForexPairs() {
		const majorPairs = [
			{ from: 'EUR', to: 'USD' },
			{ from: 'GBP', to: 'USD' },
			{ from: 'USD', to: 'JPY' },
			{ from: 'USD', to: 'CHF' },
			{ from: 'AUD', to: 'USD' },
			{ from: 'USD', to: 'CAD' },
			{ from: 'USD', to: 'CNY' },
			{ from: 'EUR', to: 'GBP' },
		]

		const forexData = []

		for (const pair of majorPairs) {
			try {
				const pairData = await this.getPairRate(pair.from, pair.to)

				// Calculate a mock change percentage (since API doesn't provide this)
				const mockChange = (Math.random() - 0.5) * 2 // Random change between -1% and 1%

				forexData.push({
					...pairData,
					change: pairData.rate * (mockChange / 100),
					change_percent: mockChange,
					high_24h: pairData.rate * (1 + Math.random() * 0.02),
					low_24h: pairData.rate * (1 - Math.random() * 0.02),
					bid: pairData.rate * 0.9999,
					ask: pairData.rate * 1.0001,
				})

				// Add delay to respect rate limits
				await new Promise(resolve => setTimeout(resolve, 1000))
			} catch (error) {
				console.error(`Failed to get forex pair ${pair.from}/${pair.to}:`, error.message)
			}
		}

		return forexData
	}

	// Get supported currencies
	async getSupportedCurrencies() {
		const data = await this.makeRequest(
			`${this.config.BASE_URL}/${this.config.API_KEY}/codes`,
			{},
			true,
			CACHE_CONFIG.LONG_TTL // Cache for long time as this rarely changes
		)

		if (data.result === 'success') {
			return data.supported_codes.map(([code, name]) => ({
				code,
				name,
			}))
		}

		throw new Error('Failed to fetch supported currencies')
	}

	// Convert amount between currencies
	async convertCurrency(fromCurrency, toCurrency, amount) {
		const enrichedData = await this.getEnrichedRate(fromCurrency, toCurrency, amount)
		return {
			from: {
				currency: enrichedData.from_currency,
				amount: amount,
			},
			to: {
				currency: enrichedData.to_currency,
				amount: enrichedData.converted_amount,
			},
			rate: enrichedData.rate,
			last_updated: enrichedData.last_updated,
		}
	}

	// Get historical rates (mock implementation since free plan doesn't support this)
	async getHistoricalRates(baseCurrency = 'USD', days = 30) {
		// For demonstration, we'll generate mock historical data
		// In a real implementation, you'd need a paid plan for historical data
		const currentRates = await this.getLatestRates(baseCurrency)
		const historicalData = []

		for (let i = days; i >= 0; i--) {
			const date = new Date()
			date.setDate(date.getDate() - i)

			// Generate mock rates based on current rates with some variation
			const dayRates = {}
			Object.keys(currentRates.conversion_rates).forEach(currency => {
				const baseRate = currentRates.conversion_rates[currency]
				const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
				dayRates[currency] = baseRate * (1 + variation)
			})

			historicalData.push({
				date: date.toISOString().split('T')[0],
				base_code: baseCurrency,
				rates: dayRates,
			})
		}

		return historicalData
	}
}

// Export singleton instance
export const exchangeRateClient = new ExchangeRateClient()
