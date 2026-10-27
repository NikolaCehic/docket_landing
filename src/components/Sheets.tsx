import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Check, Field, Honeypot, emailError, errProps, useSend } from './forms'

// The two sheets every "Get your first scan" and "Sign in" opens, wherever it sits (nav, hero, last scene, footer):
// any element with data-sheet="scan" or data-sheet="signin". A link from another page (/#first-scan, /#sign-in) opens
// them too, through the 'docket:sheet' event (experience/film.ts). Each is a native modal dialog: focus moves in and
// comes back, Esc closes it, and the film ignores the wheel and the keys while one is open.
type Which = 'scan' | 'signin'

export function Sheets() {
  const [open, setOpen] = useState<Which | null>(null)
  const scanRef = useRef<HTMLDialogElement>(null), signRef = useRef<HTMLDialogElement>(null)
  const refOf = (w: Which) => (w === 'scan' ? scanRef : signRef)

  useEffect(() => {
    const show = (w: Which) => {
      for (const k of ['scan', 'signin'] as Which[]) if (k !== w && refOf(k).current?.open) refOf(k).current!.close()
      const d = refOf(w).current
      if (!d || d.open) return
      d.classList.remove('closing')
      d.showModal()
      document.documentElement.classList.add('sheet-open')
      setOpen(w)
    }
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('[data-sheet]') as HTMLElement | null
      if (!a || e.metaKey || e.ctrlKey) return
      e.preventDefault()
      if (e.detail > 0) a.blur()
      show(a.dataset.sheet as Which)
    }
    const onEvent = (e: Event) => show((e as CustomEvent<Which>).detail)
    document.addEventListener('click', onClick)
    window.addEventListener('docket:sheet', onEvent)
    return () => { document.removeEventListener('click', onClick); window.removeEventListener('docket:sheet', onEvent) }
  }, [])

  /** closes with a short exit (the dialog's own close comes after it) */
  const close = (w: Which) => {
    const d = refOf(w).current
    if (!d?.open || d.classList.contains('closing')) return
    d.classList.add('closing')
    window.setTimeout(() => d.close(), 180)
  }
  // (switching from one sheet to the other closes the first while the second is already open)
  const onClose = () => {
    const now = scanRef.current?.open ? 'scan' : signRef.current?.open ? 'signin' : null
    document.documentElement.classList.toggle('sheet-open', !!now)
    setOpen(now)
  }

  return (
    <>
      <dialog className="sheet" id="first-scan" ref={scanRef} aria-labelledby="scanTitle" onClose={onClose}
        onCancel={(e) => { e.preventDefault(); close('scan') }} onClick={(e) => { if (e.target === e.currentTarget) close('scan') }}>
        <ScanForm active={open === 'scan'} onClose={() => close('scan')} />
      </dialog>
      <dialog className="sheet" id="sign-in" ref={signRef} aria-labelledby="signTitle" onClose={onClose}
        onCancel={(e) => { e.preventDefault(); close('signin') }} onClick={(e) => { if (e.target === e.currentTarget) close('signin') }}>
        <SignInForm active={open === 'signin'} onClose={() => close('signin')} />
      </dialog>
    </>
  )
}

function Close({ onClose }: { onClose: () => void }) {
  return (
    <button className="sh-x" type="button" aria-label="Close" onClick={onClose}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
    </button>
  )
}

const STEPS = [
  ['Your work email', 'A link opens your workspace. It starts in Watch only.'],
  ['Two Amazon authorizations', 'Amazon Ads and Seller Central, on Amazon’s own pages. No passwords.'],
  ['Fixes in minutes', 'Each problem found comes with a drafted fix, ready for your approval.'],
]

