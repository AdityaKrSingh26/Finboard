"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { updateTheme, selectTheme } from "@/lib/store/slices/settings-slice"

/**
 * Hook to sync theme state between next-themes and Redux store
 * next-themes is the single source of truth
 */
export function useThemeSync() {
	const { theme, setTheme, systemTheme, resolvedTheme } = useTheme()
	const dispatch = useAppDispatch()
	const reduxTheme = useAppSelector(selectTheme)

	// Only sync FROM next-themes TO Redux (one-way sync)
	useEffect(() => {
		if (theme && theme !== reduxTheme) {
			dispatch(updateTheme(theme))
		}
	}, [theme, dispatch]) // Removed reduxTheme from dependencies to prevent loop

	return {
		theme,
		setTheme: (newTheme) => {
			// Only update next-themes, Redux will be updated via useEffect
			setTheme(newTheme)
		},
		systemTheme,
		resolvedTheme,
		currentTheme: resolvedTheme || theme
	}
}
