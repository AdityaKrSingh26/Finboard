// Simple storage for saving dashboard data
// Storage keys for different data types
export const STORAGE_KEYS = {
	WIDGETS: 'finboard_widgets',
	SETTINGS: 'finboard_settings',
	LAYOUT: 'finboard_layout',
	API_CACHE: 'finboard_api_cache',
	USER_PREFERENCES: 'finboard_user_preferences',
}

// Check if localStorage works
export function isStorageAvailable() {
	try {
		const test = 'test'
		localStorage.setItem(test, test)
		localStorage.removeItem(test)
		return true
	} catch (error) {
		console.warn('localStorage not available:', error)
		return false
	}
}

// Save data to localStorage
export function save(key, data) {
	if (!isStorageAvailable()) return false

	try {
		const dataToSave = JSON.stringify({
			data: data,
			timestamp: Date.now(),
			version: '1.0',
		})
		localStorage.setItem(key, dataToSave)
		return true
	} catch (error) {
		console.error('Failed to save ' + key + ':', error)
		return false
	}
}

// Load data from localStorage
export function load(key, defaultValue = null) {
	if (!isStorageAvailable()) return defaultValue

	try {
		const savedData = localStorage.getItem(key)
		if (!savedData) return defaultValue

		const parsedData = JSON.parse(savedData)

		// Check if data is too old (30 days)
		const MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
		if (parsedData.timestamp && Date.now() - parsedData.timestamp > MAX_AGE) {
			localStorage.removeItem(key)
			return defaultValue
		}

		return parsedData.data
	} catch (error) {
		console.error('Failed to load ' + key + ':', error)
		localStorage.removeItem(key)
		return defaultValue
	}
}

// Remove data from localStorage
export function remove(key) {
	if (!isStorageAvailable()) return false

	try {
		localStorage.removeItem(key)
		return true
	} catch (error) {
		console.error('Failed to remove ' + key + ':', error)
		return false
	}
}

// Clear all app data
export function clearAll() {
	if (!isStorageAvailable()) return false

	try {
		Object.values(STORAGE_KEYS).forEach(key => {
			localStorage.removeItem(key)
		})
		return true
	} catch (error) {
		console.error('Failed to clear all data:', error)
		return false
	}
}

// Save widgets
export function saveWidgets(widgets) {
	return save(STORAGE_KEYS.WIDGETS, widgets)
}

// Load widgets
export function loadWidgets(defaultWidgets = []) {
	return load(STORAGE_KEYS.WIDGETS, defaultWidgets)
}

// Save settings
export function saveSettings(settings) {
	return save(STORAGE_KEYS.SETTINGS, settings)
}

// Load settings
export function loadSettings(defaultSettings = {}) {
	return load(STORAGE_KEYS.SETTINGS, defaultSettings)
}

// Save layout
export function saveLayout(layout) {
	return save(STORAGE_KEYS.LAYOUT, layout)
}

// Load layout
export function loadLayout(defaultLayout = {}) {
	return load(STORAGE_KEYS.LAYOUT, defaultLayout)
}

// Save user preferences
export function saveUserPreferences(preferences) {
	return save(STORAGE_KEYS.USER_PREFERENCES, preferences)
}

// Load user preferences
export function loadUserPreferences(defaultPreferences = {}) {
	return load(STORAGE_KEYS.USER_PREFERENCES, defaultPreferences)
}

// Export all configuration
export function exportConfiguration() {
	const config = {
		widgets: loadWidgets(),
		settings: loadSettings(),
		layout: loadLayout(),
		userPreferences: loadUserPreferences(),
		metadata: {
			exportDate: new Date().toISOString(),
			version: '1.0',
			appName: 'FinBoard',
		}
	}

	return config
}

// Import configuration
export function importConfiguration(config) {
	try {
		if (!config || typeof config !== 'object') {
			throw new Error('Invalid configuration format')
		}

		let importedCount = 0

		if (config.widgets) {
			saveWidgets(config.widgets)
			importedCount++
		}

		if (config.settings) {
			saveSettings(config.settings)
			importedCount++
		}

		if (config.layout) {
			saveLayout(config.layout)
			importedCount++
		}

		if (config.userPreferences) {
			saveUserPreferences(config.userPreferences)
			importedCount++
		}

		return {
			success: true,
			importedCount: importedCount,
			message: 'Successfully imported ' + importedCount + ' configuration sections',
		}
	} catch (error) {
		console.error('Failed to import configuration:', error)
		return {
			success: false,
			error: error.message,
		}
	}
}

