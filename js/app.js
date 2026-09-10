/* ============================================================
   NOVELLOW
   APP.JS
   VERSION 13

   Application startup
   Shared state
   Navigation
   Settings
   Local cache
   Supabase hydration
   Supabase persistence coordination
   Import / export

   IMPORTANT:
   localStorage is now a CACHE.
   Supabase is the signed-in source of truth.
   ============================================================ */


(() => {

    "use strict";


    /* ========================================================
       CONFIG / GLOBALS
       ======================================================== */

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


    const STORAGE =
        CONFIG.storageKeys ||
        {};


    /* ========================================================
       STATE
       ======================================================== */

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


    /* ========================================================
       CLOUD STATE
       ======================================================== */

    let initialized =
        false;


    let cloudReady =
        false;


    let cloudLoading =
        false;


    let activeUserId =
        null;


    let saveQueue =
        Promise.resolve();


    /*
       These snapshots let us detect deletes.

       Example:

       Supabase knows about:
       A, B, C

       Local state now contains:
       A, B

       saveBooks() knows C was removed and can delete it
       from Supabase instead of merely failing to upsert it.
    */

    const cloudIds = {

        shelves:
            new Set(),

        books:
            new Set(),

        quotes:
            new Set(),

        vocabulary:
            new Set()

    };


    /* ========================================================
       AUTH EVENT LISTENER

       auth.js dispatches this after a user signs in or an
       existing session has been restored.
       ======================================================== */

    document.addEventListener(
        "novellow:user-ready",
        event => {

            const user =
                event.detail?.user ||
                Novellow.currentUser ||
                null;


            if (!user) {
                return;
            }


            hydrateSignedInUser(
                user
            );

        }
    );


    /* ========================================================
       DOM READY
       ======================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );


    function initialize() {

        if (initialized) {
            return;
        }


        initialized =
            true;


        hideInitialTransientUI();


        migrateLegacyData();


        /*
           Load the browser cache immediately so Novellow
           doesn't flash empty while Supabase responds.

           IMPORTANT:
           We do NOT upload this data here.
        */

        loadLocalCache();


        applySettings();


        bindNavigation();

        bindGlobalActions();

        bindThemeControls();

        bindSettingsControls();

        bindImportExport();


        initializeFeatureModules();


        renderEverything();


        restoreCurrentSection();


        /*
           auth.js may already have restored a user before
           this point.
        */

        if (
            Novellow.currentUser
        ) {

            hydrateSignedInUser(
                Novellow.currentUser
            );

        } else {

            finishLoading();

        }

    }


    /* ========================================================
       INITIAL UI SAFETY
       ======================================================== */

    function hideInitialTransientUI() {

        [
            "overlay",
            "themeDrawer",
            "settingsDrawer",
            "shelfDrawer",
            "bookDrawer",
            "bookReveal",
            "progressModal",
            "journalEntryModal",
            "quoteModal",
            "wordModal"
        ].forEach(
            id => {

                H.hide?.(
                    id
                );

            }
        );


        document.body
            .classList
            .remove(
                "modal-open"
            );

    }


    /* ========================================================
       LEGACY MIGRATION
       ======================================================== */

    function migrateLegacyData() {

        const migrated =
            H.migrateLegacyStorage?.();


        if (migrated) {

            console.info(
                "Novellow migrated existing Shelfmark data."
            );

        }

    }


    /* ========================================================
       LOCAL CACHE
       ======================================================== */

    function loadLocalCache() {

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
            normalizeShelves(
                rawShelves
            );


        state.books =
            normalizeBooks(
                rawBooks
            );


        state.quotes =
            normalizeQuotes(
                rawQuotes
            );


        state.vocabulary =
            normalizeVocabulary(
                rawVocabulary
            );


        state.settings =
            H.normalizeSettings?.(
                rawSettings
            ) ||
            {
                ...CONFIG.defaultSettings
            };


        /*
           Local cache is rewritten only locally.

           This keeps normalization changes without sending
           potentially stale browser data to Supabase before
           the account has been hydrated.
        */

        cacheEverything();

    }


    /* ========================================================
       NORMALIZATION
       ======================================================== */

    function normalizeShelves(
        collection
    ) {

        const values =
            Array.isArray(
                collection
            )
                ? collection
                : [];


        return (
            H.normalizeCollection?.(
                values.map(
                    fromCloudShelf
                ),
                H.normalizeShelf
            ) ||
            values.map(
                fromCloudShelf
            )
        );

    }


    function normalizeBooks(
        collection
    ) {

        const values =
            Array.isArray(
                collection
            )
                ? collection
                : [];


        return (
            H.normalizeCollection?.(
                values.map(
                    fromCloudBook
                ),
                H.normalizeBook
            ) ||
            values.map(
                fromCloudBook
            )
        );

    }


    function normalizeQuotes(
        collection
    ) {

        const values =
            Array.isArray(
                collection
            )
                ? collection
                : [];


        return (
            H.normalizeCollection?.(
                values.map(
                    fromCloudQuote
                ),
                H.normalizeQuote
            ) ||
            values.map(
                fromCloudQuote
            )
        );

    }


    function normalizeVocabulary(
        collection
    ) {

        const values =
            Array.isArray(
                collection
            )
                ? collection
                : [];


        return (
            H.normalizeCollection?.(
                values.map(
                    fromCloudVocabulary
                ),
                H.normalizeWord
            ) ||
            values.map(
                fromCloudVocabulary
            )
        );

    }


    /* ========================================================
       CLOUD RECORD → APP RECORD

       The Supabase helper may already transform these.
       These functions make app.js tolerant of either
       camelCase or snake_case records.
       ======================================================== */

    function fromCloudShelf(
        row
    ) {

        if (
            !row ||
            typeof row !==
                "object"
        ) {

            return row;

        }


        return {

            ...row,

            id:
                row.id,

            userId:
                row.userId ??
                row.user_id,

            createdAt:
                row.createdAt ??
                row.created_at,

            updatedAt:
                row.updatedAt ??
                row.updated_at,

            decorations:
                row.decorations ??
                row.decoration_data ??
                []

        };

    }


    function fromCloudBook(
        row
    ) {

        if (
            !row ||
            typeof row !==
                "object"
        ) {

            return row;

        }


        /*
           Some versions of the Supabase layer may store
           advanced book styling inside a JSON object.

           Flatten it back into the book so books.js sees
           exactly the properties it expects.
        */

        const design =
            row.design ||
            row.spine_design ||
            row.design_data ||
            {};


        return {

            ...row,

            ...(
                design &&
                typeof design ===
                    "object"
                    ? design
                    : {}
            ),

            id:
                row.id,

            userId:
                row.userId ??
                row.user_id,

            shelfId:
                row.shelfId ??
                row.shelf_id ??
                "",

            createdAt:
                row.createdAt ??
                row.created_at,

            updatedAt:
                row.updatedAt ??
                row.updated_at,

            startedAt:
                row.startedAt ??
                row.started_at,

            finishedAt:
                row.finishedAt ??
                row.finished_at

        };

    }


    function fromCloudQuote(
        row
    ) {

        if (
            !row ||
            typeof row !==
                "object"
        ) {

            return row;

        }


        return {

            ...row,

            bookId:
                row.bookId ??
                row.book_id ??
                row.book ??
                "",

            userId:
                row.userId ??
                row.user_id,

            createdAt:
                row.createdAt ??
                row.created_at,

            updatedAt:
                row.updatedAt ??
                row.updated_at

        };

    }


    function fromCloudVocabulary(
        row
    ) {

        if (
            !row ||
            typeof row !==
                "object"
        ) {

            return row;

        }


        return {

            ...row,

            bookId:
                row.bookId ??
                row.book_id ??
                row.book ??
                "",

            userId:
                row.userId ??
                row.user_id,

            createdAt:
                row.createdAt ??
                row.created_at,

            updatedAt:
                row.updatedAt ??
                row.updated_at

        };

    }


    /* ========================================================
       SIGNED-IN CLOUD HYDRATION
       ======================================================== */

    async function hydrateSignedInUser(
        user
    ) {

        if (
            !user?.id ||
            cloudLoading
        ) {

            return;
        }


        /*
           If the same account has already been hydrated,
           do not unnecessarily reload it on TOKEN_REFRESHED.
        */

        if (
            cloudReady &&
            activeUserId ===
                user.id
        ) {

            return;
        }


        cloudLoading =
            true;


        activeUserId =
            user.id;


        try {

            console.info(
                "Novellow: loading library from Supabase..."
            );


            const localBeforeCloud = {

                shelves:
                    clone(
                        state.shelves
                    ),

                books:
                    clone(
                        state.books
                    ),

                quotes:
                    clone(
                        state.quotes
                    ),

                vocabulary:
                    clone(
                        state.vocabulary
                    ),

                settings:
                    clone(
                        state.settings
                    )

            };


            const cloud =
                await loadCloudLibrary();


            const cloudShelves =
                normalizeShelves(
                    cloud.shelves
                );


            const cloudBooks =
                normalizeBooks(
                    cloud.books
                );


            const cloudQuotes =
                normalizeQuotes(
                    cloud.quotes
                );


            const cloudVocabulary =
                normalizeVocabulary(
                    cloud.vocabulary
                );


            rememberCloudIds(
                cloudShelves,
                cloudBooks,
                cloudQuotes,
                cloudVocabulary
            );


            /*
               Keep cloud records AND any browser-only records.

               This matters right now because a book that was
               created while the broken local-only app.js was
               active may exist in localStorage but not yet in
               Supabase.

               We do not want hydration to make it disappear.
            */

            const migration =
                prepareLocalCloudMerge(
                    {

                        localShelves:
                            localBeforeCloud
                                .shelves,

                        localBooks:
                            localBeforeCloud
                                .books,

                        cloudShelves,

                        cloudBooks

                    }
                );


            state.shelves =
                mergeCollections(
                    cloudShelves,
                    migration.localShelves
                );


            state.books =
                mergeCollections(
                    cloudBooks,
                    migration.localBooks
                );


            state.quotes =
                mergeCollections(
                    cloudQuotes,
                    localBeforeCloud
                        .quotes
                );


            state.vocabulary =
                mergeCollections(
                    cloudVocabulary,
                    localBeforeCloud
                        .vocabulary
                );


            /*
               Supabase settings win when they exist.

               Otherwise keep the locally cached settings.
            */

            if (
                cloud.settings &&
                Object.keys(
                    cloud.settings
                ).length
            ) {

                state.settings =
                    H.normalizeSettings?.(
                        cloud.settings
                    ) ||
                    cloud.settings;

            } else {

                state.settings =
                    H.normalizeSettings?.(
                        localBeforeCloud
                            .settings
                    ) ||
                    localBeforeCloud
                        .settings;

            }


            cloudReady =
                true;


            cacheEverything();


            applySettings();


            renderEverything();


            restoreCurrentSection();


            /*
               Upload browser-only items that were created while
               cloud persistence was unavailable.

               This runs AFTER cloudReady so storage operations
               are allowed to synchronize.
            */

            await synchronizeAllToCloud();


            console.info(
                `Novellow: Supabase synced ${state.shelves.length} shelves and ${state.books.length} books.`
            );


            H.showToast?.(
                "Your library is synced to your profile.",
                "success"
            );

        } catch (error) {

            console.error(
                "Novellow Supabase hydration failed:",
                error
            );


            /*
               Keep the local cache visible.

               A temporary network failure should never make
               the library vanish.
            */

            cloudReady =
                false;


            H.showToast?.(
                "Novellow is using the local library cache. Cloud sync could not finish.",
                "error"
            );

        } finally {

            cloudLoading =
                false;


            finishLoading();

        }

    }


    /* ========================================================
       LOAD CLOUD LIBRARY
       ======================================================== */

    async function loadCloudLibrary() {

        const api =
            Novellow.supabase;


        if (!api) {

            throw new Error(
                "Supabase helper is unavailable."
            );

        }


        /*
           Prefer one consolidated request if supabase.js
           exposes it.
        */

        if (
            typeof api.loadLibrary ===
                "function"
        ) {

            const result =
                await api.loadLibrary();


            return {

                shelves:
                    result?.shelves ||
                    [],

                books:
                    result?.books ||
                    [],

                quotes:
                    result?.quotes ||
                    [],

                vocabulary:
                    result?.vocabulary ||
                    [],

                settings:
                    result?.settings ||
                    {}

            };

        }


        /*
           Compatibility with the individual CRUD functions
           in the current Supabase helper.
        */

        const [
            shelves,
            books,
            quotes,
            vocabulary,
            settings
        ] =
            await Promise.all([

                api.getShelves?.() ??
                    Promise.resolve(
                        []
                    ),

                api.getBooks?.() ??
                    Promise.resolve(
                        []
                    ),

                api.getQuotes?.() ??
                    Promise.resolve(
                        []
                    ),

                api.getVocabulary?.() ??
                    Promise.resolve(
                        []
                    ),

                api.getUserSettings?.() ??
                    Promise.resolve(
                        {}
                    )

            ]);


        return {

            shelves:
                shelves ||
                [],

            books:
                books ||
                [],

            quotes:
                quotes ||
                [],

            vocabulary:
                vocabulary ||
                [],

            settings:
                settings ||
                {}

        };

    }


    /* ========================================================
       SAFE LOCAL/CLOUD MERGE
       ======================================================== */

    function prepareLocalCloudMerge({
        localShelves,
        localBooks,
        cloudShelves,
        cloudBooks
    }) {

        const shelfIdMap =
            new Map();


        /*
           Supabase UUID columns cannot accept old ids like:

           shelf-abc123

           Convert only local records that need it.
        */

        const repairedShelves =
            localShelves.map(
                shelf => {

                    if (
                        isUUID(
                            shelf.id
                        )
                    ) {

                        return shelf;

                    }


                    const existingCloudMatch =
                        findLikelyShelfMatch(
                            shelf,
                            cloudShelves
                        );


                    if (
                        existingCloudMatch
                    ) {

                        shelfIdMap.set(
                            shelf.id,
                            existingCloudMatch.id
                        );


                        return {
                            ...shelf,
                            id:
                                existingCloudMatch.id
                        };

                    }


                    const newId =
                        makeUUID();


                    shelfIdMap.set(
                        shelf.id,
                        newId
                    );


                    return {
                        ...shelf,
                        id:
                            newId
                    };

                }
            );


        const repairedBooks =
            localBooks.map(
                book => {

                    const oldShelfId =
                        book.shelfId ||
                        "";


                    const fixedShelfId =
                        shelfIdMap.get(
                            oldShelfId
                        ) ||
                        oldShelfId;


                    let fixedId =
                        book.id;


                    if (
                        !isUUID(
                            fixedId
                        )
                    ) {

                        const existingCloudMatch =
                            findLikelyBookMatch(
                                book,
                                cloudBooks
                            );


                        fixedId =
                            existingCloudMatch?.id ||
                            makeUUID();

                    }


                    return {

                        ...book,

                        id:
                            fixedId,

                        shelfId:
                            fixedShelfId

                    };

                }
            );


        return {

            localShelves:
                repairedShelves,

            localBooks:
                repairedBooks

        };

    }


    function findLikelyShelfMatch(
        localShelf,
        cloudShelves
    ) {

        return (
            cloudShelves.find(
                shelf =>

                    normalizedText(
                        shelf.name
                    ) ===
                    normalizedText(
                        localShelf.name
                    )

            ) ||
            null
        );

    }


    function findLikelyBookMatch(
        localBook,
        cloudBooks
    ) {

        return (
            cloudBooks.find(
                book => {

                    return (

                        normalizedText(
                            book.title
                        ) ===
                        normalizedText(
                            localBook.title
                        )

                        &&

                        normalizedText(
                            book.author
                        ) ===
                        normalizedText(
                            localBook.author
                        )

                    );

                }
            ) ||
            null
        );

    }


    function normalizedText(
        value
    ) {

        return String(
            value ||
            ""
        )
            .trim()
            .toLowerCase();

    }


    /* ========================================================
       MERGE COLLECTIONS
       ======================================================== */

    function mergeCollections(
        cloudCollection,
        localCollection
    ) {

        const merged =
            new Map();


        (
            cloudCollection ||
            []
        ).forEach(
            item => {

                if (
                    item?.id
                ) {

                    merged.set(
                        String(
                            item.id
                        ),
                        item
                    );

                }

            }
        );


        (
            localCollection ||
            []
        ).forEach(
            item => {

                if (
                    !item?.id
                ) {

                    return;

                }


                const key =
                    String(
                        item.id
                    );


                const cloudItem =
                    merged.get(
                        key
                    );


                if (
                    !cloudItem
                ) {

                    merged.set(
                        key,
                        item
                    );

                    return;

                }


                /*
                   Prefer whichever version was updated later.
                */

                const cloudDate =
                    timestamp(
                        cloudItem.updatedAt ??
                        cloudItem.updated_at
                    );


                const localDate =
                    timestamp(
                        item.updatedAt ??
                        item.updated_at
                    );


                if (
                    localDate >
                    cloudDate
                ) {

                    merged.set(
                        key,
                        {
                            ...cloudItem,
                            ...item
                        }
                    );

                }

            }
        );


        return [
            ...merged.values()
        ];

    }


    function timestamp(
        value
    ) {

        const time =
            new Date(
                value ||
                0
            )
                .getTime();


        return Number.isFinite(
            time
        )
            ? time
            : 0;

    }


    /* ========================================================
       CLOUD ID SNAPSHOTS
       ======================================================== */

    function rememberCloudIds(
        shelves,
        books,
        quotes,
        vocabulary
    ) {

        cloudIds.shelves =
            idSet(
                shelves
            );


        cloudIds.books =
            idSet(
                books
            );


        cloudIds.quotes =
            idSet(
                quotes
            );


        cloudIds.vocabulary =
            idSet(
                vocabulary
            );

    }


    function idSet(
        collection
    ) {

        return new Set(
            (
                collection ||
                []
            )
                .map(
                    item =>
                        item?.id
                )
                .filter(
                    Boolean
                )
                .map(
                    String
                )
        );

    }


    /* ========================================================
       LOCAL CACHE WRITERS
       ======================================================== */

    function cacheShelves() {

        H.writeStorage?.(
            STORAGE.shelves,
            state.shelves
        );

    }


    function cacheBooks() {

        H.writeStorage?.(
            STORAGE.books,
            state.books
        );

    }


    function cacheQuotes() {

        H.writeStorage?.(
            STORAGE.quotes,
            state.quotes
        );

    }


    function cacheVocabulary() {

        H.writeStorage?.(
            STORAGE.vocabulary,
            state.vocabulary
        );

    }


    function cacheSettings() {

        H.writeStorage?.(
            STORAGE.settings,
            state.settings
        );

    }


    function cacheEverything() {

        cacheShelves();

        cacheBooks();

        cacheQuotes();

        cacheVocabulary();

        cacheSettings();

    }


    /* ========================================================
       PUBLIC STORAGE API

       Existing feature modules already call:

       Novellow.storage.saveBooks()
       Novellow.storage.saveShelves()

       We keep that API.

       The difference:
       it now caches immediately AND queues Supabase sync.
       ======================================================== */

    function saveShelves() {

        cacheShelves();


        queueCloudOperation(
            synchronizeShelves
        );

    }


    function saveBooks() {

        cacheBooks();


        queueCloudOperation(
            synchronizeBooks
        );

    }


    function saveQuotes() {

        cacheQuotes();


        queueCloudOperation(
            synchronizeQuotes
        );

    }


    function saveVocabulary() {

        cacheVocabulary();


        queueCloudOperation(
            synchronizeVocabulary
        );

    }


    function saveSettings() {

        cacheSettings();


        queueCloudOperation(
            synchronizeSettings
        );

    }


    function persistAll() {

        cacheEverything();


        queueCloudOperation(
            synchronizeAllToCloud
        );

    }


    Novellow.storage = {

        saveShelves,

        saveBooks,

        saveQuotes,

        saveVocabulary,

        saveSettings,

        persistAll,

        syncNow:
            synchronizeAllToCloud,

        isCloudReady() {

            return cloudReady;

        }

    };


    /* ========================================================
       CLOUD QUEUE

       Avoid multiple edits racing each other.
       ======================================================== */

    function queueCloudOperation(
        operation
    ) {

        if (
            !cloudReady ||
            !activeUserId ||
            typeof operation !==
                "function"
        ) {

            return;

        }


        saveQueue =
            saveQueue
                .then(
                    () =>
                        operation()
                )
                .catch(
                    error => {

                        console.error(
                            "Novellow cloud save failed:",
                            error
                        );


                        H.showToast?.(
                            "Saved on this device, but cloud sync needs another try.",
                            "error"
                        );

                    }
                );

    }


    /* ========================================================
       SYNC EVERYTHING
       ======================================================== */

    async function synchronizeAllToCloud() {

        if (
            !cloudReady ||
            !activeUserId
        ) {

            return;

        }


        await synchronizeShelves();

        await synchronizeBooks();

        await synchronizeQuotes();

        await synchronizeVocabulary();

        await synchronizeSettings();


        cacheEverything();

    }


    /* ========================================================
       SYNC SHELVES
       ======================================================== */

    async function synchronizeShelves() {

        const api =
            Novellow.supabase;


        if (
            !api?.saveShelf
        ) {

            return;

        }


        for (
            const shelf
            of state.shelves
        ) {

            if (
                !shelf?.id
            ) {
                continue;
            }


            await api.saveShelf(
                shelf
            );


            cloudIds.shelves.add(
                String(
                    shelf.id
                )
            );

        }


        if (
            api.deleteShelf
        ) {

            const localIds =
                idSet(
                    state.shelves
                );


            const deletedIds =
                [
                    ...cloudIds.shelves
                ]
                    .filter(
                        id =>
                            !localIds.has(
                                id
                            )
                    );


            for (
                const id
                of deletedIds
            ) {

                await api.deleteShelf(
                    id
                );


                cloudIds.shelves.delete(
                    id
                );

            }

        }

    }


    /* ========================================================
       SYNC BOOKS
       ======================================================== */

    async function synchronizeBooks() {

        const api =
            Novellow.supabase;


        if (
            !api?.saveBook
        ) {

            return;

        }


        /*
           Save shelves first.

           A book references shelf_id, so its parent shelf needs
           to exist before the book is written.
        */

        await synchronizeShelves();


        for (
            const book
            of state.books
        ) {

            if (
                !book?.id
            ) {
                continue;
            }


            /*
               Don't upload an invalid shelf relationship.

               Unshelved books use null/empty shelf depending on
               the transformation inside supabase.js.
            */

            if (
                book.shelfId &&
                !state.shelves.some(
                    shelf =>
                        String(
                            shelf.id
                        ) ===
                        String(
                            book.shelfId
                        )
                )
            ) {

                console.warn(
                    `Novellow book "${book.title}" references missing shelf ${book.shelfId}.`
                );

            }


            await api.saveBook(
                book
            );


            cloudIds.books.add(
                String(
                    book.id
                )
            );

        }


        if (
            api.deleteBook
        ) {

            const localIds =
                idSet(
                    state.books
                );


            const deletedIds =
                [
                    ...cloudIds.books
                ]
                    .filter(
                        id =>
                            !localIds.has(
                                id
                            )
                    );


            for (
                const id
                of deletedIds
            ) {

                await api.deleteBook(
                    id
                );


                cloudIds.books.delete(
                    id
                );

            }

        }


        cacheBooks();

    }


    /* ========================================================
       SYNC QUOTES
       ======================================================== */

    async function synchronizeQuotes() {

        const api =
            Novellow.supabase;


        if (
            !api?.saveQuote
        ) {

            return;

        }


        for (
            const quote
            of state.quotes
        ) {

            if (
                !quote?.id
            ) {
                continue;
            }


            await api.saveQuote(
                quote
            );


            cloudIds.quotes.add(
                String(
                    quote.id
                )
            );

        }


        if (
            api.deleteQuote
        ) {

            const localIds =
                idSet(
                    state.quotes
                );


            const deletedIds =
                [
                    ...cloudIds.quotes
                ]
                    .filter(
                        id =>
                            !localIds.has(
                                id
                            )
                    );


            for (
                const id
                of deletedIds
            ) {

                await api.deleteQuote(
                    id
                );


                cloudIds.quotes.delete(
                    id
                );

            }

        }

    }


    /* ========================================================
       SYNC VOCABULARY
       ======================================================== */

    async function synchronizeVocabulary() {

        const api =
            Novellow.supabase;


        if (
            !api?.saveVocabularyEntry
        ) {

            return;

        }


        for (
            const word
            of state.vocabulary
        ) {

            if (
                !word?.id
            ) {
                continue;
            }


            await api.saveVocabularyEntry(
                word
            );


            cloudIds.vocabulary.add(
                String(
                    word.id
                )
            );

        }


        if (
            api.deleteVocabularyEntry
        ) {

            const localIds =
                idSet(
                    state.vocabulary
                );


            const deletedIds =
                [
                    ...cloudIds.vocabulary
                ]
                    .filter(
                        id =>
                            !localIds.has(
                                id
                            )
                    );


            for (
                const id
                of deletedIds
            ) {

                await api
                    .deleteVocabularyEntry(
                        id
                    );


                cloudIds.vocabulary.delete(
                    id
                );

            }

        }

    }


    /* ========================================================
       SYNC SETTINGS
       ======================================================== */

    async function synchronizeSettings() {

        const api =
            Novellow.supabase;


        if (
            !api?.saveUserSettings
        ) {

            return;

        }


        await api.saveUserSettings(
            state.settings
        );

    }


    /* ========================================================
       NAVIGATION
       ======================================================== */

    function bindNavigation() {

        H.queryAll?.(
            "[data-section]"
        )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            navigateTo(
                                button.dataset.section
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
                    button.dataset.section ===
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

            top: 0,

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

        } catch {

            window.location.hash =
                sectionId;

        }

    }


    Novellow.navigation = {

        navigateTo

    };


    /* ========================================================
       GLOBAL ACTIONS
       ======================================================== */

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


    /* ========================================================
       PANELS
       ======================================================== */

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


        panel.style
            .pointerEvents =
            "auto";


        document.body
            .classList
            .add(
                "modal-open"
            );

    }


    function closeAllPanels() {

        [
            "themeDrawer",
            "settingsDrawer",
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


        document.body
            .classList
            .remove(
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


    /* ========================================================
       THEME CONTROLS
       ======================================================== */

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
                            card.dataset.theme
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
            )
                .some(
                    theme =>
                        theme.id ===
                        themeId
                );


        if (
            !themeExists
        ) {
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

                if (
                    item.className
                ) {

                    body.classList
                        .remove(
                            item.className
                        );

                }

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
            settings.decorationDensity ||
            "cozy";


        syncThemeControls();

        syncSettingsControls();

    }


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


    /* ========================================================
       SETTINGS
       ======================================================== */

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

        const sort =
            H.getById?.(
                "defaultShelfSort"
            );


        if (sort) {

            sort.value =
                state.settings
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
                        state.settings
                            .annualReadingGoal,
                        20
                    ) ||
                    20
                );

        }

    }


    function setChecked(
        id,
        value
    ) {

        const input =
            H.getById?.(
                id
            );


        if (input) {

            input.checked =
                Boolean(
                    value
                );

        }

    }


    /* ========================================================
       IMPORT / EXPORT
       ======================================================== */

    function bindImportExport() {

        H.bindClick?.(
            "exportLibraryButton",
            exportLibrary
        );


        H.bindClick?.(
            "importLibraryButton",
            () => {

                H.getById?.(
                    "importLibraryInput"
                )
                    ?.click();

            }
        );


        const input =
            H.getById?.(
                "importLibraryInput"
            );


        input?.addEventListener(
            "change",
            handleImportFile
        );

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
                "Import this backup into your current Novellow library?"
            );


        if (!confirmed) {
            return;
        }


        state.shelves =
            normalizeShelves(
                data.shelves ||
                []
            );


        state.books =
            normalizeBooks(
                data.books ||
                []
            );


        state.quotes =
            normalizeQuotes(
                data.quotes ||
                []
            );


        state.vocabulary =
            normalizeVocabulary(
                data.vocabulary ||
                []
            );


        state.settings =
            H.normalizeSettings?.(
                data.settings ||
                {}
            ) ||
            {
                ...CONFIG.defaultSettings
            };


        persistAll();


        applySettings();


        renderEverything();


        closeAllPanels();

    }


    /* ========================================================
       CLEAR LIBRARY
       ======================================================== */

    function clearEntireLibrary() {

        const confirmed =
            H.confirmAction?.(
                "Clear your entire Novellow library? This will remove your shelves and books from your signed-in library."
            );


        if (!confirmed) {
            return;
        }


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


        persistAll();


        applySettings();


        renderEverything();


        closeAllPanels();


        H.showToast?.(
            "Your Novellow library has been cleared.",
            "success"
        );

    }


    /* ========================================================
       FEATURE MODULES
       ======================================================== */

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


    /* ========================================================
       RENDER EVERYTHING
       ======================================================== */

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


    /* ========================================================
       LOADING SCREEN
       ======================================================== */

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

                loadingScreen
                    .classList
                    .add(
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


    /* ========================================================
       UUID
       ======================================================== */

    function isUUID(
        value
    ) {

        return (
            typeof value ===
                "string" &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                .test(
                    value
                )
        );

    }


    function makeUUID() {

        if (
            typeof crypto !==
                "undefined" &&
            typeof crypto.randomUUID ===
                "function"
        ) {

            return crypto
                .randomUUID();

        }


        /*
           Browser fallback.
        */

        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
            .replace(
                /[xy]/g,
                character => {

                    const random =
                        Math.random() *
                        16 |
                        0;


                    const value =
                        character ===
                        "x"
                            ? random
                            : (
                                random &
                                0x3 |
                                0x8
                            );


                    return value
                        .toString(
                            16
                        );

                }
            );

    }


    /* ========================================================
       CLONE
       ======================================================== */

    function clone(
        value
    ) {

        try {

            if (
                typeof structuredClone ===
                "function"
            ) {

                return structuredClone(
                    value
                );

            }

        } catch {
            // Use JSON fallback.
        }


        try {

            return JSON.parse(
                JSON.stringify(
                    value
                )
            );

        } catch {

            return value;

        }

    }


    /* ========================================================
       PUBLIC APP API
       ======================================================== */

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

        hydrateSignedInUser,

        syncNow:
            synchronizeAllToCloud,

        get cloudReady() {

            return cloudReady;

        }

    };


})();
