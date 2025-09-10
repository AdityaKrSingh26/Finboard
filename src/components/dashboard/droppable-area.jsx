"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"

export default function DroppableArea({ onAddWidget, isOver }) {
	return (
		<Card
			onClick={onAddWidget}
			className={`bg-slate-800/30 border-2 border-dashed transition-all duration-200 cursor-pointer ${isOver
					? "border-teal-500 bg-teal-500/10"
					: "border-slate-600 hover:border-teal-500/50 hover:bg-slate-700/30"
				}`}
		>
			<CardContent className="flex flex-col items-center justify-center p-8">
				<div className="flex items-center justify-center w-12 h-12 bg-slate-700 rounded-full mb-3">
					<Plus className="w-6 h-6 text-slate-300" />
				</div>
				<h3 className="text-lg font-medium text-slate-300 mb-1">Add New Widget</h3>
				<p className="text-sm text-slate-400 text-center">
					Drop here or click to add a new widget
				</p>
			</CardContent>
		</Card>
	)
}
