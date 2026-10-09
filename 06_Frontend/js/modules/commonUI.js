import { setupLogout } from "./logout.js";
import authService from "../services/authService.js";
document.addEventListener("DOMContentLoaded", async () => {

   await loadSharedComponents();

   setupLogout();

fixSharedLinks();

setupMobileMenu();
setupActiveNavigation();
setupProfileMenu();
setupNavbarAuth();
setupNavbarNotifications();
setupProfileCompletion();

});


async function loadSharedComponents() {

    const navbarContainer =
        document.getElementById("navbar");

    const footerContainer =
        document.getElementById("footer");


    const componentPath =
        window.location.pathname.includes("/pages/")
            ? "../components/"
            : "components/";


    if (navbarContainer) {

        try {

            const response =
                await fetch(
                    `${componentPath}navbar.html`
                );

            if (!response.ok) {
                throw new Error(
                    "Navbar could not be loaded."
                );
            }

            navbarContainer.innerHTML =
                await response.text();

        } catch (error) {

            console.error(
                "Navbar loading error:",
                error
            );

        }

    }


    if (footerContainer) {

        try {

            const response =
                await fetch(
                    `${componentPath}footer.html`
                );

            if (!response.ok) {
                throw new Error(
                    "Footer could not be loaded."
                );
            }

            footerContainer.innerHTML =
                await response.text();

        } catch (error) {

            console.error(
                "Footer loading error:",
                error
            );

        }

    }

}


function setupMobileMenu() {

    const menuToggle =
        document.querySelector(".menu-toggle");

    const navMenu =
        document.querySelector(".nav-menu");


    if (!menuToggle || !navMenu) {
        return;
    }


    menuToggle.addEventListener("click", event => {

        event.stopPropagation();

        const isOpen =
            navMenu.classList.toggle(
                "mobile-open"
            );

        menuToggle.classList.toggle(
            "active",
            isOpen
        );

        menuToggle.setAttribute(
            "aria-expanded",
            isOpen
        );

    });


    navMenu
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener("click", () => {

                navMenu.classList.remove(
                    "mobile-open"
                );

                menuToggle.classList.remove(
                    "active"
                );

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });


    document.addEventListener("click", event => {

        if (
            !navMenu.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {

            navMenu.classList.remove(
                "mobile-open"
            );

            menuToggle.classList.remove(
                "active"
            );

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });

}


function setupActiveNavigation() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() || "index.html";


    document
        .querySelectorAll(".nav-links a")
        .forEach(link => {

            const href =
                link.getAttribute("href");

            if (!href) {
                return;
            }


            const linkPage =
                href.split("/").pop();


            link.classList.remove("active");


            if (
                linkPage === currentPage ||
                (
                    currentPage === "" &&
                    linkPage === "index.html"
                )
            ) {

                link.classList.add("active");

            }

        });

}


function setupProfileMenu() {

    const profileButton =
        document.getElementById(
            "profileMenuButton"
        );

    const profileDropdown =
        document.getElementById(
            "profileDropdown"
        );


    if (!profileButton || !profileDropdown) {
        return;
    }


    profileButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            profileDropdown.classList.toggle(
                "open"
            );

        }
    );


    document.addEventListener("click", event => {

        if (
            !profileDropdown.contains(event.target) &&
            !profileButton.contains(event.target)
        ) {

            profileDropdown.classList.remove(
                "open"
            );

        }

    });

}

async function setupNavbarAuth() {

    const module =
        await import("./navbarAuth.js");

    if (
        module &&
        typeof module.updateNavbarAuth === "function"
    ) {
        await module.updateNavbarAuth();
    }

}


function fixSharedLinks() {

    const isPagesDirectory =
        window.location.pathname.includes("/pages/");


    if (isPagesDirectory) {
        return;
    }


    document
        .querySelectorAll("#navbar a, #footer a")
        .forEach(link => {

            const href =
                link.getAttribute("href");

            if (!href) {
                return;
            }


            if (
                href === "../index.html"
            ) {

                link.setAttribute(
                    "href",
                    "index.html"
                );

                return;

            }


            if (
                !href.startsWith("../") &&
                !href.startsWith("http") &&
                !href.startsWith("#")
            ) {

                link.setAttribute(
                    "href",
                    `pages/${href}`
                );

            }

        });

}

