import { db } from "../config/db.js";

// ===== Favorites =====

export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookId = Number(req.params.bookId);

    if (!bookId) {
      return res.status(400).json({ message: "Book id is required" });
    }

    await db.query(
      `INSERT INTO favorites (user_id, book_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, book_id) DO NOTHING`,
      [userId, bookId]
    );

    res.json({ message: "Added to favorites" });
  } catch (err) {
    console.error("addFavorite ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookId = Number(req.params.bookId);

    await db.query(
      "DELETE FROM favorites WHERE user_id = $1 AND book_id = $2",
      [userId, bookId]
    );

    res.json({ message: "Removed from favorites" });
  } catch (err) {
    console.error("removeFavorite ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT b.id,
              b.title,
              b.author,
              b.category,
              b.cover_path
       FROM favorites f
       JOIN books b ON b.id = f.book_id
       WHERE f.user_id = $1
       ORDER BY b.id DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getFavorites ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Reading Progress =====

export const saveReadingProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, lastPage } = req.body;

    if (!bookId || !lastPage) {
      return res
        .status(400)
        .json({ message: "bookId and lastPage are required" });
    }

    await db.query(
      `INSERT INTO reading_progress (user_id, book_id, last_page)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, book_id)
       DO UPDATE SET last_page = EXCLUDED.last_page`,
      [userId, Number(bookId), Number(lastPage)]
    );

    res.json({ message: "Progress saved" });
  } catch (err) {
    console.error("saveReadingProgress ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getReadingProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT book_id, last_page
       FROM reading_progress
       WHERE user_id = $1`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getReadingProgress ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBookProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookId = Number(req.params.bookId);

    const result = await db.query(
      `SELECT last_page
       FROM reading_progress
       WHERE user_id = $1 AND book_id = $2`,
      [userId, bookId]
    );

    if (result.rowCount === 0) {
      return res.json({ last_page: 1 });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("getBookProgress ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
