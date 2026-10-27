import { useEffect } from 'react'

/** Mounts the client-side experience (three.js core, GSAP choreography) once the page is in the DOM. */
export function Experience() {
  useEffect(() => {
    let stop: (() => void) | undefined
    let cancelled = false
    import('../experience').then((m) => {
      if (!cancelled) stop = m.startExperience()
    })
    return () => {
      cancelled = true
      stop?.()
    }
  }, [])
  return null
}
