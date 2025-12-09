const API_BASE_URL = "/api";

function getToken() {
  return localStorage.getItem("token");
}

function getRole() {
  return localStorage.getItem("role");
}

function setAuth(token, role) {
  if (!token) return;
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
}

function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}

async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body = null,
    auth = false,
    formData = null,
  } = options;

  const fetchOptions = {
    method,
    headers: {},
  };

  if (auth && getToken()) {
    fetchOptions.headers["Authorization"] = "Bearer " + getToken();
  }

  if (formData) {
    fetchOptions.body = formData;
  } else if (body) {
    fetchOptions.headers["Content-Type"] = "application/json";
    fetchOptions.body = JSON.stringify(body);
  }

  const res = await fetch(API_BASE_URL + path, fetchOptions);
  let data = {};
  try {
    data = await res.json();
  } catch (_) {}

  if (!res.ok) {
    throw {
      status: res.status,
      message: data.message || "حدث خطأ في الطلب",
    };
  }
  return data;
}

/* Navbar init */

function initNavbar() {
  const role = getRole();
  const token = getToken();

  const guestEls = document.querySelectorAll(".nav-guest-only");
  const userEls = document.querySelectorAll(".nav-user-only");
  const adminEls = document.querySelectorAll(".nav-admin-only");
  const userInfoEl = document.querySelector(".nav-user-info");
  const logoutBtn = document.getElementById("logout-btn");

  if (!guestEls.length) return; // no navbar in this page

  if (token) {
    guestEls.forEach((el) => el.classList.add("hidden"));
    userEls.forEach((el) => el.classList.remove("hidden"));

    if (role === "admin") {
      adminEls.forEach((el) => el.classList.remove("hidden"));
      if (userInfoEl) userInfoEl.textContent = "مشرف المكتبة";
    } else {
      adminEls.forEach((el) => el.classList.add("hidden"));
      if (userInfoEl) userInfoEl.textContent = "حساب قارئ";
    }
  } else {
    guestEls.forEach((el) => el.classList.remove("hidden"));
    userEls.forEach((el) => el.classList.add("hidden"));
    adminEls.forEach((el) => el.classList.add("hidden"));
  }

  if (logoutBtn) {
    logoutBtn.onclick = () => {
      clearAuth();
      window.location.href = "index.html";
    };
  }
}

document.addEventListener("DOMContentLoaded", initNavbar);
