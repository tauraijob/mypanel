

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
    include: {
      client: true,
      items: {
        include: {
          service: true
        }
      }
    }
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

  // If invoice is fully paid, update associated services to ACTIVE and set next due date
  if (isPaid) {
    const servicesWithData = invoice.items
      .filter(item => item.serviceId !== null && item.service !== null)
      .map(item => item.service!)

    for (const service of servicesWithData) {
      // Calculate next due date based on billing cycle
      const currentDueDate = new Date(service.nextDueDate)
      let nextDueDate = new Date(currentDueDate)

      switch (service.billingCycle) {
        case 'MONTHLY':
          nextDueDate.setMonth(nextDueDate.getMonth() + 1)
          break
        case 'QUARTERLY':
          nextDueDate.setMonth(nextDueDate.getMonth() + 3)
          break
        case 'SEMIANNUALLY':
          nextDueDate.setMonth(nextDueDate.getMonth() + 6)
          break
        case 'ANNUALLY':
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1)
          break
        case 'BIENNIALLY':
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 2)
          break
        case 'ONETIME':
          // For one-time services, don't change the due date
          nextDueDate = currentDueDate
          break
        default:
          nextDueDate.setMonth(nextDueDate.getMonth() + 1)
      }

      await prisma.service.update({
        where: { id: service.id },
        data: {
          status: ['PENDING', 'SUSPENDED'].includes(service.status) ? 'ACTIVE' : service.status,
          nextDueDate: nextDueDate
        }
      })
    }
  }

  return payment
})


