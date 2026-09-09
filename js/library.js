/* =========================================================
   SHELFMARK
   LIBRARY.JS
   COMPLETE REPLACEMENT
   ========================================================= */


/* =========================================================
   CONFIG
   ========================================================= */

const CONFIG =
    window.SHELFMARK_CONFIG ||
    {};


const STORAGE_KEYS = {
    shelves:
        CONFIG.storageKeys?.shelves ||
        "shelfmark_shelves",

    books:
        CONFIG.storageKeys?.books ||
        "shelfmark_books",

    settings:
        CONFIG.storageKeys?.settings ||
        "shelfmark_settings"
};


/* =========================================================
   STATE
   ========================================================= */

let shelves = [];

let books = [];

let settings = {
    theme:
        "haunted",

    candleGlow:
        true,

    dust:
        true,

    rain:
        true,

    oddities:
        true,

    reducedMotion:
        false,

    decorationDensity:
        "cozy"
};


let selectedBookId =
    null;


let selectedJournalSection =
    null;


let pendingCoverData =
    "";


let activeDrag =
    null;


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


function initialize() {

    resetInitialUI();

    loadSettings();

    loadData();

    migrateLegacyBooks();

    applySettings();

    bindControls();

    renderAll();

}


/* =========================================================
   INITIAL UI
   ========================================================= */

function resetInitialUI() {

    [
        "overlay",
        "themeDrawer",
        "shelfDrawer",
        "bookDrawer",
        "bookReveal",
        "readingBook",
        "entryModal",
        "progressModal"
    ]
    .forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );

            if (
                element
            ) {

                element.hidden =
                    true;

            }

        }
    );

}


/* =========================================================
   STORAGE
   ========================================================= */

function loadData() {

    shelves =
        safeParseStorage(
            STORAGE_KEYS.shelves,
            []
        );


    books =
        safeParseStorage(
            STORAGE_KEYS.books,
            []
        );


    shelves =
        Array.isArray(
            shelves
        )
            ? shelves
            : [];


    books =
        Array.isArray(
            books
        )
            ? books
            : [];

}


function loadSettings() {

    const stored =
        safeParseStorage(
            STORAGE_KEYS.settings,
            {}
        );


    settings = {
        ...settings,
        ...stored
    };

}


function saveShelves() {

    localStorage.setItem(
        STORAGE_KEYS.shelves,
        JSON.stringify(
            shelves
        )
    );

}


function saveBooks() {

    localStorage.setItem(
        STORAGE_KEYS.books,
        JSON.stringify(
            books
        )
    );

}


function saveSettings() {

    localStorage.setItem(
        STORAGE_KEYS.settings,
        JSON.stringify(
            settings
        )
    );

}


function safeParseStorage(
    key,
    fallback
) {

    try {

        const raw =
            localStorage.getItem(
                key
            );


        if (
            !raw
        ) {

            return fallback;

        }


        return JSON.parse(
            raw
        );

    } catch (
        error
    ) {

        console.warn(
            `Unable to read ${key}`,
            error
        );


        return fallback;

    }

}


/* =========================================================
   LEGACY MIGRATION
   ========================================================= */

function migrateLegacyBooks() {

    let changed =
        false;


    books =
        books.map(
            book => {

                const normalized =
                    normalizeBook(
                        book
                    );


                if (
                    JSON.stringify(
                        normalized
                    )
                    !==
                    JSON.stringify(
                        book
                    )
                ) {

                    changed =
                        true;

                }


                return normalized;

            }
        );


    shelves =
        shelves.map(
            shelf =>
                normalizeShelf(
                    shelf
                )
        );


    if (
        changed
    ) {

        saveBooks();

    }


    saveShelves();

}


/* =========================================================
   NORMALIZATION
   ========================================================= */

function normalizeShelf(
    shelf
) {

    return {
        id:
            shelf.id ||
            makeId(
                "shelf"
            ),

        name:
            shelf.name ||
            "Untitled Shelf",

        description:
            shelf.description ||
            "",

        material:
            shelf.material ||
            "walnut",

        mood:
            shelf.mood ||
            "cozy",

        layout:
            shelf.layout ||
            "mixed",

        sort:
            shelf.sort ||
            "manual",

        decorations:
            Array.isArray(
                shelf.decorations
            )
                ? shelf.decorations.map(
                    normalizeDecoration
                )
                : []
    };

}


function normalizeDecoration(
    decoration
) {

    if (
        typeof decoration ===
        "string"
    ) {

        return {
            id:
                makeId(
                    "decor"
                ),

            type:
                decoration,

            x:
                50,

            y:
                50,

            scale:
                1,

            rotate:
                0
        };

    }


    return {
        id:
            decoration.id ||
            makeId(
                "decor"
            ),

        type:
            decoration.type ||
            "plant",

        x:
            clamp(
                Number(
                    decoration.x
                ) || 50,
                3,
                97
            ),

        y:
            clamp(
                Number(
                    decoration.y
                ) || 50,
                5,
                95
            ),

        scale:
            Number(
                decoration.scale
            ) || 1,

        rotate:
            Number(
                decoration.rotate
            ) || 0
    };

}


function normalizeBook(
    book
) {

    const defaultDesign =
        CONFIG.defaultBookDesign ||
        {};


    return {
        id:
            book.id ||
            makeId(
                "book"
            ),

        title:
            book.title ||
            "Untitled Book",

        author:
            book.author ||
            "",

        genre:
            book.genre ||
            "",

        year:
            numericOrBlank(
                book.year
            ),

        pages:
            numericOrZero(
                book.pages
            ),

        isbn:
            book.isbn ||
            book.ISBN ||
            "",

        series:
            book.series ||
            "",

        shelf_id:
            book.shelf_id ||
            book.shelfId ||
            "",

        status:
            book.status ||
            "want",

        rating:
            numericOrZero(
                book.rating
            ),

        started:
            book.started ||
            book.start_date ||
            "",

        finished:
            book.finished ||
            book.finish_date ||
            "",

        current_page:
            numericOrZero(
                book.current_page ??
                book.currentPage
            ),

        times_read:
            numericOrZero(
                book.times_read ??
                book.timesRead
            ),

        cover_image:
            book.cover_image ||
            book.coverImage ||
            "",

        style:
            book.style ||
            defaultDesign.style ||
            "classic",

        spineColor:
            book.spineColor ||
            book.spine_color ||
            defaultDesign.spineColor ||
            "#6c2633",

        textColor:
            book.textColor ||
            book.text_color ||
            defaultDesign.textColor ||
            "#eadfca",

        accentColor:
            book.accentColor ||
            book.accent_color ||
            defaultDesign.accentColor ||
            "#b28a4a",

        spineFont:
            book.spineFont ||
            book.spine_font ||
            defaultDesign.spineFont ||
            "serif",

        fontSize:
            book.fontSize ||
            book.font_size ||
            defaultDesign.fontSize ||
            "medium",

        fontWeight:
            book.fontWeight ||
            book.font_weight ||
            defaultDesign.fontWeight ||
            "regular",

        letterSpacing:
            book.letterSpacing ||
            book.letter_spacing ||
            defaultDesign.letterSpacing ||
            "normal",

        textCase:
            book.textCase ||
            book.text_case ||
            defaultDesign.textCase ||
            "typed",

        fontStyle:
            book.fontStyle ||
            book.font_style ||
            defaultDesign.fontStyle ||
            "normal",

        textAlign:
            book.textAlign ||
            book.text_align ||
            defaultDesign.textAlign ||
            "center",

        titlePanel:
            book.titlePanel ||
            book.title_panel ||
            defaultDesign.titlePanel ||
            "none",

        ornament:
            book.ornament ||
            defaultDesign.ornament ||
            "auto",

        height:
            book.height ||
            defaultDesign.height ||
            "medium",

        thickness:
            book.thickness ||
            defaultDesign.thickness ||
            "medium",

        journal:
            normalizeJournal(
                book.journal
            )
    };

}


function normalizeJournal(
    journal
) {

    const source =
        journal ||
        {};


    return {
        overview:
            Array.isArray(
                source.overview
            )
                ? source.overview
                : [],

        notes:
            Array.isArray(
                source.notes
            )
                ? source.notes
                : [],

        thoughts:
            Array.isArray(
                source.thoughts
            )
                ? source.thoughts
                : [],

        words:
            Array.isArray(
                source.words
            )
                ? source.words
                : [],

        quotes:
            Array.isArray(
                source.quotes
            )
                ? source.quotes
                : [],

        characters:
            Array.isArray(
                source.characters
            )
                ? source.characters
                : [],

        themes:
            Array.isArray(
                source.themes
            )
                ? source.themes
                : [],

        questions:
            Array.isArray(
                source.questions
            )
                ? source.questions
                : [],

        review:
            Array.isArray(
                source.review
            )
                ? source.review
                : []
    };

}


/* =========================================================
   SETTINGS
   ========================================================= */

function applySettings() {

    document.body.dataset.theme =
        settings.theme;


    document.body.dataset.decorationDensity =
        settings.decorationDensity;


    document.body.classList.toggle(
        "candle-glow",
        settings.candleGlow
    );


    document.body.classList.toggle(
        "floating-dust",
        settings.dust
    );


    document.body.classList.toggle(
        "rain-enabled",
        settings.rain
    );


    document.body.classList.toggle(
        "ambient-oddities",
        settings.oddities
    );


    document.body.classList.toggle(
        "reduce-motion",
        settings.reducedMotion
    );


    syncSettingControls();

}


function syncSettingControls() {

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


    document
        .querySelectorAll(
            ".theme-card"
        )
        .forEach(
            card => {

                card.classList.toggle(
                    "active",
                    card.dataset.theme ===
                    settings.theme
                );

            }
        );


    const densityRadio =
        document.querySelector(
            `input[name="decorationDensity"][value="${settings.decorationDensity}"]`
        );


    if (
        densityRadio
    ) {

        densityRadio.checked =
            true;

    }

}


/* =========================================================
   BIND CONTROLS
   ========================================================= */

