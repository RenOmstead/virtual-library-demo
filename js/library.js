/* =========================================================
   SHELFMARK
   MAIN LIBRARY APPLICATION
   ========================================================= */


/* =========================================================
   CONFIG
   ========================================================= */

const CONFIG = window.SHELFMARK_CONFIG || {};

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

let selectedBookId = null;

let selectedJournalSection = null;

let pendingCoverData = "";

let pendingSpineData = "";

let activeDrag = null;


let settings = {

    theme:
        CONFIG.defaultSettings?.theme ||
        CONFIG.defaultTheme ||
        "haunted",

    candleGlow:
        CONFIG.defaultSettings?.candleGlow ??
        true,

    dust:
        CONFIG.defaultSettings?.dust ??
        true,

    rain:
        CONFIG.defaultSettings?.rain ??
        true,

    oddities:
        CONFIG.defaultSettings?.oddities ??
        true,

    reducedMotion:
        CONFIG.defaultSettings?.reducedMotion ??
        false,

    decorationDensity:
        CONFIG.defaultSettings?.decorationDensity ||
        "cozy"

};


/* =========================================================
   DECORATION FALLBACK ICONS

   These make new decoration types visible immediately.
   Later we can replace them with richer CSS illustrations.
   ========================================================= */

const DECORATION_SYMBOLS = {

    plant: "❧",

    candle: "🕯",

    flowers: "✿",

    stars: "✦",

    mug: "☕",

    cat: "🐈",

    ghost: "♧",

    bat: "⌁",

    goblin: "♟",

    moss: "❦",

    mushroom: "♠",

    potion: "⚗",

    crystal: "♦",

    raven: "♜",

    pumpkin: "●"

};


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeShelfmark
);


function initializeShelfmark() {

    resetInitialUI();

    loadSettings();

    loadData();

    applySettings();

    bindControls();

    renderLibrary();

}


/* =========================================================
   RESET UI
   ========================================================= */

function resetInitialUI() {

    const overlay =
        document.getElementById(
            "overlay"
        );


    if (overlay) {

        overlay.hidden = true;

        overlay.classList.remove(
            "open"
        );

    }


    document
        .querySelectorAll(
            ".form-drawer"
        )
        .forEach(
            drawer => {

                drawer.hidden = true;

                drawer.classList.remove(
                    "open"
                );

            }
        );


    [

        "bookReveal",
        "readingBook",
        "entryModal"

    ]
        .forEach(
            id => {

                const element =
                    document.getElementById(
                        id
                    );


                if (element) {

                    element.hidden =
                        true;

                }

            }
        );


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   LOAD DATA
   ========================================================= */

function loadData() {

    shelves =
        loadCollection(
            STORAGE_KEYS.shelves,
            window.SHELFMARK_DATA?.shelves
        )
        .map(
            normalizeShelf
        );


    books =
        loadCollection(
            STORAGE_KEYS.books,
            window.SHELFMARK_DATA?.books
        )
        .map(
            normalizeBook
        );

}


/* =========================================================
   LOAD COLLECTION
   ========================================================= */

function loadCollection(
    key,
    fallback = []
) {

    try {

        const saved =
            localStorage.getItem(
                key
            );


        if (saved) {

            const parsed =
                JSON.parse(
                    saved
                );


            if (
                Array.isArray(
                    parsed
                )
            ) {

                return parsed;

            }

        }

    }

    catch (error) {

        console.error(
            `Could not load ${key}`,
            error
        );

    }


    return Array.isArray(
        fallback
    )
        ?
        [...fallback]
        :
        [];

}


/* =========================================================
   SETTINGS
   ========================================================= */

function loadSettings() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEYS.settings
            );


        if (!saved) {

            return;

        }


        settings = {

            ...settings,

            ...JSON.parse(
                saved
            )

        };

    }

    catch (error) {

        console.error(
            "Could not load settings.",
            error
        );

    }

}


function saveSettings() {

    localStorage.setItem(

        STORAGE_KEYS.settings,

        JSON.stringify(
            settings
        )

    );

}


/* =========================================================
   APPLY SETTINGS
   ========================================================= */

function applySettings() {

    applyTheme(
        settings.theme,
        false
    );


    document.body.classList.toggle(
        "reduce-motion",
        settings.reducedMotion
    );


    document.body.classList.toggle(
        "ambient-candle",
        settings.candleGlow
    );


    document.body.classList.toggle(
        "ambient-dust",
        settings.dust
    );


    document.body.classList.toggle(
        "ambient-rain",
        settings.rain
    );


    document.body.classList.toggle(
        "ambient-oddities",
        settings.oddities
    );


    document.body.dataset.decorationDensity =
        settings.decorationDensity;


    syncSettingsControls();

}


/* =========================================================
   THEME
   ========================================================= */

function getAllowedThemes() {

    if (
        Array.isArray(
            CONFIG.themes
        )
    ) {

        return CONFIG.themes.map(
            theme =>
                theme.id
        );

    }


    return [

        "haunted",
        "autumn",
        "forest",
        "retro",
        "ghosts"

    ];

}


function applyTheme(
    theme,
    shouldSave = true
) {

    const allowedThemes =
        getAllowedThemes();


    if (
        !allowedThemes.includes(
            theme
        )
    ) {

        theme =
            CONFIG.defaultTheme ||
            "haunted";

    }


    allowedThemes.forEach(
        item => {

            document.body.classList.remove(
                `theme-${item}`
            );

        }
    );


    document.body.classList.add(
        `theme-${theme}`
    );


    settings.theme =
        theme;


    document
        .querySelectorAll(
            ".theme-card"
        )
        .forEach(
            card => {

                card.classList.toggle(

                    "active",

                    card.dataset.theme ===
                    theme

                );

            }
        );


    if (shouldSave) {

        saveSettings();

    }


    updateOpenShelfDecorationChoices();

}


/* =========================================================
   SETTINGS UI
   ========================================================= */

function syncSettingsControls() {

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


    const density =
        document.querySelector(
            `input[name="decorationDensity"][value="${settings.decorationDensity}"]`
        );


    if (density) {

        density.checked =
            true;

    }

}


/* =========================================================
   NORMALIZE SHELF
   ========================================================= */

function normalizeShelf(
    shelf
) {

    return {

        id:
            shelf.id ||
            generateId(),

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
            normalizeDecorations(
                shelf.decorations
            ),

        created_at:
            shelf.created_at ||
            new Date()
                .toISOString(),

        updated_at:
            shelf.updated_at ||
            ""

    };

}


/* =========================================================
   NORMALIZE DECORATIONS

   Older shelves may contain:

   ["plant", "candle"]

   New format:

   [
       {
           id,
           type,
           x,
           y,
           scale,
           rotate
       }
   ]
   ========================================================= */

function normalizeDecorations(
    decorations
) {

    if (
        !Array.isArray(
            decorations
        )
    ) {

        return [];

    }


    return decorations.map(
        (
            decoration,
            index
        ) => {

            if (
                typeof decoration ===
                "string"
            ) {

                return createDecorationRecord(

                    decoration,

                    getDefaultDecorationPosition(
                        index
                    )

                );

            }


            return {

                id:
                    decoration.id ||
                    generateId(),

                type:
                    decoration.type ||
                    decoration.name ||
                    "plant",

                x:
                    normalizePercent(
                        decoration.x,
                        15 + index * 12
                    ),

                y:
                    normalizePercent(
                        decoration.y,
                        70
                    ),

                scale:
                    normalizeScale(
                        decoration.scale
                    ),

                rotate:
                    normalizeRotation(
                        decoration.rotate
                    )

            };

        }
    );

}


/* =========================================================
   CREATE DECORATION RECORD
   ========================================================= */

function createDecorationRecord(
    type,
    position = {}
) {

    return {

        id:
            generateId(),

        type,

        x:
            normalizePercent(
                position.x,
                50
            ),

        y:
            normalizePercent(
                position.y,
                70
            ),

        scale:
            normalizeScale(
                position.scale
            ),

        rotate:
            normalizeRotation(
                position.rotate
            )

    };

}


