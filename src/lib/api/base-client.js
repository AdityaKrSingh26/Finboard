import { CACHE_CONFIG, RATE_LIMIT_CONFIG, API_ERRORS } from '../config/api-config.js'

// Rate limiter class
class RateLimiter {
	constructor(maxRequests = 50, windowSize = 60000) {
		this.maxRequests = maxRequests
		this.windowSize = windowSize
		this.requests = []
	}

	canMakeRequest() {
		const now = Date.now()
		this.requests = this.requests.filter(time => now - time < this.windowSize)
		return this.requests.length < this.maxRequests
	}

	recordRequest() {
		this.requests.push(Date.now())
	}

	getNextAllowedTime() {
		if (this.requests.length === 0) return 0
		const oldestRequest = Math.min(...this.requests)
		return oldestRequest + this.windowSize - Date.now()
	}
}

// Enhanced cache with TTL support
class APICache {
	constructor() {
		this.cache = new Map()
		this.timers = new Map()
	}

	get(key) {
		const item = this.cache.get(key)
		if (!item) return null

		if (Date.now() > item.expiry) {
			this.delete(key)
			return null
		}

		return item.data
	}

	set(key, data, ttl = CACHE_CONFIG.DEFAULT_TTL) {
		const expiry = Date.now() + ttl

		// Clear existing timer if any
		if (this.timers.has(key)) {
			clearTimeout(this.timers.get(key))
		}

		this.cache.set(key, { data, expiry })

		// Set cleanup timer
		const timer = setTimeout(() => {
			this.delete(key)
		}, ttl)

		this.timers.set(key, timer)
	}

	delete(key) {
		this.cache.delete(key)
		if (this.timers.has(key)) {
			clearTimeout(this.timers.get(key))
			this.timers.delete(key)
		}
	}

	clear() {
		this.cache.clear()
		this.timers.forEach(timer => clearTimeout(timer))
		this.timers.clear()
	}

	size() {
		return this.cache.size
	}
}

// Base API client class
export class BaseAPIClient {
	constructor(config) {
		this.config = config
		this.cache = new APICache()
		this.rateLimiter = new RateLimiter(
			config.RATE_LIMIT?.REQUESTS_PER_MINUTE || RATE_LIMIT_CONFIG.MAX_REQUESTS_PER_WINDOW,
			RATE_LIMIT_CONFIG.WINDOW_SIZE
		)
		this.retryCount = 0
		this.maxRetries = 3
	}

	// Create cache key from URL and params
	createCacheKey(url, params = {}) {
		const sortedParams = Object.keys(params)
			.sort()
			.map(key => `${key}=${params[key]}`)
			.join('&')
		return `${url}?${sortedParams}`
	}

	// Check rate limits before making request
	async checkRateLimit() {
		if (!this.rateLimiter.canMakeRequest()) {
			const waitTime = this.rateLimiter.getNextAllowedTime()
			throw new Error(`${API_ERRORS.RATE_LIMIT} Wait ${Math.ceil(waitTime / 1000)} seconds.`)
		}
	}

	// Make HTTP request with error handling and retries
	async makeRequest(url, options = {}, useCache = true, ttl = CACHE_CONFIG.DEFAULT_TTL) {
		const cacheKey = this.createCacheKey(url, options.params || {})

		// Check cache first
		if (useCache) {
			const cachedData = this.cache.get(cacheKey)
			if (cachedData) {
				console.log(`Cache hit for: ${cacheKey}`)
				return cachedData
			}
		}

		// Check rate limits
		await this.checkRateLimit()

		try {
			// Record request for rate limiting
			this.rateLimiter.recordRequest()

			// Build URL with params
			const urlWithParams = new URL(url)
			if (options.params) {
				Object.keys(options.params).forEach(key => {
					urlWithParams.searchParams.append(key, options.params[key])
				})
			}

			console.log(`Making API request to: ${urlWithParams.toString()}`)

			// For CORS compatibility, use minimal headers for external APIs
			const fetchOptions = {
				method: options.method || 'GET',
				mode: 'cors',
				cache: 'no-cache',
				...options,
			}

			// Only add headers if they're necessary (some APIs block custom headers)
			if (options.headers && Object.keys(options.headers).length > 0) {
				fetchOptions.headers = {
					...options.headers,
				}
			}

			const response = await fetch(urlWithParams.toString(), fetchOptions)

			if (!response.ok) {
				await this.handleErrorResponse(response)
			}

			const data = await response.json()

			// Handle API-specific error formats
			if (this.isErrorResponse(data)) {
				throw new Error(this.extractErrorMessage(data))
			}

			// Cache successful response
			if (useCache) {
				this.cache.set(cacheKey, data, ttl)
			}

			this.retryCount = 0 // Reset retry count on success
			return data

		} catch (error) {
			console.error(`API request failed: ${error.message}`)

			// Retry logic for network errors
			if (this.shouldRetry(error) && this.retryCount < this.maxRetries) {
				this.retryCount++
				const delay = Math.min(
					RATE_LIMIT_CONFIG.BACKOFF_MULTIPLIER ** this.retryCount * 1000,
					RATE_LIMIT_CONFIG.MAX_BACKOFF
				)

				console.log(`Retrying request in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})`)
				await new Promise(resolve => setTimeout(resolve, delay))

				return this.makeRequest(url, options, useCache, ttl)
			}

			throw error
		}
	}

	// Handle HTTP error responses
	async handleErrorResponse(response) {
		const status = response.status
		const statusText = response.statusText
		
		// Try to get more detailed error message from response body
		let errorDetail = statusText;
		try {
			const errorBody = await response.text();
			if (errorBody) {
				// Try to parse as JSON first
				try {
					const errorJson = JSON.parse(errorBody);
					errorDetail = errorJson.error || errorJson.message || errorJson.status?.error_message || statusText;
				} catch {
					// If not JSON, use the text as is (truncated)
					errorDetail = errorBody.length > 200 ? errorBody.substring(0, 200) + '...' : errorBody;
				}
			}
		} catch {
			// If we can't read the body, just use status text
			errorDetail = statusText;
		}

		switch (status) {
			case 400:
				throw new Error(`Bad Request: ${errorDetail}`)
			case 401:
				throw new Error(API_ERRORS.INVALID_KEY)
			case 403:
				throw new Error(API_ERRORS.QUOTA_EXCEEDED)
			case 404:
				throw new Error(API_ERRORS.NOT_FOUND)
			case 429:
				throw new Error(API_ERRORS.RATE_LIMIT)
			case 500:
			case 502:
			case 503:
				throw new Error(API_ERRORS.SERVER_ERROR)
			default:
				throw new Error(`HTTP ${status}: ${errorDetail}`)
		}
	}

	// Check if response contains API error (to be overridden by specific APIs)
	isErrorResponse(data) {
		return false
	}

	// Extract error message from API response (to be overridden by specific APIs)
	extractErrorMessage(data) {
		return 'Unknown API error'
	}

	// Determine if request should be retried
	shouldRetry(error) {
		// Retry on network errors, timeouts, and 5xx errors
		return error.message.includes('fetch') ||
			error.message.includes('timeout') ||
			error.message.includes('500') ||
			error.message.includes('502') ||
			error.message.includes('503')
	}

	// Clear cache
	clearCache() {
		this.cache.clear()
	}

	// Get cache stats
	getCacheStats() {
		return {
			size: this.cache.size(),
			rateLimitRequests: this.rateLimiter.requests.length,
			canMakeRequest: this.rateLimiter.canMakeRequest(),
		}
	}
}
