// Browser storage utilities for data persistence
export class StorageService {
	// Keys for different data types
	static KEYS = {
		WIDGETS: 'finboard_widgets',
		SETTINGS: 'finboard_settings',
		LAYOUT: 'finboard_layout',
		API_CACHE: 'finboard_api_cache',
		USER_PREFERENCES: 'finboard_user_preferences',
	}

	// Check if localStorage is available
	static isStorageAvailable() {
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

	// Generic save to localStorage
	static save(key, data) {
		if (!this.isStorageAvailable()) return false

		try {
			const serializedData = JSON.stringify({
				data,
				timestamp: Date.now(),
				version: '1.0',
			})
			localStorage.setItem(key, serializedData)
			return true
		} catch (error) {
			console.error(`Failed to save ${key}:`, error)
			return false
		}
	}

	// Generic load from localStorage
	static load(key, defaultValue = null) {
		if (!this.isStorageAvailable()) return defaultValue

		try {
			const serializedData = localStorage.getItem(key)
			if (!serializedData) return defaultValue

			const parsedData = JSON.parse(serializedData)

			// Check if data is expired (older than 30 days)
			const MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days
			if (parsedData.timestamp && Date.now() - parsedData.timestamp > MAX_AGE) {
				localStorage.removeItem(key)
				return defaultValue
			}

			return parsedData.data
		} catch (error) {
			console.error(`Failed to load ${key}:`, error)
			localStorage.removeItem(key)
			return defaultValue
		}
	}

	// Remove from localStorage
	static remove(key) {
		if (!this.isStorageAvailable()) return false

		try {
			localStorage.removeItem(key)
			return true
		} catch (error) {
			console.error(`Failed to remove ${key}:`, error)
			return false
		}
	}

	// Clear all app data
	static clearAll() {
		if (!this.isStorageAvailable()) return false

		try {
			Object.values(this.KEYS).forEach(key => {
				localStorage.removeItem(key)
			})
			return true
		} catch (error) {
			console.error('Failed to clear all data:', error)
			return false
		}
	}

	// Widget-specific methods
	static saveWidgets(widgets) {
		return this.save(this.KEYS.WIDGETS, widgets)
	}

	static loadWidgets(defaultWidgets = []) {
		return this.load(this.KEYS.WIDGETS, defaultWidgets)
	}

	// Settings-specific methods
	static saveSettings(settings) {
		return this.save(this.KEYS.SETTINGS, settings)
	}

	static loadSettings(defaultSettings = {}) {
		return this.load(this.KEYS.SETTINGS, defaultSettings)
	}

	// Layout-specific methods
	static saveLayout(layout) {
		return this.save(this.KEYS.LAYOUT, layout)
	}

	static loadLayout(defaultLayout = {}) {
		return this.load(this.KEYS.LAYOUT, defaultLayout)
	}

	// User preferences
	static saveUserPreferences(preferences) {
		return this.save(this.KEYS.USER_PREFERENCES, preferences)
	}

	static loadUserPreferences(defaultPreferences = {}) {
		return this.load(this.KEYS.USER_PREFERENCES, defaultPreferences)
	}

	// Export configuration
	static exportConfiguration() {
		const config = {
			widgets: this.loadWidgets(),
			settings: this.loadSettings(),
			layout: this.loadLayout(),
			userPreferences: this.loadUserPreferences(),
			metadata: {
				exportDate: new Date().toISOString(),
				version: '1.0',
				appName: 'FinBoard',
			}
		}

		return config
	}

	// Import configuration
	static importConfiguration(config) {
		try {
			if (!config || typeof config !== 'object') {
				throw new Error('Invalid configuration format')
			}

			let importedCount = 0

			if (config.widgets) {
				this.saveWidgets(config.widgets)
				importedCount++
			}

			if (config.settings) {
				this.saveSettings(config.settings)
				importedCount++
			}

			if (config.layout) {
				this.saveLayout(config.layout)
				importedCount++
			}

			if (config.userPreferences) {
				this.saveUserPreferences(config.userPreferences)
				importedCount++
			}

			return {
				success: true,
				importedCount,
				message: `Successfully imported ${importedCount} configuration sections`,
			}
		} catch (error) {
			console.error('Failed to import configuration:', error)
			return {
				success: false,
				error: error.message,
			}
		}
	}

	// Get storage usage info
	static getStorageInfo() {
		if (!this.isStorageAvailable()) {
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
			Object.values(this.KEYS).forEach(key => {
				const item = localStorage.getItem(key)
				if (item) {
					const size = new Blob([item]).size
					info.items[key] = {
						size,
						sizeFormatted: this.formatBytes(size),
						lastModified: this.load(key)?.timestamp || null,
					}
					info.usedSize += size
				}
			})

			info.usedSizeFormatted = this.formatBytes(info.usedSize)

			// Estimate total available storage (most browsers limit to ~5-10MB)
			info.totalSize = 10 * 1024 * 1024 // 10MB estimate
			info.totalSizeFormatted = this.formatBytes(info.totalSize)
			info.usagePercentage = (info.usedSize / info.totalSize) * 100

		} catch (error) {
			console.error('Failed to get storage info:', error)
		}

		return info
	}

	// Format bytes to human readable
	static formatBytes(bytes) {
		if (bytes === 0) return '0 Bytes'

		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
	}

	// Auto-save functionality
	static setupAutoSave(store) {
		if (!this.isStorageAvailable()) return null

		// Save state changes with debouncing
		let saveTimeout = null

		const saveState = () => {
			clearTimeout(saveTimeout)
			saveTimeout = setTimeout(() => {
				const state = store.getState()

				// Save widgets
				if (state.widgets?.widgets) {
					this.saveWidgets(state.widgets.widgets)
				}

				// Save settings
				if (state.settings) {
					this.saveSettings(state.settings)
				}

				// Save layout
				if (state.layout) {
					this.saveLayout(state.layout)
				}

				console.log('Auto-saved dashboard state to localStorage')
			}, 1000) // 1 second debounce
		}

		// Subscribe to store changes
		const unsubscribe = store.subscribe(saveState)

		return unsubscribe
	}

	// Backup management
	static createBackup(name = '') {
		const config = this.exportConfiguration()
		const backupName = name || `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}`

		const backup = {
			name: backupName,
			...config,
		}

		// Save backup to a separate key
		const backupKey = `finboard_backup_${backupName}`
		this.save(backupKey, backup)

		// Keep track of backups
		const backups = this.load('finboard_backups', [])
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

		this.save('finboard_backups', backups)

		return backupName
	}

	// Get available backups
	static getBackups() {
		return this.load('finboard_backups', [])
	}

	// Restore from backup
	static restoreBackup(backupName) {
		const backupKey = `finboard_backup_${backupName}`
		const backup = this.load(backupKey)

		if (!backup) {
			throw new Error(`Backup '${backupName}' not found`)
		}

		return this.importConfiguration(backup)
	}

	// Delete backup
	static deleteBackup(backupName) {
		const backupKey = `finboard_backup_${backupName}`
		this.remove(backupKey)

		const backups = this.getBackups().filter(b => b.name !== backupName)
		this.save('finboard_backups', backups)
	}
}
