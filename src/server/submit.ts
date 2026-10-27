import { createServerFn } from '@tanstack/react-start'
import { EMAIL_RE } from '../data/site'

// Every form on the site posts here: the first scan, sign-in and the contact form. Each submission is validated again on
// the server and appended to `.data/submissions.jsonl` (or $DOCKET_SUBMISSIONS_DIR). Sending the sign-in link and the
// first-scan email needs an email provider; add it in the handler, next to the file write, when there is one.
export type Kind = 'scan' | 'signin' | 'contact'
export type Submission = {
  kind: Kind
  email: string
  account?: 'brand' | 'agency'
  topic?: 'demo' | 'question' | 'partnership'
  name?: string
  company?: string
  role?: string
  message?: string
  consent?: boolean
  /** a field people never see: bots fill it in */
  website?: string
}

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

function validate(input: unknown): Submission {
  const d = (input ?? {}) as Record<string, unknown>
  const kind = d.kind
  if (kind !== 'scan' && kind !== 'signin' && kind !== 'contact') throw new Error('Unknown form.')
  const email = str(d.email, 254).toLowerCase()
  if (!EMAIL_RE.test(email)) throw new Error('Add the full domain, like you@yourbrand.com.')
  const s: Submission = { kind, email, website: str(d.website) }
  if (kind === 'scan') s.account = d.account === 'agency' ? 'agency' : 'brand'
  if (kind === 'contact') {
    s.topic = d.topic === 'question' || d.topic === 'partnership' ? d.topic : 'demo'
    s.name = str(d.name, 120); s.company = str(d.company, 160); s.role = str(d.role, 40); s.message = str(d.message, 4000)
    s.consent = d.consent === true
    if (!s.name || !s.company || !s.role || !s.message) throw new Error('All fields are required.')
    if (!s.consent) throw new Error('Tick the box so we can reply.')
  }
  return s
}

export const submit = createServerFn({ method: 'POST' })
  .validator(validate)
  .handler(async ({ data }) => {
    const { website, ...rest } = data
    if (website) return { ok: true as const } // the hidden field was filled in: a bot. Accept it quietly, keep nothing
    const { appendFile, mkdir } = await import('node:fs/promises')
    const { join } = await import('node:path')
    const dir = process.env.DOCKET_SUBMISSIONS_DIR || join(process.cwd(), '.data')
    await mkdir(dir, { recursive: true })
    await appendFile(join(dir, 'submissions.jsonl'), JSON.stringify({ at: new Date().toISOString(), ...rest }) + '\n')
    return { ok: true as const }
  })
