/**
 * =========================================================
 * CORAL REEF
 * AUTHENTICATION MODULE
 * =========================================================
 *
 * Responsible for:
 *
 * - Login form handling
 * - Input validation
 * - Authentication request
 * - Session creation
 * - Redirect after login
 *
 * Authentication logic itself is kept inside:
 *
 * services/authService.js
 *
 * This separation allows us to replace the current
 * frontend implementation with Django APIs later.
 * =========================================================
 */

import authService
    from "../services/authService.js";


const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const loginError =
    document.getElementById("loginError");

const loginSuccess =
    document.getElementById("loginSuccess");



/* =========================================================
   MESSAGE HELPERS
========================================================= */

function showError(message) {

    loginSuccess.classList.remove("show");

    loginError.textContent = message;

    loginError.classList.add("show");
}


function showSuccess(message) {

    loginError.classList.remove("show");

    loginSuccess.textContent = message;

    loginSuccess.classList.add("show");
}


function clearMessages() {

    loginError.classList.remove("show");

    loginSuccess.classList.remove("show");
}



/* =========================================================
   VALIDATION
========================================================= */

function validateLogin(email, password) {

    if (!email) {

        return "Please enter your email address.";

    }


    if (!email.includes("@")) {

        return "Please enter a valid email address.";

    }


    if (!password) {

        return "Please enter your password.";

    }


    return null;
}



/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        clearMessages();


        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        const validationError =
            validateLogin(
                email,
                password
            );


        if (validationError) {

            showError(validationError);

            return;
        }


        loginButton.disabled = true;

        loginButton.textContent =
            "Signing in...";


        try {

           const user =
    await authService.login(
        email,
        password
    );


showSuccess(
    `Welcome back, ${user.name}!`
);


            /*
                Small delay allows the success message
                to be visible before redirecting.
            */

            setTimeout(() => {

                /*
                    Dashboard will become the protected
                    user area in the next stage.

                    For now we redirect to the homepage
                    until dashboard authentication is added.
                */

                window.location.href =
                    "../index.html";

            }, 700);


        } catch (error) {

            showError(
                error.message ||
                "Unable to login. Please try again."
            );

            loginButton.disabled = false;

            loginButton.textContent =
                "Login";
        }

    }
);