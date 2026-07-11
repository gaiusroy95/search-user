import { useEffect, useState } from 'react'

interface PersistApi {
  hasHydrated: () => boolean
  onFinishHydration: (fn: () => void) => () => void
}

export function useStoreHydrated(persist: PersistApi): boolean {
  const [hydrated, setHydrated] = useState(persist.hasHydrated())

  useEffect(() => {
    if (persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return persist.onFinishHydration(() => setHydrated(true))
  }, [persist])

  return hydrated
}
