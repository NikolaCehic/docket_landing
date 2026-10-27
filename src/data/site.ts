// The company's contact details, in one place. A value still in [brackets] is a placeholder: the page shows it as text,
// and turns it into a link (mailto:, tel:) as soon as it is filled in.
export const SITE = {
  company: '[Company legal name]',
  email: 'hello@[domain]',
  support: 'support@[domain]',
  phone: '[+1 000 000 0000]',
  hours: 'Mon to Fri, 9:00 to 18:00 [timezone]',
  address: ['[Street address]', '[City, postal code, country]', '[Company registration or VAT no.]'],
}
export const isReal = (v: string) => !/[[\]]/.test(v)

/** a work email: something@domain.tld (the forms check it as you type it, and the server checks it again) */
export const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/
