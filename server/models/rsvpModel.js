const pool = require("../db/pool");

module.exports.list = async (user_id) => {
  const query = `
    SELECT events.event_id, events.title, events.description, events.date, events.location, event_type, events.max_capacity, events.user_id, COUNT(rsvp_id) AS rsvp_count
      FROM rsvps
	      JOIN users ON users.user_id = rsvps.user_id
	      JOIN events ON events.event_id = rsvps.event_id
    WHERE rsvps.user_id = $1
    GROUP BY events.event_id
    ORDER BY date DESC;
  `;
  const { rows } = await pool.query(query, [user_id]);
  return rows;
};

module.exports.create = async (user_id, event_id) => {
  const query = `
    INSERT INTO rsvps (user_id, event_id)
    VALUES ($1, $2)
    ON CONFLICT ON CONSTRAINT rsvps_user_id_event_id_key DO NOTHING
    RETURNING *
  `;
  const { rows } = await pool.query(query, [user_id, event_id]);
  return rows;
};

module.exports.destroy = async (user_id, event_id) => {
  const query = `
    DELETE FROM rsvps WHERE user_id = $1 AND event_id = $2 RETURNING *
  `;
  const { rows } = await pool.query(query, [user_id, event_id]);
  return rows;
};
