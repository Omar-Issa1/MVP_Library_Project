import express from "express";
import multer from "multer";
import {
  getAllBooks,
  getBook,
  addBook,
  deleteBook,
  updateBook,
} from "../controllers/bookController.js";
import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "cover") {
      cb(null, "src/uploads/covers");
    } else {
      cb(null, "src/uploads/books");
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Public
router.get("/", getAllBooks);
router.get("/:id", getBook);

// Admin only
router.post(
  "/add",
  authenticate,
  requireAdmin,
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "book", maxCount: 1 },
  ]),
  addBook
);

router.put("/:id", authenticate, requireAdmin, updateBook);
router.delete("/:id", authenticate, requireAdmin, deleteBook);

export default router;
