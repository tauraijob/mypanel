import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No file uploaded'
      })
    }

    const file = formData[0]
    
    if (!file.type?.startsWith('image/')) {
      throw createError({
        statusCode: 400,
        message: 'File must be an image'
      })
    }

    // Validate file size (max 2MB)
    if (file.data.length > 2 * 1024 * 1024) {
      throw createError({
        statusCode: 400,
        message: 'File size must be less than 2MB'
      })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const extension = file.filename?.split('.').pop() || 'png'
    const filename = `logo-${Date.now()}.${extension}`
    const filepath = join(uploadsDir, filename)

    // Save file
    await writeFile(filepath, file.data)

    // Return the public URL
    const logoUrl = `/uploads/${filename}`

    // Update settings with new logo URL
    await prisma.settings.updateMany({
      data: { logoUrl }
    })

    return { 
      success: true, 
      logoUrl,
      message: 'Logo uploaded successfully'
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to upload file'
    })
  }
})

