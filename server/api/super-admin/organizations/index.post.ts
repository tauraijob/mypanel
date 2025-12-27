// Create new organization (Super Admin only)
export default defineEventHandler(async (event) => {
    await requireSuperAdmin(event)

    const body = await readBody(event)

    // Validate required fields
    if (!body.name || !body.email) {
        throw createError({
            statusCode: 400,
            message: 'Name and email are required'
        })
    }

    // Generate slug from name
    const slug = body.slug || body.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    // Check if slug exists
    const existing = await prisma.organization.findUnique({
        where: { slug }
    })

    if (existing) {
        throw createError({
            statusCode: 400,
            message: 'Organization with this slug already exists'
        })
    }

    const org = await prisma.organization.create({
        data: {
            name: body.name,
            slug,
            email: body.email,
            phone: body.phone || null,
            planId: body.planId || null,
            subscriptionStatus: body.subscriptionStatus || 'TRIAL',
            billingCycle: body.billingCycle || 'MONTHLY',
            isActive: body.isActive !== false
        },
        include: { plan: true }
    })

    // Create default settings for the organization
    await prisma.settings.create({
        data: {
            organizationId: org.id,
            companyName: body.name,
            companyEmail: body.email
        }
    })

    return org
})
