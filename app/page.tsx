import { Suspense } from "react"
import { connection } from "next/server"
import Link from "next/link"
import { AddRegistration } from "@/components/AddRegistration"
import { getEvents } from "@/lib/events"

async function EventsContent() {
  await connection()
  const events = await getEvents()
  const registrationOptions = events.map(event => ({
    id: event.id,
    title: event.title,
    seatsLeft: event.seatsLeft,
  }))

  return (
    <div className="events-layout">
      <section aria-labelledby="events-heading">
        <div className="section-heading">
          <h2 id="events-heading">Upcoming events</h2>
          <span className="event-count">{events.length} events</span>
        </div>
        {events.length === 0 ? (
          <p className="empty-state">No events are scheduled yet. Check back soon.</p>
        ) : (
          <ul className="event-list">
            {events.map(event => {
              const seatsLeft = event.seatsLeft
              return (
                <li className="event-card" key={event.id}>
                  <div className="event-card-heading">
                    <time dateTime={event.date.toISOString()}>
                      {event.date.toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
                      })}
                    </time>
                    <span className={`availability ${seatsLeft === 0 ? "is-full" : ""}`}>
                      {seatsLeft === 0 ? "Fully booked" : `${seatsLeft} seats left`}
                    </span>
                  </div>
                  <h3>{event.title}</h3>
                  <dl className="event-details">
                    <div><dt>CPD hours</dt><dd>{event.cpdHours} hours</dd></div>
                    <div><dt>Capacity</dt><dd>{event.capacity} attendees</dd></div>
                  </dl>
                </li>
              )
            })}
          </ul>
        )}
      </section>
      <aside className="registration-card" aria-labelledby="registration-heading">
        <p className="eyebrow">Your next step</p>
        <h2 id="registration-heading">Save your seat</h2>
        <p className="form-description">Choose an event and enter your details to register.</p>
        <AddRegistration events={registrationOptions} />
      </aside>
    </div>
  )
}

export default function Home() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="CPD home"><span className="brand-mark">CPD</span>Professional learning</Link>
        <span className="header-note">Keep learning. Keep growing.</span>
      </header>
      <main id="main-content">
        <div className="page-intro">
          <p className="eyebrow">Continuing professional development</p>
          <h1>A little learning.<br />A step forward.</h1>
          <p>Explore upcoming sessions, build your expertise, and make time for your professional growth.</p>
        </div>
        <Suspense fallback={<p className="empty-state" role="status">Loading events…</p>}>
          <EventsContent />
        </Suspense>
      </main>
      <footer className="site-footer">CPD · Continuing professional development</footer>
    </div>
  )
}
