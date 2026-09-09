/* =========================================================
   NOVELLOW
   AUTH.JS

   Login
   Signup
   Session restoration
   Authentication UI
   ========================================================= */

(() => {

    "use strict";


    window.NOVELLOW =
        window.NOVELLOW ||
        {};


    const Novellow =
        window.NOVELLOW;


    let mode =
        "signin";


    let initialized =
        false;


    /* =====================================================
       ELEMENT HELPER
       ===================================================== */

    function byId(id) {

        return document.getElementById(id);

    }


    /* =====================================================
       TEXT HELPER
       ===================================================== */

    function setText(id, value) {

        const element =
            byId(id);


        if (element) {

            element.textContent =
                value;

        }

    }


    /* =====================================================
       MESSAGE HELPERS
       ===================================================== */

    function showMessage(
        message,
        success = false
    ) {

        const element =
            byId("authMessage");


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

        showMessage("");

    }


    /* =====================================================
       AUTH MODE
       ===================================================== */

    function setMode(nextMode) {

        mode =
            nextMode === "signup"
                ? "signup"
                : "signin";


        const signingUp =
            mode === "signup";


        const signInButton =
            byId("showSignIn");


        const signUpButton =
            byId("showSignUp");


        const signupFields =
            byId("authSignupFields");


        const password =
            byId("authPassword");


        if (signInButton) {

            signInButton.classList.toggle(
                "active",
                !signingUp
            );


            signInButton.setAttribute(
                "aria-pressed",
                String(!signingUp)
            );

        }


        if (signUpButton) {

            signUpButton.classList.toggle(
                "active",
                signingUp
            );


            signUpButton.setAttribute(
                "aria-pressed",
                String(signingUp)
            );

        }


        if (signupFields) {

            signupFields.hidden =
                !signingUp;

        }


        if (password) {

            password.autocomplete =
                signingUp
                    ? "new-password"
                    : "current-password";

        }


        setText(
            "authTitle",
            signingUp
                ? "Begin Your Library"
                : "Welcome Back"
        );


        setText(
            "authSubtitle",
            signingUp
                ? "Create your Novellow account and make this library your own."
                : "Enter your library and pick up where you left off."
        );


        setText(
            "authSubmit",
            signingUp
                ? "Create My Library"
                : "Enter Library"
        );


        clearMessage();

    }


    /* =====================================================
       BIND CONTROLS
       ===================================================== */

    function bindControls() {

        const signInButton =
            byId("showSignIn");


        const signUpButton =
            byId("showSignUp");


        const authForm =
            byId("authForm");


        if (signInButton) {

            signInButton.addEventListener(
                "click",
                () => {

                    setMode("signin");

                }
            );

        }


        if (signUpButton) {

            signUpButton.addEventListener(
                "click",
                () => {

                    setMode("signup");

                }
            );

        }


        if (authForm) {

            authForm.addEventListener(
                "submit",
                handleSubmit
            );

        }

    }


    /* =====================================================
       SUBMIT
       ===================================================== */

    async function handleSubmit(event) {

        event.preventDefault();


        if (!Novellow.supabase) {

            showMessage(
                "Novellow could not connect to Supabase."
            );

            return;

        }


        const email =
            byId("authEmail")
                ?.value
                ?.trim() ||
            "";


        const password =
            byId("authPassword")
                ?.value ||
            "";


        const displayName =
            byId("authDisplayName")
                ?.value
                ?.trim() ||
            "";


        if (
            !email ||
            !password
        ) {

            showMessage(
                "Enter your email and password."
            );

            return;

        }


        if (
            mode === "signup" &&
            !displayName
        ) {

            showMessage(
                "Enter a display name."
            );

            return;

        }


        setLoading(true);

        clearMessage();


        try {

            if (
                mode === "signup"
            ) {

                await handleSignUp({
                    email,
                    password,
                    displayName
                });

            } else {

                await handleSignIn({
                    email,
                    password
                });

            }

        } catch (error) {

            console.error(
                "Novellow authentication error:",
                error
            );


            showMessage(
                friendlyAuthError(error)
            );

        } finally {

            setLoading(false);

        }

    }


    /* =====================================================
       SIGN UP
       ===================================================== */

    async function handleSignUp({
        email,
        password,
        displayName
    }) {

        const data =
            await Novellow.supabase.signUp({

                email,

                password,

                displayName

            });


        if (
            data?.session?.user
        ) {

            await enterLibrary(
                data.session.user
            );

            return;

        }


        if (
            data?.user &&
            !data?.session
        ) {

            showMessage(
                "Your account was created. Check your email to confirm it, then sign in.",
                true
            );


            setMode("signin");

            return;

        }


        throw new Error(
            "Supabase did not return a new account."
        );

    }


    /* =====================================================
       SIGN IN
       ===================================================== */

    async function handleSignIn({
        email,
        password
    }) {

        const data =
            await Novellow.supabase.signIn({

                email,

                password

            });


        if (
            !data?.user
        ) {

            throw new Error(
                "No user was returned after sign in."
            );

        }


        await enterLibrary(
            data.user
        );

    }


    /* =====================================================
       RESTORE SESSION
       ===================================================== */

    async function restoreSession() {

        if (
            !Novellow.supabase
                ?.getSession
        ) {

            console.error(
                "Novellow: Supabase auth helper is unavailable."
            );


            showAuth();

            return;

        }


        try {

            const session =
                await Novellow.supabase
                    .getSession();


            if (
                session?.user
            ) {

                await enterLibrary(
                    session.user
                );

                return;

            }


            showAuth();

        } catch (error) {

            console.error(
                "Novellow session restore failed:",
                error
            );


            showAuth();

        }

    }


    /* =====================================================
       AUTH STATE CHANGES
       ===================================================== */

    async function handleAuthChange(
        event,
        session
    ) {

        if (
            event === "SIGNED_OUT"
        ) {

            showAuth();

            return;

        }


        if (
            (
                event === "SIGNED_IN" ||
                event === "TOKEN_REFRESHED" ||
                event === "USER_UPDATED"
            ) &&
            session?.user
        ) {

            await enterLibrary(
                session.user
            );

        }

    }


    /* =====================================================
       ENTER LIBRARY
       ===================================================== */

    async function enterLibrary(user) {

        if (!user) {

            showAuth();

            return;

        }


        Novellow.currentUser =
            user;


        let profile =
            null;


        try {

            profile =
                await Novellow.supabase
                    ?.getProfile?.(
                        user.id
                    );

        } catch (error) {

            console.error(
                "Novellow profile load failed:",
                error
            );

        }


        Novellow.profile =
            profile ||
            null;


        const authScreen =
            byId("authScreen");


        const app =
            byId("app");


        const loading =
            byId("loadingScreen");


        if (authScreen) {

            authScreen.hidden =
                true;

        }


        if (app) {

            app.hidden =
                false;

        }


        if (loading) {

            loading.hidden =
                true;

        }


        document.body.classList.add(
            "user-authenticated"
        );


        document.body.classList.remove(
            "user-anonymous"
        );


        document.dispatchEvent(
            new CustomEvent(
                "novellow:user-ready",
                {

                    detail: {

                        user,

                        profile:
                            Novellow.profile

                    }

                }
            )
        );

    }


    /* =====================================================
       SHOW AUTH
       ===================================================== */

    function showAuth() {

        Novellow.currentUser =
            null;


        Novellow.profile =
            null;


        const authScreen =
            byId("authScreen");


        const app =
            byId("app");


        const loading =
            byId("loadingScreen");


        if (authScreen) {

            authScreen.hidden =
                false;

        }


        if (app) {

            app.hidden =
                true;

        }


        if (loading) {

            loading.hidden =
                true;

        }


        document.body.classList.remove(
            "user-authenticated"
        );


        document.body.classList.add(
            "user-anonymous"
        );

    }


    /* =====================================================
       SIGN OUT
       ===================================================== */

    async function signOut() {

        try {

            await Novellow.supabase
                ?.signOut?.();

        } catch (error) {

            console.error(
                "Novellow sign out failed:",
                error
            );


            showMessage(
                "Unable to sign out right now."
            );

        }

    }


    /* =====================================================
       LOADING BUTTON
       ===================================================== */

    function setLoading(loading) {

        const button =
            byId("authSubmit");


        if (!button) {
            return;
        }


        button.disabled =
            loading;


        if (loading) {

            button.dataset.originalText =
                button.textContent;


            button.textContent =
                mode === "signup"
                    ? "Creating Library..."
                    : "Opening Library...";

            return;

        }


        button.textContent =
            mode === "signup"
                ? "Create My Library"
                : "Enter Library";

    }


    /* =====================================================
       FRIENDLY ERRORS
       ===================================================== */

    function friendlyAuthError(error) {

        const rawMessage =
            String(
                error?.message ||
                ""
            );


        const message =
            rawMessage.toLowerCase();


        if (
            message.includes(
                "invalid login"
            ) ||
            message.includes(
                "invalid credentials"
            )
        ) {

            return "That email and password combination was not recognized.";

        }


        if (
            message.includes(
                "already registered"
            ) ||
            message.includes(
                "already been registered"
            ) ||
            message.includes(
                "user already registered"
            )
        ) {

            return "An account already exists for that email. Try signing in instead.";

        }


        if (
            message.includes(
                "email not confirmed"
            )
        ) {

            return "Confirm your email first, then sign in.";

        }


        if (
            message.includes(
                "password"
            ) &&
            (
                message.includes(
                    "least"
                ) ||
                message.includes(
                    "characters"
                )
            )
        ) {

            return "Your password does not meet the minimum length requirement.";

        }


        if (
            message.includes(
                "email"
            ) &&
            (
                message.includes(
                    "invalid"
                ) ||
                message.includes(
                    "valid"
                )
            )
        ) {

            return "Enter a valid email address.";

        }


        return (
            rawMessage ||
            "Something went wrong. Please try again."
        );

    }


    /* =====================================================
       INIT
       ===================================================== */

    async function init() {

        if (initialized) {
            return;
        }


        initialized =
            true;


        bindControls();


        setMode("signin");


        if (
            Novellow.supabase
                ?.onAuthStateChange
        ) {

            Novellow.supabase
                .onAuthStateChange(
                    handleAuthChange
                );

        }


        await restoreSession();

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    Novellow.auth = {

        init,

        setMode,

        signOut,

        showAuth,

        enterLibrary

    };


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