/* =========================================================
   DEFAULT DECORATION POSITIONS
   ========================================================= */

function getDefaultDecorationPosition(
    index = 0
) {

    const positions = [

        {
            x: 12,
            y: 70
        },

        {
            x: 82,
            y: 68
        },

        {
            x: 55,
            y: 28
        },

        {
            x: 28,
            y: 68
        },

        {
            x: 70,
            y: 70
        },

        {
            x: 40,
            y: 68
        },

        {
            x: 92,
            y: 60
        }

    ];


    return positions[
        index %
        positions.length
    ];

}


/* =========================================================
   NORMALIZE BOOK
   ========================================================= */

function normalizeBook(
    book
) {

    return {

        id:
            book.id ||
            generateId(),

        shelf_id:
            book.shelf_id ||
            "",

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
            book.publication_year ||
            "",

        pages:
            normalizeNumber(
                book.pages
            ),

        isbn:
            book.isbn ||
            "",

        series:
            book.series ||
            "",

        status:
            normalizeBookStatus(
                book.status
            ),

        rating:
            normalizeNumber(
                book.rating
            ),

        started:
            book.started ||
            "",

        finished:
            book.finished ||
            "",

        current_page:
            normalizeNumber(
                book.current_page
            ),

        times_read:
            normalizeNumber(
                book.times_read
            ),

        cover_image:
            book.cover_image ||
            "",

        spine_image:
            book.spine_image ||
            "",

        spine_color:
            book.spine_color ||
            getThemeBookColor(),

        text_color:
            book.text_color ||
            getThemeBookTextColor(),

        height:
            book.height ||
            "medium",

        thickness:
            book.thickness ||
            "medium",

        style:
            book.style ||
            "classic",

        journal:
            normalizeJournal(
                book.journal
            ),

        created_at:
            book.created_at ||
            new Date()
                .toISOString(),

        updated_at:
            book.updated_at ||
            ""

    };

}


/* =========================================================
   NORMALIZE JOURNAL
   ========================================================= */

function normalizeJournal(
    journal = {}
) {

    return {

        notes:
            Array.isArray(
                journal.notes
            )
                ?
                journal.notes
                :
                [],

        thoughts:
            Array.isArray(
                journal.thoughts
            )
                ?
                journal.thoughts
                :
                [],

        words:
            Array.isArray(
                journal.words
            )
                ?
                journal.words
                :
                [],

        quotes:
            Array.isArray(
                journal.quotes
            )
                ?
                journal.quotes
                :
                [],

        characters:
            Array.isArray(
                journal.characters
            )
                ?
                journal.characters
                :
                [],

        themes:
            Array.isArray(
                journal.themes
            )
                ?
                journal.themes
                :
                [],

        questions:
            Array.isArray(
                journal.questions
            )
                ?
                journal.questions
                :
                [],

        review:
            Array.isArray(
                journal.review
            )
                ?
                journal.review
                :
                []

    };

}


/* =========================================================
   BIND CONTROLS
   ========================================================= */

function bindControls() {

    bindShelfControls();

    bindBookControls();

    bindThemeControls();

    bindRevealControls();

    bindJournalControls();

    bindKeyboardControls();

}


/* =========================================================
   SHELF CONTROLS
   ========================================================= */

function bindShelfControls() {

    [

        "sidebarAddShelf",
        "topAddShelf",
        "bottomAddShelf",
        "emptyAddShelf"

    ]
        .forEach(
            id => {

                document
                    .getElementById(
                        id
                    )
                    ?.addEventListener(
                        "click",
                        () =>
                            openShelfDrawer()
                    );

            }
        );


    document
        .getElementById(
            "closeShelfDrawer"
        )
        ?.addEventListener(
            "click",
            closeDrawers
        );


    document
        .getElementById(
            "cancelShelf"
        )
        ?.addEventListener(
            "click",
            closeDrawers
        );


    document
        .getElementById(
            "shelfForm"
        )
        ?.addEventListener(
            "submit",
            saveShelfFromForm
        );

}


/* =========================================================
   BOOK CONTROLS
   ========================================================= */

function bindBookControls() {

    [

        "sidebarAddBook",
        "topAddBook",
        "emptyAddBook"

    ]
        .forEach(
            id => {

                document
                    .getElementById(
                        id
                    )
                    ?.addEventListener(
                        "click",
                        () =>
                            openBookDrawer()
                    );

            }
        );


    document
        .getElementById(
            "closeBookDrawer"
        )
        ?.addEventListener(
            "click",
            closeDrawers
        );


    document
        .getElementById(
            "cancelBook"
        )
        ?.addEventListener(
            "click",
            closeDrawers
        );


    document
        .getElementById(
            "bookForm"
        )
        ?.addEventListener(
            "submit",
            saveBookFromForm
        );


    document
        .getElementById(
            "bookCoverUpload"
        )
        ?.addEventListener(
            "change",
            handleCoverUpload
        );


    document
        .getElementById(
            "bookSpineUpload"
        )
        ?.addEventListener(
            "change",
            handleSpineUpload
        );

}


/* =========================================================
   THEME CONTROLS
   ========================================================= */

function bindThemeControls() {

    [

        "openThemeSettings",
        "topThemeSettings"

    ]
        .forEach(
            id => {

                document
                    .getElementById(
                        id
                    )
                    ?.addEventListener(
                        "click",
                        openThemeDrawer
                    );

            }
        );


    document
        .getElementById(
            "closeThemeDrawer"
        )
        ?.addEventListener(
            "click",
            closeDrawers
        );


    document
        .querySelectorAll(
            ".theme-card"
        )
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        applyTheme(
                            card.dataset.theme
                        );


                        syncSettingsControls();

                        renderLibrary();

                    }
                );

            }
        );


    bindSettingCheckbox(
        "settingCandleGlow",
        "candleGlow",
        "ambient-candle"
    );


    bindSettingCheckbox(
        "settingDust",
        "dust",
        "ambient-dust"
    );


    bindSettingCheckbox(
        "settingRain",
        "rain",
        "ambient-rain"
    );


    bindSettingCheckbox(
        "settingOddities",
        "oddities",
        "ambient-oddities"
    );


    document
        .getElementById(
            "settingReducedMotion"
        )
        ?.addEventListener(
            "change",
            event => {

                settings.reducedMotion =
                    event.target.checked;


                document.body.classList.toggle(
                    "reduce-motion",
                    settings.reducedMotion
                );


                saveSettings();

            }
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


                        document.body.dataset.decorationDensity =
                            radio.value;


                        saveSettings();

                    }
                );

            }
        );


    document
        .getElementById(
            "overlay"
        )
        ?.addEventListener(
            "click",
            closeDrawers
        );

}


/* =========================================================
   SETTING CHECKBOX
   ========================================================= */

function bindSettingCheckbox(
    elementId,
    settingKey,
    bodyClass
) {

    document
        .getElementById(
            elementId
        )
        ?.addEventListener(
            "change",
            event => {

                settings[
                    settingKey
                ] =
                    event.target.checked;


                document.body.classList.toggle(
                    bodyClass,
                    event.target.checked
                );


                saveSettings();

                renderLibrary();

            }
        );

}


/* =========================================================
   BOOK REVEAL CONTROLS
   ========================================================= */

function bindRevealControls() {

    document
        .getElementById(
            "closeBookReveal"
        )
        ?.addEventListener(
            "click",
            closeBookReveal
        );


    document
        .getElementById(
            "editSelectedBook"
        )
        ?.addEventListener(
            "click",
            editSelectedBook
        );


    document
        .getElementById(
            "openSelectedBook"
        )
        ?.addEventListener(
            "click",
            openReadingBook
        );

}


/* =========================================================
   JOURNAL CONTROLS
   ========================================================= */

