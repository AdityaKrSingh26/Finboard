"use client"

import { useEffect, useState } from "react"
import { CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Toast({
	message,
	type = "success",
	duration = 3000,
	onClose
}) {
	const [isVisible, setIsVisible] = useState(true)

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(false)
			setTimeout(onClose, 300) // Wait for animation to complete
		}, duration)

		return () => clearTimeout(timer)
	}, [duration, onClose])

	const handleClose = () => {
		setIsVisible(false)
		setTimeout(onClose, 300)
	}

	if (!isVisible) {
		return null
	}

	return (
		<div
			className={`fixed top-4 right-4 z-50 flex items-center gap-3 bg-card border border-border rounded-lg shadow-lg p-4 transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
				}`}
		>
			{type === "success" && (
				<CheckCircle className="w-5 h-5 text-green-600" />
			)}

			<div className="flex-1">
				<p className="text-sm font-medium text-foreground">{message}</p>
			</div>

			<Button
				variant="ghost"
				size="sm"
				onClick={handleClose}
				className="h-6 w-6 p-0 hover:bg-accent"
			>
				<X className="h-3 w-3" />
			</Button>
		</div>
	)
}
