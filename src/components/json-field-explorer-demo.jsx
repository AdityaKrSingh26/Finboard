"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import JsonFieldExplorer from "@/components/ui/json-field-explorer"
import ApiResponseExplorer from "@/components/modals/api-response-explorer"
import { 
	Database, 
	Zap, 
	Eye, 
	Code,
	Settings,
	Play
} from "lucide-react"

// Sample API responses for demonstration
const SAMPLE_DATA = {
	"Stock API Response": {
		"Meta Data": {
			"1. Information": "Daily Prices (open, high, low, close) and Volumes",
			"2. Symbol": "AAPL",
			"3. Last Refreshed": "2024-01-15",
			"4. Output Size": "Compact",
			"5. Time Zone": "US/Eastern"
		},
		"Time Series (Daily)": {
			"2024-01-15": {
				"1. open": "174.24",
				"2. high": "176.54",
				"3. low": "173.11",
				"4. close": "175.43",
				"5. volume": "48567234"
			},
			"2024-01-14": {
				"1. open": "172.15",
				"2. high": "175.23",
				"3. low": "171.89",
				"4. close": "174.24",
				"5. volume": "52344567"
			}
		}
	},
	"Crypto API Response": {
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
	"Complex Nested API": {
		"status": "success",
		"data": {
			"companies": [
				{
					"id": 1,
					"name": "Apple Inc.",
					"ticker": "AAPL",
					"sector": "Technology",
					"market_data": {
						"price": 175.43,
						"change": 0.20,
						"change_percent": 0.11,
						"volume": 48567234,
						"market_cap": 2875542323200,
						"pe_ratio": 29.12
					},
					"fundamentals": {
						"revenue": 383933000000,
						"net_income": 99803000000,
						"debt_to_equity": 2.05,
						"roe": 0.175,
						"dividend_yield": 0.0044
					},
					"metadata": {
						"exchange": "NASDAQ",
						"currency": "USD",
						"country": "US",
						"employees": 164000,
						"founded": "1976-04-01",
						"website": "https://www.apple.com"
					}
				}
			],
			"pagination": {
				"page": 1,
				"per_page": 20,
				"total": 500,
				"total_pages": 25
			}
		},
		"timestamp": "2024-01-15T10:30:00.000Z",
		"api_version": "v2.1"
	}
}

export default function JsonFieldExplorerDemo() {
	const [selectedSample, setSelectedSample] = useState("Stock API Response")
	const [selectedFields, setSelectedFields] = useState([])
	const [showApiExplorer, setShowApiExplorer] = useState(false)
	const [explorerResult, setExplorerResult] = useState(null)

	const currentData = SAMPLE_DATA[selectedSample]

	const handleFieldsChange = (fields) => {
		setSelectedFields(fields)
	}

	const handleApiExplorerResult = (result) => {
		setExplorerResult(result)
		setShowApiExplorer(false)
	}

	return (
		<div className="min-h-screen bg-slate-900 p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="text-center">
					<h1 className="text-3xl font-bold text-white mb-2">
						Interactive JSON Field Explorer Demo
					</h1>
					<p className="text-slate-400">
						Explore API responses and dynamically select fields for your widgets
					</p>
				</div>

				{/* Controls */}
				<Card className="bg-slate-800 border-slate-700">
					<CardHeader>
						<CardTitle className="text-white flex items-center gap-2">
							<Settings className="w-5 h-5" />
							Demo Controls
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-4">
							<label className="text-slate-300 text-sm font-medium">
								Sample Data:
							</label>
							<select
								value={selectedSample}
								onChange={(e) => {
									setSelectedSample(e.target.value)
									setSelectedFields([])
								}}
								className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
							>
								{Object.keys(SAMPLE_DATA).map(key => (
									<option key={key} value={key}>{key}</option>
								))}
							</select>
							<Button
								onClick={() => setShowApiExplorer(true)}
								className="bg-teal-500 hover:bg-teal-600 text-white"
							>
								<Zap className="w-4 h-4 mr-2" />
								Open Full API Explorer
							</Button>
						</div>

						{selectedFields.length > 0 && (
							<div className="p-3 bg-slate-700 rounded border border-slate-600">
								<div className="text-sm text-green-400 mb-2">
									✓ Selected Fields ({selectedFields.length}):
								</div>
								<div className="flex flex-wrap gap-2">
									{selectedFields.map((field, index) => (
										<span
											key={index}
											className="px-2 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded text-xs font-mono"
										>
											{field}
										</span>
									))}
								</div>
							</div>
						)}

						{explorerResult && (
							<div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
								<div className="text-sm text-blue-400 mb-2">
									🚀 API Explorer Result:
								</div>
								<div className="text-xs text-slate-300">
									<div>Fields selected: {explorerResult.fields?.length || 0}</div>
									<div>API URL: {explorerResult.apiUrl || "Sample data"}</div>
									<div>Data source: {explorerResult.dataSource}</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Main Demo */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Left: JSON Field Explorer */}
					<Card className="bg-slate-800 border-slate-700">
						<CardHeader>
							<CardTitle className="text-white flex items-center gap-2">
								<Database className="w-5 h-5" />
								JSON Field Explorer
							</CardTitle>
						</CardHeader>
						<CardContent>
							<JsonFieldExplorer
								data={currentData}
								selectedFields={selectedFields}
								onFieldsChange={handleFieldsChange}
								maxHeight="600px"
								showPreview={true}
								enableSearch={true}
								enableFilters={true}
							/>
						</CardContent>
					</Card>

					{/* Right: Raw Data & Results */}
					<div className="space-y-6">
						{/* Raw JSON Preview */}
						<Card className="bg-slate-800 border-slate-700">
							<CardHeader>
								<CardTitle className="text-white flex items-center gap-2">
									<Code className="w-5 h-5" />
									Raw JSON Data
								</CardTitle>
							</CardHeader>
							<CardContent>
								<pre className="text-xs text-slate-300 bg-slate-900 p-3 rounded overflow-auto max-h-80">
									{JSON.stringify(currentData, null, 2)}
								</pre>
							</CardContent>
						</Card>

						{/* Selected Fields Preview */}
						{selectedFields.length > 0 && (
							<Card className="bg-slate-800 border-slate-700">
								<CardHeader>
									<CardTitle className="text-white flex items-center gap-2">
										<Eye className="w-5 h-5" />
										Widget Configuration Preview
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="text-sm text-slate-300">
											<strong>Widget Type:</strong> Table
										</div>
										<div className="text-sm text-slate-300">
											<strong>Selected Fields:</strong>
										</div>
										<div className="bg-slate-900 p-3 rounded">
											<pre className="text-xs text-green-400">
{JSON.stringify({
	displayFields: selectedFields,
	columns: selectedFields.map((field, index) => ({
		key: field,
		label: field.split('.').pop().replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
		width: `${Math.floor(100 / selectedFields.length)}%`,
		type: "text"
	}))
}, null, 2)}
											</pre>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Usage Instructions */}
						<Card className="bg-slate-800 border-slate-700">
							<CardHeader>
								<CardTitle className="text-white flex items-center gap-2">
									<Play className="w-5 h-5" />
									How to Use
								</CardTitle>
							</CardHeader>
							<CardContent className="text-sm text-slate-300 space-y-2">
								<div>1. <strong>Explore Structure:</strong> Expand/collapse JSON tree nodes</div>
								<div>2. <strong>Search Fields:</strong> Use the search box to find specific fields</div>
								<div>3. <strong>Select Fields:</strong> Check boxes next to fields you want to include</div>
								<div>4. <strong>Smart Suggestions:</strong> Use auto-suggestions for common widget types</div>
								<div>5. <strong>Preview:</strong> See how your selection will be used in widgets</div>
								<div>6. <strong>Full Explorer:</strong> Click "Open Full API Explorer" for advanced features</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			{/* Full API Explorer Modal */}
			<ApiResponseExplorer
				isOpen={showApiExplorer}
				onClose={() => setShowApiExplorer(false)}
				onFieldsSelected={handleApiExplorerResult}
				dataSource="custom"
				widgetType="table"
			/>
		</div>
	)
}
