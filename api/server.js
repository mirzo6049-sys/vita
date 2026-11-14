// VITA API: serves the web app and stores check-ins in PostgreSQL.
const path = require("path");
const express = require("express");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express();
app.use(express.json({ limit: "100kb" }));

const NUM = ["hr","sys","dia","spo2","temp","mass","sleep","res","aer","dose","rt"];
const toEntry = r => ({
  day: r.mission_day, mood: r.mood, stress: r.stress, sym: r.symptoms,
  ...Object.fromEntries(NUM.map(k => [k, Number(r[k])]))
});

app.get("/api/health", async (_req, res) => {
  try { await pool.query("SELECT 1"); res.json({ ok: true }); }
  catch (e) { res.status(503).json({ ok: false, error: "database unavailable" }); }
});

app.get("/api/checkins", async (req, res) => {
  const crew = req.query.crew || "CDR-1";
  try {
    const { rows } = await pool.query(
      "SELECT * FROM checkins WHERE crew_id=$1 ORDER BY mission_day", [crew]);
    res.json(rows.map(toEntry));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/checkins", async (req, res) => {
  const crew = req.query.crew || "CDR-1";
  const list = Array.isArray(req.body) ? req.body : [req.body];
  for (const e of list) {
    if (!Number.isInteger(e.day) || NUM.some(k => typeof e[k] !== "number" || !isFinite(e[k])))
      return res.status(400).json({ error: "Each check-in needs day and numeric " + NUM.join(", ") });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const e of list) {
      await client.query(
        `INSERT INTO checkins (crew_id, mission_day, ${NUM.join(",")}, mood, stress, symptoms)
         VALUES ($1,$2,${NUM.map((_, i) => "$" + (i + 3)).join(",")},$14,$15,$16)
         ON CONFLICT (crew_id, mission_day) DO UPDATE SET
         ${NUM.map(k => `${k}=EXCLUDED.${k}`).join(",")}, mood=EXCLUDED.mood,
         stress=EXCLUDED.stress, symptoms=EXCLUDED.symptoms`,
        [crew, e.day, ...NUM.map(k => e[k]), e.mood, e.stress, e.sym || []]);
    }
    await client.query("COMMIT");
    res.status(201).json({ saved: list.length });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: e.message });
  } finally { client.release(); }
});

app.delete("/api/checkins", async (req, res) => {
  const crew = req.query.crew || "CDR-1";
  try { await pool.query("DELETE FROM checkins WHERE crew_id=$1", [crew]); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/sensors", async (req, res) => {
  const crew = req.query.crew || "CDR-1", s = req.body || {};
  try {
    await pool.query(
      "INSERT INTO sensor_readings (crew_id,hr,breathing,spo2,skin_temp,sys,dia,activity) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
      [crew, s.hr, s.br, s.spo2, s.temp, s.sys, s.dia, s.act]);
    res.status(201).json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.use(express.static(process.env.WEB_DIR || path.join(__dirname, "..", "web")));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log("VITA listening on " + port));
