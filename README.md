# VITA Crew Health Monitor

Daily health self-check for astronauts on long missions. Team Novacode, NASA Space Apps Challenge 2026, Dushanbe.

## Stack

- `web/` — single-page app (HTML, CSS, JS) and video loops in `web/media/`
- `api/` — Node.js 20 + Express, serves the page and the REST API
- `db/init.sql` — PostgreSQL 16 schema: `crew`, `checkins`, `sensor_readings`
- `docker-compose.yml` — two services: `db` (Postgres) and `app` (API + web)

## Run

```bash
cp .env.example .env        # set a real POSTGRES_PASSWORD
docker compose up -d --build
```

Open http://localhost:3000 (port is `APP_PORT` in `.env`).
The schema in `db/init.sql` is applied on the first start of an empty database volume.

## API

| Method | Path | What it does |
|---|---|---|
| GET | `/api/health` | `{"ok":true}` when the database answers |
| GET | `/api/checkins?crew=CDR-1` | All check-ins of one crew member, by mission day |
| POST | `/api/checkins?crew=CDR-1` | Save one check-in or an array; same day is updated |
| DELETE | `/api/checkins?crew=CDR-1` | Remove all check-ins of one crew member |
| POST | `/api/sensors?crew=CDR-1` | Save one wearable sensor reading |

On first load with an empty database the page uploads its 30 days of sample data.
Without a server the page still works and keeps data in the browser.

## Notes

- Crew data and the sensor stream are simulated for the demo.
- Reference values (600 mSv career limit, 1.84 mSv/day transit dose, bone loss, sleep) are listed in the app under Reference data.
- Built with AI assistance. Research prototype, not a medical device.
