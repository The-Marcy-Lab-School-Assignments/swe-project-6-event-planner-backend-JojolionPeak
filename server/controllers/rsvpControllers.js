const rsvpModel = require("../models/rsvpModel");

// POST /api/events/:event_id/rsvps
const addRsvp = async (req, res, next) => {
  try {
    const { user_id } = req.session;
    const event_id = Number(req.params.event_id);
    const rsvp = await rsvpModel.create(user_id, event_id);
    res.status(201).send(rsvp);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:user_id/rsvps
const listRsvps = async (req, res, next) => {
  try {
    const user_id = Number(req.params.user_id);
    const rsvps = await rsvpModel.list(user_id);
    res.status(200).send(rsvps);
  } catch (err) {
    next(err);
  }
};
// DELETE /api/events/:event_id/rsvps
const deleteRsvp = async (req, res, next) => {
  try {
    const { user_id } = req.session;
    const event_id = Number(req.params.event_id);
    const deleted = await rsvpModel.destroy(user_id, event_id);
    res.status(200).send(deleted);
  } catch (err) {
    next(err);
  }
};

module.exports = { addRsvp, listRsvps, deleteRsvp };
