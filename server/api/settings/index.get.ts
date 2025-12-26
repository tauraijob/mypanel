

export default defineEventHandler(async () => {
  let settings = await prisma.settings.findFirst()

  // Create default settings if none exist
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        companyName: 'My Company',
        currency: 'USD',
        currencySymbol: '$',
        invoicePrefix: 'INV-',
        quotePrefix: 'QUO-'
      }
    })
  }

  return settings
})


