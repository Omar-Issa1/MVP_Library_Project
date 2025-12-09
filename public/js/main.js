async function loadBooks() {
  const grid = document.getElementById("books-grid");
  const emptyMsg = document.getElementById("books-empty");
  const searchInput = document.getElementById("search-input");

  grid.innerHTML = "";
  emptyMsg.classList.add("hidden");

  let books = [];
  try {
    books = await apiRequest("/books");
  } catch (err) {
    grid.innerHTML =
      '<p class="text-muted">تعذر تحميل الكتب. حاول مرة أخرى.</p>';
    console.error(err);
    return;
  }

  if (!Array.isArray(books) || books.length === 0) {
    emptyMsg.classList.remove("hidden");
    return;
  }

  function render(list) {
    grid.innerHTML = "";
    if (!list.length) {
      grid.innerHTML = '<p class="text-muted">لا توجد نتائج مطابقة لبحثك.</p>';
      return;
    }

    list.forEach((book) => {
      const card = document.createElement("article");
      card.className = "book-card";
      card.dataset.id = book.id;

      const coverUrl = book.cover_path ? `/uploads/${book.cover_path}` : null;

      card.innerHTML = `
        <div class="book-cover-wrap">
          ${
            coverUrl
              ? `<img src="${coverUrl}" alt="${book.title}" />`
              : `<span>📖</span>`
          }
        </div>
        <div class="book-info">
          <div class="book-title">${book.title || "بدون عنوان"}</div>
          <div class="book-author">${book.author || "مؤلف غير معروف"}</div>
          <div class="book-meta">
            <span class="badge">${book.category || "غير مصنف"}</span>
            <button class="btn btn-sm btn-outline add-fav-btn nav-user-only hidden" data-id="${
              book.id
            }">♡ مفضلة</button>
          </div>
        </div>
      `;

      card.addEventListener("click", (e) => {
        // لو ضغط على زر المفضلة لا ننتقل للكتاب
        if (e.target.closest(".add-fav-btn")) return;
        window.location.href = `book.html?id=${book.id}`;
      });

      grid.appendChild(card);
    });

    // بعد ما نضيف الكروت نفعّل زر المفضلة لو المستخدم مسجل
    if (getToken() && getRole() === "user") {
      document
        .querySelectorAll(".add-fav-btn")
        .forEach((btn) => btn.classList.remove("hidden"));

      document.querySelectorAll(".add-fav-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          try {
            await apiRequest(`/user/favorites/${id}`, {
              method: "POST",
              auth: true,
            });
            btn.textContent = "✓ في المفضلة";
          } catch (err) {
            alert(err.message || "تعذر إضافة الكتاب للمفضلة");
          }
        });
      });
    }
  }

  render(books);

  searchInput.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = books.filter((b) => {
      return (
        (b.title || "").toLowerCase().includes(q) ||
        (b.author || "").toLowerCase().includes(q) ||
        (b.category || "").toLowerCase().includes(q)
      );
    });
    render(filtered);
  });
}

document.addEventListener("DOMContentLoaded", loadBooks);
