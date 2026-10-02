const form = document.getElementById("quizForm");
const submitBtn = document.getElementById("submitBtn");
const statusBox = document.getElementById("status");
const fields = ["name", "email", "budget", "interests"];

function clearErrors() {
  fields.forEach((field) => {
    document.getElementById(`${field}Error`).textContent = "";
    document.getElementById(field).setAttribute("aria-invalid", "false");
  });
}

function showErrors(errors = {}) {
  Object.entries(errors).forEach(([field, message]) => {
    const input = document.getElementById(field);
    const error = document.getElementById(`${field}Error`);
    if (input && error) {
      error.textContent = message;
      input.setAttribute("aria-invalid", "true");
    }
  });
}

function showStatus(message, type) {
  statusBox.textContent = message;
  statusBox.className = `status show ${type}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();
  statusBox.className = "status";

  const payload = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    budget: document.getElementById("budget").value.trim(),
    interests: document.getElementById("interests").value.trim()
  };

  submitBtn.disabled = true;
  submitBtn.querySelector("span").textContent = "Saving your preferences...";

  try {
    const response = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      showErrors(result.errors);
      showStatus(result.message || "Please check your details.", "failure");
      return;
    }

    showStatus("Thank you! Your preferences have been submitted successfully.", "success");
    form.reset();
  } catch (error) {
    console.error(error);
    showStatus("Could not connect to the server. Please try again.", "failure");
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector("span").textContent = "Find my perfect picks";
  }
});
