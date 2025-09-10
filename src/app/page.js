"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/loader"
import { Plus, BarChart3, Search } from "lucide-react"
import WidgetCard from "@/components/dashboard/widget-card"
import WidgetRenderer from "@/components/widgets/widget-renderer"
import AddWidgetModal from "@/components/modals/add-widget-modal"
import WidgetSettingsModal from "@/components/modals/widget-settings-modal"
import DraggableWidget from "@/components/dashboard/draggable-widget"
import DroppableArea from "@/components/dashboard/droppable-area"
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragOverlay,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import {
	selectAllWidgets,
	addWidget,
	removeWidget,
	fetchWidgetData,
	selectWidgetsLoading,
	reorderWidgets,
} from "@/lib/store/slices/widgets-slice"
import {
	selectDashboardSettings,
	selectAutoRefresh,
	selectGlobalRefreshInterval,
} from "@/lib/store/slices/settings-slice"
import { setDragging } from "@/lib/store/slices/layout-slice"

export default function Dashboard() {
	// Get data from Redux store
	const dispatch = useAppDispatch()
	const widgets = useAppSelector(selectAllWidgets)
	const dashboardSettings = useAppSelector(selectDashboardSettings)
	const autoRefresh = useAppSelector(selectAutoRefresh)
	const globalRefreshInterval = useAppSelector(selectGlobalRefreshInterval)
	const isLoading = useAppSelector(selectWidgetsLoading)

	// State for UI
	const [searchQuery, setSearchQuery] = useState("")
	const [showAddModal, setShowAddModal] = useState(false)
	const [showSettingsModal, setShowSettingsModal] = useState(false)
	const [selectedWidget, setSelectedWidget] = useState(null)
	const [activeId, setActiveId] = useState(null)
	const [isMounted, setIsMounted] = useState(false)

	// Drag and drop setup
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	)

	// Make sure component is mounted before showing
	useEffect(() => {
		setIsMounted(true)
	}, [])

	// Auto refresh widgets
	useEffect(() => {
		if (!autoRefresh) return

		const interval = setInterval(() => {
			widgets.forEach((widget) => {
				dispatch(fetchWidgetData({ widgetId: widget.id, config: widget.config }))
			})
		}, globalRefreshInterval)

		return () => clearInterval(interval)
	}, [dispatch, widgets, autoRefresh, globalRefreshInterval])

	// Load widget data when widgets change
	useEffect(() => {
		widgets.forEach((widget) => {
			if (!widget.data) {
				dispatch(fetchWidgetData({ widgetId: widget.id, config: widget.config }))
			}
		})
	}, [dispatch, widgets])

	// When drag starts
	function handleDragStart(event) {
		const { active } = event
		setActiveId(active.id)
		dispatch(setDragging(true))
	}

	// When drag ends
	function handleDragEnd(event) {
		const { active, over } = event

		setActiveId(null)
		dispatch(setDragging(false))

		if (active.id !== over?.id) {
			const oldIndex = widgets.findIndex((widget) => widget.id === active.id)
			const newIndex = widgets.findIndex((widget) => widget.id === over?.id)

			if (oldIndex !== -1 && newIndex !== -1) {
				const newWidgets = arrayMove(widgets, oldIndex, newIndex)
				dispatch(reorderWidgets(newWidgets))
			}
		}
	}

	// Open add widget modal
	function handleAddWidget() {
		setShowAddModal(true)
	}

	// Create new widget
	function handleCreateWidget(widgetConfig) {
		dispatch(addWidget(widgetConfig))
		setShowAddModal(false)
	}

	// Remove a widget
	function handleRemoveWidget(widgetId) {
		dispatch(removeWidget(widgetId))
	}

	// Open widget settings
	function handleWidgetSettings(widgetId) {
		const widget = widgets.find(w => w.id === widgetId)
		if (widget) {
			setSelectedWidget(widget)
			setShowSettingsModal(true)
		}
	}

	// Clear all data
	function handleClearData() {
		const allKeys = Object.keys(localStorage).filter(key => key.includes('finboard'))
		allKeys.forEach(key => localStorage.removeItem(key))
		window.location.reload()
	}

	// Find the widget being dragged
	const activeWidget = widgets.find((widget) => widget.id === activeId)

	// Calculate subtitle text
	let subtitle = "Real-time financial data"
	if (widgets.length > 0) {
		subtitle = `${widgets.length} active widget${widgets.length !== 1 ? "s" : ""} • ${autoRefresh ? "Auto-refresh enabled" : "Manual refresh"}`
	} else if (dashboardSettings?.subtitle) {
		subtitle = dashboardSettings.subtitle
	}

	// Show loading screen while mounting
	if (!isMounted) {
		return (
			<div className="min-h-screen bg-slate-900 text-white">
				<header className="border-b border-slate-700 bg-slate-800/50">
					<div className="flex items-center justify-between px-6 py-4">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-8 h-8 bg-teal-500 rounded">
								<BarChart3 className="w-5 h-5 text-white" />
							</div>
							<div>
								<h1 className="text-xl font-semibold text-white">Finance Dashboard</h1>
								<p className="text-sm text-slate-400">Loading...</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleClearData}
								className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
							>
								Clear Cache
							</Button>
							<Button onClick={handleAddWidget} className="bg-teal-500 hover:bg-teal-600 text-white">
								<Plus className="w-4 h-4 mr-2" />
								Add Widget
							</Button>
						</div>
					</div>
				</header>
				<main className="p-6">
					<div className="flex items-center justify-center min-h-[500px]">
						<div className="text-center space-y-4">
							<Spinner size="xl" />
							<div className="text-slate-400 text-lg">Loading dashboard...</div>
						</div>
					</div>
				</main>
			</div>
		)
	}

	// Main dashboard UI
	return (
		<div className="min-h-screen bg-slate-900 text-white">
			{/* Header */}
			<header className="border-b border-slate-700 bg-slate-800/50">
				<div className="flex items-center justify-between px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center w-8 h-8 bg-teal-500 rounded">
							<BarChart3 className="w-5 h-5 text-white" />
						</div>
						<div>
							<h1 className="text-xl font-semibold text-white">
								{dashboardSettings?.title || "Finance Dashboard"}
							</h1>
							<p className="text-sm text-slate-400">{subtitle}</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button onClick={handleAddWidget} className="bg-teal-500 hover:bg-teal-600 text-white">
							<Plus className="w-4 h-4 mr-2" />
							Add Widget
						</Button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="p-6">
				{widgets.length === 0 ? (
					// Show empty state when no widgets
					<div className="flex flex-col items-center justify-center min-h-[500px] text-center">
						<div className="flex items-center justify-center w-20 h-20 bg-slate-700 rounded-full mb-6">
							<BarChart3 className="w-10 h-10 text-slate-400" />
						</div>
						<h2 className="text-3xl font-semibold text-white mb-3">Build Your Finance Dashboard</h2>
						<p className="text-slate-400 mb-8 max-w-lg leading-relaxed">
							Create custom widgets by connecting to any finance API. Track stocks, crypto, forex, or economic
							indicators - all in real time.
						</p>
						<Card
							onClick={handleAddWidget}
							className="w-80 bg-slate-800 border-2 border-dashed border-teal-500/50 hover:border-teal-500 transition-all duration-200 cursor-pointer hover:bg-slate-700/50"
						>
							<CardContent className="flex flex-col items-center justify-center p-10">
								<div className="flex items-center justify-center w-16 h-16 bg-teal-500 rounded-full mb-4">
									<Plus className="w-8 h-8 text-white" />
								</div>
								<h3 className="text-xl font-medium text-white mb-2">Add Widget</h3>
								<p className="text-sm text-slate-400 text-center">
									Connect to a finance API and create a custom widget
								</p>
							</CardContent>
						</Card>
					</div>
				) : (
					// Show widgets when we have them
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragStart={handleDragStart}
						onDragEnd={handleDragEnd}
						modifiers={[restrictToWindowEdges]}
					>
						<div className="space-y-6">
							{/* Search bar and info */}
							<div className="flex items-center justify-between">
								<div className="relative w-80">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
									<Input
										placeholder="Search widgets..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-teal-500"
									/>
								</div>
								<div className="flex items-center gap-4">
									{isLoading && (
										<div className="flex items-center gap-2 text-sm text-slate-400">
											<Spinner size="sm" />
											Refreshing data...
										</div>
									)}
									<div className="text-sm text-slate-400">{widgets.length} widgets</div>
								</div>
							</div>

							{/* Widgets grid */}
							<SortableContext items={widgets.map((w) => w.id)} strategy={verticalListSortingStrategy}>
								<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
									{widgets.map((widget) => (
										<DraggableWidget
											key={widget.id}
											widget={widget}
											searchQuery={searchQuery}
											onSettings={() => handleWidgetSettings(widget.id)}
											onRemove={() => handleRemoveWidget(widget.id)}
										/>
									))}
								</div>
							</SortableContext>

							{/* Add more widgets area */}
							<DroppableArea onAddWidget={handleAddWidget} isOver={false} />
						</div>

						{/* Drag preview */}
						<DragOverlay modifiers={[restrictToWindowEdges]}>
							{activeWidget ? (
								<div className="transform rotate-3 scale-105">
									<WidgetCard
										title={activeWidget.title}
										onSettings={() => { }}
										onRemove={() => { }}
										loading={activeWidget.loading}
										error={activeWidget.error}
										lastUpdated={activeWidget.lastUpdated}
										isDragging={true}
									>
										<WidgetRenderer widget={activeWidget} searchQuery={searchQuery} />
									</WidgetCard>
								</div>
							) : null}
						</DragOverlay>
					</DndContext>
				)}
			</main>

			{/* Modals */}
			<AddWidgetModal
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				onCreateWidget={handleCreateWidget}
			/>

			<WidgetSettingsModal
				isOpen={showSettingsModal}
				onClose={() => {
					setShowSettingsModal(false)
					setSelectedWidget(null)
				}}
				widget={selectedWidget}
			/>
		</div>
	)
}
