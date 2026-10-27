import type { ReactNode } from 'react'

// Inline markup for the site's written pages (legal, content, questions): `{label|/path}` becomes a link and
// `[Placeholder]` an open value, shown highlighted until it is filled in. Everything else stays text.
const INLINE = /\{([^|}]+)\|([^}]+)\}|\[[^\]]+\]/g

/** Turns `{label|/path}` into a link and `[Placeholder]` into a highlighted open value. Everything else stays text. */
export function Rich({ text }: { text: string }) {
  const out: ReactNode[] = []
  let last = 0
  let i = 0
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0
    if (at > last) out.push(text.slice(last, at))
    if (m[1] !== undefined) {
      out.push(
        <a key={i++} href={m[2]}>
          {m[1]}
        </a>,
      )
    } else {
      out.push(
        <span key={i++} className="lg-ph">
          {m[0]}
        </span>,
      )
    }
    last = at + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return <>{out}</>
}

