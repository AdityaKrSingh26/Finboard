"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/loader"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Toast from "@/components/ui/toast"
import { Plus, BarChart3, Search, Sparkles } from "lucide-react"
import WidgetCard from "@/components/dashboard/widget-card"
import WidgetRenderer from "@/components/widgets/widget-renderer"
import AddWidgetModal from "@/components/modals/add-widget-modal"
import WidgetSettingsModal from "@/components/modals/widget-settings-modal"
import DashboardTemplatesModal from "@/components/modals/dashboard-templates-modal"
import TemplateSelector from "@/components/dashboard/template-selector"
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
	addWidgetsFromTemplate,
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
	const [showTemplatesModal, setShowTemplatesModal] = useState(false)
	const [selectedWidget, setSelectedWidget] = useState(null)
	const [activeId, setActiveId] = useState(null)
	const [isMounted, setIsMounted] = useState(false)
	const [toast, setToast] = useState(null)

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

	// Auto refresh widgets - with better throttling
	useEffect(() => {
		if (!autoRefresh || widgets.length === 0) return

		const interval = setInterval(() => {
			// Only refresh widgets that have data and aren't currently loading
			const widgetsToRefresh = widgets.filter(widget => 
				widget.data && !widget.loading
			)

			if (widgetsToRefresh.length > 0) {
				console.log(`🔄 Auto-refreshing ${widgetsToRefresh.length} widgets`)
				
				// Stagger refresh calls
				widgetsToRefresh.forEach((widget, index) => {
					setTimeout(() => {
						dispatch(fetchWidgetData({ widgetId: widget.id, config: widget.config }))
					}, index * 200) // 200ms delay between refreshes
				})
			}
		}, globalRefreshInterval)

		return () => clearInterval(interval)
	}, [dispatch, autoRefresh, globalRefreshInterval, widgets.length])

	// Load widget data when widgets change - with better control
	useEffect(() => {
		// Only fetch data for widgets that don't have data and aren't already loading
		const widgetsNeedingData = widgets.filter(widget => 
			!widget.data && !widget.loading && !widget.error
		)

		if (widgetsNeedingData.length > 0) {
			console.log(`🚀 Fetching data for ${widgetsNeedingData.length} new widgets`)
			
			// Limit to maximum 3 concurrent API calls to prevent overwhelming
			const maxConcurrent = Math.min(3, widgetsNeedingData.length)
			
			// Stagger the API calls to prevent overwhelming the APIs
			widgetsNeedingData.slice(0, maxConcurrent).forEach((widget, index) => {
				setTimeout(() => {
					dispatch(fetchWidgetData({ widgetId: widget.id, config: widget.config }))
				}, index * 1000) // 1 second delay between each API call
			})

			// Load remaining widgets after the first batch completes
			if (widgetsNeedingData.length > maxConcurrent) {
				setTimeout(() => {
					widgetsNeedingData.slice(maxConcurrent).forEach((widget, index) => {
						setTimeout(() => {
							dispatch(fetchWidgetData({ widgetId: widget.id, config: widget.config }))
						}, index * 1000)
					})
				}, maxConcurrent * 1000 + 2000) // Wait for first batch + 2 seconds
			}
		}
	}, [dispatch, widgets.length]) // Only depend on widget count, not the entire widgets array

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

	// Open templates modal
	function handleOpenTemplates() {
		setShowTemplatesModal(true)
	}

	// Apply dashboard template
	function handleApplyTemplate(templateWidgets, template) {
		console.log(`📋 Applying template: ${template.name} with ${templateWidgets.length} widgets`)
		
		dispatch(addWidgetsFromTemplate({ 
			widgets: templateWidgets, 
			clearExisting: false 
		}))
		setShowTemplatesModal(false)
		
		// Show success toast
		setToast({
			message: `✨ ${template.name} template applied! Added ${templateWidgets.length} widgets.`,
			type: "success"
		})
	}

	// Clear all data
	function handleClearData() {
		console.log("🧹 Clearing all localStorage data")
		const allKeys = Object.keys(localStorage).filter(key => key.includes('finboard'))
		console.log("🗑️ Keys to delete:", allKeys)
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
			<div className="min-h-screen bg-background text-foreground theme-transition">
				<header className="border-b border-border bg-card/50">
					<div className="flex items-center justify-between px-6 py-4">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-8 h-8 bg-primary rounded">
								<BarChart3 className="w-5 h-5 text-primary-foreground" />
							</div>
							<div>
								<h1 className="text-xl font-semibold text-foreground">Finance Dashboard</h1>
								<p className="text-sm text-muted-foreground">Loading...</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<ThemeToggle />
							<Button 
								variant="outline" 
								size="sm"
								onClick={handleOpenTemplates}
								className="hidden sm:flex"
							>
								<Sparkles className="w-4 h-4 mr-2" />
								Templates
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleClearData}
								className="border-border text-muted-foreground hover:bg-accent bg-transparent"
							>
								Clear Cache
							</Button>
							<Button onClick={handleAddWidget} className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
							<div className="text-muted-foreground text-lg">Loading dashboard...</div>
						</div>
					</div>
				</main>
			</div>
		)
	}

	// Main dashboard UI
	return (
		<div className="min-h-screen bg-background text-foreground theme-transition">
			{/* Header */}
			<header className="border-b border-border bg-card/50">
				<div className="flex items-center justify-between px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center w-8 h-8 bg-primary rounded">
							<BarChart3 className="w-5 h-5 text-primary-foreground" />
						</div>
						<div>
							<h1 className="text-xl font-semibold text-foreground">
								{dashboardSettings?.title || "Finance Dashboard"}
							</h1>
							<p className="text-sm text-muted-foreground">{subtitle}</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<ThemeToggle />
						<Button 
							variant="outline" 
							size="sm"
							onClick={handleOpenTemplates}
							className="hidden sm:flex"
						>
							<Sparkles className="w-4 h-4 mr-2" />
							Templates
						</Button>
						<Button onClick={handleAddWidget} className="bg-primary hover:bg-primary/90 text-primary-foreground">
							<Plus className="w-4 h-4 mr-2" />
							Add Widget
						</Button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="p-6">
				{widgets.length === 0 ? (
					// Show template selector when no widgets
					<TemplateSelector 
						onOpenTemplates={handleOpenTemplates}
						onAddWidget={handleAddWidget}
					/>
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
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
									<Input
										placeholder="Search widgets..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
									/>
								</div>
								<div className="flex items-center gap-4">
									{isLoading && (
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<Spinner size="sm" />
											Refreshing data...
										</div>
									)}
									<div className="text-sm text-muted-foreground">{widgets.length} widgets</div>
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

			<DashboardTemplatesModal
				isOpen={showTemplatesModal}
				onClose={() => setShowTemplatesModal(false)}
				onApplyTemplate={handleApplyTemplate}
				existingWidgetCount={widgets.length}
			/>

			{/* Toast notifications */}
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}
		</div>
	)
}
