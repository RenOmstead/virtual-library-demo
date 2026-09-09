/* =========================================================
   NOVELLOW
   SUPABASE.JS
   VERSION 13

   Authentication
   Profiles

   Library database:
   - Shelves
   - Books
   - Journal entries
   - Quotes
   - Vocabulary
   - User settings
   ========================================================= */

(() => {

    "use strict";


    /* =====================================================
       NAMESPACE
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
       CLIENT
       ===================================================== */

    if (
        !window.supabase ||
        typeof window.supabase.createClient !==
            "function"
    ) {

        console.error(
            "Novellow: Supabase library is not loaded."
        );

        return;

    }


    const client =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY,
            {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            }
        );


    /* =====================================================
       GENERIC HELPERS
       ===================================================== */

    function throwIfError(
        error,
        context = "Supabase request"
    ) {

        if (!error) {

            return;

        }


        console.error(
            `Novellow: ${context} failed.`,
            error
        );


        throw error;

    }


    function cleanObject(object) {

        return Object.fromEntries(
            Object.entries(
                object
            ).filter(
                ([, value]) =>
                    value !== undefined
            )
        );

    }


    async function requireUser() {

        const {
            data,
            error
        } =
            await client.auth.getUser();


        throwIfError(
            error,
            "Get current user"
        );


        const user =
            data?.user;


        if (!user) {

            throw new Error(
                "You must be signed in to use your Novellow library."
            );

        }


        return user;

    }


    /* =====================================================
       AUTH
       ===================================================== */

    async function getSession() {

        const {
            data,
            error
        } =
            await client.auth.getSession();


        throwIfError(
            error,
            "Get session"
        );


        return (
            data?.session ||
            null
        );

    }


    async function getUser() {

        const {
            data,
            error
        } =
            await client.auth.getUser();


        throwIfError(
            error,
            "Get user"
        );


        return (
            data?.user ||
            null
        );

    }


    async function getAuthSnapshot() {

        const session =
            await getSession();


        return {

            session,

            user:
                session?.user ||
                null

        };

    }


    async function signUp({
        email,
        password,
        displayName
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
                            displayName ||
                            ""
                    }
                }
            });


        throwIfError(
            error,
            "Sign up"
        );


        return data;

    }


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


        throwIfError(
            error,
            "Sign in"
        );


        return data;

    }


    async function signOut() {

        const {
            error
        } =
            await client.auth.signOut();


        throwIfError(
            error,
            "Sign out"
        );

    }


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


        throwIfError(
            error,
            "Load profile"
        );


        return (
            data ||
            null
        );

    }


    async function ensureProfile(
        user
    ) {

        if (!user) {

            return null;

        }


        const existing =
            await getProfile(
                user.id
            );


        if (existing) {

            return existing;

        }


        const displayName =
            user.user_metadata
                ?.display_name ||
            user.email
                ?.split("@")[0] ||
            "Reader";


        const {
            data,
            error
        } =
            await client
                .from(
                    "profiles"
                )
                .upsert(
                    {
                        id:
                            user.id,

                        display_name:
                            displayName,

                        library_name:
                            "My Library"
                    },
                    {
                        onConflict:
                            "id"
                    }
                )
                .select(
                    "*"
                )
                .single();


        throwIfError(
            error,
            "Create profile"
        );


        return data;

    }


    async function updateProfile(
        userId,
        updates
    ) {

        const payload =
            cleanObject({
                display_name:
                    updates.display_name,

                username:
                    updates.username,

                avatar_url:
                    updates.avatar_url,

                bio:
                    updates.bio,

                library_name:
                    updates.library_name
            });


        const {
            data,
            error
        } =
            await client
                .from(
                    "profiles"
                )
                .update(
                    payload
                )
                .eq(
                    "id",
                    userId
                )
                .select(
                    "*"
                )
                .single();


        throwIfError(
            error,
            "Update profile"
        );


        return data;

    }


    /* =====================================================
       SHELVES
       ===================================================== */

    async function getShelves() {

        const user =
            await requireUser();


        const {
            data,
            error
        } =
            await client
                .from(
                    "shelves"
                )
                .select(
                    "*"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .order(
                    "position",
                    {
                        ascending:
                            true
                    }
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            true
                    }
                );


        throwIfError(
            error,
            "Load shelves"
        );


        return (
            data ||
            []
        );

    }


    async function saveShelf(
        shelf
    ) {

        const user =
            await requireUser();


        const payload =
            cleanObject({
                id:
                    shelf.id,

                user_id:
                    user.id,

                name:
                    shelf.name ||
                    "Shelf",

                description:
                    shelf.description ||
                    "",

                material:
                    shelf.material ||
                    "wood",

                mood:
                    shelf.mood ||
                    "",

                layout:
                    shelf.layout ||
                    "",

                sort_mode:
                    shelf.sortMode ||
                    shelf.sort_mode ||
                    "manual",

                position:
                    Number(
                        shelf.position ||
                        0
                    ),

                decorations:
                    shelf.decorations ||
                    {}
            });


        const {
            data,
            error
        } =
            await client
                .from(
                    "shelves"
                )
                .upsert(
                    payload,
                    {
                        onConflict:
                            "id"
                    }
                )
                .select(
                    "*"
                )
                .single();


        throwIfError(
            error,
            "Save shelf"
        );


        return data;

    }


    async function deleteShelf(
        shelfId
    ) {

        const user =
            await requireUser();


        const {
            error
        } =
            await client
                .from(
                    "shelves"
                )
                .delete()
                .eq(
                    "id",
                    shelfId
                )
                .eq(
                    "user_id",
                    user.id
                );


        throwIfError(
            error,
            "Delete shelf"
        );

    }


    /* =====================================================
       BOOKS
       ===================================================== */

    async function getBooks() {

        const user =
            await requireUser();


        const {
            data,
            error
        } =
            await client
                .from(
                    "books"
                )
                .select(
                    "*"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .order(
                    "position",
                    {
                        ascending:
                            true
                    }
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            true
                    }
                );


        throwIfError(
            error,
            "Load books"
        );


        return (
            data ||
            []
        );

    }


    async function getBook(
        bookId
    ) {

        const user =
            await requireUser();


        const {
            data,
            error
        } =
            await client
                .from(
                    "books"
                )
                .select(
                    "*"
                )
                .eq(
                    "id",
                    bookId
                )
                .eq(
                    "user_id",
                    user.id
                )
                .maybeSingle();


        throwIfError(
            error,
            "Load book"
        );


        return (
            data ||
            null
        );

    }


    async function saveBook(
        book
    ) {

        const user =
            await requireUser();


        const shelfId =
            book.shelf_id ||
            book.shelfId ||
            null;


        const totalPages =
            Number(
                book.total_pages ??
                book.pages ??
                0
            );


        const currentPage =
            Number(
                book.current_page ??
                book.currentPage ??
                0
            );


        const timesRead =
            Number(
                book.times_read ??
                book.timesRead ??
                0
            );


        const publicationYearRaw =
            book.publication_year ??
            book.year ??
            null;


        const publicationYear =
            publicationYearRaw ===
                "" ||
            publicationYearRaw ===
                null
                ? null
                : Number(
                    publicationYearRaw
                );


        const ratingRaw =
            book.rating;


        const rating =
            ratingRaw ===
                "" ||
            ratingRaw ===
                null ||
            Number(
                ratingRaw
            ) === 0
                ? null
                : Number(
                    ratingRaw
                );


        const payload =
            cleanObject({
                id:
                    book.id,

                user_id:
                    user.id,

                shelf_id:
                    shelfId,

                title:
                    book.title ||
                    "Untitled Book",

                author:
                    book.author ||
                    "",

                genre:
                    book.genre ||
                    "",

                publication_year:
                    Number.isFinite(
                        publicationYear
                    )
                        ? publicationYear
                        : null,

                isbn:
                    book.isbn ||
                    "",

                series:
                    book.series ||
                    "",

                total_pages:
                    Number.isFinite(
                        totalPages
                    )
                        ? totalPages
                        : 0,

                current_page:
                    Number.isFinite(
                        currentPage
                    )
                        ? currentPage
                        : 0,

                status:
                    book.status ||
                    "want",

                rating,

                started_at:
                    book.started_at ||
                    book.started ||
                    null,

                finished_at:
                    book.finished_at ||
                    book.finished ||
                    null,

                times_read:
                    Number.isFinite(
                        timesRead
                    )
                        ? timesRead
                        : 0,

                cover_url:
                    book.cover_url ||
                    "",

                design:
                    book.design ||
                    {},

                position:
                    Number(
                        book.position ||
                        0
                    )
            });


        const {
            data,
            error
        } =
            await client
                .from(
                    "books"
                )
                .upsert(
                    payload,
                    {
                        onConflict:
                            "id"
                    }
                )
                .select(
                    "*"
                )
                .single();


        throwIfError(
            error,
            "Save book"
        );


        return data;

    }


    async function deleteBook(
        bookId
    ) {

        const user =
            await requireUser();


        const {
            error
        } =
            await client
                .from(
                    "books"
                )
                .delete()
                .eq(
                    "id",
                    bookId
                )
                .eq(
                    "user_id",
                    user.id
                );


        throwIfError(
            error,
            "Delete book"
        );

    }


    /* =====================================================
       JOURNAL ENTRIES
       ===================================================== */

    async function getJournalEntries(
        bookId = null
    ) {

        const user =
            await requireUser();


        let query =
            client
                .from(
                    "journal_entries"
                )
                .select(
                    "*"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            true
                    }
                );


        if (bookId) {

            query =
                query.eq(
                    "book_id",
                    bookId
                );

        }


        const {
            data,
            error
        } =
            await query;


        throwIfError(
            error,
            "Load journal entries"
        );


        return (
            data ||
            []
        );

    }


    async function saveJournalEntry(
        entry
    ) {

        const user =
            await requireUser();


        const payload =
            cleanObject({
                id:
                    entry.id,

                user_id:
                    user.id,

                book_id:
                    entry.book_id ||
                    entry.bookId,

                section:
                    entry.section ||
                    "notes",

                title:
                    entry.title ||
                    "",

                body:
                    entry.body ||
                    "",

                page_number:
                    entry.page_number ??
                    entry.pageNumber ??
                    null,

                chapter:
                    entry.chapter ||
                    "",

                metadata:
                    entry.metadata ||
                    {}
            });


        const {
            data,
            error
        } =
            await client
                .from(
                    "journal_entries"
                )
                .upsert(
                    payload,
                    {
                        onConflict:
                            "id"
                    }
                )
                .select(
                    "*"
                )
                .single();


        throwIfError(
            error,
            "Save journal entry"
        );


        return data;

    }


    async function deleteJournalEntry(
        entryId
    ) {

        const user =
            await requireUser();


        const {
            error
        } =
            await client
                .from(
                    "journal_entries"
                )
                .delete()
                .eq(
                    "id",
                    entryId
                )
                .eq(
                    "user_id",
                    user.id
                );


        throwIfError(
            error,
            "Delete journal entry"
        );

    }


    /* =====================================================
       QUOTES
       ===================================================== */

    async function getQuotes(
        bookId = null
    ) {

        const user =
            await requireUser();


        let query =
            client
                .from(
                    "quotes"
                )
                .select(
                    "*"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            true
                    }
                );


        if (bookId) {

            query =
                query.eq(
                    "book_id",
                    bookId
                );

        }


        const {
            data,
            error
        } =
            await query;


        throwIfError(
            error,
            "Load quotes"
        );


        return (
            data ||
            []
        );

    }


    async function saveQuote(
        quote
    ) {

        const user =
            await requireUser();


        const payload =
            cleanObject({
                id:
                    quote.id,

                user_id:
                    user.id,

                book_id:
                    quote.book_id ||
                    quote.bookId,

                quote_text:
                    quote.quote_text ||
                    quote.text ||
                    quote.quote ||
                    "",

                page_number:
                    quote.page_number ??
                    quote.pageNumber ??
                    null,

                chapter:
                    quote.chapter ||
                    "",

                thoughts:
                    quote.thoughts ||
                    ""
            });


        const {
            data,
            error
        } =
            await client
                .from(
                    "quotes"
                )
                .upsert(
                    payload,
                    {
                        onConflict:
                            "id"
                    }
                )
                .select(
                    "*"
                )
                .single();


        throwIfError(
            error,
            "Save quote"
        );


        return data;

    }


    async function deleteQuote(
        quoteId
    ) {

        const user =
            await requireUser();


        const {
            error
        } =
            await client
                .from(
                    "quotes"
                )
                .delete()
                .eq(
                    "id",
                    quoteId
                )
                .eq(
                    "user_id",
                    user.id
                );


        throwIfError(
            error,
            "Delete quote"
        );

    }


    /* =====================================================
       VOCABULARY
       ===================================================== */

    async function getVocabulary(
        bookId = null
    ) {

        const user =
            await requireUser();


        let query =
            client
                .from(
                    "vocabulary"
                )
                .select(
                    "*"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            true
                    }
                );


        if (bookId) {

            query =
                query.eq(
                    "book_id",
                    bookId
                );

        }


        const {
            data,
            error
        } =
            await query;


        throwIfError(
            error,
            "Load vocabulary"
        );


        return (
            data ||
            []
        );

    }


    async function saveVocabularyEntry(
        entry
    ) {

        const user =
            await requireUser();


        const payload =
            cleanObject({
                id:
                    entry.id,

                user_id:
                    user.id,

                book_id:
                    entry.book_id ||
                    entry.bookId,

                word:
                    entry.word ||
                    "",

                definition:
                    entry.definition ||
                    "",

                part_of_speech:
                    entry.part_of_speech ||
                    entry.partOfSpeech ||
                    "",

                context:
                    entry.context ||
                    "",

                page_number:
                    entry.page_number ??
                    entry.pageNumber ??
                    null
            });


        const {
            data,
            error
        } =
            await client
                .from(
                    "vocabulary"
                )
                .upsert(
                    payload,
                    {
                        onConflict:
                            "id"
                    }
                )
                .select(
                    "*"
                )
                .single();


        throwIfError(
            error,
            "Save vocabulary entry"
        );


        return data;

    }


    async function deleteVocabularyEntry(
        entryId
    ) {

        const user =
            await requireUser();


        const {
            error
        } =
            await client
                .from(
                    "vocabulary"
                )
                .delete()
                .eq(
                    "id",
                    entryId
                )
                .eq(
                    "user_id",
                    user.id
                );


        throwIfError(
            error,
            "Delete vocabulary entry"
        );

    }


    /* =====================================================
       USER SETTINGS
       ===================================================== */

    async function getUserSettings() {

        const user =
            await requireUser();


        const {
            data,
            error
        } =
            await client
                .from(
                    "user_settings"
                )
                .select(
                    "*"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .maybeSingle();


        throwIfError(
            error,
            "Load user settings"
        );


        return (
            data ||
            null
        );

    }


    async function saveUserSettings(
        settings
    ) {

        const user =
            await requireUser();


        const payload =
            cleanObject({
                user_id:
                    user.id,

                theme:
                    settings.theme ||
                    "haunted",

                decoration_density:
                    settings.decorationDensity ||
                    settings.decoration_density ||
                    "medium",

                annual_reading_goal:
                    Number(
                        settings.annualReadingGoal ??
                        settings.annual_reading_goal ??
                        0
                    ),

                ambience_sound:
                    Boolean(
                        settings.ambienceSound ??
                        settings.ambience_sound ??
                        false
                    ),

                ambience_animation:
                    Boolean(
                        settings.ambienceAnimation ??
                        settings.ambience_animation ??
                        true
                    ),

                default_shelf_sort:
                    settings.defaultShelfSort ||
                    settings.default_shelf_sort ||
                    "manual",

                settings:
                    settings.settings ||
                    {}
            });


        const {
            data,
            error
        } =
            await client
                .from(
                    "user_settings"
                )
                .upsert(
                    payload,
                    {
                        onConflict:
                            "user_id"
                    }
                )
                .select(
                    "*"
                )
                .single();


        throwIfError(
            error,
            "Save user settings"
        );


        return data;

    }


    /* =====================================================
       COMPLETE LIBRARY LOAD

       Eventually app.js will call this once after login.
       ===================================================== */

    async function loadLibrary() {

        const [
            shelves,
            books,
            journalEntries,
            quotes,
            vocabulary,
            settings
        ] =
            await Promise.all([
                getShelves(),
                getBooks(),
                getJournalEntries(),
                getQuotes(),
                getVocabulary(),
                getUserSettings()
            ]);


        return {
            shelves,
            books,
            journalEntries,
            quotes,
            vocabulary,
            settings
        };

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    Novellow.supabase = {

        client,

        /* Auth */
        getSession,
        getUser,
        getAuthSnapshot,
        signUp,
        signIn,
        signOut,
        onAuthStateChange,

        /* Profile */
        getProfile,
        ensureProfile,
        updateProfile,

        /* Library */
        loadLibrary,

        /* Shelves */
        getShelves,
        saveShelf,
        deleteShelf,

        /* Books */
        getBooks,
        getBook,
        saveBook,
        deleteBook,

        /* Journal */
        getJournalEntries,
        saveJournalEntry,
        deleteJournalEntry,

        /* Quotes */
        getQuotes,
        saveQuote,
        deleteQuote,

        /* Vocabulary */
        getVocabulary,
        saveVocabularyEntry,
        deleteVocabularyEntry,

        /* Settings */
        getUserSettings,
        saveUserSettings

    };


})();
