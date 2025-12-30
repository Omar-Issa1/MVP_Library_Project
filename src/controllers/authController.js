import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";

const createToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ================= Admin Login =================

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    // console.log("ADMIN LOGIN BODY =", req.body);

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "username and password required" });
    }

    const result = await db.query(
      "SELECT id, username, password FROM admins WHERE username = $1",
      [username]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Invalid username" });
    }

    const admin = result.rows[0];
    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = createToken({ id: admin.id, role: "admin" });
    res.json({ token });
  } catch (err) {
    console.error("loginAdmin ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= User Register/Login =================

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log("REGISTER BODY =", req.body);

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const exists = await db.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (exists.rowCount > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id",
      [email, hashed]
    );

    const user = result.rows[0];
    const token = createToken({ id: user.id, role: "user" });

    res.status(201).json({ token });
  } catch (err) {
    console.error("registerUser ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log("USER LOGIN BODY =", req.body);

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = createToken({ id: user.id, role: "user" });

    res.json({ token });
  } catch (err) {
    console.error("loginUser ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
