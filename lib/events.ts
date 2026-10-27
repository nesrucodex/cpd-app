import { prisma } from "@/lib/db"

export async function getEvents() {
  const events = await prisma.event.findMany({
    include: { _count: { select: { members: true } } },
    orderBy: { date: "asc" },
  })

  return events.map(({ _count, ...event }) => ({
    ...event,
    seatsLeft: Math.max(0, event.capacity - _count.members),
  }))
}
