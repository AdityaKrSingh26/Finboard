"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import JsonFieldExplorer from "@/components/ui/json-field-explorer"
import { ApiLoader } from "@/components/ui/loader"
import {
	X,
	Database,
	Zap,
	CheckCircle,
	AlertCircle,
	Globe,
	Code,
	Download,
	Play,
	Eye
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { testApiConnection, selectApiTestResult, selectApiTesting, clearApiTestResult } from "@/lib/store/slices/widgets-slice"
import { coinGeckoClient } from "@/lib/api/coingecko-client"
import { exchangeRateClient } from "@/lib/api/exchange-rate-client"
import { finnhubClient } from "@/lib/api/finnhub-client"

// Available API endpoints for different data types
const apiEndpoints = {
	stocks: {
		"Finnhub - Popular Stocks": async () => {
			const data = await finnhubClient.getPopularStocks()
			return data
		},
		"Finnhub - Tech Stocks": async () => {
			const data = await finnhubClient.getTechStocks()
			return data
		},
		"Finnhub - S&P 500 Top": async () => {
			const data = await finnhubClient.getSP500Top()
			return data
		}
	},
	crypto: {
		"CoinGecko - Market Data": async () => {
			const data = await coinGeckoClient.getCryptoMarkets('usd', 20)
			return data
		},
		"CoinGecko - Trending": async () => {
			const data = await coinGeckoClient.getTrendingCrypto()
			return data
		},
		"CoinGecko - Bitcoin": async () => {
			const data = await coinGeckoClient.getCryptoData('bitcoin')
			return data
		}
	},
	forex: {
		"Exchange Rate - USD Rates": async () => {
			const data = await exchangeRateClient.getLatestRates('USD')
			return data
		},
		"Exchange Rate - Popular Pairs": async () => {
			const data = await exchangeRateClient.getPopularForexPairs()
			return data
		},
		"Exchange Rate - EUR Rates": async () => {
			const data = await exchangeRateClient.getLatestRates('EUR')
			return data
		}
	}
}

export default function ApiResponseExplorer({
	isOpen,
	onClose,
	onFieldsSelected,
	initialUrl = "",
	dataSource = "custom",
	widgetType = "table"
}) {
	const dispatch = useAppDispatch()
	const apiTestResult = useAppSelector(selectApiTestResult)
	const apiTesting = useAppSelector(selectApiTesting)

	// Simple state variables
	const [url, setUrl] = useState(initialUrl)
	const [selectedEndpoint, setSelectedEndpoint] = useState("")
	const [responseData, setResponseData] = useState(null)
	const [selectedFields, setSelectedFields] = useState([])
	const [testing, setTesting] = useState(false)
	const [testResult, setTestResult] = useState(null)
	const [loadingApi, setLoadingApi] = useState(false)

	// Load API data when modal opens
	useEffect(() => {
		if (isOpen) {
			loadDefaultApiData()
		}
	}, [isOpen, dataSource])

	// Load default API data for the data source
	async function loadDefaultApiData() {
		const endpoints = apiEndpoints[dataSource] || apiEndpoints.crypto
		const endpointNames = Object.keys(endpoints)
		if (endpointNames.length > 0) {
			const firstEndpoint = endpointNames[0]
			await loadApiData(firstEndpoint)
		}
	}

	// Load data from a specific API endpoint
	async function loadApiData(endpointName) {
		setLoadingApi(true)
		setSelectedEndpoint(endpointName)
		
		try {
			const endpoints = apiEndpoints[dataSource] || apiEndpoints.crypto
			const apiFunction = endpoints[endpointName]
			
			if (apiFunction) {
				const data = await apiFunction()
				setResponseData(data)
				setSelectedFields([])
				setTestResult({
					success: true,
					message: `${endpointName} data loaded successfully!`
				})
			}
		} catch (error) {
			setTestResult({
				success: false,
				message: error.message || `Failed to load ${endpointName} data`
			})
			setResponseData(null)
		} finally {
			setLoadingApi(false)
		}
	}

	// Test the API URL
	async function testApi() {
		if (!url.trim()) {
			return
		}

		setTesting(true)
		setTestResult(null)

		try {
			// Make actual API call
			const response = await fetch(url)
			
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`)
			}
			
			const data = await response.json()
			
			setResponseData(data)
			setSelectedFields([])
			setTestResult({
				success: true,
				message: "API connected successfully! Response data loaded.",
				responseTime: Math.floor(Math.random() * 500 + 200)
			})

		} catch (error) {
			setTestResult({
				success: false,
				message: error.message || "Failed to connect to API"
			})
		} finally {
			setTesting(false)
		}
	}

	// When fields change
	function onFieldsChange(fields) {
		setSelectedFields(fields)
	}

	// Save the selected fields
	function saveFields() {
		onFieldsSelected?.({
			fields: selectedFields,
			apiUrl: url || null,
			responseData: responseData,
			dataSource: selectedEndpoint || "api"
		})
		onClose()
	}

	// Get suggested fields for different widget types
	function getSuggestedFields() {
		if (!responseData) {
			return []
		}

		// Fields that work well for different widget types
		let goodFields = []
		if (widgetType === "table") {
			goodFields = ["symbol", "name", "price", "change", "volume", "market_cap", "current_price", "regularMarketPrice"]
		} else if (widgetType === "card") {
			goodFields = ["name", "symbol", "price", "current_price", "change", "change_percent", "regularMarketPrice"]
		} else if (widgetType === "chart") {
			goodFields = ["date", "time", "open", "high", "low", "close", "volume", "timestamp"]
		} else {
			goodFields = ["symbol", "name", "price", "change", "volume", "market_cap", "current_price", "regularMarketPrice"]
		}

		const allFields = getAllFieldPaths(responseData)
		
		let suggestions = []
		for (let i = 0; i < goodFields.length; i++) {
			const target = goodFields[i]
			for (let j = 0; j < allFields.length; j++) {
				const field = allFields[j]
				if (field.toLowerCase().includes(target.toLowerCase()) ||
					target.toLowerCase().includes(field.toLowerCase())) {
					suggestions.push(field)
					break
				}
			}
		}
		
		// Only return first 6 suggestions
		return suggestions.slice(0, 6)
	}

	// Get all possible field paths from an object
	function getAllFieldPaths(obj, prefix = "") {
		let paths = []
		
		if (Array.isArray(obj)) {
			if (obj.length > 0) {
				const firstItem = obj[0]
				const subPaths = getAllFieldPaths(firstItem, prefix)
				paths = paths.concat(subPaths)
			}
		} else if (typeof obj === "object" && obj !== null) {
			const keys = Object.keys(obj)
			for (let i = 0; i < keys.length; i++) {
				const key = keys[i]
				const value = obj[key]
				const path = prefix ? `${prefix}.${key}` : key
				paths.push(path)
				
				if (typeof value === "object" && value !== null) {
					const subPaths = getAllFieldPaths(value, path)
					paths = paths.concat(subPaths)
				}
			}
		}
		
		return paths
	}

	const suggestedFields = getSuggestedFields()
	const availableEndpoints = apiEndpoints[dataSource] || apiEndpoints.crypto

	// Don't show modal if closed
	if (!isOpen) {
		return null
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-background border-border">
				<DialogHeader>
					<DialogTitle className="text-xl text-foreground flex items-center gap-2">
						<Database className="w-5 h-5" />
						Interactive JSON Field Explorer
						<Button
							variant="ghost"
							size="sm"
							onClick={onClose}
							className="ml-auto text-muted-foreground hover:text-foreground"
						>
							<X className="w-4 h-4" />
						</Button>
					</DialogTitle>
				</DialogHeader>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
					{/* Left side - API settings */}
					<div className="space-y-4 overflow-y-auto max-h-[calc(95vh-120px)]">
						{/* Custom API URL section */}
						<Card className="bg-card border-border">
							<CardHeader className="pb-3">
								<CardTitle className="text-sm text-foreground flex items-center gap-2">
									<Globe className="w-4 h-4" />
									Test Custom API
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div>
									<Label htmlFor="apiUrl" className="text-muted-foreground">API URL</Label>
									<Input
										id="apiUrl"
										placeholder="Enter your API endpoint URL"
										value={url}
										onChange={(e) => setUrl(e.target.value)}
										className="bg-input border-border text-foreground placeholder:text-muted-foreground"
									/>
								</div>
								<div className="flex items-center gap-3">
									<Button
										onClick={testApi}
										disabled={!url.trim() || testing}
										className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
									>
										{testing ? (
											<>
												<ApiLoader size="sm" className="mr-2" />
												Testing...
											</>
										) : (
											<>
												<Play className="w-4 h-4 mr-2" />
												Test & Load
											</>
										)}
									</Button>

									{testResult && (
										<div className={`flex items-center gap-2 text-sm ${
											testResult.success ? "text-green-400" : "text-red-400"
										}`}>
											{testResult.success ? (
												<CheckCircle className="w-4 h-4" />
											) : (
												<AlertCircle className="w-4 h-4" />
											)}
											{testResult.message}
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Live APIs */}
						<Card className="bg-card border-border">
							<CardHeader className="pb-3">
								<CardTitle className="text-sm text-foreground flex items-center gap-2">
									<Code className="w-4 h-4" />
									Live API Endpoints
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								{Object.keys(availableEndpoints).map((endpointName) => (
									<Button
										key={endpointName}
										variant={selectedEndpoint === endpointName ? "default" : "outline"}
										size="sm"
										onClick={() => loadApiData(endpointName)}
										disabled={loadingApi}
										className={`w-full text-left justify-start ${
											selectedEndpoint === endpointName
												? "bg-teal-500 hover:bg-teal-600 text-white"
												: "bg-muted border-border text-muted-foreground hover:bg-muted/80"
										}`}
									>
										{loadingApi && selectedEndpoint === endpointName ? (
											<>
												<ApiLoader size="sm" className="mr-2" />
												Loading...
											</>
										) : (
											<>
												<Database className="w-3 h-3 mr-2" />
												{endpointName}
											</>
										)}
									</Button>
								))}
							</CardContent>
						</Card>

						{/* Field suggestions */}
						{suggestedFields.length > 0 && (
							<Card className="bg-slate-800 border-slate-700">
								<CardHeader className="pb-3">
									<CardTitle className="text-sm text-teal-400 flex items-center gap-2">
										<Zap className="w-4 h-4" />
										Quick Select for {widgetType.charAt(0).toUpperCase() + widgetType.slice(1)}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<div className="flex flex-wrap gap-2">
										{suggestedFields.map((field) => (
											<Button
												key={field}
												variant="outline"
												size="sm"
												onClick={() => {
													if (!selectedFields.includes(field)) {
														setSelectedFields([...selectedFields, field])
													}
												}}
												className="h-7 px-2 text-xs border-slate-600 text-slate-300 hover:bg-teal-600 hover:text-white hover:border-teal-500"
											>
												+ {field}
											</Button>
										))}
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											const newFields = suggestedFields.filter(f => !selectedFields.includes(f))
											setSelectedFields([...selectedFields, ...newFields])
										}}
										className="w-full text-xs border-teal-600 text-teal-300 hover:bg-teal-600 hover:text-white"
									>
										<CheckCircle className="w-3 h-3 mr-1" />
										Select All Suggested
									</Button>
								</CardContent>
							</Card>
						)}

						{/* Raw response preview */}
						{responseData && (
							<Card className="bg-slate-800 border-slate-700">
								<CardHeader className="pb-3">
									<CardTitle className="text-sm text-white flex items-center gap-2">
										<Eye className="w-4 h-4" />
										Raw Response Preview
									</CardTitle>
								</CardHeader>
								<CardContent>
									<pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded overflow-auto max-h-40">
										{JSON.stringify(responseData, null, 2)}
									</pre>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Right side - Field explorer */}
					<div className="overflow-hidden">
						{responseData ? (
							<JsonFieldExplorer
								data={responseData}
								selectedFields={selectedFields}
								onFieldsChange={onFieldsChange}
								maxHeight="calc(95vh - 200px)"
								showPreview={true}
								enableSearch={true}
								enableFilters={true}
								className="h-full"
							/>
						) : (
							<Card className="h-full bg-slate-800 border-slate-700 flex items-center justify-center">
								<CardContent className="text-center p-6">
									<Database className="w-16 h-16 text-slate-500 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-white mb-2">No API Response</h3>
									<p className="text-slate-400 mb-4">
										Test a custom API URL or select a live endpoint to explore its structure
									</p>
									<Button
										variant="outline"
										onClick={() => {
											const endpointNames = Object.keys(availableEndpoints)
											if (endpointNames.length > 0) {
												loadApiData(endpointNames[0])
											}
										}}
										className="border-slate-600 text-slate-300 hover:bg-slate-700"
									>
										Load API Data
									</Button>
								</CardContent>
							</Card>
						)}
					</div>
				</div>

				{/* Bottom buttons */}
				<div className="flex justify-between items-center pt-4 border-t border-slate-700">
					<div className="text-sm text-slate-400">
						{selectedFields.length > 0 ? (
							<span className="text-teal-400">
								{selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
							</span>
						) : (
							"Select fields to include in your widget"
						)}
					</div>

					<div className="flex gap-3">
						<Button
							variant="outline"
							onClick={onClose}
							className="border-slate-600 text-slate-300 hover:bg-slate-700"
						>
							Cancel
						</Button>
						<Button
							onClick={saveFields}
							disabled={selectedFields.length === 0}
							className="bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50"
						>
							<Download className="w-4 h-4 mr-2" />
							Use Selected Fields ({selectedFields.length})
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
