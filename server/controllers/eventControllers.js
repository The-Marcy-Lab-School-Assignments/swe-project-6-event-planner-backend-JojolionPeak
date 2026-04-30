const eventModel = require("../models/eventModel");

// POST /api/events
const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location, event_type, max_capacity } =
      req.body;
    const user_id = req.session.user_id;
    if (
      !title ||
      !description ||
      !date ||
      !location ||
      !event_type ||
      !max_capacity
    ) {
      return res.status(400).send({ message: "Missing required field(s)" });
    }
    const event = await eventModel.create(
      title,
      description,
      date,
      location,
      event_type,
      max_capacity,
      user_id
    );
    res.status(201).send(event);
  } catch (err) {
    next(err);
  }
};

// GET /api/events
const listEvents = async (req, res, next) => {
  try {
    const events = await eventModel.list();
    res.status(200).send(events);
  } catch (err) {
    next(err);
  }
};

const listUserEvents = async (req, res, next) => {
  try {
    const user_id = Number(req.params.user_id);
    const events = await eventModel.listByUser(user_id);
    res.status(200).send(events);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/events/:event_id { password }
const updateEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.event_id);

    const curEvent = await eventModel.find(eventId);
    if (!curEvent) return res.status(404).send({ message: "Event not found" });

    // The event_id is in the URL, so we can compare it directly to req.session.eventId
    if (curEvent.user_id !== req.session.user_id) {
      return res
        .status(403)
        .send({ message: "You can only update events on your own account." });
    }

    const { title, description, date, location, event_type, max_capacity } =
      req.body;
    const event = await eventModel.update(
      eventId,
      title,
      description,
      date,
      location,
      event_type,
      max_capacity
    );
    res.status(200).send(event);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/events/:event_id
const deleteEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.event_id);
    const curEvent = await eventModel.find(eventId);
    if (!curEvent) return res.status(404).send({ message: "Event not found" });
    if (Number(curEvent.user_id) !== Number(req.session.user_id)) {
      return res
        .status(403)
        .send({ message: "You can only delete events from your own account." });
    }
    const event = await eventModel.destroy(eventId);
    res.send(event);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listEvents,
  listUserEvents,
  updateEvent,
  deleteEvent,
  createEvent,
};