function bindControls() {

    bindClick(
        "sidebarAddBook",
        () =>
            openBookDrawer()
    );


    bindClick(
        "topAddBook",
        () =>
            openBookDrawer()
    );


    bindClick(
        "emptyAddBook",
        () =>
            openBookDrawer()
    );


    bindClick(
        "readingEmptyAddBook",
        () =>
            openBookDrawer()
    );


    bindClick(
        "sidebarAddShelf",
        () =>
            openShelfDrawer()
    );


    bindClick(
        "topAddShelf",
        () =>
            openShelfDrawer()
    );


    bindClick(
        "emptyAddShelf",
        () =>
            openShelfDrawer()
    );


    bindClick(
        "bottomAddShelf",
        () =>
            openShelfDrawer()
    );


    bindClick(
        "openThemeSettings",
        openThemeDrawer
    );


    bindClick(
        "topThemeSettings",
        openThemeDrawer
    );


    bindClick(
        "closeThemeDrawer",
        closeAllPanels
    );


    bindClick(
        "closeShelfDrawer",
        closeAllPanels
    );


    bindClick(
        "closeBookDrawer",
        closeAllPanels
    );


    bindClick(
        "cancelShelf",
        closeAllPanels
    );


    bindClick(
        "cancelBook",
        closeAllPanels
    );


    bindClick(
        "closeBookReveal",
        closeBookReveal
    );


    bindClick(
        "closeReadingBook",
        closeReadingBook
    );


    bindClick(
        "closeEntryModal",
        closeEntryModal
    );


    bindClick(
        "cancelEntry",
        closeEntryModal
    );


    bindClick(
        "closeProgressModal",
        closeProgressModal
    );


    bindClick(
        "cancelProgressUpdate",
        closeProgressModal
    );


    bindClick(
        "editSelectedBook",
        editSelectedBook
    );


    bindClick(
        "openSelectedBook",
        openSelectedBookJournal
    );


    bindClick(
        "backToContents",
        showJournalContents
    );


    bindClick(
        "addJournalEntry",
        openJournalEntryModal
    );


    bindClick(
        "featuredOpenBook",
        openFeaturedJournal
    );


    bindClick(
        "featuredEditProgress",
        openFeaturedProgress
    );


    bindForm(
        "shelfForm",
        saveShelfFromForm
    );


    bindForm(
        "bookForm",
        saveBookFromForm
    );


    bindForm(
        "entryForm",
        saveJournalEntry
    );


    bindForm(
        "progressForm",
        saveProgressUpdate
    );


    bindThemeControls();

    bindSpinePreviewControls();

    bindBookCoverUpload();

    bindJournalButtons();

    bindNavigation();

    bindOverlay();

    bindProgressPreview();

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function bindNavigation() {

    document
        .querySelectorAll(
            '.main-nav .nav-link[href^="#"]'
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    event => {

                        const id =
                            link
                                .getAttribute(
                                    "href"
                                )
                                .slice(
                                    1
                                );


                        const section =
                            document.getElementById(
                                id
                            );


                        if (
                            !section
                        ) {

                            return;

                        }


                        event.preventDefault();


                        section.scrollIntoView({
                            behavior:
                                settings.reducedMotion
                                    ? "auto"
                                    : "smooth",

                            block:
                                "start"
                        });


                        document
                            .querySelectorAll(
                                ".main-nav .nav-link"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );


                        link.classList.add(
                            "active"
                        );

                    }
                );

            }
        );

}


/* =========================================================
   THEME CONTROLS
   ========================================================= */

function bindThemeControls() {

    document
        .querySelectorAll(
            ".theme-card"
        )
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        settings.theme =
                            card.dataset.theme ||
                            "haunted";


                        saveSettings();

                        applySettings();

                    }
                );

            }
        );


    bindCheckboxSetting(
        "settingCandleGlow",
        "candleGlow"
    );


    bindCheckboxSetting(
        "settingDust",
        "dust"
    );


    bindCheckboxSetting(
        "settingRain",
        "rain"
    );


    bindCheckboxSetting(
        "settingOddities",
        "oddities"
    );


    bindCheckboxSetting(
        "settingReducedMotion",
        "reducedMotion"
    );


    document
        .querySelectorAll(
            'input[name="decorationDensity"]'
        )
        .forEach(
            radio => {

                radio.addEventListener(
                    "change",
                    () => {

                        if (
                            !radio.checked
                        ) {

                            return;

                        }


                        settings.decorationDensity =
                            radio.value;


                        saveSettings();

                        applySettings();

                    }
                );

            }
        );

}


function bindCheckboxSetting(
    id,
    property
) {

    const element =
        document.getElementById(
            id
        );


    if (
        !element
    ) {

        return;

    }


    element.addEventListener(
        "change",
        () => {

            settings[property] =
                element.checked;


            saveSettings();

            applySettings();

        }
    );

}


/* =========================================================
   DRAWERS
   ========================================================= */

function openThemeDrawer() {

    closeAllPanels();

    showOverlay();

    showElement(
        "themeDrawer"
    );

}


function openShelfDrawer(
    shelfId = ""
) {

    closeAllPanels();


    const shelf =
        shelves.find(
            item =>
                item.id ===
                shelfId
        );


    resetShelfForm();


    if (
        shelf
    ) {

        populateShelfForm(
            shelf
        );

    }


    populateShelfDrawerTitle(
        Boolean(
            shelf
        )
    );


    showOverlay();

    showElement(
        "shelfDrawer"
    );

}


function openBookDrawer(
    bookId = ""
) {

    closeAllPanels();


    const book =
        books.find(
            item =>
                item.id ===
                bookId
        );


    resetBookForm();

    populateShelfSelect();


    if (
        book
    ) {

        populateBookForm(
            book
        );

    }


    setText(
        "bookDrawerTitle",
        book
            ? "Edit Book"
            : "Add a Book"
    );


    setText(
        "saveBookLabel",
        book
            ? "Save Changes"
            : "Save Book"
    );


    updateSpinePreview();


    showOverlay();

    showElement(
        "bookDrawer"
    );

}


/* =========================================================
   CLOSE PANELS
   ========================================================= */

function closeAllPanels() {

    [
        "themeDrawer",
        "shelfDrawer",
        "bookDrawer"
    ]
    .forEach(
        hideElement
    );


    hideOverlay();

}


function showOverlay() {

    const overlay =
        document.getElementById(
            "overlay"
        );


    if (
        overlay
    ) {

        overlay.hidden =
            false;

    }

}


function hideOverlay() {

    const overlay =
        document.getElementById(
            "overlay"
        );


    if (
        overlay
    ) {

        overlay.hidden =
            true;

    }

}


function bindOverlay() {

    const overlay =
        document.getElementById(
            "overlay"
        );


    if (
        !overlay
    ) {

        return;

    }


    overlay.addEventListener(
        "click",
        closeAllPanels
    );

}


/* =========================================================
   SHELF FORM
   ========================================================= */

function resetShelfForm() {

    const form =
        document.getElementById(
            "shelfForm"
        );


    if (
        form
    ) {

        form.reset();

    }


    setValue(
        "editingShelfId",
        ""
    );


    setValue(
        "shelfMaterial",
        "walnut"
    );


    setValue(
        "shelfMood",
        "cozy"
    );


    setValue(
        "shelfLayout",
        "mixed"
    );


    setValue(
        "shelfSort",
        "manual"
    );


    document
        .querySelectorAll(
            ".decoration-options input[type='checkbox']"
        )
        .forEach(
            input => {

                input.checked =
                    false;

            }
        );

}


function populateShelfForm(
    shelf
) {

    setValue(
        "editingShelfId",
        shelf.id
    );


    setValue(
        "shelfName",
        shelf.name
    );


    setValue(
        "shelfDescription",
        shelf.description
    );


    setValue(
        "shelfMaterial",
        shelf.material
    );


    setValue(
        "shelfMood",
        shelf.mood
    );


    setValue(
        "shelfLayout",
        shelf.layout
    );


    setValue(
        "shelfSort",
        shelf.sort
    );


    const selectedTypes =
        new Set(
            shelf.decorations.map(
                item =>
                    item.type
            )
        );


    document
        .querySelectorAll(
            ".decoration-options input[type='checkbox']"
        )
        .forEach(
            input => {

                input.checked =
                    selectedTypes.has(
                        input.value
                    );

            }
        );

}


function populateShelfDrawerTitle(
    editing
) {

    setText(
        "shelfDrawerTitle",
        editing
            ? "Edit Shelf"
            : "Add a Shelf"
    );


    setText(
        "saveShelfLabel",
        editing
            ? "Save Changes"
            : "Save Shelf"
    );

}


/* =========================================================
   SAVE SHELF
   ========================================================= */

function saveShelfFromForm(
    event
) {

    event.preventDefault();


    const editingId =
        getValue(
            "editingShelfId"
        );


    const existing =
        shelves.find(
            item =>
                item.id ===
                editingId
        );


    const selectedDecorations =
        Array.from(
            document.querySelectorAll(
                ".decoration-options input[type='checkbox']:checked"
            )
        )
        .map(
            input =>
                input.value
        );


    const decorations =
        buildShelfDecorations(
            selectedDecorations,
            existing
        );


    const shelf = {
        id:
            editingId ||
            makeId(
                "shelf"
            ),

        name:
            getValue(
                "shelfName"
            )
            .trim() ||
            "Untitled Shelf",

        description:
            getValue(
                "shelfDescription"
            )
            .trim(),

        material:
            getValue(
                "shelfMaterial"
            ) ||
            "walnut",

        mood:
            getValue(
                "shelfMood"
            ) ||
            "cozy",

        layout:
            getValue(
                "shelfLayout"
            ) ||
            "mixed",

        sort:
            getValue(
                "shelfSort"
            ) ||
            "manual",

        decorations
    };


    if (
        existing
    ) {

        Object.assign(
            existing,
            shelf
        );

    } else {

        shelves.push(
            shelf
        );

    }


    saveShelves();

    closeAllPanels();

    renderAll();

}


/* =========================================================
   DECORATION CREATION
   ========================================================= */

function buildShelfDecorations(
    types,
    existingShelf
) {

    const existing =
        existingShelf?.decorations ||
        [];


    const positions = [
        {
            x: 13,
            y: 76
        },
        {
            x: 88,
            y: 77
        },
        {
            x: 75,
            y: 42
        },
        {
            x: 28,
            y: 47
        },
        {
            x: 92,
            y: 50
        },
        {
            x: 51,
            y: 35
        },
        {
            x: 62,
            y: 74
        },
        {
            x: 39,
            y: 75
        }
    ];


    return types.map(
        (
            type,
            index
        ) => {

            const found =
                existing.find(
                    item =>
                        item.type ===
                        type
                );


            if (
                found
            ) {

                return {
                    ...found
                };

            }


            const position =
                positions[
                    index %
                    positions.length
                ];


            return {
                id:
                    makeId(
                        "decor"
                    ),

                type,

                x:
                    position.x,

                y:
                    position.y,

                scale:
                    1,

                rotate:
                    0
            };

        }
    );

}


/* =========================================================
   BOOK FORM RESET
   ========================================================= */

function resetBookForm() {

    const form =
        document.getElementById(
            "bookForm"
        );


    if (
        form
    ) {

        form.reset();

    }


    pendingCoverData =
        "";


    setValue(
        "editingBookId",
        ""
    );


    setValue(
        "bookStatus",
        "want"
    );


    setValue(
        "bookRating",
        "0"
    );


    setValue(
        "bookTimesRead",
        "0"
    );


    setValue(
        "bookCurrentPage",
        "0"
    );


    setValue(
        "bookStyle",
        "classic"
    );


    setValue(
        "bookSpineColor",
        "#6c2633"
    );


    setValue(
        "bookTextColor",
        "#eadfca"
    );


    setValue(
        "bookAccentColor",
        "#b28a4a"
    );


    setValue(
        "bookSpineOrnament",
        "auto"
    );


    setValue(
        "bookSpineFont",
        "serif"
    );


    setValue(
        "bookSpineFontSize",
        "medium"
    );


    setValue(
        "bookSpineFontWeight",
        "regular"
    );


    setValue(
        "bookSpineLetterSpacing",
        "normal"
    );


    setValue(
        "bookSpineCase",
        "typed"
    );


    setValue(
        "bookSpineFontStyle",
        "normal"
    );


    setValue(
        "bookSpineTextAlign",
        "center"
    );


    setValue(
        "bookSpineTitlePanel",
        "none"
    );


    setValue(
        "bookHeight",
        "medium"
    );


    setValue(
        "bookThickness",
        "medium"
    );

}


