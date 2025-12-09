async function loadFavorites() {
  if (!getToken() || getRole() !== "user") {
    window.location.href = "login.html";
    return;
  }

  const grid = document.getElementById("fav-grid");
  const emptyMsg = document.getElementById("fav-empty");

  grid.innerHTML = "";
  emptyMsg.classList.add("hidden");

  let books = [];
  try {
    books = await apiRequest("/user/favorites", { auth: true });
  } catch (err) {
    grid.innerHTML =
      '<p class="text-muted">تعذر تحميل المفضلة، حاول مجددًا.</p>';
    console.error(err);
    return;
  }

  if (!books.length) {
    emptyMsg.classList.remove("hidden");
    return;
  }

  books.forEach((book) => {
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
          <button class="btn btn-sm btn-danger remove-fav-btn" data-id="${
            book.id
          }">إزالة</button>
        </div>
      </div>
    `;

    card.addEventListener("click", (e) => {
      if (e.target.closest(".remove-fav-btn")) return;
      window.location.href = `book.html?id=${book.id}`;
    });

    grid.appendChild(card);
  });

  document.querySelectorAll(".remove-fav-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      try {
        await apiRequest(`/user/favorites/${id}`, {
          method: "DELETE",
          auth: true,
        });
        btn.closest(".book-card").remove();
      } catch (err) {
        alert(err.message || "تعذر إزالة الكتاب من المفضلة");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", loadFavorites);
