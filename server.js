import path from "path";
import express from "express";
import dotenv from "dotenv";

import bookRoutes from "./src/routes/bookRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";

dotenv.config();

const app = express();

// Paths
const ROOT = process.cwd();
const PUBLIC_PATH = path.join(ROOT, "public");
const UPLOADS_PATH = path.join(ROOT, "src", "uploads");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static
app.use(express.static(PUBLIC_PATH));
app.use("/uploads", express.static(UPLOADS_PATH));

// Debug (development only)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log("REQ:", req.method, req.path);
    next();
  });
}

// API routes
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});

// import path from "path";
// import express from "express";
// import dotenv from "dotenv";

// import bookRoutes from "./src/routes/bookRoutes.js";
// import authRoutes from "./src/routes/authRoutes.js";
// import userRoutes from "./src/routes/userRoutes.js";

// dotenv.config();

// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(express.static(path.join(process.cwd(), "public")));

// app.get("/uploads/books/:file", (req, res, next) => {
//   try {
//     const filePath = path.join(
//       process.cwd(),
//       "src",
//       "uploads",
//       "books",
//       req.params.file
//     );

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `inline; filename="${req.params.file}"`
//     );

//     res.sendFile(filePath, (err) => {
//       if (err) {
//         console.error("❌ SEND FILE ERROR:", err.message);
//         next();
//       }
//     });
//   } catch (err) {
//     console.error("❌ VIEWER MIDDLEWARE ERROR:", err.message);
//     next();
//   }
// });

// app.use("/uploads", express.static(path.join(process.cwd(), "src", "uploads")));

// app.use((req, res, next) => {
//   console.log(
//     "REQ:",
//     req.method,
//     req.path,
//     "TOKEN:",
//     req.headers.authorization
//   );
//   next();
// });

// app.use("/api/books", bookRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/user", userRoutes);

// app.listen(3000, () => {
//   console.log("Server running on port 3000");
// });
