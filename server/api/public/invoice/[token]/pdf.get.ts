import PDFDocument from 'pdfkit'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { verifyPublicToken } from '../../../../utils/publicToken'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token') || ''

  const verified = verifyPublicToken(token)
  
  if (!verified || verified.type !== 'invoice') {
    throw createError({
      statusCode: 404,
      message: 'Invoice not found'
    })
  }

  // Use the same PDF generation as the internal endpoint
  const invoice = await prisma.invoice.findUnique({
    where: { id: verified.id },
    include: {
      client: true,
      items: {
        include: {
          service: true
        }
      },
      payments: {
        orderBy: { paymentDate: 'desc' }
      }
    }
  })

  if (!invoice) {
    throw createError({
      statusCode: 404,
      message: 'Invoice not found'
    })
  }

  const settings = await prisma.settings.findFirst()
  
  // Import and reuse the PDF generation logic
  const doc = new PDFDocument({
    size: 'A4',
    margin: 0,
    info: {
      Title: `Invoice ${invoice.invoiceNumber}`,
      Author: settings?.companyName || 'MyPanel',
      Subject: `Invoice for ${invoice.client.name}`,
    }
  })

  const chunks: Buffer[] = []
  doc.on('data', (chunk) => chunks.push(chunk))

  // Colors
  const primaryBlue = '#2563eb'
  const slate900 = '#0f172a'
  const slate500 = '#64748b'
  const slate400 = '#94a3b8'
  const slate200 = '#e2e8f0'
  const slate50 = '#f8fafc'
  const emerald600 = '#059669'
  const amber600 = '#d97706'
  const amber50 = '#fffbeb'

  const pageWidth = 595
  const pageHeight = 842
  const margin = 40

  const formatCurrency = (amount: number | any) => {
    const symbol = settings?.currencySymbol || '$'
    return `${symbol}${Number(amount).toFixed(2)}`
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Background
  doc.rect(0, 0, pageWidth, pageHeight).fill('#ffffff')
  doc.circle(pageWidth + 50, -50, 200).fill('#f0f9ff')

  // Logo
  let hasLogo = false
  if (settings?.logoUrl?.startsWith('/uploads/')) {
    try {
      const logoPath = join(process.cwd(), 'public', settings.logoUrl)
      if (existsSync(logoPath)) {
        const logoBuffer = await readFile(logoPath)
        doc.image(logoBuffer, margin, 25, { fit: [120, 120], align: 'center', valign: 'center' })
        hasLogo = true
      }
    } catch (error) {
      console.error('Failed to load logo:', error)
    }
  }
  
  if (!hasLogo) {
    doc.roundedRect(margin, 35, 90, 90, 14).fill(primaryBlue)
    const companyInitial = (settings?.companyName || 'M')[0].toUpperCase()
    doc.fontSize(44).fillColor('#ffffff').font('Helvetica-Bold')
       .text(companyInitial, margin, 60, { width: 90, align: 'center' })
  }

  // Status badge
  const statusColors: Record<string, { bg: string, text: string }> = {
    PAID: { bg: '#dcfce7', text: '#166534' },
    SENT: { bg: '#fef3c7', text: '#92400e' },
    PARTIALLY_PAID: { bg: '#fef3c7', text: '#92400e' },
    OVERDUE: { bg: '#fee2e2', text: '#991b1b' },
    DRAFT: { bg: '#f1f5f9', text: '#475569' },
    CANCELLED: { bg: '#f3f4f6', text: '#6b7280' }
  }
  const statusColor = statusColors[invoice.status] || statusColors.DRAFT

  doc.roundedRect(420, 40, 80, 24, 12).fill(statusColor.bg)
  doc.circle(432, 52, 4).fill(statusColor.text)
  doc.fontSize(10).fillColor(statusColor.text).font('Helvetica-Bold')
     .text(invoice.status, 440, 47, { width: 55 })

  // Title
  doc.fontSize(32).fillColor(slate900).font('Helvetica-Bold')
     .text('INVOICE', 380, 70, { width: 175, align: 'right' })
  doc.fontSize(12).fillColor(slate400).font('Helvetica')
     .text(`#${invoice.invoiceNumber}`, 380, 105, { width: 175, align: 'right' })

  // Company address
  let companyY = 125
  doc.fontSize(9).fillColor(slate500).font('Helvetica')
  if (settings?.companyAddress) {
    doc.text(settings.companyAddress, 380, companyY, { width: 175, align: 'right' })
    companyY += 12
  }
  if (settings?.companyCity) {
    doc.text(`${settings.companyCity}, ${settings.companyState || ''} ${settings.companyZip || ''}`, 380, companyY, { width: 175, align: 'right' })
    companyY += 12
  }
  if (settings?.companyEmail) {
    doc.text(settings.companyEmail, 380, companyY, { width: 175, align: 'right' })
  }

  // Divider
  doc.moveTo(margin, 175).lineTo(pageWidth - margin, 175).strokeColor(slate200).lineWidth(1).stroke()

  // Bill To
  doc.fontSize(8).fillColor(primaryBlue).font('Helvetica-Bold').text('BILL TO', margin, 195)
  doc.roundedRect(margin, 210, 280, 100, 12).fill(slate50)
  doc.fontSize(16).fillColor(slate900).font('Helvetica-Bold').text(invoice.client.name, margin + 15, 225)
  if (invoice.client.company) {
    doc.fontSize(10).fillColor('#334155').font('Helvetica').text(invoice.client.company, margin + 15, 245)
  }
  doc.fontSize(9).fillColor(slate500).font('Helvetica').text(invoice.client.email, margin + 15, invoice.client.company ? 260 : 245)

  // Date cards
  const cardX = 360
  doc.roundedRect(cardX, 195, 90, 50, 8).fill('#eff6ff')
  doc.fontSize(7).fillColor(primaryBlue).font('Helvetica-Bold').text('ISSUE DATE', cardX + 10, 205)
  doc.fontSize(10).fillColor(slate900).font('Helvetica-Bold').text(formatDate(invoice.issueDate), cardX + 10, 220)

  doc.roundedRect(cardX + 100, 195, 90, 50, 8).fill(amber50)
  doc.fontSize(7).fillColor(amber600).font('Helvetica-Bold').text('DUE DATE', cardX + 110, 205)
  doc.fontSize(10).fillColor(slate900).font('Helvetica-Bold').text(formatDate(invoice.dueDate), cardX + 110, 220)

  doc.roundedRect(cardX, 255, 190, 55, 8).fill(slate900)
  doc.fontSize(7).fillColor(slate400).font('Helvetica-Bold').text('AMOUNT DUE', cardX + 12, 267)
  doc.fontSize(20).fillColor('#ffffff').font('Helvetica-Bold')
     .text(formatCurrency(Number(invoice.total) - Number(invoice.amountPaid)), cardX + 12, 282)

  // Items table
  const tableY = 330
  const tableWidth = pageWidth - (margin * 2)
  
  doc.fontSize(8).fillColor(primaryBlue).font('Helvetica-Bold').text('INVOICE ITEMS', margin, tableY - 15)
  doc.roundedRect(margin, tableY, tableWidth, 35, 8).fill(slate900)
  doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold')
     .text('Description', margin + 15, tableY + 13)
     .text('Qty', margin + 300, tableY + 13, { width: 40, align: 'center' })
     .text('Price', margin + 350, tableY + 13, { width: 60, align: 'right' })
     .text('Amount', margin + 420, tableY + 13, { width: 75, align: 'right' })

  let rowY = tableY + 35
  invoice.items.forEach((item, index) => {
    if (index % 2 === 1) doc.rect(margin, rowY, tableWidth, 30).fill('#fafafa')
    doc.fontSize(10).fillColor('#334155').font('Helvetica')
       .text(item.description, margin + 15, rowY + 10, { width: 280 })
       .text(item.quantity.toString(), margin + 300, rowY + 10, { width: 40, align: 'center' })
       .text(formatCurrency(item.unitPrice), margin + 350, rowY + 10, { width: 60, align: 'right' })
       .fillColor(slate900).font('Helvetica-Bold')
       .text(formatCurrency(item.amount), margin + 420, rowY + 10, { width: 75, align: 'right' })
    rowY += 30
  })
  doc.roundedRect(margin, tableY, tableWidth, rowY - tableY, 8).strokeColor(slate200).lineWidth(1).stroke()

  // Totals
  const totalsX = 360
  let totalsY = rowY + 20
  doc.fontSize(10).fillColor(slate500).font('Helvetica').text('Subtotal', totalsX, totalsY)
  doc.fillColor(slate900).font('Helvetica-Bold').text(formatCurrency(invoice.subtotal), totalsX + 80, totalsY, { width: 115, align: 'right' })
  totalsY += 20

  if (Number(invoice.taxAmount) > 0) {
    doc.fillColor(slate500).font('Helvetica').text('Tax', totalsX, totalsY)
    doc.fillColor(slate900).font('Helvetica-Bold').text(formatCurrency(invoice.taxAmount), totalsX + 80, totalsY, { width: 115, align: 'right' })
    totalsY += 20
  }

  if (Number(invoice.discount) > 0) {
    doc.fillColor(slate500).font('Helvetica').text('Discount', totalsX, totalsY)
    doc.fillColor(emerald600).font('Helvetica-Bold').text(`-${formatCurrency(invoice.discount)}`, totalsX + 80, totalsY, { width: 115, align: 'right' })
    totalsY += 20
  }

  doc.moveTo(totalsX, totalsY).lineTo(pageWidth - margin, totalsY).strokeColor(slate200).lineWidth(2).stroke()
  totalsY += 10
  doc.fontSize(14).fillColor(slate900).font('Helvetica-Bold').text('Total', totalsX, totalsY)
  doc.fontSize(18).text(formatCurrency(invoice.total), totalsX + 80, totalsY - 2, { width: 115, align: 'right' })

  // Footer
  doc.rect(0, pageHeight - 50, pageWidth, 50).fill(slate50)
  doc.fontSize(10).fillColor(slate500).font('Helvetica')
     .text(settings?.invoiceFooter || 'Thank you for your business!', margin, pageHeight - 35, { width: pageWidth - (margin * 2), align: 'center' })

  doc.end()

  await new Promise<void>((resolve) => {
    doc.on('end', resolve)
  })

  const pdfBuffer = Buffer.concat(chunks)

  setResponseHeaders(event, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    'Content-Length': pdfBuffer.length.toString()
  })

  return pdfBuffer
})

