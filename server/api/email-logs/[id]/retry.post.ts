export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid email log ID'
    })
  }

  const emailLog = await prisma.emailLog.findUnique({
    where: { id }
  })

  if (!emailLog) {
    throw createError({
      statusCode: 404,
      message: 'Email log not found'
    })
  }

  if (emailLog.status === 'sent') {
    throw createError({
      statusCode: 400,
      message: 'This email was already sent successfully'
    })
  }

  // Retry sending the email
  const result = await sendEmail({
    to: emailLog.recipient,
    subject: emailLog.subject,
    html: emailLog.body,
    type: emailLog.type,
    referenceType: emailLog.referenceType || undefined,
    referenceId: emailLog.referenceId || undefined
  })

  if (result.success) {
    // Update the original log to mark as sent
    await prisma.emailLog.update({
      where: { id },
      data: { 
        status: 'sent',
        error: null,
        sentAt: new Date()
      }
    })

    return { 
      success: true, 
      message: `Email successfully resent to ${emailLog.recipient}` 
    }
  } else {
    // Update the error message
    await prisma.emailLog.update({
      where: { id },
      data: { 
        error: result.error || 'Retry failed'
      }
    })

    throw createError({
      statusCode: 500,
      message: `Failed to resend: ${result.error}`
    })
  }
})

