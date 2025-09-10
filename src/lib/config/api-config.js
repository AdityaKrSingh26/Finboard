// Simple API configuration
export const API_CONFIG = {
	ALPHA_VANTAGE: {
		BASE_URL: 'https://www.alphavantage.co/query',
		API_KEY: process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY
	},

	FINNHUB: {
		BASE_URL: 'https://finnhub.io/api/v1',
		API_KEY: process.env.NEXT_PUBLIC_FINNHUB_API_KEY
	},

	COINGECKO: {
		BASE_URL: 'https://api.coingecko.com/api/v3',
		API_KEY: process.env.NEXT_PUBLIC_COINGECKO_API_KEY
	},

	EXCHANGE_RATE: {
		BASE_URL: 'https://v6.exchangerate-api.com/v6',
		API_KEY: process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY
	}
}

// Popular symbols to use in the app
export const POPULAR_STOCKS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX']
export const POPULAR_CRYPTO = ['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana']
export const MAJOR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD']
