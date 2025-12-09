📚 MVP Library Project

A full-stack digital library application built with Node.js, Express, PostgreSQL, and a custom PDF Viewer powered by PDF.js.

This project allows users to browse books, read them online in continuous-scroll mode, manage favorites, and save reading progress. Admins can upload, edit, and delete books through a dedicated admin panel.

🚀 Features
👤 User Features

User registration & login

Browse all available books

Add books to Favorites

Remove books from Favorites

Save reading progress (page number)

Continue reading from last saved page

Download books (PDF)

High-quality book cover display

Smooth reading experience with continuous scroll mode

📘 PDF Viewer Features

✔ Continuous scroll display

✔ Zoom in/out

✔ Mini-Map navigation panel

✔ Fast page rendering for large PDFs

✔ High-quality rendering (no text overlap)

✔ Multi-page rendering with smooth transitions

🔐 Authentication

Implemented using:

JSON Web Tokens (JWT)

Secure password hashing with bcrypt

Protected user routes (favorites, progress, etc.)

🛠 Tech Stack
Backend

Node.js

Express.js

PostgreSQL

Multer (file uploads)

JWT Authentication

bcrypt

Frontend

Vanilla JavaScript

HTML & CSS

PDF.js

Responsive layout inside /public

📁 Project Structure
MVP_Library_Project/
│
├── public/ # Frontend files
│ ├── css/
│ ├── js/
│ ├── images/
│ └── \*.html
│
├── src/
│ ├── controllers/ # API logic
│ ├── middleware/
│ ├── routes/ # API routes
│ ├── uploads/
│ │ ├── books/ # PDF files
│ │ └── covers/ # Cover images
│ └── database.js # PostgreSQL connection
│
├── server.js # Main Express server
├── package.json
└── README.md

🧪 API Endpoints
Auth
Method Endpoint Description
POST /api/auth/register Register a new user
POST /api/auth/login Login & get token
Books
Method Endpoint Description
GET /api/books Get all books
GET /api/books/:id Get book details
POST /api/books Add book (Admin)
DELETE /api/books/:id Delete a book (Admin)
Favorites
Method Endpoint Description
GET /api/user/favorites Get favorite books
POST /api/user/favorites/add Add book to favorites
DELETE /api/user/favorites/remove/:id Remove favorite
Progress
Method Endpoint Description
GET /api/user/progress/:bookId Load saved progress
POST /api/user/progress/save Save progress
⚙ Environment Variables

Create a .env file:

JWT_SECRET=your_secret_key
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=library
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

🚀 Installation & Setup
1️⃣ Install dependencies
npm install

2️⃣ Create the PostgreSQL database
CREATE DATABASE library;

3️⃣ Start the server
node server.js

Server will run at:

http://localhost:3000

📌 Notes

Upload folder structure is automatically handled

Only PDF files are supported for book uploads

Covers are optional

Book viewer is optimized for performance

🧑‍💻 Author

Developed by Omar
MVP Digital Library Project