/* =========================================================
   POPULATE BOOK FORM
   ========================================================= */

function populateBookForm(
    book
) {

    setValue(
        "editingBookId",
        book.id
    );


    setValue(
        "bookTitle",
        book.title
    );


    setValue(
        "bookAuthor",
        book.author
    );


    setValue(
        "bookGenre",
        book.genre
    );


    setValue(
        "bookYear",
        book.year
    );


    setValue(
        "bookPages",
        book.pages
    );


    setValue(
        "bookISBN",
        book.isbn
    );


    setValue(
        "bookSeries",
        book.series
    );


    setValue(
        "bookShelf",
        book.shelf_id
    );


    setValue(
        "bookStatus",
        book.status
    );


    setValue(
        "bookRating",
        book.rating
    );


    setValue(
        "bookStarted",
        book.started
    );


    setValue(
        "bookFinished",
        book.finished
    );


    setValue(
        "bookCurrentPage",
        book.current_page
    );


    setValue(
        "bookTimesRead",
        book.times_read
    );


    setValue(
        "bookStyle",
        book.style
    );


    setValue(
        "bookSpineColor",
        book.spineColor
    );


    setValue(
        "bookTextColor",
        book.textColor
    );


    setValue(
        "bookAccentColor",
        book.accentColor
    );


    setValue(
        "bookSpineOrnament",
        book.ornament
    );


    setValue(
        "bookSpineFont",
        book.spineFont
    );


    setValue(
        "bookSpineFontSize",
        book.fontSize
    );


    setValue(
        "bookSpineFontWeight",
        book.fontWeight
    );


    setValue(
        "bookSpineLetterSpacing",
        book.letterSpacing
    );


    setValue(
        "bookSpineCase",
        book.textCase
    );


    setValue(
        "bookSpineFontStyle",
        book.fontStyle
    );


    setValue(
        "bookSpineTextAlign",
        book.textAlign
    );


    setValue(
        "bookSpineTitlePanel",
        book.titlePanel
    );


    setValue(
        "bookHeight",
        book.height
    );


    setValue(
        "bookThickness",
        book.thickness
    );


    pendingCoverData =
        "";

}


/* =========================================================
   SHELF SELECT
   ========================================================= */

