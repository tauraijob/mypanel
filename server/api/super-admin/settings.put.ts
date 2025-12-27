// Update Super Admin Settings
export default defineEventHandler(async (event) => {
    await requireSuperAdmin(event)

    const body = await readBody(event)

    let settings = await prisma.superAdminSettings.findFirst()

    const updateData: any = {
        platformName: body.platformName,
        platformUrl: body.platformUrl,
        supportEmail: body.supportEmail,
        // SMTP Settings
        smtpHost: body.smtpHost,
        smtpPort: body.smtpPort ? parseInt(body.smtpPort) : 587,
        smtpUser: body.smtpUser,
        smtpFrom: body.smtpFrom,
        smtpSecure: body.smtpSecure || false,
        // PayPal
        paypalEmail: body.paypalEmail,
        paypalEnabled: body.paypalEnabled,
        // Paynow
        paynowIntegrationId: body.paynowIntegrationId,
        paynowEnabled: body.paynowEnabled,
        // Branding
        logoUrl: body.logoUrl,
        primaryColor: body.primaryColor
    }

    // Only update SMTP password if provided (not masked)
    if (body.smtpPass && !body.smtpPass.includes('*')) {
        updateData.smtpPass = body.smtpPass
    }

    // Only update paynow key if provided (not masked)
    if (body.paynowIntegrationKey && !body.paynowIntegrationKey.includes('*')) {
        updateData.paynowIntegrationKey = body.paynowIntegrationKey
    }

    if (settings) {
        settings = await prisma.superAdminSettings.update({
            where: { id: settings.id },
            data: updateData
        })
    } else {
        settings = await prisma.superAdminSettings.create({
            data: updateData
        })
    }

    return {
        ...settings,
        smtpPass: settings.smtpPass ? '********' : null,
        paynowIntegrationKey: settings.paynowIntegrationKey ? '********' : null
    }
})

