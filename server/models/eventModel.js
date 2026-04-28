// NEW file — event model (mirrors the pattern in userModel.js)
const pool = require("../db/pool");

// Returns all events joined with the username of the owner.
// The JOIN is what makes the public feed possible — without it we'd only have user_id.
module.exports.list = async () => {
  const query = `
    SELECT events.event_id, events.title, events.url, events.user_id, users.username
    FROM events
    JOIN users ON events.user_id = users.user_id
    ORDER BY events.event_id
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Returns all events for a specific user
module.exports.listByUser = async (user_id) => {
  const query = `
    SELECT event_id, title, url, user_id
    FROM events
    WHERE user_id = $1
    ORDER BY event_id
  `;
  const { rows } = await pool.query(query, [user_id]);
  return rows;
};

// Creates a event owned by the user
module.exports.create = async (user_id, title, url) => {
  const query = `
    INSERT INTO events (user_id, title, url)
    VALUES ($1, $2, $3)
    RETURNING event_id, title, url, user_id
  `;
  const { rows } = await pool.query(query, [user_id, title, url]);
  return rows[0];
};

// Finds a single event by id — used by updateEvent and deleteEvent before their
// ownership checks. Unlike users, the event URL only contains event_id, not user_id,
// so we have to look up the owner from the database rather than the URL params.
module.exports.find = async (event_id) => {
  const query =
    "SELECT event_id, title, url, user_id FROM events WHERE event_id = $1";
  const { rows } = await pool.query(query, [event_id]);
  return rows[0] || null;
};

// Updates a event's title and url
module.exports.update = async (event_id, title, url) => {
  const query = `
    UPDATE events
    SET title = $1, url = $2
    WHERE event_id = $3
    RETURNING event_id, title, url, user_id
  `;
  const { rows } = await pool.query(query, [title, url, event_id]);
  return rows[0] || null;
};

// Deletes a event — returns the deleted row or null
module.exports.destroy = async (event_id) => {
  const query = `
    DELETE FROM events
    WHERE event_id = $1
    RETURNING event_id, title, url, user_id
  `;
  const { rows } = await pool.query(query, [event_id]);
  return rows[0] || null;
};
