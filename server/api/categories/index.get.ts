

export default defineEventHandler(async () => {
  const categories = await prisma.serviceCategory.findMany({
    include: {
      _count: {
        select: { services: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return categories
})