function populateShelfSelect() {

    const select =
        document.getElementById(
            "bookShelf"
        );


    if (
        !select
    ) {

        return;

    }


    select.innerHTML =
        "";


    if (
        !shelves.length
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            "";


        option.textContent =
            "No shelves yet";


        select.appendChild(
            option
        );


        return;

    }


    shelves.forEach(
        shelf => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                shelf.id;


            option.textContent =
                shelf.name;


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   COVER UPLOAD
   ========================================================= */

function bindBookCoverUpload() {

    const input =
        document.getElementById(
            "bookCoverUpload"
        );


    if (
        !input
    ) {

        return;

    }


    input.addEventListener(
        "change",
        () => {

            const file =
                input.files?.[0];


            if (
                !file
            ) {

                pendingCoverData =
                    "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                () => {

                    pendingCoverData =
                        String(
                            reader.result ||
                            ""
                        );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   READ BOOK FORM
   ========================================================= */

function readBookForm(
    existing = null
) {

    return normalizeBook({
        id:
            getValue(
                "editingBookId"
            ) ||
            makeId(
                "book"
            ),

        title:
            getValue(
                "bookTitle"
            )
            .trim(),

        author:
            getValue(
                "bookAuthor"
            )
            .trim(),

        genre:
            getValue(
                "bookGenre"
            )
            .trim(),

        year:
            getValue(
                "bookYear"
            ),

        pages:
            getValue(
                "bookPages"
            ),

        isbn:
            getValue(
                "bookISBN"
            )
            .trim(),

        series:
            getValue(
                "bookSeries"
            )
            .trim(),

        shelf_id:
            getValue(
                "bookShelf"
            ),

        status:
            getValue(
                "bookStatus"
            ) ||
            "want",

        rating:
            getValue(
                "bookRating"
            ),

        started:
            getValue(
                "bookStarted"
            ),

        finished:
            getValue(
                "bookFinished"
            ),

        current_page:
            getValue(
                "bookCurrentPage"
            ),

        times_read:
            getValue(
                "bookTimesRead"
            ),

        cover_image:
            pendingCoverData ||
            existing?.cover_image ||
            "",

        style:
            getValue(
                "bookStyle"
            ) ||
            "classic",

        spineColor:
            getValue(
                "bookSpineColor"
            ) ||
            "#6c2633",

        textColor:
            getValue(
                "bookTextColor"
            ) ||
            "#eadfca",

        accentColor:
            getValue(
                "bookAccentColor"
            ) ||
            "#b28a4a",

        spineFont:
            getValue(
                "bookSpineFont"
            ) ||
            "serif",

        fontSize:
            getValue(
                "bookSpineFontSize"
            ) ||
            "medium",

        fontWeight:
            getValue(
                "bookSpineFontWeight"
            ) ||
            "regular",

        letterSpacing:
            getValue(
                "bookSpineLetterSpacing"
            ) ||
            "normal",

        textCase:
            getValue(
                "bookSpineCase"
            ) ||
            "typed",

        fontStyle:
            getValue(
                "bookSpineFontStyle"
            ) ||
            "normal",

        textAlign:
            getValue(
                "bookSpineTextAlign"
            ) ||
            "center",

        titlePanel:
            getValue(
                "bookSpineTitlePanel"
            ) ||
            "none",

        ornament:
            getValue(
                "bookSpineOrnament"
            ) ||
            "auto",

        height:
            getValue(
                "bookHeight"
            ) ||
            "medium",

        thickness:
            getValue(
                "bookThickness"
            ) ||
            "medium",

        journal:
            existing?.journal ||
            normalizeJournal()
    });

}


/* =========================================================
   SAVE BOOK
   ========================================================= */

function saveBookFromForm(
    event
) {

    event.preventDefault();


    if (
        !shelves.length
    ) {

        alert(
            "Create a shelf before adding a book."
        );

        closeAllPanels();

        openShelfDrawer();

        return;

    }


    const editingId =
        getValue(
            "editingBookId"
        );


    const existing =
        books.find(
            item =>
                item.id ===
                editingId
        );


    const book =
        readBookForm(
            existing
        );


    if (
        !book.title.trim()
    ) {

        return;

    }


    book.current_page =
        clamp(
            book.current_page,
            0,
            book.pages ||
            Number.MAX_SAFE_INTEGER
        );


    if (
        book.status ===
        "finished"
        &&
        book.pages > 0
    ) {

        book.current_page =
            book.pages;

    }


    if (
        existing
    ) {

        Object.assign(
            existing,
            book
        );

    } else {

        books.push(
            book
        );

    }


    saveBooks();

    closeAllPanels();

    renderAll();

}


/* =========================================================
   SPINE PREVIEW BINDING
   ========================================================= */

function bindSpinePreviewControls() {

    [
        "bookTitle",
        "bookStyle",
        "bookSpineColor",
        "bookTextColor",
        "bookAccentColor",
        "bookSpineOrnament",
        "bookSpineFont",
        "bookSpineFontSize",
        "bookSpineFontWeight",
        "bookSpineLetterSpacing",
        "bookSpineCase",
        "bookSpineFontStyle",
        "bookSpineTextAlign",
        "bookSpineTitlePanel",
        "bookHeight",
        "bookThickness"
    ]
    .forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (
                !element
            ) {

                return;

            }


            element.addEventListener(
                "input",
                updateSpinePreview
            );


            element.addEventListener(
                "change",
                updateSpinePreview
            );

        }
    );

}


/* =========================================================
   UPDATE SPINE PREVIEW
   ========================================================= */

function updateSpinePreview() {

    const preview =
        document.getElementById(
            "bookSpinePreview"
        );


    const title =
        document.getElementById(
            "bookSpinePreviewTitle"
        );


    const ornament =
        document.getElementById(
            "bookSpinePreviewOrnament"
        );


    if (
        !preview ||
        !title ||
        !ornament
    ) {

        return;

    }


    const design =
        getCurrentDesignFromForm();


    preview.className =
        getBookTypographyClasses(
            design,
            "spine-preview-book"
        );


    preview.classList.add(
        `book-style-${design.style}`
    );


    applyBookColors(
        preview,
        design
    );


    title.textContent =
        getValue(
            "bookTitle"
        )
        .trim() ||
        "Book Title";


    ornament.textContent =
        getBookOrnament(
            design
        );


    requestAnimationFrame(
        fitPreviewTitle
    );

}


/* =========================================================
   FORM DESIGN
   ========================================================= */

function getCurrentDesignFromForm() {

    return {
        style:
            getValue(
                "bookStyle"
            ) ||
            "classic",

        spineColor:
            getValue(
                "bookSpineColor"
            ) ||
            "#6c2633",

        textColor:
            getValue(
                "bookTextColor"
            ) ||
            "#eadfca",

        accentColor:
            getValue(
                "bookAccentColor"
            ) ||
            "#b28a4a",

        ornament:
            getValue(
                "bookSpineOrnament"
            ) ||
            "auto",

        spineFont:
            getValue(
                "bookSpineFont"
            ) ||
            "serif",

        fontSize:
            getValue(
                "bookSpineFontSize"
            ) ||
            "medium",

        fontWeight:
            getValue(
                "bookSpineFontWeight"
            ) ||
            "regular",

        letterSpacing:
            getValue(
                "bookSpineLetterSpacing"
            ) ||
            "normal",

        textCase:
            getValue(
                "bookSpineCase"
            ) ||
            "typed",

        fontStyle:
            getValue(
                "bookSpineFontStyle"
            ) ||
            "normal",

        textAlign:
            getValue(
                "bookSpineTextAlign"
            ) ||
            "center",

        titlePanel:
            getValue(
                "bookSpineTitlePanel"
            ) ||
            "none",

        height:
            getValue(
                "bookHeight"
            ) ||
            "medium",

        thickness:
            getValue(
                "bookThickness"
            ) ||
            "medium"
    };

}


/* =========================================================
   TYPOGRAPHY CLASSES
   ========================================================= */

function getBookTypographyClasses(
    book,
    baseClass = ""
) {

    return [
        baseClass,

        `spine-font-${book.spineFont || "serif"}`,

        `spine-size-${book.fontSize || "medium"}`,

        `spine-weight-${book.fontWeight || "regular"}`,

        `spine-spacing-${book.letterSpacing || "normal"}`,

        `spine-case-${book.textCase || "typed"}`,

        `spine-text-${book.fontStyle || "normal"}`,

        `spine-align-${book.textAlign || "center"}`,

        `spine-panel-${book.titlePanel || "none"}`
    ]
    .filter(
        Boolean
    )
    .join(
        " "
    );

}


/* =========================================================
   ORNAMENT
   ========================================================= */

function getBookOrnament(
    book
) {

    const value =
        book.ornament ||
        "auto";


    const ornamentMap = {
        star:
            "✦",

        moon:
            "☾",

        flower:
            "❀",

        leaf:
            "❦",

        diamond:
            "◆",

        heart:
            "♥",

        none:
            ""
    };


    if (
        value !==
        "auto"
    ) {

        return ornamentMap[value] ??
            "";

    }


    const styleMap = {
        classic:
            "◆",

        gothic:
            "☾",

        botanical:
            "❦",

        celestial:
            "✦",

        floral:
            "❀",

        pastel:
            "♥",

        minimal:
            "",

        leather:
            "◆",

        academia:
            "✦",

        storybook:
            "❦"
    };


    return styleMap[
        book.style
    ] ||
    "✦";

}


/* =========================================================
   BOOK COLORS
   ========================================================= */

function applyBookColors(
    element,
    book
) {

    if (
        !element
    ) {

        return;

    }


    element.style.setProperty(
        "--book-color",
        book.spineColor ||
        "#6c2633"
    );


    element.style.setProperty(
        "--book-text",
        book.textColor ||
        "#eadfca"
    );


    element.style.setProperty(
        "--book-accent",
        book.accentColor ||
        "#b28a4a"
    );

}


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function renderAll() {

    renderLibrary();

    renderReadingNow();

    renderStats();

}


/* =========================================================
   RENDER LIBRARY
   ========================================================= */

function renderLibrary() {

    const container =
        document.getElementById(
            "shelfContainer"
        );


    const empty =
        document.getElementById(
            "libraryEmpty"
        );


    const addShelf =
        document.getElementById(
            "bottomAddShelf"
        );


    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    updateLibrarySummary();


    if (
        !shelves.length
    ) {

        if (
            empty
        ) {

            empty.hidden =
                false;

        }


        if (
            addShelf
        ) {

            addShelf.hidden =
                true;

        }


        return;

    }


    if (
        empty
    ) {

        empty.hidden =
            true;

    }


    if (
        addShelf
    ) {

        addShelf.hidden =
            false;

    }


    shelves.forEach(
        shelf => {

            container.appendChild(
                createShelfElement(
                    shelf
                )
            );

        }
    );


    requestAnimationFrame(
        fitAllSpineTitles
    );

}


/* =========================================================
   LIBRARY SUMMARY
   ========================================================= */

function updateLibrarySummary() {

    setText(
        "bookCount",
        books.length
    );


    setText(
        "readingCount",
        books.filter(
            book =>
                book.status ===
                "reading"
        ).length
    );


    setText(
        "finishedCount",
        books.filter(
            book =>
                book.status ===
                "finished"
        ).length
    );

}


/* =========================================================
   CREATE SHELF
   ========================================================= */

function createShelfElement(
    shelf
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        [
            "library-shelf",
            `shelf-${shelf.material}`,
            `shelf-mood-${shelf.mood}`,
            `shelf-layout-${shelf.layout}`
        ]
        .join(
            " "
        );


    article.dataset.shelfId =
        shelf.id;


    const shelfBooks =
        getSortedBooksForShelf(
            shelf
        );


    article.innerHTML = `
        <div class="shelf-header">

            <div class="shelf-header-copy">

                <h2>
                    ${escapeHTML(
                        shelf.name
                    )}
                </h2>

                <p>
                    ${
                        escapeHTML(
                            shelf.description
                        )
                        ||
                        "A little corner of the library."
                    }
                </p>

            </div>

            <div class="shelf-actions">

                <button
                    class="shelf-action-button"
                    type="button"
                    data-action="add-book"
                >
                    + Book
                </button>

                <button
                    class="shelf-action-button"
                    type="button"
                    data-action="edit-shelf"
                >
                    Edit
                </button>

                <button
                    class="shelf-action-button"
                    type="button"
                    data-action="delete-shelf"
                >
                    Delete
                </button>

            </div>

        </div>

        <div class="shelf-body">

            <div class="shelf-books-row"></div>

            <div class="shelf-decoration-layer"></div>

            ${
                shelfBooks.length
                    ? ""
                    : `
                        <div class="empty-shelf-message">

                            <span>
                                This shelf is waiting for a book.
                            </span>

                            <button
                                type="button"
                                data-action="empty-add-book"
                            >
                                Add a Book
                            </button>

                        </div>
                    `
            }

            <div class="shelf-board"></div>

        </div>
    `;


    const bookRow =
        article.querySelector(
            ".shelf-books-row"
        );


    shelfBooks.forEach(
        book => {

            bookRow.appendChild(
                createBookElement(
                    book
                )
            );

        }
    );


    const decorationLayer =
        article.querySelector(
            ".shelf-decoration-layer"
        );


    shelf.decorations.forEach(
        decoration => {

            decorationLayer.appendChild(
                createDecorationElement(
                    shelf,
                    decoration
                )
            );

        }
    );


    const addBookButton =
        article.querySelector(
            '[data-action="add-book"]'
        );


    const emptyAddBookButton =
        article.querySelector(
            '[data-action="empty-add-book"]'
        );


    const editButton =
        article.querySelector(
            '[data-action="edit-shelf"]'
        );


    const deleteButton =
        article.querySelector(
            '[data-action="delete-shelf"]'
        );


    addBookButton?.addEventListener(
        "click",
        () => {

            openBookDrawer();

            setValue(
                "bookShelf",
                shelf.id
            );

            updateSpinePreview();

        }
    );


    emptyAddBookButton?.addEventListener(
        "click",
        () => {

            openBookDrawer();

            setValue(
                "bookShelf",
                shelf.id
            );

            updateSpinePreview();

        }
    );


    editButton?.addEventListener(
        "click",
        () =>
            openShelfDrawer(
                shelf.id
            )
    );


    deleteButton?.addEventListener(
        "click",
        () =>
            deleteShelf(
                shelf.id
            )
    );


    return article;

}


/* =========================================================
   SORT BOOKS
   ========================================================= */

function getSortedBooksForShelf(
    shelf
) {

    const result =
        books.filter(
            book =>
                book.shelf_id ===
                shelf.id
        );


    if (
        shelf.sort ===
        "title"
    ) {

        return result.sort(
            (
                a,
                b
            ) =>
                a.title.localeCompare(
                    b.title
                )
        );

    }


    if (
        shelf.sort ===
        "author"
    ) {

        return result.sort(
            (
                a,
                b
            ) =>
                a.author.localeCompare(
                    b.author
                )
        );

    }


    if (
        shelf.sort ===
        "rating"
    ) {

        return result.sort(
            (
                a,
                b
            ) =>
                b.rating -
                a.rating
        );

    }


    if (
        shelf.sort ===
        "finished"
    ) {

        return result.sort(
            (
                a,
                b
            ) =>
                String(
                    b.finished
                )
                .localeCompare(
                    String(
                        a.finished
                    )
                )
        );

    }


    return result;

}


/* =========================================================
   DELETE SHELF
   ========================================================= */

function deleteShelf(
    shelfId
) {

    const shelf =
        shelves.find(
            item =>
                item.id ===
                shelfId
        );


    if (
        !shelf
    ) {

        return;

    }


    const shelfBooks =
        books.filter(
            book =>
                book.shelf_id ===
                shelfId
        );


    let message =
        `Delete "${shelf.name}"?`;


    if (
        shelfBooks.length
    ) {

        message +=
            `\n\nThis shelf contains ${shelfBooks.length} book(s). The books will also be deleted.`;

    }


    if (
        !confirm(
            message
        )
    ) {

        return;

    }


    shelves =
        shelves.filter(
            item =>
                item.id !==
                shelfId
        );


    books =
        books.filter(
            book =>
                book.shelf_id !==
                shelfId
        );


    saveShelves();

    saveBooks();

    renderAll();

}


/* =========================================================
   CREATE BOOK
   ========================================================= */

function createBookElement(
    book
) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        getBookTypographyClasses(
            book,
            "shelf-book"
        );


    wrapper.classList.add(
        `book-height-${book.height}`,
        `book-thickness-${book.thickness}`
    );


    wrapper.dataset.bookId =
        book.id;


    wrapper.setAttribute(
        "role",
        "button"
    );


    wrapper.setAttribute(
        "tabindex",
        "0"
    );


    wrapper.setAttribute(
        "aria-label",
        `Open ${book.title}`
    );


    wrapper.innerHTML = `
        <div
            class="
                book-spine
                book-style-${escapeHTML(
                    book.style
                )}
            "
        >

            <span class="book-edge-top"></span>

            <span class="book-edge-bottom"></span>

            <span class="binding-band band-top"></span>

            <span class="binding-band band-bottom"></span>

            <div class="spine-inner">

                <div class="spine-title-panel">

                    <span class="spine-title">
                        ${escapeHTML(
                            book.title
                        )}
                    </span>

                </div>

                <span class="spine-ornament">
                    ${escapeHTML(
                        getBookOrnament(
                            book
                        )
                    )}
                </span>

            </div>

        </div>
    `;


    const spine =
        wrapper.querySelector(
            ".book-spine"
        );


    applyBookColors(
        spine,
        book
    );


    wrapper.addEventListener(
        "click",
        () =>
            openBookReveal(
                book.id
            )
    );


    wrapper.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
                ||
                event.key ===
                " "
            ) {

                event.preventDefault();

                openBookReveal(
                    book.id
                );

            }

        }
    );


    requestAnimationFrame(
        () =>
            fitSpineTitle(
                wrapper
            )
    );


    return wrapper;

}


/* =========================================================
   TITLE AUTO-FIT
   ========================================================= */

function fitAllSpineTitles() {

    document
        .querySelectorAll(
            ".shelf-book"
        )
        .forEach(
            fitSpineTitle
        );

}


function fitSpineTitle(
    bookElement
) {

    const title =
        bookElement.querySelector(
            ".spine-title"
        );


    const panel =
        bookElement.querySelector(
            ".spine-title-panel"
        );


    if (
        !title ||
        !panel
    ) {

        return;

    }


    title.style.fontSize =
        "";


    title.style.letterSpacing =
        "";


    const computed =
        window.getComputedStyle(
            title
        );


    let size =
        parseFloat(
            computed.fontSize
        );


    if (
        !size ||
        Number.isNaN(
            size
        )
    ) {

        size =
            8;

    }


    const minimum =
        5.25;


    let safety =
        40;


    while (
        safety > 0
        &&
        size > minimum
        &&
        title.getBoundingClientRect().height >
            panel.getBoundingClientRect().height
    ) {

        size -=
            0.25;


        title.style.fontSize =
            `${size}px`;


        safety -=
            1;

    }


    if (
        title.getBoundingClientRect().height >
        panel.getBoundingClientRect().height
    ) {

        title.style.letterSpacing =
            "-0.04em";

    }

}


