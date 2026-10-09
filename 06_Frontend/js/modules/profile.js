/**
 * =========================================================
 * CORAL REEF - PROFILE MODULE
 * =========================================================
 *
 * Handles:
 *
 * - Loading current user
 * - Editing profile
 * - Managing teaching skills
 * - Managing learning skills
 * - Connected platform profiles
 * - Saving profile
 * =========================================================
 */

import authService
    from "../services/authService.js";


/* =========================================================
   ELEMENTS
========================================================= */

const profileForm =
    document.getElementById("profileForm");

const nameInput =
    document.getElementById("name");

const emailInput =
    document.getElementById("email");

const roleInput =
    document.getElementById("role");

const bioInput =
    document.getElementById("bio");

const teachSkillInput =
    document.getElementById("teachSkillInput");

const learnSkillInput =
    document.getElementById("learnSkillInput");

const addTeachSkillButton =
    document.getElementById("addTeachSkill");

const addLearnSkillButton =
    document.getElementById("addLearnSkill");

const teachSkillsContainer =
    document.getElementById("teachSkills");

const learnSkillsContainer =
    document.getElementById("learnSkills");

const profileMessage =
    document.getElementById("profileMessage");


/* =========================================================
   CONNECTED PROFILE ELEMENTS
========================================================= */

const connectedPlatform =
    document.getElementById("connectedPlatform");

const connectedUsername =
    document.getElementById("connectedUsername");

const connectedProfileUrl =
    document.getElementById("connectedProfileUrl");

const addConnectedProfileButton =
    document.getElementById("addConnectedProfile");

const connectedProfilesContainer =
    document.getElementById("connectedProfiles");


/* =========================================================
   STATE
========================================================= */

let currentUser =
    authService.getCurrentUser();

let teachingSkills = [];

let learningSkills = [];

let connectedProfiles = [];


/* =========================================================
   API
========================================================= */

const API_BASE_URL =
    "http://172.20.10.2:8000/api";


/* =========================================================
   AUTH CHECK
========================================================= */

if (!currentUser) {

    window.location.href =
        "login.html";

} else {

    loadProfile();

    loadConnectedProfiles();

}


/* =========================================================
   LOAD PROFILE
========================================================= */

function loadProfile() {

    nameInput.value =
        currentUser.name || "";

    emailInput.value =
        currentUser.email || "";

    roleInput.value =
        currentUser.role || "student";

    bioInput.value =
        currentUser.bio || "";


    teachingSkills =
        Array.isArray(currentUser.skills)
            ? [...currentUser.skills]
            : [];


    learningSkills =
        Array.isArray(currentUser.learningSkills)
            ? [...currentUser.learningSkills]
            : [];


    renderSkills();
}


/* =========================================================
   RENDER SKILLS
========================================================= */

function renderSkills() {

    renderSkillList(
        teachingSkills,
        teachSkillsContainer,
        "teaching"
    );


    renderSkillList(
        learningSkills,
        learnSkillsContainer,
        "learning"
    );
}


function renderSkillList(
    skills,
    container,
    type
) {

    container.innerHTML = "";


    skills.forEach(
        (skill, index) => {

            const tag =
                document.createElement("div");

            tag.className =
                "skill-tag";


            const text =
                document.createElement("span");

            text.textContent =
                skill;


            const removeButton =
                document.createElement("button");

            removeButton.type =
                "button";

            removeButton.className =
                "skill-remove";

            removeButton.textContent =
                "×";


            removeButton.setAttribute(
                "aria-label",
                `Remove ${skill}`
            );


            removeButton.addEventListener(
                "click",
                () => {

                    removeSkill(
                        type,
                        index
                    );

                }
            );


            tag.appendChild(text);

            tag.appendChild(removeButton);

            container.appendChild(tag);

        }
    );
}


/* =========================================================
   ADD SKILL
========================================================= */

function addSkill(
    type,
    input
) {

    const skill =
        input.value.trim();


    if (!skill) {
        return;
    }


    const targetArray =
        type === "teaching"
            ? teachingSkills
            : learningSkills;


    const exists =
        targetArray.some(
            item =>
                item.toLowerCase() ===
                skill.toLowerCase()
        );


    if (exists) {

        showMessage(
            "This skill has already been added.",
            "error"
        );

        input.value = "";

        return;
    }


    targetArray.push(skill);

    input.value = "";

    renderSkills();

    clearMessage();
}


addTeachSkillButton.addEventListener(
    "click",
    () => {

        addSkill(
            "teaching",
            teachSkillInput
        );

    }
);


addLearnSkillButton.addEventListener(
    "click",
    () => {

        addSkill(
            "learning",
            learnSkillInput
        );

    }
);


