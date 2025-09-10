"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import WidgetCard from "./widget-card"
import WidgetRenderer from "@/components/widgets/widget-renderer"

export default function DraggableWidget({ widget, searchQuery, onSettings, onRemove }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: widget.id })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	// Filter widgets based on search query
	if (searchQuery && !widget.title.toLowerCase().includes(searchQuery.toLowerCase())) {
		return null
	}

	return (
		<div
			ref={setNodeRef}
			style={{
				...style,
				...(widget.type === "table" && { width: 'calc(100vw - 50px)' })
			}}
			{...attributes}
			className={widget.type === "table" ? "col-span-full -mx-4" : ""}
		>
			<WidgetCard
				title={widget.title}
				onSettings={onSettings}
				onRemove={onRemove}
				loading={widget.loading}
				error={widget.error}
				lastUpdated={widget.lastUpdated}
				isDragging={isDragging}
				dragHandleProps={listeners}
				isTableWidget={widget.type === "table"}
			>
				<WidgetRenderer widget={widget} searchQuery={searchQuery} />
			</WidgetCard>
		</div>
	)
}
