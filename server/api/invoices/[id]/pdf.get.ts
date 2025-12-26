import PDFDocument from 'pdfkit'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid invoice ID'
    })
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id },
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

  // Colors matching the web design
  const primaryBlue = '#2563eb'
  const darkSlate = '#1e293b'
  const slate900 = '#0f172a'
  const slate700 = '#334155'
  const slate500 = '#64748b'
  const slate400 = '#94a3b8'
  const slate200 = '#e2e8f0'
  const slate100 = '#f1f5f9'
  const slate50 = '#f8fafc'
  const emerald600 = '#059669'
  const emerald50 = '#ecfdf5'
  const amber600 = '#d97706'
  const amber50 = '#fffbeb'
  const rose600 = '#dc2626'

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

  // ============================================
  // HEADER SECTION - Company & Invoice Title
  // ============================================
  
  // White background
  doc.rect(0, 0, pageWidth, pageHeight).fill('#ffffff')

  // Decorative circle (top right) - subtle
  doc.circle(pageWidth + 50, -50, 200)
     .fill('#f0f9ff')

  // Company logo on the LEFT - bigger and proportional with right side
  let hasLogo = false
  if (settings?.logoUrl) {
    try {
      // Handle local file upload
      if (settings.logoUrl.startsWith('/uploads/')) {
        const logoPath = join(process.cwd(), 'public', settings.logoUrl)
        if (existsSync(logoPath)) {
          const logoBuffer = await readFile(logoPath)
          // Use fit to preserve aspect ratio within a 120x120 box
          doc.image(logoBuffer, margin, 25, { fit: [120, 120], align: 'center', valign: 'center' })
          hasLogo = true
        }
      }
    } catch (error) {
      console.error('Failed to load logo:', error)
    }
  }
  
  // Fallback to initial letter if no logo
  if (!hasLogo) {
    doc.roundedRect(margin, 35, 90, 90, 14)
       .fill(primaryBlue)
    
    const companyInitial = (settings?.companyName || 'M')[0].toUpperCase()
    doc.fontSize(44)
       .fillColor('#ffffff')
       .font('Helvetica-Bold')
       .text(companyInitial, margin, 60, { width: 90, align: 'center' })
  }

  // Status badge (right side)
  const statusColors: Record<string, { bg: string, text: string }> = {
    PAID: { bg: '#dcfce7', text: '#166534' },
    SENT: { bg: '#fef3c7', text: '#92400e' },
    PARTIALLY_PAID: { bg: '#fef3c7', text: '#92400e' },
    OVERDUE: { bg: '#fee2e2', text: '#991b1b' },
    DRAFT: { bg: '#f1f5f9', text: '#475569' },
    CANCELLED: { bg: '#f3f4f6', text: '#6b7280' }
  }
  const statusColor = statusColors[invoice.status] || statusColors.DRAFT

  doc.roundedRect(420, 40, 80, 24, 12)
     .fill(statusColor.bg)
  doc.circle(432, 52, 4)
     .fill(statusColor.text)
  doc.fontSize(10)
     .fillColor(statusColor.text)
     .font('Helvetica-Bold')
     .text(invoice.status, 440, 47, { width: 55 })

  // INVOICE title
  doc.fontSize(32)
     .fillColor(slate900)
     .font('Helvetica-Bold')
     .text('INVOICE', 380, 70, { width: 175, align: 'right' })
  
  doc.fontSize(12)
     .fillColor(slate400)
     .font('Helvetica')
     .text(`#${invoice.invoiceNumber}`, 380, 105, { width: 175, align: 'right' })

  // Company address and contact on the RIGHT (below invoice number)
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
    companyY += 12
  }
  if (settings?.companyPhone) {
    doc.text(settings.companyPhone, 380, companyY, { width: 175, align: 'right' })
  }

  // ============================================
  // DIVIDER LINE
  // ============================================
  doc.moveTo(margin, 175)
     .lineTo(pageWidth - margin, 175)
     .strokeColor(slate200)
     .lineWidth(1)
     .stroke()

  // ============================================
  // DETAILS SECTION
  // ============================================
  
  // Bill To section
  doc.fontSize(8)
     .fillColor(primaryBlue)
     .font('Helvetica-Bold')
     .text('BILL TO', margin, 195)

  // Client card
  doc.roundedRect(margin, 210, 280, 100, 12)
     .fill(slate50)
  
  doc.fontSize(16)
     .fillColor(slate900)
     .font('Helvetica-Bold')
     .text(invoice.client.name, margin + 15, 225)
  
  if (invoice.client.company) {
    doc.fontSize(10)
       .fillColor(slate700)
       .font('Helvetica')
       .text(invoice.client.company, margin + 15, 245)
  }
  
  let clientY = invoice.client.company ? 260 : 245
  doc.fontSize(9).fillColor(slate500).font('Helvetica')
  doc.text(invoice.client.email, margin + 15, clientY)
  clientY += 12
  if (invoice.client.phone) {
    doc.text(invoice.client.phone, margin + 15, clientY)
    clientY += 12
  }
  if (invoice.client.billingAddress) {
    doc.text(invoice.client.billingAddress, margin + 15, clientY)
    clientY += 12
  }
  if (invoice.client.billingCity) {
    doc.text(`${invoice.client.billingCity}, ${invoice.client.billingState || ''} ${invoice.client.billingZip || ''}`, margin + 15, clientY)
  }

  // Date cards (right side)
  const cardX = 360
  const cardWidth = 90
  
  // Issue Date card (blue)
  doc.roundedRect(cardX, 195, cardWidth, 50, 8)
     .fill('#eff6ff')
  doc.fontSize(7)
     .fillColor(primaryBlue)
     .font('Helvetica-Bold')
     .text('ISSUE DATE', cardX + 10, 205)
  doc.fontSize(10)
     .fillColor(slate900)
     .font('Helvetica-Bold')
     .text(formatDate(invoice.issueDate), cardX + 10, 220)

  // Due Date card (amber)
  doc.roundedRect(cardX + cardWidth + 10, 195, cardWidth, 50, 8)
     .fill(amber50)
  doc.fontSize(7)
     .fillColor(amber600)
     .font('Helvetica-Bold')
     .text('DUE DATE', cardX + cardWidth + 20, 205)
  doc.fontSize(10)
     .fillColor(slate900)
     .font('Helvetica-Bold')
     .text(formatDate(invoice.dueDate), cardX + cardWidth + 20, 220)

  // Amount Due card (dark)
  doc.roundedRect(cardX, 255, cardWidth * 2 + 10, 55, 8)
     .fill(slate900)
  doc.fontSize(7)
     .fillColor(slate400)
     .font('Helvetica-Bold')
     .text('AMOUNT DUE', cardX + 12, 267)
  doc.fontSize(20)
     .fillColor('#ffffff')
     .font('Helvetica-Bold')
     .text(formatCurrency(Number(invoice.total) - Number(invoice.amountPaid)), cardX + 12, 282)

  // ============================================
  // ITEMS TABLE
  // ============================================
  
  const tableY = 330
  const tableWidth = pageWidth - (margin * 2)
  
  doc.fontSize(8)
     .fillColor(primaryBlue)
     .font('Helvetica-Bold')
     .text('INVOICE ITEMS', margin, tableY - 15)

  // Table header
  doc.roundedRect(margin, tableY, tableWidth, 35, 8)
     .fill(slate900)

  doc.fontSize(9)
     .fillColor('#ffffff')
     .font('Helvetica-Bold')
     .text('Description', margin + 15, tableY + 13)
     .text('Qty', margin + 300, tableY + 13, { width: 40, align: 'center' })
     .text('Price', margin + 350, tableY + 13, { width: 60, align: 'right' })
     .text('Amount', margin + 420, tableY + 13, { width: 75, align: 'right' })

  // Table rows
  let rowY = tableY + 35
  invoice.items.forEach((item, index) => {
    if (index % 2 === 1) {
      doc.rect(margin, rowY, tableWidth, 30)
         .fill('#fafafa')
    }
    
    doc.fontSize(10)
       .fillColor(slate700)
       .font('Helvetica')
       .text(item.description, margin + 15, rowY + 10, { width: 280 })
       .text(item.quantity.toString(), margin + 300, rowY + 10, { width: 40, align: 'center' })
       .text(formatCurrency(item.unitPrice), margin + 350, rowY + 10, { width: 60, align: 'right' })
       .fillColor(slate900)
       .font('Helvetica-Bold')
       .text(formatCurrency(item.amount), margin + 420, rowY + 10, { width: 75, align: 'right' })
    
    rowY += 30
  })

  // Table border
  doc.roundedRect(margin, tableY, tableWidth, rowY - tableY, 8)
     .strokeColor(slate200)
     .lineWidth(1)
     .stroke()

  // ============================================
  // TOTALS SECTION
  // ============================================
  
  const totalsX = 360
  let totalsY = rowY + 20

  doc.fontSize(10).font('Helvetica')
  
  // Subtotal
  doc.fillColor(slate500)
     .text('Subtotal', totalsX, totalsY)
  doc.fillColor(slate900)
     .font('Helvetica-Bold')
     .text(formatCurrency(invoice.subtotal), totalsX + 80, totalsY, { width: 115, align: 'right' })
  totalsY += 20

  // Tax
  if (Number(invoice.taxAmount) > 0) {
    doc.fillColor(slate500)
       .font('Helvetica')
       .text('Tax', totalsX, totalsY)
    doc.fillColor(slate900)
       .font('Helvetica-Bold')
       .text(formatCurrency(invoice.taxAmount), totalsX + 80, totalsY, { width: 115, align: 'right' })
    totalsY += 20
  }

  // Discount
  if (Number(invoice.discount) > 0) {
    doc.fillColor(slate500)
       .font('Helvetica')
       .text('Discount', totalsX, totalsY)
    doc.fillColor(emerald600)
       .font('Helvetica-Bold')
       .text(`-${formatCurrency(invoice.discount)}`, totalsX + 80, totalsY, { width: 115, align: 'right' })
    totalsY += 20
  }

  // Divider
  doc.moveTo(totalsX, totalsY)
     .lineTo(pageWidth - margin, totalsY)
     .strokeColor(slate200)
     .lineWidth(2)
     .stroke()
  totalsY += 10

  // Total
  doc.fontSize(14)
     .fillColor(slate900)
     .font('Helvetica-Bold')
     .text('Total', totalsX, totalsY)
  doc.fontSize(18)
     .text(formatCurrency(invoice.total), totalsX + 80, totalsY - 2, { width: 115, align: 'right' })
  totalsY += 30

  // Paid amount box (if any)
  if (Number(invoice.amountPaid) > 0) {
    doc.roundedRect(totalsX - 10, totalsY, 205, 55, 8)
       .fill(emerald50)
    
    doc.fontSize(10)
       .fillColor(emerald600)
       .font('Helvetica')
       .text('Amount Paid', totalsX, totalsY + 10)
    doc.font('Helvetica-Bold')
       .text(`-${formatCurrency(invoice.amountPaid)}`, totalsX + 80, totalsY + 10, { width: 105, align: 'right' })
    
    doc.fontSize(12)
       .fillColor(emerald600)
       .font('Helvetica-Bold')
       .text('Balance Due', totalsX, totalsY + 32)
    doc.fontSize(14)
       .text(formatCurrency(Number(invoice.total) - Number(invoice.amountPaid)), totalsX + 80, totalsY + 30, { width: 105, align: 'right' })
    
    totalsY += 65
  }

  // ============================================
  // BANK DETAILS & NOTES
  // ============================================
  
  let footerY = Math.max(totalsY + 20, rowY + 130)

  if (settings?.bankDetails) {
    doc.roundedRect(margin, footerY, 250, 80, 8)
       .fill('#eff6ff')
    
    doc.circle(margin + 15, footerY + 15, 8)
       .fill(primaryBlue)
    
    doc.fontSize(8)
       .fillColor(primaryBlue)
       .font('Helvetica-Bold')
       .text('PAYMENT DETAILS', margin + 30, footerY + 11)
    
    doc.fontSize(9)
       .fillColor(slate700)
       .font('Helvetica')
       .text(settings.bankDetails, margin + 12, footerY + 30, { width: 230 })
  }

  if (invoice.notes) {
    const notesX = settings?.bankDetails ? 310 : margin
    doc.roundedRect(notesX, footerY, 245, 80, 8)
       .fill(slate50)
    
    doc.fontSize(8)
       .fillColor(slate500)
       .font('Helvetica-Bold')
       .text('NOTES', notesX + 12, footerY + 12)
    
    doc.fontSize(9)
       .fillColor(slate700)
       .font('Helvetica')
       .text(invoice.notes, notesX + 12, footerY + 28, { width: 225 })
  }

  // ============================================
  // FOOTER
  // ============================================
  
  doc.rect(0, pageHeight - 50, pageWidth, 50)
     .fill(slate50)

  doc.fontSize(10)
     .fillColor(slate500)
     .font('Helvetica')
     .text(settings?.invoiceFooter || 'Thank you for your business!', margin, pageHeight - 35, { width: pageWidth - (margin * 2), align: 'center' })

  doc.fontSize(8)
     .fillColor(slate400)
     .text(`Generated ${formatDate(new Date())}`, margin, pageHeight - 20, { width: pageWidth - (margin * 2), align: 'center' })

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
