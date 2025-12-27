export default defineEventHandler(async (event) => {
    const client = requireClientAuth(event)
    const id = getRouterParam(event, 'id')

    const invoice = await prisma.invoice.findFirst({
        where: {
            id: Number(id),
            clientId: client.id
        },
        include: {
            items: true,
            organization: {
                select: {
                    name: true,
                    email: true,
                    settings: {
                        select: {
                            companyName: true,
                            companyEmail: true,
                            companyAddress: true,
                            logoUrl: true,
                            currency: true,
                            currencySymbol: true,
                            paypalClientId: true,
                            paypalMode: true,
                            paynowIntegrationId: true
                        }
                    }
                }
            }
        }
    })

    if (!invoice) {
        throw createError({ statusCode: 404, message: 'Invoice not found' })
    }

    return invoice
})
