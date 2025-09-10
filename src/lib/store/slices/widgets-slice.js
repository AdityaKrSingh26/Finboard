import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { fetchData, testApiConnection } from "@/lib/data-service"
import { getOptimizedConfig } from "@/lib/widget-configs"

// Async thunk for fetching widget data
export const fetchWidgetData = createAsyncThunk(
	"widgets/fetchData",
	async ({ widgetId, config }, { rejectWithValue }) => {
		try {
			const data = await fetchData(config.dataSource, config)
			return { widgetId, data }
		} catch (error) {
			// Only log errors, not every successful fetch
			console.error(`❌ fetchWidgetData error for widget ${widgetId}:`, error.message)
			return rejectWithValue({ widgetId, error: error.message })
		}
	},
)

// Async thunk for testing API connections
export const testApiConnectionThunk = createAsyncThunk(
	"widgets/testApi",
	async ({ url }, { rejectWithValue }) => {
		try {
			const result = await testApiConnection(url)
			return result
		} catch (error) {
			return rejectWithValue(error.message)
		}
	},
)

const initialState = {
	widgets: [
		{
			id: "widget-1",
			type: "table",
			title: "Live Stock Quotes",
			config: {
				dataSource: "stocks",
				displayFields: ["symbol", "c", "d", "dp", "h", "l", "o"],
				columns: [
					{ key: "symbol", label: "Symbol", width: "15%", type: "text" },
					{ key: "c", label: "Current Price", width: "15%", type: "currency" },
					{ key: "d", label: "Change", width: "15%", type: "number" },
					{ key: "dp", label: "Change %", width: "15%", type: "percentage" },
					{ key: "h", label: "High", width: "15%", type: "currency" },
					{ key: "l", label: "Low", width: "15%", type: "currency" },
					{ key: "o", label: "Open", width: "10%", type: "currency" }
				],
				sortBy: "dp",
				sortOrder: "desc",
				refreshInterval: 30,
				itemsPerPage: 20,
				symbols: ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA", "AMZN", "META", "NFLX", "AMD", "CRM"]
			},
			position: { x: 0, y: 0 },
			size: { width: 12, height: 6 },
			data: null,
			loading: false,
			error: null,
			lastUpdated: null,
		},
		{
			id: "widget-2",
			type: "table",
			title: "Company Profiles",
			config: {
				dataSource: "stocks",
				displayFields: ["ticker", "name", "marketCapitalization", "shareOutstanding", "country", "exchange"],
				columns: [
					{ key: "ticker", label: "Symbol", width: "12%", type: "text" },
					{ key: "name", label: "Company Name", width: "30%", type: "text" },
					{ key: "marketCapitalization", label: "Market Cap", width: "18%", type: "currency" },
					{ key: "shareOutstanding", label: "Shares", width: "15%", type: "number" },
					{ key: "country", label: "Country", width: "12%", type: "text" },
					{ key: "exchange", label: "Exchange", width: "13%", type: "text" }
				],
				sortBy: "marketCapitalization",
				sortOrder: "desc",
				refreshInterval: 300,
				itemsPerPage: 15,
				symbols: ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA"],
				includeProfile: true
			},
			position: { x: 0, y: 6 },
			size: { width: 12, height: 5 },
			data: null,
			loading: false,
			error: null,
			lastUpdated: null,
		},
		{
			id: "widget-3",
			type: "card",
			title: "Market Summary",
			config: {
				dataSource: "market_summary",
				displayFields: ["gainers", "losers", "watchlist"],
				refreshInterval: 60,
				cardType: "summary",
			},
			position: { x: 0, y: 11 },
			size: { width: 6, height: 4 },
			data: null,
			loading: false,
			error: null,
			lastUpdated: null,
		},
		{
			id: "widget-4",
			type: "chart",
			title: "AAPL Price Chart",
			config: {
				dataSource: "chart_data",
				displayFields: ["date", "open", "high", "low", "close", "volume"],
				refreshInterval: 60,
				chartType: "line",
				timeframe: "daily",
				symbol: "AAPL"
			},
			position: { x: 6, y: 11 },
			size: { width: 6, height: 4 },
			data: null,
			loading: false,
			error: null,
			lastUpdated: null,
		},
	],
	loading: false,
	error: null,
	apiTestResult: null,
	apiTesting: false,
}

