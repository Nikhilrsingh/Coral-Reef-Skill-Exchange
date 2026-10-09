const API_BASE_URL = "http://172.20.10.2:8000/api";

const TOKEN_KEY = "coral_reef_token";
const USER_KEY = "coral_reef_user";


async function handleResponse(response) {

    const data =
        await response.json().catch(() => ({}));

    if (!response.ok) {

        const message =
            data.error ||
            data.detail ||
            "Something went wrong. Please try again.";

        throw new Error(message);
    }

    return data;
}


/* =========================================================
   LOGIN
   ========================================================= */

async function login(email, password) {

    const response = await fetch(
        `${API_BASE_URL}/auth/login/`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                email,
                password,
            }),
        }
    );

    const data =
        await handleResponse(response);

    localStorage.setItem(
        TOKEN_KEY,
        data.token
    );

    localStorage.setItem(
        USER_KEY,
        JSON.stringify(data.user)
    );

    return data.user;
}


/* =========================================================
   REGISTER
   ========================================================= */

async function register(userData) {

    const response = await fetch(
        `${API_BASE_URL}/auth/register/`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                role: userData.role || "student",
                bio: userData.bio || "",
                profile_image:
                    userData.profile_image || "",
            }),
        }
    );

    const data =
        await handleResponse(response);

    localStorage.setItem(
        TOKEN_KEY,
        data.token
    );

    localStorage.setItem(
        USER_KEY,
        JSON.stringify(data.user)
    );

    return data.user;
}


/* =========================================================
   GET TOKEN
   ========================================================= */

function getToken() {

    return localStorage.getItem(
        TOKEN_KEY
    );
}


/* =========================================================
   GET CURRENT USER FROM LOCAL STORAGE
   ========================================================= */

function getCurrentUser() {

    const user =
        localStorage.getItem(USER_KEY);

    if (!user) {
        return null;
    }

    try {

        return JSON.parse(user);

    } catch (error) {

        console.error(
            "Invalid stored user data:",
            error
        );

        return null;
    }
}


/* =========================================================
   CHECK LOGIN
   ========================================================= */

function isLoggedIn() {

    return Boolean(
        localStorage.getItem(TOKEN_KEY)
    );
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {

    localStorage.removeItem(
        TOKEN_KEY
    );

    localStorage.removeItem(
        USER_KEY
    );
}


/* =========================================================
   GET CURRENT USER FROM DJANGO
   ========================================================= */

async function getCurrentUserFromAPI() {

    const token = getToken();

    if (!token) {
        return null;
    }

    const response = await fetch(
        `${API_BASE_URL}/users/me/`,
        {
            method: "GET",

            headers: {
                "Authorization":
                    `Token ${token}`,
            },
        }
    );

    if (response.status === 401) {

        logout();

        return null;
    }

    const data =
    await handleResponse(response);


/*
   Convert Django skill fields into the
   frontend format used by Profile/Home.
*/

const normalizedUser = {
    ...data,

    profile_id:
        data.id,

    skills:
        Array.isArray(data.teaching_skills_data)
            ? data.teaching_skills_data.map(
                skill => skill.name
            )
            : [],

    learningSkills:
        Array.isArray(data.learning_skills_data)
            ? data.learning_skills_data.map(
                skill => skill.name
            )
            : [],
};


localStorage.setItem(
    USER_KEY,
    JSON.stringify(normalizedUser)
);

return normalizedUser;
}


/* =========================================================
   UPDATE PROFILE
   ========================================================= */

async function updateProfile(profileData) {

    const token = getToken();

    if (!token) {
        throw new Error(
            "You must be logged in."
        );
    }

   const user = getCurrentUser();

if (!user) {
    throw new Error(
        "You must be logged in."
    );
}

    const response = await fetch(
        `${API_BASE_URL}/users/me/`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json",

                "Authorization":
                    `Token ${token}`,
            },

            body: JSON.stringify(
                profileData
            ),
        }
    );

    const data =
        await handleResponse(response);

    localStorage.setItem(
        USER_KEY,
        JSON.stringify({
            ...user,
            ...data,
        })
    );

    return data;
}


/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

const authService = {

    login,
    register,
    logout,

    getToken,
    getCurrentUser,
    getCurrentUserFromAPI,

    isLoggedIn,

    updateProfile,
};


export default authService;