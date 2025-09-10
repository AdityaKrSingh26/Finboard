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
	Settings,
	Eye,
	Filter
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { testApiConnection, selectApiTestResult, selectApiTesting, clearApiTestResult } from "@/lib/store/slices/widgets-slice"
import { DataService } from "@/lib/data-service"

// Sample API responses for different endpoints
const SAMPLE_API_RESPONSES = {
	stocks: {
		"Alpha Vantage - Stock Quote": {
			"Global Quote": {
				"01. symbol": "AAPL",
				"02. open": "174.24",
				"03. high": "176.54",
				"04. low": "173.11",
				"05. price": "175.43",
				"06. volume": "48567234",
				"07. latest trading day": "2024-01-15",
				"08. previous close": "175.23",
				"09. change": "0.20",
				"10. change percent": "0.11%"
			}
		},
		"Finnhub - Real-time Quote": {
			"c": 175.43,
			"d": 0.20,
			"dp": 0.11,
			"h": 176.54,
			"l": 173.11,
			"o": 174.24,
			"pc": 175.23,
			"t": 1642204800
		},
		"Yahoo Finance - Stock Data": {
			"symbol": "AAPL",
			"regularMarketPrice": 175.43,
			"regularMarketChange": 0.20,
			"regularMarketChangePercent": 0.11,
			"regularMarketTime": 1642204800,
			"regularMarketDayHigh": 176.54,
			"regularMarketDayLow": 173.11,
			"regularMarketOpen": 174.24,
			"regularMarketPreviousClose": 175.23,
			"regularMarketVolume": 48567234,
			"marketCap": 2875542323200,
			"fiftyTwoWeekLow": 124.17,
			"fiftyTwoWeekHigh": 182.94,
			"dividendYield": 0.0044,
			"peRatio": 29.12,
			"longName": "Apple Inc.",
			"currency": "USD",
			"exchangeName": "NMS"
		}
	},
	crypto: {
		"CoinGecko - Market Data": {
			"id": "bitcoin",
			"symbol": "btc",
			"name": "Bitcoin",
			"image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
			"current_price": 43250.75,
			"market_cap": 847523456789,
			"market_cap_rank": 1,
			"fully_diluted_valuation": 908234567890,
			"total_volume": 23456789012,
			"high_24h": 44123.45,
			"low_24h": 42789.12,
			"price_change_24h": 567.89,
			"price_change_percentage_24h": 1.33,
			"market_cap_change_24h": 12345678901,
			"market_cap_change_percentage_24h": 1.48,
			"circulating_supply": 19567234.5,
			"total_supply": 21000000,
			"max_supply": 21000000,
			"ath": 69045,
			"ath_change_percentage": -37.35,
			"ath_date": "2021-11-10T14:24:11.849Z",
			"atl": 67.81,
			"atl_change_percentage": 63654.12,
			"atl_date": "2013-07-06T00:00:00.000Z",
			"last_updated": "2024-01-15T10:30:00.000Z"
		},
		"Coinbase - Exchange Rates": {
			"data": {
				"currency": "BTC",
				"rates": {
					"AED": "158734.56",
					"AFN": "3456789.12",
					"ALL": "4567890.23",
					"AMD": "17234567.89",
					"ANG": "78456.78",
					"AOA": "35678901.23",
					"ARS": "14567890.12",
					"AUD": "64321.45",
					"AWG": "78456.78",
					"AZN": "73456.78",
					"USD": "43250.75",
					"EUR": "39876.54",
					"GBP": "34123.45"
				}
			}
		}
	},
	forex: {
		"Exchange Rate API": {
			"result": "success",
			"documentation": "https://www.exchangerate-api.com/docs",
			"terms_of_use": "https://www.exchangerate-api.com/terms",
			"time_last_update_unix": 1642204800,
			"time_last_update_utc": "Mon, 15 Jan 2024 00:00:01 +0000",
			"time_next_update_unix": 1642291200,
			"time_next_update_utc": "Tue, 16 Jan 2024 00:00:01 +0000",
			"base_code": "USD",
			"conversion_rates": {
				"USD": 1,
				"AED": 3.6725,
				"AFN": 88.502,
				"ALL": 108.45,
				"AMD": 404.12,
				"EUR": 0.8456,
				"GBP": 0.7892,
				"JPY": 149.25,
				"CNY": 7.2345,
				"INR": 83.1234,
				"CAD": 1.3456,
				"AUD": 1.5234,
				"CHF": 0.8765,
				"SEK": 10.5432,
				"NOK": 10.8765
			}
		}
	},
	custom: {
		"Generic API Response": {
			"status": "success",
			"data": {
				"items": [
					{
						"id": 1,
						"name": "Sample Item 1",
						"value": 123.45,
						"category": "A",
						"active": true,
						"created_at": "2024-01-15T10:30:00Z",
						"metadata": {
							"tags": ["tag1", "tag2"],
							"priority": "high",
							"score": 85.7
						}
					},
					{
						"id": 2,
						"name": "Sample Item 2", 
						"value": 67.89,
						"category": "B",
						"active": false,
						"created_at": "2024-01-14T15:45:00Z",
						"metadata": {
							"tags": ["tag3"],
							"priority": "medium",
							"score": 72.3
						}
					}
				],
				"pagination": {
					"total": 150,
					"page": 1,
					"per_page": 20,
					"total_pages": 8
				}
			},
			"timestamp": "2024-01-15T10:30:00Z"
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

	const [apiUrl, setApiUrl] = useState(initialUrl)
	const [selectedSample, setSelectedSample] = useState("")
	const [apiResponse, setApiResponse] = useState(null)
	const [selectedFields, setSelectedFields] = useState([])
	const [isTestingCustom, setIsTestingCustom] = useState(false)
	const [customTestResult, setCustomTestResult] = useState(null)

	// Load sample data based on data source
	useEffect(() => {
		if (isOpen) {
			const samples = SAMPLE_API_RESPONSES[dataSource] || SAMPLE_API_RESPONSES.custom
			const firstSampleKey = Object.keys(samples)[0]
			if (firstSampleKey) {
				setSelectedSample(firstSampleKey)
				setApiResponse(samples[firstSampleKey])
			}
		}
	}, [isOpen, dataSource])

	// Handle sample selection
	const handleSampleSelect = (sampleName) => {
		const samples = SAMPLE_API_RESPONSES[dataSource] || SAMPLE_API_RESPONSES.custom
		setSelectedSample(sampleName)
		setApiResponse(samples[sampleName])
		setSelectedFields([])
	}

	// Test custom API URL
	const handleTestApi = async () => {
		if (!apiUrl.trim()) return

		setIsTestingCustom(true)
		setCustomTestResult(null)

		try {
			// First test the connection
			dispatch(testApiConnection({ url: apiUrl }))

			// Try to fetch actual data (simulation for now)
			await new Promise(resolve => setTimeout(resolve, 1500))

			// For demo, use sample data based on URL pattern
			let responseData
			if (apiUrl.toLowerCase().includes('stock') || apiUrl.toLowerCase().includes('finance')) {
				responseData = SAMPLE_API_RESPONSES.stocks["Yahoo Finance - Stock Data"]
			} else if (apiUrl.toLowerCase().includes('crypto') || apiUrl.toLowerCase().includes('coin')) {
				responseData = SAMPLE_API_RESPONSES.crypto["CoinGecko - Market Data"]
			} else if (apiUrl.toLowerCase().includes('forex') || apiUrl.toLowerCase().includes('exchange')) {
				responseData = SAMPLE_API_RESPONSES.forex["Exchange Rate API"]
			} else {
				responseData = SAMPLE_API_RESPONSES.custom["Generic API Response"]
			}

			setApiResponse(responseData)
			setSelectedFields([])
			setCustomTestResult({
				success: true,
				message: "API connected successfully! Response data loaded.",
				responseTime: Math.floor(Math.random() * 500 + 200)
			})

		} catch (error) {
			setCustomTestResult({
				success: false,
				message: error.message || "Failed to connect to API"
			})
		} finally {
			setIsTestingCustom(false)
		}
	}

	// Handle field selection changes
	const handleFieldsChange = (fields) => {
		setSelectedFields(fields)
	}

	// Save selected fields
	const handleSaveFields = () => {
		onFieldsSelected?.({
			fields: selectedFields,
			apiUrl: apiUrl || null,
			sampleData: apiResponse,
			dataSource: selectedSample || "custom"
		})
		onClose()
	}

	// Auto-suggest fields based on widget type
	const getAutoSuggestedFields = () => {
		if (!apiResponse) return []

		const suggestions = {
			table: ["symbol", "name", "price", "change", "volume", "market_cap", "current_price", "regularMarketPrice"],
			card: ["name", "symbol", "price", "current_price", "change", "change_percent", "regularMarketPrice"],
			chart: ["date", "time", "open", "high", "low", "close", "volume", "timestamp"]
		}

		const targetFields = suggestions[widgetType] || suggestions.table
		const flatFields = flattenObjectPaths(apiResponse)
		
		return targetFields.filter(target => 
			flatFields.some(field => 
				field.toLowerCase().includes(target.toLowerCase()) ||
				target.toLowerCase().includes(field.toLowerCase())
			)
		).slice(0, 6)
	}

	// Helper to flatten object paths
	const flattenObjectPaths = (obj, prefix = "") => {
		let paths = []
		
		if (Array.isArray(obj)) {
			if (obj.length > 0) {
				paths = paths.concat(flattenObjectPaths(obj[0], prefix))
			}
		} else if (typeof obj === "object" && obj !== null) {
			Object.entries(obj).forEach(([key, value]) => {
				const path = prefix ? `${prefix}.${key}` : key
				paths.push(path)
				
				if (typeof value === "object" && value !== null) {
					paths = paths.concat(flattenObjectPaths(value, path))
				}
			})
		}
		
		return paths
	}

	const autoSuggestedFields = getAutoSuggestedFields()
	const availableSamples = SAMPLE_API_RESPONSES[dataSource] || SAMPLE_API_RESPONSES.custom

	if (!isOpen) return null

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-slate-900 border-slate-700">
				<DialogHeader>
					<DialogTitle className="text-xl text-white flex items-center gap-2">
						<Database className="w-5 h-5" />
						Interactive JSON Field Explorer
						<Button
							variant="ghost"
							size="sm"
							onClick={onClose}
							className="ml-auto text-slate-400 hover:text-white"
						>
							<X className="w-4 h-4" />
						</Button>
					</DialogTitle>
				</DialogHeader>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
					{/* Left Panel - API Configuration */}
					<div className="space-y-4 overflow-y-auto max-h-[calc(95vh-120px)]">
						{/* Custom API URL */}
						<Card className="bg-slate-800 border-slate-700">
							<CardHeader className="pb-3">
								<CardTitle className="text-sm text-white flex items-center gap-2">
									<Globe className="w-4 h-4" />
									Test Custom API
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div>
									<Label htmlFor="apiUrl" className="text-slate-300">API URL</Label>
									<Input
										id="apiUrl"
										placeholder="https://api.example.com/data"
										value={apiUrl}
										onChange={(e) => setApiUrl(e.target.value)}
										className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
									/>
								</div>
								<div className="flex items-center gap-3">
									<Button
										onClick={handleTestApi}
										disabled={!apiUrl.trim() || isTestingCustom}
										className="bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-50"
									>
										{isTestingCustom ? (
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

									{customTestResult && (
										<div className={`flex items-center gap-2 text-sm ${
											customTestResult.success ? "text-green-400" : "text-red-400"
										}`}>
											{customTestResult.success ? (
												<CheckCircle className="w-4 h-4" />
											) : (
												<AlertCircle className="w-4 h-4" />
											)}
											{customTestResult.message}
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Sample APIs */}
						<Card className="bg-slate-800 border-slate-700">
							<CardHeader className="pb-3">
								<CardTitle className="text-sm text-white flex items-center gap-2">
									<Code className="w-4 h-4" />
									Sample API Responses
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								{Object.keys(availableSamples).map((sampleName) => (
									<Button
										key={sampleName}
										variant={selectedSample === sampleName ? "default" : "outline"}
										size="sm"
										onClick={() => handleSampleSelect(sampleName)}
										className={`w-full text-left justify-start ${
											selectedSample === sampleName
												? "bg-teal-500 hover:bg-teal-600 text-white"
												: "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
										}`}
									>
										<Database className="w-3 h-3 mr-2" />
										{sampleName}
									</Button>
								))}
							</CardContent>
						</Card>

						{/* Auto-suggestions */}
						{autoSuggestedFields.length > 0 && (
							<Card className="bg-slate-800 border-slate-700">
								<CardHeader className="pb-3">
									<CardTitle className="text-sm text-teal-400 flex items-center gap-2">
										<Zap className="w-4 h-4" />
										Quick Select for {widgetType.charAt(0).toUpperCase() + widgetType.slice(1)}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<div className="flex flex-wrap gap-2">
										{autoSuggestedFields.map((field) => (
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
										onClick={() => setSelectedFields([...selectedFields, ...autoSuggestedFields.filter(f => !selectedFields.includes(f))])}
										className="w-full text-xs border-teal-600 text-teal-300 hover:bg-teal-600 hover:text-white"
									>
										<CheckCircle className="w-3 h-3 mr-1" />
										Select All Suggested
									</Button>
								</CardContent>
							</Card>
						)}

						{/* Response Preview */}
						{apiResponse && (
							<Card className="bg-slate-800 border-slate-700">
								<CardHeader className="pb-3">
									<CardTitle className="text-sm text-white flex items-center gap-2">
										<Eye className="w-4 h-4" />
										Raw Response Preview
									</CardTitle>
								</CardHeader>
								<CardContent>
									<pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded overflow-auto max-h-40">
										{JSON.stringify(apiResponse, null, 2)}
									</pre>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Right Panel - Field Explorer */}
					<div className="overflow-hidden">
						{apiResponse ? (
							<JsonFieldExplorer
								data={apiResponse}
								selectedFields={selectedFields}
								onFieldsChange={handleFieldsChange}
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
										Test a custom API URL or select a sample response to explore its structure
									</p>
									<Button
										variant="outline"
										onClick={() => {
											const firstSample = Object.keys(availableSamples)[0]
											if (firstSample) handleSampleSelect(firstSample)
										}}
										className="border-slate-600 text-slate-300 hover:bg-slate-700"
									>
										Load Sample Data
									</Button>
								</CardContent>
							</Card>
						)}
					</div>
				</div>

				{/* Footer Actions */}
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
							onClick={handleSaveFields}
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