function fitPreviewTitle() {

    const title =
        document.querySelector(
            ".spine-preview-title"
        );


    const panel =
        document.querySelector(
            ".spine-preview-title-panel"
        );


    if (
        !title ||
        !panel
    ) {

        return;

    }


    title.style.fontSize =
        "";


    title.style.letterSpacing =
        "";


    const computed =
        window.getComputedStyle(
            title
        );


    let size =
        parseFloat(
            computed.fontSize
        ) ||
        8;


    const minimum =
        5.25;


    let safety =
        40;


    while (
        safety > 0
        &&
        size > minimum
        &&
        title.getBoundingClientRect().height >
            panel.getBoundingClientRect().height
    ) {

        size -=
            0.25;


        title.style.fontSize =
            `${size}px`;


        safety -=
            1;

    }


    if (
        title.getBoundingClientRect().height >
        panel.getBoundingClientRect().height
    ) {

        title.style.letterSpacing =
            "-0.04em";

    }

}


/* =========================================================
   DECORATION ELEMENT
   ========================================================= */

function createDecorationElement(
    shelf,
    decoration
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        [
            "shelf-decoration",
            "draggable-decoration",
            `decor-${decoration.type}`
        ]
        .join(
            " "
        );


    element.dataset.decorationId =
        decoration.id;


    element.dataset.shelfId =
        shelf.id;


    element.style.left =
        `${decoration.x}%`;


    element.style.top =
        `${decoration.y}%`;


    element.innerHTML =
        getDecorationArtwork(
            decoration.type
        );


    applyDecorationTransform(
        element,
        decoration
    );


    bindDecorationDrag(
        element,
        shelf,
        decoration
    );


    element.addEventListener(
        "dblclick",
        event => {

            event.stopPropagation();


            cycleDecorationScale(
                decoration
            );


            applyDecorationTransform(
                element,
                decoration
            );


            saveShelves();

        }
    );


    return element;

}


/* =========================================================
   DECOR TRANSFORM
   ========================================================= */

function applyDecorationTransform(
    element,
    decoration
) {

    element.style.setProperty(
        "--decoration-scale",
        decoration.scale
    );


    element.style.setProperty(
        "--decoration-rotation",
        `${decoration.rotate}deg`
    );

}


/* =========================================================
   DECORATION DRAG
   ========================================================= */

function bindDecorationDrag(
    element,
    shelf,
    decoration
) {

    element.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            event.stopPropagation();


            const body =
                element.closest(
                    ".shelf-body"
                );


            if (
                !body
            ) {

                return;

            }


            element.setPointerCapture?.(
                event.pointerId
            );


            activeDrag = {
                element,
                shelf,
                decoration,
                body,
                pointerId:
                    event.pointerId
            };

        }
    );


    element.addEventListener(
        "pointermove",
        event => {

            if (
                !activeDrag ||
                activeDrag.element !==
                element
            ) {

                return;

            }


            const rect =
                activeDrag.body
                    .getBoundingClientRect();


            const x =
                (
                    (
                        event.clientX -
                        rect.left
                    )
                    /
                    rect.width
                )
                *
                100;


            const y =
                (
                    (
                        event.clientY -
                        rect.top
                    )
                    /
                    rect.height
                )
                *
                100;


            decoration.x =
                clamp(
                    x,
                    3,
                    97
                );


            decoration.y =
                clamp(
                    y,
                    4,
                    94
                );


            element.style.left =
                `${decoration.x}%`;


            element.style.top =
                `${decoration.y}%`;

        }
    );


    const endDrag =
        event => {

            if (
                !activeDrag ||
                activeDrag.element !==
                element
            ) {

                return;

            }


            try {

                element.releasePointerCapture?.(
                    event.pointerId
                );

            } catch (
                error
            ) {

                // Safe no-op.

            }


            activeDrag =
                null;


            saveShelves();

        };


    element.addEventListener(
        "pointerup",
        endDrag
    );


    element.addEventListener(
        "pointercancel",
        endDrag
    );

}


/* =========================================================
   DECORATION SCALE
   ========================================================= */

function cycleDecorationScale(
    decoration
) {

    const scales = [
        0.75,
        1,
        1.25,
        1.5
    ];


    const currentIndex =
        scales.findIndex(
            value =>
                Math.abs(
                    value -
                    decoration.scale
                )
                <
                0.01
        );


    decoration.scale =
        scales[
            (
                currentIndex +
                1
            )
            %
            scales.length
        ];

}


/* =========================================================
   DECORATION ARTWORK
   ========================================================= */

function getDecorationArtwork(
    type
) {

    const art = {


        cat: `
            <span class="decor-shadow"></span>

            <span class="cat-tail"></span>

            <span class="cat-body"></span>

            <span class="cat-chest"></span>

            <span class="cat-head">

                <span class="cat-ear left">
                    <span class="cat-ear-inner"></span>
                </span>

                <span class="cat-ear right">
                    <span class="cat-ear-inner"></span>
                </span>

                <span class="cat-eye left"></span>

                <span class="cat-eye right"></span>

                <span class="cat-nose"></span>

                <span class="cat-mouth"></span>

                <span class="cat-whisker left"></span>

                <span class="cat-whisker right"></span>

            </span>
        `,


        mushroom: `
            <span class="mushroom-shadow"></span>

            <span class="mushroom-stem"></span>

            <span class="mushroom-gills"></span>

            <span class="mushroom-cap"></span>

            <span class="mushroom-cap-highlight"></span>
        `,


        plant: `
            <span class="decor-shadow"></span>

            <span class="plant-stem stem-a"></span>

            <span class="plant-stem stem-b"></span>

            <span class="plant-stem stem-c"></span>

            <span class="plant-leaf leaf-1"></span>

            <span class="plant-leaf leaf-2"></span>

            <span class="plant-leaf leaf-3"></span>

            <span class="plant-leaf leaf-4"></span>

            <span class="plant-leaf leaf-5"></span>

            <span class="plant-pot"></span>

            <span class="plant-pot-rim"></span>
        `,


        flowers: `
            <span class="decor-shadow"></span>

            <span class="flower-stem stem-1"></span>

            <span class="flower-stem stem-2"></span>

            <span class="flower-stem stem-3"></span>

            ${createFlowerMarkup(
                "one"
            )}

            ${createFlowerMarkup(
                "two"
            )}

            ${createFlowerMarkup(
                "three"
            )}
        `,


        candle: `
            <span class="decor-shadow"></span>

            <span class="candle-glow"></span>

            <span class="candle-body"></span>

            <span class="candle-top"></span>

            <span class="candle-drip one"></span>

            <span class="candle-drip two"></span>

            <span class="candle-wick"></span>

            <span class="candle-flame"></span>
        `,


        pumpkin: `
            <span class="decor-shadow"></span>

            <span class="pumpkin-lobe outer-left"></span>

            <span class="pumpkin-lobe left"></span>

            <span class="pumpkin-lobe center"></span>

            <span class="pumpkin-lobe right"></span>

            <span class="pumpkin-lobe outer-right"></span>

            <span class="pumpkin-highlight"></span>

            <span class="pumpkin-stem"></span>
        `,


        mug: `
            <span class="decor-shadow"></span>

            <span class="steam steam-1"></span>

            <span class="steam steam-2"></span>

            <span class="mug-handle"></span>

            <span class="mug-body"></span>
        `,


        ghost: `
            <span class="ghost-glow"></span>

            <span class="ghost-body"></span>

            <span class="ghost-eye left"></span>

            <span class="ghost-eye right"></span>

            <span class="ghost-mouth"></span>
        `,


        bat: `
            <span class="decor-shadow"></span>

            <span class="bat-wing left"></span>

            <span class="bat-wing right"></span>

            <span class="bat-body"></span>

            <span class="bat-head"></span>
        `,


        goblin: `
            <span class="decor-shadow"></span>

            <span class="goblin-body"></span>

            <span class="goblin-ear left"></span>

            <span class="goblin-ear right"></span>

            <span class="goblin-head"></span>

            <span class="goblin-eye left"></span>

            <span class="goblin-eye right"></span>

            <span class="goblin-smile"></span>
        `,


        moss: `
            <span class="decor-shadow"></span>

            <span class="moss-clump moss-1"></span>

            <span class="moss-clump moss-2"></span>

            <span class="moss-clump moss-3"></span>
        `,


        potion: `
            <span class="decor-shadow"></span>

            <span class="potion-neck"></span>

            <span class="potion-bottle">

                <span class="potion-liquid"></span>

            </span>

            <span class="potion-shine"></span>

            <span class="potion-cork"></span>
        `,


        crystal: `
            <span class="decor-shadow"></span>

            <span class="crystal-glow"></span>

            <span class="crystal-main"></span>

            <span class="crystal-face"></span>
        `,


        raven: `
            <span class="decor-shadow"></span>

            <span class="raven-body"></span>

            <span class="raven-wing"></span>

            <span class="raven-head"></span>

            <span class="raven-beak"></span>

            <span class="raven-eye"></span>
        `,


        stars: `
            <span class="star star-1">✦</span>

            <span class="star star-2">✧</span>

            <span class="star star-3">✦</span>
        `
    };


    return art[type] ||
        `
            <span class="decoration-symbol">
                ✦
            </span>
        `;

}


/* =========================================================
   FLOWER MARKUP
   ========================================================= */

function createFlowerMarkup(
    className
) {

    return `
        <span class="flower ${className}">

            <span class="petal"></span>

            <span class="petal"></span>

            <span class="petal"></span>

            <span class="petal"></span>

            <span class="petal"></span>

            <span class="flower-center"></span>

        </span>
    `;

}


/* =========================================================
   BOOK REVEAL
   ========================================================= */

