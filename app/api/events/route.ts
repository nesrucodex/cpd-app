import { getEvents } from "@/lib/events"

export async function GET() {
    return Response.json({
        data: await getEvents(),
        success: true,
        message: "Events fetched successfully",
    })
}
