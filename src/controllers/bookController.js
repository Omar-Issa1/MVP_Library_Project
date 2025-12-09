import fs from "fs";
import path from "path";
import { db } from "../config/db.js";

// 🧠 حذف ملف بأمان (صورة / PDF)
const safeUnlink = (relPath) => {
  try {
    if (!relPath) return;
    const fullPath = path.join(process.cwd(), "src", "uploads", relPath);
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.warn("⚠️ Failed to delete file:", fullPath, err.message);
      }
    });
  } catch (e) {
    console.warn("⚠️ safeUnlink error:", e.message);
  }
};

// ================= GET /api/books =================
export const getAllBooks = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, title, author, description, category, cover_path, file_path
       FROM books
       ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET ALL BOOKS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET /api/books/:id =================
export const getBook = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT id, title, author, description, category, cover_path, file_path
       FROM books
       WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET BOOK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= POST /api/books/add =================
export const addBook = async (req, res) => {
  try {
    console.log("ADD BOOK BODY:", req.body);
    console.log("ADD BOOK FILES:", req.files);

    const { title, author, description, category } = req.body;

    if (!title || !author || !description) {
      return res.status(400).json({
        message: "title, author, description are required",
      });
    }

    const coverFile = req.files?.cover?.[0] || null;
    const bookFile = req.files?.book?.[0] || null;

    if (!bookFile) {
      return res.status(400).json({ message: "Book PDF file is required" });
    }

    // ✅ تخزين المسارات النسبية الصحيحة (بدون /uploads)
    const coverPath = coverFile ? `covers/${coverFile.filename}` : null;
    const filePath = `books/${bookFile.filename}`;

    const result = await db.query(
      `INSERT INTO books (title, author, description, category, cover_path, file_path)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [title, author, description, category, coverPath, filePath]
    );

    res.status(201).json({
      message: "Book added",
      book: result.rows[0],
    });
  } catch (err) {
    console.error("ADD BOOK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= PUT /api/books/:id =================
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, description, category } = req.body;

    const result = await db.query(
      `UPDATE books
       SET title = $1,
           author = $2,
           description = $3,
           category = $4
       WHERE id = $5
       RETURNING id, title, author, description, category, cover_path, file_path`,
      [title, author, description, category, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book updated", book: result.rows[0] });
  } catch (err) {
    console.error("UPDATE BOOK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE /api/books/:id =================
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "SELECT cover_path, file_path FROM books WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    const book = result.rows[0];

    await db.query("DELETE FROM books WHERE id = $1", [id]);

    safeUnlink(book.cover_path);
    safeUnlink(book.file_path);

    res.json({ message: "Book deleted" });
  } catch (err) {
    console.error("DELETE BOOK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
