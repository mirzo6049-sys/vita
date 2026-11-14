-- VITA schema. Runs once, on the first start of the database container.
CREATE TABLE IF NOT EXISTS crew (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  base_hr     NUMERIC NOT NULL,
  base_sys    NUMERIC NOT NULL,
  base_dia    NUMERIC NOT NULL,
  base_mass   NUMERIC NOT NULL,
  base_rt     NUMERIC NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS checkins (
  id           BIGSERIAL PRIMARY KEY,
  crew_id      TEXT NOT NULL REFERENCES crew(id),
  mission_day  INTEGER NOT NULL,
  hr           NUMERIC NOT NULL,
  sys          NUMERIC NOT NULL,
  dia          NUMERIC NOT NULL,
  spo2         NUMERIC NOT NULL,
  temp         NUMERIC NOT NULL,
  mass         NUMERIC NOT NULL,
  sleep        NUMERIC NOT NULL,
  res          NUMERIC NOT NULL,
  aer          NUMERIC NOT NULL,
  dose         NUMERIC NOT NULL,
  mood         SMALLINT NOT NULL CHECK (mood BETWEEN 1 AND 5),
  stress       SMALLINT NOT NULL CHECK (stress BETWEEN 1 AND 5),
  rt           NUMERIC NOT NULL,
  symptoms     TEXT[] NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (crew_id, mission_day)
);

CREATE TABLE IF NOT EXISTS sensor_readings (
  id          BIGSERIAL PRIMARY KEY,
  crew_id     TEXT NOT NULL REFERENCES crew(id),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  hr          NUMERIC, breathing NUMERIC, spo2 NUMERIC, skin_temp NUMERIC,
  sys         NUMERIC, dia NUMERIC, activity TEXT
);

INSERT INTO crew (id, name, base_hr, base_sys, base_dia, base_mass, base_rt)
VALUES ('CDR-1', 'Commander', 58, 118, 76, 74.0, 265)
ON CONFLICT (id) DO NOTHING;
