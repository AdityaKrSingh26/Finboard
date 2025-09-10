"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Plus } from "lucide-react"

export default function TemplateSelector({ onOpenTemplates, onAddWidget }) {
	return (
		<div className="flex flex-col items-center justify-center min-h-[500px] text-center">
			<div className="flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-6">
				<Sparkles className="w-10 h-10 text-muted-foreground" />
			</div>

			<h2 className="text-3xl font-semibold text-foreground mb-3">Build Your Finance Dashboard</h2>
			<p className="text-muted-foreground mb-8 max-w-lg leading-relaxed">
				Get started quickly with a pre-built template or create custom widgets by connecting to finance APIs.
			</p>

			<div className="flex flex-col sm:flex-row gap-4 mb-8">
				{/* Templates button */}
				<Card
					onClick={onOpenTemplates}
					className="w-80 bg-card border-2 border-primary/50 hover:border-primary transition-all duration-200 cursor-pointer hover:bg-accent/50 hover:shadow-lg"
				>
					<CardContent className="flex flex-col items-center justify-center p-8">
						<div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
							<Sparkles className="w-8 h-8 text-primary-foreground" />
						</div>
						<h3 className="text-xl font-medium text-foreground mb-2">Use Template</h3>
						<p className="text-sm text-muted-foreground text-center">
							Choose from ready-made dashboards for trading, crypto, or analysis
						</p>
					</CardContent>
				</Card>

				{/* Add widget button */}
				<Card
					onClick={onAddWidget}
					className="w-80 bg-card border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-200 cursor-pointer hover:bg-accent/30"
				>
					<CardContent className="flex flex-col items-center justify-center p-8">
						<div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
							<Plus className="w-8 h-8 text-muted-foreground" />
						</div>
						<h3 className="text-xl font-medium text-foreground mb-2">Add Widget</h3>
						<p className="text-sm text-muted-foreground text-center">
							Create a custom widget by connecting to any finance API
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="text-xs text-muted-foreground">
				💡 Pro tip: Start with a template and customize it to your needs
			</div>
		</div>
	)
}
