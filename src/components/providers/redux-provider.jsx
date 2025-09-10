"use client"

import { Provider } from "react-redux"
import { useEffect, useState } from "react"
import { store } from "@/lib/store"
import { StorageService } from "@/lib/storage-service"

export default function ReduxProvider({ children }) {
	const [isHydrated, setIsHydrated] = useState(false)

	useEffect(() => {
		// The store already handles hydration from StorageService in its preloadedState
		// We just need to mark as hydrated for UI purposes
		setIsHydrated(true)
	}, [])

	return <Provider store={store}>{children}</Provider>
}
