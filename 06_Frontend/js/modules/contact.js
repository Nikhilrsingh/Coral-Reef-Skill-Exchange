const API_BASE_URL = "http://172.20.10.2:8000/api";
const form = document.getElementById("contactForm");
const message = document.getElementById("formMessage");

if (form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = form.querySelector("button[type='submit']");
        const original = button.textContent;
        button.disabled = true;
        button.textContent = "Sending...";
        message.classList.remove("show");

        try {
            const response = await fetch(`${API_BASE_URL}/contact/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: document.getElementById("contactName").value.trim(),
                    email: document.getElementById("contactEmail").value.trim(),
                    subject: document.getElementById("contactSubject").value.trim(),
                    message: document.getElementById("contactMessage").value.trim(),
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                const firstError = Object.values(data)[0];
                throw new Error(Array.isArray(firstError) ? firstError[0] : (data.detail || "Unable to send your message."));
            }
            message.style.color = "#166534";
            message.style.background = "#ECFDF5";
            message.style.borderColor = "#BBF7D0";
            message.textContent = data.message || "Your message has been received.";
            message.classList.add("show");
            form.reset();
        } catch (error) {
            message.textContent = error.message;
            message.classList.add("show");
            message.style.color = "#991B1B";
            message.style.background = "#FEF2F2";
            message.style.borderColor = "#FECACA";
        } finally {
            button.disabled = false;
            button.textContent = original;
        }
    });
}