// Get storage info
export function getStorageInfo() {
	if (!isStorageAvailable()) {
		return {
			available: false,
			totalSize: 0,
			usedSize: 0,
			items: {},
		}
	}

	const info = {
		available: true,
		totalSize: 0,
		usedSize: 0,
		items: {},
	}

	try {
		// Calculate used storage
		Object.values(STORAGE_KEYS).forEach(key => {
			const item = localStorage.getItem(key)
			if (item) {
				const size = new Blob([item]).size
				info.items[key] = {
					size: size,
					sizeFormatted: formatBytes(size),
					lastModified: load(key)?.timestamp || null,
				}
				info.usedSize += size
			}
		})

		info.usedSizeFormatted = formatBytes(info.usedSize)

		// Estimate total available storage (around 5-10MB)
		info.totalSize = 10 * 1024 * 1024 // 10MB estimate
		info.totalSizeFormatted = formatBytes(info.totalSize)
		info.usagePercentage = (info.usedSize / info.totalSize) * 100

	} catch (error) {
		console.error('Failed to get storage info:', error)
	}

	return info
}

// Format bytes to readable size
export function formatBytes(bytes) {
	if (bytes === 0) return '0 Bytes'

	const k = 1024
	const sizes = ['Bytes', 'KB', 'MB', 'GB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Auto-save setup
export function setupAutoSave(store) {
	if (!isStorageAvailable()) return null

	// Save state changes with simple delay
	let saveTimeout = null

	const saveState = () => {
		clearTimeout(saveTimeout)
		saveTimeout = setTimeout(() => {
			const state = store.getState()

			// Save widgets
			if (state.widgets?.widgets) {
				saveWidgets(state.widgets.widgets)
			}

			// Save settings
			if (state.settings) {
				saveSettings(state.settings)
			}

			// Save layout
			if (state.layout) {
				saveLayout(state.layout)
			}

			console.log('Auto-saved dashboard state to localStorage')
		}, 1000) // 1 second delay
	}

	// Subscribe to store changes
	const unsubscribe = store.subscribe(saveState)

	return unsubscribe
}

// Create backup
export function createBackup(name = '') {
	const config = exportConfiguration()
	const backupName = name || 'backup_' + new Date().toISOString().split('T')[0] + '_' + Date.now()

	const backup = {
		name: backupName,
		...config,
	}

	// Save backup
	const backupKey = 'finboard_backup_' + backupName
	save(backupKey, backup)

	// Keep track of backups
	const backups = load('finboard_backups', [])
	backups.push({
		name: backupName,
		key: backupKey,
		created: new Date().toISOString(),
	})

	// Keep only last 5 backups
	if (backups.length > 5) {
		const oldBackup = backups.shift()
		localStorage.removeItem(oldBackup.key)
	}

	save('finboard_backups', backups)

	return backupName
}

// Get available backups
export function getBackups() {
	return load('finboard_backups', [])
}

// Restore from backup
export function restoreBackup(backupName) {
	const backupKey = 'finboard_backup_' + backupName
	const backup = load(backupKey)

	if (!backup) {
		throw new Error('Backup ' + backupName + ' not found')
	}

	return importConfiguration(backup)
}

// Delete backup
export function deleteBackup(backupName) {
	const backupKey = 'finboard_backup_' + backupName
	remove(backupKey)

	const backups = getBackups().filter(b => b.name !== backupName)
	save('finboard_backups', backups)
}

// Backward compatibility - export object that works like the old class
export const StorageService = {
	KEYS: STORAGE_KEYS,
	isStorageAvailable,
	save,
	load,
	remove,
	clearAll,
	saveWidgets,
	loadWidgets,
	saveSettings,
	loadSettings,
	saveLayout,
	loadLayout,
	saveUserPreferences,
	loadUserPreferences,
	exportConfiguration,
	importConfiguration,
	getStorageInfo,
	formatBytes,
	setupAutoSave,
	createBackup,
	getBackups,
	restoreBackup,
	deleteBackup,
}