const widgetsSlice = createSlice({
	name: "widgets",
	initialState,
	reducers: {
		hydrate: (state, action) => {
			// Hydrate state from localStorage
			if (action.payload && action.payload.widgets) {
				state.widgets = action.payload.widgets
			}
			if (action.payload && action.payload.loading !== undefined) {
				state.loading = action.payload.loading
			}
			if (action.payload && action.payload.error) {
				state.error = action.payload.error
			}
		},
		addWidget: (state, action) => {
			const newWidget = {
				id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				position: { x: 0, y: 0 },
				size: { width: 6, height: 4 },
				data: null,
				loading: false,
				error: null,
				lastUpdated: null,
				config: {
					refreshInterval: 30,
					displayFields: [],
					...action.payload.config,
				},
				...action.payload,
			}
			state.widgets.push(newWidget)
		},

		removeWidget: (state, action) => {
			state.widgets = state.widgets.filter((widget) => widget.id !== action.payload)
		},

		updateWidget: (state, action) => {
			const { id, updates } = action.payload

			const widget = state.widgets.find((w) => w.id === id)
			if (widget) {
				Object.assign(widget, updates)

				// Reset data when config changes to force refresh
				if (updates.config) {
					widget.data = null
					widget.lastUpdated = null
					console.log("Widget settings updated successfully for:", id)
				}
			} else {
				console.warn("Widget not found for update:", id)
			}
		},

		updateWidgetConfig: (state, action) => {
			const { id, config } = action.payload
			const widget = state.widgets.find((w) => w.id === id)
			if (widget) {
				widget.config = { ...widget.config, ...config }
				// Reset data to force refresh with new config
				widget.data = null
				widget.lastUpdated = null
			}
		},

		updateWidgetPosition: (state, action) => {
			const { id, position } = action.payload
			const widget = state.widgets.find((w) => w.id === id)
			if (widget) {
				widget.position = position
			}
		},

		updateWidgetSize: (state, action) => {
			const { id, size } = action.payload
			const widget = state.widgets.find((w) => w.id === id)
			if (widget) {
				widget.size = size
			}
		},

		reorderWidgets: (state, action) => {
			state.widgets = action.payload
		},

		setWidgetLoading: (state, action) => {
			const { widgetId, loading } = action.payload
			const widget = state.widgets.find((w) => w.id === widgetId)
			if (widget) {
				widget.loading = loading
				if (loading) {
					widget.error = null
				}
			}
		},

		clearWidgetError: (state, action) => {
			const widget = state.widgets.find((w) => w.id === action.payload)
			if (widget) {
				widget.error = null
			}
		},

		duplicateWidget: (state, action) => {
			const originalWidget = state.widgets.find((w) => w.id === action.payload)
			if (originalWidget) {
				const duplicatedWidget = {
					...originalWidget,
					id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					title: `${originalWidget.title} (Copy)`,
					position: {
						x: originalWidget.position.x + 1,
						y: originalWidget.position.y + 1,
					},
					data: null, // Don't copy data, let it refresh
					lastUpdated: null,
				}
				state.widgets.push(duplicatedWidget)
			}
		},

		bulkUpdateWidgets: (state, action) => {
			const updates = action.payload
			updates.forEach(update => {
				const widget = state.widgets.find(w => w.id === update.id)
				if (widget) {
					Object.assign(widget, update.changes)
				}
			})
		},

		resetAllWidgetData: (state) => {
			state.widgets.forEach(widget => {
				widget.data = null
				widget.lastUpdated = null
				widget.error = null
			})
		},

		clearApiTestResult: (state) => {
			state.apiTestResult = null
		},

		// Add multiple widgets from template
		addWidgetsFromTemplate: (state, action) => {
			const { widgets: templateWidgets, clearExisting = false } = action.payload
			
			// Clear existing widgets if requested
			if (clearExisting) {
				state.widgets = []
			}

			// Add template widgets with proper initial state
			const newWidgets = templateWidgets.map((widget, index) => ({
				id: `widget-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
				position: { x: 0, y: state.widgets.length + index },
				size: { 
					width: widget.type === 'chart' ? 6 : 12, 
					height: widget.type === 'card' ? 4 : 6 
				},
				data: null,
				loading: false, // Start as not loading to prevent immediate fetch
				error: null,
				lastUpdated: null,
				config: {
					refreshInterval: 60, // Default to 60 seconds for templates
					displayFields: [],
					...widget.config,
				},
				...widget,
			}))

			state.widgets.push(...newWidgets)
		},
	},

	extraReducers: (builder) => {
		builder
			.addCase(fetchWidgetData.pending, (state, action) => {
				const { widgetId } = action.meta.arg
				const widget = state.widgets.find((w) => w.id === widgetId)
				if (widget) {
					widget.loading = true
					widget.error = null
				}
			})
			.addCase(fetchWidgetData.fulfilled, (state, action) => {
				const { widgetId, data } = action.payload
				const widget = state.widgets.find((w) => w.id === widgetId)
				if (widget) {
					widget.loading = false
					widget.data = data
					widget.lastUpdated = new Date().toISOString()
					widget.error = null
				}
			})
			.addCase(fetchWidgetData.rejected, (state, action) => {
				const { widgetId, error } = action.payload || {}
				const widget = state.widgets.find((w) => w.id === widgetId)
				if (widget) {
					widget.loading = false
					widget.error = error || "Failed to fetch data"
				}
			})
			.addCase(testApiConnectionThunk.pending, (state) => {
				state.apiTesting = true
				state.apiTestResult = null
			})
			.addCase(testApiConnectionThunk.fulfilled, (state, action) => {
				state.apiTesting = false
				state.apiTestResult = action.payload
			})
			.addCase(testApiConnectionThunk.rejected, (state, action) => {
				state.apiTesting = false
				state.apiTestResult = {
					success: false,
					error: action.payload,
				}
			})
	},
})

export const {
	hydrate,
	addWidget,
	removeWidget,
	updateWidget,
	updateWidgetConfig,
	updateWidgetPosition,
	updateWidgetSize,
	reorderWidgets,
	setWidgetLoading,
	clearWidgetError,
	duplicateWidget,
	bulkUpdateWidgets,
	resetAllWidgetData,
	clearApiTestResult,
	addWidgetsFromTemplate,
} = widgetsSlice.actions

// Enhanced Selectors
export const selectAllWidgets = (state) => state.widgets.widgets
export const selectWidgetById = (state, widgetId) =>
	state.widgets.widgets.find((w) => w.id === widgetId)
export const selectWidgetsByType = (state, type) =>
	state.widgets.widgets.filter((w) => w.type === type)
export const selectWidgetsLoading = (state) =>
	state.widgets.widgets.some((w) => w.loading)
export const selectWidgetsWithErrors = (state) =>
	state.widgets.widgets.filter((w) => w.error)
export const selectWidgetCount = (state) => state.widgets.widgets.length
export const selectApiTestResult = (state) => state.widgets.apiTestResult
export const selectApiTesting = (state) => state.widgets.apiTesting

// Advanced selectors
export const selectWidgetsByDataSource = (state, dataSource) =>
	state.widgets.widgets.filter((w) => w.config.dataSource === dataSource)

export const selectOutdatedWidgets = (state, thresholdMinutes = 5) => {
	const threshold = Date.now() - (thresholdMinutes * 60 * 1000)
	return state.widgets.widgets.filter((w) => {
		if (!w.lastUpdated) return true
		return new Date(w.lastUpdated).getTime() < threshold
	})
}

export const selectWidgetStats = (state) => {
	const widgets = state.widgets.widgets
	return {
		total: widgets.length,
		loading: widgets.filter(w => w.loading).length,
		errors: widgets.filter(w => w.error).length,
		byType: widgets.reduce((acc, w) => {
			acc[w.type] = (acc[w.type] || 0) + 1
			return acc
		}, {}),
		lastUpdated: widgets
			.filter(w => w.lastUpdated)
			.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))[0]?.lastUpdated,
	}
}

export default widgetsSlice.reducer
