const bcrypt = require("bcrypt");
const pool = require("./pool");

const SALT_ROUNDS = 8;

const seed = async () => {
  await pool.query("DROP TABLE IF EXISTS rsvps");

  await pool.query("DROP TABLE IF EXISTS events");

  await pool.query("DROP TABLE IF EXISTS users");

  await pool.query(`
    CREATE TABLE users (
      user_id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE events (
      event_id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      event_type TEXT NOT NULL CHECK (
        event_type IN (
          'conference',
          'workshop',
          'social',
          'networking',
          'concert',
          'sports',
          'fundraiser',
          'other'
        )
      ),
      max_capacity INTEGER NOT NULL,
      user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE rsvps (
      rsvp_id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
      event_id INTEGER REFERENCES events(event_id) ON DELETE CASCADE,
      UNIQUE (user_id, event_id)
    )
  `);

  // 1. Hash the passwords first
  const jojoHash = await bcrypt.hash("jojo123", SALT_ROUNDS);
  const johnHash = await bcrypt.hash("john2", SALT_ROUNDS);
  const joeHash = await bcrypt.hash("openjoe", SALT_ROUNDS);

  // 2. Define a SQL query string that returns the user_id
  const insertUserSql =
    "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING user_id;";

  // 3. Execute queries and store the full result objects
  const jojoResponse = await pool.query(insertUserSql, ["jojo", jojoHash]);
  const johnResponse = await pool.query(insertUserSql, ["john", johnHash]);
  const joeResponse = await pool.query(insertUserSql, ["joe", joeHash]);

  // 4. Extract the IDs for later use (e.g., seeding bookmarks)
  const jojoId = jojoResponse.rows[0].user_id;
  const johnId = johnResponse.rows[0].user_id;
  const joeId = joeResponse.rows[0].user_id;

  // NEW: seed some bookmarks so the app has data to display on first load
  const insertEventSql = `
  INSERT INTO events (
    title,
    description,
    date,
    location,
    event_type,
    max_capacity,
    user_id
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7);`;

  await pool.query(insertEventSql, [
    "Tech Summit 2026",
    "Annual technology conference featuring industry speakers",
    "2026-06-10",
    "New York Convention Center",
    "conference",
    500,
    jojoId,
  ]);
  await pool.query(insertEventSql, [
    "JavaScript Workshop",
    "Hands-on JS fundamentals and advanced patterns",
    "2026-05-02",
    "Hoboken Tech Hub",
    "workshop",
    40,
    johnId,
  ]);
  await pool.query(insertEventSql, [
    "Rooftop Social Night",
    "Casual networking and drinks on the rooftop",
    "2026-05-15",
    "Manhattan Rooftop Lounge",
    "social",
    80,
    joeId,
  ]);
  await pool.query(insertEventSql, [
    "Startup Networking Brunch",
    "Meet founders and engineers over brunch",
    "2026-05-20",
    "Brooklyn Brunch Club",
    "networking",
    60,
    jojoId,
  ]);
  await pool.query(insertEventSql, [
    "Live Music Concert",
    "Indie bands performing live sets",
    "2026-06-01",
    "Madison Square Garden",
    "concert",
    10000,
    johnId,
  ]);
  await pool.query(insertEventSql, [
    "Charity Sports Run",
    "5K run supporting local charities",
    "2026-06-18",
    "Central Park",
    "sports",
    1000,
    joeId,
  ]);

  const insertRsvpSql = `
  INSERT INTO rsvps (
    user_id,
    event_id
  )
  VALUES ($1, $2);`;

  await pool.query(insertRsvpSql, [1, 1]);
  await pool.query(insertRsvpSql, [2, 2]);
  await pool.query(insertRsvpSql, [3, 3]);
  await pool.query(insertRsvpSql, [1, 4]);
  await pool.query(insertRsvpSql, [2, 5]);
  await pool.query(insertRsvpSql, [3, 6]);

  console.log("Database seeded.");
};

seed()
  .catch((err) => {
    console.error("Error seeding database:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
