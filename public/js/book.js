let pdfDoc = null;
let scale = 1.4;
let bookId = null;
let currentPage = 1;

const pdfContainer = document.getElementById("pdf-container");
const continuousWrapper = document.getElementById("continuous-wrapper");
const miniMapPages = document.getElementById("mini-map-pages");

async function loadBook() {
  const params = new URLSearchParams(window.location.search);
  bookId = Number(params.get("id"));

  const book = await apiRequest(`/books/${bookId}`);

  document.getElementById("book-title").textContent = book.title;
  document.getElementById("book-author").textContent = book.author;
  document.getElementById("book-description").textContent =
    book.description || "";

  if (book.cover_path) {
    document.getElementById("book-cover-wrap").innerHTML = `
      <img src="/uploads/${book.cover_path}"
           style="width:100%;height:100%;object-fit:cover;">
    `;
  }

  document.getElementById("download-btn").href = `/uploads/${book.file_path}`;

  if (getRole() === "user") {
    const fav = await apiRequest("/user/favorites", { auth: true });
    if (fav.some((f) => f.id == bookId)) {
      document.getElementById("favorite-btn").classList.add("hidden");
      document.getElementById("remove-favorite-btn").classList.remove("hidden");
    }
  }

  if (getRole() === "user") {
    const prog = await apiRequest(`/user/progress/${bookId}`, { auth: true });

    if (prog.last_page > 1) {
      currentPage = prog.last_page;
      document.getElementById("go-progress-btn").classList.remove("hidden");
      document.getElementById("go-progress-btn").onclick = () => {
        goToPage(prog.last_page);
      };
    }
  }

  const url = `/uploads/${book.file_path}`;
  pdfDoc = await pdfjsLib.getDocument(url).promise;

  await renderAllPages();
  buildMiniMap();
}

async function renderAllPages() {
  continuousWrapper.innerHTML = "";

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    const wrapper = document.createElement("div");
    wrapper.className = "pdf-page-wrapper";
    wrapper.dataset.page = i;

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    wrapper.appendChild(canvas);
    continuousWrapper.appendChild(wrapper);

    await page.render({
      canvasContext: canvas.getContext("2d"),
      viewport,
    }).promise;
  }

  setTimeout(() => goToPage(currentPage, false), 50);
}

function goToPage(num, smooth = true) {
  const target = continuousWrapper.querySelector(
    `.pdf-page-wrapper[data-page="${num}"]`
  );
  if (target) {
    currentPage = num;
    pdfContainer.scrollTo({
      top: target.offsetTop,
      behavior: smooth ? "smooth" : "instant",
    });
    updateMiniMapActive();
  }
}

function buildMiniMap() {
  miniMapPages.innerHTML = "";
  if (!pdfDoc) return;

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const item = document.createElement("div");
    item.className = "mini-map-page";
    item.dataset.page = i;
    item.onclick = (e) => {
      e.stopPropagation();
      goToPage(i);
    };
    miniMapPages.appendChild(item);
  }
  updateMiniMapActive();
}

function updateMiniMapActive() {
  if (!pdfDoc) return;
  const items = miniMapPages.querySelectorAll(".mini-map-page");
  items.forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.page) === currentPage);
  });
}

pdfContainer.addEventListener("scroll", () => {
  const pages = [...continuousWrapper.children];
  if (!pages.length) return;

  const scrollTop = pdfContainer.scrollTop;
  let minDelta = Infinity;
  let nearestPage = currentPage;

  pages.forEach((p) => {
    const delta = Math.abs(scrollTop - p.offsetTop);
    if (delta < minDelta) {
      minDelta = delta;
      nearestPage = Number(p.dataset.page);
    }
  });

  if (nearestPage !== currentPage) {
    currentPage = nearestPage;
    updateMiniMapActive();
  }
});

document.getElementById("zoom-in").onclick = () => {
  scale += 0.3;
  if (scale > 2.5) scale = 2.5;
  renderAllPages().then(updateMiniMapActive);
};

document.getElementById("zoom-out").onclick = () => {
  scale -= 0.3;
  if (scale < 0.5) scale = 0.5;
  renderAllPages().then(updateMiniMapActive);
};

document.getElementById("reading-mode").onclick = () => {
  document.body.classList.add("reading-mode");
  document.getElementById("reading-mode").classList.add("hidden");
  document.getElementById("exit-reading").classList.remove("hidden");
};

document.getElementById("exit-reading").onclick = () => {
  document.body.classList.remove("reading-mode");
  document.getElementById("exit-reading").classList.add("hidden");
  document.getElementById("reading-mode").classList.remove("hidden");
};

document.getElementById("favorite-btn").onclick = async () => {
  await apiRequest(`/user/favorites/${bookId}`, {
    method: "POST",
    auth: true,
  });

  document.getElementById("favorite-btn").classList.add("hidden");
  document.getElementById("remove-favorite-btn").classList.remove("hidden");
};

document.getElementById("remove-favorite-btn").onclick = async () => {
  await apiRequest(`/user/favorites/${bookId}`, {
    method: "DELETE",
    auth: true,
  });

  document.getElementById("remove-favorite-btn").classList.add("hidden");
  document.getElementById("favorite-btn").classList.remove("hidden");
};

document.getElementById("save-progress-btn").onclick = async () => {
  await apiRequest("/user/progress", {
    method: "POST",
    auth: true,
    body: {
      bookId,
      lastPage: currentPage,
    },
  });

  alert("✔ تم حفظ تقدمك");
};

document.addEventListener("DOMContentLoaded", loadBook);
