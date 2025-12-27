import PDFDocument from 'pdfkit'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
   const id = parseInt(getRouterParam(event, 'id') || '')

   if (!id) {
      throw createError({
         statusCode: 400,
         message: 'Invalid payment ID'
      })
   }

   const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
         invoice: {
            include: {
               client: true
            }
         }
      }
   })

   if (!payment) {
      throw createError({
         statusCode: 404,
         message: 'Payment not found'
      })
   }

   // Get organization-specific settings
   const settings = await prisma.settings.findFirst({
      where: { organizationId: payment.invoice.organizationId }
   })

   const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      info: {
         Title: `Receipt #${payment.id}`,
         Author: settings?.companyName || 'MyPanel',
         Subject: `Payment Receipt for ${payment.invoice.client.name}`,
      }
   })

   const chunks: Buffer[] = []
   doc.on('data', (chunk) => chunks.push(chunk))

   // Colors - emerald/teal theme for receipts
   const emerald600 = '#059669'
   const emerald700 = '#047857'
   const emerald50 = '#ecfdf5'
   const emerald100 = '#d1fae5'
   const slate900 = '#0f172a'
   const slate700 = '#334155'
   const slate500 = '#64748b'
   const slate400 = '#94a3b8'
   const slate200 = '#e2e8f0'
   const slate50 = '#f8fafc'

   const pageWidth = 595
   const pageHeight = 842
   const margin = 50

   const formatCurrency = (amount: number | any) => {
      const symbol = settings?.currencySymbol || '$'
      return `${symbol}${Number(amount).toFixed(2)}`
   }

   const formatDate = (date: Date | string) => {
      const d = new Date(date)
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
   }

   const formatMethod = (method: string) => {
      const methods: Record<string, string> = {
         BANK_TRANSFER: 'Bank Transfer',
         CASH: 'Cash',
         CREDIT_CARD: 'Credit Card',
         PAYPAL: 'PayPal',
         MOBILE_MONEY: 'Mobile Money',
         CRYPTO: 'Cryptocurrency',
         OTHER: 'Other'
      }
      return methods[method] || method
   }

   // ============================================
   // BACKGROUND
   // ============================================
   doc.rect(0, 0, pageWidth, pageHeight).fill('#ffffff')

   // Decorative top section - emerald gradient
   doc.rect(0, 0, pageWidth, 200).fill(emerald700)

   // Decorative circles
   doc.circle(pageWidth + 30, 50, 150)
      .fill(emerald600)
   doc.circle(-50, 180, 120)
      .fill(emerald600)

   // ============================================
   // HEADER - Logo & Company
   // ============================================

   // Company logo on the left
   let hasLogo = false
   if (settings?.logoUrl) {
      try {
         if (settings.logoUrl.startsWith('/uploads/')) {
            const logoPath = join(process.cwd(), 'public', settings.logoUrl)
            if (existsSync(logoPath)) {
               const logoBuffer = await readFile(logoPath)
               // White background for logo
               doc.roundedRect(margin, 35, 90, 90, 12)
                  .fill('#ffffff')
               doc.image(logoBuffer, margin + 10, 45, { fit: [70, 70], align: 'center', valign: 'center' })
               hasLogo = true
            }
         }
      } catch (error) {
         console.error('Failed to load logo:', error)
      }
   }

   if (!hasLogo) {
      doc.roundedRect(margin, 40, 70, 70, 12)
         .fill('#ffffff')

      const companyInitial = (settings?.companyName || 'M')[0].toUpperCase()
      doc.fontSize(32)
         .fillColor(emerald700)
         .font('Helvetica-Bold')
         .text(companyInitial, margin, 60, { width: 70, align: 'center' })
   }

   // RECEIPT title (right side)
   doc.fontSize(40)
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .text('RECEIPT', 300, 50, { width: 245, align: 'right' })

   doc.fontSize(14)
      .fillColor(emerald100)
      .font('Helvetica')
      .text(`#REC-${String(payment.id).padStart(4, '0')}`, 300, 95, { width: 245, align: 'right' })

   // Company address (right side, below receipt number)
   let companyY = 120
   doc.fontSize(10).fillColor(emerald100).font('Helvetica')
   if (settings?.companyAddress) {
      doc.text(settings.companyAddress, 300, companyY, { width: 245, align: 'right' })
      companyY += 14
   }
   if (settings?.companyCity) {
      doc.text(`${settings.companyCity}, ${settings.companyState || ''} ${settings.companyZip || ''}`, 300, companyY, { width: 245, align: 'right' })
      companyY += 14
   }
   if (settings?.companyEmail) {
      doc.text(settings.companyEmail, 300, companyY, { width: 245, align: 'right' })
      companyY += 14
   }
   if (settings?.companyPhone) {
      doc.text(settings.companyPhone, 300, companyY, { width: 245, align: 'right' })
   }

   // ============================================
   // SUCCESS CHECKMARK
   // ============================================
   const checkY = 230
   doc.circle(pageWidth / 2, checkY, 35)
      .fill(emerald600)
   doc.circle(pageWidth / 2, checkY, 28)
      .lineWidth(3)
      .stroke('#ffffff')

   // Checkmark
   doc.strokeColor('#ffffff')
      .lineWidth(4)
      .moveTo(pageWidth / 2 - 12, checkY)
      .lineTo(pageWidth / 2 - 3, checkY + 10)
      .lineTo(pageWidth / 2 + 14, checkY - 8)
      .stroke()

   doc.fontSize(22)
      .fillColor(emerald700)
      .font('Helvetica-Bold')
      .text('Payment Received', 0, checkY + 50, { width: pageWidth, align: 'center' })

   doc.fontSize(12)
      .fillColor(slate500)
      .font('Helvetica')
      .text('Thank you for your payment', 0, checkY + 78, { width: pageWidth, align: 'center' })

   // ============================================
   // PAYMENT AMOUNT (BIG)
   // ============================================
   const amountY = 340
   doc.fontSize(48)
      .fillColor(emerald700)
      .font('Helvetica-Bold')
      .text(formatCurrency(payment.amount), 0, amountY, { width: pageWidth, align: 'center' })

   // ============================================
   // PAYMENT DETAILS CARD
   // ============================================
   const cardY = 420
   const cardWidth = pageWidth - (margin * 2)
   const cardHeight = 200

   doc.roundedRect(margin, cardY, cardWidth, cardHeight, 16)
      .fill(slate50)
   doc.roundedRect(margin, cardY, cardWidth, cardHeight, 16)
      .strokeColor(slate200)
      .lineWidth(1)
      .stroke()

   // Details grid
   const col1X = margin + 30
   const col2X = margin + cardWidth / 2 + 10
   const labelColor = slate500
   const valueColor = slate900

   let detailY = cardY + 25

   // Row 1
   doc.fontSize(9).fillColor(labelColor).font('Helvetica-Bold')
      .text('PAYMENT DATE', col1X, detailY)
   doc.fontSize(12).fillColor(valueColor).font('Helvetica')
      .text(formatDate(payment.paymentDate), col1X, detailY + 14)

   doc.fontSize(9).fillColor(labelColor).font('Helvetica-Bold')
      .text('PAYMENT METHOD', col2X, detailY)
   doc.fontSize(12).fillColor(valueColor).font('Helvetica')
      .text(formatMethod(payment.paymentMethod), col2X, detailY + 14)

   detailY += 50

   // Row 2
   doc.fontSize(9).fillColor(labelColor).font('Helvetica-Bold')
      .text('INVOICE NUMBER', col1X, detailY)
   doc.fontSize(12).fillColor(valueColor).font('Helvetica')
      .text(payment.invoice.invoiceNumber, col1X, detailY + 14)

   doc.fontSize(9).fillColor(labelColor).font('Helvetica-Bold')
      .text('REFERENCE', col2X, detailY)
   doc.fontSize(12).fillColor(valueColor).font('Helvetica')
      .text(payment.reference || '-', col2X, detailY + 14)

   detailY += 50

   // Divider
   doc.moveTo(col1X, detailY + 5)
      .lineTo(margin + cardWidth - 30, detailY + 5)
      .strokeColor(slate200)
      .lineWidth(1)
      .stroke()

   detailY += 25

   // Client details
   doc.fontSize(9).fillColor(labelColor).font('Helvetica-Bold')
      .text('RECEIVED FROM', col1X, detailY)
   doc.fontSize(14).fillColor(valueColor).font('Helvetica-Bold')
      .text(payment.invoice.client.name, col1X, detailY + 16)

   if (payment.invoice.client.email) {
      doc.fontSize(10).fillColor(slate500).font('Helvetica')
         .text(payment.invoice.client.email, col1X, detailY + 34)
   }

   // ============================================
   // FOOTER
   // ============================================
   doc.rect(0, pageHeight - 80, pageWidth, 80)
      .fill(emerald50)

   doc.fontSize(12)
      .fillColor(emerald700)
      .font('Helvetica-Bold')
      .text('Thank you for your business!', 0, pageHeight - 55, { width: pageWidth, align: 'center' })

   doc.fontSize(9)
      .fillColor(slate400)
      .font('Helvetica')
      .text(`This is an official receipt for payment received on ${formatDate(payment.paymentDate)}`, 0, pageHeight - 35, { width: pageWidth, align: 'center' })

   doc.fontSize(8)
      .fillColor(slate400)
      .text(`Generated ${formatDate(new Date())}`, 0, pageHeight - 20, { width: pageWidth, align: 'center' })

   doc.end()

   await new Promise<void>((resolve) => {
      doc.on('end', resolve)
   })

   const pdfBuffer = Buffer.concat(chunks)

   setResponseHeaders(event, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Receipt-${payment.id}.pdf"`,
      'Content-Length': pdfBuffer.length.toString()
   })

   return pdfBuffer
})

