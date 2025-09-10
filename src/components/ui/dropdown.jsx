"use client"

import React, { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "./button"

export function Dropdown({ trigger, children, align = "left", onOpenChange }) {
	const [isOpen, setIsOpen] = useState(false)
	const [position, setPosition] = useState({ align: align, direction: "down" })
	const dropdownRef = useRef(null)
	const triggerRef = useRef(null)

	const handleOpenChange = (newOpen) => {
		setIsOpen(newOpen)
		if (onOpenChange) {
			onOpenChange(newOpen)
		}
	}

	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				handleOpenChange(false)
			}
		}

		function handleEscape(event) {
			if (event.key === 'Escape') {
				handleOpenChange(false)
			}
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside)
			document.addEventListener("keydown", handleEscape)
			return () => {
				document.removeEventListener("mousedown", handleClickOutside)
				document.removeEventListener("keydown", handleEscape)
			}
		}
	}, [isOpen])

	useEffect(() => {
		if (isOpen && triggerRef.current) {
			const triggerRect = triggerRef.current.getBoundingClientRect()
			const viewportWidth = window.innerWidth
			const viewportHeight = window.innerHeight
			const dropdownWidth = 200 // Estimate dropdown width
			const dropdownHeight = 300 // Estimate dropdown height

			// Check horizontal overflow
			let horizontalAlign = align
			if (align === "left" && triggerRect.left + dropdownWidth > viewportWidth) {
				horizontalAlign = "right"
			} else if (align === "right" && triggerRect.right - dropdownWidth < 0) {
				horizontalAlign = "left"
			}

			// Check vertical overflow
			let verticalDirection = "down"
			if (triggerRect.bottom + dropdownHeight > viewportHeight && triggerRect.top - dropdownHeight > 0) {
				verticalDirection = "up"
			}

			setPosition({ align: horizontalAlign, direction: verticalDirection })
		}
	}, [isOpen, align])

	return (
		<div className="relative inline-block" ref={dropdownRef}>
			<div ref={triggerRef} onClick={(e) => {
				e.stopPropagation()
				handleOpenChange(!isOpen)
			}}>
				{trigger}
			</div>

			{isOpen && (
				<div className={`absolute z-[9999] bg-slate-800 border border-slate-600 rounded-lg shadow-xl min-w-[150px] max-w-[250px] overflow-hidden ${position.direction === "up" ? "bottom-full mb-1" : "top-full mt-1"
					} ${position.align === "right" ? "right-0" : "left-0"
					}`}>
					<div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
						{Array.isArray(children) ? children.map((child, index) =>
							React.cloneElement(child, {
								key: index,
								onItemClick: () => handleOpenChange(false)
							})
						) : React.cloneElement(children, { onItemClick: () => handleOpenChange(false) })}
					</div>
				</div>
			)}
		</div>
	)
}

export function DropdownItem({ children, onClick, onItemClick, className = "" }) {
	const handleClick = (e) => {
		e.stopPropagation()
		if (onClick) {
			onClick(e)
		}
		if (onItemClick) {
			onItemClick()
		}
	}

	return (
		<div
			className={`px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg whitespace-nowrap overflow-hidden text-ellipsis ${className}`}
			onClick={handleClick}
		>
			{children}
		</div>
	)
}

export function DropdownSeparator() {
	return <div className="border-t border-slate-600 my-1" />
}
