/**
 * =========================================================
 * CORAL REEF
 * REGISTRATION MODULE
 * =========================================================
 *
 * Responsible for:
 *
 * - Registration form handling
 * - Input validation
 * - Password confirmation
 * - Creating a user account
 *
 * Actual data handling is delegated to authService.js.
 * =========================================================
 */

import authService
    from "../services/authService.js";


const registerForm =
    document.getElementById("registerForm");

const nameInput =
    document.getElementById("name");

const emailInput =
    document.getElementById("email");

const roleInput =
    document.getElementById("role");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const registerButton =
    document.getElementById("registerButton");

const registerError =
    document.getElementById("registerError");

const registerSuccess =
    document.getElementById("registerSuccess");


/* =========================================================
   MESSAGE FUNCTIONS
========================================================= */

function showError(message) {

    registerSuccess.classList.remove("show");

    registerError.textContent = message;

    registerError.classList.add("show");
}


function showSuccess(message) {

    registerError.classList.remove("show");

    registerSuccess.textContent = message;

    registerSuccess.classList.add("show");
}


function clearMessages() {

    registerError.classList.remove("show");

    registerSuccess.classList.remove("show");
}


/* =========================================================
   VALIDATION
========================================================= */

function validateRegistration(
    name,
    email,
    role,
    password,
    confirmPassword
) {

    if (!name) {
        return "Please enter your full name.";
    }

    if (name.length < 2) {
        return "Name must contain at least 2 characters.";
    }

    if (!email) {
        return "Please enter your email address.";
    }

    if (!email.includes("@")) {
        return "Please enter a valid email address.";
    }

    if (!role) {
        return "Please select your role.";
    }

    if (!password) {
        return "Please create a password.";
    }

    if (password.length < 6) {
        return "Password must contain at least 6 characters.";
    }

    if (!confirmPassword) {
        return "Please confirm your password.";
    }

    if (password !== confirmPassword) {
        return "Passwords do not match.";
    }

    return null;
}


/* =========================================================
   REGISTER
========================================================= */

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        clearMessages();


        const name =
            nameInput.value.trim();

        const email =
            emailInput.value.trim();

        const role =
            roleInput.value;

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        /* Validate */

        const validationError =
            validateRegistration(
                name,
                email,
                role,
                password,
                confirmPassword
            );


        if (validationError) {

            showError(validationError);

            return;
        }


        /* Disable button */

        registerButton.disabled = true;

        registerButton.textContent =
            "Creating Account...";


        try {

            const result =
                await authService.register({

                    name,
                    email,
                    password,
                    role

                });


            if (!result.success) {

                throw new Error(
                    "profile created."
                );

            }


            showSuccess(
                "Account created successfully! Redirecting to login..."
            );


            /*
             * Redirect to login after successful
             * account creation.
             */

            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 1000);


        } catch (error) {

            showError(
                error.message ||
                "Unable to create account. Please try again."
            );

            registerButton.disabled = false;

            registerButton.textContent =
                "Create Account";
        }

    }
);