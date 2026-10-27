import ENV from "@/config/env.config"
import { prisma } from "@/lib/db"


type Props = {
    params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: Props) {
    // check if the request header x-admin-key is equal to the ADMIN_KEY environment variable
    const adminKey = request.headers.get("x-admin-key")
    if (adminKey !== ENV.ADMIN_KEY) {
        return Response.json({ data: null, success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const eventId = Number(id)

    if (!Number.isSafeInteger(eventId) || eventId <= 0 || eventId > 2147483647) {
        return Response.json({ data: null, success: false, message: "Invalid event ID" }, { status: 400 })
    }

    try {
        const registrations = await prisma.event.findMany({
            where: { id: eventId },
            include: { members: true },
        })

        return Response.json({ data: registrations, success: true, message: "Registrations fetched successfully" }, { status: 200 })
    } catch (error) {
        console.error(error)
        return Response.json({ data: null, success: false, message: "Internal server error" }, { status: 500 })
    }
}   
