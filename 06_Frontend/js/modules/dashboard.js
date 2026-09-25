import authService from "../services/authService.js";

document.addEventListener("DOMContentLoaded", () => {
    setupProfileDropdown();
    setupNotifications();
});

/* ================================
   PROFILE DROPDOWN
================================ */

function setupProfileDropdown() {
    const profileButton = document.getElementById("profileButton");
    const profileDropdown = document.getElementById("profileDropdown");

    if (!profileButton || !profileDropdown) return;

    profileButton.addEventListener("click", (event) => {
        event.stopPropagation();
        profileDropdown.classList.toggle("open");
    });

    document.addEventListener("click", (event) => {
        if (
            !profileDropdown.contains(event.target) &&
            !profileButton.contains(event.target)
        ) {
            profileDropdown.classList.remove("open");
        }
    });
}


/* ================================
   NOTIFICATIONS
================================ */

function setupNotifications() {
    const notificationButton = document.getElementById("notificationButton");
    const notificationPanel = document.getElementById("notificationPanel");
    const closeNotifications = document.getElementById("closeNotifications");

    if (!notificationButton || !notificationPanel) return;

    notificationButton.addEventListener("click", async (event) => {
        event.stopPropagation();

        notificationPanel.classList.toggle("open");

        if (notificationPanel.classList.contains("open")) {
            await loadNotifications();
        }
    });

    if (closeNotifications) {
        closeNotifications.addEventListener("click", () => {
            notificationPanel.classList.remove("open");
        });
    }

    document.addEventListener("click", (event) => {
        if (
            notificationPanel &&
            !notificationPanel.contains(event.target) &&
            !notificationButton.contains(event.target)
        ) {
            notificationPanel.classList.remove("open");
        }
    });

    loadNotifications();
}


/* ================================
   LOAD CONNECTION REQUESTS
================================ */

async function loadNotifications() {
    const notificationContent =
        document.getElementById("notificationContent");

    const notificationDot =
        document.querySelector(".notification-dot");

    if (!notificationContent) return;

    try {
        notificationContent.innerHTML = `
            <div class="notification-empty">
                <p>Loading notifications...</p>
            </div>
        `;

        const token = authService.getToken();

        if (!token) {
            showEmptyNotifications();
            return;
        }

        const response = await fetch(
            "http://127.0.0.1:8000/api/requests/",
            {
                method: "GET",
                headers: {
                    "Authorization": `Token ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to load notifications");
        }

        const data = await response.json();

        const requests = Array.isArray(data)
            ? data
            : data.results || [];

        const incomingRequests = requests.filter(
            request =>
                request.status === "pending" &&
                request.receiver === getCurrentUserId()
        );

        if (incomingRequests.length === 0) {
            showEmptyNotifications();

            if (notificationDot) {
                notificationDot.style.display = "none";
            }

            return;
        }

        if (notificationDot) {
            notificationDot.style.display = "block";
        }

        notificationContent.innerHTML = "";

        incomingRequests.forEach(request => {
            notificationContent.appendChild(
                createRequestNotification(request)
            );
        });

    } catch (error) {
        console.error("Notification error:", error);

        notificationContent.innerHTML = `
            <div class="notification-empty">
                <p>Unable to load notifications.</p>
                <button id="retryNotifications">
                    Try Again
                </button>
            </div>
        `;

        const retryButton =
            document.getElementById("retryNotifications");

        if (retryButton) {
            retryButton.addEventListener("click", loadNotifications);
        }
    }
}


/* ================================
   CREATE REQUEST NOTIFICATION
================================ */

function createRequestNotification(request) {
    const wrapper = document.createElement("div");

    wrapper.className = "notification-item";

    const sender = request.sender_details || request.sender_profile || {};

    const senderName =
        sender.name ||
        sender.username ||
        request.sender_name ||
        "Someone";

    wrapper.innerHTML = `
        <div class="notification-info">
            <strong>${escapeHTML(senderName)}</strong>
            <p>wants to connect with you.</p>
        </div>

        <div class="notification-actions">
            <button
                class="accept-request"
                data-request-id="${request.id}">
                Accept
            </button>

            <button
                class="reject-request"
                data-request-id="${request.id}">
                Reject
            </button>
        </div>
    `;

    const acceptButton =
        wrapper.querySelector(".accept-request");

    const rejectButton =
        wrapper.querySelector(".reject-request");

    acceptButton.addEventListener("click", () => {
        updateRequest(request.id, "accepted", wrapper);
    });

    rejectButton.addEventListener("click", () => {
        updateRequest(request.id, "rejected", wrapper);
    });

    return wrapper;
}


/* ================================
   ACCEPT / REJECT REQUEST
================================ */

async function updateRequest(requestId, status, element) {
    try {
        const token = authService.getToken();

        if (!token) {
            showToast("Please login again.");
            return;
        }

        element.innerHTML = `
            <div class="notification-info">
                <p>Updating request...</p>
            </div>
        `;

        const response = await fetch(
            `http://127.0.0.1:8000/api/requests/${requestId}/`,
            {
                method: "PATCH",
                headers: {
                    "Authorization": `Token ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: status
                })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update request");
        }

        if (status === "accepted") {
            showToast("Connection request accepted.");
        } else {
            showToast("Connection request rejected.");
        }

        await loadNotifications();

    } catch (error) {
        console.error("Request update error:", error);

        showToast("Something went wrong. Please try again.");

        await loadNotifications();
    }
}


/* ================================
   CURRENT USER ID
================================ */

function getCurrentUserId() {
    const user = authService.getCurrentUser();

    if (!user) return null;

    return (
        user.id ||
        user.profile_id ||
        user.user_id
    );
}


/* ================================
   EMPTY STATE
================================ */

function showEmptyNotifications() {
    const notificationContent =
        document.getElementById("notificationContent");

    if (!notificationContent) return;

    notificationContent.innerHTML = `
        <div class="notification-empty">
            <p>No new notifications</p>
        </div>
    `;
}


/* ================================
   TOAST
================================ */

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


/* ================================
   SECURITY
================================ */

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}