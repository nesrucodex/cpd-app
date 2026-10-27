import { prisma } from "@/lib/db"
const SEED = [
    {
        id: 1, title: "IFRS 17 Update", date: new Date("2026-12-05T00:00:00.000Z"), capacity: 3, cpdHours: 6
    },
    {
        id: 2, title: "Public Sector Auditing", date: new Date("2026-12-12T00:00:00.000Z"), capacity: 2, cpdHours: 4
    },
    {
        id: 3, title: "Tax Law Changes 2027", date: new Date("2027-01-09T00:00:00.000Z"), capacity: 5, cpdHours: 3
    },
]

async function seed() {
    const [, events] = await prisma.$transaction([
        prisma.event.deleteMany(),
        prisma.event.createMany({ data: SEED }),
    ])

    console.log(`Seeded ${events.count} events.`)
}

seed().catch((error) => {
    console.error("Error seeding data:", error)
    process.exitCode = 1
}).finally(async () => {
    await prisma.$disconnect()
})
