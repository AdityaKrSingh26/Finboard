"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataService } from "@/lib/data-service"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function APIStatusDebug() {
	const [apiStatus, setApiStatus] = useState(null)
	const [loading, setLoading] = useState(false)

	const checkAPIStatus = async () => {
		setLoading(true)
		try {
			const status = await DataService.getAPIHealthStatus()
			setApiStatus(status)
		} catch (error) {
			console.error("Failed to check API status:", error)
			setApiStatus({ error: error.message })
		} finally {
			setLoading(false)
		}
	}

	const testAPI = async (apiName) => {
		setLoading(true)
		try {
			let result
			console.log(`🧪 Testing ${apiName} API...`)
			
			switch (apiName) {
				case 'stocks':
					result = await DataService.fetchData('stocks', { symbols: ['AAPL'], limit: 1 })
					break
				case 'crypto':
					result = await DataService.fetchData('crypto', { limit: 3 })
					break
				case 'forex':
					result = await DataService.fetchData('forex', { pair: 'EUR/USD' })
					break
				case 'ping_coingecko':
					// Special test for CoinGecko connectivity
					const { coinGeckoClient } = await import('@/lib/api/coingecko-client')
					result = await coinGeckoClient.ping()
					break
				default:
					result = await DataService.fetchData(apiName, { limit: 3 })
			}
			console.log(`✅ ${apiName} test result:`, result)
			alert(`${apiName} test successful! Check console for details.`)
		} catch (error) {
			console.error(`❌ ${apiName} test failed:`, error)
			alert(`${apiName} test failed: ${error.message}`)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		checkAPIStatus()
	}, [])

	const getStatusIcon = (status) => {
		switch (status) {
			case 'healthy':
				return <CheckCircle className="w-4 h-4 text-green-500" />
			case 'error':
				return <XCircle className="w-4 h-4 text-red-500" />
			default:
				return <AlertCircle className="w-4 h-4 text-yellow-500" />
		}
	}

	return (
		<Card className="w-full max-w-4xl bg-slate-800 border-slate-700">
			<CardHeader>
				<CardTitle className="text-white flex items-center gap-2">
					Real-Time API Status & Debug Panel
					<Button 
						onClick={checkAPIStatus} 
						disabled={loading} 
						variant="outline" 
						size="sm"
						className="ml-auto"
					>
						{loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
						Refresh
					</Button>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* API Status */}
				{apiStatus && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{Object.entries(apiStatus).map(([api, status]) => (
							<div key={api} className="p-4 bg-slate-700 rounded-lg">
								<div className="flex items-center justify-between mb-2">
									<h4 className="text-white font-medium capitalize">{api.replace('_', ' ')}</h4>
									{getStatusIcon(status.status)}
								</div>
								<Badge variant={status.status === 'healthy' ? 'success' : 'destructive'}>
									{status.status}
								</Badge>
								{status.response_time && (
									<p className="text-slate-400 text-xs mt-1">
										{status.response_time}ms
									</p>
								)}
								{status.error && (
									<p className="text-red-400 text-xs mt-1">{status.error}</p>
								)}
							</div>
						))}
					</div>
				)}

				{/* Test Buttons */}
				<div className="grid grid-cols-2 md:grid-cols-5 gap-2">
					<Button onClick={() => testAPI('stocks')} variant="outline" size="sm" disabled={loading}>
						Test Stocks
					</Button>
					<Button onClick={() => testAPI('crypto')} variant="outline" size="sm" disabled={loading}>
						Test Crypto
					</Button>
					<Button onClick={() => testAPI('forex')} variant="outline" size="sm" disabled={loading}>
						Test Forex
					</Button>
					<Button onClick={() => testAPI('market_summary')} variant="outline" size="sm" disabled={loading}>
						Test Market
					</Button>
					<Button onClick={() => testAPI('ping_coingecko')} variant="outline" size="sm" disabled={loading}>
						Ping CoinGecko
					</Button>
				</div>

				{/* Environment Info */}
				<div className="p-4 bg-slate-700 rounded-lg">
					<h4 className="text-white font-medium mb-2">Environment</h4>
					<div className="grid grid-cols-2 gap-2 text-sm">
						<div>
							<span className="text-slate-400">Alpha Vantage Key:</span>
							<span className="text-white ml-2">
								{process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY ? '✓ Set' : '✗ Missing'}
							</span>
						</div>
						<div>
							<span className="text-slate-400">Finnhub Key:</span>
							<span className="text-white ml-2">
								{process.env.NEXT_PUBLIC_FINNHUB_API_KEY ? '✓ Set' : '✗ Missing'}
							</span>
						</div>
						<div>
							<span className="text-slate-400">CoinGecko Key:</span>
							<span className="text-white ml-2">
								{process.env.NEXT_PUBLIC_COINGECKO_API_KEY ? '✓ Set' : '✗ Missing'}
							</span>
						</div>
						<div>
							<span className="text-slate-400">Exchange Rate Key:</span>
							<span className="text-white ml-2">
								{process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY ? '✓ Set' : '✗ Missing'}
							</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
