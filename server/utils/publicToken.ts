import { createHash } from 'crypto'
import { getAppUrl } from './config'

const SECRET = process.env.PUBLIC_TOKEN_SECRET || 'mypanel-secret-key-2024'

// Generate a public token for an invoice or quotation
export function generatePublicToken(type: 'invoice' | 'quotation', id: number): string {
  const data = `${type}-${id}-${SECRET}`
  const hash = createHash('sha256').update(data).digest('hex').substring(0, 16)
  const token = Buffer.from(`${type}:${id}:${hash}`).toString('base64url')
  return token
}

// Verify and decode a public token
export function verifyPublicToken(token: string): { type: 'invoice' | 'quotation', id: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const [type, idStr, hash] = decoded.split(':')
    const id = parseInt(idStr)

    if (!type || !id || !hash) return null
    if (type !== 'invoice' && type !== 'quotation') return null

    // Verify hash
    const expectedData = `${type}-${id}-${SECRET}`
    const expectedHash = createHash('sha256').update(expectedData).digest('hex').substring(0, 16)

    if (hash !== expectedHash) return null

    return { type: type as 'invoice' | 'quotation', id }
  } catch {
    return null
  }
}

// Generate public URL for an invoice
export function getPublicInvoiceUrl(invoiceId: number, baseUrl?: string): string {
  const token = generatePublicToken('invoice', invoiceId)
  const base = baseUrl || getAppUrl()
  return `${base}/view/invoice/${token}`
}

// Generate public URL for a quotation
export function getPublicQuotationUrl(quotationId: number, baseUrl?: string): string {
  const token = generatePublicToken('quotation', quotationId)
  const base = baseUrl || getAppUrl()
  return `${base}/view/quotation/${token}`
}

