import { API_CONFIG } from '../config/api-config.js'

const BASE_URL = API_CONFIG.COINGECKO.BASE_URL
const API_KEY = API_CONFIG.COINGECKO.API_KEY

// Simple fetch function
async function fetchData(url) {
	try {
		const response = await fetch(url)
		if (!response.ok) {
			throw new Error(`API Error: ${response.status}`)
		}
		const data = await response.json()
		
		if (data.error) {
			throw new Error(data.error)
		}
		
		return data
	} catch (error) {
		console.error('Fetch error:', error)
		throw error
	}
}

// Get cryptocurrency market data
export async function getCryptoMarkets(vsCurrency = 'usd', limit = 50) {
	let url = `${BASE_URL}/coins/markets?vs_currency=${vsCurrency}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h,7d`
	
	if (API_KEY) {
		url += `&x_cg_demo_api_key=${API_KEY}`
	}

	const data = await fetchData(url)

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
		last_updated: coin.last_updated
	}))
}

// Get specific cryptocurrency data
export async function getCryptoData(coinId) {
	let url = `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
	
	if (API_KEY) {
		url += `&x_cg_demo_api_key=${API_KEY}`
	}

	const data = await fetchData(url)
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
		last_updated: marketData.last_updated
	}
}

// Get simple price data for multiple coins
export async function getSimplePrices(coinIds, vsCurrencies = ['usd'], includeChange = true) {
	const ids = Array.isArray(coinIds) ? coinIds.join(',') : coinIds
	const currencies = Array.isArray(vsCurrencies) ? vsCurrencies.join(',') : vsCurrencies
	
	let url = `${BASE_URL}/simple/price?ids=${ids}&vs_currencies=${currencies}&include_24hr_change=${includeChange}&include_24hr_vol=${includeChange}&include_last_updated_at=true`
	
	if (API_KEY) {
		url += `&x_cg_demo_api_key=${API_KEY}`
	}

	const data = await fetchData(url)

	// Transform data to simple format
	const result = []
	Object.keys(data).forEach(coinId => {
		const coinData = data[coinId]
		result.push({
			id: coinId,
			price: coinData.usd,
			change_24h: coinData.usd_24h_change,
			volume_24h: coinData.usd_24h_vol,
			last_updated: new Date(coinData.last_updated_at * 1000).toISOString()
		})
	})

	return result
}

// Get cryptocurrency historical data (simplified)
export async function getCryptoHistory(coinId, days = 30, vsCurrency = 'usd') {
	let url = `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`
	
	if (API_KEY) {
		url += `&x_cg_demo_api_key=${API_KEY}`
	}

	const data = await fetchData(url)

	// Transform data to simple format
	const prices = data.prices || []
	const volumes = data.total_volumes || []

	return prices.map((priceData, index) => {
		const timestamp = priceData[0]
		const price = priceData[1]
		const volume = volumes[index] ? volumes[index][1] : 0

		return {
			date: new Date(timestamp).toISOString().split('T')[0],
			timestamp: timestamp,
			open: price,
			high: price,
			low: price,
			close: price,
			volume: volume
		}
	})
}

// Get trending cryptocurrencies
export async function getTrendingCrypto() {
	let url = `${BASE_URL}/search/trending`
	
	if (API_KEY) {
		url += `?x_cg_demo_api_key=${API_KEY}`
	}

	const data = await fetchData(url)

	if (data.coins) {
		return data.coins.map(coin => ({
			id: coin.item.id,
			name: coin.item.name,
			symbol: coin.item.symbol,
			market_cap_rank: coin.item.market_cap_rank,
			image: coin.item.large,
			price_btc: coin.item.price_btc,
			score: coin.item.score
		}))
	}

	return []
}

// Get top gainers and losers
export async function getGainersLosers(vsCurrency = 'usd') {
	const marketData = await getCryptoMarkets(vsCurrency, 100)

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

// For backward compatibility - create a simple object with all functions
export const coinGeckoClient = {
	getCryptoMarkets,
	getCryptoData,
	getSimplePrices,
	getCryptoHistory,
	getTrendingCrypto,
	getGainersLosers
}
