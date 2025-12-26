// Allowed categories for service status actions
const ALLOWED_CATEGORIES = ['Web Hosting', 'Domain Registration']

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid service ID'
    })
  }

  const service = await prisma.service.findUnique({
    where: { id },
    include: { client: true, category: true }
  })

  if (!service) {
    throw createError({
      statusCode: 404,
      message: 'Service not found'
    })
  }

  // Check if service category allows status actions
  if (!ALLOWED_CATEGORIES.includes(service.category.name)) {
    throw createError({
      statusCode: 400,
      message: `Service status actions are only available for ${ALLOWED_CATEGORIES.join(' and ')} services`
    })
  }

  // Update service status to TERMINATED
  const updated = await prisma.service.update({
    where: { id },
    data: { status: 'TERMINATED' },
    include: { client: true, category: true }
  })

  // Get company settings
  const settings = await prisma.settings.findFirst()
  const companyName = settings?.companyName || 'MyPanel'
  const adminEmail = settings?.companyEmail

  // Send termination email to client using the new template
  const clientTemplate = emailTemplates.serviceTerminated({
    clientName: service.client.name,
    serviceName: service.name,
    companyName
  })

  await sendEmail({
    to: service.client.email,
    subject: clientTemplate.subject,
    html: clientTemplate.html,
    type: 'SERVICE_TERMINATED',
    referenceType: 'service',
    referenceId: service.id
  })

  // Send admin notification email
  if (adminEmail) {
    const adminTemplate = emailTemplates.adminServiceStatusChange({
      action: 'Terminated',
      serviceName: service.name,
      clientName: service.client.name,
      clientEmail: service.client.email,
      companyName
    })

    await sendEmail({
      to: adminEmail,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      type: 'SERVICE_TERMINATED',
      referenceType: 'service',
      referenceId: service.id
    })
  }

  return { success: true, service: updated }
})