/* =========================================================
   ENTER KEY FOR SKILLS
========================================================= */

teachSkillInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            addSkill(
                "teaching",
                teachSkillInput
            );
        }

    }
);


learnSkillInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            addSkill(
                "learning",
                learnSkillInput
            );
        }

    }
);


/* =========================================================
   REMOVE SKILL
========================================================= */

function removeSkill(
    type,
    index
) {

    if (type === "teaching") {

        teachingSkills.splice(
            index,
            1
        );

    } else {

        learningSkills.splice(
            index,
            1
        );
    }


    renderSkills();

    clearMessage();
}


/* =========================================================
   SAVE PROFILE
========================================================= */

profileForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const name =
            nameInput.value.trim();


        if (!name) {

            showMessage(
                "Please enter your name.",
                "error"
            );

            return;
        }


        if (name.length < 2) {

            showMessage(
                "Name must contain at least 2 characters.",
                "error"
            );

            return;
        }


        try {

            const updatedUser =
    await authService.updateProfile(
        {
            name,

            role:
                roleInput.value,

            bio:
                bioInput.value.trim(),

            teaching_skills:
                teachingSkills,

            learning_skills:
                learningSkills
        }
    );


            currentUser =
                {
                    ...currentUser,
                    ...updatedUser
                };


            showMessage(
                "Profile updated successfully.",
                "success"
            );


        } catch (error) {

            showMessage(
                error.message ||
                "Unable to update profile.",
                "error"
            );

        }

    }
);


/* =========================================================
   LOAD CONNECTED PROFILES
========================================================= */

async function loadConnectedProfiles() {

    const token =
        authService.getToken();


    if (!token) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/users/me/profiles/`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Token ${token}`,
                    },
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load connected profiles."
            );
        }


        connectedProfiles =
            await response.json();


        renderConnectedProfiles();


    } catch (error) {

        console.error(
            "Connected profiles error:",
            error
        );

    }
}


/* =========================================================
   RENDER CONNECTED PROFILES
========================================================= */

function renderConnectedProfiles() {

    connectedProfilesContainer.innerHTML = "";

    const socialContainer =
        document.getElementById("socialProfiles");


    if (socialContainer) {
        socialContainer.innerHTML = "";
    }


    if (!connectedProfiles.length) {

        connectedProfilesContainer.innerHTML = `
            <p class="connected-profile-empty">
                No profiles connected yet.
            </p>
        `;

        if (socialContainer) {

            socialContainer.innerHTML = `
                <p class="social-profile-empty">
                    Your social profiles will appear here
                    once you connect them.
                </p>
            `;

        }

        return;
    }


    connectedProfiles.forEach(
        profile => {

            const config =
                getPlatformConfig(
                    profile.platform
                );


            const card =
                document.createElement("div");

            card.className =
                config.type === "social"
                    ? "social-profile-card"
                    : "connected-profile-card";


            card.dataset.platform =
                profile.platform;


            card.dataset.profileType =
                config.type;


            const icon =
                document.createElement("div");

            icon.className =
                "connected-profile-icon";

            icon.textContent =
                config.icon;


            const content =
                document.createElement("div");

            content.className =
                "connected-profile-content";


            const platform =
                document.createElement("strong");

            platform.textContent =
                config.name;


            const username =
                document.createElement("span");

            username.textContent =
                profile.username
                    ? `@${profile.username}`
                    : "Profile connected";


            const description =
                document.createElement("small");

            description.textContent =
                config.description;


            content.appendChild(platform);

            content.appendChild(username);

            content.appendChild(description);


            const link =
                document.createElement("a");

            link.href =
                profile.profile_url;

            link.target =
                "_blank";

            link.rel =
                "noopener noreferrer";

            link.textContent =
                config.action;


            card.appendChild(icon);

            card.appendChild(content);

            card.appendChild(link);


            if (config.type === "social") {

                if (socialContainer) {

                    socialContainer.appendChild(
                        card
                    );

                }

            } else {

                connectedProfilesContainer.appendChild(
                    card
                );

            }

        }
    );


    if (
        connectedProfilesContainer.children.length === 0
    ) {

        connectedProfilesContainer.innerHTML = `
            <p class="connected-profile-empty">
                No professional or coding profiles
                connected yet.
            </p>
        `;

    }


    if (
        socialContainer &&
        socialContainer.children.length === 0
    ) {

        socialContainer.innerHTML = `
            <p class="social-profile-empty">
                No social media profiles connected yet.
            </p>
        `;

    }

}


/* =========================================================
   PLATFORM NAME
========================================================= */

