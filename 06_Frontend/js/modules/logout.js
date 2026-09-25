/**
 * =========================================================
 * CORAL REEF - LOGOUT MODULE
 * =========================================================
 */

import authService from "../services/authService.js";


export function setupLogout() {

    const logoutButtons =
        document.querySelectorAll(
            "[data-action='logout'], [data-nav='logout']"
        );


    logoutButtons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                authService.logout();

                const isPagesDirectory =
                    window.location.pathname.includes("/pages/");

                window.location.href =
                    isPagesDirectory
                        ? "login.html"
                        : "pages/login.html";

            }
        );

    });

}
