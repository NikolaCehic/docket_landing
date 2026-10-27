import { useState, type ReactNode } from 'react'
import { EMAIL_RE } from '../data/site'
import { submit, type Submission } from '../server/submit'

// What the site's three forms share: the email check, sending (to server/submit.ts), and a labelled field whose error
// is announced and tied to its input.

export function emailError(v: string) {
  const t = v.trim()
  if (!t) return 'Enter your work email.'
  if (!EMAIL_RE.test(t)) return 'Add the full domain, like you@yourbrand.com.'
  return ''
}

export type Status = 'idle' | 'sending' | 'sent' | 'error'
export function useSend() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  async function send(data: Submission) {
    setStatus('sending'); setError('')
    try {
      await submit({ data })
      setStatus('sent')
      return true
    } catch (e) {
      setStatus('error')
      const m = e instanceof Error ? e.message : ''
      setError(m && m.length < 120 && !/fetch|network|failed/i.test(m) ? m : 'Couldn’t send. Check your connection and try again.')
      return false
    }
  }
  return { status, error, send, reset: () => { setStatus('idle'); setError('') } }
}

export function Field({ id, label, error, children, wide }: { id: string; label: string; error?: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={'fld' + (wide ? ' wide' : '')}>
      <label htmlFor={id}>{label}</label>
      {children}
      <p className="err" id={id + 'Err'} aria-live="polite">{error || ''}</p>
    </div>
  )
}
/** the props that tie an input to its Field's error */
export const errProps = (id: string, error?: string) => ({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? id + 'Err' : undefined })

/** bots fill in every field; people never see this one */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="hp" aria-hidden="true">
      <label>Website<input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} /></label>
    </div>
  )
}

export function Check() {
  return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
