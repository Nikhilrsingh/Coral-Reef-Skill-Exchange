/**
 * =========================================================
 * CORAL REEF - HOME DASHBOARD MODULE
 * =========================================================
 *
 * Loads the currently logged-in user's information
 * and real matching information from Django.
 * =========================================================
 */

import authService
    from "../services/authService.js";


/* =========================================================
   ELEMENTS
========================================================= */

const welcomeName =
    document.getElementById("dashboardUserName");

const skillsShared =
    document.getElementById("dashboardSkillsShared");

const learningPartners =
    document.getElementById("dashboardLearningPartners");

const matchScore =
    document.getElementById("dashboardMatchScore");

const matchName =
    document.getElementById("dashboardMatchName");

const matchInitials =
    document.getElementById("dashboardMatchInitials");

const matchRole =
    document.getElementById("dashboardMatchRole");

const matchSkill =
    document.getElementById("dashboardMatchSkill");


/* =========================================================
   API
========================================================= */

const API_BASE_URL =
    "http://172.20.10.2:8000/api";


/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadDashboard() {

    const token =
        authService.getToken();


    /*
       User is not logged in.
    */

    if (!token) {

        return;

    }


    try {

        /*
           Get latest user information
           directly from Django.
        */

        const user =
            await authService.getCurrentUserFromAPI();


        if (!user) {

            return;

        }


        /*
           Update basic dashboard information.
        */

        updateDashboard(user);
        updateHomeProfileSnapshot(user);


        /*
           Load real matches.
        */

        await loadMatches(user);


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }

}


/* =========================================================
   UPDATE BASIC DASHBOARD
========================================================= */

function updateDashboard(user) {


    /* -----------------------------------------------------
       USER NAME
    ----------------------------------------------------- */

    if (welcomeName) {

        welcomeName.textContent =
            user.name || "User";

    }


    /* -----------------------------------------------------
       TEACHING SKILLS / SKILLS SHARED
    ----------------------------------------------------- */

    const teachingSkills =
        Array.isArray(user.skills)
            ? user.skills
            : [];


    if (skillsShared) {

        skillsShared.textContent =
            teachingSkills.length;

    }

}


/* =========================================================
   LOAD MATCHES
========================================================= */

async function loadMatches(user) {

    /*
       profile_id is the UserProfile ID used
       by the Django matching endpoint.
    */

    const profileId =
        user.profile_id;


    if (!profileId) {

        console.warn(
            "Profile ID missing. Cannot load matches."
        );

        showNoMatch();

        return;

    }


    const token =
        authService.getToken();


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/users/${profileId}/matches/`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Token ${token}`,

                        "Content-Type":
                            "application/json",
                    },
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to load matches."
            );

        }


        const matches =
            Array.isArray(data.matches)
                ? data.matches
                : [];


        /*
           Number of actual learning partners.
        */

        if (learningPartners) {

            learningPartners.textContent =
                matches.length;

        }


        /*
           No matches.
        */

        if (matches.length === 0) {

            showNoMatch();

            return;

        }


        /*
           For now the backend returns matches
           but does not yet provide a percentage score.

           Since these are mutual skill matches,
           the first/top match is treated as the
           current best match.
        */

        const topMatch =
            matches[0];


        showTopMatch(
            topMatch,
            user
        );


    } catch (error) {

        console.error(
            "Match loading error:",
            error
        );

        if (learningPartners) {

            learningPartners.textContent =
                "—";

        }

        showNoMatch();

    }

}


/* =========================================================
   SHOW TOP MATCH
========================================================= */

function showTopMatch(match, user) {


    /* -----------------------------------------------------
       NAME
    ----------------------------------------------------- */

    if (matchName) {

        matchName.textContent =
            match.name || "User";

    }


    /* -----------------------------------------------------
       INITIALS
    ----------------------------------------------------- */

    if (matchInitials) {

        matchInitials.textContent =
            getInitials(
                match.name
            );

    }


    /* -----------------------------------------------------
       ROLE
    ----------------------------------------------------- */

    if (matchRole) {

        matchRole.textContent =
            match.role
                ? formatRole(match.role)
                : "Coral Reef Member";

    }


    /* -----------------------------------------------------
       MATCHED SKILL
    ----------------------------------------------------- */

    if (matchSkill) {

    const matchedSkills =
        Array.isArray(match.teaches_skills)
            ? match.teaches_skills
            : [];


    if (matchedSkills.length > 0) {

        matchSkill.textContent =
            matchedSkills.join(", ");

    } else {

        matchSkill.textContent =
            "Skill match";

    }

}


        /* -----------------------------------------------------
       MATCH SCORE
       
       Score is calculated by Django backend.
    ----------------------------------------------------- */

    if (matchScore) {

        const score =
            Number(match.match_score);

        matchScore.textContent =
            Number.isFinite(score)
                ? `${score}%`
                : "—";

    }

}


/* =========================================================
   NO MATCH STATE
========================================================= */

function showNoMatch() {


    if (matchName) {

        matchName.textContent =
            "No match yet";

    }


    if (matchInitials) {

        matchInitials.textContent =
            "—";

    }


    if (matchRole) {

        matchRole.textContent =
            "Complete your profile";

    }


    if (matchSkill) {

        matchSkill.textContent =
            "Add learning interests";

    }


    if (matchScore) {

        matchScore.textContent =
            "—";

    }

}


/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {

    if (!name) {

        return "—";

    }


    const words =
        name.trim().split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


function formatRole(role) {

    return role
        .replace(/_/g, " ")
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );

}




function updateHomeProfileSnapshot(user) {
    const teach = Array.isArray(user?.skills) ? user.skills : [];
    const learn = Array.isArray(user?.learningSkills) ? user.learningSkills : [];
    const teachBox = document.getElementById("homeTeachingSkills");
    const learnBox = document.getElementById("homeLearningSkills");
    const text = document.getElementById("homeProfileSnapshotText");
    const action = document.getElementById("homeProfileSnapshotAction");
    const render = (items, empty) => items.length ? items.slice(0,5).map(skill => `<span>${escapeSnapshot(skill)}</span>`).join("") : `<em>${empty}</em>`;
    if (teachBox) teachBox.innerHTML = render(teach, "No teaching skills added yet");
    if (learnBox) learnBox.innerHTML = render(learn, "No learning goals added yet");
    if (text) text.textContent = teach.length && learn.length ? "Your profile is ready to power better matches. Keep your skills updated as you grow." : "Complete both skill lists to personalize your matches and show your learning goals on your home page.";
    if (action) action.textContent = teach.length && learn.length ? "Edit Profile →" : "Complete Profile →";
}

function escapeSnapshot(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

/* =========================================================
   INITIALIZE
========================================================= */

if (authService.isLoggedIn()) {

    loadDashboard();

} else {
    updateHomeProfileSnapshot({ skills: [], learningSkills: [] });
}