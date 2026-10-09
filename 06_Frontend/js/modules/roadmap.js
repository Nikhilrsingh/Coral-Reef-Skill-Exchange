import authService from "../services/authService.js";

const API_BASE_URL = "http://172.20.10.2:8000/api";
const token = () => authService.getToken();

const form = document.getElementById("roadmapForm");
const goalInput = document.getElementById("roadmapGoal");
const title = document.getElementById("roadmapTitle");
const progress = document.getElementById("roadmapProgress");
const fill = document.getElementById("progressFill");
const list = document.getElementById("roadmapList");
const empty = document.getElementById("roadmapEmpty");

let currentRoadmap = null;

async function api(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token()}`,
            ...(options.headers || {}),
        },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || data.error || "Request failed.");
    return data;
}

function renderRoadmap(roadmap) {
    currentRoadmap = roadmap;
    title.textContent = `${roadmap.goal} Learning Path`;
    progress.textContent = `${roadmap.completed_steps} of ${roadmap.total_steps} completed`;
    fill.style.width = `${roadmap.progress_percentage}%`;
    empty.classList.remove("show");

    list.innerHTML = roadmap.steps.map(step => `
        <article class="roadmap-step ${step.completed ? "completed" : ""}">
            <div class="step-top">
                <div>
                    <span class="step-label">STEP ${String(step.step_number).padStart(2, "0")}</span>
                    <h3>${escapeHTML(step.title)}</h3>
                </div>
                <span class="step-status">${step.completed ? "Completed" : "Upcoming"}</span>
            </div>
            <p>${escapeHTML(step.description)}</p>
            <button type="button" class="step-action" data-step-id="${step.id}">
                ${step.completed ? "Completed ✓" : "Mark Complete"}
            </button>
        </article>
    `).join("");

    list.querySelectorAll(".step-action").forEach(button => {
        button.addEventListener("click", async () => {
            button.disabled = true;
            try {
                const step = roadmap.steps.find(item => String(item.id) === button.dataset.stepId);
                const updated = await api(`/roadmaps/${roadmap.id}/steps/${step.id}/`, {
                    method: "PATCH",
                    body: JSON.stringify({ completed: !step.completed }),
                });
                renderRoadmap(updated);
            } catch (error) {
                alert(error.message);
                button.disabled = false;
            }
        });
    });
}

async function loadRoadmaps() {
    if (!authService.isLoggedIn()) {
        list.innerHTML = "";
        empty.classList.add("show");
        empty.querySelector("p").textContent = "Please log in to save and track your learning roadmaps.";
        return;
    }

    try {
        const roadmaps = await api("/roadmaps/");
        if (roadmaps.length) {
            renderRoadmap(roadmaps[0]);
            goalInput.value = roadmaps[0].goal;
        } else {
            empty.classList.add("show");
        }
    } catch (error) {
        console.error("Roadmap load failed:", error);
    }
}

form.addEventListener("submit", async event => {
    event.preventDefault();
    const goal = goalInput.value.trim();
    if (!goal) return;
    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "Creating...";
    try {
        const roadmap = await api("/roadmaps/", {
            method: "POST",
            body: JSON.stringify({ goal }),
        });
        renderRoadmap(roadmap);
    } catch (error) {
        alert(error.message);
    } finally {
        button.disabled = false;
        button.textContent = "Create Roadmap →";
    }
});

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

loadRoadmaps();
