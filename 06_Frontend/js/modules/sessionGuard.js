/**
 * =========================================================
 * CORAL REEF - SESSION GUARD
 * =========================================================
 *
 * Protects pages that require authentication.
 *
 * Later this will work with the authenticated Django
 * session/token instead of localStorage.
 * =========================================================
 */

import authService
    from "../services/authService.js";


const currentUser =
    authService.getCurrentUser();


/*
 * If there is no authenticated user,
 * send them to Login.
 */

if (!currentUser) {

    window.location.href =
        "login.html";
}