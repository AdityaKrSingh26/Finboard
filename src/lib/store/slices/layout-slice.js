import { createSlice } from "@reduxjs/toolkit"

const initialState = {
	gridCols: 12,
	gridRows: 12,
	compactMode: false,
	showGrid: false,
	snapToGrid: true,
	autoResize: true,
	breakpoints: {
		lg: 1200,
		md: 996,
		sm: 768,
		xs: 480,
		xxs: 0,
	},
	layouts: {
		lg: [],
		md: [],
		sm: [],
		xs: [],
		xxs: [],
	},
	currentBreakpoint: "lg",
	isDragging: false,
	isResizing: false,
}

const layoutSlice = createSlice({
	name: "layout",
	initialState,
	reducers: {
		hydrate: (state, action) => {
			// Hydrate state from localStorage
			if (action.payload) {
				Object.assign(state, action.payload)
			}
		},
		updateLayout: (state, action) => {
			const { breakpoint, layout } = action.payload
			state.layouts[breakpoint] = layout
		},

		setCurrentBreakpoint: (state, action) => {
			state.currentBreakpoint = action.payload
		},

		toggleCompactMode: (state) => {
			state.compactMode = !state.compactMode
		},

		toggleShowGrid: (state) => {
			state.showGrid = !state.showGrid
		},

		toggleSnapToGrid: (state) => {
			state.snapToGrid = !state.snapToGrid
		},

		setGridSize: (state, action) => {
			const { cols, rows } = action.payload
			state.gridCols = cols
			state.gridRows = rows
		},

		setDragging: (state, action) => {
			state.isDragging = action.payload
		},

		setResizing: (state, action) => {
			state.isResizing = action.payload
		},

		resetLayout: (state) => {
			state.layouts = {
				lg: [],
				md: [],
				sm: [],
				xs: [],
				xxs: [],
			}
		},

		importLayout: (state, action) => {
			const { layouts, settings } = action.payload
			if (layouts) {
				state.layouts = { ...state.layouts, ...layouts }
			}
			if (settings) {
				Object.assign(state, settings)
			}
		},
	},
})

export const {
	hydrate,
	updateLayout,
	setCurrentBreakpoint,
	toggleCompactMode,
	toggleShowGrid,
	toggleSnapToGrid,
	setGridSize,
	setDragging,
	setResizing,
	resetLayout,
	importLayout,
} = layoutSlice.actions

// Selectors
export const selectCurrentLayout = (state) => state.layout.layouts[state.layout.currentBreakpoint]
export const selectLayoutSettings = (state) => ({
	gridCols: state.layout.gridCols,
	gridRows: state.layout.gridRows,
	compactMode: state.layout.compactMode,
	showGrid: state.layout.showGrid,
	snapToGrid: state.layout.snapToGrid,
})
export const selectCurrentBreakpoint = (state) => state.layout.currentBreakpoint
export const selectIsDragging = (state) => state.layout.isDragging
export const selectIsResizing = (state) => state.layout.isResizing

export default layoutSlice.reducer
