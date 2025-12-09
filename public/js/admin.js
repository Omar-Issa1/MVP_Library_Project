function showUploadSection() {
  document.getElementById("admin-login-section").classList.add("hidden");
  document.getElementById("book-upload-section").classList.remove("hidden");
  document.getElementById("manage-books-section").classList.remove("hidden");
  loadBooksAdmin();
}

document.addEventListener("DOMContentLoaded", () => {
  const role = getRole();
  const token = getToken();

  if (token && role === "admin") {
    showUploadSection();
  }

  const loginBtn = document.getElementById("admin-login-btn");
  const loginAlert = document.getElementById("admin-login-alert");

  loginBtn.onclick = async () => {
    loginAlert.classList.add("hidden");
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      loginAlert.textContent = "أدخل اسم المستخدم وكلمة المرور";
      loginAlert.classList.remove("hidden");
      return;
    }

    try {
      const data = await apiRequest("/auth/admin/login", {
        method: "POST",
        body: { username, password },
      });

      setAuth(data.token, "admin");
      showUploadSection();
      initNavbar();
    } catch (err) {
      loginAlert.textContent = err.message || "بيانات الدخول غير صحيحة";
      loginAlert.classList.remove("hidden");
    }
  };

  // UPLOAD BOOK
  const uploadBtn = document.getElementById("upload-btn");
  const uploadAlert = document.getElementById("upload-alert");

  uploadBtn.onclick = async () => {
    uploadAlert.classList.add("hidden");

    if (!getToken() || getRole() !== "admin") {
      uploadAlert.textContent = "يجب تسجيل الدخول كمشرف أولًا.";
      uploadAlert.className = "alert alert-error";
      uploadAlert.classList.remove("hidden");
      return;
    }

    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const category = document.getElementById("category").value.trim();
    const description = document.getElementById("description").value.trim();
    const coverFile = document.getElementById("cover").files[0];
    const bookFile = document.getElementById("book").files[0];

    if (!title || !author || !description || !bookFile) {
      uploadAlert.textContent = "العنوان، المؤلف، الوصف، وملف الـ PDF مطلوبة.";
      uploadAlert.className = "alert alert-error";
      uploadAlert.classList.remove("hidden");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("description", description);
    formData.append("category", category);
    if (coverFile) formData.append("cover", coverFile);
    formData.append("book", bookFile);

    try {
      await apiRequest("/books/add", {
        method: "POST",
        auth: true,
        formData,
      });

      uploadAlert.textContent = "تم رفع الكتاب بنجاح ✓";
      uploadAlert.className = "alert alert-success";
      uploadAlert.classList.remove("hidden");

      document.getElementById("title").value = "";
      document.getElementById("author").value = "";
      document.getElementById("category").value = "";
      document.getElementById("description").value = "";
      document.getElementById("cover").value = "";
      document.getElementById("book").value = "";

      loadBooksAdmin();
    } catch (err) {
      uploadAlert.textContent = err.message || "تعذر رفع الكتاب";
      uploadAlert.className = "alert alert-error";
      uploadAlert.classList.remove("hidden");
    }
  };
});

// LOAD BOOKS FOR ADMIN
async function loadBooksAdmin() {
  const list = document.getElementById("books-list");
  const noBooks = document.getElementById("no-books");

  list.innerHTML = "";
  noBooks.classList.add("hidden");

  let books = [];
  try {
    books = await apiRequest("/books");
  } catch (err) {
    list.innerHTML = "<p class='text-muted'>تعذر تحميل الكتب.</p>";
    return;
  }

  if (!books.length) {
    noBooks.classList.remove("hidden");
    return;
  }

  books.forEach((book) => {
    const div = document.createElement("div");
    div.className = "section-card";
    div.style.marginBottom = "14px";

    const cover = book.cover_path
      ? `<img src="/uploads/${book.cover_path}" style="width:70px;border-radius:8px;">`
      : `<div style="width:70px;height:100px;background:#eee;border-radius:8px;display:flex;align-items:center;justify-content:center;">📖</div>`;

    div.innerHTML = `
      <div style="display:flex; gap:16px;">
        ${cover}
        <div style="flex:1;">
          <h3 style="margin:0 0 4px;">${book.title}</h3>
          <p class="text-muted" style="margin:0 0 8px;">
            ${book.author} — <span class="badge">${book.category}</span>
          </p>

          <button class="btn btn-sm btn-primary edit-btn" data-id="${book.id}">
            ✏️ تعديل
          </button>

          <button class="btn btn-sm btn-danger delete-btn" data-id="${book.id}">
            🗑️ حذف
          </button>
        </div>
      </div>
    `;

    list.appendChild(div);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (!confirm("هل أنت متأكد من حذف هذا الكتاب؟")) return;

      const id = btn.dataset.id;

      try {
        await apiRequest(`/books/${id}`, {
          method: "DELETE",
          auth: true,
        });
        loadBooksAdmin();
      } catch (err) {
        alert(err.message || "تعذر حذف الكتاب");
      }
    })
  );

  document
    .querySelectorAll(".edit-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => openEditModal(btn.dataset.id))
    );
}

// OPEN EDIT MODAL
async function openEditModal(id) {
  const modal = document.getElementById("edit-modal");
  const alertBox = document.getElementById("edit-alert");

  modal.classList.remove("hidden");
  alertBox.classList.add("hidden");

  let book;
  try {
    book = await apiRequest(`/books/${id}`);
  } catch {
    alert("تعذر تحميل بيانات الكتاب");
    return;
  }

  document.getElementById("edit-title").value = book.title;
  document.getElementById("edit-author").value = book.author;
  document.getElementById("edit-category").value = book.category || "";
  document.getElementById("edit-description").value = book.description;

  document.getElementById("save-edit-btn").onclick = async () => {
    alertBox.classList.add("hidden");

    const body = {
      title: document.getElementById("edit-title").value.trim(),
      author: document.getElementById("edit-author").value.trim(),
      category: document.getElementById("edit-category").value.trim(),
      description: document.getElementById("edit-description").value.trim(),
    };

    try {
      await apiRequest(`/books/${id}`, {
        method: "PUT",
        auth: true,
        body,
      });

      modal.classList.add("hidden");
      loadBooksAdmin();
    } catch (err) {
      alertBox.textContent = err.message || "تعذر حفظ التعديلات";
      alertBox.className = "alert alert-error";
      alertBox.classList.remove("hidden");
    }
  };

  document.getElementById("close-edit-btn").onclick = () => {
    modal.classList.add("hidden");
  };
}