function bindJournalControls() {

    document
        .getElementById(
            "closeReadingBook"
        )
        ?.addEventListener(
            "click",
            closeReadingBook
        );


    document
        .getElementById(
            "backToContents"
        )
        ?.addEventListener(
            "click",
            showJournalContents
        );


    document
        .querySelectorAll(
            "[data-journal-section]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openJournalSection(
                            button.dataset.journalSection
                        );

                    }
                );

            }
        );


    document
        .getElementById(
            "addJournalEntry"
        )
        ?.addEventListener(
            "click",
            openEntryModal
        );


    document
        .getElementById(
            "closeEntryModal"
        )
        ?.addEventListener(
            "click",
            closeEntryModal
        );


    document
        .getElementById(
            "cancelEntry"
        )
        ?.addEventListener(
            "click",
            closeEntryModal
        );


    document
        .getElementById(
            "entryForm"
        )
        ?.addEventListener(
            "submit",
            saveJournalEntry
        );

}


/* =========================================================
   KEYBOARD
   ========================================================= */

function bindKeyboardControls() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {

                return;

            }


            closeEntryModal();

            closeReadingBook();

            closeBookReveal();

            closeDrawers();

        }
    );

}


/* =========================================================
   THEME DRAWER
   ========================================================= */

function openThemeDrawer() {

    syncSettingsControls();

    showDrawer(
        "themeDrawer"
    );

}


/* =========================================================
   RENDER LIBRARY
   ========================================================= */

function renderLibrary() {

    renderShelfSelect();

    renderShelves();

    updateLibraryMetrics();

}


/* =========================================================
   RENDER SHELVES
   ========================================================= */

function renderShelves() {

    const container =
        document.getElementById(
            "shelfContainer"
        );


    const empty =
        document.getElementById(
            "libraryEmpty"
        );


    const bottomButton =
        document.getElementById(
            "bottomAddShelf"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !shelves.length
    ) {

        if (empty) {

            empty.hidden =
                false;

        }


        if (bottomButton) {

            bottomButton.hidden =
                true;

        }


        return;

    }


    if (empty) {

        empty.hidden =
            true;

    }


    if (bottomButton) {

        bottomButton.hidden =
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

}


/* =========================================================
   CREATE SHELF
   ========================================================= */

function createShelfElement(
    shelf
) {

    const section =
        document.createElement(
            "section"
        );


    section.className =
        "library-shelf";


    section.dataset.material =
        shelf.material;


    section.dataset.mood =
        shelf.mood;


    const shelfBooks =
        sortShelfBooks(

            books.filter(
                book =>
                    String(
                        book.shelf_id
                    )
                    ===
                    String(
                        shelf.id
                    )
            ),

            shelf.sort

        );


    section.innerHTML = `

        <div class="shelf-heading">

            <div>

                <h2>
                    ${escapeHTML(shelf.name)}
                </h2>

                ${
                    shelf.description

                        ?

                        `
                            <p>
                                ${escapeHTML(shelf.description)}
                            </p>
                        `

                        :

                        ""
                }

            </div>


            <div class="shelf-tools">

                <button
                    class="shelf-tool"
                    type="button"
                    data-action="add-book"
                >
                    + book
                </button>


                <button
                    class="shelf-tool"
                    type="button"
                    data-action="edit-shelf"
                >
                    edit shelf
                </button>

            </div>

        </div>


        <div
            class="shelf-cabinet"
            data-shelf-id="${escapeHTML(shelf.id)}"
        >

            <div class="shelf-back"></div>

            <div
                class="book-row ${escapeHTML(shelf.layout)}"
            >
            </div>

            <div class="decoration-layer"></div>

            <div class="shelf-board"></div>

        </div>

    `;


    const row =
        section.querySelector(
            ".book-row"
        );


    const decorationLayer =
        section.querySelector(
            ".decoration-layer"
        );


    prepareDecorationLayer(
        decorationLayer
    );


    if (
        shelfBooks.length
    ) {

        shelfBooks.forEach(
            book => {

                row.appendChild(
                    createBookElement(
                        book
                    )
                );

            }
        );

    }

    else {

        const emptyMessage =
            document.createElement(
                "div"
            );


        emptyMessage.className =
            "empty-shelf-message";


        emptyMessage.innerHTML = `

            This shelf is waiting for a story.

            <button type="button">
                tuck in a book
            </button>

        `;


        emptyMessage
            .querySelector(
                "button"
            )
            ?.addEventListener(
                "click",
                () =>
                    openBookDrawer(
                        null,
                        shelf.id
                    )
            );


        row.appendChild(
            emptyMessage
        );

    }


    if (
        settings.oddities
    ) {

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

    }


    section
        .querySelector(
            '[data-action="add-book"]'
        )
        ?.addEventListener(
            "click",
            () =>
                openBookDrawer(
                    null,
                    shelf.id
                )
        );


    section
        .querySelector(
            '[data-action="edit-shelf"]'
        )
        ?.addEventListener(
            "click",
            () =>
                openShelfDrawer(
                    shelf.id
                )
        );


    return section;

}


/* =========================================================
   DECORATION LAYER
   ========================================================= */

function prepareDecorationLayer(
    layer
) {

    if (!layer) {

        return;

    }


    layer.style.position =
        "absolute";


    layer.style.inset =
        "14px 20px 32px";


    layer.style.zIndex =
        "8";


    layer.style.pointerEvents =
        "none";


    layer.style.overflow =
        "hidden";

}


/* =========================================================
   CREATE DECORATION ELEMENT
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
        `shelf-decoration decor-${decoration.type} draggable-decoration`;


    element.dataset.decorationId =
        decoration.id;


    element.dataset.shelfId =
        shelf.id;


    element.title =
        getDecorationLabel(
            decoration.type
        );


    element.style.position =
        "absolute";


    element.style.left =
        `${decoration.x}%`;


    element.style.top =
        `${decoration.y}%`;


    element.style.transform =
        `
            translate(-50%, -50%)
            rotate(${decoration.rotate}deg)
            scale(${decoration.scale})
        `;


    element.style.zIndex =
        "15";


    element.style.pointerEvents =
        "auto";


    element.style.cursor =
        "grab";


    element.style.touchAction =
        "none";


    /*
       For decoration types that do not yet have custom CSS,
       give them a visible illustrated-style placeholder.
    */

    if (
        ![
            "plant",
            "candle",
            "flowers",
            "stars",
            "mug"
        ]
        .includes(
            decoration.type
        )
    ) {

        const symbol =
            document.createElement(
                "span"
            );


        symbol.className =
            "decoration-symbol";


        symbol.textContent =
            DECORATION_SYMBOLS[
                decoration.type
            ]
            ||
            "✦";


        symbol.style.display =
            "grid";


        symbol.style.placeItems =
            "center";


        symbol.style.minWidth =
            "42px";


        symbol.style.minHeight =
            "42px";


        symbol.style.fontSize =
            getDecorationFontSize(
                decoration.type
            );


        symbol.style.color =
            "var(--accent-light)";


        symbol.style.filter =
            "drop-shadow(0 5px 5px rgba(0,0,0,.35))";


        symbol.style.userSelect =
            "none";


        element.appendChild(
            symbol
        );

    }


    element.addEventListener(
        "pointerdown",
        startDecorationDrag
    );


    element.addEventListener(
        "dblclick",
        () => {

            cycleDecorationScale(
                shelf.id,
                decoration.id
            );

        }
    );


    return element;

}


/* =========================================================
   DECORATION FONT SIZE
   ========================================================= */

function getDecorationFontSize(
    type
) {

    const sizes = {

        cat: "2.4rem",

        ghost: "2.7rem",

        bat: "2.5rem",

        goblin: "2.4rem",

        moss: "2rem",

        mushroom: "2.5rem",

        potion: "2.4rem",

        crystal: "2.3rem",

        raven: "2.6rem",

        pumpkin: "2.6rem"

    };


    return sizes[
        type
    ]
        ||
        "2.3rem";

}


/* =========================================================
   DECORATION LABEL
   ========================================================= */

