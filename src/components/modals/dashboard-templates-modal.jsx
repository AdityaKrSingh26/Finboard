"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
	DASHBOARD_TEMPLATES,
	TEMPLATE_CATEGORIES,
	getTemplatesByCategory,
	applyTemplate
} from "@/lib/dashboard-templates"
import { Download, Sparkles, X } from "lucide-react"

export default function DashboardTemplatesModal({ isOpen, onClose, onApplyTemplate, existingWidgetCount = 0 }) {
	const [selectedCategory, setSelectedCategory] = useState('all')
	const [selectedTemplate, setSelectedTemplate] = useState(null)

	// Get templates for selected category
	const templates = getTemplatesByCategory(selectedCategory)

	// Handle template selection
	function handleTemplateSelect(template) {
		setSelectedTemplate(template)
	}

	// Handle apply template with error handling
	function handleApplyTemplate() {
		if (!selectedTemplate) return

		try {
			const widgets = applyTemplate(selectedTemplate.id)
			onApplyTemplate(widgets, selectedTemplate)
			onClose()
		} catch (error) {
			console.error('Error applying template:', error)
			// Could show error toast here if needed
		}
	}

	// Handle modal close
	function handleClose() {
		setSelectedTemplate(null)
		onClose()
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
				<DialogHeader className="flex flex-row items-center justify-between flex-shrink-0">
					<div>
						<DialogTitle className="text-xl font-semibold flex items-center gap-2">
							<Sparkles className="w-5 h-5 text-primary" />
							Dashboard Templates
						</DialogTitle>
						<p className="text-sm text-muted-foreground mt-1">
							Choose a pre-built template to quickly set up your dashboard
						</p>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleClose}
						className="h-8 w-8 p-0"
					>
						<X className="h-4 w-4" />
					</Button>
				</DialogHeader>

				<div className="flex-1 min-h-0 overflow-hidden">
					<Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="h-full flex flex-col">
						{/* Category tabs */}
						<TabsList className="grid grid-cols-6 w-full mb-4 flex-shrink-0">
							{TEMPLATE_CATEGORIES.map((category) => (
								<TabsTrigger
									key={category.id}
									value={category.id}
									className="text-xs flex items-center gap-1"
								>
									<span>{category.icon}</span>
									<span className="hidden sm:inline">{category.label}</span>
								</TabsTrigger>
							))}
						</TabsList>

						{/* Templates grid - scrollable area */}
						<div
							className="flex-1 min-h-0 overflow-y-auto pr-2 pb-10"
							style={{
								maxHeight: 'calc(85vh - 200px)', // Ensure proper height calculation
								scrollbarWidth: 'thin',
								scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
							}}
						>
							<TabsContent value={selectedCategory} className="mt-0 h-full">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 min-h-[400px]">
									{templates.map((template) => (
										<Card
											key={template.id}
											className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedTemplate?.id === template.id
													? 'ring-2 ring-primary border-primary'
													: 'hover:border-primary/50'
												}`}
											onClick={() => handleTemplateSelect(template)}
										>
											<CardContent className="p-4">
												{/* Template header */}
												<div className="flex items-start justify-between mb-3">
													<div className="flex items-center gap-2">
														<span className="text-2xl">{template.icon}</span>
														<div>
															<h3 className="font-medium text-foreground">{template.name}</h3>
															<Badge variant="secondary" className="text-xs">
																{template.category}
															</Badge>
														</div>
													</div>
												</div>

												{/* Template description */}
												<p className="text-sm text-muted-foreground mb-3 line-clamp-2">
													{template.description}
												</p>

												{/* Widget count */}
												<div className="flex items-center justify-between text-xs text-muted-foreground">
													<span>{template.widgets.length} widgets included</span>
													<div className="flex gap-1">
														{template.widgets.map((widget, index) => (
															<div
																key={index}
																className="w-2 h-2 rounded-full bg-primary/30"
																title={widget.title}
															/>
														))}
													</div>
												</div>

												{/* Widget preview list */}
												<div className="mt-3 pt-3 border-t border-border">
													<div className="space-y-1">
														{template.widgets.slice(0, 3).map((widget, index) => (
															<div key={index} className="flex items-center gap-2 text-xs">
																<div className="w-3 h-3 rounded bg-primary/20 flex-shrink-0" />
																<span className="text-muted-foreground truncate">
																	{widget.title}
																</span>
															</div>
														))}
														{template.widgets.length > 3 && (
															<div className="text-xs text-muted-foreground pl-5">
																+{template.widgets.length - 3} more widgets
															</div>
														)}
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>

								{/* Empty state */}
								{templates.length === 0 && (
									<div className="text-center py-8">
										<p className="text-muted-foreground">No templates found in this category</p>
									</div>
								)}
							</TabsContent>
						</div>
					</Tabs>
				</div>

				{/* Footer with actions */}
				<div className="flex items-center justify-between pt-4 border-t border-border flex-shrink-0">
					<div className="text-sm text-muted-foreground">
						{selectedTemplate ? (
							<>
								<strong>{selectedTemplate.name}</strong> will add {selectedTemplate.widgets.length} widgets
								{existingWidgetCount > 0 && ` to your existing ${existingWidgetCount} widgets`}
							</>
						) : (
							'Select a template to get started'
						)}
					</div>

					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={handleClose}>
							Cancel
						</Button>
						<Button
							onClick={handleApplyTemplate}
							disabled={!selectedTemplate}
							className="bg-primary hover:bg-primary/90"
						>
							<Download className="w-4 h-4 mr-2" />
							Apply Template
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
