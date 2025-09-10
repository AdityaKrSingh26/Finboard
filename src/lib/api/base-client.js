// Basic fetch function with simple error handling
export async function fetchWithErrorHandling(url) {
	try {
		const response = await fetch(url)
		
		if (!response.ok) {
			if (response.status === 401) {
				throw new Error('Invalid API key')
			} else if (response.status === 429) {
				throw new Error('Rate limit exceeded. Please try again later.')
			} else if (response.status === 403) {
				throw new Error('API quota exceeded')
			} else if (response.status >= 500) {
				throw new Error('Server error. Please try again later.')
			} else {
				throw new Error(`API Error: ${response.status}`)
			}
		}
		
		const data = await response.json()
		return data
	} catch (error) {
		console.error('API request failed:', error.message)
		throw error
	}
}

// Simple cache to store API responses
const cache = new Map()

// Get data from cache
export function getCachedData(key) {
	const cached = cache.get(key)
	if (!cached) return null
	
	// Check if data is still fresh (5 minutes)
	if (Date.now() - cached.timestamp > 5 * 60 * 1000) {
		cache.delete(key)
		return null
	}
	
	return cached.data
}

// Store data in cache
export function setCachedData(key, data) {
	cache.set(key, {
		data: data,
		timestamp: Date.now()
	})
}

// Simple delay function for rate limiting
export function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

// Create cache key from URL
export function createCacheKey(url, params = {}) {
	const paramString = Object.keys(params)
		.sort()
		.map(key => `${key}=${params[key]}`)
		.join('&')
	return `${url}?${paramString}`
}
