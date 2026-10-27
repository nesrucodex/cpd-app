import { prisma } from "@/lib/db"
import * as z from "zod"

const UserValidator = z.object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    email: z.email("Invalid email address"),
})

type Props = {
    params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: Props) {
    const { id } = await params
    const eventId = Number(id)

    if (!Number.isSafeInteger(eventId) || eventId <= 0 || eventId > 2147483647) {
        return Response.json({ data: null, success: false, message: "Invalid event ID" }, { status: 400 })
    }

    let body: unknown
    try {
        body = await request.json()
    } catch {
        return Response.json({ data: null, success: false, message: "Invalid JSON body" }, { status: 400 })
    }

    const result = UserValidator.safeParse(body)
    if (!result.success) {
        return Response.json({
            data: null,
            success: false,
            message: z.flattenError(result.error),
        }, { status: 400 })
    }

    const { name, email } = result.data

    try {
        return await prisma.$transaction(async (tx) => {
            const event = await tx.event.findUnique({
                where: { id: eventId },
                include: {
                    members: { where: { email }, select: { id: true } },
                    _count: { select: { members: true } },
                },
            })

            if (!event) {
                return Response.json({ data: null, success: false, message: "Event not found" }, { status: 404 })
            }

            if (event.members.length > 0) {
                return Response.json({ data: null, success: false, message: "You have already registered for this event" }, { status: 409 })
            }

            if (event._count.members >= event.capacity) {
                return Response.json({ data: null, success: false, message: "Event is full" }, { status: 400 })
            }

            const user = await tx.user.upsert({
                where: { email },
                create: { name, email, events: { connect: { id: eventId } } },
                update: { events: { connect: { id: eventId } } },
            })

            return Response.json({
                data: user,
                success: true,
                message: "Registered successfully",
            }, { status: 201 })
        })
    } catch (error) {
        console.error("Error registering for event:", error)
        return Response.json({ data: null, success: false, message: "Unable to register for event" }, { status: 500 })
    }
}
