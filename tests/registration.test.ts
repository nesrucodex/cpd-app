import { afterAll, afterEach, beforeEach, describe, expect, test } from "bun:test"
import { POST } from "@/app/api/events/[id]/register/route"
import { GET } from "@/app/api/events/route"
import { prisma } from "@/lib/db"

let eventId: number
let email: string

beforeEach(async () => {
  email = `registration-test-${crypto.randomUUID()}@example.com`
  const event = await prisma.event.create({
    data: { title: "Registration test", date: new Date("2027-01-01T00:00:00Z"), capacity: 1, cpdHours: 2 },
  })
  eventId = event.id
})

afterEach(async () => {
  await prisma.event.deleteMany({ where: { id: eventId } })
  await prisma.user.deleteMany({ where: { email: { in: [email, `other-${email}`] } } })
})

afterAll(async () => {
  await prisma.$disconnect()
})

function register(address = email) {
  return POST(new Request(`http://localhost/api/events/${eventId}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test Attendee", email: address }),
  }), { params: Promise.resolve({ id: String(eventId) }) })
}

describe("event registration", () => {
  test("registers an attendee and updates seats left", async () => {
    const response = await register()
    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject({ success: true, data: { email } })

    const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId }, include: { members: true } })
    expect(event.members.map(member => member.email)).toEqual([email])

    const events = await (await GET()).json()
    expect(events.data.find((item: { id: number }) => item.id === eventId).seatsLeft).toBe(0)
  })

  test("rejects a duplicate registration without adding a second member", async () => {
    expect((await register()).status).toBe(201)
    const response = await register()
    expect(response.status).toBe(409)
    expect(await response.json()).toMatchObject({ success: false, message: "You have already registered for this event" })
    expect(await prisma.user.count({ where: { events: { some: { id: eventId } } } })).toBe(1)
  })

  test("rejects a full event without creating another attendee", async () => {
    expect((await register()).status).toBe(201)
    const response = await register(`other-${email}`)
    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({ success: false, message: "Event is full" })
    expect(await prisma.user.count({ where: { email: `other-${email}` } })).toBe(0)
    expect(await prisma.user.count({ where: { events: { some: { id: eventId } } } })).toBe(1)
  })
})
