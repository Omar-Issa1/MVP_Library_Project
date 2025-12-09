import express from "express";
import { authenticate, requireUser } from "../middleware/authMiddleware.js";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
  saveReadingProgress,
  getReadingProgress,
  getBookProgress,
} from "../controllers/userController.js";

const router = express.Router();

// كل هذه المسارات خاصة بالمستخدم العادي فقط
router.use(authenticate, requireUser);

// Favorites
router.post("/favorites/:bookId", addFavorite);
router.delete("/favorites/:bookId", removeFavorite);
router.get("/favorites", getFavorites);

// Reading Progress
router.post("/progress", saveReadingProgress);
router.get("/progress", getReadingProgress);
router.get("/progress/:bookId", getBookProgress);

export default router;
