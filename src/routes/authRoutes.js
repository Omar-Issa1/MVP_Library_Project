import express from "express";
import {
  loginAdmin,
  registerUser,
  loginUser,
} from "../controllers/authController.js";

const router = express.Router();

// Admin login
router.post("/admin/login", loginAdmin);

// User register/login
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);

export default router;