function getDecorationLabel(
    type
) {

    return (
        CONFIG.decorations?.[
            type
        ]?.label
        ||
        type
    );

}


/* =========================================================
   DRAG DECORATION
   ========================================================= */

function startDecorationDrag(
    event
) {

    event.preventDefault();

    event.stopPropagation();


    const element =
        event.currentTarget;


    const shelfId =
        element.dataset.shelfId;


    const decorationId =
        element.dataset.decorationId;


    const shelf =
        getShelfById(
            shelfId
        );


    if (!shelf) {

        return;

    }


    const decoration =
        shelf.decorations.find(
            item =>
                String(
                    item.id
                )
                ===
                String(
                    decorationId
                )
        );


    if (!decoration) {

        return;

    }


    const layer =
        element.parentElement;


    if (!layer) {

        return;

    }


    activeDrag = {

        element,

        shelf,

        decoration,

        layer

    };


    element.style.cursor =
        "grabbing";


    element.setPointerCapture?.(
        event.pointerId
    );


    document.addEventListener(
        "pointermove",
        moveDecoration
    );


    document.addEventListener(
        "pointerup",
        finishDecorationDrag,
        {
            once: true
        }
    );

}


/* =========================================================
   MOVE DECORATION
   ========================================================= */

function moveDecoration(
    event
) {

    if (!activeDrag) {

        return;

    }


    const rect =
        activeDrag.layer
            .getBoundingClientRect();


    let x =
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


    let y =
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


    x =
        clamp(
            x,
            2,
            98
        );


    y =
        clamp(
            y,
            5,
            95
        );


    activeDrag.decoration.x =
        Number(
            x.toFixed(2)
        );


    activeDrag.decoration.y =
        Number(
            y.toFixed(2)
        );


    activeDrag.element.style.left =
        `${activeDrag.decoration.x}%`;


    activeDrag.element.style.top =
        `${activeDrag.decoration.y}%`;

}


/* =========================================================
   FINISH DRAG
   ========================================================= */

function finishDecorationDrag() {

    if (!activeDrag) {

        return;

    }


    activeDrag.element.style.cursor =
        "grab";


    activeDrag.shelf.updated_at =
        new Date()
            .toISOString();


    saveShelves();


    document.removeEventListener(
        "pointermove",
        moveDecoration
    );


    activeDrag =
        null;

}


/* =========================================================
   DOUBLE CLICK SIZE
   ========================================================= */

function cycleDecorationScale(
    shelfId,
    decorationId
) {

    const shelf =
        getShelfById(
            shelfId
        );


    if (!shelf) {

        return;

    }


    const decoration =
        shelf.decorations.find(
            item =>
                String(
                    item.id
                )
                ===
                String(
                    decorationId
                )
        );


    if (!decoration) {

        return;

    }


    const sizes = [

        .75,
        1,
        1.25,
        1.5

    ];


    const currentIndex =
        sizes.findIndex(
            size =>
                Math.abs(
                    size -
                    decoration.scale
                )
                <
                .05
        );


    decoration.scale =
        sizes[
            (
                currentIndex + 1
            )
            %
            sizes.length
        ];


    saveShelves();

    renderLibrary();

}


/* =========================================================
   BOOK ELEMENT
   ========================================================= */

function createBookElement(
    book
) {

    const element =
        document.createElement(
            "div"
        );


    element.className = [

        "shelf-book",

        `height-${book.height}`,

        `thickness-${book.thickness}`,

        `book-style-${book.style}`

    ]
        .join(
            " "
        );


    element.dataset.status =
        book.status;


    element.style.setProperty(
        "--book-color",
        book.spine_color
    );


    element.style.setProperty(
        "--book-text",
        book.text_color
    );


    element.title =
        book.author

            ?

            `${book.title} — ${book.author}`

            :

            book.title;


    if (
        book.spine_image
    ) {

        element.innerHTML = `

            <div
                class="book-spine custom-image"
                style="background-image:url('${safeStyleURL(book.spine_image)}')"
            >
            </div>

        `;

    }

    else {

        element.innerHTML = `

            <div class="book-spine">

                <div class="spine-inner">

                    <span class="spine-title">
                        ${escapeHTML(book.title)}
                    </span>

                    <span class="spine-ornament">
                        ${getBookOrnament(book.style)}
                    </span>

                </div>

            </div>

        `;

    }


    element.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll(
                    ".shelf-book"
                )
                .forEach(
                    item => {

                        item.classList.remove(
                            "selected"
                        );

                    }
                );


            element.classList.add(
                "selected"
            );


            const delay =
                settings.reducedMotion
                    ?
                    0
                    :
                    170;


            setTimeout(
                () => {

                    openBookReveal(
                        book.id
                    );

                },
                delay
            );

        }
    );


    return element;

}


/* =========================================================
   SORT BOOKS
   ========================================================= */

function sortShelfBooks(
    list,
    sort
) {

    const copy =
        [...list];


    switch (sort) {

        case "title":

            return copy.sort(
                (a,b) =>
                    a.title.localeCompare(
                        b.title
                    )
            );


        case "author":

            return copy.sort(
                (a,b) =>
                    a.author.localeCompare(
                        b.author
                    )
            );


        case "rating":

            return copy.sort(
                (a,b) =>
                    b.rating -
                    a.rating
            );


        case "finished":

            return copy.sort(
                (a,b) =>
                    String(
                        b.finished ||
                        ""
                    )
                    .localeCompare(
                        String(
                            a.finished ||
                            ""
                        )
                    )
            );


        default:

            return copy.sort(
                (a,b) =>
                    new Date(
                        a.created_at
                    )
                    -
                    new Date(
                        b.created_at
                    )
            );

    }

}


/* =========================================================
   METRICS
   ========================================================= */