async function setupNavbarNotifications() {
    const button = document.getElementById("navbarNotificationButton");
    const panel = document.getElementById("navbarNotificationPanel");
    const closeButton = document.getElementById("navbarNotificationClose");
    const content = document.getElementById("navbarNotificationContent");
    const dot = document.getElementById("navbarNotificationDot");

    if (!button || !panel || !content) return;

    const close = () => {
        panel.classList.remove("open");
        panel.setAttribute("aria-hidden", "true");
    };

    const load = async () => {
        const token = authService.getToken();
        const user = authService.getCurrentUser();
        if (!token || !user) {
            content.innerHTML = `<div class="navbar-notification-empty">Log in to view notifications.</div>`;
            if (dot) dot.style.display = "none";
            return;
        }
        try {
            const response = await fetch("http://172.20.10.2:8000/api/requests/", {
                headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Unable to load notifications");
            const requests = Array.isArray(data) ? data : (data.results || []);
            const currentId = user.id || user.profile_id || user.user_id;
            const incoming = requests.filter(r => r.status === "pending" && Number(r.receiver) === Number(currentId));
            if (dot) dot.style.display = incoming.length ? "block" : "none";
            if (!incoming.length) {
                content.innerHTML = `<div class="navbar-notification-empty"><div class="notification-empty-icon">✓</div><strong>You're all caught up</strong><span>No new connection requests.</span></div>`;
                return;
            }
            content.innerHTML = incoming.map(r => {
                const sender = r.sender_details || r.sender_profile || {};
                const name = escapeText(sender.name || r.sender_name || "Someone");
                const senderId = sender.id || r.sender;
                return `<article class="navbar-notification-item" data-request-id="${r.id}">
                    <div class="navbar-notification-avatar">${initials(name)}</div>
                    <div class="navbar-notification-body"><strong>${name}</strong><p>wants to connect with you.</p>
                        <div class="navbar-notification-actions">
                            <button type="button" class="notification-accept" data-request-id="${r.id}">Accept</button>
                            <button type="button" class="notification-reject" data-request-id="${r.id}">Decline</button>
                        </div>
                    </div>
                </article>`;
            }).join("");
            content.querySelectorAll(".notification-accept").forEach(btn => btn.addEventListener("click", () => updateNavbarRequest(btn.dataset.requestId, "accepted", load)));
            content.querySelectorAll(".notification-reject").forEach(btn => btn.addEventListener("click", () => updateNavbarRequest(btn.dataset.requestId, "rejected", load)));
        } catch (error) {
            console.error("Navbar notifications:", error);
            content.innerHTML = `<div class="navbar-notification-empty"><strong>Notifications unavailable</strong><span>Please try again.</span><button type="button" id="retryNavbarNotifications">Retry</button></div>`;
            document.getElementById("retryNavbarNotifications")?.addEventListener("click", load);
        }
    };

    button.addEventListener("click", async (event) => {
        event.stopPropagation();
        const open = panel.classList.toggle("open");
        panel.setAttribute("aria-hidden", String(!open));
        if (open) await load();
    });
    closeButton?.addEventListener("click", close);
    document.addEventListener("click", (event) => {
        if (!panel.contains(event.target) && !button.contains(event.target)) close();
    });
    await load();
}

async function updateNavbarRequest(requestId, status, reload) {
    const token = authService.getToken();
    if (!token) return;
    try {
        const response = await fetch(`http://172.20.10.2:8000/api/requests/${requestId}/`, {
            method: "PATCH",
            headers: { Authorization: `Token ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error("Request update failed");
        await reload();
    } catch (error) {
        console.error(error);
    }
}

function escapeText(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

function initials(value) {
    return value.trim().split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase() || "U";
}

async function setupProfileCompletion() {
    const path = window.location.pathname;
    if (!authService.isLoggedIn() || path.includes("/profile.html") || path.includes("/login.html") || path.includes("/register.html")) return;
    if (sessionStorage.getItem("coral_profile_prompt_seen") === "1") return;
    try {
        const user = await authService.getCurrentUserFromAPI();
        if (!user) return;
        const hasTeaching = Array.isArray(user.skills) && user.skills.length > 0;
        const hasLearning = Array.isArray(user.learningSkills) && user.learningSkills.length > 0;
        if (hasTeaching && hasLearning) return;
        sessionStorage.setItem("coral_profile_prompt_seen", "1");
        showProfileCompletionPrompt(hasTeaching, hasLearning);
    } catch (error) {
        console.warn("Profile completion check failed:", error);
    }
}

function showProfileCompletionPrompt(hasTeaching, hasLearning) {
    const missing = [];
    if (!hasTeaching) missing.push("at least one skill you can teach");
    if (!hasLearning) missing.push("at least one skill you want to learn");
    const overlay = document.createElement("div");
    overlay.className = "profile-completion-overlay";
    overlay.innerHTML = `<div class="profile-completion-modal" role="dialog" aria-modal="true" aria-labelledby="profileCompletionTitle">
        <button type="button" class="profile-completion-close" aria-label="Close">×</button>
        <div class="profile-completion-icon">✦</div>
        <span class="section-badge">SET UP YOUR PROFILE</span>
        <h2 id="profileCompletionTitle">Complete your profile first</h2>
        <p>Coral Reef works best when we know what you can teach and what you want to learn.</p>
        <div class="profile-completion-list"><div>✓ Add ${escapeText(missing.join(" and "))}.</div><div>✓ Get better matches and a personalized experience.</div></div>
        <div class="profile-completion-actions"><a class="btn btn-primary" href="${window.location.pathname.includes("/pages/") ? "profile.html" : "pages/profile.html"}">Complete Profile →</a><button type="button" class="btn btn-secondary" id="profilePromptLater">I'll do it later</button></div>
    </div>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector(".profile-completion-close")?.addEventListener("click", close);
    overlay.querySelector("#profilePromptLater")?.addEventListener("click", close);
    overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
}
