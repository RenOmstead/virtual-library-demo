/* =========================================================
   NOVELLOW
   HELPERS.JS

   Shared utilities used throughout the application.
   No feature-specific rendering belongs here.
   ========================================================= */


(() => {

    "use strict";


    /* =====================================================
       CONFIG
       ===================================================== */

    const CONFIG =
        window.NOVELLOW_CONFIG ||
        window.SHELFMARK_CONFIG ||
        {};


    const STORAGE =
        CONFIG.storageKeys ||
        {};


    const LEGACY_STORAGE =
        CONFIG.legacyStorageKeys ||
        {};


    /* =====================================================
       GLOBAL NAMESPACE
       ===================================================== */

    window.NOVELLOW =
        window.NOVELLOW ||
        {};


    const Novellow =
        window.NOVELLOW;


    /* =====================================================
       BASIC DOM HELPERS
       ===================================================== */

    function getById(id) {

        return document.getElementById(id);

    }


    function query(selector, root = document) {

        return root.querySelector(selector);

    }


    function queryAll(selector, root = document) {

        return Array.from(
            root.querySelectorAll(selector)
        );

    }


    function show(elementOrId) {

        const element =
            typeof elementOrId === "string"
                ? getById(elementOrId)
                : elementOrId;


        if (!element) {
            return;
        }


        element.hidden = false;

    }


    function hide(elementOrId) {

        const element =
            typeof elementOrId === "string"
                ? getById(elementOrId)
                : elementOrId;


        if (!element) {
            return;
        }


        element.hidden = true;

    }


    function toggleHidden(
        elementOrId,
        shouldHide
    ) {

        if (shouldHide) {

            hide(elementOrId);

        } else {

            show(elementOrId);

        }

    }


    function setText(
        elementOrId,
        value
    ) {

        const element =
            typeof elementOrId === "string"
                ? getById(elementOrId)
                : elementOrId;


        if (!element) {
            return;
        }


        element.textContent =
            value ?? "";

    }


    function setHTML(
        elementOrId,
        html
    ) {

        const element =
            typeof elementOrId === "string"
                ? getById(elementOrId)
                : elementOrId;


        if (!element) {
            return;
        }


        element.innerHTML =
            html ?? "";

    }


    function bindClick(
        id,
        handler
    ) {

        const element =
            getById(id);


        if (!element) {
            return;
        }


        element.addEventListener(
            "click",
            handler
        );

    }


    /* =====================================================
       ID GENERATION
       ===================================================== */

    function createId(prefix = "item") {

        if (
            window.crypto &&
            typeof window.crypto.randomUUID === "function"
        ) {

            return `${prefix}_${window.crypto.randomUUID()}`;

        }


        return [
            prefix,
            Date.now().toString(36),
            Math.random()
                .toString(36)
                .slice(2, 10)
        ].join("_");

    }


    /* =====================================================
       STRING HELPERS
       ===================================================== */

    function cleanString(
        value,
        fallback = ""
    ) {

        if (
            value === null ||
            value === undefined
        ) {
            return fallback;
        }


        return String(value).trim();

    }


    function truncate(
        value,
        maxLength = 100
    ) {

        const string =
            cleanString(value);


        if (
            string.length <=
            maxLength
        ) {
            return string;
        }


        return (
            string.slice(
                0,
                Math.max(
                    0,
                    maxLength - 1
                )
            ) +
            "…"
        );

    }


    function escapeHTML(value) {

        return cleanString(value)
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );

    }


    function normalizeSearch(value) {

        return cleanString(value)
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            );

    }


    /* =====================================================
       NUMBER HELPERS
       ===================================================== */

    function toNumber(
        value,
        fallback = 0
    ) {

        const number =
            Number(value);


        return Number.isFinite(number)
            ? number
            : fallback;

    }


    function clamp(
        value,
        min,
        max
    ) {

        return Math.min(
            max,
            Math.max(
                min,
                value
            )
        );

    }


    function calculatePercent(
        current,
        total
    ) {

        const currentNumber =
            Math.max(
                0,
                toNumber(current)
            );


        const totalNumber =
            Math.max(
                0,
                toNumber(total)
            );


        if (
            totalNumber <= 0
        ) {
            return 0;
        }


        return clamp(
            Math.round(
                (
                    currentNumber /
                    totalNumber
                ) *
                100
            ),
            0,
            100
        );

    }


    function formatNumber(value) {

        return new Intl.NumberFormat(
            undefined
        ).format(
            toNumber(value)
        );

    }


    /* =====================================================
       DATE HELPERS
       ===================================================== */

    function todayISO() {

        const date =
            new Date();


        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );


        return `${year}-${month}-${day}`;

    }


    function nowISO() {

        return new Date()
            .toISOString();

    }


    function parseDate(value) {

        const clean =
            cleanString(value);


        if (!clean) {
            return null;
        }


        const date =
            new Date(
                clean.includes("T")
                    ? clean
                    : `${clean}T12:00:00`
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return null;
        }


        return date;

    }


    function formatDate(
        value,
        options = {}
    ) {

        const date =
            parseDate(value);


        if (!date) {
            return "—";
        }


        const defaults = {
            month:
                "short",

            day:
                "numeric",

            year:
                "numeric"
        };


        return new Intl.DateTimeFormat(
            undefined,
            {
                ...defaults,
                ...options
            }
        ).format(date);

    }


    function dateSortValue(value) {

        const date =
            parseDate(value);


        return date
            ? date.getTime()
            : 0;

    }


    /* =====================================================
       STORAGE
       ===================================================== */

    function readStorage(
        key,
        fallback
    ) {

        if (!key) {
            return fallback;
        }


        try {

            const raw =
                localStorage.getItem(key);


            if (
                raw === null ||
                raw === ""
            ) {
                return fallback;
            }


            return JSON.parse(raw);

        } catch (error) {

            console.warn(
                `Novellow could not read localStorage key "${key}".`,
                error
            );


            return fallback;

        }

    }


    function writeStorage(
        key,
        value
    ) {

        if (!key) {
            return false;
        }


        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );


            return true;

        } catch (error) {

            console.error(
                `Novellow could not save localStorage key "${key}".`,
                error
            );


            showToast(
                "Novellow could not save your changes in this browser.",
                "error"
            );


            return false;

        }

    }


    function removeStorage(key) {

        if (!key) {
            return;
        }


        try {

            localStorage.removeItem(key);

        } catch (error) {

            console.warn(
                `Novellow could not remove localStorage key "${key}".`,
                error
            );

        }

    }


    /* =====================================================
       DATA MIGRATION
       ===================================================== */

    function migrateLegacyStorage() {

        const migrationMap = [

            {
                oldKey:
                    LEGACY_STORAGE.shelves,

                newKey:
                    STORAGE.shelves
            },

            {
                oldKey:
                    LEGACY_STORAGE.books,

                newKey:
                    STORAGE.books
            },

            {
                oldKey:
                    LEGACY_STORAGE.settings,

                newKey:
                    STORAGE.settings
            }

        ];


        let migratedAnything =
            false;


        migrationMap.forEach(
            ({
                oldKey,
                newKey
            }) => {

                if (
                    !oldKey ||
                    !newKey
                ) {
                    return;
                }


                const existingNewValue =
                    localStorage.getItem(
                        newKey
                    );


                const legacyValue =
                    localStorage.getItem(
                        oldKey
                    );


                if (
                    existingNewValue !== null ||
                    legacyValue === null
                ) {
                    return;
                }


                try {

                    JSON.parse(
                        legacyValue
                    );


                    localStorage.setItem(
                        newKey,
                        legacyValue
                    );


                    migratedAnything =
                        true;

                } catch (error) {

                    console.warn(
                        `Legacy Shelfmark data at "${oldKey}" could not be migrated.`,
                        error
                    );

                }

            }
        );


        return migratedAnything;

    }


    /* =====================================================
       DEFAULT OBJECT HELPERS
       ===================================================== */

    function clone(value) {

        if (
            value === undefined
        ) {
            return undefined;
        }


        if (
            typeof structuredClone ===
            "function"
        ) {

            try {

                return structuredClone(
                    value
                );

            } catch (error) {

                // Fall through to JSON clone.

            }

        }


        return JSON.parse(
            JSON.stringify(value)
        );

    }


    function mergeDefaults(
        defaults,
        value
    ) {

        return {
            ...clone(defaults),
            ...(
                value &&
                typeof value === "object"
                    ? value
                    : {}
            )
        };

    }


    /* =====================================================
       NORMALIZE SHELF
       ===================================================== */

    function normalizeShelf(
        shelf = {}
    ) {

        const defaults =
            CONFIG.defaultShelf ||
            {};


        const normalized = {
            id:
                cleanString(
                    shelf.id
                ) ||
                createId("shelf"),

            name:
                cleanString(
                    shelf.name,
                    defaults.name ||
                    "My Bookshelf"
                ),

            description:
                cleanString(
                    shelf.description
                ),

            material:
                cleanString(
                    shelf.material,
                    defaults.material ||
                    "walnut"
                ),

            mood:
                cleanString(
                    shelf.mood,
                    defaults.mood ||
                    "cozy"
                ),

            layout:
                cleanString(
                    shelf.layout,
                    defaults.layout ||
                    "mixed"
                ),

            sort:
                cleanString(
                    shelf.sort,
                    defaults.sort ||
                    "manual"
                ),

            decorations:
                Array.isArray(
                    shelf.decorations
                )
                    ? shelf.decorations.map(
                        normalizeDecoration
                    )
                    : [],

            createdAt:
                cleanString(
                    shelf.createdAt
                ) ||
                nowISO(),

            updatedAt:
                cleanString(
                    shelf.updatedAt
                ) ||
                nowISO()
        };


        return normalized;

    }


    /* =====================================================
       NORMALIZE DECORATION
       ===================================================== */

    function normalizeDecoration(
        decoration
    ) {

        if (
            typeof decoration === "string"
        ) {

            return {
                id:
                    createId(
                        "decor"
                    ),

                type:
                    decoration,

                x:
                    0.5,

                y:
                    0.5,

                scale:
                    1
            };

        }


        const item =
            decoration &&
            typeof decoration === "object"
                ? decoration
                : {};


        return {
            id:
                cleanString(
                    item.id
                ) ||
                createId("decor"),

            type:
                cleanString(
                    item.type ||
                    item.id ||
                    "candle"
                ),

            x:
                clamp(
                    toNumber(
                        item.x,
                        0.5
                    ),
                    0,
                    1
                ),

            y:
                clamp(
                    toNumber(
                        item.y,
                        0.5
                    ),
                    0,
                    1
                ),

            scale:
                clamp(
                    toNumber(
                        item.scale,
                        1
                    ),
                    0.5,
                    2
                )
        };

    }


    /* =====================================================
       NORMALIZE BOOK DESIGN
       ===================================================== */

    function normalizeBookDesign(
        design = {}
    ) {

        const defaults =
            CONFIG.defaultBookDesign ||
            {};


        return {
            style:
                cleanString(
                    design.style,
                    defaults.style ||
                    "classic"
                ),

            spineColor:
                cleanString(
                    design.spineColor,
                    defaults.spineColor ||
                    "#793f55"
                ),

            textColor:
                cleanString(
                    design.textColor,
                    defaults.textColor ||
                    "#f1e3cf"
                ),

            accentColor:
                cleanString(
                    design.accentColor,
                    defaults.accentColor ||
                    "#c39a67"
                ),

            ornament:
                cleanString(
                    design.ornament,
                    defaults.ornament ||
                    "auto"
                ),

            spineFont:
                cleanString(
                    design.spineFont,
                    defaults.spineFont ||
                    "serif"
                ),

            fontSize:
                cleanString(
                    design.fontSize,
                    defaults.fontSize ||
                    "medium"
                ),

            fontWeight:
                cleanString(
                    design.fontWeight,
                    defaults.fontWeight ||
                    "regular"
                ),

            letterSpacing:
                cleanString(
                    design.letterSpacing,
                    defaults.letterSpacing ||
                    "normal"
                ),

            textCase:
                cleanString(
                    design.textCase,
                    defaults.textCase ||
                    "typed"
                ),

            fontStyle:
                cleanString(
                    design.fontStyle,
                    defaults.fontStyle ||
                    "normal"
                ),

            textAlign:
                cleanString(
                    design.textAlign,
                    defaults.textAlign ||
                    "center"
                ),

            titlePanel:
                cleanString(
                    design.titlePanel,
                    defaults.titlePanel ||
                    "none"
                ),

            height:
                cleanString(
                    design.height,
                    defaults.height ||
                    "medium"
                ),

            thickness:
                cleanString(
                    design.thickness,
                    defaults.thickness ||
                    "medium"
                )
        };

    }


    /* =====================================================
       NORMALIZE JOURNAL
       ===================================================== */

    function normalizeJournal(
        journal = {}
    ) {

        const defaults =
            CONFIG.defaultJournal ||
            {};


        const output =
            {};


        Object.keys(
            defaults
        ).forEach(
            section => {

                output[section] =
                    Array.isArray(
                        journal[section]
                    )
                        ? journal[section]
                        : [];

            }
        );


        return output;

    }


    /* =====================================================
       NORMALIZE BOOK
       ===================================================== */

    function normalizeBook(
        book = {}
    ) {

        const designSource =
            book.design ||
            {
                style:
                    book.style,

                spineColor:
                    book.spineColor,

                textColor:
                    book.textColor,

                accentColor:
                    book.accentColor,

                ornament:
                    book.ornament,

                spineFont:
                    book.spineFont,

                fontSize:
                    book.fontSize,

                fontWeight:
                    book.fontWeight,

                letterSpacing:
                    book.letterSpacing,

                textCase:
                    book.textCase,

                fontStyle:
                    book.fontStyle,

                textAlign:
                    book.textAlign,

                titlePanel:
                    book.titlePanel,

                height:
                    book.height,

                thickness:
                    book.thickness
            };


        const pages =
            Math.max(
                0,
                toNumber(
                    book.pages
                )
            );


        const currentPage =
            clamp(
                Math.max(
                    0,
                    toNumber(
                        book.currentPage
                    )
                ),
                0,
                pages > 0
                    ? pages
                    : Number.MAX_SAFE_INTEGER
            );


        const normalized = {

            id:
                cleanString(
                    book.id
                ) ||
                createId("book"),

            title:
                cleanString(
                    book.title,
                    "Untitled Book"
                ),

            author:
                cleanString(
                    book.author
                ),

            genre:
                cleanString(
                    book.genre
                ),

            year:
                cleanString(
                    book.year
                ),

            pages:
                pages,

            isbn:
                cleanString(
                    book.isbn ||
                    book.ISBN
                ),

            series:
                cleanString(
                    book.series
                ),

            shelfId:
                cleanString(
                    book.shelfId ||
                    book.shelf
                ),

            status:
                cleanString(
                    book.status,
                    "want"
                ),

            rating:
                clamp(
                    toNumber(
                        book.rating
                    ),
                    0,
                    5
                ),

            timesRead:
                Math.max(
                    0,
                    toNumber(
                        book.timesRead
                    )
                ),

            started:
                cleanString(
                    book.started ||
                    book.startedDate
                ),

            finished:
                cleanString(
                    book.finished ||
                    book.finishedDate
                ),

            currentPage:
                currentPage,

            cover:
                cleanString(
                    book.cover ||
                    book.coverData ||
                    book.coverUrl
                ),

            design:
                normalizeBookDesign(
                    designSource
                ),

            journal:
                normalizeJournal(
                    book.journal
                ),

            createdAt:
                cleanString(
                    book.createdAt
                ) ||
                nowISO(),

            updatedAt:
                cleanString(
                    book.updatedAt
                ) ||
                nowISO()
        };


        if (
            normalized.status ===
            "finished" &&
            !normalized.finished
        ) {

            normalized.finished =
                todayISO();

        }


        if (
            normalized.status ===
            "finished" &&
            normalized.pages > 0
        ) {

            normalized.currentPage =
                normalized.pages;

        }


        return normalized;

    }


    /* =====================================================
       NORMALIZE QUOTE
       ===================================================== */

    function normalizeQuote(
        quote = {}
    ) {

        return {

            id:
                cleanString(
                    quote.id
                ) ||
                createId("quote"),

            bookId:
                cleanString(
                    quote.bookId
                ),

            text:
                cleanString(
                    quote.text
                ),

            page:
                cleanString(
                    quote.page
                ),

            chapter:
                cleanString(
                    quote.chapter
                ),

            thoughts:
                cleanString(
                    quote.thoughts
                ),

            createdAt:
                cleanString(
                    quote.createdAt
                ) ||
                nowISO(),

            updatedAt:
                cleanString(
                    quote.updatedAt
                ) ||
                nowISO()
        };

    }


    /* =====================================================
       NORMALIZE WORD
       ===================================================== */

    function normalizeWord(
        word = {}
    ) {

        return {

            id:
                cleanString(
                    word.id
                ) ||
                createId("word"),

            word:
                cleanString(
                    word.word
                ),

            definition:
                cleanString(
                    word.definition
                ),

            bookId:
                cleanString(
                    word.bookId
                ),

            page:
                cleanString(
                    word.page
                ),

            partOfSpeech:
                cleanString(
                    word.partOfSpeech
                ),

            context:
                cleanString(
                    word.context
                ),

            createdAt:
                cleanString(
                    word.createdAt
                ) ||
                nowISO(),

            updatedAt:
                cleanString(
                    word.updatedAt
                ) ||
                nowISO()
        };

    }


    /* =====================================================
       LOOKUPS
       ===================================================== */

    function findById(
        collection,
        id
    ) {

        if (
            !Array.isArray(collection) ||
            !id
        ) {
            return null;
        }


        return (
            collection.find(
                item =>
                    item &&
                    item.id === id
            ) ||
            null
        );

    }


    function getShelfById(id) {

        return findById(
            Novellow.state?.shelves,
            id
        );

    }


    function getBookById(id) {

        return findById(
            Novellow.state?.books,
            id
        );

    }


    function getQuoteById(id) {

        return findById(
            Novellow.state?.quotes,
            id
        );

    }


    function getWordById(id) {

        return findById(
            Novellow.state?.vocabulary,
            id
        );

    }


    function getBooksForShelf(
        shelfId
    ) {

        const books =
            Array.isArray(
                Novellow.state?.books
            )
                ? Novellow.state.books
                : [];


        return books.filter(
            book =>
                book.shelfId ===
                shelfId
        );

    }


    /* =====================================================
       BOOK STATUS
       ===================================================== */

    function getStatusConfig(
        statusId
    ) {

        const statuses =
            CONFIG.bookStatuses ||
            [];


        return (
            statuses.find(
                status =>
                    status.id ===
                    statusId
            ) ||
            {
                id:
                    statusId,

                name:
                    cleanString(
                        statusId,
                        "Book"
                    )
            }
        );

    }


    function getStatusName(
        statusId
    ) {

        return getStatusConfig(
            statusId
        ).name;

    }


    /* =====================================================
       ORNAMENT
       ===================================================== */

    function getOrnamentSymbol(
        ornamentId,
        styleId
    ) {

        let resolvedId =
            cleanString(
                ornamentId,
                "auto"
            );


        if (
            resolvedId ===
            "auto"
        ) {

            const style =
                (
                    CONFIG.bookStyles ||
                    []
                ).find(
                    item =>
                        item.id ===
                        styleId
                );


            resolvedId =
                style?.defaultOrnament ||
                "diamond";

        }


        const ornament =
            (
                CONFIG.ornaments ||
                []
            ).find(
                item =>
                    item.id ===
                    resolvedId
            );


        return ornament?.symbol || "";

    }


    /* =====================================================
       TITLE CASE PROCESSING
       ===================================================== */

    function applyTextCase(
        text,
        mode
    ) {

        const value =
            cleanString(text);


        switch (mode) {

            case "uppercase":

                return value.toUpperCase();


            case "lowercase":

                return value.toLowerCase();


            default:

                return value;

        }

    }


    /* =====================================================
       FILE → DATA URL
       ===================================================== */

    function fileToDataURL(file) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                if (!file) {

                    resolve("");

                    return;

                }


                const reader =
                    new FileReader();


                reader.onload =
                    () =>
                        resolve(
                            reader.result ||
                            ""
                        );


                reader.onerror =
                    () =>
                        reject(
                            reader.error ||
                            new Error(
                                "Could not read file."
                            )
                        );


                reader.readAsDataURL(
                    file
                );

            }
        );

    }


    /* =====================================================
       DOWNLOAD JSON
       ===================================================== */

    function downloadJSON(
        data,
        filename =
            "novellow-backup.json"
    ) {

        const json =
            JSON.stringify(
                data,
                null,
                2
            );


        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const anchor =
            document.createElement(
                "a"
            );


        anchor.href =
            url;


        anchor.download =
            filename;


        document.body.appendChild(
            anchor
        );


        anchor.click();


        anchor.remove();


        setTimeout(
            () =>
                URL.revokeObjectURL(
                    url
                ),
            1000
        );

    }


    /* =====================================================
       READ JSON FILE
       ===================================================== */

    function readJSONFile(file) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                if (!file) {

                    reject(
                        new Error(
                            "No file selected."
                        )
                    );

                    return;

                }


                const reader =
                    new FileReader();


                reader.onload =
                    () => {

                        try {

                            const parsed =
                                JSON.parse(
                                    reader.result
                                );


                            resolve(
                                parsed
                            );

                        } catch (error) {

                            reject(
                                new Error(
                                    "That file does not contain valid Novellow JSON."
                                )
                            );

                        }

                    };


                reader.onerror =
                    () =>
                        reject(
                            new Error(
                                "The selected file could not be read."
                            )
                        );


                reader.readAsText(
                    file
                );

            }
        );

    }


    /* =====================================================
       TOAST
       ===================================================== */

    let toastTimer =
        null;


    function showToast(
        message,
        type = ""
    ) {

        const toast =
            getById("toast");


        if (!toast) {

            console.log(
                `Novellow: ${message}`
            );

            return;

        }


        if (toastTimer) {

            clearTimeout(
                toastTimer
            );

        }


        toast.className =
            "toast";


        if (type) {

            toast.classList.add(
                type
            );

        }


        toast.textContent =
            cleanString(message);


        toast.hidden =
            false;


        toastTimer =
            setTimeout(
                () => {

                    toast.hidden =
                        true;

                },
                3200
            );

    }


    /* =====================================================
       CONFIRM
       ===================================================== */

    function confirmAction(
        message
    ) {

        return window.confirm(
            message
        );

    }


    /* =====================================================
       SORT BOOKS
       ===================================================== */

    function sortBooks(
        books,
        mode =
            "manual"
    ) {

        const copy =
            Array.isArray(books)
                ? [...books]
                : [];


        switch (mode) {

            case "title":

                return copy.sort(
                    (
                        a,
                        b
                    ) =>
                        cleanString(
                            a.title
                        ).localeCompare(
                            cleanString(
                                b.title
                            )
                        )
                );


            case "author":

                return copy.sort(
                    (
                        a,
                        b
                    ) =>
                        cleanString(
                            a.author
                        ).localeCompare(
                            cleanString(
                                b.author
                            )
                        )
                );


            case "rating":

                return copy.sort(
                    (
                        a,
                        b
                    ) =>
                        toNumber(
                            b.rating
                        ) -
                        toNumber(
                            a.rating
                        )
                );


            case "finished":

                return copy.sort(
                    (
                        a,
                        b
                    ) =>
                        dateSortValue(
                            b.finished
                        ) -
                        dateSortValue(
                            a.finished
                        )
                );


            case "recent":

                return copy.sort(
                    (
                        a,
                        b
                    ) =>
                        dateSortValue(
                            b.createdAt
                        ) -
                        dateSortValue(
                            a.createdAt
                        )
                );


            default:

                return copy;

        }

    }


    /* =====================================================
       SEARCH BOOKS
       ===================================================== */

    function bookMatchesSearch(
        book,
        search
    ) {

        const needle =
            normalizeSearch(
                search
            );


        if (!needle) {
            return true;
        }


        const haystack =
            [
                book.title,
                book.author,
                book.genre,
                book.series,
                book.isbn
            ]
            .map(
                normalizeSearch
            )
            .join(" ");


        return haystack.includes(
            needle
        );

    }


    /* =====================================================
       EMPTY DATA FACTORY
       ===================================================== */

    function createEmptyState() {

        return {

            shelves:
                [],

            books:
                [],

            quotes:
                [],

            vocabulary:
                [],

            settings:
                mergeDefaults(
                    CONFIG.defaultSettings ||
                    {},
                    {}
                ),

            selectedBookId:
                null,

            selectedJournalSection:
                null,

            currentSection:
                "library",

            pendingCoverData:
                ""

        };

    }


    /* =====================================================
       SAFE DATA NORMALIZATION
       ===================================================== */

    function normalizeCollection(
        collection,
        normalizer
    ) {

        if (
            !Array.isArray(
                collection
            )
        ) {
            return [];
        }


        return collection.map(
            normalizer
        );

    }


    function normalizeSettings(
        settings
    ) {

        return mergeDefaults(
            CONFIG.defaultSettings ||
            {},
            settings
        );

    }


    /* =====================================================
       EXPORT PUBLIC API
       ===================================================== */

    Novellow.helpers = {

        getById,
        query,
        queryAll,
        show,
        hide,
        toggleHidden,
        setText,
        setHTML,
        bindClick,

        createId,

        cleanString,
        truncate,
        escapeHTML,
        normalizeSearch,

        toNumber,
        clamp,
        calculatePercent,
        formatNumber,

        todayISO,
        nowISO,
        parseDate,
        formatDate,
        dateSortValue,

        readStorage,
        writeStorage,
        removeStorage,
        migrateLegacyStorage,

        clone,
        mergeDefaults,

        normalizeShelf,
        normalizeDecoration,
        normalizeBookDesign,
        normalizeJournal,
        normalizeBook,
        normalizeQuote,
        normalizeWord,
        normalizeCollection,
        normalizeSettings,

        findById,
        getShelfById,
        getBookById,
        getQuoteById,
        getWordById,
        getBooksForShelf,

        getStatusConfig,
        getStatusName,

        getOrnamentSymbol,
        applyTextCase,

        fileToDataURL,
        downloadJSON,
        readJSONFile,

        showToast,
        confirmAction,

        sortBooks,
        bookMatchesSearch,

        createEmptyState

    };


})();
