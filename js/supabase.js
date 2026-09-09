/* =========================================================
   NOVELLOW
   SUPABASE.JS

   Supabase client
   Authentication
   Profile access
   ========================================================= */

(() => {

    "use strict";


    /* =====================================================
       GLOBAL NAMESPACE
       ===================================================== */

    window.NOVELLOW =
        window.NOVELLOW ||
        {};


    const Novellow =
        window.NOVELLOW;


    /* =====================================================
       PROJECT CONFIG
       ===================================================== */

    const SUPABASE_URL =
        "https://eewnaqglzbfrlipgmrof.supabase.co";


    const SUPABASE_ANON_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVld25hcWdsemJmcmxpcGdtcm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5ODMzODQsImV4cCI6MjEwNDU1OTM4NH0.2UBWh3HFdvykUvB694FcjyvH2TrViqayu5gPIv9dmN0";


    /* =====================================================
       CHECK LIBRARY
       ===================================================== */

    if (
        !window.supabase ||
        typeof window.supabase.createClient !==
            "function"
    ) {

        console.error(
            "Novellow: Supabase browser library did not load."
        );


        Novellow.supabase =
            null;


        return;

    }


    /* =====================================================
       CREATE CLIENT
       ===================================================== */

    const client =
        window.supabase.createClient(

            SUPABASE_URL,

            SUPABASE_ANON_KEY,

            {

                auth: {

                    persistSession:
                        true,

                    autoRefreshToken:
                        true,

                    detectSessionInUrl:
                        true

                }

            }

        );


    /* =====================================================
       GET SESSION
       ===================================================== */

    async function getSession() {

        const {
            data,
            error
        } =
            await client.auth
                .getSession();


        if (error) {

            console.error(
                "Novellow: session lookup failed:",
                error
            );


            throw error;

        }


        return (
            data?.session ||
            null
        );

    }


    /* =====================================================
       GET USER
       ===================================================== */

    async function getUser() {

        const {
            data,
            error
        } =
            await client.auth
                .getUser();


        if (error) {

            console.error(
                "Novellow: user lookup failed:",
                error
            );


            return null;

        }


        return (
            data?.user ||
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

        const cleanEmail =
            String(
                email ||
                ""
            )
                .trim()
                .toLowerCase();


        const cleanDisplayName =
            String(
                displayName ||
                ""
            )
                .trim();


        const {
            data,
            error
        } =
            await client.auth
                .signUp({

                    email:
                        cleanEmail,

                    password,

                    options: {

                        data: {

                            display_name:
                                cleanDisplayName

                        }

                    }

                });


        if (error) {

            console.error(
                "Novellow: signup failed:",
                error
            );


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

        const cleanEmail =
            String(
                email ||
                ""
            )
                .trim()
                .toLowerCase();


        const {
            data,
            error
        } =
            await client.auth
                .signInWithPassword({

                    email:
                        cleanEmail,

                    password

                });


        if (error) {

            console.error(
                "Novellow: sign in failed:",
                error
            );


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
            await client.auth
                .signOut();


        if (error) {

            console.error(
                "Novellow: sign out failed:",
                error
            );


            throw error;

        }


        return true;

    }


    /* =====================================================
       AUTH STATE LISTENER
       ===================================================== */

    function onAuthStateChange(
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return null;

        }


        return client.auth
            .onAuthStateChange(
                callback
            );

    }


    /* =====================================================
       GET PROFILE
       ===================================================== */

    async function getProfile(
        userId
    ) {

        if (!userId) {

            return null;

        }


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
                "Novellow: profile lookup failed:",
                error
            );


            throw error;

        }


        return (
            data ||
            null
        );

    }


    /* =====================================================
       UPDATE PROFILE
       ===================================================== */

    async function updateProfile(
        userId,
        updates = {}
    ) {

        if (!userId) {

            throw new Error(
                "A user ID is required to update a profile."
            );

        }


        const allowedUpdates =
            {};


        if (
            Object.prototype.hasOwnProperty.call(
                updates,
                "display_name"
            )
        ) {

            allowedUpdates.display_name =
                String(
                    updates.display_name ||
                    ""
                )
                    .trim();

        }


        if (
            Object.prototype.hasOwnProperty.call(
                updates,
                "username"
            )
        ) {

            const username =
                String(
                    updates.username ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            allowedUpdates.username =
                username ||
                null;

        }


        if (
            Object.prototype.hasOwnProperty.call(
                updates,
                "avatar_url"
            )
        ) {

            allowedUpdates.avatar_url =
                updates.avatar_url ||
                null;

        }


        if (
            Object.prototype.hasOwnProperty.call(
                updates,
                "bio"
            )
        ) {

            allowedUpdates.bio =
                String(
                    updates.bio ||
                    ""
                )
                    .trim();

        }


        if (
            Object.prototype.hasOwnProperty.call(
                updates,
                "library_name"
            )
        ) {

            allowedUpdates.library_name =
                String(
                    updates.library_name ||
                    ""
                )
                    .trim() ||
                "My Library";

        }


        const {
            data,
            error
        } =
            await client
                .from(
                    "profiles"
                )
                .update(
                    allowedUpdates
                )
                .eq(
                    "id",
                    userId
                )
                .select()
                .single();


        if (error) {

            console.error(
                "Novellow: profile update failed:",
                error
            );


            throw error;

        }


        return data;

    }


    /* =====================================================
       ENSURE PROFILE EXISTS
       ===================================================== */

    async function ensureProfile(
        user
    ) {

        if (
            !user?.id
        ) {

            return null;

        }


        let profile =
            await getProfile(
                user.id
            );


        if (profile) {

            return profile;

        }


        const displayName =
            String(
                user.user_metadata
                    ?.display_name ||
                ""
            )
                .trim();


        const {
            data,
            error
        } =
            await client
                .from(
                    "profiles"
                )
                .insert({

                    id:
                        user.id,

                    display_name:
                        displayName,

                    library_name:
                        "My Library"

                })
                .select()
                .single();


        if (error) {

            /*
             * The database signup trigger should normally create
             * the profile first. If another request created it
             * between our SELECT and INSERT, simply fetch it again.
             */

            if (
                error.code ===
                "23505"
            ) {

                return await getProfile(
                    user.id
                );

            }


            console.error(
                "Novellow: profile creation failed:",
                error
            );


            throw error;

        }


        return data;

    }


    /* =====================================================
       CURRENT AUTH SNAPSHOT
       ===================================================== */

    async function getAuthSnapshot() {

        const session =
            await getSession();


        if (
            !session?.user
        ) {

            return {

                session:
                    null,

                user:
                    null,

                profile:
                    null

            };

        }


        const profile =
            await ensureProfile(
                session.user
            );


        return {

            session,

            user:
                session.user,

            profile

        };

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    Novellow.supabase = {

        client,

        getSession,

        getUser,

        getAuthSnapshot,

        signUp,

        signIn,

        signOut,

        onAuthStateChange,

        getProfile,

        ensureProfile,

        updateProfile

    };


    console.log(
        "Novellow: Supabase connected."
    );


})();
