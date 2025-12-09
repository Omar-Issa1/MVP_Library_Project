import path from "path";
import express from "express";
import dotenv from "dotenv";

import bookRoutes from "./src/routes/bookRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// PUBLIC FOLDER
// ================================
app.use(express.static(path.join(process.cwd(), "public")));

// ================================
// FORCE PDF INLINE VIEWING
// ================================
app.get("/uploads/books/:file", (req, res, next) => {
  try {
    const filePath = path.join(
      process.cwd(),
      "src",
      "uploads",
      "books",
      req.params.file
    );

    // Force browser to display PDF instead of downloading it
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${req.params.file}"`
    );

    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("❌ SEND FILE ERROR:", err.message);
        next();
      }
    });
  } catch (err) {
    console.error("❌ VIEWER MIDDLEWARE ERROR:", err.message);
    next();
  }
});

// ================================
// STATIC UPLOADS (for images & fallback)
// ================================
app.use("/uploads", express.static(path.join(process.cwd(), "src", "uploads")));

// ================================
// DEBUG LOGGER
// ================================
app.use((req, res, next) => {
  console.log(
    "REQ:",
    req.method,
    req.path,
    "TOKEN:",
    req.headers.authorization
  );
  next();
});

// ================================
// API ROUTES
// ================================
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// ================================
// START SERVER
// ================================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