function openBookReveal(
    bookId
) {

    const book =
        books.find(
            item =>
                item.id ===
                bookId
        );


    if (
        !book
    ) {

        return;

    }


    selectedBookId =
        book.id;


    renderRevealCover(
        book
    );


    setText(
        "revealStatus",
        readableStatus(
            book.status
        )
    );


    setText(
        "revealTitle",
        book.title
    );


    setText(
        "revealAuthor",
        book.author ||
        "Unknown Author"
    );


    setText(
        "revealStarted",
        formatDate(
            book.started
        )
    );


    setText(
        "revealFinished",
        formatDate(
            book.finished
        )
    );


    setText(
        "revealPageCount",
        book.pages
            ? `${book.current_page} / ${book.pages}`
            : "—"
    );


    setText(
        "revealRating",
        book.rating
            ? "★".repeat(
                book.rating
            )
            : "Not rated"
    );


    const percent =
        calculateProgress(
            book
        );


    setText(
        "revealPercent",
        `${percent}%`
    );


    setWidth(
        "revealProgressBar",
        percent
    );


    setProgressBookmark(
        "progressBookmark",
        percent
    );


    document.getElementById(
        "bookReveal"
    ).hidden =
        false;


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   REVEAL COVER
   ========================================================= */

function renderRevealCover(
    book
) {

    const container =
        document.getElementById(
            "revealCover"
        );


    renderCoverIntoElement(
        container,
        book
    );

}


/* =========================================================
   CLOSE REVEAL
   ========================================================= */

function closeBookReveal() {

    hideElement(
        "bookReveal"
    );


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   EDIT SELECTED
   ========================================================= */

function editSelectedBook() {

    const id =
        selectedBookId;


    closeBookReveal();


    if (
        id
    ) {

        openBookDrawer(
            id
        );

    }

}


/* =========================================================
   OPEN SELECTED JOURNAL
   ========================================================= */

function openSelectedBookJournal() {

    if (
        !selectedBookId
    ) {

        return;

    }


    closeBookReveal();

    openReadingBook(
        selectedBookId
    );

}


/* =========================================================
   OPEN READING BOOK
   ========================================================= */

function openReadingBook(
    bookId
) {

    const book =
        books.find(
            item =>
                item.id ===
                bookId
        );


    if (
        !book
    ) {

        return;

    }


    selectedBookId =
        book.id;


    selectedJournalSection =
        null;


    renderJournalBookInfo(
        book
    );


    showJournalContents();


    document.getElementById(
        "readingBook"
    ).hidden =
        false;


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE JOURNAL
   ========================================================= */

function closeReadingBook() {

    hideElement(
        "readingBook"
    );


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   JOURNAL INFO
   ========================================================= */

function renderJournalBookInfo(
    book
) {

    setText(
        "journalBookTitle",
        book.title
    );


    setText(
        "journalBookAuthor",
        book.author ||
        "Unknown Author"
    );


    setText(
        "journalStatus",
        readableStatus(
            book.status
        )
    );


    setText(
        "journalStarted",
        formatDate(
            book.started
        )
    );


    setText(
        "journalFinished",
        formatDate(
            book.finished
        )
    );


    setText(
        "journalPages",
        book.pages
            ? `${book.current_page} / ${book.pages}`
            : "—"
    );


    renderCoverIntoElement(
        document.getElementById(
            "journalCover"
        ),
        book
    );

}


/* =========================================================
   JOURNAL BUTTONS
   ========================================================= */

function bindJournalButtons() {

    document
        .querySelectorAll(
            "[data-journal-section]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        openJournalSection(
                            button.dataset.journalSection
                        )
                );

            }
        );

}


/* =========================================================
   JOURNAL CONTENTS
   ========================================================= */

function showJournalContents() {

    selectedJournalSection =
        null;


    const contents =
        document.getElementById(
            "journalContents"
        );


    const section =
        document.getElementById(
            "journalSection"
        );


    if (
        contents
    ) {

        contents.hidden =
            false;

    }


    if (
        section
    ) {

        section.hidden =
            true;

    }

}


/* =========================================================
   OPEN JOURNAL SECTION
   ========================================================= */

function openJournalSection(
    sectionName
) {

    const book =
        getSelectedBook();


    if (
        !book
    ) {

        return;

    }


    selectedJournalSection =
        sectionName;


    const contents =
        document.getElementById(
            "journalContents"
        );


    const section =
        document.getElementById(
            "journalSection"
        );


    if (
        contents
    ) {

        contents.hidden =
            true;

    }


    if (
        section
    ) {

        section.hidden =
            false;

    }


    const labels =
        getJournalSectionMeta(
            sectionName
        );


    setText(
        "journalSectionLabel",
        labels.label
    );


    setText(
        "journalSectionTitle",
        labels.title
    );


    renderJournalEntries(
        book,
        sectionName
    );

}


/* =========================================================
   JOURNAL META
   ========================================================= */

function getJournalSectionMeta(
    section
) {

    const sections = {

        overview: {
            label:
                "OVERVIEW",

            title:
                "About this book"
        },

        notes: {
            label:
                "NOTES",

            title:
                "Things worth remembering"
        },

        thoughts: {
            label:
                "THOUGHTS",

            title:
                "What this book made me think about"
        },

        words: {
            label:
                "WORD STUDY",

            title:
                "Words I want to keep"
        },

        quotes: {
            label:
                "QUOTES",

            title:
                "Lines worth saving"
        },

        characters: {
            label:
                "CHARACTERS",

            title:
                "People inside the story"
        },

        themes: {
            label:
                "THEMES",

            title:
                "Ideas running underneath"
        },

        questions: {
            label:
                "QUESTIONS",

            title:
                "Things I am still wondering"
        },

        review: {
            label:
                "REVIEW",

            title:
                "What I thought in the end"
        }

    };


    return sections[section] ||
        {
            label:
                "JOURNAL",

            title:
                "Reading Journal"
        };

}


/* =========================================================
   JOURNAL ENTRIES
   ========================================================= */

function renderJournalEntries(
    book,
    sectionName
) {

    const container =
        document.getElementById(
            "journalEntries"
        );


    if (
        !container
    ) {

        return;

    }


    const entries =
        book.journal?.[
            sectionName
        ] ||
        [];


    container.innerHTML =
        "";


    if (
        !entries.length
    ) {

        container.innerHTML = `
            <div class="journal-empty">

                <p>
                    Nothing has been written here yet.
                </p>

            </div>
        `;

        return;

    }


    entries.forEach(
        entry => {

            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "journal-entry";


            article.innerHTML =
                renderJournalEntryContent(
                    sectionName,
                    entry
                );


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";


            deleteButton.className =
                "journal-entry-delete";


            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                () =>
                    deleteJournalEntry(
                        sectionName,
                        entry.id
                    )
            );


            article.appendChild(
                deleteButton
            );


            container.appendChild(
                article
            );

        }
    );

}


/* =========================================================
   JOURNAL ENTRY CONTENT
   ========================================================= */

function renderJournalEntryContent(
    section,
    entry
) {

    if (
        section ===
        "words"
    ) {

        return `
            <span class="journal-entry-meta">
                ${
                    escapeHTML(
                        entry.page
                            ? `Page ${entry.page}`
                            : ""
                    )
                }
            </span>

            <h3>
                ${escapeHTML(
                    entry.word ||
                    "Word"
                )}
            </h3>

            <p>
                ${escapeHTML(
                    entry.definition ||
                    ""
                )}
            </p>

            ${
                entry.context
                    ? `
                        <blockquote>
                            ${escapeHTML(
                                entry.context
                            )}
                        </blockquote>
                    `
                    : ""
            }
        `;

    }


    if (
        section ===
        "quotes"
    ) {

        return `
            <span class="journal-entry-meta">
                ${
                    escapeHTML(
                        entry.page
                            ? `Page ${entry.page}`
                            : ""
                    )
                }
            </span>

            <blockquote>
                ${escapeHTML(
                    entry.quote ||
                    ""
                )}
            </blockquote>

            ${
                entry.thought
                    ? `
                        <p>
                            ${escapeHTML(
                                entry.thought
                            )}
                        </p>
                    `
                    : ""
            }
        `;

    }


    if (
        section ===
        "characters"
    ) {

        return `
            <h3>
                ${escapeHTML(
                    entry.name ||
                    "Character"
                )}
            </h3>

            <p>
                ${escapeHTML(
                    entry.notes ||
                    ""
                )}
            </p>
        `;

    }


    if (
        section ===
        "review"
    ) {

        return `
            ${
                entry.rating
                    ? `
                        <div class="journal-rating">
                            ${"★".repeat(
                                Number(
                                    entry.rating
                                )
                            )}
                        </div>
                    `
                    : ""
            }

            <p>
                ${escapeHTML(
                    entry.text ||
                    ""
                )}
            </p>
        `;

    }


    return `
        <span class="journal-entry-meta">
            ${
                escapeHTML(
                    entry.page
                        ? `Page ${entry.page}`
                        : formatDate(
                            entry.date
                        )
                )
            }
        </span>

        ${
            entry.title
                ? `
                    <h3>
                        ${escapeHTML(
                            entry.title
                        )}
                    </h3>
                `
                : ""
        }

        <p>
            ${escapeHTML(
                entry.text ||
                ""
            )}
        </p>
    `;

}


/* =========================================================
   ENTRY MODAL
   ========================================================= */

function openJournalEntryModal() {

    if (
        !selectedJournalSection
    ) {

        return;

    }


    const meta =
        getJournalSectionMeta(
            selectedJournalSection
        );


    setText(
        "entryModalTitle",
        `Add ${meta.label}`
    );


    setValue(
        "entrySection",
        selectedJournalSection
    );


    renderJournalEntryFields(
        selectedJournalSection
    );


    document.getElementById(
        "entryModal"
    ).hidden =
        false;

}


/* =========================================================
   DYNAMIC JOURNAL FIELDS
   ========================================================= */

function renderJournalEntryFields(
    section
) {

    const container =
        document.getElementById(
            "entryDynamicFields"
        );


    if (
        !container
    ) {

        return;

    }


    if (
        section ===
        "words"
    ) {

        container.innerHTML = `
            <label class="field">

                <span>
                    Word
                </span>

                <input
                    id="entryWord"
                    type="text"
                    required
                >

            </label>

            <label class="field">

                <span>
                    Page
                </span>

                <input
                    id="entryPage"
                    type="number"
                    min="0"
                >

            </label>

            <label class="field">

                <span>
                    Definition
                </span>

                <textarea
                    id="entryDefinition"
                    rows="4"
                ></textarea>

            </label>

            <label class="field">

                <span>
                    Context / Sentence
                </span>

                <textarea
                    id="entryContext"
                    rows="3"
                ></textarea>

            </label>
        `;

        return;

    }


    if (
        section ===
        "quotes"
    ) {

        container.innerHTML = `
            <label class="field">

                <span>
                    Quote
                </span>

                <textarea
                    id="entryQuote"
                    rows="5"
                    required
                ></textarea>

            </label>

            <label class="field">

                <span>
                    Page
                </span>

                <input
                    id="entryPage"
                    type="number"
                    min="0"
                >

            </label>

            <label class="field">

                <span>
                    Why I Saved It
                </span>

                <textarea
                    id="entryThought"
                    rows="3"
                ></textarea>

            </label>
        `;

        return;

    }


    if (
        section ===
        "characters"
    ) {

        container.innerHTML = `
            <label class="field">

                <span>
                    Character
                </span>

                <input
                    id="entryCharacterName"
                    type="text"
                    required
                >

            </label>

            <label class="field">

                <span>
                    Notes
                </span>

                <textarea
                    id="entryCharacterNotes"
                    rows="5"
                ></textarea>

            </label>
        `;

        return;

    }


    if (
        section ===
        "review"
    ) {

        container.innerHTML = `
            <label class="field">

                <span>
                    Rating
                </span>

                <select id="entryReviewRating">

                    <option value="0">
                        No rating
                    </option>

                    <option value="1">
                        ★
                    </option>

                    <option value="2">
                        ★★
                    </option>

                    <option value="3">
                        ★★★
                    </option>

                    <option value="4">
                        ★★★★
                    </option>

                    <option value="5">
                        ★★★★★
                    </option>

                </select>

            </label>

            <label class="field">

                <span>
                    Review
                </span>

                <textarea
                    id="entryText"
                    rows="7"
                    required
                ></textarea>

            </label>
        `;

        return;

    }


    container.innerHTML = `
        <label class="field">

            <span>
                Title
            </span>

            <input
                id="entryTitle"
                type="text"
            >

        </label>

        <label class="field">

            <span>
                Page
            </span>

            <input
                id="entryPage"
                type="number"
                min="0"
            >

        </label>

        <label class="field">

            <span>
                Entry
            </span>

            <textarea
                id="entryText"
                rows="7"
                required
            ></textarea>

        </label>
    `;

}


