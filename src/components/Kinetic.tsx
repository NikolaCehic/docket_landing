// A kinetic headline. The letters are split on the server, so nothing shifts when the script arrives: each word is a
// mask, each letter rises out of it when its scene becomes current (experience/kinetic.ts, time-based, never scrubbed).
// Screen readers get the plain sentence; the letters are hidden from them. A "\n" in the text forces a line break.
export function KH({ text, id, as: Tag = 'h2', className = '' }: { text: string; id?: string; as?: 'h1' | 'h2'; className?: string }) {
  const lines = text.split('\n')
  return (
    <Tag id={id} className={('kt ' + className).trim()}>
      <span className="sr">{lines.join(' ')}</span>
      <span className="kv" aria-hidden="true">
        {lines.map((line, li) => (
          <span className="kl" key={li}>
            {line.split(' ').map((w, wi, ws) => (
              <span key={wi}>
                <span className="kw">
                  {[...w].map((ch, k) => <span className="kc" key={k}>{ch}</span>)}
                </span>
                {wi < ws.length - 1 ? ' ' : null}
              </span>
            ))}
          </span>
        ))}
      </span>
    </Tag>
  )
}

/** The scene's name, with its chapter number. The number shows here on phones; on desktop the chapter mark carries it. */
export function Eyebrow({ num, label }: { num: string; label: string }) {
  return <p className="eyebrow"><span className="et mono">{num}</span>{label}</p>
}
