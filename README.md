Code: 02

## Development

Requires Bun, Make, and a PostgreSQL connection in `.env` (`DATABASE_URL`). Set `ADMIN_KEY` for the admin registrations endpoint.

```sh
bun install
bunx --bun prisma migrate deploy
bunx --bun prisma generate
make seed   # Replaces events with the three sample events
make dev    # Starts the app at http://localhost:3000
make test   # Runs the three registration integration tests
make check  # Runs TypeScript and ESLint
```

Tests use the configured PostgreSQL database, create their own events and attendees, and remove those records afterward. They cover successful registration, duplicate registration, and full events.