/* =========================================================
   SAVE JOURNAL ENTRY
   ========================================================= */

function saveJournalEntry(
    event
) {

    event.preventDefault();


    const book =
        getSelectedBook();


    const section =
        getValue(
            "entrySection"
        );


    if (
        !book ||
        !section
    ) {

        return;

    }


    const entry =
        buildJournalEntry(
            section
        );


    if (
        !book.journal[
            section
        ]
    ) {

        book.journal[
            section
        ] =
            [];

    }


    book.journal[
        section
    ]
    .push(
        entry
    );


    saveBooks();

    closeEntryModal();

    renderJournalEntries(
        book,
        section
    );

}


/* =========================================================
   BUILD JOURNAL ENTRY
   ========================================================= */

function buildJournalEntry(
    section
) {

    const base = {
        id:
            makeId(
                "entry"
            ),

        date:
            new Date()
                .toISOString()
                .slice(
                    0,
                    10
                )
    };


    if (
        section ===
        "words"
    ) {

        return {
            ...base,

            word:
                getValue(
                    "entryWord"
                )
                .trim(),

            page:
                getValue(
                    "entryPage"
                ),

            definition:
                getValue(
                    "entryDefinition"
                )
                .trim(),

            context:
                getValue(
                    "entryContext"
                )
                .trim()
        };

    }


    if (
        section ===
        "quotes"
    ) {

        return {
            ...base,

            quote:
                getValue(
                    "entryQuote"
                )
                .trim(),

            page:
                getValue(
                    "entryPage"
                ),

            thought:
                getValue(
                    "entryThought"
                )
                .trim()
        };

    }


    if (
        section ===
        "characters"
    ) {

        return {
            ...base,

            name:
                getValue(
                    "entryCharacterName"
                )
                .trim(),

            notes:
                getValue(
                    "entryCharacterNotes"
                )
                .trim()
        };

    }


    if (
        section ===
        "review"
    ) {

        return {
            ...base,

            rating:
                numericOrZero(
                    getValue(
                        "entryReviewRating"
                    )
                ),

            text:
                getValue(
                    "entryText"
                )
                .trim()
        };

    }


    return {
        ...base,

        title:
            getValue(
                "entryTitle"
            )
            .trim(),

        page:
            getValue(
                "entryPage"
            ),

        text:
            getValue(
                "entryText"
            )
            .trim()
    };

}


/* =========================================================
   DELETE JOURNAL ENTRY
   ========================================================= */

function deleteJournalEntry(
    section,
    entryId
) {

    const book =
        getSelectedBook();


    if (
        !book
    ) {

        return;

    }


    book.journal[
        section
    ] =
        (
            book.journal[
                section
            ] ||
            []
        )
        .filter(
            entry =>
                entry.id !==
                entryId
        );


    saveBooks();


    renderJournalEntries(
        book,
        section
    );

}


/* =========================================================
   CLOSE ENTRY MODAL
   ========================================================= */

function closeEntryModal() {

    hideElement(
        "entryModal"
    );


    const form =
        document.getElementById(
            "entryForm"
        );


    form?.reset();

}


/* =========================================================
   READING NOW
   ========================================================= */

function renderReadingNow() {

    const currentBooks =
        books.filter(
            book =>
                book.status ===
                "reading"
        );


    const featuredSection =
        document.getElementById(
            "featuredReadingSection"
        );


    const listSection =
        document.getElementById(
            "readingListSection"
        );


    const empty =
        document.getElementById(
            "readingEmpty"
        );


    setText(
        "currentReadingCount",
        currentBooks.length
    );


    const average =
        currentBooks.length
            ? Math.round(
                currentBooks.reduce(
                    (
                        sum,
                        book
                    ) =>
                        sum +
                        calculateProgress(
                            book
                        ),
                    0
                )
                /
                currentBooks.length
            )
            : 0;


    setText(
        "averageProgress",
        `${average}%`
    );


    const remaining =
        currentBooks.reduce(
            (
                total,
                book
            ) =>
                total +
                Math.max(
                    0,
                    (
                        book.pages ||
                        0
                    )
                    -
                    (
                        book.current_page ||
                        0
                    )
                ),
            0
        );


    setText(
        "pagesRemaining",
        remaining
    );


    if (
        !currentBooks.length
    ) {

        if (
            featuredSection
        ) {

            featuredSection.hidden =
                true;

        }


        if (
            listSection
        ) {

            listSection.hidden =
                true;

        }


        if (
            empty
        ) {

            empty.hidden =
                false;

        }


        return;

    }


    if (
        empty
    ) {

        empty.hidden =
            true;

    }


    if (
        featuredSection
    ) {

        featuredSection.hidden =
            false;

    }


    if (
        listSection
    ) {

        listSection.hidden =
            false;

    }


    const featured =
        currentBooks[0];


    renderFeaturedReading(
        featured
    );


    const grid =
        document.getElementById(
            "readingGrid"
        );


    if (
        grid
    ) {

        grid.innerHTML =
            "";


        currentBooks.forEach(
            book => {

                grid.appendChild(
                    createReadingCard(
                        book
                    )
                );

            }
        );

    }

}


/* =========================================================
   FEATURED READING
   ========================================================= */

function renderFeaturedReading(
    book
) {

    const shelf =
        shelves.find(
            item =>
                item.id ===
                book.shelf_id
        );


    renderCoverIntoElement(
        document.getElementById(
            "featuredBookCover"
        ),
        book
    );


    setText(
        "featuredBookShelf",
        shelf?.name ||
        "Currently Reading"
    );


    setText(
        "featuredBookTitle",
        book.title
    );


    setText(
        "featuredBookAuthor",
        book.author ||
        "Unknown Author"
    );


    setText(
        "featuredBookStarted",
        formatDate(
            book.started
        )
    );


    setText(
        "featuredBookPages",
        book.pages
            ? `${book.current_page} / ${book.pages}`
            : "—"
    );


    const percent =
        calculateProgress(
            book
        );


    setText(
        "featuredBookPercent",
        `${percent}%`
    );


    setWidth(
        "featuredProgressFill",
        percent
    );


    setProgressBookmark(
        "featuredProgressBookmark",
        percent
    );


    const open =
        document.getElementById(
            "featuredOpenBook"
        );


    const progress =
        document.getElementById(
            "featuredEditProgress"
        );


    if (
        open
    ) {

        open.dataset.bookId =
            book.id;

    }


    if (
        progress
    ) {

        progress.dataset.bookId =
            book.id;

    }

}


/* =========================================================
   CURRENT READING CARD
   ========================================================= */

function createReadingCard(
    book
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "reading-card";


    const percent =
        calculateProgress(
            book
        );


    article.innerHTML = `
        <div class="reading-card-cover"></div>

        <div class="reading-card-copy">

            <span class="eyebrow">
                ${percent}% READ
            </span>

            <h3>
                ${escapeHTML(
                    book.title
                )}
            </h3>

            <p>
                ${escapeHTML(
                    book.author ||
                    "Unknown Author"
                )}
            </p>

            <div class="progress-track">

                <div
                    class="progress-fill"
                    style="width: ${percent}%"
                ></div>

            </div>

            <div class="reading-card-actions">

                <button
                    class="secondary-button"
                    type="button"
                    data-action="progress"
                >
                    Progress
                </button>

                <button
                    class="primary-button"
                    type="button"
                    data-action="journal"
                >
                    Journal
                </button>

            </div>

        </div>
    `;


    renderCoverIntoElement(
        article.querySelector(
            ".reading-card-cover"
        ),
        book
    );


    article
        .querySelector(
            '[data-action="progress"]'
        )
        ?.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                openProgressModal(
                    book.id
                );

            }
        );


    article
        .querySelector(
            '[data-action="journal"]'
        )
        ?.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                openReadingBook(
                    book.id
                );

            }
        );


    article.addEventListener(
        "click",
        () =>
            openBookReveal(
                book.id
            )
    );


    return article;

}


/* =========================================================
   FEATURED ACTIONS
   ========================================================= */

function openFeaturedJournal() {

    const button =
        document.getElementById(
            "featuredOpenBook"
        );


    if (
        button?.dataset.bookId
    ) {

        openReadingBook(
            button.dataset.bookId
        );

    }

}


function openFeaturedProgress() {

    const button =
        document.getElementById(
            "featuredEditProgress"
        );


    if (
        button?.dataset.bookId
    ) {

        openProgressModal(
            button.dataset.bookId
        );

    }

}


/* =========================================================
   PROGRESS MODAL
   ========================================================= */

function openProgressModal(
    bookId
) {

    const book =
        books.find(
            item =>
                item.id ===
                bookId
        );


    if (
        !book
    ) {

        return;

    }


    setValue(
        "progressBookId",
        book.id
    );


    setText(
        "progressBookTitle",
        book.title
    );


    setText(
        "progressBookTotal",
        book.pages
            ? `${book.pages} pages`
            : "Page total not entered"
    );


    setValue(
        "progressCurrentPage",
        book.current_page
    );


    setChecked(
        "markBookFinished",
        book.status ===
        "finished"
    );


    updateProgressPreview();


    document.getElementById(
        "progressModal"
    ).hidden =
        false;

}


/* =========================================================
   PROGRESS PREVIEW
   ========================================================= */

function bindProgressPreview() {

    const pageInput =
        document.getElementById(
            "progressCurrentPage"
        );


    const finished =
        document.getElementById(
            "markBookFinished"
        );


    pageInput?.addEventListener(
        "input",
        updateProgressPreview
    );


    finished?.addEventListener(
        "change",
        updateProgressPreview
    );

}


function updateProgressPreview() {

    const bookId =
        getValue(
            "progressBookId"
        );


    const book =
        books.find(
            item =>
                item.id ===
                bookId
        );


    if (
        !book
    ) {

        return;

    }


    const finished =
        document.getElementById(
            "markBookFinished"
        )?.checked;


    let page =
        numericOrZero(
            getValue(
                "progressCurrentPage"
            )
        );


    if (
        finished &&
        book.pages
    ) {

        page =
            book.pages;


        setValue(
            "progressCurrentPage",
            page
        );

    }


    const percent =
        book.pages
            ? clamp(
                Math.round(
                    (
                        page /
                        book.pages
                    )
                    *
                    100
                ),
                0,
                100
            )
            : 0;


    setText(
        "progressPreviewPercent",
        `${percent}%`
    );


    setWidth(
        "progressPreviewFill",
        percent
    );

}