function updateLibraryMetrics() {

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
   SHELF SELECT
   ========================================================= */

function renderShelfSelect() {

    const select =
        document.getElementById(
            "bookShelf"
        );


    if (!select) {

        return;

    }


    const previousValue =
        select.value;


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
            "Create a shelf first";


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


    if (
        shelves.some(
            shelf =>
                String(
                    shelf.id
                )
                ===
                String(
                    previousValue
                )
        )
    ) {

        select.value =
            previousValue;

    }

}


/* =========================================================
   SHELF DRAWER
   ========================================================= */

function openShelfDrawer(
    shelfId = null
) {

    resetShelfForm();


    renderDecorationOptions();


    if (shelfId) {

        loadShelfIntoForm(
            shelfId
        );

    }

    else {

        applyNewShelfDecorationDefaults();

    }


    showDrawer(
        "shelfDrawer"
    );

}


/* =========================================================
   RESET SHELF FORM
   ========================================================= */

function resetShelfForm() {

    document
        .getElementById(
            "shelfForm"
        )
        ?.reset();


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


    setText(
        "shelfDrawerTitle",
        "Create a shelf"
    );


    setText(
        "saveShelfLabel",
        "create shelf"
    );

}


/* =========================================================
   ACTIVE THEME CONFIG
   ========================================================= */

function getCurrentThemeConfig() {

    return CONFIG.themes?.find(
        theme =>
            theme.id ===
            settings.theme
    )
    ||
    null;

}


/* =========================================================
   DECORATION OPTIONS
   ========================================================= */

function renderDecorationOptions() {

    const container =
        document.querySelector(
            ".decoration-options"
        );


    if (!container) {

        return;

    }


    const theme =
        getCurrentThemeConfig();


    const types =
        theme?.defaultDecorations
        ||
        Object.keys(
            CONFIG.decorations ||
            {}
        );


    container.innerHTML =
        "";


    types.forEach(
        type => {

            const information =
                CONFIG.decorations?.[
                    type
                ];


            const label =
                document.createElement(
                    "label"
                );


            label.innerHTML = `

                <input
                    type="checkbox"
                    name="shelfDecoration"
                    value="${escapeHTML(type)}"
                >

                <span>
                    ${
                        escapeHTML(
                            information?.label ||
                            type
                        )
                    }
                </span>

            `;


            container.appendChild(
                label
            );

        }
    );

}


/* =========================================================
   DEFAULT NEW SHELF DECORATIONS
   ========================================================= */

function applyNewShelfDecorationDefaults() {

    const checkboxes = [

        ...document.querySelectorAll(
            '[name="shelfDecoration"]'
        )

    ];


    checkboxes.forEach(
        (
            checkbox,
            index
        ) => {

            checkbox.checked =
                index <
                3;

        }
    );

}


/* =========================================================
   UPDATE OPEN SHELF OPTIONS
   ========================================================= */

function updateOpenShelfDecorationChoices() {

    const drawer =
        document.getElementById(
            "shelfDrawer"
        );


    if (
        !drawer ||
        drawer.hidden
    ) {

        return;

    }


    renderDecorationOptions();

}


/* =========================================================
   LOAD SHELF INTO FORM
   ========================================================= */

function loadShelfIntoForm(
    id
) {

    const shelf =
        getShelfById(
            id
        );


    if (!shelf) {

        return;

    }


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
        shelf.decorations.map(
            decoration =>
                decoration.type
        );


    document
        .querySelectorAll(
            '[name="shelfDecoration"]'
        )
        .forEach(
            checkbox => {

                checkbox.checked =
                    selectedTypes.includes(
                        checkbox.value
                    );

            }
        );


    setText(
        "shelfDrawerTitle",
        "Edit shelf"
    );


    setText(
        "saveShelfLabel",
        "save shelf"
    );

}


/* =========================================================
   SAVE SHELF
   ========================================================= */

function saveShelfFromForm(
    event
) {

    event.preventDefault();


    const name =
        getValue(
            "shelfName"
        );


    if (!name) {

        return;

    }


    const editingId =
        getValue(
            "editingShelfId"
        );


    const existing =
        editingId

            ?

            getShelfById(
                editingId
            )

            :

            null;


    const selectedTypes = [

        ...document.querySelectorAll(
            '[name="shelfDecoration"]:checked'
        )

    ]
        .map(
            input =>
                input.value
        );


    const existingDecorations =
        existing?.decorations ||
        [];


    const decorations =
        selectedTypes.map(
            (
                type,
                index
            ) => {

                const saved =
                    existingDecorations.find(
                        decoration =>
                            decoration.type ===
                            type
                    );


                if (saved) {

                    return saved;

                }


                return createDecorationRecord(

                    type,

                    getDefaultDecorationPosition(
                        index
                    )

                );

            }
        );


    const record = {

        id:
            editingId ||
            generateId(),

        name,

        description:
            getValue(
                "shelfDescription"
            ),

        material:
            getValue(
                "shelfMaterial"
            )
            ||
            "walnut",

        mood:
            getValue(
                "shelfMood"
            )
            ||
            "cozy",

        layout:
            getValue(
                "shelfLayout"
            )
            ||
            "mixed",

        sort:
            getValue(
                "shelfSort"
            )
            ||
            "manual",

        decorations,

        created_at:
            existing?.created_at
            ||
            new Date()
                .toISOString(),

        updated_at:
            new Date()
                .toISOString()

    };


    if (editingId) {

        const index =
            shelves.findIndex(
                shelf =>
                    String(
                        shelf.id
                    )
                    ===
                    String(
                        editingId
                    )
            );


        if (
            index >=
            0
        ) {

            shelves[
                index
            ] =
                record;

        }

    }

    else {

        shelves.push(
            record
        );

    }


    saveShelves();

    closeDrawers();

    renderLibrary();

}


/* =========================================================
   BOOK DRAWER
   ========================================================= */

function openBookDrawer(
    bookId = null,
    shelfId = null
) {

    if (
        !shelves.length
        &&
        !bookId
    ) {

        openShelfDrawer();

        return;

    }


    resetBookForm();


    if (bookId) {

        loadBookIntoForm(
            bookId
        );

    }

    else if (shelfId) {

        setValue(
            "bookShelf",
            shelfId
        );

    }


    showDrawer(
        "bookDrawer"
    );

}


/* =========================================================
   RESET BOOK FORM
   ========================================================= */

function resetBookForm() {

    document
        .getElementById(
            "bookForm"
        )
        ?.reset();


    pendingCoverData =
        "";


    pendingSpineData =
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
        "bookCurrentPage",
        "0"
    );


    setValue(
        "bookTimesRead",
        "0"
    );


    setValue(
        "bookSpineColor",
        getThemeBookColor()
    );


    setValue(
        "bookTextColor",
        getThemeBookTextColor()
    );


    setValue(
        "bookHeight",
        "medium"
    );


    setValue(
        "bookThickness",
        "medium"
    );


    setValue(
        "bookStyle",
        "classic"
    );


    renderShelfSelect();


    setText(
        "bookDrawerTitle",
        "Add a book"
    );


    setText(
        "saveBookLabel",
        "tuck it in"
    );

}


/* =========================================================
   THEME BOOK COLORS
   ========================================================= */

function getThemeBookColor() {

    const colors = {

        haunted:
            "#6c2633",

        autumn:
            "#ad5b37",

        forest:
            "#536848",

        retro:
            "#738637",

        ghosts:
            "#b86b5a"

    };


    return colors[
        settings.theme
    ]
    ||
    "#6c2633";

}


function getThemeBookTextColor() {

    const colors = {

        haunted:
            "#eadfca",

        autumn:
            "#fff0df",

        forest:
            "#e6e5ce",

        retro:
            "#e2ddaa",

        ghosts:
            "#fff0e7"

    };


    return colors[
        settings.theme
    ]
    ||
    "#eadfca";

}


/* =========================================================
   LOAD BOOK FORM
   ========================================================= */

function loadBookIntoForm(
    id
) {

    const book =
        getBookById(
            id
        );


    if (!book) {

        return;

    }


    pendingCoverData =
        book.cover_image;


    pendingSpineData =
        book.spine_image;


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
        book.publication_year
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
        "bookSpineColor",
        book.spine_color
    );


    setValue(
        "bookTextColor",
        book.text_color
    );


    setValue(
        "bookHeight",
        book.height
    );


    setValue(
        "bookThickness",
        book.thickness
    );


    setValue(
        "bookStyle",
        book.style
    );


    setText(
        "bookDrawerTitle",
        "Edit book"
    );


    setText(
        "saveBookLabel",
        "save changes"
    );

}


/* =========================================================
   SAVE BOOK
   ========================================================= */