/* =========================================================
   PLATFORM CONFIGURATION
========================================================= */

function getPlatformConfig(platform) {

    const platforms = {

        github: {
            name: "GitHub",
            type: "professional",
            icon: "GH",
            description: "Code, repositories and open-source work",
            action: "View GitHub"
        },

        linkedin: {
            name: "LinkedIn",
            type: "professional",
            icon: "in",
            description: "Professional experience and connections",
            action: "View LinkedIn"
        },

        leetcode: {
            name: "LeetCode",
            type: "coding",
            icon: "LC",
            description: "Coding problems, solutions and achievements",
            action: "View LeetCode"
        },

        codechef: {
            name: "CodeChef",
            type: "coding",
            icon: "CC",
            description: "Competitive programming profile",
            action: "View CodeChef"
        },

        codeforces: {
            name: "Codeforces",
            type: "coding",
            icon: "CF",
            description: "Competitive programming and contests",
            action: "View Codeforces"
        },

        hackerrank: {
            name: "HackerRank",
            type: "coding",
            icon: "HR",
            description: "Coding challenges and certifications",
            action: "View HackerRank"
        },

        behance: {
            name: "Behance",
            type: "creative",
            icon: "Be",
            description: "Creative work and design portfolio",
            action: "View Behance"
        },

        website: {
            name: "Personal Website",
            type: "professional",
            icon: "↗",
            description: "Personal website and portfolio",
            action: "Visit Website"
        },

        instagram: {
            name: "Instagram",
            type: "social",
            icon: "IG",
            description: "Photos, stories and social updates",
            action: "View Instagram"
        },

        facebook: {
            name: "Facebook",
            type: "social",
            icon: "f",
            description: "Social profile and community",
            action: "View Facebook"
        },

        twitter: {
    name: "X / Twitter",
    type: "social",
    icon: "𝕏",
    description: "Posts, updates and conversations",
    action: "View X / Twitter"
},

        youtube: {
            name: "YouTube",
            type: "social",
            icon: "YT",
            description: "Videos and creative content",
            action: "View YouTube"
        },

        discord: {
            name: "Discord",
            type: "social",
            icon: "DC",
            description: "Community and communication",
            action: "Open Discord"
        },

        telegram: {
            name: "Telegram",
            type: "social",
            icon: "TG",
            description: "Messages and communities",
            action: "Open Telegram"
        },

        threads: {
    name: "Threads",
    type: "social",
    icon: "@",
    description: "Posts, conversations and social updates",
    action: "View Threads"
},

        other: {
            name: "Other",
            type: "other",
            icon: "↗",
            description: "External profile",
            action: "View Profile"
        }

    };

    return platforms[platform] || platforms.other;
}


function getPlatformName(platform) {

    return getPlatformConfig(platform).name;

}


/* =========================================================
   ADD CONNECTED PROFILE
========================================================= */

addConnectedProfileButton.addEventListener(
    "click",
    async () => {

        const platform =
            connectedPlatform.value;

        const username =
            connectedUsername.value.trim();

        const profileUrl =
            connectedProfileUrl.value.trim();


        if (!username) {

            showMessage(
                "Please enter a username.",
                "error"
            );

            return;
        }


        if (!profileUrl) {

            showMessage(
                "Please enter the profile URL.",
                "error"
            );

            return;
        }


        const token =
            authService.getToken();


        if (!token) {

            showMessage(
                "You must be logged in.",
                "error"
            );

            return;
        }


        addConnectedProfileButton.disabled =
            true;

        addConnectedProfileButton.textContent =
            "Connecting...";


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/users/me/profiles/`,
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Token ${token}`

                        },

                        body:
                            JSON.stringify({
                                platform,
                                username,
                                profile_url:
                                    profileUrl,
                                is_connected:
                                    true
                            })
                    }
                );


            const data =
                await response.json()
                    .catch(() => ({}));


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.detail ||
                    "Unable to connect profile."
                );
            }


            await loadConnectedProfiles();


            connectedUsername.value = "";

            connectedProfileUrl.value = "";


            showMessage(
                "Profile connected successfully.",
                "success"
            );


        } catch (error) {

            showMessage(
                error.message ||
                "Unable to connect profile.",
                "error"
            );

        } finally {

            addConnectedProfileButton.disabled =
                false;

            addConnectedProfileButton.textContent =
                "Connect Profile";

        }

    }
);


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    type
) {

    profileMessage.textContent =
        message;

    profileMessage.className =
        `profile-message show ${type}`;
}


function clearMessage() {

    profileMessage.textContent = "";

    profileMessage.className =
        "profile-message";
}