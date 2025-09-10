import { createSlice } from "@reduxjs/toolkit"

const initialState = {
	theme: "dark",
	autoRefresh: true,
	globalRefreshInterval: 30000, // 30 seconds
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
		timeout: 10000, // 10 seconds
		retryAttempts: 3,
		cacheEnabled: true,
		cacheDuration: 30000, // 30 seconds
	},
	export: {
		includeData: false,
		includeSettings: true,
		format: "json", // json, csv
	},
	dashboard: {
		title: "Finance Dashboard",
		subtitle: "Real-time financial data",
		showWelcomeMessage: true,
	},
}

const settingsSlice = createSlice({
	name: "settings",
	initialState,
	reducers: {
		hydrate: (state, action) => {
			// Hydrate state from localStorage
			if (action.payload) {
				Object.assign(state, action.payload)
			}
		},
		updateTheme: (state, action) => {
			state.theme = action.payload
		},

		toggleAutoRefresh: (state) => {
			state.autoRefresh = !state.autoRefresh
		},

		setGlobalRefreshInterval: (state, action) => {
			state.globalRefreshInterval = action.payload
		},

		updateNotificationSettings: (state, action) => {
			state.notifications = { ...state.notifications, ...action.payload }
		},

		updateDisplaySettings: (state, action) => {
			state.display = { ...state.display, ...action.payload }
		},

		updateApiSettings: (state, action) => {
			state.api = { ...state.api, ...action.payload }
		},

		updateExportSettings: (state, action) => {
			state.export = { ...state.export, ...action.payload }
		},

		updateDashboardSettings: (state, action) => {
			state.dashboard = { ...state.dashboard, ...action.payload }
		},

		resetSettings: (state) => {
			return initialState
		},

		importSettings: (state, action) => {
			return { ...state, ...action.payload }
		},
	},
})

export const {
	hydrate,
	updateTheme,
	toggleAutoRefresh,
	setGlobalRefreshInterval,
	updateNotificationSettings,
	updateDisplaySettings,
	updateApiSettings,
	updateExportSettings,
	updateDashboardSettings,
	resetSettings,
	importSettings,
} = settingsSlice.actions

// Selectors
export const selectTheme = (state) => state.settings.theme
export const selectAutoRefresh = (state) => state.settings.autoRefresh
export const selectGlobalRefreshInterval = (state) => state.settings.globalRefreshInterval
export const selectNotificationSettings = (state) => state.settings.notifications
export const selectDisplaySettings = (state) => state.settings.display
export const selectApiSettings = (state) => state.settings.api
export const selectDashboardSettings = (state) => state.settings.dashboard

export default settingsSlice.reducer
