/* =========================================================
   NOVELLOW
   PROFILE.JS

   Profile drawer
   Profile form
   Sign out
   Supabase profile updates
   ========================================================= */

(() => {

    "use strict";


    window.NOVELLOW =
        window.NOVELLOW ||
        {};


    const Novellow =
        window.NOVELLOW;


    let initialized =
        false;


    let currentProfile =
        null;


    /* =====================================================
       HELPERS
       ===================================================== */

    function byId(id) {

        return document.getElementById(id);

    }


    function cleanString(value) {

        return String(
            value ||
            ""
        ).trim();

    }


    function firstInitial(value) {

        const clean =
            cleanString(value);


        if (!clean) {

            return "N";

        }


        return clean
            .charAt(0)
            .toUpperCase();

    }


    /* =====================================================
       INIT
       ===================================================== */

    function init() {

        if (initialized) {
            return;
        }


        initialized =
            true;


        bindControls();


        document.addEventListener(
            "novellow:user-ready",
            event => {

                const user =
                    event.detail
                        ?.user ||
                    null;


                const profile =
                    event.detail
                        ?.profile ||
                    null;


                setCurrentProfile(
                    user,
                    profile
                );

            }
        );


        if (
            Novellow.currentUser
        ) {

            setCurrentProfile(
                Novellow.currentUser,
                Novellow.profile
            );

        }

    }


    /* =====================================================
       BIND
       ===================================================== */

    function bindControls() {

        byId(
            "openProfileDrawer"
        )?.addEventListener(
            "click",
            openDrawer
        );


        byId(
            "closeProfileDrawer"
        )?.addEventListener(
            "click",
            closeDrawer
        );


        byId(
            "cancelProfileButton"
        )?.addEventListener(
            "click",
            closeDrawer
        );


        byId(
            "profileForm"
        )?.addEventListener(
            "submit",
            handleSubmit
        );


        byId(
            "profileSignOutButton"
        )?.addEventListener(
            "click",
            handleSignOut
        );


        byId(
            "profileDisplayName"
        )?.addEventListener(
            "input",
            updatePreviewFromForm
        );


        byId(
            "profileLibraryName"
        )?.addEventListener(
            "input",
            updatePreviewFromForm
        );


        byId(
            "overlay"
        )?.addEventListener(
            "click",
            () => {

                if (
                    !byId(
                        "profileDrawer"
                    )?.hidden
                ) {

                    closeDrawer();

                }

            }
        );


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    if (
                        !byId(
                            "profileDrawer"
                        )?.hidden
                    ) {

                        closeDrawer();

                    }

                }

            }
        );

    }


    /* =====================================================
       SET PROFILE
       ===================================================== */

    function setCurrentProfile(
        user,
        profile
    ) {

        currentProfile =
            profile ||
            null;


        Novellow.profile =
            currentProfile;


        const displayName =
            cleanString(
                currentProfile
                    ?.display_name
            );


        const email =
            cleanString(
                user?.email
            );


        const headerInitial =
            byId(
                "profileHeaderInitial"
            );


        if (headerInitial) {

            headerInitial.textContent =
                firstInitial(
                    displayName ||
                    email ||
                    "N"
                );

        }


        const avatarPreview =
            byId(
                "profileAvatarPreview"
            );


        if (avatarPreview) {

            avatarPreview.textContent =
                firstInitial(
                    displayName ||
                    email ||
                    "N"
                );

        }


        const previewName =
            byId(
                "profilePreviewName"
            );


        if (previewName) {

            previewName.textContent =
                displayName ||
                "Your Profile";

        }


        const profileEmail =
            byId(
                "profileEmail"
            );


        if (profileEmail) {

            profileEmail.textContent =
                email ||
                "—";

        }

    }


    /* =====================================================
       OPEN
       ===================================================== */

    function openDrawer() {

        if (
            !Novellow.currentUser
        ) {

            return;

        }


        populateForm();


        const drawer =
            byId(
                "profileDrawer"
            );


        const overlay =
            byId(
                "overlay"
            );


        if (drawer) {

            drawer.hidden =
                false;

        }


        if (overlay) {

            overlay.hidden =
                false;

        }


        document.body.classList.add(
            "drawer-open"
        );


        requestAnimationFrame(
            () => {

                byId(
                    "profileDisplayName"
                )?.focus();

            }
        );

    }


    /* =====================================================
       CLOSE
       ===================================================== */

    function closeDrawer() {

        const drawer =
            byId(
                "profileDrawer"
            );


        const overlay =
            byId(
                "overlay"
            );


        if (drawer) {

            drawer.hidden =
                true;

        }


        if (overlay) {

            overlay.hidden =
                true;

        }


        document.body.classList.remove(
            "drawer-open"
        );


        clearMessage();

    }


    /* =====================================================
       POPULATE FORM
       ===================================================== */

    function populateForm() {

        const profile =
            currentProfile ||
            Novellow.profile ||
            {};


        const user =
            Novellow.currentUser ||
            null;


        const displayName =
            byId(
                "profileDisplayName"
            );


        const username =
            byId(
                "profileUsername"
            );


        const libraryName =
            byId(
                "profileLibraryName"
            );


        const bio =
            byId(
                "profileBio"
            );


        const email =
            byId(
                "profileEmail"
            );


        if (displayName) {

            displayName.value =
                profile.display_name ||
                "";

        }


        if (username) {

            username.value =
                profile.username ||
                "";

        }


        if (libraryName) {

            libraryName.value =
                profile.library_name ||
                "My Library";

        }


        if (bio) {

            bio.value =
                profile.bio ||
                "";

        }


        if (email) {

            email.textContent =
                user?.email ||
                "—";

        }


        updatePreviewFromForm();

    }


    /* =====================================================
       PREVIEW
       ===================================================== */

    function updatePreviewFromForm() {

        const displayName =
            cleanString(
                byId(
                    "profileDisplayName"
                )?.value
            );


        const libraryName =
            cleanString(
                byId(
                    "profileLibraryName"
                )?.value
            );


        const userEmail =
            cleanString(
                Novellow.currentUser
                    ?.email
            );


        const previewName =
            byId(
                "profilePreviewName"
            );


        if (previewName) {

            previewName.textContent =
                displayName ||
                libraryName ||
                "Your Profile";

        }


        const avatarPreview =
            byId(
                "profileAvatarPreview"
            );


        if (avatarPreview) {

            avatarPreview.textContent =
                firstInitial(
                    displayName ||
                    userEmail ||
                    "N"
                );

        }

    }


    /* =====================================================
       SAVE PROFILE
       ===================================================== */

    async function handleSubmit(
        event
    ) {

        event.preventDefault();


        const user =
            Novellow.currentUser;


        if (
            !user?.id
        ) {

            showMessage(
                "No signed-in user was found."
            );

            return;

        }


        const displayName =
            cleanString(
                byId(
                    "profileDisplayName"
                )?.value
            );


        const username =
            cleanString(
                byId(
                    "profileUsername"
                )?.value
            )
                .toLowerCase();


        const libraryName =
            cleanString(
                byId(
                    "profileLibraryName"
                )?.value
            );


        const bio =
            cleanString(
                byId(
                    "profileBio"
                )?.value
            );


        if (
            !displayName
        ) {

            showMessage(
                "Enter a display name."
            );

            return;

        }


        if (
            username &&
            !isValidUsername(
                username
            )
        ) {

            showMessage(
                "Username can use letters, numbers, underscores, and periods only."
            );

            return;

        }


        setSaving(
            true
        );


        clearMessage();


        try {

            const updatedProfile =
                await Novellow.supabase
                    .updateProfile(
                        user.id,
                        {

                            display_name:
                                displayName,

                            username:
                                username ||
                                null,

                            library_name:
                                libraryName ||
                                "My Library",

                            bio

                        }
                    );


            currentProfile =
                updatedProfile;


            Novellow.profile =
                updatedProfile;


            setCurrentProfile(
                user,
                updatedProfile
            );


            showMessage(
                "Profile saved.",
                true
            );


            document.dispatchEvent(
                new CustomEvent(
                    "novellow:profile-updated",
                    {

                        detail: {

                            user,

                            profile:
                                updatedProfile

                        }

                    }
                )
            );


            window.setTimeout(
                () => {

                    closeDrawer();

                },
                650
            );

        } catch (error) {

            console.error(
                "Novellow profile save failed:",
                error
            );


            if (
                String(
                    error?.code ||
                    ""
                ) ===
                "23505"
            ) {

                showMessage(
                    "That username is already being used."
                );

            } else {

                showMessage(
                    error?.message ||
                    "Unable to save your profile."
                );

            }

        } finally {

            setSaving(
                false
            );

        }

    }


    /* =====================================================
       USERNAME VALIDATION
       ===================================================== */

    function isValidUsername(
        username
    ) {

        return /^[a-z0-9._]+$/
            .test(
                username
            );

    }


    /* =====================================================
       SIGN OUT
       ===================================================== */

    async function handleSignOut() {

        const button =
            byId(
                "profileSignOutButton"
            );


        if (button) {

            button.disabled =
                true;


            button.textContent =
                "Signing Out...";

        }


        try {

            closeDrawer();


            await Novellow.auth
                ?.signOut?.();

        } catch (error) {

            console.error(
                "Novellow sign out failed:",
                error
            );

        } finally {

            if (button) {

                button.disabled =
                    false;


                button.textContent =
                    "Sign Out";

            }

        }

    }


    /* =====================================================
       SAVING STATE
       ===================================================== */

    function setSaving(
        saving
    ) {

        const button =
            byId(
                "saveProfileButton"
            );


        if (!button) {
            return;
        }


        button.disabled =
            saving;


        button.textContent =
            saving
                ? "Saving..."
                : "Save Profile";

    }


    /* =====================================================
       MESSAGES
       ===================================================== */

    function showMessage(
        message,
        success = false
    ) {

        const element =
            byId(
                "profileMessage"
            );


        if (!element) {
            return;
        }


        element.textContent =
            message;


        element.classList.toggle(
            "success",
            success
        );

    }


    function clearMessage() {

        showMessage(
            ""
        );

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    Novellow.profileUI = {

        init,

        openDrawer,

        closeDrawer,

        populateForm,

        setCurrentProfile

    };


    /* =====================================================
       START
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );

    } else {

        init();

    }


})();
