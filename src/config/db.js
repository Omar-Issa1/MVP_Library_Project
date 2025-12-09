import pkg from "pg";
import dotenv from "dotenv";

dotenv.config(); // مهم جداً هنا أيضاً

const { Pool } = pkg;

console.log("🔍 Checking ENV password:", process.env.DB_PASSWORD);

export const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD), // تأكد أنها string
  port: Number(process.env.DB_PORT),
});

// اختبار الاتصال
db.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ Database Error:", err));
