/* =========================================================
   NOVELLOW
   APP.JS
   VERSION 13

   Application startup
   Global state
   Navigation
   Theme/settings controller
   Drawer + overlay management
   Local cache
   Supabase library sync
   Legacy library migration
   Import/export
   ========================================================= */


(() => {

    "use strict";


    /* =====================================================
       CONFIG / HELPERS
       ===================================================== */

    const CONFIG =
        window.NOVELLOW_CONFIG ||
        {};


    window.NOVELLOW =
        window.NOVELLOW ||
        {};


    const Novellow =
        window.NOVELLOW;


    const H =
        Novellow.helpers ||
        {};


    /* =====================================================
       GLOBAL STATE
       ===================================================== */

    Novellow.state =
        Novellow.state ||
        H.createEmptyState?.() ||
        {

            shelves: [],
            books: [],
            quotes: [],
            vocabulary: [],

            settings: {
                theme: "haunted",
                candleGlow: true,
                dust: true,
                rain: true,
                oddities: true,
                reducedMotion: false,
                decorationDensity: "cozy",
                defaultShelfSort: "manual",
                annualReadingGoal: 20
            },

            selectedBookId: null,
            selectedJournalSection: null,
            currentSection: "library",
            pendingCoverData: ""

        };


    const state =
        Novellow.state;


    /* =====================================================
       STORAGE KEYS
       ===================================================== */

    const STORAGE =
        CONFIG.storageKeys ||
        {};


    /* =====================================================
       CLOUD SYNC STATE
       ===================================================== */

    let cloudReady =
        false;


    let cloudLoading =
        false;


    let suppressCloudSync =
        false;


    let activeCloudUserId =
        null;


    let cloudSyncTimer =
        null;


    const pendingCloudSync =
        new Set();


    const LOCAL_OWNER_KEY =
        "novellow_local_owner_id";


    /* =====================================================
       STARTUP
       ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );


    function initialize() {

        hideInitialTransientUI();

        migrateLegacyData();

        loadState();

        applySettings();

        bindNavigation();

        bindGlobalActions();

        bindThemeControls();

        bindSettingsControls();

        bindImportExport();

        bindCloudLibrary();

        initializeFeatureModules();

        renderEverything();

        restoreCurrentSection();

        finishLoading();

    }


    /* =====================================================
       INITIAL UI SAFETY
       ===================================================== */

    function hideInitialTransientUI() {

        [
            "overlay",
            "themeDrawer",
            "settingsDrawer",
            "profileDrawer",
            "shelfDrawer",
            "bookDrawer",
            "bookReveal",
            "progressModal",
            "journalEntryModal",
            "quoteModal",
            "wordModal"
        ].forEach(
            id =>
                H.hide?.(
                    id
                )
        );


        document.body.classList.remove(
            "modal-open"
        );

    }


    /* =====================================================
       LEGACY STORAGE MIGRATION
       ===================================================== */

    function migrateLegacyData() {

        const migrated =
            H.migrateLegacyStorage?.();


        if (migrated) {

            console.info(
                "Novellow migrated existing Shelfmark data."
            );

        }

    }


    /* =====================================================
       LOAD LOCAL STATE

       Local storage is now a cache.

       Once authentication is ready, the user's Supabase
       library replaces this state.
       ===================================================== */

    function loadState() {

        const rawShelves =
            H.readStorage?.(
                STORAGE.shelves,
                []
            ) ||
            [];


        const rawBooks =
            H.readStorage?.(
                STORAGE.books,
                []
            ) ||
            [];


        const rawQuotes =
            H.readStorage?.(
                STORAGE.quotes,
                []
            ) ||
            [];


        const rawVocabulary =
            H.readStorage?.(
                STORAGE.vocabulary,
                []
            ) ||
            [];


        const rawSettings =
            H.readStorage?.(
                STORAGE.settings,
                {}
            ) ||
            {};


        state.shelves =
            H.normalizeCollection?.(
                rawShelves,
                H.normalizeShelf
            ) ||
            [];


        state.books =
            H.normalizeCollection?.(
                rawBooks,
                H.normalizeBook
            ) ||
            [];


        state.quotes =
            H.normalizeCollection?.(
                rawQuotes,
                H.normalizeQuote
            ) ||
            [];


        state.vocabulary =
            H.normalizeCollection?.(
                rawVocabulary,
                H.normalizeWord
            ) ||
            [];


        state.settings =
            H.normalizeSettings?.(
                rawSettings
            ) ||
            {
                ...CONFIG.defaultSettings
            };


        writeLocalCache();

    }


    /* =====================================================
       CLOUD AUTH CONNECTION
       ===================================================== */

    function bindCloudLibrary() {

        document.addEventListener(
            "novellow:user-ready",
            event => {

                const user =
                    event.detail?.user ||
                    Novellow.currentUser;


                if (!user?.id) {

                    return;

                }


                loadCloudLibraryForUser(
                    user
                );

            }
        );


        /*
           Handles the rare case where auth completed before
           this module finished initializing.
        */

        if (
            Novellow.currentUser?.id
        ) {

            loadCloudLibraryForUser(
                Novellow.currentUser
            );

        }

    }


    /* =====================================================
       LOAD CLOUD LIBRARY FOR USER
       ===================================================== */

    async function loadCloudLibraryForUser(
        user
    ) {

        if (
            !user?.id ||
            cloudLoading
        ) {

            return;

        }


        if (
            cloudReady &&
            activeCloudUserId ===
                user.id
        ) {

            return;

        }


        const supabase =
            Novellow.supabase;


        if (
            typeof supabase?.loadLibrary !==
            "function"
        ) {

            console.warn(
                "Novellow cloud library is not available."
            );

            return;

        }


        cloudLoading =
            true;


        cloudReady =
            false;


        try {

            prepareLocalCacheForUser(
                user.id
            );


            let remote =
                await supabase
                    .loadLibrary();


            const localHasContent =
                hasLocalLibraryContent();


            const remoteHasContent =
                hasRemoteLibraryContent(
                    remote
                );


            const migrationKey =
                getMigrationKey(
                    user.id
                );


            const alreadyMigrated =
                localStorage.getItem(
                    migrationKey
                ) ===
                "1";


            /*
               FIRST CLOUD MIGRATION

               If:
               - this account has no cloud library yet
               - this browser has an existing Novellow library
               - we have never migrated it for this user

               then claim the local library for this account.
            */

            if (
                !remoteHasContent &&
                localHasContent &&
                !alreadyMigrated
            ) {

                H.showToast?.(
                    "Moving this library into your Novellow account...",
                    "success"
                );


                await migrateLocalLibraryToCloud(
                    user.id
                );


                localStorage.setItem(
                    migrationKey,
                    "1"
                );


                remote =
                    await supabase
                        .loadLibrary();

            }


            /*
               Once migration is complete, Supabase becomes
               the source of truth.
            */

            suppressCloudSync =
                true;


            hydrateStateFromCloud(
                remote
            );


            writeLocalCache();


            suppressCloudSync =
                false;


            activeCloudUserId =
                user.id;


            cloudReady =
                true;


            localStorage.setItem(
                LOCAL_OWNER_KEY,
                user.id
            );


            applySettings();

            renderEverything();

            restoreCurrentSection();


            document.dispatchEvent(
                new CustomEvent(
                    "novellow:library-ready",
                    {
                        detail: {
                            user,
                            state
                        }
                    }
                )
            );


            H.showToast?.(
                "Your library is synced to your profile.",
                "success"
            );

        } catch (error) {

            suppressCloudSync =
                false;


            console.error(
                "Novellow could not load the cloud library.",
                error
            );


            H.showToast?.(
                "Cloud sync failed. Your browser copy is still available.",
                "error"
            );

        } finally {

            cloudLoading =
                false;

        }

    }


    /* =====================================================
       LOCAL CACHE OWNERSHIP

       Prevents User B from inheriting User A's browser cache.
       ===================================================== */

    function prepareLocalCacheForUser(
        userId
    ) {

        const ownerId =
            localStorage.getItem(
                LOCAL_OWNER_KEY
            );


        /*
           No owner means this is legacy pre-account data.
           The first account can claim it.

           A DIFFERENT owner means this cache belongs to a
           different account and must never be migrated.
        */

        if (
            ownerId &&
            ownerId !== userId
        ) {

            state.shelves =
                [];


            state.books =
                [];


            state.quotes =
                [];


            state.vocabulary =
                [];


            state.settings =
                H.normalizeSettings?.(
                    {}
                ) ||
                {
                    ...CONFIG.defaultSettings
                };


            state.selectedBookId =
                null;


            state.selectedJournalSection =
                null;


            state.pendingCoverData =
                "";


            suppressCloudSync =
                true;


            writeLocalCache();


            suppressCloudSync =
                false;

        }

    }


    /* =====================================================
       MIGRATION MARKER
       ===================================================== */

    function getMigrationKey(
        userId
    ) {

        return (
            `novellow_supabase_migrated_${userId}`
        );

    }


    /* =====================================================
       LIBRARY EXISTENCE
       ===================================================== */

    function hasLocalLibraryContent() {

        return Boolean(
            state.shelves.length ||
            state.books.length ||
            state.quotes.length ||
            state.vocabulary.length
        );

    }


    function hasRemoteLibraryContent(
        remote
    ) {

        return Boolean(
            remote?.shelves?.length ||
            remote?.books?.length ||
            remote?.quotes?.length ||
            remote?.vocabulary?.length ||
            remote?.journalEntries?.length
        );

    }


    /* =====================================================
       UUID UTILITIES

       Supabase uses UUID primary keys.
       Older Shelfmark / Novellow local records may not.
       ===================================================== */

    function isUUID(
        value
    ) {

        return (
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                .test(
                    String(
                        value ||
                        ""
                    )
                )
        );

    }


    function createUUID() {

        if (
            window.crypto &&
            typeof window.crypto.randomUUID ===
                "function"
        ) {

            return window.crypto
                .randomUUID();

        }


        return (
            "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
        ).replace(
            /[xy]/g,
            character => {

                const random =
                    Math.random() *
                        16 |
                    0;


                const generated =
                    character ===
                    "x"
                        ? random
                        : (
                            random &
                            0x3 |
                            0x8
                        );


                return generated
                    .toString(
                        16
                    );

            }
        );

    }


    /* =====================================================
       MAKE EXISTING LOCAL IDS CLOUD SAFE

       Also maintains relationships:
       shelf -> books -> quotes / vocabulary
       ===================================================== */

    function ensureCloudCompatibleIds() {

        const shelfIdMap =
            new Map();


        const bookIdMap =
            new Map();


        /* -------------------------------------------------
           SHELVES
           ------------------------------------------------- */

        state.shelves =
            state.shelves.map(
                shelf => {

                    const oldId =
                        String(
                            shelf.id ||
                            ""
                        );


                    const newId =
                        isUUID(
                            oldId
                        )
                            ? oldId
                            : createUUID();


                    if (oldId) {

                        shelfIdMap.set(
                            oldId,
                            newId
                        );

                    }


                    return {
                        ...shelf,
                        id:
                            newId
                    };

                }
            );


        /* -------------------------------------------------
           BOOKS
           ------------------------------------------------- */

        state.books =
            state.books.map(
                book => {

                    const oldId =
                        String(
                            book.id ||
                            ""
                        );


                    const newId =
                        isUUID(
                            oldId
                        )
                            ? oldId
                            : createUUID();


                    if (oldId) {

                        bookIdMap.set(
                            oldId,
                            newId
                        );

                    }


                    const oldShelfId =
                        String(
                            book.shelfId ||
                            book.shelf_id ||
                            ""
                        );


                    const shelfId =
                        shelfIdMap.get(
                            oldShelfId
                        ) ||
                        (
                            isUUID(
                                oldShelfId
                            )
                                ? oldShelfId
                                : ""
                        );


                    return {

                        ...book,

                        id:
                            newId,

                        shelfId,

                        shelf_id:
                            shelfId ||
                            null

                    };

                }
            );


        /* -------------------------------------------------
           QUOTES
           ------------------------------------------------- */

        state.quotes =
            state.quotes.map(
                quote => {

                    const oldBookId =
                        String(
                            quote.bookId ||
                            quote.book_id ||
                            ""
                        );


                    const bookId =
                        bookIdMap.get(
                            oldBookId
                        ) ||
                        oldBookId;


                    return {

                        ...quote,

                        id:
                            isUUID(
                                quote.id
                            )
                                ? quote.id
                                : createUUID(),

                        bookId,

                        book_id:
                            bookId ||
                            null

                    };

                }
            );


        /* -------------------------------------------------
           VOCABULARY
           ------------------------------------------------- */

        state.vocabulary =
            state.vocabulary.map(
                entry => {

                    const oldBookId =
                        String(
                            entry.bookId ||
                            entry.book_id ||
                            ""
                        );


                    const bookId =
                        bookIdMap.get(
                            oldBookId
                        ) ||
                        oldBookId;


                    return {

                        ...entry,

                        id:
                            isUUID(
                                entry.id
                            )
                                ? entry.id
                                : createUUID(),

                        bookId,

                        book_id:
                            bookId ||
                            null

                    };

                }
            );


        /* -------------------------------------------------
           SELECTED BOOK
           ------------------------------------------------- */

        if (
            state.selectedBookId
        ) {

            state.selectedBookId =
                bookIdMap.get(
                    String(
                        state.selectedBookId
                    )
                ) ||
                state.selectedBookId;

        }

    }


    /* =====================================================
       ONE-TIME LOCAL -> SUPABASE MIGRATION
       ===================================================== */

    async function migrateLocalLibraryToCloud(
        userId
    ) {

        const supabase =
            Novellow.supabase;


        ensureCloudCompatibleIds();


        /*
           Save the newly generated UUIDs locally first.
           This means even a refresh halfway through migration
           keeps the relationships stable.
        */

        suppressCloudSync =
            true;


        writeLocalCache();


        suppressCloudSync =
            false;


        /* -------------------------------------------------
           SHELVES FIRST

           Books reference shelf UUIDs.
           ------------------------------------------------- */

        for (
            const shelf of
                state.shelves
        ) {

            await supabase
                .saveShelf(
                    shelf
                );

        }


        /* -------------------------------------------------
           BOOKS
           ------------------------------------------------- */

        for (
            const book of
                state.books
        ) {

            await supabase
                .saveBook(
                    book
                );

        }


        /* -------------------------------------------------
           QUOTES
           ------------------------------------------------- */

        for (
            const quote of
                state.quotes
        ) {

            if (
                !(
                    quote.bookId ||
                    quote.book_id
                )
            ) {

                continue;

            }


            await supabase
                .saveQuote(
                    quote
                );

        }


        /* -------------------------------------------------
           VOCABULARY
           ------------------------------------------------- */

        for (
            const entry of
                state.vocabulary
        ) {

            if (
                !(
                    entry.bookId ||
                    entry.book_id
                )
            ) {

                continue;

            }


            await supabase
                .saveVocabularyEntry(
                    entry
                );

        }


        /* -------------------------------------------------
           SETTINGS
           ------------------------------------------------- */

        await supabase
            .saveUserSettings(
                buildCloudSettingsPayload()
            );


        localStorage.setItem(
            LOCAL_OWNER_KEY,
            userId
        );

    }


    /* =====================================================
       HYDRATE APP STATE FROM SUPABASE
       ===================================================== */

    function hydrateStateFromCloud(
        remote
    ) {

        const remoteShelves =
            remote?.shelves ||
            [];


        const remoteBooks =
            remote?.books ||
            [];


        const remoteQuotes =
            remote?.quotes ||
            [];


        const remoteVocabulary =
            remote?.vocabulary ||
            [];


        /* -------------------------------------------------
           SHELVES
           ------------------------------------------------- */

        state.shelves =
            remoteShelves.map(
                row => {

                    const shelf = {

                        ...row,

                        sortMode:
                            row.sort_mode ||
                            "manual"

                    };


                    return (
                        H.normalizeShelf?.(
                            shelf
                        ) ||
                        shelf
                    );

                }
            );


        /* -------------------------------------------------
           BOOKS
           ------------------------------------------------- */

        state.books =
            remoteBooks.map(
                row => {

                    const book = {

                        ...row,

                        shelfId:
                            row.shelf_id ||
                            "",

                        shelf_id:
                            row.shelf_id ||
                            null,

                        year:
                            row.publication_year ??
                            "",

                        pages:
                            row.total_pages ??
                            0,

                        total_pages:
                            row.total_pages ??
                            0,

                        currentPage:
                            row.current_page ??
                            0,

                        current_page:
                            row.current_page ??
                            0,

                        timesRead:
                            row.times_read ??
                            0,

                        times_read:
                            row.times_read ??
                            0,

                        started:
                            row.started_at ||
                            "",

                        finished:
                            row.finished_at ||
                            "",

                        cover:
                            row.cover_url ||
                            "",

                        design:
                            row.design ||
                            {}

                    };


                    return (
                        H.normalizeBook?.(
                            book
                        ) ||
                        book
                    );

                }
            );


        /* -------------------------------------------------
           QUOTES
           ------------------------------------------------- */

        state.quotes =
            remoteQuotes.map(
                row => {

                    const quote = {

                        ...row,

                        bookId:
                            row.book_id,

                        text:
                            row.quote_text,

                        quote:
                            row.quote_text,

                        pageNumber:
                            row.page_number

                    };


                    return (
                        H.normalizeQuote?.(
                            quote
                        ) ||
                        quote
                    );

                }
            );


        /* -------------------------------------------------
           VOCABULARY
           ------------------------------------------------- */

        state.vocabulary =
            remoteVocabulary.map(
                row => {

                    const entry = {

                        ...row,

                        bookId:
                            row.book_id,

                        partOfSpeech:
                            row.part_of_speech,

                        pageNumber:
                            row.page_number

                    };


                    return (
                        H.normalizeWord?.(
                            entry
                        ) ||
                        entry
                    );

                }
            );


        /* -------------------------------------------------
           SETTINGS
           ------------------------------------------------- */

        if (
            remote?.settings
        ) {

            const row =
                remote.settings;


            const custom =
                row.settings ||
                {};


            state.settings =
                H.normalizeSettings?.({

                    ...state.settings,

                    ...custom,

                    theme:
                        row.theme ||
                        custom.theme ||
                        state.settings.theme,

                    decorationDensity:
                        row.decoration_density ||
                        custom.decorationDensity ||
                        state.settings
                            .decorationDensity,

                    annualReadingGoal:
                        row.annual_reading_goal ??
                        custom.annualReadingGoal ??
                        state.settings
                            .annualReadingGoal,

                    defaultShelfSort:
                        row.default_shelf_sort ||
                        custom.defaultShelfSort ||
                        state.settings
                            .defaultShelfSort

                }) ||
                {

                    ...state.settings,

                    ...custom

                };

        }


        /*
           If the previously-selected local book isn't in the
           authenticated user's library, clear it.
        */

        state.selectedBookId =
            state.books.some(
                book =>
                    String(
                        book.id
                    ) ===
                    String(
                        state.selectedBookId
                    )
            )
                ? state.selectedBookId
                : null;

    }


    /* =====================================================
       SETTINGS -> CLOUD FORMAT

       Top-level database columns handle the common settings.

       The settings JSON column stores Novellow-specific
       ambience preferences that don't have their own columns.
       ===================================================== */

    function buildCloudSettingsPayload() {

        return {

            ...state.settings,

            settings: {

                candleGlow:
                    Boolean(
                        state.settings
                            .candleGlow
                    ),

                dust:
                    Boolean(
                        state.settings
                            .dust
                    ),

                rain:
                    Boolean(
                        state.settings
                            .rain
                    ),

                oddities:
                    Boolean(
                        state.settings
                            .oddities
                    ),

                reducedMotion:
                    Boolean(
                        state.settings
                            .reducedMotion
                    )

            }

        };

    }


    /* =====================================================
       LOCAL CACHE WRITER
       ===================================================== */

    function writeLocalCache() {

        H.writeStorage?.(
            STORAGE.shelves,
            state.shelves
        );


        H.writeStorage?.(
            STORAGE.books,
            state.books
        );


        H.writeStorage?.(
            STORAGE.quotes,
            state.quotes
        );


        H.writeStorage?.(
            STORAGE.vocabulary,
            state.vocabulary
        );


        H.writeStorage?.(
            STORAGE.settings,
            state.settings
        );

    }


    /* =====================================================
       PERSISTENCE
       Local immediately + cloud queue
       ===================================================== */

    function saveShelves() {

        H.writeStorage?.(
            STORAGE.shelves,
            state.shelves
        );


        queueCloudSync(
            "shelves"
        );

    }


    function saveBooks() {

        H.writeStorage?.(
            STORAGE.books,
            state.books
        );


        queueCloudSync(
            "books"
        );

    }


    function saveQuotes() {

        H.writeStorage?.(
            STORAGE.quotes,
            state.quotes
        );


        queueCloudSync(
            "quotes"
        );

    }


    function saveVocabulary() {

        H.writeStorage?.(
            STORAGE.vocabulary,
            state.vocabulary
        );


        queueCloudSync(
            "vocabulary"
        );

    }


    function saveSettings() {

        H.writeStorage?.(
            STORAGE.settings,
            state.settings
        );


        queueCloudSync(
            "settings"
        );

    }


    function persistAll() {

        saveShelves();

        saveBooks();

        saveQuotes();

        saveVocabulary();

        saveSettings();

    }


    /* =====================================================
       CLOUD SAVE QUEUE
       ===================================================== */

    function queueCloudSync(
        kind
    ) {

        if (
            suppressCloudSync ||
            !cloudReady ||
            !Novellow.currentUser?.id
        ) {

            return;

        }


        pendingCloudSync.add(
            kind
        );


        window.clearTimeout(
            cloudSyncTimer
        );


        cloudSyncTimer =
            window.setTimeout(
                flushCloudSync,
                300
            );

    }


    /* =====================================================
       FLUSH CLOUD SAVE QUEUE
       ===================================================== */

    async function flushCloudSync() {

        if (
            suppressCloudSync ||
            !cloudReady ||
            !Novellow.currentUser?.id
        ) {

            return;

        }


        const types =
            new Set(
                pendingCloudSync
            );


        pendingCloudSync.clear();


        if (!types.size) {

            return;

        }


        const supabase =
            Novellow.supabase;


        try {

            /* -------------------------------------------------
               SHELVES
               ------------------------------------------------- */

            if (
                types.has(
                    "shelves"
                )
            ) {

                for (
                    const shelf of
                        state.shelves
                ) {

                    await supabase
                        .saveShelf(
                            shelf
                        );

                }

            }


            /* -------------------------------------------------
               BOOKS
               ------------------------------------------------- */

            if (
                types.has(
                    "books"
                )
            ) {

                for (
                    const book of
                        state.books
                ) {

                    await supabase
                        .saveBook(
                            book
                        );

                }

            }


            /* -------------------------------------------------
               QUOTES
               ------------------------------------------------- */

            if (
                types.has(
                    "quotes"
                )
            ) {

                for (
                    const quote of
                        state.quotes
                ) {

                    if (
                        !(
                            quote.bookId ||
                            quote.book_id
                        )
                    ) {

                        continue;

                    }


                    await supabase
                        .saveQuote(
                            quote
                        );

                }

            }


            /* -------------------------------------------------
               VOCABULARY
               ------------------------------------------------- */

            if (
                types.has(
                    "vocabulary"
                )
            ) {

                for (
                    const entry of
                        state.vocabulary
                ) {

                    if (
                        !(
                            entry.bookId ||
                            entry.book_id
                        )
                    ) {

                        continue;

                    }


                    await supabase
                        .saveVocabularyEntry(
                            entry
                        );

                }

            }


            /* -------------------------------------------------
               SETTINGS
               ------------------------------------------------- */

            if (
                types.has(
                    "settings"
                )
            ) {

                await supabase
                    .saveUserSettings(
                        buildCloudSettingsPayload()
                    );

            }

        } catch (error) {

            console.error(
                "Novellow cloud save failed.",
                error
            );


            /*
               Put these categories back into the queue.

               Local data is never discarded because the
               network happened to fail.
            */

            types.forEach(
                type =>
                    pendingCloudSync.add(
                        type
                    )
            );


            H.showToast?.(
                "Your change is saved on this device, but cloud sync needs another try.",
                "error"
            );

        }

    }


    /* =====================================================
       STORAGE API
       ===================================================== */

    Novellow.storage = {

        saveShelves,

        saveBooks,

        saveQuotes,

        saveVocabulary,

        saveSettings,

        persistAll,

        flushCloudSync

    };


    /* =====================================================
       NAVIGATION
       ===================================================== */

    function bindNavigation() {

        H.queryAll?.(
            "[data-section]"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const section =
                            button.dataset
                                .section;


                        navigateTo(
                            section
                        );

                    }
                );

            }
        );

    }


    function navigateTo(
        sectionId
    ) {

        const target =
            H.getById?.(
                sectionId
            );


        if (!target) {

            return;

        }


        const sections =
            H.queryAll?.(
                "[data-app-section]"
            ) ||
            [];


        sections.forEach(
            section => {

                const isTarget =
                    section.dataset
                        .appSection ===
                    sectionId;


                section.hidden =
                    !isTarget;


                section.classList.toggle(
                    "active-section",
                    isTarget
                );

            }
        );


        const navButtons =
            H.queryAll?.(
                "[data-section]"
            ) ||
            [];


        navButtons.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset
                        .section ===
                        sectionId
                );

            }
        );


        state.currentSection =
            sectionId;


        updateHash(
            sectionId
        );


        window.scrollTo({

            top:
                0,

            behavior:
                state.settings
                    .reducedMotion
                    ? "auto"
                    : "smooth"

        });


        triggerSectionRender(
            sectionId
        );

    }


    function triggerSectionRender(
        sectionId
    ) {

        switch (
            sectionId
        ) {

            case "library":

                Novellow.library
                    ?.render?.();

                break;


            case "reading":

                Novellow.reading
                    ?.render?.();

                break;


            case "journal":

                Novellow.journal
                    ?.render?.();

                break;


            case "quotes":

                Novellow.quotes
                    ?.render?.();

                break;


            case "vocabulary":

                Novellow.vocabulary
                    ?.render?.();

                break;


            case "stats":

                Novellow.stats
                    ?.render?.();

                break;

        }

    }


    function restoreCurrentSection() {

        const hash =
            window.location.hash
                .replace(
                    "#",
                    ""
                )
                .trim();


        const validSections = [

            "library",
            "reading",
            "journal",
            "quotes",
            "vocabulary",
            "stats"

        ];


        const target =
            validSections.includes(
                hash
            )
                ? hash
                : state.currentSection ||
                  "library";


        navigateTo(
            target
        );

    }


    function updateHash(
        sectionId
    ) {

        try {

            history.replaceState(
                null,
                "",
                `#${sectionId}`
            );

        } catch (error) {

            window.location.hash =
                sectionId;

        }

    }


    Novellow.navigation = {

        navigateTo

    };


    /* =====================================================
       GLOBAL ACTIONS
       ===================================================== */

    function bindGlobalActions() {

        [
            "headerAddBook",
            "libraryAddBook",
            "emptyAddBook",
            "readingAddBook",
            "mobileAddBook"
        ].forEach(
            id => {

                H.bindClick?.(
                    id,
                    () =>
                        Novellow.books
                            ?.openAddDrawer?.()
                );

            }
        );


        [
            "addShelfButton",
            "emptyAddShelf"
        ].forEach(
            id => {

                H.bindClick?.(
                    id,
                    () =>
                        Novellow.library
                            ?.openAddShelfDrawer?.()
                );

            }
        );


        H.bindClick?.(
            "openThemeDrawer",
            openThemeDrawer
        );


        H.bindClick?.(
            "openSettingsDrawer",
            openSettingsDrawer
        );


        H.bindClick?.(
            "closeThemeDrawer",
            closeAllPanels
        );


        H.bindClick?.(
            "themeDoneButton",
            closeAllPanels
        );


        H.bindClick?.(
            "closeSettingsDrawer",
            closeAllPanels
        );


        H.bindClick?.(
            "settingsDoneButton",
            closeAllPanels
        );


        H.bindClick?.(
            "overlay",
            closeAllPanels
        );


        document.addEventListener(
            "keydown",
            handleGlobalKeydown
        );

    }


    function handleGlobalKeydown(
        event
    ) {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        closeAllPanels();


        Novellow.books
            ?.closeReveal?.();


        Novellow.books
            ?.closeProgressModal?.();


        Novellow.journal
            ?.closeEntryModal?.();


        Novellow.quotes
            ?.closeModal?.();


        Novellow.vocabulary
            ?.closeModal?.();

    }


    /* =====================================================
       DRAWER / OVERLAY CONTROLLER
       ===================================================== */

    function openPanel(
        panelId
    ) {

        closeAllPanels();


        const panel =
            H.getById?.(
                panelId
            );


        const overlay =
            H.getById?.(
                "overlay"
            );


        if (!panel) {

            return;

        }


        if (overlay) {

            overlay.hidden =
                false;


            overlay.style
                .pointerEvents =
                "auto";

        }


        panel.hidden =
            false;


        panel.style.pointerEvents =
            "auto";


        document.body.classList.add(
            "modal-open"
        );

    }


    function closeAllPanels() {

        [
            "themeDrawer",
            "settingsDrawer",
            "profileDrawer",
            "shelfDrawer",
            "bookDrawer"
        ].forEach(
            id => {

                const element =
                    H.getById?.(
                        id
                    );


                if (!element) {

                    return;

                }


                element.hidden =
                    true;


                element.style
                    .pointerEvents =
                    "none";

            }
        );


        const overlay =
            H.getById?.(
                "overlay"
            );


        if (overlay) {

            overlay.hidden =
                true;


            overlay.style
                .pointerEvents =
                "none";

        }


        document.body.classList.remove(
            "modal-open"
        );

    }


    function openThemeDrawer() {

        syncThemeControls();


        openPanel(
            "themeDrawer"
        );

    }


    function openSettingsDrawer() {

        syncSettingsControls();


        openPanel(
            "settingsDrawer"
        );

    }


    Novellow.panels = {

        openPanel,

        closeAllPanels,

        openThemeDrawer,

        openSettingsDrawer

    };


    /* =====================================================
       THEME CONTROLS
       ===================================================== */

    function bindThemeControls() {

        const themeCards =
            H.queryAll?.(
                ".theme-card[data-theme]"
            ) ||
            [];


        themeCards.forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        setTheme(
                            card.dataset
                                .theme
                        );

                    }
                );

            }
        );


        bindSettingCheckbox(
            "settingCandleGlow",
            "candleGlow"
        );


        bindSettingCheckbox(
            "settingDust",
            "dust"
        );


        bindSettingCheckbox(
            "settingRain",
            "rain"
        );


        bindSettingCheckbox(
            "settingOddities",
            "oddities"
        );


        bindSettingCheckbox(
            "settingReducedMotion",
            "reducedMotion"
        );


        const densityRadios =
            H.queryAll?.(
                'input[name="decorationDensity"]'
            ) ||
            [];


        densityRadios.forEach(
            radio => {

                radio.addEventListener(
                    "change",
                    () => {

                        if (
                            !radio.checked
                        ) {

                            return;

                        }


                        state.settings
                            .decorationDensity =
                            radio.value;


                        saveSettings();

                        applySettings();


                        Novellow.library
                            ?.render?.();

                    }
                );

            }
        );

    }


    function bindSettingCheckbox(
        id,
        settingName
    ) {

        const input =
            H.getById?.(
                id
            );


        if (!input) {

            return;

        }


        input.addEventListener(
            "change",
            () => {

                state.settings[
                    settingName
                ] =
                    Boolean(
                        input.checked
                    );


                saveSettings();

                applySettings();


                if (
                    settingName ===
                    "oddities"
                ) {

                    Novellow.library
                        ?.render?.();

                }

            }
        );

    }


    function setTheme(
        themeId
    ) {

        const themeExists =
            (
                CONFIG.themes ||
                []
            ).some(
                theme =>
                    theme.id ===
                    themeId
            );


        if (!themeExists) {

            return;

        }


        state.settings.theme =
            themeId;


        saveSettings();

        applySettings();

        syncThemeControls();


        Novellow.library
            ?.render?.();

    }


    /* =====================================================
       APPLY SETTINGS
       ===================================================== */

    function applySettings() {

        const body =
            document.body;


        const settings =
            state.settings;


        const theme =
            settings.theme ||
            CONFIG.defaultSettings
                ?.theme ||
            "haunted";


        (
            CONFIG.themes ||
            []
        ).forEach(
            item => {

                body.classList.remove(
                    item.className
                );

            }
        );


        body.classList.add(
            `theme-${theme}`
        );


        body.dataset.theme =
            theme;


        body.classList.toggle(
            "candle-glow",
            Boolean(
                settings.candleGlow
            )
        );


        body.classList.toggle(
            "floating-dust",
            Boolean(
                settings.dust
            )
        );


        body.classList.toggle(
            "rain-enabled",
            Boolean(
                settings.rain
            )
        );


        body.classList.toggle(
            "ambient-oddities",
            Boolean(
                settings.oddities
            )
        );


        body.classList.toggle(
            "reduce-motion",
            Boolean(
                settings.reducedMotion
            )
        );


        body.dataset
            .decorationDensity =
            settings
                .decorationDensity ||
            "cozy";


        syncThemeControls();

        syncSettingsControls();

    }


    /* =====================================================
       SYNC THEME CONTROLS
       ===================================================== */

    function syncThemeControls() {

        const settings =
            state.settings;


        const themeCards =
            H.queryAll?.(
                ".theme-card[data-theme]"
            ) ||
            [];


        themeCards.forEach(
            card => {

                card.classList.toggle(
                    "active",
                    card.dataset.theme ===
                        settings.theme
                );

            }
        );


        setChecked(
            "settingCandleGlow",
            settings.candleGlow
        );


        setChecked(
            "settingDust",
            settings.dust
        );


        setChecked(
            "settingRain",
            settings.rain
        );


        setChecked(
            "settingOddities",
            settings.oddities
        );


        setChecked(
            "settingReducedMotion",
            settings.reducedMotion
        );


        const densityRadios =
            H.queryAll?.(
                'input[name="decorationDensity"]'
            ) ||
            [];


        densityRadios.forEach(
            radio => {

                radio.checked =
                    radio.value ===
                    settings
                        .decorationDensity;

            }
        );

    }


    /* =====================================================
       SETTINGS CONTROLS
       ===================================================== */

    function bindSettingsControls() {

        const sort =
            H.getById?.(
                "defaultShelfSort"
            );


        if (sort) {

            sort.addEventListener(
                "change",
                () => {

                    state.settings
                        .defaultShelfSort =
                        sort.value;


                    saveSettings();

                }
            );

        }


        const goal =
            H.getById?.(
                "annualReadingGoal"
            );


        if (goal) {

            goal.addEventListener(
                "change",
                () => {

                    const nextValue =
                        Math.max(
                            1,
                            H.toNumber?.(
                                goal.value,
                                20
                            ) ||
                            20
                        );


                    state.settings
                        .annualReadingGoal =
                        nextValue;


                    goal.value =
                        nextValue;


                    saveSettings();


                    Novellow.stats
                        ?.render?.();

                }
            );

        }


        H.bindClick?.(
            "clearLibraryButton",
            clearEntireLibrary
        );

    }


    function syncSettingsControls() {

        const settings =
            state.settings;


        const sort =
            H.getById?.(
                "defaultShelfSort"
            );


        if (sort) {

            sort.value =
                settings
                    .defaultShelfSort ||
                "manual";

        }


        const goal =
            H.getById?.(
                "annualReadingGoal"
            );


        if (goal) {

            goal.value =
                Math.max(
                    1,
                    H.toNumber?.(
                        settings
                            .annualReadingGoal,
                        20
                    ) ||
                    20
                );

        }

    }


    function setChecked(
        id,
        nextValue
    ) {

        const input =
            H.getById?.(
                id
            );


        if (!input) {

            return;

        }


        input.checked =
            Boolean(
                nextValue
            );

    }


    /* =====================================================
       IMPORT / EXPORT
       ===================================================== */

    function bindImportExport() {

        H.bindClick?.(
            "exportLibraryButton",
            exportLibrary
        );


        H.bindClick?.(
            "importLibraryButton",
            () => {

                const input =
                    H.getById?.(
                        "importLibraryInput"
                    );


                input?.click();

            }
        );


        const input =
            H.getById?.(
                "importLibraryInput"
            );


        if (input) {

            input.addEventListener(
                "change",
                handleImportFile
            );

        }

    }


    function exportLibrary() {

        const backup = {

            product:
                "Novellow",

            version:
                CONFIG.product
                    ?.version ||
                "1.0.0",

            exportedAt:
                H.nowISO?.() ||
                new Date()
                    .toISOString(),

            shelves:
                state.shelves,

            books:
                state.books,

            quotes:
                state.quotes,

            vocabulary:
                state.vocabulary,

            settings:
                state.settings

        };


        const date =
            H.todayISO?.() ||
            "backup";


        H.downloadJSON?.(
            backup,
            `novellow-backup-${date}.json`
        );


        H.showToast?.(
            "Your Novellow library has been exported.",
            "success"
        );

    }


    async function handleImportFile(
        event
    ) {

        const file =
            event.target
                .files?.[0];


        if (!file) {

            return;

        }


        try {

            const data =
                await H.readJSONFile?.(
                    file
                );


            importBackupData(
                data
            );


            H.showToast?.(
                "Your Novellow library was imported.",
                "success"
            );

        } catch (error) {

            console.error(
                error
            );


            H.showToast?.(
                error.message ||
                "Novellow could not import that file.",
                "error"
            );

        } finally {

            event.target.value =
                "";

        }

    }


    function importBackupData(
        data
    ) {

        if (
            !data ||
            typeof data !==
                "object"
        ) {

            throw new Error(
                "That backup file is not valid."
            );

        }


        const confirmed =
            H.confirmAction?.(
                "Importing this backup will replace the library currently loaded in Novellow. Continue?"
            );


        if (!confirmed) {

            return;

        }


        state.shelves =
            H.normalizeCollection?.(
                data.shelves ||
                [],
                H.normalizeShelf
            ) ||
            [];


        state.books =
            H.normalizeCollection?.(
                data.books ||
                [],
                H.normalizeBook
            ) ||
            [];


        state.quotes =
            H.normalizeCollection?.(
                data.quotes ||
                [],
                H.normalizeQuote
            ) ||
            [];


        state.vocabulary =
            H.normalizeCollection?.(
                data.vocabulary ||
                [],
                H.normalizeWord
            ) ||
            [];


        state.settings =
            H.normalizeSettings?.(
                data.settings ||
                {}
            ) ||
            {
                ...CONFIG.defaultSettings
            };


        /*
           Imported IDs may come from older Shelfmark exports.
        */

        ensureCloudCompatibleIds();


        persistAll();

        applySettings();

        renderEverything();

        closeAllPanels();

    }


    /* =====================================================
       CLEAR ENTIRE LIBRARY
       ===================================================== */

    async function clearEntireLibrary() {

        const confirmed =
            H.confirmAction?.(
                "Clear your entire Novellow library? This removes your synced shelves, books, quotes, vocabulary, and settings from this account."
            );


        if (!confirmed) {

            return;

        }


        /*
           Keep copies so we know which Supabase records must
           be deleted before local state is emptied.
        */

        const oldShelves = [
            ...state.shelves
        ];


        const oldBooks = [
            ...state.books
        ];


        const oldQuotes = [
            ...state.quotes
        ];


        const oldVocabulary = [
            ...state.vocabulary
        ];


        try {

            if (
                cloudReady &&
                Novellow.currentUser?.id
            ) {

                /*
                   Quotes and vocabulary first.
                */

                for (
                    const quote of
                        oldQuotes
                ) {

                    await Novellow.supabase
                        ?.deleteQuote?.(
                            quote.id
                        );

                }


                for (
                    const entry of
                        oldVocabulary
                ) {

                    await Novellow.supabase
                        ?.deleteVocabularyEntry?.(
                            entry.id
                        );

                }


                /*
                   Journal rows cascade when the book is
                   deleted because of our database schema.
                */

                for (
                    const book of
                        oldBooks
                ) {

                    await Novellow.supabase
                        ?.deleteBook?.(
                            book.id
                        );

                }


                for (
                    const shelf of
                        oldShelves
                ) {

                    await Novellow.supabase
                        ?.deleteShelf?.(
                            shelf.id
                        );

                }

            }


            suppressCloudSync =
                true;


            state.shelves =
                [];


            state.books =
                [];


            state.quotes =
                [];


            state.vocabulary =
                [];


            state.settings =
                H.normalizeSettings?.(
                    {}
                ) ||
                {
                    ...CONFIG.defaultSettings
                };


            state.selectedBookId =
                null;


            state.selectedJournalSection =
                null;


            state.pendingCoverData =
                "";


            writeLocalCache();


            suppressCloudSync =
                false;


            if (
                cloudReady &&
                Novellow.currentUser?.id
            ) {

                await Novellow.supabase
                    ?.saveUserSettings?.(
                        buildCloudSettingsPayload()
                    );

            }


            applySettings();

            renderEverything();

            closeAllPanels();


            H.showToast?.(
                "Your Novellow library has been cleared.",
                "success"
            );

        } catch (error) {

            suppressCloudSync =
                false;


            console.error(
                "Novellow could not clear the synced library.",
                error
            );


            H.showToast?.(
                "Novellow could not completely clear the synced library.",
                "error"
            );

        }

    }


    /* =====================================================
       FEATURE MODULE INITIALIZATION
       ===================================================== */

    function initializeFeatureModules() {

        const modules = [

            "books",
            "library",
            "reading",
            "journal",
            "quotes",
            "vocabulary",
            "stats"

        ];


        modules.forEach(
            moduleName => {

                const module =
                    Novellow[
                        moduleName
                    ];


                if (
                    typeof module?.init !==
                    "function"
                ) {

                    return;

                }


                try {

                    module.init();

                } catch (error) {

                    console.error(
                        `Novellow ${moduleName}.init() failed.`,
                        error
                    );

                }

            }
        );

    }


    /* =====================================================
       RENDER EVERYTHING
       ===================================================== */

    function renderEverything() {

        [
            "library",
            "reading",
            "journal",
            "quotes",
            "vocabulary",
            "stats"
        ].forEach(
            moduleName => {

                const module =
                    Novellow[
                        moduleName
                    ];


                if (
                    typeof module?.render !==
                    "function"
                ) {

                    return;

                }


                try {

                    module.render();

                } catch (error) {

                    console.error(
                        `Novellow ${moduleName}.render() failed.`,
                        error
                    );

                }

            }
        );

    }


    Novellow.renderEverything =
        renderEverything;


    /* =====================================================
       LOADING SCREEN
       ===================================================== */

    function finishLoading() {

        const loadingScreen =
            H.getById?.(
                "loadingScreen"
            );


        if (!loadingScreen) {

            return;

        }


        requestAnimationFrame(
            () => {

                loadingScreen.classList.add(
                    "is-hidden"
                );


                setTimeout(
                    () => {

                        loadingScreen.hidden =
                            true;

                    },
                    380
                );

            }
        );

    }


    /* =====================================================
       PUBLIC APP API
       ===================================================== */

    Novellow.app = {

        initialize,

        navigateTo,

        applySettings,

        setTheme,

        openPanel,

        closeAllPanels,

        renderEverything,

        exportLibrary,

        importBackupData,

        clearEntireLibrary,

        loadCloudLibraryForUser,

        flushCloudSync,

        isCloudReady:
            () =>
                cloudReady

    };


})();
