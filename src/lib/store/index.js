import { configureStore, combineReducers } from "@reduxjs/toolkit"
import widgetsReducer from "./slices/widgets-slice"
import layoutReducer from "./slices/layout-slice"
import settingsReducer from "./slices/settings-slice"
import { saveWidgets, saveSettings, saveLayout, loadWidgets, loadSettings, loadLayout } from "../storage-service"

// Simple localStorage middleware
const localStorageMiddleware = (store) => {
	let saveTimeout = null

	return (next) => (action) => {
		const result = next(action)

		// Save with simple delay to avoid too many writes
		if (typeof window !== "undefined") {
			clearTimeout(saveTimeout)
			saveTimeout = setTimeout(() => {
				try {
					const state = store.getState()

					// Save using storage functions
					saveWidgets(state.widgets.widgets || [])
					saveSettings(state.settings || {})
					saveLayout(state.layout || {})

					// Log important save events
					if (action.type.includes('updateWidget') || action.type.includes('addWidget') || action.type.includes('removeWidget')) {
						console.log("Widget changes saved to localStorage")
					}
				} catch (error) {
					console.warn("Failed to save state to localStorage:", error)
				}
			}, 1000) // 1 second delay
		}

		return result
	}
}

// Load state from storage
const loadStateFromStorage = () => {
	if (typeof window === "undefined") return {}

	try {
		return {
			widgets: {
				widgets: loadWidgets([]),
				loading: false,
				error: null,
				apiTestResult: null,
				apiTesting: false,
			},
			settings: loadSettings({
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
			layout: loadLayout({
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
