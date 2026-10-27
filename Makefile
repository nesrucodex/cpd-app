.PHONY: dev seed test check

dev:
	bun run dev

seed:
	bunx --bun prisma db seed

test:
	bun test ./tests/registration.test.ts

check:
	bunx tsc --noEmit
	bun run lint