function saveBookFromForm(
    event
) {

    event.preventDefault();


    const title =
        getValue(
            "bookTitle"
        );


    const shelfId =
        getValue(
            "bookShelf"
        );


    if (
        !title ||
        !shelfId
    ) {

        return;

    }


    const editingId =
        getValue(
            "editingBookId"
        );


    const existing =
        editingId

            ?

            getBookById(
                editingId
            )

            :

            null;


    const pages =
        normalizeNumber(
            getValue(
                "bookPages"
            )
        );


    let currentPage =
        normalizeNumber(
            getValue(
                "bookCurrentPage"
            )
        );


    if (
        pages >
        0
    ) {

        currentPage =
            Math.min(
                currentPage,
                pages
            );

    }


    const record = {

        id:
            editingId ||
            generateId(),

        shelf_id:
            shelfId,

        title,

        author:
            getValue(
                "bookAuthor"
            ),

        genre:
            getValue(
                "bookGenre"
            ),

        publication_year:
            getValue(
                "bookYear"
            ),

        pages,

        isbn:
            getValue(
                "bookISBN"
            ),

        series:
            getValue(
                "bookSeries"
            ),

        status:
            normalizeBookStatus(
                getValue(
                    "bookStatus"
                )
            ),

        rating:
            normalizeNumber(
                getValue(
                    "bookRating"
                )
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
            currentPage,

        times_read:
            normalizeNumber(
                getValue(
                    "bookTimesRead"
                )
            ),

        cover_image:
            pendingCoverData,

        spine_image:
            pendingSpineData,

        spine_color:
            getValue(
                "bookSpineColor"
            )
            ||
            getThemeBookColor(),

        text_color:
            getValue(
                "bookTextColor"
            )
            ||
            getThemeBookTextColor(),

        height:
            getValue(
                "bookHeight"
            )
            ||
            "medium",

        thickness:
            getValue(
                "bookThickness"
            )
            ||
            "medium",

        style:
            getValue(
                "bookStyle"
            )
            ||
            "classic",

        journal:
            existing?.journal
            ||
            normalizeJournal(),

        created_at:
            existing?.created_at
            ||
            new Date()
                .toISOString(),

        updated_at:
            new Date()
                .toISOString()

    };


    if (editingId) {

        const index =
            books.findIndex(
                book =>
                    String(
                        book.id
                    )
                    ===
                    String(
                        editingId
                    )
            );


        if (
            index >=
            0
        ) {

            books[
                index
            ] =
                record;

        }

    }

    else {

        books.push(
            record
        );

    }


    saveBooks();

    closeDrawers();

    renderLibrary();

}


/* =========================================================
   IMAGE UPLOADS
   ========================================================= */

async function handleCoverUpload(
    event
) {

    const file =
        event.target.files?.[
            0
        ];


    if (!file) {

        return;

    }


    pendingCoverData =
        await fileToDataURL(
            file
        );

}


async function handleSpineUpload(
    event
) {

    const file =
        event.target.files?.[
            0
        ];


    if (!file) {

        return;

    }


    pendingSpineData =
        await fileToDataURL(
            file
        );

}


function fileToDataURL(
    file
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const reader =
                new FileReader();


            reader.onload =
                () =>
                    resolve(
                        reader.result
                    );


            reader.onerror =
                reject;


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   DRAWERS
   ========================================================= */

function showDrawer(
    drawerId
) {

    hideAllDrawersImmediately();


    const drawer =
        document.getElementById(
            drawerId
        );


    const overlay =
        document.getElementById(
            "overlay"
        );


    if (
        !drawer ||
        !overlay
    ) {

        return;

    }


    drawer.hidden =
        false;


    overlay.hidden =
        false;


    requestAnimationFrame(
        () => {

            drawer.classList.add(
                "open"
            );


            overlay.classList.add(
                "open"
            );

        }
    );


    document.body.classList.add(
        "modal-open"
    );

}


function hideAllDrawersImmediately() {

    const overlay =
        document.getElementById(
            "overlay"
        );


    if (overlay) {

        overlay.hidden =
            true;


        overlay.classList.remove(
            "open"
        );

    }


    document
        .querySelectorAll(
            ".form-drawer"
        )
        .forEach(
            drawer => {

                drawer.hidden =
                    true;


                drawer.classList.remove(
                    "open"
                );

            }
        );

}


function closeDrawers() {

    const overlay =
        document.getElementById(
            "overlay"
        );


    const drawers =
        document.querySelectorAll(
            ".form-drawer"
        );


    overlay?.classList.remove(
        "open"
    );


    drawers.forEach(
        drawer => {

            drawer.classList.remove(
                "open"
            );

        }
    );


    const delay =
        settings.reducedMotion
            ?
            0
            :
            250;


    setTimeout(
        () => {

            if (overlay) {

                overlay.hidden =
                    true;

            }


            drawers.forEach(
                drawer => {

                    drawer.hidden =
                        true;

                }
            );

        },
        delay
    );


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   BOOK REVEAL
   ========================================================= */

function openBookReveal(
    id
) {

    const book =
        getBookById(
            id
        );


    if (!book) {

        return;

    }


    selectedBookId =
        book.id;


    renderCoverInto(
        "revealCover",
        book
    );


    setText(
        "revealStatus",
        getStatusLabel(
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
        "Author not recorded"
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
        `${book.current_page} / ${book.pages || 0} pages`
    );


    const percentage =
        getProgressPercent(
            book
        );


    setText(
        "revealPercent",
        `${percentage}%`
    );


    const bar =
        document.getElementById(
            "revealProgressBar"
        );


    if (bar) {

        bar.style.width =
            `${percentage}%`;

    }


    const bookmark =
        document.getElementById(
            "progressBookmark"
        );


    if (bookmark) {

        bookmark.style.left =
            `${percentage}%`;

    }


    renderRating(
        book.rating
    );


    const reveal =
        document.getElementById(
            "bookReveal"
        );


    if (reveal) {

        reveal.hidden =
            false;

    }


    document.body.classList.add(
        "modal-open"
    );

}


function closeBookReveal() {

    const reveal =
        document.getElementById(
            "bookReveal"
        );


    if (reveal) {

        reveal.hidden =
            true;

    }


    document.body.classList.remove(
        "modal-open"
    );

}


function editSelectedBook() {

    const id =
        selectedBookId;


    closeBookReveal();


    if (!id) {

        return;

    }


    openBookDrawer(
        id
    );

}


/* =========================================================
   COVER
   ========================================================= */

function renderCoverInto(
    elementId,
    book
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        return;

    }


    element.innerHTML =
        "";


    element.style.backgroundImage =
        "";


    element.style.backgroundColor =
        book.spine_color;


    if (
        book.cover_image
    ) {

        element.style.backgroundImage =
            `url("${safeStyleURL(book.cover_image)}")`;


        return;

    }


    element.innerHTML = `

        <div class="generated-cover">

            <span class="cover-ornament">
                ${getBookOrnament(book.style)}
            </span>

            <strong>
                ${escapeHTML(book.title)}
            </strong>

            <span>
                ${escapeHTML(book.author || "")}
            </span>

        </div>

    `;

}


/* =========================================================
   RATING
   ========================================================= */

function renderRating(
    rating
) {

    const element =
        document.getElementById(
            "revealRating"
        );


    if (!element) {

        return;

    }


    if (!rating) {

        element.textContent =
            "not rated yet";

        return;

    }


    element.textContent =

        "★".repeat(
            Math.min(
                5,
                rating
            )
        )

        +

        "☆".repeat(
            Math.max(
                0,
                5 - rating
            )
        );

}


/* =========================================================
   READING BOOK
   ========================================================= */

function openReadingBook() {

    const book =
        getBookById(
            selectedBookId
        );


    if (!book) {

        return;

    }


    closeBookReveal();


    setText(
        "journalBookTitle",
        book.title
    );


    setText(
        "journalBookAuthor",
        book.author ||
        "Author not recorded"
    );


    setText(
        "journalStatus",
        getStatusLabel(
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
        `${book.current_page} / ${book.pages || 0}`
    );


    renderCoverInto(
        "journalCover",
        book
    );


    showJournalContents();


    const readingBook =
        document.getElementById(
            "readingBook"
        );


    if (readingBook) {

        readingBook.hidden =
            false;

    }


    document.body.classList.add(
        "modal-open"
    );

}


function closeReadingBook() {

    const element =
        document.getElementById(
            "readingBook"
        );


    if (element) {

        element.hidden =
            true;

    }


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   JOURNAL
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


    if (contents) {

        contents.hidden =
            false;

    }


    if (section) {

        section.hidden =
            true;

    }

}


function openJournalSection(
    section
) {

    selectedJournalSection =
        section;


    document.getElementById(
        "journalContents"
    ).hidden =
        true;


    document.getElementById(
        "journalSection"
    ).hidden =
        false;


    setText(
        "journalSectionLabel",
        getSectionLabel(
            section
        )
    );


    setText(
        "journalSectionTitle",
        getSectionTitle(
            section
        )
    );


    renderJournalEntries();

}


/* =========================================================
   JOURNAL LABELS
   ========================================================= */

function getSectionLabel(
    section
) {

    const labels = {

        overview:
            "ABOUT THIS BOOK",

        notes:
            "MARGINAL NOTES",

        thoughts:
            "THINGS I'M THINKING",

        words:
            "LITTLE WORDS",

        quotes:
            "WORDS WORTH KEEPING",

        characters:
            "PEOPLE IN THESE PAGES",

        themes:
            "THREADS & THEMES",

        questions:
            "THINGS I'M WONDERING",

        review:
            "WHEN THE BOOK IS DONE"

    };


    return labels[
        section
    ]
    ||
    "";

}


function getSectionTitle(
    section
) {

    const titles = {

        overview:
            "Overview",

        notes:
            "My notes",

        thoughts:
            "My thoughts",

        words:
            "Word study",

        quotes:
            "Saved quotes",

        characters:
            "Characters",

        themes:
            "Themes",

        questions:
            "Questions",

        review:
            "My review"

    };


    return titles[
        section
    ]
    ||
    section;

}


/* =========================================================
   RENDER JOURNAL ENTRIES
   ========================================================= */

function renderJournalEntries() {

    const container =
        document.getElementById(
            "journalEntries"
        );


    const addButton =
        document.getElementById(
            "addJournalEntry"
        );


    const book =
        getBookById(
            selectedBookId
        );


    if (
        !container ||
        !book
    ) {

        return;

    }


    container.innerHTML =
        "";


    if (
        selectedJournalSection ===
        "overview"
    ) {

        addButton.hidden =
            true;


        renderOverview(
            container,
            book
        );


        return;

    }


    addButton.hidden =
        false;


    const entries =
        book.journal[
            selectedJournalSection
        ]
        ||
        [];


    if (
        !entries.length
    ) {

        container.innerHTML = `

            <div class="empty-journal-section">

                Nothing has been written here yet.

                <br><br>

                Add your first
                ${escapeHTML(
                    getSingularEntryName(
                        selectedJournalSection
                    )
                )}.

            </div>

        `;


        return;

    }


    entries
        .slice()
        .reverse()
        .forEach(
            entry => {

                container.appendChild(
                    createJournalEntry(
                        entry,
                        selectedJournalSection
                    )
                );

            }
        );

}


/* =========================================================
   OVERVIEW
   ========================================================= */

function renderOverview(
    container,
    book
) {

    container.innerHTML = `

        <article class="journal-entry">

            <div class="journal-entry-header">

                <strong>
                    ${escapeHTML(book.title)}
                </strong>

                <small>
                    ${getProgressPercent(book)}% read
                </small>

            </div>

            <p>

                Author:
                ${escapeHTML(book.author || "—")}

                <br>

                Genre:
                ${escapeHTML(book.genre || "—")}

                <br>

                Publication year:
                ${escapeHTML(book.publication_year || "—")}

                <br>

                Pages:
                ${book.pages || "—"}

                <br>

                Series:
                ${escapeHTML(book.series || "—")}

            </p>

        </article>

    `;

}


/* =========================================================
   JOURNAL ENTRY DISPLAY
   ========================================================= */

function createJournalEntry(
    entry,
    section
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "journal-entry";


    card.innerHTML = `

        <div class="journal-entry-header">

            <strong>
                ${escapeHTML(
                    getEntryHeading(
                        entry,
                        section
                    )
                )}
            </strong>

            <small>
                ${escapeHTML(
                    formatDate(
                        entry.date
                    )
                )}
            </small>

        </div>


        <p>
            ${escapeHTML(
                getEntryBody(
                    entry,
                    section
                )
            )}
        </p>

    `;


    return card;

}


function getEntryHeading(
    entry,
    section
) {

    if (
        section ===
        "words"
    ) {

        return entry.word ||
        "New word";

    }


    if (
        section ===
        "characters"
    ) {

        return entry.name ||
        "Character";

    }


    if (
        section ===
        "themes"
    ) {

        return entry.theme ||
        "Theme";

    }


    return entry.title ||
    getSectionTitle(
        section
    );

}


function getEntryBody(
    entry,
    section
) {

    switch (section) {

        case "words":

            return [

                entry.definition,

                entry.context,

                entry.sentence

            ]
            .filter(Boolean)
            .join("\n\n");


        case "quotes":

            return [

                entry.quote,

                entry.reason

            ]
            .filter(Boolean)
            .join("\n\n");


        case "characters":

            return [

                entry.role,

                entry.notes

            ]
            .filter(Boolean)
            .join("\n\n");


        case "themes":

            return entry.notes ||
            "";


        case "questions":

            return [

                entry.question,

                entry.answer

            ]
            .filter(Boolean)
            .join("\n\n");


        case "review":

            return [

                entry.review,

                entry.learned,

                entry.stayed

            ]
            .filter(Boolean)
            .join("\n\n");


        default:

            return entry.body ||
            "";

    }

}


/* =========================================================
   ENTRY MODAL
   ========================================================= */

function openEntryModal() {

    if (
        !selectedJournalSection
        ||
        selectedJournalSection ===
        "overview"
    ) {

        return;

    }


    setValue(
        "entrySection",
        selectedJournalSection
    );


    setText(
        "entryModalTitle",
        `Add ${getSingularEntryName(selectedJournalSection)}`
    );


    renderEntryFields(
        selectedJournalSection
    );


    document.getElementById(
        "entryModal"
    ).hidden =
        false;

}


function closeEntryModal() {

    const modal =
        document.getElementById(
            "entryModal"
        );


    if (modal) {

        modal.hidden =
            true;

    }

}


/* =========================================================
   ENTRY FIELDS
   ========================================================= */

function renderEntryFields(
    section
) {

    const container =
        document.getElementById(
            "entryDynamicFields"
        );


    if (!container) {

        return;

    }


    const dateField = `

        <div class="entry-field">

            <label>
                Date
            </label>

            <input
                id="entryDate"
                type="date"
                value="${todayISO()}"
            >

        </div>

    `;


    if (
        section ===
        "notes"
        ||
        section ===
        "thoughts"
    ) {

        container.innerHTML = `

            <div class="entry-field full">

                <label>
                    Heading
                </label>

                <input
                    id="entryTitle"
                    type="text"
                >

            </div>


            <div class="entry-field">

                <label>
                    Page
                </label>

                <input
                    id="entryPage"
                    type="number"
                >

            </div>


            ${dateField}


            <div class="entry-field full">

                <label>
                    Entry
                </label>

                <textarea
                    id="entryBody"
                    rows="7"
                ></textarea>

            </div>

        `;


        return;

    }


    if (
        section ===
        "words"
    ) {

        container.innerHTML = `

            <div class="entry-field full">

                <label>Word</label>

                <input
                    id="entryWord"
                    required
                >

            </div>

            ${dateField}

            <div class="entry-field full">

                <label>Definition</label>

                <textarea
                    id="entryDefinition"
                ></textarea>

            </div>

            <div class="entry-field full">

                <label>Context</label>

                <textarea
                    id="entryContext"
                ></textarea>

            </div>

            <div class="entry-field full">

                <label>My sentence</label>

                <textarea
                    id="entrySentence"
                ></textarea>

            </div>

        `;


        return;

    }


    if (
        section ===
        "quotes"
    ) {

        container.innerHTML = `

            <div class="entry-field full">

                <label>Quote</label>

                <textarea
                    id="entryQuote"
                    rows="6"
                    required
                ></textarea>

            </div>

            ${dateField}

            <div class="entry-field full">

                <label>Why I saved it</label>

                <textarea
                    id="entryReason"
                ></textarea>

            </div>

        `;


        return;

    }


    if (
        section ===
        "characters"
    ) {

        container.innerHTML = `

            <div class="entry-field full">

                <label>Name</label>

                <input
                    id="entryName"
                    required
                >

            </div>

            ${dateField}

            <div class="entry-field full">

                <label>Role</label>

                <input
                    id="entryRole"
                >

            </div>

            <div class="entry-field full">

                <label>Notes</label>

                <textarea
                    id="entryNotes"
                ></textarea>

            </div>

        `;


        return;

    }


    if (
        section ===
        "themes"
    ) {

        container.innerHTML = `

            <div class="entry-field full">

                <label>Theme</label>

                <input
                    id="entryTheme"
                    required
                >

            </div>

            ${dateField}

            <div class="entry-field full">

                <label>Notes</label>

                <textarea
                    id="entryNotes"
                ></textarea>

            </div>

        `;


        return;

    }


    if (
        section ===
        "questions"
    ) {

        container.innerHTML = `

            <div class="entry-field full">

                <label>Question</label>

                <textarea
                    id="entryQuestion"
                    required
                ></textarea>

            </div>

            ${dateField}

            <div class="entry-field full">

                <label>Answer / thoughts</label>

                <textarea
                    id="entryAnswer"
                ></textarea>

            </div>

        `;


        return;

    }


    if (
        section ===
        "review"
    ) {

        container.innerHTML = `

            <div class="entry-field full">

                <label>Review title</label>

                <input
                    id="entryTitle"
                >

            </div>

            ${dateField}

            <div class="entry-field full">

                <label>Review</label>

                <textarea
                    id="entryReview"
                    rows="7"
                ></textarea>

            </div>

            <div class="entry-field full">

                <label>What I learned</label>

                <textarea
                    id="entryLearned"
                ></textarea>

            </div>

            <div class="entry-field full">

                <label>What stayed with me</label>

                <textarea
                    id="entryStayed"
                ></textarea>

            </div>

        `;

    }

}


/* =========================================================
   SAVE JOURNAL ENTRY
   ========================================================= */

function saveJournalEntry(
    event
) {

    event.preventDefault();


    const book =
        getBookById(
            selectedBookId
        );


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


    book.journal[
        section
    ]
        .push(
            buildEntryFromForm(
                section
            )
        );


    saveBooks();

    closeEntryModal();

    renderJournalEntries();

}


/* =========================================================
   BUILD ENTRY
   ========================================================= */

function buildEntryFromForm(
    section
) {

    const base = {

        id:
            generateId(),

        date:
            getValue(
                "entryDate"
            )
            ||
            todayISO()

    };


    if (
        section ===
        "notes"
        ||
        section ===
        "thoughts"
    ) {

        return {

            ...base,

            title:
                getValue(
                    "entryTitle"
                ),

            page:
                getValue(
                    "entryPage"
                ),

            body:
                getValue(
                    "entryBody"
                )

        };

    }


    if (
        section ===
        "words"
    ) {

        return {

            ...base,

            word:
                getValue(
                    "entryWord"
                ),

            definition:
                getValue(
                    "entryDefinition"
                ),

            context:
                getValue(
                    "entryContext"
                ),

            sentence:
                getValue(
                    "entrySentence"
                )

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
                ),

            reason:
                getValue(
                    "entryReason"
                )

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
                    "entryName"
                ),

            role:
                getValue(
                    "entryRole"
                ),

            notes:
                getValue(
                    "entryNotes"
                )

        };

    }


    if (
        section ===
        "themes"
    ) {

        return {

            ...base,

            theme:
                getValue(
                    "entryTheme"
                ),

            notes:
                getValue(
                    "entryNotes"
                )

        };

    }


    if (
        section ===
        "questions"
    ) {

        return {

            ...base,

            question:
                getValue(
                    "entryQuestion"
                ),

            answer:
                getValue(
                    "entryAnswer"
                )

        };

    }


    return {

        ...base,

        title:
            getValue(
                "entryTitle"
            ),

        review:
            getValue(
                "entryReview"
            ),

        learned:
            getValue(
                "entryLearned"
            ),

        stayed:
            getValue(
                "entryStayed"
            )

    };

}


/* =========================================================
   ENTRY NAME
   ========================================================= */

function getSingularEntryName(
    section
) {

    const names = {

        notes:
            "note",

        thoughts:
            "thought",

        words:
            "word",

        quotes:
            "quote",

        characters:
            "character",

        themes:
            "theme",

        questions:
            "question",

        review:
            "review"

    };


    return names[
        section
    ]
    ||
    "entry";

}


/* =========================================================
   BOOK ORNAMENT
   ========================================================= */

function getBookOrnament(
    style
) {

    const ornaments = {

        classic:
            "◇",

        floral:
            "✿",

        botanical:
            "❧",

        celestial:
            "✦",

        pastel:
            "♡",

        gothic:
            "◆",

        minimal:
            "·"

    };


    return ornaments[
        style
    ]
    ||
    "◇";

}


/* =========================================================
   STATUS
   ========================================================= */

function getStatusLabel(
    status
) {

    const labels = {

        want:
            "want to read",

        reading:
            "currently reading",

        paused:
            "paused for now",

        finished:
            "finished",

        dnf:
            "did not finish",

        reference:
            "kept for reference"

    };


    return labels[
        status
    ]
    ||
    status;

}


function normalizeBookStatus(
    status
) {

    const allowed = [

        "want",
        "reading",
        "paused",
        "finished",
        "dnf",
        "reference"

    ];


    return allowed.includes(
        status
    )
        ?
        status
        :
        "want";

}


/* =========================================================
   PROGRESS
   ========================================================= */

function getProgressPercent(
    book
) {

    if (
        !book.pages
    ) {

        return 0;

    }


    return Math.min(

        100,

        Math.max(

            0,

            Math.round(
                (
                    book.current_page /
                    book.pages
                )
                *
                100
            )

        )

    );

}


/* =========================================================
   SAVE
   ========================================================= */

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


/* =========================================================
   LOOKUPS
   ========================================================= */

function getShelfById(
    id
) {

    return shelves.find(
        shelf =>
            String(
                shelf.id
            )
            ===
            String(
                id
            )
    )
    ||
    null;

}


function getBookById(
    id
) {

    return books.find(
        book =>
            String(
                book.id
            )
            ===
            String(
                id
            )
    )
    ||
    null;

}


/* =========================================================
   DATE
   ========================================================= */

function todayISO() {

    const date =
        new Date();


    return [

        date.getFullYear(),

        String(
            date.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        ),

        String(
            date.getDate()
        )
        .padStart(
            2,
            "0"
        )

    ]
    .join(
        "-"
    );

}


function formatDate(
    value
) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(
            `${value}T12:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

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


/* =========================================================
   NORMALIZERS
   ========================================================= */

function normalizeNumber(
    value
) {

    const number =
        Number(
            value
        );


    if (
        Number.isNaN(
            number
        )
    ) {

        return 0;

    }


    return Math.max(
        0,
        Math.round(
            number
        )
    );

}


function normalizePercent(
    value,
    fallback = 50
) {

    const number =
        Number(
            value
        );


    if (
        Number.isNaN(
            number
        )
    ) {

        return fallback;

    }


    return clamp(
        number,
        0,
        100
    );

}


function normalizeScale(
    value
) {

    const number =
        Number(
            value
        );


    if (
        Number.isNaN(
            number
        )
    ) {

        return 1;

    }


    return clamp(
        number,
        .5,
        2
    );

}


function normalizeRotation(
    value
) {

    const number =
        Number(
            value
        );


    if (
        Number.isNaN(
            number
        )
    ) {

        return 0;

    }


    return clamp(
        number,
        -45,
        45
    );

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
            value
        )
    );

}


/* =========================================================
   ID
   ========================================================= */

function generateId() {

    if (
        window.crypto
        &&
        typeof window.crypto.randomUUID ===
        "function"
    ) {

        return window.crypto.randomUUID();

    }


    return (
        Date.now()
        +
        "-"
        +
        Math.random()
            .toString(16)
            .slice(2)
    );

}


/* =========================================================
   FORM HELPERS
   ========================================================= */

function getValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return "";

    }


    return String(
        element.value ??
        ""
    )
    .trim();

}


function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.value =
            value ??
            "";

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


    if (element) {

        element.textContent =
            value ??
            "";

    }

}


function setChecked(
    id,
    checked
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.checked =
            Boolean(
                checked
            );

    }

}


/* =========================================================
   SAFE URL
   ========================================================= */

function safeStyleURL(
    value
) {

    return String(
        value ||
        ""
    )
    .replace(
        /"/g,
        "%22"
    )
    .replace(
        /\n/g,
        ""
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ??
        ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}
