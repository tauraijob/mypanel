import PDFDocument from 'pdfkit'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Invalid quotation ID'
    })
  }

  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      client: true,
      items: true
    }
  })

  if (!quotation) {
    throw createError({
      statusCode: 404,
      message: 'Quotation not found'
    })
  }

  const settings = await prisma.settings.findFirst()
  
  const doc = new PDFDocument({
    size: 'A4',
    margin: 0,
    info: {
      Title: `Quotation ${quotation.quoteNumber}`,
      Author: settings?.companyName || 'MyPanel',
      Subject: `Quotation for ${quotation.client.name}`,
    }
  })

  const chunks: Buffer[] = []
  doc.on('data', (chunk) => chunks.push(chunk))

  // Purple theme colors matching the web design
  const purple600 = '#9333ea'
  const purple700 = '#7c3aed'
  const fuchsia600 = '#c026d3'
  const pink600 = '#db2777'
  const slate900 = '#0f172a'
  const slate700 = '#334155'
  const slate500 = '#64748b'
  const slate400 = '#94a3b8'
  const slate200 = '#e2e8f0'
  const slate100 = '#f1f5f9'
  const slate50 = '#f8fafc'
  const purple50 = '#faf5ff'
  const purple100 = '#f3e8ff'
  const emerald600 = '#059669'
  const rose600 = '#dc2626'
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

  const isExpired = new Date(quotation.validUntil) < new Date() && !['ACCEPTED', 'CONVERTED'].includes(quotation.status)

  // ============================================
  // WHITE BACKGROUND
  // ============================================
  doc.rect(0, 0, pageWidth, pageHeight).fill('#ffffff')

  // Decorative circles (purple theme)
  doc.circle(pageWidth + 60, -60, 220)
     .fill('#fdf4ff')
  doc.circle(-80, pageHeight + 40, 180)
     .fill('#fdf4ff')

  // ============================================
  // HEADER SECTION
  // ============================================
  
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
       .fill(purple700)
    
    const companyInitial = (settings?.companyName || 'M')[0].toUpperCase()
    doc.fontSize(44)
       .fillColor('#ffffff')
       .font('Helvetica-Bold')
       .text(companyInitial, margin, 60, { width: 90, align: 'center' })
  }

  // Status badge (right side)
  const statusColors: Record<string, { bg: string, text: string }> = {
    ACCEPTED: { bg: '#dcfce7', text: '#166534' },
    SENT: { bg: '#fef3c7', text: '#92400e' },
    DECLINED: { bg: '#fee2e2', text: '#991b1b' },
    DRAFT: { bg: '#f1f5f9', text: '#475569' },
    CONVERTED: { bg: '#f3e8ff', text: '#7c3aed' },
    EXPIRED: { bg: '#fee2e2', text: '#991b1b' }
  }
  const statusColor = statusColors[quotation.status] || statusColors.DRAFT

  doc.roundedRect(410, 40, 90, 24, 12)
     .fill(statusColor.bg)
  doc.circle(424, 52, 4)
     .fill(statusColor.text)
  doc.fontSize(10)
     .fillColor(statusColor.text)
     .font('Helvetica-Bold')
     .text(quotation.status, 434, 47, { width: 60 })

  // QUOTATION title
  doc.fontSize(30)
     .fillColor(slate900)
     .font('Helvetica-Bold')
     .text('QUOTATION', 350, 70, { width: 205, align: 'right' })
  
  doc.fontSize(12)
     .fillColor(slate400)
     .font('Helvetica')
     .text(`#${quotation.quoteNumber}`, 350, 103, { width: 205, align: 'right' })

  // Company address and contact on the RIGHT (below quotation number)
  let companyY = 120
  doc.fontSize(9).fillColor(slate500).font('Helvetica')
  if (settings?.companyAddress) {
    doc.text(settings.companyAddress, 350, companyY, { width: 205, align: 'right' })
    companyY += 12
  }
  if (settings?.companyCity) {
    doc.text(`${settings.companyCity}, ${settings.companyState || ''} ${settings.companyZip || ''}`, 350, companyY, { width: 205, align: 'right' })
    companyY += 12
  }
  if (settings?.companyEmail) {
    doc.text(settings.companyEmail, 350, companyY, { width: 205, align: 'right' })
    companyY += 12
  }
  if (settings?.companyPhone) {
    doc.text(settings.companyPhone, 350, companyY, { width: 205, align: 'right' })
  }

  // ============================================
  // PURPLE GRADIENT LINE
  // ============================================
  doc.rect(0, 170, pageWidth, 4)
     .fill(purple700)

  // ============================================
  // DETAILS SECTION
  // ============================================
  
  // Prepared For section
  doc.fontSize(8)
     .fillColor(purple600)
     .font('Helvetica-Bold')
     .text('PREPARED FOR', margin, 195)

  // Client card (purple tinted)
  doc.roundedRect(margin, 210, 280, 100, 12)
     .fill(purple50)
  doc.roundedRect(margin, 210, 280, 100, 12)
     .strokeColor(purple100)
     .lineWidth(1)
     .stroke()
  
  doc.fontSize(16)
     .fillColor(slate900)
     .font('Helvetica-Bold')
     .text(quotation.client.name, margin + 15, 225)
  
  if (quotation.client.company) {
    doc.fontSize(10)
       .fillColor(slate700)
       .font('Helvetica')
       .text(quotation.client.company, margin + 15, 245)
  }
  
  let clientY = quotation.client.company ? 260 : 245
  doc.fontSize(9).fillColor(slate500).font('Helvetica')
  doc.text(quotation.client.email, margin + 15, clientY)
  clientY += 12
  if (quotation.client.phone) {
    doc.text(quotation.client.phone, margin + 15, clientY)
    clientY += 12
  }
  if (quotation.client.billingAddress) {
    doc.text(quotation.client.billingAddress, margin + 15, clientY)
  }

  // Date cards (right side)
  const cardX = 360
  const cardWidth = 90
  
  // Issue Date card (purple)
  doc.roundedRect(cardX, 195, cardWidth, 50, 8)
     .fill(purple50)
  doc.fontSize(7)
     .fillColor(purple600)
     .font('Helvetica-Bold')
     .text('ISSUE DATE', cardX + 10, 205)
  doc.fontSize(10)
     .fillColor(slate900)
     .font('Helvetica-Bold')
     .text(formatDate(quotation.issueDate), cardX + 10, 220)

  // Valid Until card (amber/rose based on expiry)
  const validBg = isExpired ? '#fee2e2' : amber50
  const validColor = isExpired ? rose600 : amber600
  const validLabel = isExpired ? 'EXPIRED ON' : 'VALID UNTIL'
  
  doc.roundedRect(cardX + cardWidth + 10, 195, cardWidth, 50, 8)
     .fill(validBg)
  // Dashed border effect
  doc.roundedRect(cardX + cardWidth + 10, 195, cardWidth, 50, 8)
     .strokeColor(validColor)
     .lineWidth(1)
     .dash(4, { space: 3 })
     .stroke()
     .undash()
  
  doc.fontSize(7)
     .fillColor(validColor)
     .font('Helvetica-Bold')
     .text(validLabel, cardX + cardWidth + 18, 205)
  doc.fontSize(10)
     .fillColor(isExpired ? rose600 : slate900)
     .font('Helvetica-Bold')
     .text(formatDate(quotation.validUntil), cardX + cardWidth + 18, 220)

  // Quote Total card (purple gradient - solid for PDF)
  doc.roundedRect(cardX, 255, cardWidth * 2 + 10, 55, 8)
     .fill(purple700)
  doc.fontSize(7)
     .fillColor('#e9d5ff')
     .font('Helvetica-Bold')
     .text('QUOTE TOTAL', cardX + 12, 267)
  doc.fontSize(20)
     .fillColor('#ffffff')
     .font('Helvetica-Bold')
     .text(formatCurrency(quotation.total), cardX + 12, 282)

  // ============================================
  // ITEMS TABLE
  // ============================================
  
  const tableY = 330
  const tableWidth = pageWidth - (margin * 2)
  
  doc.fontSize(8)
     .fillColor(purple600)
     .font('Helvetica-Bold')
     .text('QUOTE ITEMS', margin, tableY - 15)

  // Table header (purple gradient - solid for PDF)
  doc.roundedRect(margin, tableY, tableWidth, 35, 8)
     .fill(purple700)

  doc.fontSize(9)
     .fillColor('#ffffff')
     .font('Helvetica-Bold')
     .text('Description', margin + 15, tableY + 13)
     .text('Qty', margin + 300, tableY + 13, { width: 40, align: 'center' })
     .text('Price', margin + 350, tableY + 13, { width: 60, align: 'right' })
     .text('Amount', margin + 420, tableY + 13, { width: 75, align: 'right' })

  // Table rows
  let rowY = tableY + 35
  quotation.items.forEach((item, index) => {
    if (index % 2 === 1) {
      doc.rect(margin, rowY, tableWidth, 30)
         .fill('#faf5ff') // Very light purple
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
     .text(formatCurrency(quotation.subtotal), totalsX + 80, totalsY, { width: 115, align: 'right' })
  totalsY += 20

  // Tax
  if (Number(quotation.taxAmount) > 0) {
    doc.fillColor(slate500)
       .font('Helvetica')
       .text('Tax', totalsX, totalsY)
    doc.fillColor(slate900)
       .font('Helvetica-Bold')
       .text(formatCurrency(quotation.taxAmount), totalsX + 80, totalsY, { width: 115, align: 'right' })
    totalsY += 20
  }

  // Discount
  if (Number(quotation.discount) > 0) {
    doc.fillColor(slate500)
       .font('Helvetica')
       .text('Discount', totalsX, totalsY)
    doc.fillColor(emerald600)
       .font('Helvetica-Bold')
       .text(`-${formatCurrency(quotation.discount)}`, totalsX + 80, totalsY, { width: 115, align: 'right' })
    totalsY += 20
  }

  // Divider (purple)
  doc.moveTo(totalsX, totalsY)
     .lineTo(pageWidth - margin, totalsY)
     .strokeColor(purple100)
     .lineWidth(2)
     .stroke()
  totalsY += 10

  // Total (purple styled)
  doc.fontSize(14)
     .fillColor(slate900)
     .font('Helvetica-Bold')
     .text('Total', totalsX, totalsY)
  doc.fontSize(22)
     .fillColor(purple700)
     .font('Helvetica-Bold')
     .text(formatCurrency(quotation.total), totalsX + 60, totalsY - 4, { width: 135, align: 'right' })
  totalsY += 35

  // ============================================
  // NOTES & TERMS
  // ============================================
  
  let footerY = Math.max(totalsY + 20, rowY + 100)

  if (quotation.notes) {
    doc.roundedRect(margin, footerY, 245, 70, 8)
       .fill(slate50)
    
    doc.circle(margin + 15, footerY + 15, 8)
       .fill(purple600)
    
    doc.fontSize(8)
       .fillColor(slate500)
       .font('Helvetica-Bold')
       .text('NOTES', margin + 30, footerY + 11)
    
    doc.fontSize(9)
       .fillColor(slate700)
       .font('Helvetica')
       .text(quotation.notes, margin + 12, footerY + 32, { width: 225 })
  }

  if (quotation.terms) {
    const termsX = quotation.notes ? 310 : margin
    doc.roundedRect(termsX, footerY, 245, 70, 8)
       .fill(slate50)
    
    doc.circle(termsX + 15, footerY + 15, 8)
       .fill(purple600)
    
    doc.fontSize(8)
       .fillColor(slate500)
       .font('Helvetica-Bold')
       .text('TERMS & CONDITIONS', termsX + 30, footerY + 11)
    
    doc.fontSize(9)
       .fillColor(slate700)
       .font('Helvetica')
       .text(quotation.terms, termsX + 12, footerY + 32, { width: 225 })
  }

  // ============================================
  // FOOTER
  // ============================================
  
  // Purple tinted footer
  doc.rect(0, pageHeight - 55, pageWidth, 55)
     .fill(purple50)

  // Validity indicator
  doc.circle(margin + 12, pageHeight - 32, 10)
     .fill(purple700)

  doc.fontSize(10)
     .fillColor(slate700)
     .font('Helvetica')
     .text('This quote is valid until ', margin + 30, pageHeight - 37)
  doc.fillColor(purple700)
     .font('Helvetica-Bold')
     .text(formatDate(quotation.validUntil), margin + 150, pageHeight - 37)

  doc.fontSize(8)
     .fillColor(slate400)
     .font('Helvetica')
     .text(`Generated ${formatDate(new Date())}`, margin, pageHeight - 18, { width: pageWidth - (margin * 2), align: 'right' })

  doc.end()

  await new Promise<void>((resolve) => {
    doc.on('end', resolve)
  })

  const pdfBuffer = Buffer.concat(chunks)

  setResponseHeaders(event, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${quotation.quoteNumber}.pdf"`,
    'Content-Length': pdfBuffer.length.toString()
  })

  return pdfBuffer
})
