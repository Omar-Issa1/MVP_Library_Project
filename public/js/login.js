document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const btn = document.getElementById("login-btn");
  const alertBox = document.getElementById("login-alert");

  btn.onclick = async () => {
    alertBox.classList.add("hidden");
    const email = emailInput.value.trim();
    const password = passInput.value.trim();

    if (!email || !password) {
      alertBox.textContent = "من فضلك أدخل البريد وكلمة المرور";
      alertBox.classList.remove("hidden");
      return;
    }

    try {
      const data = await apiRequest("/auth/user/login", {
        method: "POST",
        body: { email, password },
      });
      setAuth(data.token, "user");
      window.location.href = "index.html";
    } catch (err) {
      alertBox.textContent = err.message || "بيانات الدخول غير صحيحة";
      alertBox.classList.remove("hidden");
    }
  };
});
