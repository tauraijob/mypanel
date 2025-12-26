

export default defineEventHandler(async () => {
  const logs = await prisma.emailLog.findMany({
    orderBy: { sentAt: 'desc' },
    take: 100
  })

  return logs
})


