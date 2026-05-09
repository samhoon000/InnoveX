import { useEffect } from 'react'

/** Legacy hook — realtime push was backed by Socket.IO; the static demo is entirely client-side. */
export function useRealtime(enabled: boolean, _role?: string | null) {
  useEffect(() => {
    void enabled
  }, [enabled])
}
