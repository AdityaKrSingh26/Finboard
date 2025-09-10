// API Configuration and Constants
export const API_CONFIG = {
	ALPHA_VANTAGE: {
		BASE_URL: process.env.NEXT_PUBLIC_ALPHA_VANTAGE_BASE_URL || 'https://www.alphavantage.co/query',
		API_KEY: process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY,
		RATE_LIMIT: {
			REQUESTS_PER_MINUTE: 5,
			REQUESTS_PER_DAY: 25,
		},
		ENDPOINTS: {
			QUOTE: 'GLOBAL_QUOTE',
			INTRADAY: 'TIME_SERIES_INTRADAY',
			DAILY: 'TIME_SERIES_DAILY',
			FOREX: 'FX_REALTIME',
			SEARCH: 'SYMBOL_SEARCH',
		}
	},

	FINNHUB: {
		BASE_URL: process.env.NEXT_PUBLIC_FINNHUB_BASE_URL || 'https://finnhub.io/api/v1',
		API_KEY: process.env.NEXT_PUBLIC_FINNHUB_API_KEY,
		RATE_LIMIT: {
			REQUESTS_PER_MINUTE: 60,
		},
		ENDPOINTS: {
			QUOTE: '/quote',
			COMPANY_PROFILE: '/stock/profile2',
			METRICS: '/stock/metric',
			BASIC_FINANCIALS: '/stock/metric',
			CANDLES: '/stock/candle',
			NEWS: '/company-news',
			MARKET_STATUS: '/stock/market-status',
		}
	},

	COINGECKO: {
		get BASE_URL() {
			// Temporarily force public API for better compatibility
			return process.env.NEXT_PUBLIC_COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';
			
			// Original Pro API logic (commented out for now)
			// const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
			// if (apiKey && apiKey.startsWith('CG-')) {
			// 	return 'https://pro-api.coingecko.com/api/v3';
			// }
			// return process.env.NEXT_PUBLIC_COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';
		},
		API_KEY: process.env.NEXT_PUBLIC_COINGECKO_API_KEY,
		RATE_LIMIT: {
			REQUESTS_PER_MINUTE: 30,
		},
		ENDPOINTS: {
			COINS_LIST: '/coins/list',
			COINS_MARKETS: '/coins/markets',
			COIN_DATA: '/coins',
			PRICE: '/simple/price',
			HISTORY: '/coins/{id}/history',
		}
	},

	EXCHANGE_RATE: {
		BASE_URL: process.env.NEXT_PUBLIC_EXCHANGE_RATE_BASE_URL || 'https://v6.exchangerate-api.com/v6',
		API_KEY: process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY,
		RATE_LIMIT: {
			REQUESTS_PER_MONTH: 1500,
		},
		ENDPOINTS: {
			LATEST: '/latest',
			PAIR: '/pair',
			ENRICHED: '/enriched',
		}
	}
}

// Cache configuration
export const CACHE_CONFIG = {
	DEFAULT_TTL: parseInt(process.env.NEXT_PUBLIC_API_CACHE_DURATION) || 300000, // 5 minutes
	SHORT_TTL: 60000, // 1 minute for real-time data
	MEDIUM_TTL: 600000, // 10 minutes for semi-static data
	LONG_TTL: 3600000, // 1 hour for static data
}

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
	WINDOW_SIZE: 60000, // 1 minute window
	MAX_REQUESTS_PER_WINDOW: 50,
	BACKOFF_MULTIPLIER: 2,
	MAX_BACKOFF: 30000, // 30 seconds
}

// Common symbols and currencies
export const COMMON_SYMBOLS = {
	STOCKS: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'],
	CRYPTO: ['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 'polkadot'],
	FOREX: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'],
}

// Error messages
export const API_ERRORS = {
	RATE_LIMIT: 'API rate limit exceeded. Please try again later.',
	INVALID_KEY: 'Invalid API key. Please check your configuration.',
	NETWORK_ERROR: 'Network error. Please check your internet connection.',
	NOT_FOUND: 'Requested data not found.',
	SERVER_ERROR: 'Server error. Please try again later.',
	QUOTA_EXCEEDED: 'API quota exceeded. Please upgrade your plan or try again tomorrow.',
}
