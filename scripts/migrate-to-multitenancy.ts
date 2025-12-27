import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting Multi-Tenant Migration...')
    console.log('')

    // Step 1: Create Super Admin Settings
    console.log('📋 Creating Super Admin Settings...')
    await prisma.superAdminSettings.upsert({
        where: { id: 1 },
        update: {},
        create: {
            platformName: 'MyPanel',
            platformUrl: 'https://mypanel.wecode.co.zw',
            supportEmail: 'support@wecode.co.zw',
            paypalEmail: 'taujob1111@gmail.com',
            paypalEnabled: true,
            paynowEnabled: false,
            primaryColor: '#3b82f6'
        }
    })
    console.log('✅ Super Admin Settings created')

    // Step 2: Create Default Subscription Plans
    console.log('')
    console.log('💳 Creating Subscription Plans...')

    const plans = [
        {
            name: 'Starter',
            description: 'Perfect for freelancers and small businesses',
            monthlyPrice: 5.00,
            yearlyPrice: 50.00,
            maxClients: 25,
            maxUsers: 2,
            maxServices: 50,
            features: 'Basic invoicing,Email reminders,Client portal',
            sortOrder: 1
        },
        {
            name: 'Professional',
            description: 'Great for growing businesses',
            monthlyPrice: 10.00,
            yearlyPrice: 100.00,
            maxClients: 100,
            maxUsers: 5,
            maxServices: 200,
            features: 'Everything in Starter,Quotations,Multiple currencies,Priority support',
            sortOrder: 2
        },
        {
            name: 'Business',
            description: 'For established businesses with larger client bases',
            monthlyPrice: 20.00,
            yearlyPrice: 200.00,
            maxClients: -1,
            maxUsers: -1,
            maxServices: -1,
            features: 'Everything in Professional,Unlimited clients,Unlimited services,White-label invoices,API access',
            sortOrder: 3
        }
    ]

    for (const plan of plans) {
        await prisma.subscriptionPlan.upsert({
            where: { name: plan.name },
            update: plan,
            create: plan
        })
        console.log(`  ✅ Plan "${plan.name}" created - $${plan.monthlyPrice}/month`)
    }

    // Step 3: Create WeCode Organization (Your Business)
    console.log('')
    console.log('🏢 Creating WeCode Zimbabwe Organization...')

    const businessPlan = await prisma.subscriptionPlan.findFirst({
        where: { name: 'Business' }
    })

    const org = await prisma.organization.upsert({
        where: { slug: 'wecode' },
        update: {},
        create: {
            name: 'WeCode Zimbabwe',
            slug: 'wecode',
            email: 'taujob1111@gmail.com',
            phone: '',
            planId: businessPlan?.id,
            subscriptionStatus: 'ACTIVE',
            subscriptionStart: new Date(),
            subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            billingCycle: 'YEARLY',
            isActive: true
        }
    })
    console.log(`✅ Organization "${org.name}" created with ID: ${org.id}`)

    // Step 4: Create Admin User for WeCode
    console.log('')
    console.log('👤 Creating Admin User for WeCode...')

    const adminPassword = await bcrypt.hash('admin123', 12)
    const admin = await prisma.user.upsert({
        where: { email: 'taujob1111@gmail.com' },
        update: { organizationId: org.id },
        create: {
            email: 'taujob1111@gmail.com',
            password: adminPassword,
            name: 'Admin',
            role: 'ADMIN',
            isActive: true,
            organizationId: org.id
        }
    })
    console.log(`✅ Admin user created: ${admin.email}`)

    // Step 5: Create Settings for WeCode
    console.log('')
    console.log('⚙️ Creating Organization Settings...')

    await prisma.settings.upsert({
        where: { organizationId: org.id },
        update: {},
        create: {
            organizationId: org.id,
            companyName: 'WeCode Zimbabwe',
            companyEmail: 'taujob1111@gmail.com',
            currency: 'USD',
            currencySymbol: '$',
            invoicePrefix: 'INV-',
            quotePrefix: 'QUO-'
        }
    })
    console.log('✅ Organization settings created')

    // Step 6: Create default service categories
    console.log('')
    console.log('📁 Creating Service Categories...')

    const categories = [
        { name: 'Web Hosting', color: '#3b82f6', icon: 'server' },
        { name: 'Web Development', color: '#8b5cf6', icon: 'globe' },
        { name: 'Consulting', color: '#10b981', icon: 'message-circle' }
    ]

    for (const cat of categories) {
        await prisma.serviceCategory.upsert({
            where: { name_organizationId: { name: cat.name, organizationId: org.id } },
            update: {},
            create: { ...cat, organizationId: org.id }
        })
        console.log(`  ✅ Category "${cat.name}" created`)
    }

    // Step 7: Create Super Admin User
    console.log('')
    console.log('👑 Creating Super Admin User...')

    const hashedPassword = await bcrypt.hash('SuperAdmin123!', 12)
    const superAdmin = await prisma.user.upsert({
        where: { email: 'superadmin@wecode.co.zw' },
        update: {
            role: 'SUPER_ADMIN',
            password: hashedPassword,
            organizationId: null
        },
        create: {
            email: 'superadmin@wecode.co.zw',
            password: hashedPassword,
            name: 'Super Admin',
            role: 'SUPER_ADMIN',
            isActive: true,
            organizationId: null
        }
    })
    console.log(`✅ Super Admin created: ${superAdmin.email}`)

    // Summary
    console.log('')
    console.log('═══════════════════════════════════════════════════════')
    console.log('🎉 MIGRATION COMPLETE!')
    console.log('═══════════════════════════════════════════════════════')
    console.log('')
    console.log('📋 SUPER ADMIN CREDENTIALS:')
    console.log('   Email: superadmin@wecode.co.zw')
    console.log('   Password: SuperAdmin123!')
    console.log('')
    console.log('📋 ORG ADMIN CREDENTIALS:')
    console.log('   Email: taujob1111@gmail.com')
    console.log('   Password: admin123')
    console.log('')
    console.log('🏢 YOUR ORGANIZATION:')
    console.log('   Name: WeCode Zimbabwe')
    console.log('   Slug: wecode')
    console.log('   Plan: Business (Unlimited)')
    console.log('')
    console.log('⚠️  IMPORTANT: Change passwords after first login!')
    console.log('')
}

main()
    .catch((e) => {
        console.error('❌ Migration failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
