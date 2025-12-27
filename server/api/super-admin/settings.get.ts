// Get Super Admin Settings
export default defineEventHandler(async (event) => {
    await requireSuperAdmin(event)

    let settings = await prisma.superAdminSettings.findFirst()

    if (!settings) {
        // Create default settings
        settings = await prisma.superAdminSettings.create({
            data: {
                platformName: 'MyPanel',
                paypalEmail: 'taujob1111@gmail.com',
                paypalEnabled: true
            }
        })
    }

    // Mask sensitive keys
    return {
        ...settings,
        smtpPass: settings.smtpPass ? '********' : null,
        paynowIntegrationKey: settings.paynowIntegrationKey ? '********' : null
    }
})

