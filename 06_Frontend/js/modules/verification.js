import authService from "../services/authService.js";

const API_BASE_URL = "http://172.20.10.2:8000/api";
const token = () => authService.getToken();

const form = document.getElementById("verificationForm");
const skillSelect = document.getElementById("verificationSkill");
const experience = document.getElementById("verificationExperience");
const evidence = document.getElementById("verificationEvidence");
const statusEl = document.getElementById("verificationStatus");
const message = document.getElementById("verificationMessage");
const panel = document.querySelector(".verification-panel");

let currentVerification = null;
let questions = [];
let questionIndex = 0;
let answers = {};

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

async function loadProfile() {
    if (!authService.isLoggedIn()) {
        form.querySelector("button").disabled = true;
        message.textContent = "Please log in before requesting skill verification.";
        message.classList.add("show");
        return;
    }

    try {
        const user = await authService.getCurrentUserFromAPI();
        const skills = Array.isArray(user?.teaching_skills_data)
            ? user.teaching_skills_data
            : (Array.isArray(user?.skills) ? user.skills.map(name => ({name})) : []);

        skillSelect.innerHTML = `<option value="">Select a skill</option>` +
            skills.map(skill => `<option value="${escapeAttr(skill.name)}">${escapeHTML(skill.name)}</option>`).join("");

        const requests = await api("/verifications/");
        const active = requests.find(item => item.status === "pending") || requests.find(item => item.status === "verified");
        if (active) {
            currentVerification = active;
            showStatus(active);
        }
    } catch (error) {
        console.error("Verification load failed:", error);
    }
}

function showStatus(item) {
    const labels = { pending: "Pending Review", verified: "Verified", rejected: "Not Passed" };
    statusEl.textContent = `${labels[item.status] || item.status}${item.score !== null && item.score !== undefined ? ` • ${item.score}%` : ""}`;
    statusEl.style.color = item.status === "verified" ? "#166534" : "#1D4ED8";
    statusEl.style.background = item.status === "verified" ? "#ECFDF5" : "#EAF3FF";
}

form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "Submitting...";

    try {
        currentVerification = await api("/verifications/", {
            method: "POST",
            body: JSON.stringify({
                skill: skillSelect.value,
                experience: experience.value.trim(),
                evidence_url: evidence.value.trim(),
            }),
        });

        showStatus(currentVerification);
        message.innerHTML = "Your verification request has been saved. Start the assessment below to verify your skill.";
        message.classList.add("show");

        if (currentVerification.status !== "verified") {
            await startAssessment();
        }
    } catch (error) {
        message.textContent = error.message;
        message.classList.add("show");
    } finally {
        button.disabled = false;
        button.textContent = "Submit for Verification →";
    }
});

async function startAssessment() {
    if (!currentVerification) return;
    const data = await api(`/verifications/${currentVerification.id}/questions/`);
    questions = data.questions || [];
    questionIndex = 0;
    answers = {};
    renderQuestion();
}

function renderQuestion() {
    let quiz = document.getElementById("verificationQuiz");
    if (!quiz) {
        quiz = document.createElement("div");
        quiz.id = "verificationQuiz";
        quiz.className = "verification-quiz";
        panel.appendChild(quiz);
    }

    if (!questions.length) {
        quiz.innerHTML = "<p>No assessment questions are available for this skill yet.</p>";
        return;
    }

    const q = questions[questionIndex];
    quiz.innerHTML = `
        <div class="quiz-header">
            <h3>Skill Assessment</h3>
            <span>Question ${questionIndex + 1} of ${questions.length}</span>
        </div>
        <p class="quiz-question">${escapeHTML(q.question)}</p>
        <div class="quiz-options">
            ${q.options.map(option => `
                <label class="quiz-option">
                    <input type="radio" name="verificationAnswer" value="${escapeAttr(option)}" ${answers[q.id] === option ? "checked" : ""}>
                    <span>${escapeHTML(option)}</span>
                </label>
            `).join("")}
        </div>
        <div class="quiz-actions">
            <button type="button" class="btn btn-secondary" id="quizPrev" ${questionIndex === 0 ? "disabled" : ""}>Previous</button>
            <button type="button" class="btn btn-primary" id="quizNext">${questionIndex === questions.length - 1 ? "Submit Assessment" : "Next →"}</button>
        </div>
    `;

    quiz.querySelectorAll('input[name="verificationAnswer"]').forEach(input => {
        input.addEventListener("change", () => {
            answers[q.id] = input.value;
        });
    });

    quiz.querySelector("#quizPrev").addEventListener("click", () => {
        if (questionIndex > 0) {
            questionIndex--;
            renderQuestion();
        }
    });

    quiz.querySelector("#quizNext").addEventListener("click", submitOrNext);
}

async function submitOrNext() {
    const q = questions[questionIndex];
    if (!answers[q.id]) {
        alert("Please select an answer.");
        return;
    }

    if (questionIndex < questions.length - 1) {
        questionIndex++;
        renderQuestion();
        return;
    }

    const button = document.getElementById("quizNext");
    button.disabled = true;
    button.textContent = "Submitting...";

    try {
        const result = await api(`/verifications/${currentVerification.id}/submit/`, {
            method: "POST",
            body: JSON.stringify({ answers }),
        });
        currentVerification = result.verification;
        showStatus(currentVerification);
        const quiz = document.getElementById("verificationQuiz");
        quiz.innerHTML = `
            <div class="verification-result">
                <h3>${result.attempt.passed ? "Verification Passed ✓" : "Assessment Not Passed"}</h3>
                <div class="verification-score">${result.attempt.score}%</div>
                <p>You answered ${result.correct_answers} of ${result.attempt.total_questions} questions correctly.</p>
                ${!result.attempt.passed ? '<button type="button" class="btn btn-primary" id="retakeVerification">Retake Assessment</button>' : ""}
            </div>
        `;
        const retake = document.getElementById("retakeVerification");
        if (retake) retake.addEventListener("click", startAssessment);
    } catch (error) {
        alert(error.message);
        button.disabled = false;
        button.textContent = "Submit Assessment";
    }
}

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

function escapeAttr(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

loadProfile();
