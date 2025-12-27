import { format } from 'date-fns'
import { getPublicInvoiceUrl } from '../../utils/publicToken'
import { createInvoice } from '../../utils/invoice'

export default defineEventHandler(async (event) => {
  const ctx = await requireOrgContext(event)
  const body = await readBody(event)

  const {
    clientId,

    dueDate,
    items,
    notes,
    terms,
    taxAmount,
    discount,
    sendEmail: shouldSendEmail
  } = body

  if (!clientId || !items || items.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Client and at least one item are required'
    })
  }

  // Create invoice using shared utility
  const invoice = await createInvoice({
    organizationId: ctx.organizationId,
    clientId,
    dueDate,
    items,
    notes,
    terms,
    taxAmount,
    discount,
    sendEmail: shouldSendEmail
  })

  return invoice
})



