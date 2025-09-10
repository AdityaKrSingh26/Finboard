"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useThemeSync } from "@/hooks/use-theme-sync"
import { Button } from "./button"
import { Moon, Sun, Monitor } from "lucide-react"
import { Dropdown, DropdownItem } from "./dropdown"

export function ThemeToggle() {
	const { theme, setTheme, currentTheme } = useThemeSync()
	const [mounted, setMounted] = useState(false)

	// Wait for component to mount to avoid hydration mismatch
	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return (
			<Button
				variant="ghost"
				size="sm"
				className="w-9 h-9 p-0"
			>
				<Sun className="h-4 w-4" />
			</Button>
		)
	}

	return (
		<Dropdown
			trigger={
				<Button
					variant="ghost"
					size="sm"
					className="w-9 h-9 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 dark:hover:bg-slate-600/50 transition-colors"
				>
					{currentTheme === "light" ? (
						<Sun className="h-4 w-4" />
					) : currentTheme === "dark" ? (
						<Moon className="h-4 w-4" />
					) : (
						<Monitor className="h-4 w-4" />
					)}
					<span className="sr-only">Toggle theme</span>
				</Button>
			}
			align="right"
		>
			<DropdownItem
				onClick={() => setTheme("light")}
				className={theme === "light" ? "bg-accent text-accent-foreground" : ""}
			>
				<div className="flex items-center gap-2">
					<Sun className="w-4 h-4" />
					<span>Light</span>
				</div>
			</DropdownItem>
			
			<DropdownItem
				onClick={() => setTheme("dark")}
				className={theme === "dark" ? "bg-accent text-accent-foreground" : ""}
			>
				<div className="flex items-center gap-2">
					<Moon className="w-4 h-4" />
					<span>Dark</span>
				</div>
			</DropdownItem>
			
			<DropdownItem
				onClick={() => setTheme("system")}
				className={theme === "system" ? "bg-accent text-accent-foreground" : ""}
			>
				<div className="flex items-center gap-2">
					<Monitor className="w-4 h-4" />
					<span>System</span>
				</div>
			</DropdownItem>
		</Dropdown>
	)
}

export function SimpleThemeToggle() {
	const { theme, setTheme, currentTheme } = useThemeSync()
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return (
			<Button
				variant="ghost"
				size="sm"
				className="w-9 h-9 p-0"
			>
				<Sun className="h-4 w-4" />
			</Button>
		)
	}

	const isDark = currentTheme === "dark"

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className="w-9 h-9 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 dark:hover:bg-slate-600/50 transition-colors"
		>
			{isDark ? (
				<Sun className="h-4 w-4" />
			) : (
				<Moon className="h-4 w-4" />
			)}
			<span className="sr-only">Toggle theme</span>
		</Button>
	)
}
