"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"

type Props = {
  events: { id: number; title: string; seatsLeft: number }[]
}

export function AddRegistration({ events }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; message: string } | null>(null)
  const hasSeats = events.some(event => event.seatsLeft > 0)

  function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    setFeedback(null)

    startTransition(async () => {
      try {
        const response = await fetch(`/api/events/${values.get("eventId")}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: values.get("name"), email: values.get("email") }),
        })
        const result = await response.json()
        if (!response.ok) {
          setFeedback({ kind: "error", message: typeof result.message === "string" ? result.message : "Please check your name and email." })
          return
        }
        form.reset()
        setFeedback({ kind: "success", message: "You’re registered. Your seat is confirmed!" })
        router.refresh()
      } catch {
        setFeedback({ kind: "error", message: "Unable to register. Please try again." })
      }
    })
  }

  return (
    <form onSubmit={register} className="registration-form" aria-busy={isPending}>
      <fieldset disabled={isPending || !hasSeats}>
        <legend className="sr-only">Registration details</legend>
        <div className="form-field">
          <label htmlFor="eventId">Event</label>
          <select id="eventId" name="eventId" required defaultValue="">
            <option value="" disabled>Choose an event</option>
            {events.map(event => (
              <option key={event.id} value={event.id} disabled={event.seatsLeft === 0}>
                {event.title}{event.seatsLeft === 0 ? " (Fully booked)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" type="text" autoComplete="name" placeholder="Your full name" required maxLength={100} />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        </div>
        <button type="submit">{isPending ? "Registering…" : "Register for event"}<span aria-hidden="true">↗</span></button>
      </fieldset>
      {!hasSeats && <p className="form-note">Registration will open when seats are available.</p>}
      {feedback && <p className={`form-feedback ${feedback.kind}`} role={feedback.kind === "error" ? "alert" : "status"}>{feedback.message}</p>}
    </form>
  )
}
