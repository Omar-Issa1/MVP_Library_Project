document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  const btn = document.getElementById("reg-btn");
  const alertBox = document.getElementById("reg-alert");

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
      const data = await apiRequest("/auth/user/register", {
        method: "POST",
        body: { email, password },
      });
      setAuth(data.token, "user");
      window.location.href = "index.html";
    } catch (err) {
      alertBox.textContent = err.message || "تعذر إنشاء الحساب";
      alertBox.classList.remove("hidden");
    }
  };
});
