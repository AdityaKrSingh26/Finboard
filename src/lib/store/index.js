import { configureStore, combineReducers } from "@reduxjs/toolkit"
import widgetsReducer from "./slices/widgets-slice"
import layoutReducer from "./slices/layout-slice"
import settingsReducer from "./slices/settings-slice"
import { StorageService } from "../storage-service"

// Enhanced localStorage middleware with error handling and debouncing
const localStorageMiddleware = (store) => {
	let saveTimeout = null

	return (next) => (action) => {
		const result = next(action)

		// Debounce saves to avoid excessive writes
		if (typeof window !== "undefined") {
			clearTimeout(saveTimeout)
			saveTimeout = setTimeout(() => {
				try {
					const state = store.getState()

					// Use StorageService for better persistence management
					StorageService.saveWidgets(state.widgets.widgets || [])
					StorageService.saveSettings(state.settings || {})
					StorageService.saveLayout(state.layout || {})

					// Only log important save events
					if (action.type.includes('updateWidget') || action.type.includes('addWidget') || action.type.includes('removeWidget')) {
						console.log("Widget changes saved to localStorage")
					}
				} catch (error) {
					console.warn("Failed to save state to localStorage:", error)
				}
			}, 1000) // 1 second debounce
		}

		return result
	}
}

// Load state from enhanced storage service
const loadStateFromStorage = () => {
	if (typeof window === "undefined") return {}

	try {
		return {
			widgets: {
				widgets: StorageService.loadWidgets([]),
				loading: false,
				error: null,
				apiTestResult: null,
				apiTesting: false,
			},
			settings: StorageService.loadSettings({
				theme: "dark",
				autoRefresh: true,
				globalRefreshInterval: 30000,
				notifications: {
					enabled: true,
					priceAlerts: true,
					systemAlerts: true,
					sound: false,
				},
				display: {
					showLastUpdated: true,
					showLoadingIndicators: true,
					animateTransitions: true,
					compactView: false,
				},
				api: {
					timeout: 10000,
					retryAttempts: 3,
					cacheEnabled: true,
				},
				export: {
					format: "json",
				},
				dashboard: {
					title: "Finance Dashboard",
					subtitle: "Real-time financial data",
					showWelcomeMessage: true,
				},
			}),
			layout: StorageService.loadLayout({
				dragging: false,
				gridSize: 12,
				rowHeight: 100,
				margin: [16, 16],
			}),
		}
	} catch (error) {
		console.warn("Failed to load state from localStorage:", error)
		return {}
	}
}

const rootReducer = combineReducers({
	widgets: widgetsReducer,
	layout: layoutReducer,
	settings: settingsReducer,
})

// Create store with proper initial state
const persistedState = loadStateFromStorage()

export const store = configureStore({
	reducer: rootReducer,
	preloadedState: persistedState, // Use persisted state as initial state
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {},
		}).concat(localStorageMiddleware), // Add enhanced persistence middleware
	devTools: process.env.NODE_ENV !== "production",
})
