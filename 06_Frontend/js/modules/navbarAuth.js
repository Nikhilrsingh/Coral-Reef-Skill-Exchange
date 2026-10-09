import authService from "../services/authService.js";


export async function updateNavbarAuth() {

    const loggedIn =
        authService.isLoggedIn();


    const loggedOutElements =
        document.querySelectorAll(
            '[data-auth="logged-out"]'
        );

    const loggedInElements =
        document.querySelectorAll(
            '[data-auth="logged-in"]'
        );


    loggedOutElements.forEach(element => {

        element.style.display =
            loggedIn ? "none" : "flex";

    });


    loggedInElements.forEach(element => {

        element.style.display =
            loggedIn ? "flex" : "none";

    });


    if (!loggedIn) {
        return;
    }


    let user =
        authService.getCurrentUser();


    try {

        const latestUser =
            await authService.getCurrentUserFromAPI();

        if (latestUser) {
            user = latestUser;
        }

    } catch (error) {

        console.warn(
            "Could not refresh navbar profile:",
            error
        );

    }


    if (!user) {
        return;
    }


    updateProfileName(user);
    updateProfileImages(user);

}


function updateProfileName(user) {

    const name =
        user.name ||
        user.username ||
        "User";


    const navbarName =
        document.getElementById(
            "navbarProfileName"
        );

    const dropdownName =
        document.getElementById(
            "dropdownProfileName"
        );


    if (navbarName) {
        navbarName.textContent = name;
    }


    if (dropdownName) {
        dropdownName.textContent = name;
    }

}


function updateProfileImages(user) {

    const rawImage =
        user.profile_image ||
        user.profileImage ||
        user.image ||
        "";


    const image =
        normalizeImageUrl(rawImage);


    const images = [
        document.getElementById(
            "navbarProfileImage"
        ),
        document.getElementById(
            "dropdownProfileImage"
        )
    ];


    const fallbacks = [
        document.getElementById(
            "navbarProfileFallback"
        ),
        document.getElementById(
            "dropdownProfileFallback"
        )
    ];


    setFallbackInitials(
        user,
        fallbacks
    );


    if (!image) {

        removeProfileImages(images);

        return;

    }


    images.forEach(profileImage => {

        if (!profileImage) {
            return;
        }


        profileImage.src = image;


        profileImage.onload = () => {

            const avatar =
                profileImage.closest(
                    ".profile-avatar"
                );

            if (avatar) {

                avatar.classList.add(
                    "has-image"
                );

            }

        };


        profileImage.onerror = () => {

            const avatar =
                profileImage.closest(
                    ".profile-avatar"
                );

            if (avatar) {

                avatar.classList.remove(
                    "has-image"
                );

            }

        };

    });

}


function normalizeImageUrl(image) {

    if (!image) {
        return "";
    }


    if (
        image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("data:")
    ) {

        return image;

    }


    if (image.startsWith("/")) {

        return `http://172.20.10.2:8000${image}`;

    }


    return image;

}


function setFallbackInitials(
    user,
    fallbacks
) {

    const name =
        user?.name ||
        user?.username ||
        "User";


    const initials =
        name
            .trim()
            .split(/\s+/)
            .map(part => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();


    fallbacks.forEach(fallback => {

        if (fallback) {

            fallback.textContent =
                initials || "U";

        }

    });

}


function removeProfileImages(images) {

    images.forEach(image => {

        if (!image) {
            return;
        }


        const avatar =
            image.closest(
                ".profile-avatar"
            );


        if (avatar) {

            avatar.classList.remove(
                "has-image"
            );

        }

    });

}