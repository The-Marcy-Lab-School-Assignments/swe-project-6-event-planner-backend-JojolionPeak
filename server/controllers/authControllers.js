const userModel = require("../models/userModel");

// POST /api/auth/register { username, password }
const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .send({ error: "Username and password are required." });
    }

    const existingUser = await userModel.findByUsername(username);
    if (existingUser) {
      return res.status(409).send({ message: "Username already taken" });
    }

    const user = await userModel.create(username, password);

    // Start a session — the user is now logged in
    req.session.user_id = user.user_id;

    res.status(201).send(user);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login { username, password }
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // validatePassword handles both the lookup and bcrypt.compare internally
    const user = await userModel.validatePassword(username, password);

    // Same message for wrong username and wrong password — don't leak which one failed
    if (!user) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    // Credentials are valid — start a session
    req.session.user_id = user.user_id;

    res.status(200).send(user);
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const { user_id } = req.session;

    // No session — user is not logged in
    if (!user_id) return res.status(401).send(null);

    // Session exists — look up and return the user
    const user = await userModel.find(user_id);
    if (!user) return res.status(401).send(null);

    res.status(200).send(user);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/auth/logout
const logout = async (req, res, next) => {
  try {
    req.session = null; //
    res.status(200).send({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, logout };
