# SoundTrack

A social platform revolving around albums, artists and their hits. Available reviewing + rating systems, calculating results based on Bayesian's average principle (https://en.wikipedia.org/wiki/Bayesian_average).
Users can communicate through real-time, live-only chat rooms about different topics (Albums/Artists).
Developed using Spring Boot + React, backed by MusicBrainz-sourced album data that is gracefully handled and loaded into the database (PostgreSQL).

## Running with Docker

Requires Docker and Docker Compose (https://www.docker.com/products/docker-desktop/).

1. Copy the environment template. The defaults work as-is for a local test run - only bother
   changing `POSTGRES_PASSWORD` and `JWT_SECRET` if you care about that for this environment:
   ```
   cp .env.example .env
   ```
2. Start everything:
   ```
   docker compose up --build
   ```
3. Open http://localhost:5173.

The database is seeded on first boot with Pink Floyd's discography and three accounts (password
`Password1!` for all):
- `demo`  / `demo@soundtrack.local` - regular user
- `fan`   / `fan@soundtrack.local` - regular user
- `admin` / `admin@soundtrack.local` - admin

To wipe everything and start clean: `docker compose down -v` (this deletes the database and
uploaded-image volumes).
