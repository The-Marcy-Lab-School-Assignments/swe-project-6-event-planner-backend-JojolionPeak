// NEW file — event model (mirrors the pattern in userModel.js)
const pool = require("../db/pool");

// Returns all events joined with the username of the owner.
// The JOIN is what makes the public feed possible — without it we'd only have user_id.
module.exports.list = async () => {
  const query = `
    SELECT events.event_id, title, description, date, location, event_type, max_capacity, events.user_id, users.username, COUNT(rsvp_id) AS rsvp_count
      FROM events
	      JOIN users ON users.user_id = events.user_id
	      LEFT JOIN rsvps ON rsvps.event_id = events.event_id
    GROUP BY events.event_id, users.username
    ORDER BY date DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Returns all events for a specific user
module.exports.listByUser = async (user_id) => {
  const query = `
    SELECT events.event_id, title, description, date, location, event_type, max_capacity, events.user_id, COUNT(rsvp_id) AS rsvp_count
      FROM events
	      JOIN users ON users.user_id = events.user_id
	      LEFT JOIN rsvps ON rsvps.event_id = events.event_id
    WHERE users.user_id = $1
    GROUP BY events.event_id
    ORDER BY date DESC;
  `;
  const { rows } = await pool.query(query, [user_id]);
  return rows;
};

// Creates a event owned by the user
module.exports.create = async (
  title,
  description,
  date,
  location,
  event_type,
  max_capacity,
  user_id
) => {
  const query = `
    INSERT INTO events (title, description, date, location, event_type, max_capacity, user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [
    title,
    description,
    date,
    location,
    event_type,
    max_capacity,
    user_id,
  ]);
  return rows[0];
};

// Finds a single event by id — used by updateEvent and deleteEvent before their
// ownership checks. Unlike users, the event URL only contains event_id, not user_id,
// so we have to look up the owner from the database rather than the URL params.
module.exports.find = async (event_id) => {
  const query = "SELECT * FROM events WHERE event_id = $1";
  const { rows } = await pool.query(query, [event_id]);
  return rows[0] || null;
};

// Updates a event's title and url
module.exports.update = async (
  event_id,
  title,
  description,
  date,
  location,
  event_type,
  max_capacity
) => {
  const query = `
    UPDATE events
    SET title = COALESCE($2, title),
    description = COALESCE($3, description),
    date = COALESCE($4, date),
    location = COALESCE($5, location),
    event_type = COALESCE($6, event_type),
    max_capacity = COALESCE($7, max_capacity)
    WHERE event_id = $1
    RETURNING title, description, date, location, event_type, max_capacity
  `;
  const { rows } = await pool.query(query, [
    event_id,
    title,
    description,
    date,
    location,
    event_type,
    max_capacity,
  ]);
  return rows[0] || null;
};

// Deletes a event — returns the deleted row or null
module.exports.destroy = async (event_id) => {
  const query = `
    DELETE FROM events
    WHERE event_id = $1
    RETURNING *
  `;
  const { rows } = await pool.query(query, [event_id]);
  return rows[0] || null;
};
