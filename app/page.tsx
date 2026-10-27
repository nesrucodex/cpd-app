import { Suspense } from "react"
import { connection } from "next/server"
import { AddRegistration } from "@/components/AddRegistration"
import { getEvents } from "@/lib/events"

async function EventsContent() {
  await connection()
  const events = await getEvents()

  return (
    <>
      <section aria-labelledby="events-heading">
        <h2 id="events-heading">Upcoming events</h2>
        {events.length === 0 ? (
          <p>No events available.</p>
        ) : (
          <ul className="event-list">
            {events.map(event => (
              <li key={event.id}>
                <h3>{event.title}</h3>
                <time dateTime={event.date.toISOString()}>
                  {event.date.toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
                  })}
                </time>
                <p>{event.cpdHours} CPD hours · Capacity: {event.capacity} · {event.seatsLeft === 0 ? "Fully booked" : `${event.seatsLeft} seats left`}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="registration-heading">
        <h2 id="registration-heading">Register for an event</h2>
        <AddRegistration events={events.map(({ id, title, seatsLeft }) => ({ id, title, seatsLeft }))} />
      </section>
    </>
  )
}

export default function Home() {
  return (
    <main className="app-shell">
      <h1>CPD Events</h1>
      <p>View upcoming events and register below.</p>
      <Suspense fallback={<p role="status">Loading events…</p>}>
        <EventsContent />
      </Suspense>
    </main>
  )
}
