/* =========================================================
   NOVELLOW
   SUPABASE.JS

   Supabase client
   Authentication helpers
   Profile helpers
   ========================================================= */

(() => {

    "use strict";


    window.NOVELLOW =
        window.NOVELLOW ||
        {};


    const Novellow =
        window.NOVELLOW;


    /* =====================================================
       CONFIG
       ===================================================== */

    const SUPABASE_URL =
        "https://eewnaqglzbfrlipgmrof.supabase.co";


    const SUPABASE_PUBLISHABLE_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVld25hcWdsemJmcmxpcGdtcm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODMzODQsImV4cCI6MjEwNDU1OTM4NH0.2UBWh3HFdvykUvB694FcjyvH2TrViqayu5gPIv9dmN0";


    /* =====================================================
       CLIENT
       ===================================================== */

    if (!window.supabase) {

        console.error(
            "Supabase library is not loaded."
        );

        return;
    }


    const client =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );


    /* =====================================================
       SESSION
       ===================================================== */

    async function getSession() {

        const {
            data,
            error
        } =
            await client.auth.getSession();


        if (error) {

            console.error(
                "Supabase session error:",
                error
            );

            return null;
        }


        return (
            data.session ||
            null
        );

    }


    /* =====================================================
       USER
       ===================================================== */

    async function getUser() {

        const {
            data,
            error
        } =
            await client.auth.getUser();


        if (error) {

            console.error(
                "Supabase user error:",
                error
            );

            return null;
        }


        return (
            data.user ||
            null
        );

    }


    /* =====================================================
       SIGN UP
       ===================================================== */

    async function signUp({
        email,
        password,
        displayName = ""
    }) {

        const {
            data,
            error
        } =
            await client.auth.signUp({

                email,

                password,

                options: {

                    data: {

                        display_name:
                            displayName

                    }

                }

            });


        if (error) {

            throw error;

        }


        return data;

    }


    /* =====================================================
       SIGN IN
       ===================================================== */

    async function signIn({
        email,
        password
    }) {

        const {
            data,
            error
        } =
            await client.auth
                .signInWithPassword({

                    email,

                    password

                });


        if (error) {

            throw error;

        }


        return data;

    }


    /* =====================================================
       SIGN OUT
       ===================================================== */

    async function signOut() {

        const {
            error
        } =
            await client.auth.signOut();


        if (error) {

            throw error;

        }

    }


    /* =====================================================
       AUTH STATE
       ===================================================== */

    function onAuthStateChange(
        callback
    ) {

        return client.auth
            .onAuthStateChange(
                callback
            );

    }


    /* =====================================================
       PROFILE
       ===================================================== */

    async function getProfile(
        userId
    ) {

        const {
            data,
            error
        } =
            await client
                .from(
                    "profiles"
                )
                .select(
                    "*"
                )
                .eq(
                    "id",
                    userId
                )
                .maybeSingle();


        if (error) {

            console.error(
                "Profile load error:",
                error
            );

            return null;
        }


        return data;

    }


    async function updateProfile(
        userId,
        updates
    ) {

        const {
            data,
            error
        } =
            await client
                .from(
                    "profiles"
                )
                .update(
                    updates
                )
                .eq(
                    "id",
                    userId
                )
                .select()
                .single();


        if (error) {

            throw error;

        }


        return data;

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    Novellow.supabase = {

        client,

        getSession,

        getUser,

        signUp,

        signIn,

        signOut,

        onAuthStateChange,

        getProfile,

        updateProfile

    };


    console.log(
        "Novellow: Supabase connected."
    );

})();