/* =========================================================
   SAVE PROGRESS
   ========================================================= */

function saveProgressUpdate(
    event
) {

    event.preventDefault();


    const bookId =
        getValue(
            "progressBookId"
        );


    const book =
        books.find(
            item =>
                item.id ===
                bookId
        );


    if (
        !book
    ) {

        return;

    }


    const finished =
        document.getElementById(
            "markBookFinished"
        )?.checked;


    let page =
        numericOrZero(
            getValue(
                "progressCurrentPage"
            )
        );


    page =
        clamp(
            page,
            0,
            book.pages ||
            Number.MAX_SAFE_INTEGER
        );


    if (
        finished
    ) {

        book.status =
            "finished";


        if (
            book.pages
        ) {

            page =
                book.pages;

        }


        if (
            !book.finished
        ) {

            book.finished =
                new Date()
                    .toISOString()
                    .slice(
                        0,
                        10
                    );

        }

    } else {

        book.status =
            "reading";


        book.finished =
            "";

    }


    book.current_page =
        page;


    saveBooks();

    closeProgressModal();

    renderAll();

}


/* =========================================================
   CLOSE PROGRESS
   ========================================================= */

function closeProgressModal() {

    hideElement(
        "progressModal"
    );

}


/* =========================================================
   CALCULATE PROGRESS
   ========================================================= */

function calculateProgress(
    book
) {

    if (
        book.status ===
        "finished"
    ) {

        return 100;

    }


    if (
        !book.pages
    ) {

        return 0;

    }


    return clamp(
        Math.round(
            (
                book.current_page /
                book.pages
            )
            *
            100
        ),
        0,
        100
    );

}


/* =========================================================
   READING STATS
   ========================================================= */

function renderStats() {

    const finishedBooks =
        books.filter(
            book =>
                book.status ===
                "finished"
        );


    setText(
        "statsTotalBooks",
        books.length
    );


    setText(
        "statsFinishedBooks",
        finishedBooks.length
    );


    const pagesRead =
        books.reduce(
            (
                total,
                book
            ) => {

                if (
                    book.status ===
                    "finished"
                ) {

                    return total +
                        (
                            book.pages ||
                            book.current_page ||
                            0
                        );

                }


                return total +
                    (
                        book.current_page ||
                        0
                    );

            },
            0
        );


    setText(
        "statsPagesRead",
        pagesRead.toLocaleString()
    );


    const rated =
        books.filter(
            book =>
                book.rating >
                0
        );


    const averageRating =
        rated.length
            ? (
                rated.reduce(
                    (
                        total,
                        book
                    ) =>
                        total +
                        book.rating,
                    0
                )
                /
                rated.length
            )
            .toFixed(
                1
            )
            : "—";


    setText(
        "statsAverageRating",
        averageRating ===
        "—"
            ? "—"
            : `${averageRating} ★`
    );


    setText(
        "statsCurrentlyReading",
        countByStatus(
            "reading"
        )
    );


    setText(
        "statsWantToRead",
        countByStatus(
            "want"
        )
    );


    setText(
        "statsPaused",
        countByStatus(
            "paused"
        )
    );


    setText(
        "statsDNF",
        countByStatus(
            "dnf"
        )
    );


    setText(
        "statsReference",
        countByStatus(
            "reference"
        )
    );


    setText(
        "statsRereads",
        books.filter(
            book =>
                book.times_read >
                1
        ).length
    );


    renderGenreStats();

    renderMonthlyStats();

}


/* =========================================================
   COUNT STATUS
   ========================================================= */

function countByStatus(
    status
) {

    return books.filter(
        book =>
            book.status ===
                status
    ).length;

}


/* =========================================================
   GENRE STATS
   ========================================================= */

function renderGenreStats() {

    const container =
        document.getElementById(
            "genreStats"
        );


    if (
        !container
    ) {

        return;

    }


    const counts =
        {};


    books.forEach(
        book => {

            const genre =
                book.genre
                    .trim();


            if (
                !genre
            ) {

                return;

            }


            counts[genre] =
                (
                    counts[genre] ||
                    0
                )
                +
                1;

        }
    );


    const entries =
        Object.entries(
            counts
        )
        .sort(
            (
                a,
                b
            ) =>
                b[1] -
                a[1]
        );


    container.innerHTML =
        "";


    if (
        !entries.length
    ) {

        container.innerHTML = `
            <div class="stats-empty-line">
                Add genres to your books and they will appear here.
            </div>
        `;

        return;

    }


    const maximum =
        Math.max(
            ...entries.map(
                entry =>
                    entry[1]
            )
        );


    entries
        .slice(
            0,
            8
        )
        .forEach(
            (
                [
                    genre,
                    count
                ]
            ) => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "genre-stat-row";


                const percent =
                    maximum
                        ? (
                            count /
                            maximum
                        )
                        *
                        100
                        : 0;


                row.innerHTML = `
                    <span class="genre-stat-name">
                        ${escapeHTML(
                            genre
                        )}
                    </span>

                    <span class="genre-stat-track">

                        <span
                            class="genre-stat-fill"
                            style="width: ${percent}%"
                        ></span>

                    </span>

                    <span class="genre-stat-count">
                        ${count}
                    </span>
                `;


                container.appendChild(
                    row
                );

            }
        );

}


/* =========================================================
   MONTHLY STATS
   ========================================================= */

function renderMonthlyStats() {

    const container =
        document.getElementById(
            "monthlyReadingStats"
        );


    if (
        !container
    ) {

        return;

    }


    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];


    const counts =
        Array(
            12
        )
        .fill(
            0
        );


    const currentYear =
        new Date()
            .getFullYear();


    books.forEach(
        book => {

            if (
                book.status !==
                "finished"
                ||
                !book.finished
            ) {

                return;

            }


            const date =
                parseLocalDate(
                    book.finished
                );


            if (
                !date ||
                date.getFullYear() !==
                    currentYear
            ) {

                return;

            }


            counts[
                date.getMonth()
            ] +=
                1;

        }
    );


    const maximum =
        Math.max(
            1,
            ...counts
        );


    container.innerHTML =
        "";


    counts.forEach(
        (
            count,
            index
        ) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "month-stat";


            const height =
                count
                    ? Math.max(
                        8,
                        (
                            count /
                            maximum
                        )
                        *
                        100
                    )
                    : 3;


            item.innerHTML = `
                <strong>
                    ${count}
                </strong>

                <div class="month-stat-bar-wrap">

                    <div
                        class="month-stat-bar"
                        style="height: ${height}%"
                    ></div>

                </div>

                <span>
                    ${months[index]}
                </span>
            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   COVER RENDERING
   ========================================================= */

function renderCoverIntoElement(
    element,
    book
) {

    if (
        !element
    ) {

        return;

    }


    element.innerHTML =
        "";


    element.style.backgroundImage =
        "";


    if (
        book.cover_image
    ) {

        element.style.backgroundImage =
            `url("${book.cover_image}")`;


        element.style.backgroundPosition =
            "center";


        element.style.backgroundSize =
            "cover";


        return;

    }


    const cover =
        document.createElement(
            "div"
        );


    cover.className =
        "generated-cover";


    applyBookColors(
        cover,
        book
    );


    cover.innerHTML = `
        <span>
            ${escapeHTML(
                getBookOrnament(
                    book
                )
            )}
        </span>

        <strong>
            ${escapeHTML(
                book.title
            )}
        </strong>

        <span>
            ${escapeHTML(
                book.author ||
                ""
            )}
        </span>
    `;


    element.appendChild(
        cover
    );

}


/* =========================================================
   SELECTED BOOK
   ========================================================= */

function getSelectedBook() {

    return books.find(
        book =>
            book.id ===
                selectedBookId
    ) ||
    null;

}


/* =========================================================
   STATUS LABELS
   ========================================================= */

function readableStatus(
    status
) {

    const labels = {

        want:
            "Want to Read",

        reading:
            "Currently Reading",

        paused:
            "Paused",

        finished:
            "Finished",

        dnf:
            "Did Not Finish",

        reference:
            "Reference"
    };


    return labels[status] ||
        status ||
        "Book";

}


/* =========================================================
   DATE FORMATTING
   ========================================================= */

function formatDate(
    value
) {

    if (
        !value
    ) {

        return "—";

    }


    const date =
        parseLocalDate(
            value
        );


    if (
        !date
    ) {

        return "—";

    }


    return date.toLocaleDateString(
        "en-US",
        {
            month:
                "short",

            day:
                "numeric",

            year:
                "numeric"
        }
    );

}


function parseLocalDate(
    value
) {

    if (
        !value
    ) {

        return null;

    }


    const date =
        new Date(
            `${value}T00:00:00`
        );


    return Number.isNaN(
        date.getTime()
    )
        ? null
        : date;

}


/* =========================================================
   PROGRESS BOOKMARK
   ========================================================= */

function setProgressBookmark(
    id,
    percent
) {

    const element =
        document.getElementById(
            id
        );


    if (
        !element
    ) {

        return;

    }


    element.style.left =
        `${clamp(
            percent,
            0,
            100
        )}%`;

}


/* =========================================================
   GENERIC EVENT HELPERS
   ========================================================= */

function bindClick(
    id,
    handler
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.addEventListener(
            "click",
            handler
        );

    }

}


function bindForm(
    id,
    handler
) {

    const form =
        document.getElementById(
            id
        );


    if (
        form
    ) {

        form.addEventListener(
            "submit",
            handler
        );

    }

}


/* =========================================================
   ELEMENT HELPERS
   ========================================================= */

function showElement(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.hidden =
            false;

    }

}


function hideElement(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.hidden =
            true;

    }

}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.textContent =
            value ?? "";

    }

}


function getValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    return element
        ? String(
            element.value ??
            ""
        )
        : "";

}


function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.value =
            value ??
            "";

    }

}


function setChecked(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.checked =
            Boolean(
                value
            );

    }

}


function setWidth(
    id,
    percent
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.style.width =
            `${clamp(
                percent,
                0,
                100
            )}%`;

    }

}


/* =========================================================
   NUMERIC HELPERS
   ========================================================= */

function numericOrZero(
    value
) {

    const number =
        Number(
            value
        );


    return Number.isFinite(
        number
    )
        ? number
        : 0;

}


function numericOrBlank(
    value
) {

    if (
        value ===
        ""
        ||
        value ===
        null
        ||
        value ===
        undefined
    ) {

        return "";

    }


    const number =
        Number(
            value
        );


    return Number.isFinite(
        number
    )
        ? number
        : "";

}


function clamp(
    value,
    minimum,
    maximum
) {

    return Math.min(
        maximum,
        Math.max(
            minimum,
            Number(
                value
            ) ||
            0
        )
    );

}


/* =========================================================
   ID
   ========================================================= */

function makeId(
    prefix = "item"
) {

    if (
        window.crypto?.randomUUID
    ) {

        return `${prefix}-${crypto.randomUUID()}`;

    }


    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        value ??
        "";


    return element.innerHTML;

}


/* =========================================================
   END
   ========================================================= */
