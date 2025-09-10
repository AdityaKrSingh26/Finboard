import { API_CONFIG } from '../config/api-config.js'

const BASE_URL = API_CONFIG.EXCHANGE_RATE.BASE_URL
const API_KEY = API_CONFIG.EXCHANGE_RATE.API_KEY

// Simple fetch function
async function fetchData(url) {
	try {
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error(`API Error: ${response.status}`)
		}
		const data = await response.json()
		
		if (data.result === 'error') {
			throw new Error(data['error-type'] || 'API Error')
		}
		
		return data
	} catch (error) {
		console.error('Fetch error:', error)
		throw error
	}
}

// Get latest exchange rates
export async function getLatestRates(baseCurrency = 'USD') {
	const url = `${BASE_URL}/${API_KEY}/latest/${baseCurrency.toUpperCase()}`
	const data = await fetchData(url)

	if (data.result === 'success') {
		const rates = data.conversion_rates
		const baseCode = data.base_code
		const lastUpdate = data.time_last_update_unix

		// Make simple array of forex pairs
		const forexPairs = []
		Object.keys(rates).forEach(currency => {
			if (currency !== baseCode) {
				forexPairs.push({
					pair: `${baseCode}/${currency}`,
					from_currency: baseCode,
					to_currency: currency,
					rate: rates[currency],
					last_updated: new Date(lastUpdate * 1000).toISOString()
				})
			}
		})

		return {
			base_code: baseCode,
			last_updated: new Date(lastUpdate * 1000).toISOString(),
			rates: forexPairs,
			conversion_rates: rates
		}
	}

	throw new Error('Failed to fetch exchange rates')
}

// Get exchange rate between two currencies
export async function getPairRate(fromCurrency, toCurrency) {
	const url = `${BASE_URL}/${API_KEY}/pair/${fromCurrency.toUpperCase()}/${toCurrency.toUpperCase()}`
	const data = await fetchData(url)

	if (data.result === 'success') {
		return {
			pair: `${fromCurrency}/${toCurrency}`,
			from_currency: data.base_code,
			to_currency: data.target_code,
			rate: data.conversion_rate,
			last_updated: new Date(data.time_last_update_unix * 1000).toISOString()
		}
	}

	throw new Error(`Failed to get exchange rate for ${fromCurrency}/${toCurrency}`)
}

// Get enriched exchange rate data
export async function getEnrichedRate(fromCurrency, toCurrency, amount = 1) {
	const url = `${BASE_URL}/${API_KEY}/enriched/${fromCurrency.toUpperCase()}/${toCurrency.toUpperCase()}/${amount}`
	const data = await fetchData(url)

	if (data.result === 'success') {
		return {
			pair: `${fromCurrency}/${toCurrency}`,
			from_currency: data.base_code,
			to_currency: data.target_code,
			rate: data.conversion_rate,
			amount: amount,
			converted_amount: data.conversion_result,
			last_updated: new Date(data.time_last_update_unix * 1000).toISOString()
		}
	}

	throw new Error(`Failed to get enriched rate for ${fromCurrency}/${toCurrency}`)
}

// Get popular forex pairs
export async function getPopularForexPairs() {
	const majorPairs = [
		{ from: 'EUR', to: 'USD' },
		{ from: 'GBP', to: 'USD' },
		{ from: 'USD', to: 'JPY' },
		{ from: 'USD', to: 'CHF' },
		{ from: 'AUD', to: 'USD' },
		{ from: 'USD', to: 'CAD' }
	]

	const forexData = []

	for (const pair of majorPairs) {
		try {
			const pairData = await getPairRate(pair.from, pair.to)

			// Add some fake change data (since API doesn't provide this)
			const fakeChange = (Math.random() - 0.5) * 2 // Random change between -1% and 1%

			forexData.push({
				...pairData,
				change: pairData.rate * (fakeChange / 100),
				change_percent: fakeChange,
				high_24h: pairData.rate * 1.02,
				low_24h: pairData.rate * 0.98
			})

			// Simple delay to avoid hitting rate limits
			await new Promise(resolve => setTimeout(resolve, 1000))
		} catch (error) {
			console.error(`Error getting forex pair ${pair.from}/${pair.to}:`, error)
		}
	}

	return forexData
}

// Get supported currencies (simplified)
export async function getSupportedCurrencies() {
	const url = `${BASE_URL}/${API_KEY}/codes`
	const data = await fetchData(url)

	if (data.result === 'success') {
		return data.supported_codes.map(([code, name]) => ({
			code,
			name
		}))
	}

	throw new Error('Failed to fetch supported currencies')
}

// Convert amount between currencies
export async function convertCurrency(fromCurrency, toCurrency, amount) {
	const enrichedData = await getEnrichedRate(fromCurrency, toCurrency, amount)
	return {
		from: {
			currency: enrichedData.from_currency,
			amount: amount
		},
		to: {
			currency: enrichedData.to_currency,
			amount: enrichedData.converted_amount
		},
		rate: enrichedData.rate,
		last_updated: enrichedData.last_updated
	}
}

// For backward compatibility - create a simple object with all functions
export const exchangeRateClient = {
	getLatestRates,
	getPairRate,
	getEnrichedRate,
	getPopularForexPairs,
	getSupportedCurrencies,
	convertCurrency
}
