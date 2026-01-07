

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const {
    invoiceId,
    amount,
    paymentMethod,
    reference,
    notes,
    paymentDate
  } = body

  if (!invoiceId || !amount) {
    throw createError({
      statusCode: 400,
      message: 'Invoice ID and amount are required'
    })
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { client: true }
  })

  if (!invoice) {
    throw createError({
      statusCode: 404,
      message: 'Invoice not found'
    })
  }

  // Create payment
  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      clientId: invoice.clientId,
      organizationId: invoice.organizationId,
      amount,
      paymentMethod: paymentMethod || 'BANK_TRANSFER',
      reference,
      notes,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date()
    }
  })

  // Update invoice amount paid
  const newAmountPaid = Number(invoice.amountPaid) + Number(amount)
  const isPaid = newAmountPaid >= Number(invoice.total)

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      amountPaid: newAmountPaid,
      status: isPaid ? 'PAID' : 'PARTIALLY_PAID',
      paidDate: isPaid ? new Date() : null
    }
  })

  return payment
})