function ScanForm({ active, onClose }: { active: boolean; onClose: () => void }) {
  const [email, setEmail] = useState(''), [account, setAccount] = useState<'brand' | 'agency'>('brand')
  const [hp, setHp] = useState(''), [err, setErr] = useState(''), [tried, setTried] = useState(false)
  const s = useSend()
  useEffect(() => { if (!active && s.status === 'sent') { s.reset(); setEmail(''); setTried(false) } }, [active])
  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setTried(true)
    const m = emailError(email)
    setErr(m)
    if (m) { document.getElementById('scanEmail')?.focus(); return }
    await s.send({ kind: 'scan', email: email.trim(), account, website: hp })
  }
  if (s.status === 'sent') {
    return (
      <div className="sh-panel">
        <Close onClose={onClose} />
        <div className="sh-done" role="status">
          <span className="sh-ok"><Check /></span>
          <p className="sh-k">First scan</p>
          <h2 id="scanTitle">Workspace started in Watch only.</h2>
          <p className="sh-sub">A link is on its way to <b>{email.trim()}</b>. Open it to authorize Amazon; the first fixes arrive within minutes, ready to approve.</p>
          <button className="btn ghost" type="button" onClick={onClose} autoFocus>Back to the page</button>
        </div>
      </div>
    )
  }
  return (
    <form className="sh-panel" noValidate onSubmit={onSubmit}>
      <Close onClose={onClose} />
      <p className="sh-k">First scan</p>
      <h2 id="scanTitle">See what Docket would fix in your account.</h2>
      <ol className="sh-steps">
        {STEPS.map(([b, d], i) => <li key={i}><span className="n">{i + 1}</span><b>{b}</b><span>{d}</span></li>)}
      </ol>
      <fieldset className="seg">
        <legend className="sr">Who is this for</legend>
        <label><input type="radio" name="account" value="brand" checked={account === 'brand'} onChange={() => setAccount('brand')} />My own brand</label>
        <label><input type="radio" name="account" value="agency" checked={account === 'agency'} onChange={() => setAccount('agency')} />An agency</label>
      </fieldset>
      <Field id="scanEmail" label="Work email" error={err}>
        <input {...errProps('scanEmail', err)} type="email" inputMode="email" autoComplete="email" placeholder="you@yourbrand.com" value={email}
          onChange={(e) => { setEmail(e.target.value); if (tried) setErr(emailError(e.target.value)) }} />
      </Field>
      <Honeypot value={hp} onChange={setHp} />
      {s.status === 'error' ? <p className="sh-fail" role="alert">{s.error}</p> : null}
      <button className="btn primary sh-go" type="submit" disabled={s.status === 'sending'}>{s.status === 'sending' ? 'Starting…' : 'Start my first scan'}</button>
      <p className="sh-fine">About six minutes. By continuing you agree to the <a href="/terms">Terms of Service</a> and the <a href="/privacy">Privacy Policy</a>.</p>
    </form>
  )
}

function SignInForm({ active, onClose }: { active: boolean; onClose: () => void }) {
  const [email, setEmail] = useState(''), [hp, setHp] = useState(''), [err, setErr] = useState(''), [tried, setTried] = useState(false)
  const s = useSend()
  useEffect(() => { if (!active && s.status === 'sent') { s.reset(); setTried(false) } }, [active])
  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setTried(true)
    const m = emailError(email)
    setErr(m)
    if (m) { document.getElementById('signEmail')?.focus(); return }
    await s.send({ kind: 'signin', email: email.trim(), website: hp })
  }
  if (s.status === 'sent') {
    return (
      <div className="sh-panel">
        <Close onClose={onClose} />
        <div className="sh-done" role="status">
          <span className="sh-ok"><Check /></span>
          <p className="sh-k">Sign in</p>
          <h2 id="signTitle">Check your inbox.</h2>
          <p className="sh-sub">If <b>{email.trim()}</b> has a Docket workspace, a sign-in link is on its way.</p>
          <div className="ctas">
            <button className="btn ghost" type="button" onClick={() => s.reset()} autoFocus>Use another email</button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <form className="sh-panel" noValidate onSubmit={onSubmit}>
      <Close onClose={onClose} />
      <p className="sh-k">Sign in</p>
      <h2 id="signTitle">Sign in to Docket.</h2>
      <p className="sh-sub">We email you a link that signs you in. No password to remember.</p>
      <Field id="signEmail" label="Work email" error={err}>
        <input {...errProps('signEmail', err)} type="email" inputMode="email" autoComplete="email" placeholder="you@yourbrand.com" value={email}
          onChange={(e) => { setEmail(e.target.value); if (tried) setErr(emailError(e.target.value)) }} />
      </Field>
      <Honeypot value={hp} onChange={setHp} />
      {s.status === 'error' ? <p className="sh-fail" role="alert">{s.error}</p> : null}
      <button className="btn primary sh-go" type="submit" disabled={s.status === 'sending'}>{s.status === 'sending' ? 'Sending…' : 'Email me a sign-in link'}</button>
      <p className="sh-fine">New to Docket? <a href="#first-scan" data-sheet="scan">Get your first scan</a></p>
    </form>
  )
}
