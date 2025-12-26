

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  let settings = await prisma.settings.findFirst()

  if (!settings) {
    // Create settings
    settings = await prisma.settings.create({
      data: body
    })
  } else {
    // Update settings
    settings = await prisma.settings.update({
      where: { id: settings.id },
      data: {
        companyName: body.companyName,
        companyEmail: body.companyEmail,
        companyPhone: body.companyPhone,
        companyAddress: body.companyAddress,
        companyCity: body.companyCity,
        companyState: body.companyState,
        companyZip: body.companyZip,
        companyCountry: body.companyCountry,
        companyWebsite: body.companyWebsite,
        companyTaxId: body.companyTaxId,
        logoUrl: body.logoUrl,
        invoicePrefix: body.invoicePrefix,
        quotePrefix: body.quotePrefix,
        currency: body.currency,
        currencySymbol: body.currencySymbol,
        taxRate: body.taxRate,
        paymentTerms: body.paymentTerms,
        invoiceNotes: body.invoiceNotes,
        invoiceFooter: body.invoiceFooter,
        bankDetails: body.bankDetails,
        reminderDays: body.reminderDays,
        overdueDays: body.overdueDays,
        autoSuspendDays: body.autoSuspendDays,
        smtpHost: body.smtpHost,
        smtpPort: body.smtpPort,
        smtpUser: body.smtpUser,
        smtpPass: body.smtpPass,
        smtpFrom: body.smtpFrom
      }
    })
  }

  return settings
})


