// Data import endpoint
export default defineEventHandler(async (event) => {
    const authUser = requireAuth(event)

    // Get user's organization
    const user = await prisma.user.findUnique({
        where: { id: authUser.userId },
        select: { organizationId: true, role: true }
    })

    // SUPER_ADMIN can access without organizationId, regular ADMIN needs an organization
    if (!user || (user.role !== 'SUPER_ADMIN' && (!user.organizationId || user.role !== 'ADMIN'))) {
        throw createError({
            statusCode: 403,
            message: 'Only organization admins can import data'
        })
    }

    const body = await readBody(event)
    const { type, data, organizationId: requestOrgId } = body

    // Determine which organization to use
    let organizationId = user.organizationId

    // SUPER_ADMIN must specify an organization if they don't have one
    if (user.role === 'SUPER_ADMIN' && !organizationId) {
        if (!requestOrgId) {
            throw createError({
                statusCode: 400,
                message: 'SUPER_ADMIN must specify an organizationId for import'
            })
        }
        // Verify the organization exists
        const org = await prisma.organization.findUnique({
            where: { id: requestOrgId }
        })
        if (!org) {
            throw createError({
                statusCode: 404,
                message: 'Organization not found'
            })
        }
        organizationId = requestOrgId
    }

    if (!type || !data) {
        throw createError({
            statusCode: 400,
            message: 'Type and data are required'
        })
    }

    const results = {
        total: 0,
        imported: 0,
        skipped: 0,
        errors: [] as string[]
    }

    try {
        switch (type) {
            case 'clients':
                results.total = data.length
                for (const item of data) {
                    try {
                        // Check if client email exists
                        const existing = await prisma.client.findFirst({
                            where: { email: item.email, organizationId }
                        })

                        if (existing) {
                            results.skipped++
                            continue
                        }

                        await prisma.client.create({
                            data: {
                                organization: { connect: { id: organizationId } },
                                name: item.name || 'Unknown',
                                email: item.email,
                                phone: item.phone || null,
                                company: item.company || null,
                                status: item.status || 'ACTIVE',
                                billingAddress: item.billingAddress || null,
                                billingCity: item.billingCity || null,
                                billingState: item.billingState || null,
                                billingZip: item.billingZip || null,
                                billingCountry: item.billingCountry || null,
                                notes: item.notes || null
                            }
                        })
                        results.imported++
                    } catch (err: any) {
                        results.errors.push(`Client ${item.email}: ${err.message}`)
                    }
                }
                break

            case 'services':
                results.total = data.length
                for (const item of data) {
                    try {
                        // Find client by email - clientId is REQUIRED
                        let clientId: number | null = null
                        if (item.clientEmail) {
                            const client = await prisma.client.findFirst({
                                where: { email: item.clientEmail, organizationId }
                            })
                            if (client) clientId = client.id
                        }

                        // Skip if no client found - clientId is required
                        if (!clientId) {
                            results.skipped++
                            results.errors.push(`Service "${item.name}": Client not found for email "${item.clientEmail}"`)
                            continue
                        }

                        // Find category by name - categoryId is REQUIRED
                        let categoryId: number | null = null
                        if (item.categoryName) {
                            const category = await prisma.serviceCategory.findFirst({
                                where: { name: item.categoryName, organizationId }
                            })
                            if (category) categoryId = category.id
                        }

                        // If no category found, try to create or find a default "Uncategorized" category
                        if (!categoryId) {
                            let defaultCategory = await prisma.serviceCategory.findFirst({
                                where: { name: 'Uncategorized', organizationId }
                            })
                            if (!defaultCategory) {
                                defaultCategory = await prisma.serviceCategory.create({
                                    data: {
                                        name: 'Uncategorized',
                                        color: '#6b7280',
                                        icon: 'folder',
                                        organization: { connect: { id: organizationId } }
                                    }
                                })
                            }
                            categoryId = defaultCategory.id
                        }

                        await prisma.service.create({
                            data: {
                                organization: { connect: { id: organizationId } },
                                client: { connect: { id: clientId } },
                                category: { connect: { id: categoryId } },
                                name: item.name || 'Unnamed Service',
                                description: item.description || null,
                                price: parseFloat(item.price) || 0,
                                billingCycle: item.billingCycle || 'MONTHLY',
                                status: item.status || 'ACTIVE',
                                domain: item.domain || null,
                                startDate: item.startDate ? new Date(item.startDate) : new Date(),
                                nextDueDate: item.nextDueDate ? new Date(item.nextDueDate) : new Date()
                            }
                        })
                        results.imported++
                    } catch (err: any) {
                        results.errors.push(`Service ${item.name}: ${err.message}`)
                    }
                }
                break

            case 'categories':
                results.total = data.length
                for (const item of data) {
                    try {
                        // Check if category exists
                        const existing = await prisma.serviceCategory.findFirst({
                            where: { name: item.name, organizationId }
                        })

                        if (existing) {
                            results.skipped++
                            continue
                        }

                        await prisma.serviceCategory.create({
                            data: {
                                organizationId,
                                name: item.name,
                                color: item.color || '#3b82f6',
                                icon: item.icon || 'folder'
                            }
                        })
                        results.imported++
                    } catch (err: any) {
                        results.errors.push(`Category ${item.name}: ${err.message}`)
                    }
                }
                break

            default:
                throw createError({
                    statusCode: 400,
                    message: `Unknown import type: ${type}`
                })
        }
    } catch (err: any) {
        throw createError({
            statusCode: 500,
            message: `Import failed: ${err.message}`
        })
    }

    return {
        success: true,
        results
    }
})
