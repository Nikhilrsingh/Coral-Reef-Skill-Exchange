import { setupLogout } from "./logout.js";
document.addEventListener("DOMContentLoaded", async () => {

   await loadSharedComponents();

   setupLogout();

fixSharedLinks();

setupMobileMenu();
setupActiveNavigation();
setupProfileMenu();
setupNavbarAuth();

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