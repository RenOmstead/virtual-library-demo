/* =========================================================
   SHELFMARK
   LIBRARY.JS
   v14 — ILLUSTRATED BOOKS + TITLE FITTING
   ========================================================= */


/* =========================================================
   CONFIG + STORAGE
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
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeShelfmark
);

function initializeShelfmark() {

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
        "themeDrawer",
        "shelfDrawer",
        "bookDrawer",
        "overlay",
        "bookReveal",
        "readingBook",
        "entryModal",
        "progressModal"
    ].forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.hidden = true;
        }

    });

}


/* =========================================================
   LOAD / SAVE
   ========================================================= */

function loadData() {

    shelves =
        loadCollection(
            STORAGE_KEYS.shelves
        ).map(normalizeShelf);

    books =
        loadCollection(
            STORAGE_KEYS.books
        ).map(normalizeBook);

    syncSharedData();

}

function loadCollection(key) {

    try {

        const saved =
            localStorage.getItem(key);

        if (!saved) {
            return [];
        }

        const parsed =
            JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : [];

    }

    catch (error) {

        console.error(
            `Could not load ${key}.`,
            error
        );

        return [];

    }

}

function saveShelves() {

    localStorage.setItem(
        STORAGE_KEYS.shelves,
        JSON.stringify(shelves)
    );

    syncSharedData();

}

function saveBooks() {

    localStorage.setItem(
        STORAGE_KEYS.books,
        JSON.stringify(books)
    );

    syncSharedData();

}

function saveSettings() {

    localStorage.setItem(
        STORAGE_KEYS.settings,
        JSON.stringify(settings)
    );

}

function syncSharedData() {

    window.SHELFMARK_DATA = {
        shelves,
        books
    };

}


/* =========================================================
   NORMALIZE SHELF
   ========================================================= */

function normalizeShelf(shelf) {

    return {
        id:
            shelf.id ||
            generateId(),

        name:
            shelf.name ||
            "My Shelf",

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
            new Date().toISOString()
    };

}


/* =========================================================
   NORMALIZE DECORATIONS
   ========================================================= */

function normalizeDecorations(value) {

    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map(item => {

            if (typeof item === "string") {

                return createDecorationRecord(
                    item
                );

            }

            return {
                id:
                    item.id ||
                    generateId(),

                type:
                    item.type ||
                    "stars",

                x:
                    normalizePercent(
                        item.x,
                        CONFIG.decorationDefaults?.x ??
                        50
                    ),

                y:
                    normalizePercent(
                        item.y,
                        CONFIG.decorationDefaults?.y ??
                        72
                    ),

                scale:
                    normalizeScale(
                        item.scale
                    ),

                rotate:
                    Number(
                        item.rotate ??
                        0
                    )
            };

        })
        .filter(item => item.type);

}


/* =========================================================
   NORMALIZE BOOK
   ========================================================= */

function normalizeBook(book) {

    const defaults =
        CONFIG.defaultBookDesign ||
        {};

    return {
        id:
            book.id ||
            generateId(),

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
            normalizeNumber(
                book.year
            ),

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

        shelf_id:
            book.shelf_id ||
            "",

        status:
            book.status ||
            "want",

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

        style:
            book.style ||
            defaults.style ||
            "classic",

        spine_color:
            book.spine_color ||
            defaults.spineColor ||
            "#6c2633",

        text_color:
            book.text_color ||
            defaults.textColor ||
            "#eadfca",

        accent_color:
            book.accent_color ||
            defaults.accentColor ||
            "#b28a4a",

        spine_font:
            book.spine_font ||
            defaults.spineFont ||
            "serif",

        spine_font_size:
            book.spine_font_size ||
            defaults.fontSize ||
            "medium",

        spine_font_weight:
            book.spine_font_weight ||
            defaults.fontWeight ||
            "regular",

        spine_letter_spacing:
            book.spine_letter_spacing ||
            defaults.letterSpacing ||
            "normal",

        spine_case:
            book.spine_case ||
            defaults.textCase ||
            "typed",

        spine_font_style:
            book.spine_font_style ||
            defaults.fontStyle ||
            "normal",

        spine_text_align:
            book.spine_text_align ||
            defaults.textAlign ||
            "center",

        spine_title_panel:
            book.spine_title_panel ||
            defaults.titlePanel ||
            "none",

        spine_ornament:
            book.spine_ornament ||
            defaults.ornament ||
            "auto",

        height:
            book.height ||
            defaults.height ||
            "medium",

        thickness:
            book.thickness ||
            defaults.thickness ||
            "medium",

        journal:
            normalizeJournal(
                book.journal
            ),

        created_at:
            book.created_at ||
            new Date().toISOString(),

        updated_at:
            book.updated_at ||
            new Date().toISOString()
    };

}


/* =========================================================
   JOURNAL NORMALIZATION
   ========================================================= */

function normalizeJournal(journal = {}) {

    const result = {};

    [
        "notes",
        "thoughts",
        "words",
        "quotes",
        "characters",
        "themes",
        "questions",
        "review"
    ].forEach(section => {

        result[section] =
            Array.isArray(
                journal?.[section]
            )
                ? journal[section]
                : [];

    });

    return result;

}


/* =========================================================
   LEGACY MIGRATION
   ========================================================= */

function migrateLegacyBooks() {

    let changed = false;

    books.forEach(book => {

        if (
            Object.prototype.hasOwnProperty.call(
                book,
                "spine_image"
            )
        ) {

            delete book.spine_image;

            changed = true;

        }

    });

    if (changed) {
        saveBooks();
    }

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
            ...JSON.parse(saved)
        };

    }

    catch (error) {

        console.error(
            "Could not load settings.",
            error
        );

    }

}

function applySettings() {

    applyTheme(
        settings.theme,
        false
    );

    document.body.classList.toggle(
        "ambient-candle",
        Boolean(
            settings.candleGlow
        )
    );

    document.body.classList.toggle(
        "ambient-dust",
        Boolean(
            settings.dust
        )
    );

    document.body.classList.toggle(
        "ambient-rain",
        Boolean(
            settings.rain
        )
    );

    document.body.classList.toggle(
        "ambient-oddities",
        Boolean(
            settings.oddities
        )
    );

    document.body.classList.toggle(
        "reduce-motion",
        Boolean(
            settings.reducedMotion
        )
    );

    document.body.dataset.decorationDensity =
        settings.decorationDensity ||
        "cozy";

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
            'input[name="decorationDensity"]'
        )
        .forEach(input => {

            input.checked =
                input.value ===
                settings.decorationDensity;

        });

    updateThemeCardState();

}


/* =========================================================
   THEME
   ========================================================= */

function applyTheme(
    themeId,
    shouldSave = true
) {

    const themes =
        CONFIG.themes ||
        [];

    const allowed =
        themes.map(
            theme =>
                theme.id
        );

    const nextTheme =
        allowed.includes(themeId)
            ? themeId
            : CONFIG.defaultTheme ||
              "haunted";

    allowed.forEach(theme => {

        document.body.classList.remove(
            `theme-${theme}`
        );

    });

    document.body.classList.add(
        `theme-${nextTheme}`
    );

    settings.theme =
        nextTheme;

    updateThemeCardState();

    updateOpenShelfDecorationChoices();

    if (shouldSave) {
        saveSettings();
    }

}

function updateThemeCardState() {

    document
        .querySelectorAll(
            ".theme-card"
        )
        .forEach(card => {

            card.classList.toggle(
                "active",
                card.dataset.theme ===
                settings.theme
            );

        });

}


/* =========================================================
   BIND CONTROLS
   ========================================================= */

function bindControls() {

    bindClick(
        "sidebarAddBook",
        () => openBookDrawer()
    );

    bindClick(
        "topAddBook",
        () => openBookDrawer()
    );

    bindClick(
        "emptyAddBook",
        () => openBookDrawer()
    );

    bindClick(
        "readingEmptyAddBook",
        () => openBookDrawer()
    );


    bindClick(
        "sidebarAddShelf",
        () => openShelfDrawer()
    );

    bindClick(
        "topAddShelf",
        () => openShelfDrawer()
    );

    bindClick(
        "emptyAddShelf",
        () => openShelfDrawer()
    );

    bindClick(
        "bottomAddShelf",
        () => openShelfDrawer()
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
        closeAllDrawers
    );

    bindClick(
        "closeShelfDrawer",
        closeAllDrawers
    );

    bindClick(
        "closeBookDrawer",
        closeAllDrawers
    );

    bindClick(
        "cancelShelf",
        closeAllDrawers
    );

    bindClick(
        "cancelBook",
        closeAllDrawers
    );

    bindClick(
        "overlay",
        closeAllDrawers
    );

     bindClick(
           "closeThemeSettingsButton",
         closeAllPanels
    );
    document
        .querySelectorAll(
            ".theme-card"
        )
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    applyTheme(
                        card.dataset.theme
                    );

                }
            );

        });


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
        .forEach(input => {

            input.addEventListener(
                "change",
                event => {

                    if (!event.target.checked) {
                        return;
                    }

                    settings.decorationDensity =
                        event.target.value;

                    document.body.dataset.decorationDensity =
                        settings.decorationDensity;

                    saveSettings();

                }
            );

        });


    document
        .getElementById(
            "shelfForm"
        )
        ?.addEventListener(
            "submit",
            saveShelfFromForm
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


    bindSpineControls();


    bindClick(
        "closeBookReveal",
        closeBookReveal
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
        "closeReadingBook",
        closeReadingBook
    );


    document
        .querySelectorAll(
            "[data-journal-section]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openJournalSection(
                        button.dataset.journalSection
                    );

                }
            );

        });


    bindClick(
        "backToContents",
        showJournalContents
    );

    bindClick(
        "addJournalEntry",
        openJournalEntryModal
    );

    bindClick(
        "closeEntryModal",
        closeEntryModal
    );

    bindClick(
        "cancelEntry",
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


    bindClick(
        "featuredOpenBook",
        () => {

            const id =
                document
                    .getElementById(
                        "featuredOpenBook"
                    )
                    ?.dataset.bookId;

            if (id) {
                openBookReveal(id);
            }

        }
    );


    bindClick(
        "featuredEditProgress",
        () => {

            const id =
                document
                    .getElementById(
                        "featuredEditProgress"
                    )
                    ?.dataset.bookId;

            if (id) {
                openProgressModal(id);
            }

        }
    );


    bindClick(
        "closeProgressModal",
        closeProgressModal
    );

    bindClick(
        "cancelProgressUpdate",
        closeProgressModal
    );


    document
        .getElementById(
            "progressCurrentPage"
        )
        ?.addEventListener(
            "input",
            updateProgressPreview
        );


    document
        .getElementById(
            "markBookFinished"
        )
        ?.addEventListener(
            "change",
            handleFinishedToggle
        );


    document
        .getElementById(
            "progressForm"
        )
        ?.addEventListener(
            "submit",
            saveProgressUpdate
        );


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
            closeProgressModal();
            closeReadingBook();
            closeBookReveal();
            closeAllDrawers();

        }
    );


    bindSectionNavigation();

}


/* =========================================================
   SPINE CONTROLS
   ========================================================= */

function bindSpineControls() {

    const controls = [
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
    ];

    controls.forEach(id => {

        const element =
            document.getElementById(id);

        if (!element) {
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

    });


    document
        .getElementById(
            "bookStyle"
        )
        ?.addEventListener(
            "change",
            handleSpineStyleChange
        );

}


/* =========================================================
   SETTINGS CHECKBOX
   ========================================================= */

function bindSettingCheckbox(
    id,
    settingKey,
    bodyClass
) {

    document
        .getElementById(id)
        ?.addEventListener(
            "change",
            event => {

                settings[settingKey] =
                    event.target.checked;

                document.body.classList.toggle(
                    bodyClass,
                    settings[settingKey]
                );

                saveSettings();

            }
        );

}


/* =========================================================
   RENDER ALL
   ========================================================= */

function renderAll() {

    renderLibrary();

    renderReadingNow();

    renderReadingStats();

}


/* =========================================================
   LIBRARY
   ========================================================= */

function renderLibrary() {

    updateLibrarySummary();

    populateBookShelfSelect();

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


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (!shelves.length) {

        if (empty) {
            empty.hidden = false;
        }

        if (addShelf) {
            addShelf.hidden = true;
        }

        return;

    }


    if (empty) {
        empty.hidden = true;
    }

    if (addShelf) {
        addShelf.hidden = false;
    }


    shelves.forEach(shelf => {

        container.appendChild(
            createShelfElement(
                shelf
            )
        );

    });


    requestAnimationFrame(
        fitAllSpineTitles
    );

}


/* =========================================================
   SUMMARY
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

    article.className = [
        "library-shelf",
        `shelf-${shelf.material}`,
        `shelf-mood-${shelf.mood}`,
        `shelf-layout-${shelf.layout}`
    ].join(" ");

    article.dataset.shelfId =
        shelf.id;


    article.innerHTML = `

        <div class="shelf-header">

            <div class="shelf-header-copy">

                <h2>
                    ${escapeHTML(
                        shelf.name
                    )}
                </h2>

                ${
                    shelf.description
                        ?
                        `
                        <p>
                            ${escapeHTML(
                                shelf.description
                            )}
                        </p>
                        `
                        :
                        ""
                }

            </div>


            <div class="shelf-actions">

                <button
                    class="shelf-action-button"
                    type="button"
                    data-add-book
                >
                    + book
                </button>

                <button
                    class="shelf-action-button"
                    type="button"
                    data-edit-shelf
                >
                    edit shelf
                </button>

                <button
                    class="shelf-action-button"
                    type="button"
                    data-delete-shelf
                >
                    remove
                </button>

            </div>

        </div>


        <div class="shelf-body">

            <div class="shelf-books-row">
            </div>

            <div class="shelf-board">
            </div>

        </div>

    `;


    const body =
        article.querySelector(
            ".shelf-body"
        );

    const row =
        article.querySelector(
            ".shelf-books-row"
        );

    const shelfBooks =
        getBooksForShelf(
            shelf
        );


    if (!shelfBooks.length) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "empty-shelf-message";

        empty.innerHTML = `

            <span>
                this shelf is waiting for a book.
            </span>

            <button type="button">
                tuck one in
            </button>

        `;


        empty
            .querySelector(
                "button"
            )
            ?.addEventListener(
                "click",
                () => {

                    openBookDrawer(
                        null,
                        shelf.id
                    );

                }
            );


        row.appendChild(
            empty
        );

    }

    else {

        shelfBooks.forEach(book => {

            row.appendChild(
                createBookElement(
                    book
                )
            );

        });

    }


    shelf.decorations.forEach(
        decoration => {

            body.appendChild(
                createDecorationElement(
                    shelf,
                    decoration
                )
            );

        }
    );


    article
        .querySelector(
            "[data-add-book]"
        )
        ?.addEventListener(
            "click",
            () => {

                openBookDrawer(
                    null,
                    shelf.id
                );

            }
        );


    article
        .querySelector(
            "[data-edit-shelf]"
        )
        ?.addEventListener(
            "click",
            () => {

                openShelfDrawer(
                    shelf.id
                );

            }
        );


    article
        .querySelector(
            "[data-delete-shelf]"
        )
        ?.addEventListener(
            "click",
            () => {

                deleteShelf(
                    shelf.id
                );

            }
        );


    return article;

}


/* =========================================================
   SORT BOOKS
   ========================================================= */

function getBooksForShelf(
    shelf
) {

    const result =
        books.filter(
            book =>
                String(
                    book.shelf_id
                )
                ===
                String(
                    shelf.id
                )
        );


    switch (shelf.sort) {

        case "title":

            return result.sort(
                (a, b) =>
                    a.title.localeCompare(
                        b.title
                    )
            );


        case "author":

            return result.sort(
                (a, b) =>
                    a.author.localeCompare(
                        b.author
                    )
            );


        case "rating":

            return result.sort(
                (a, b) =>
                    b.rating -
                    a.rating
            );


        case "finished":

            return result.sort(
                (a, b) =>
                    dateValue(
                        b.finished
                    )
                    -
                    dateValue(
                        a.finished
                    )
            );


        default:

            return result.sort(
                (a, b) =>
                    dateValue(
                        a.created_at
                    )
                    -
                    dateValue(
                        b.created_at
                    )
            );

    }

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


    wrapper.innerHTML = `

        <div
            class="
                book-spine
                book-style-${escapeHTML(
                    book.style
                )}
            "
        >

            <span class="book-edge-top">
            </span>

            <span class="book-edge-bottom">
            </span>


            <span
                class="
                    binding-band
                    band-top
                "
            >
            </span>


            <span
                class="
                    binding-band
                    band-bottom
                "
            >
            </span>


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
        () => {

            openBookReveal(
                book.id
            );

        }
    );


    requestAnimationFrame(
        () => {

            fitSpineTitle(
                wrapper
            );

        }
    );


    return wrapper;

}


/* =========================================================
   AUTO-FIT SPINE TITLES
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


    /*
       Reset any previous JS size so CSS
       supplies the user's requested size.
    */

    title.style.fontSize =
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
        Number.isNaN(size)
    ) {
        size = 8;
    }


    const minimum =
        5.25;


    /*
       With vertical writing-mode, scrollHeight
       represents the amount of vertical title space.
    */

    let safety =
        30;


    while (
        safety > 0 &&
        size > minimum &&
        (
            title.scrollHeight >
            panel.clientHeight
        )
    ) {

        size -= 0.25;

        title.style.fontSize =
            `${size}px`;

        safety -= 1;

    }


    /*
       Very long titles can still need slightly
       tighter spacing after reaching minimum size.
    */

    if (
        title.scrollHeight >
        panel.clientHeight
    ) {

        title.style.letterSpacing =
            "-0.04em";

    }

}


/* =========================================================
   BOOK TYPOGRAPHY CLASSES
   ========================================================= */

function getBookTypographyClasses(
    book,
    baseClass = ""
) {

    return [
        baseClass,

        `spine-font-${book.spine_font}`,

        `spine-size-${book.spine_font_size}`,

        `spine-weight-${book.spine_font_weight}`,

        `spine-spacing-${book.spine_letter_spacing}`,

        `spine-case-${book.spine_case}`,

        `spine-text-${book.spine_font_style}`,

        `spine-align-${book.spine_text_align}`,

        `spine-panel-${book.spine_title_panel}`
    ]
        .filter(Boolean)
        .join(" ");

}


/* =========================================================
   COLORS
   ========================================================= */

function applyBookColors(
    element,
    book
) {

    if (!element) {
        return;
    }

    element.style.setProperty(
        "--book-color",
        book.spine_color
    );

    element.style.setProperty(
        "--book-text",
        book.text_color
    );

    element.style.setProperty(
        "--book-accent",
        book.accent_color
    );

}


/* =========================================================
   ORNAMENT
   ========================================================= */

function getBookOrnament(
    book
) {

    let ornament =
        book.spine_ornament;


    if (
        !ornament ||
        ornament ===
        "auto"
    ) {

        ornament =
            CONFIG.spineStyles
                ?.find(
                    style =>
                        style.id ===
                        book.style
                )
                ?.defaultOrnament
            ||
            "diamond";

    }


    return (
        CONFIG.spineOrnaments
            ?.[ornament]
            ?.symbol
        ||
        ""
    );

}


/* =========================================================
   CREATE DECORATION
   ========================================================= */

function createDecorationElement(
    shelf,
    decoration
) {

    const element =
        document.createElement(
            "div"
        );


    element.className = [
        "shelf-decoration",
        `decor-${decoration.type}`,
        "draggable-decoration"
    ].join(" ");


    element.dataset.decorationId =
        decoration.id;

    element.dataset.shelfId =
        shelf.id;


    element.style.left =
        `${decoration.x}%`;

    element.style.top =
        `${decoration.y}%`;


    applyDecorationTransform(
        element,
        decoration
    );


    element.innerHTML =
        getDecorationArtwork(
            decoration.type
        );


    element.addEventListener(
        "pointerdown",
        event => {

            startDecorationDrag(
                event,
                shelf.id,
                decoration.id
            );

        }
    );


    element.addEventListener(
        "dblclick",
        event => {

            event.stopPropagation();

            cycleDecorationScale(
                shelf.id,
                decoration.id
            );

        }
    );


    return element;

}


/* =========================================================
   DECORATION ARTWORK
   ========================================================= */

function getDecorationArtwork(type) {

    switch (type) {


        case "cat":

            return `

                <span class="decor-shadow">
                </span>

                <span class="cat-tail">
                </span>

                <span class="cat-body">
                </span>

                <span class="cat-chest">
                </span>

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

            `;


        case "mushroom":

            return `

                <span class="mushroom-shadow">
                </span>

                <span class="mushroom-stem">
                </span>

                <span class="mushroom-gills">
                </span>

                <span class="mushroom-cap">
                </span>

                <span class="mushroom-cap-highlight">
                </span>

            `;


        case "plant":

            return `

                <span class="decor-shadow">
                </span>

                <span class="plant-stem stem-a">
                </span>

                <span class="plant-stem stem-b">
                </span>

                <span class="plant-stem stem-c">
                </span>

                <span class="plant-leaf leaf-1">
                </span>

                <span class="plant-leaf leaf-2">
                </span>

                <span class="plant-leaf leaf-3">
                </span>

                <span class="plant-leaf leaf-4">
                </span>

                <span class="plant-leaf leaf-5">
                </span>

                <span class="plant-pot">
                </span>

                <span class="plant-pot-rim">
                </span>

            `;


        case "flowers":

            return `

                <span class="decor-shadow">
                </span>

                <span class="flower-stem stem-1"></span>

                <span class="flower-stem stem-2"></span>

                <span class="flower-stem stem-3"></span>


                <span class="flower one">

                    <span class="petal"></span>
                    <span class="petal"></span>
                    <span class="petal"></span>
                    <span class="petal"></span>
                    <span class="petal"></span>

                    <span class="flower-center"></span>

                </span>


                <span class="flower two">

                    <span class="petal"></span>
                    <span class="petal"></span>
                    <span class="petal"></span>
                    <span class="petal"></span>
                    <span class="petal"></span>

                    <span class="flower-center"></span>

                </span>


                <span class="flower three">

                    <span class="petal"></span>
                    <span class="petal"></span>
                    <span class="petal"></span>
                    <span class="petal"></span>
                    <span class="petal"></span>

                    <span class="flower-center"></span>

                </span>

            `;


        case "candle":

            return `

                <span class="decor-shadow">
                </span>

                <span class="candle-glow">
                </span>

                <span class="candle-body">
                </span>

                <span class="candle-top">
                </span>

                <span class="candle-drip one">
                </span>

                <span class="candle-drip two">
                </span>

                <span class="candle-wick">
                </span>

                <span class="candle-flame">
                </span>

            `;


        case "pumpkin":

            return `

                <span class="decor-shadow">
                </span>

                <span class="pumpkin-lobe outer-left">
                </span>

                <span class="pumpkin-lobe left">
                </span>

                <span class="pumpkin-lobe center">
                </span>

                <span class="pumpkin-lobe right">
                </span>

                <span class="pumpkin-lobe outer-right">
                </span>

                <span class="pumpkin-highlight">
                </span>

                <span class="pumpkin-stem">
                </span>

            `;


        case "mug":

            return `

                <span class="decor-shadow">
                </span>

                <span class="steam steam-1">
                </span>

                <span class="steam steam-2">
                </span>

                <span class="mug-handle">
                </span>

                <span class="mug-body">
                </span>

            `;


        case "ghost":

            return `

                <span class="decor-shadow">
                </span>

                <span class="ghost-glow">
                </span>

                <span class="ghost-body">
                </span>

                <span class="ghost-eye left">
                </span>

                <span class="ghost-eye right">
                </span>

                <span class="ghost-mouth">
                </span>

            `;


        case "bat":

            return `

                <span class="bat-wing left">
                </span>

                <span class="bat-wing right">
                </span>

                <span class="bat-body">
                </span>

                <span class="bat-head">
                </span>

            `;


        case "goblin":

            return `

                <span class="decor-shadow">
                </span>

                <span class="goblin-ear left">
                </span>

                <span class="goblin-ear right">
                </span>

                <span class="goblin-body">
                </span>

                <span class="goblin-head">
                </span>

                <span class="goblin-eye left">
                </span>

                <span class="goblin-eye right">
                </span>

                <span class="goblin-smile">
                </span>

            `;


        case "moss":

            return `

                <span class="decor-shadow">
                </span>

                <span class="moss-clump moss-1">
                </span>

                <span class="moss-clump moss-2">
                </span>

                <span class="moss-clump moss-3">
                </span>

            `;


        case "potion":

            return `

                <span class="decor-shadow">
                </span>

                <span class="potion-neck">
                </span>

                <span class="potion-cork">
                </span>

                <span class="potion-bottle">

                    <span class="potion-liquid">
                    </span>

                </span>

                <span class="potion-shine">
                </span>

            `;


        case "crystal":

            return `

                <span class="decor-shadow">
                </span>

                <span class="crystal-glow">
                </span>

                <span class="crystal-main">
                </span>

                <span class="crystal-face">
                </span>

            `;


        case "raven":

            return `

                <span class="decor-shadow">
                </span>

                <span class="raven-body">
                </span>

                <span class="raven-wing">
                </span>

                <span class="raven-head">
                </span>

                <span class="raven-beak">
                </span>

                <span class="raven-eye">
                </span>

            `;


        case "stars":

            return `

                <span class="star star-1">
                    ✦
                </span>

                <span class="star star-2">
                    ✧
                </span>

                <span class="star star-3">
                    ✦
                </span>

            `;


        default:

            return `

                <span class="decor-shadow">
                </span>

                <span class="decoration-symbol">

                    ${escapeHTML(
                        getDecorationSymbol(
                            type
                        )
                    )}

                </span>

            `;

    }

}


/* =========================================================
   DECOR FALLBACK SYMBOL
   ========================================================= */

function getDecorationSymbol(type) {

    const symbols = {
        cat: "✦",
        ghost: "✧",
        bat: "⌁",
        goblin: "◉",
        raven: "◆",
        moss: "≈",
        mushroom: "♠",
        plant: "♣",
        flowers: "✿",
        pumpkin: "●",
        potion: "◇",
        crystal: "♦",
        candle: "│",
        mug: "◡",
        stars: "✦"
    };

    return (
        symbols[type] ||
        "✦"
    );

}


/* =========================================================
   DECOR DRAG
   ========================================================= */

function startDecorationDrag(
    event,
    shelfId,
    decorationId
) {

    if (
        event.button !== undefined &&
        event.button !== 0
    ) {
        return;
    }


    const element =
        event.currentTarget;


    const shelfBody =
        element.closest(
            ".shelf-body"
        );


    if (!shelfBody) {
        return;
    }


    activeDrag = {
        shelfId,
        decorationId,
        element,
        shelfBody
    };


    element.setPointerCapture?.(
        event.pointerId
    );


    element.addEventListener(
        "pointermove",
        handleDecorationDrag
    );


    element.addEventListener(
        "pointerup",
        endDecorationDrag
    );


    element.addEventListener(
        "pointercancel",
        endDecorationDrag
    );


    event.preventDefault();

}


function handleDecorationDrag(event) {

    if (!activeDrag) {
        return;
    }


    const rect =
        activeDrag.shelfBody
            .getBoundingClientRect();


    const x =
        clamp(
            (
                (
                    event.clientX -
                    rect.left
                )
                /
                rect.width
            )
            *
            100,
            3,
            97
        );


    const y =
        clamp(
            (
                (
                    event.clientY -
                    rect.top
                )
                /
                rect.height
            )
            *
            100,
            5,
            91
        );


    activeDrag.element.style.left =
        `${x}%`;

    activeDrag.element.style.top =
        `${y}%`;


    const shelf =
        getShelfById(
            activeDrag.shelfId
        );


    const decoration =
        shelf?.decorations.find(
            item =>
                String(item.id) ===
                String(
                    activeDrag.decorationId
                )
        );


    if (decoration) {

        decoration.x =
            Number(
                x.toFixed(2)
            );

        decoration.y =
            Number(
                y.toFixed(2)
            );

    }

}


function endDecorationDrag(event) {

    if (!activeDrag) {
        return;
    }


    activeDrag.element
        .releasePointerCapture?.(
            event.pointerId
        );


    activeDrag.element
        .removeEventListener(
            "pointermove",
            handleDecorationDrag
        );


    activeDrag.element
        .removeEventListener(
            "pointerup",
            endDecorationDrag
        );


    activeDrag.element
        .removeEventListener(
            "pointercancel",
            endDecorationDrag
        );


    saveShelves();

    activeDrag =
        null;

}


/* =========================================================
   DECOR SCALE
   ========================================================= */

function cycleDecorationScale(
    shelfId,
    decorationId
) {

    const shelf =
        getShelfById(
            shelfId
        );


    const decoration =
        shelf?.decorations.find(
            item =>
                String(item.id) ===
                String(decorationId)
        );


    if (!decoration) {
        return;
    }


    const sizes = [
        0.75,
        1,
        1.25,
        1.5
    ];


    const current =
        sizes.findIndex(
            size =>
                Math.abs(
                    size -
                    decoration.scale
                ) < 0.01
        );


    const next =
        current === -1
            ? 1
            : (
                current +
                1
            )
            %
            sizes.length;


    decoration.scale =
        sizes[next];


    saveShelves();

    renderLibrary();

}


function applyDecorationTransform(
    element,
    decoration
) {

    element.style.transform = `

        translate(-50%, -50%)

        scale(${decoration.scale})

        rotate(${decoration.rotate}deg)

    `;

}


/* =========================================================
   DECOR RECORD
   ========================================================= */

function createDecorationRecord(type) {

    return {
        id:
            generateId(),

        type,

        x:
            CONFIG.decorationDefaults?.x ??
            50,

        y:
            CONFIG.decorationDefaults?.y ??
            72,

        scale:
            CONFIG.decorationDefaults?.scale ??
            1,

        rotate:
            CONFIG.decorationDefaults?.rotate ??
            0
    };

}


/* =========================================================
   SHELF DRAWER
   ========================================================= */

function openShelfDrawer(
    shelfId = null
) {

    hideAllDrawersImmediately();


    const form =
        document.getElementById(
            "shelfForm"
        );


    if (!form) {
        return;
    }


    form.reset();


    setValue(
        "editingShelfId",
        ""
    );


    setText(
        "shelfDrawerTitle",
        shelfId
            ? "Edit shelf"
            : "Create a shelf"
    );


    setText(
        "saveShelfLabel",
        shelfId
            ? "save shelf"
            : "create shelf"
    );


    let shelf =
        null;


    if (shelfId) {

        shelf =
            getShelfById(
                shelfId
            );


        if (shelf) {

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

        }

    }


    renderDecorationOptions(
        shelf
    );


    showDrawer(
        "shelfDrawer"
    );

}


/* =========================================================
   DECOR OPTIONS
   ========================================================= */

function renderDecorationOptions(
    shelf = null
) {

    const container =
        document.querySelector(
            ".decoration-options"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    const currentTypes =
        shelf?.decorations
            ?.map(
                item =>
                    item.type
            )
        ||
        [];


    const themeTypes =
        getThemeDecorations();


    const optionTypes = [
        ...new Set(
            [
                ...currentTypes,
                ...themeTypes
            ]
        )
    ];


    optionTypes.forEach(
        (
            type,
            index
        ) => {

            const definition =
                CONFIG.decorations
                    ?.find(
                        item =>
                            item.id ===
                            type
                    );


            if (!definition) {
                return;
            }


            const label =
                document.createElement(
                    "label"
                );


            const checked =
                shelf
                    ? currentTypes.includes(
                        type
                    )
                    : index < 3;


            label.innerHTML = `

                <input
                    type="checkbox"
                    value="${escapeHTML(type)}"
                    ${checked ? "checked" : ""}
                >

                <span>
                    ${escapeHTML(
                        definition.label
                    )}
                </span>

            `;


            container.appendChild(
                label
            );

        }
    );

}


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


    const shelf =
        getShelfById(
            getValue(
                "editingShelfId"
            )
        );


    renderDecorationOptions(
        shelf
    );

}


/* =========================================================
   SAVE SHELF
   ========================================================= */

function saveShelfFromForm(event) {

    event.preventDefault();


    const id =
        getValue(
            "editingShelfId"
        );


    const selectedTypes =
        Array.from(
            document.querySelectorAll(
                ".decoration-options input:checked"
            )
        ).map(
            input =>
                input.value
        );


    if (id) {

        const shelf =
            getShelfById(id);


        if (!shelf) {
            return;
        }


        const existing =
            shelf.decorations;


        shelf.name =
            getValue(
                "shelfName"
            )
            ||
            "My Shelf";


        shelf.description =
            getValue(
                "shelfDescription"
            );


        shelf.material =
            getValue(
                "shelfMaterial"
            )
            ||
            "walnut";


        shelf.mood =
            getValue(
                "shelfMood"
            )
            ||
            "cozy";


        shelf.layout =
            getValue(
                "shelfLayout"
            )
            ||
            "mixed";


        shelf.sort =
            getValue(
                "shelfSort"
            )
            ||
            "manual";


        shelf.decorations =
            selectedTypes.map(
                (
                    type,
                    index
                ) => {

                    return (
                        existing.find(
                            item =>
                                item.type ===
                                type
                        )
                        ||
                        createStaggeredDecoration(
                            type,
                            index
                        )
                    );

                }
            );

    }

    else {

        shelves.push({

            id:
                generateId(),

            name:
                getValue(
                    "shelfName"
                )
                ||
                "My Shelf",

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

            decorations:
                selectedTypes.map(
                    (
                        type,
                        index
                    ) =>
                        createStaggeredDecoration(
                            type,
                            index
                        )
                ),

            created_at:
                new Date()
                    .toISOString()

        });

    }


    saveShelves();

    closeAllDrawers();

    renderAll();

}


/* =========================================================
   START POSITIONS
   ========================================================= */

function createStaggeredDecoration(
    type,
    index
) {

    const decoration =
        createDecorationRecord(
            type
        );


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


    const position =
        positions[
            index %
            positions.length
        ];


    decoration.x =
        position.x;

    decoration.y =
        position.y;


    return decoration;

}


/* =========================================================
   DELETE SHELF
   ========================================================= */

function deleteShelf(shelfId) {

    const shelf =
        getShelfById(
            shelfId
        );


    if (!shelf) {
        return;
    }


    const shelfBooks =
        books.filter(
            book =>
                String(
                    book.shelf_id
                )
                ===
                String(
                    shelfId
                )
        );


    if (shelfBooks.length) {

        const confirmed =
            window.confirm(
                `"${shelf.name}" contains ${shelfBooks.length} book(s). Remove the shelf and those books?`
            );


        if (!confirmed) {
            return;
        }


        books =
            books.filter(
                book =>
                    String(
                        book.shelf_id
                    )
                    !==
                    String(
                        shelfId
                    )
            );


        saveBooks();

    }

    else {

        const confirmed =
            window.confirm(
                `Remove "${shelf.name}"?`
            );


        if (!confirmed) {
            return;
        }

    }


    shelves =
        shelves.filter(
            shelf =>
                String(
                    shelf.id
                )
                !==
                String(
                    shelfId
                )
        );


    saveShelves();

    renderAll();

}


/* =========================================================
   BOOK DRAWER
   ========================================================= */

function openBookDrawer(
    bookId = null,
    shelfId = null
) {

    if (!shelves.length) {

        openShelfDrawer();

        return;

    }


    hideAllDrawersImmediately();


    const form =
        document.getElementById(
            "bookForm"
        );


    if (!form) {
        return;
    }


    form.reset();

    pendingCoverData =
        "";


    resetBookForm();

    populateBookShelfSelect();


    if (shelfId) {

        setValue(
            "bookShelf",
            shelfId
        );

    }


    if (bookId) {

        const book =
            getBookById(
                bookId
            );


        if (!book) {
            return;
        }


        setValue(
            "editingBookId",
            book.id
        );


        setText(
            "bookDrawerTitle",
            "Edit book"
        );


        setText(
            "saveBookLabel",
            "save book"
        );


        populateBookForm(
            book
        );


        pendingCoverData =
            book.cover_image ||
            "";

    }

    else {

        setValue(
            "editingBookId",
            ""
        );


        setText(
            "bookDrawerTitle",
            "Add a book"
        );


        setText(
            "saveBookLabel",
            "tuck it in"
        );

    }


    updateSpinePreview();


    showDrawer(
        "bookDrawer"
    );

}


/* =========================================================
   DEFAULT BOOK FORM
   ========================================================= */

function resetBookForm() {

    const defaults =
        CONFIG.defaultBookDesign ||
        {};


    const colors =
        getThemeBookColors();


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
        "bookStyle",
        defaults.style ||
        "classic"
    );


    setValue(
        "bookSpineColor",
        colors.spine
    );


    setValue(
        "bookTextColor",
        colors.text
    );


    setValue(
        "bookAccentColor",
        colors.accent
    );


    setValue(
        "bookSpineFont",
        defaults.spineFont ||
        "serif"
    );


    setValue(
        "bookSpineFontSize",
        defaults.fontSize ||
        "medium"
    );


    setValue(
        "bookSpineFontWeight",
        defaults.fontWeight ||
        "regular"
    );


    setValue(
        "bookSpineLetterSpacing",
        defaults.letterSpacing ||
        "normal"
    );


    setValue(
        "bookSpineCase",
        defaults.textCase ||
        "typed"
    );


    setValue(
        "bookSpineFontStyle",
        defaults.fontStyle ||
        "normal"
    );


    setValue(
        "bookSpineTextAlign",
        defaults.textAlign ||
        "center"
    );


    setValue(
        "bookSpineTitlePanel",
        defaults.titlePanel ||
        "none"
    );


    setValue(
        "bookSpineOrnament",
        defaults.ornament ||
        "auto"
    );


    setValue(
        "bookHeight",
        defaults.height ||
        "medium"
    );


    setValue(
        "bookThickness",
        defaults.thickness ||
        "medium"
    );

}


/* =========================================================
   THEME BOOK COLORS
   ========================================================= */

function getThemeBookColors() {

    const palettes = {

        haunted: {
            spine: "#754b56",
            text: "#efe5d3",
            accent: "#c19b61"
        },

        autumn: {
            spine: "#9f6347",
            text: "#f0dec8",
            accent: "#d4a15f"
        },

        forest: {
            spine: "#60765e",
            text: "#ebe6d3",
            accent: "#a4b17c"
        },

        retro: {
            spine: "#4d4b38",
            text: "#ded5ae",
            accent: "#abb958"
        },

        ghosts: {
            spine: "#ad7c72",
            text: "#f4e0d4",
            accent: "#829578"
        }

    };


    return (
        palettes[settings.theme] ||
        palettes.haunted
    );

}


/* =========================================================
   POPULATE BOOK FORM
   ========================================================= */

function populateBookForm(book) {

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
        book.year || ""
    );

    setValue(
        "bookPages",
        book.pages || ""
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
        book.spine_color
    );

    setValue(
        "bookTextColor",
        book.text_color
    );

    setValue(
        "bookAccentColor",
        book.accent_color
    );

    setValue(
        "bookSpineOrnament",
        book.spine_ornament
    );

    setValue(
        "bookSpineFont",
        book.spine_font
    );

    setValue(
        "bookSpineFontSize",
        book.spine_font_size
    );

    setValue(
        "bookSpineFontWeight",
        book.spine_font_weight
    );

    setValue(
        "bookSpineLetterSpacing",
        book.spine_letter_spacing
    );

    setValue(
        "bookSpineCase",
        book.spine_case
    );

    setValue(
        "bookSpineFontStyle",
        book.spine_font_style
    );

    setValue(
        "bookSpineTextAlign",
        book.spine_text_align
    );

    setValue(
        "bookSpineTitlePanel",
        book.spine_title_panel
    );

    setValue(
        "bookHeight",
        book.height
    );

    setValue(
        "bookThickness",
        book.thickness
    );

}


/* =========================================================
   SHELF SELECT
   ========================================================= */

function populateBookShelfSelect() {

    const select =
        document.getElementById(
            "bookShelf"
        );


    if (!select) {
        return;
    }


    const current =
        select.value;


    select.innerHTML =
        shelves.map(
            shelf => `

                <option
                    value="${escapeHTML(
                        shelf.id
                    )}"
                >
                    ${escapeHTML(
                        shelf.name
                    )}
                </option>

            `
        ).join("");


    if (
        current &&
        shelves.some(
            shelf =>
                String(
                    shelf.id
                )
                ===
                String(
                    current
                )
        )
    ) {

        select.value =
            current;

    }

}


/* =========================================================
   SAVE BOOK
   ========================================================= */

function saveBookFromForm(event) {

    event.preventDefault();


    const id =
        getValue(
            "editingBookId"
        );


    const existing =
        id
            ? getBookById(id)
            : null;


    const bookData =
        readBookForm(
            existing
        );


    if (
        bookData.pages &&
        bookData.current_page >
        bookData.pages
    ) {

        bookData.current_page =
            bookData.pages;

    }


    if (
        bookData.status ===
        "reading" &&
        !bookData.started
    ) {

        bookData.started =
            todayISO();

    }


    if (
        bookData.status ===
        "finished"
    ) {

        if (!bookData.finished) {

            bookData.finished =
                todayISO();

        }


        if (bookData.pages) {

            bookData.current_page =
                bookData.pages;

        }


        if (
            bookData.times_read <
            1
        ) {

            bookData.times_read =
                1;

        }

    }


    if (existing) {

        Object.assign(
            existing,
            bookData,
            {
                updated_at:
                    new Date()
                        .toISOString()
            }
        );

    }

    else {

        books.push({

            id:
                generateId(),

            ...bookData,

            journal:
                normalizeJournal(),

            created_at:
                new Date()
                    .toISOString(),

            updated_at:
                new Date()
                    .toISOString()

        });

    }


    saveBooks();

    pendingCoverData =
        "";


    closeAllDrawers();

    renderAll();

}


/* =========================================================
   READ BOOK FORM
   ========================================================= */

function readBookForm(
    existing = null
) {

    const defaults =
        CONFIG.defaultBookDesign ||
        {};


    return {

        title:
            getValue(
                "bookTitle"
            )
            ||
            "Untitled Book",

        author:
            getValue(
                "bookAuthor"
            ),

        genre:
            getValue(
                "bookGenre"
            ),

        year:
            normalizeNumber(
                getValue(
                    "bookYear"
                )
            ),

        pages:
            normalizeNumber(
                getValue(
                    "bookPages"
                )
            ),

        isbn:
            getValue(
                "bookISBN"
            ),

        series:
            getValue(
                "bookSeries"
            ),

        shelf_id:
            getValue(
                "bookShelf"
            ),

        status:
            getValue(
                "bookStatus"
            )
            ||
            "want",

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
            normalizeNumber(
                getValue(
                    "bookCurrentPage"
                )
            ),

        times_read:
            normalizeNumber(
                getValue(
                    "bookTimesRead"
                )
            ),

        cover_image:
            pendingCoverData
            ||
            existing?.cover_image
            ||
            "",

        style:
            getValue(
                "bookStyle"
            )
            ||
            defaults.style
            ||
            "classic",

        spine_color:
            getValue(
                "bookSpineColor"
            )
            ||
            "#6c2633",

        text_color:
            getValue(
                "bookTextColor"
            )
            ||
            "#eadfca",

        accent_color:
            getValue(
                "bookAccentColor"
            )
            ||
            "#b28a4a",

        spine_font:
            getValue(
                "bookSpineFont"
            )
            ||
            defaults.spineFont
            ||
            "serif",

        spine_font_size:
            getValue(
                "bookSpineFontSize"
            )
            ||
            defaults.fontSize
            ||
            "medium",

        spine_font_weight:
            getValue(
                "bookSpineFontWeight"
            )
            ||
            defaults.fontWeight
            ||
            "regular",

        spine_letter_spacing:
            getValue(
                "bookSpineLetterSpacing"
            )
            ||
            defaults.letterSpacing
            ||
            "normal",

        spine_case:
            getValue(
                "bookSpineCase"
            )
            ||
            defaults.textCase
            ||
            "typed",

        spine_font_style:
            getValue(
                "bookSpineFontStyle"
            )
            ||
            defaults.fontStyle
            ||
            "normal",

        spine_text_align:
            getValue(
                "bookSpineTextAlign"
            )
            ||
            defaults.textAlign
            ||
            "center",

        spine_title_panel:
            getValue(
                "bookSpineTitlePanel"
            )
            ||
            defaults.titlePanel
            ||
            "none",

        spine_ornament:
            getValue(
                "bookSpineOrnament"
            )
            ||
            defaults.ornament
            ||
            "auto",

        height:
            getValue(
                "bookHeight"
            )
            ||
            defaults.height
            ||
            "medium",

        thickness:
            getValue(
                "bookThickness"
            )
            ||
            defaults.thickness
            ||
            "medium"

    };

}


/* =========================================================
   COVER UPLOAD
   ========================================================= */

function handleCoverUpload(event) {

    const file =
        event.target.files?.[0];


    if (!file) {
        return;
    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        window.alert(
            "Please choose an image file."
        );


        event.target.value =
            "";

        return;

    }


    const reader =
        new FileReader();


    reader.onload = () => {

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


/* =========================================================
   STYLE CHANGE
   ========================================================= */

function handleSpineStyleChange() {

    const styleId =
        getValue(
            "bookStyle"
        );


    const style =
        CONFIG.spineStyles
            ?.find(
                item =>
                    item.id ===
                    styleId
            );


    if (
        !getValue(
            "editingBookId"
        )
        &&
        style?.defaultFont
    ) {

        setValue(
            "bookSpineFont",
            style.defaultFont
        );

    }


    updateSpinePreview();

}


/* =========================================================
   PREVIEW
   ========================================================= */

function updateSpinePreview() {

    const preview =
        document.getElementById(
            "bookSpinePreview"
        );


    if (!preview) {
        return;
    }


    const design =
        getCurrentSpineDesign();


    preview.className = [

        "spine-preview-book",

        `book-style-${design.style}`,

        `spine-font-${design.font}`,

        `spine-size-${design.size}`,

        `spine-weight-${design.weight}`,

        `spine-spacing-${design.spacing}`,

        `spine-case-${design.textCase}`,

        `spine-text-${design.fontStyle}`,

        `spine-align-${design.align}`,

        `spine-panel-${design.panel}`

    ].join(" ");


    preview.style.setProperty(
        "--book-color",
        design.spineColor
    );


    preview.style.setProperty(
        "--book-text",
        design.textColor
    );


    preview.style.setProperty(
        "--book-accent",
        design.accentColor
    );


    setText(
        "bookSpinePreviewTitle",
        design.title
    );


    setText(
        "bookSpinePreviewOrnament",
        getPreviewOrnament()
    );


    const heights = {
        small: 160,
        medium: 198,
        tall: 235
    };


    const widths = {
        slim: 52,
        medium: 76,
        chunky: 100
    };


    preview.style.height =
        `${
            heights[design.height] ||
            198
        }px`;


    preview.style.width =
        `${
            widths[design.thickness] ||
            76
        }px`;


    requestAnimationFrame(
        fitPreviewTitle
    );

}


/* =========================================================
   FIT PREVIEW TITLE
   ========================================================= */

function fitPreviewTitle() {

    const preview =
        document.getElementById(
            "bookSpinePreview"
        );


    if (!preview) {
        return;
    }


    const title =
        preview.querySelector(
            ".spine-preview-title"
        );


    const panel =
        preview.querySelector(
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


    let size =
        parseFloat(
            window
                .getComputedStyle(
                    title
                )
                .fontSize
        );


    if (
        !size ||
        Number.isNaN(size)
    ) {

        size =
            8;

    }


    const minimum =
        5.25;


    let safety =
        30;


    while (
        safety > 0 &&
        size > minimum &&
        title.scrollHeight >
        panel.clientHeight
    ) {

        size -=
            0.25;


        title.style.fontSize =
            `${size}px`;


        safety -=
            1;

    }


    if (
        title.scrollHeight >
        panel.clientHeight
    ) {

        title.style.letterSpacing =
            "-0.04em";

    }

}


/* =========================================================
   CURRENT SPINE DESIGN
   ========================================================= */

function getCurrentSpineDesign() {

    return {

        title:
            getValue(
                "bookTitle"
            )
            ||
            "Your Book Title",

        style:
            getValue(
                "bookStyle"
            )
            ||
            "classic",

        spineColor:
            getValue(
                "bookSpineColor"
            )
            ||
            "#6c2633",

        textColor:
            getValue(
                "bookTextColor"
            )
            ||
            "#eadfca",

        accentColor:
            getValue(
                "bookAccentColor"
            )
            ||
            "#b28a4a",

        font:
            getValue(
                "bookSpineFont"
            )
            ||
            "serif",

        size:
            getValue(
                "bookSpineFontSize"
            )
            ||
            "medium",

        weight:
            getValue(
                "bookSpineFontWeight"
            )
            ||
            "regular",

        spacing:
            getValue(
                "bookSpineLetterSpacing"
            )
            ||
            "normal",

        textCase:
            getValue(
                "bookSpineCase"
            )
            ||
            "typed",

        fontStyle:
            getValue(
                "bookSpineFontStyle"
            )
            ||
            "normal",

        align:
            getValue(
                "bookSpineTextAlign"
            )
            ||
            "center",

        panel:
            getValue(
                "bookSpineTitlePanel"
            )
            ||
            "none",

        ornament:
            getValue(
                "bookSpineOrnament"
            )
            ||
            "auto",

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
            "medium"

    };

}


/* =========================================================
   PREVIEW ORNAMENT
   ========================================================= */

function getPreviewOrnament() {

    const design =
        getCurrentSpineDesign();


    let ornament =
        design.ornament;


    if (
        ornament ===
        "auto"
    ) {

        ornament =
            CONFIG.spineStyles
                ?.find(
                    style =>
                        style.id ===
                        design.style
                )
                ?.defaultOrnament
            ||
            "diamond";

    }


    return (
        CONFIG.spineOrnaments
            ?.[ornament]
            ?.symbol
        ||
        ""
    );

}


/* =========================================================
   BOOK REVEAL
   ========================================================= */

function openBookReveal(bookId) {

    const book =
        getBookById(
            bookId
        );


    if (!book) {
        return;
    }


    selectedBookId =
        book.id;


    renderCover(
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


    const percent =
        getProgressPercent(
            book
        );


    setText(
        "revealPercent",
        `${percent}%`
    );


    const fill =
        document.getElementById(
            "revealProgressBar"
        );


    if (fill) {

        fill.style.width =
            `${percent}%`;

    }


    const bookmark =
        document.getElementById(
            "progressBookmark"
        );


    if (bookmark) {

        bookmark.style.left =
            `${percent}%`;

    }


    setText(
        "revealRating",
        getRatingText(
            book.rating
        )
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


    updateModalBodyState();

}


function editSelectedBook() {

    if (!selectedBookId) {
        return;
    }


    closeBookReveal();


    openBookDrawer(
        selectedBookId
    );

}


function openSelectedBookJournal() {

    if (!selectedBookId) {
        return;
    }


    openReadingBook(
        selectedBookId
    );

}


/* =========================================================
   OPEN READING BOOK
   ========================================================= */

function openReadingBook(bookId) {

    const book =
        getBookById(
            bookId
        );


    if (!book) {
        return;
    }


    selectedBookId =
        book.id;


    renderJournalBookDetails(
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


    updateModalBodyState();

}


/* =========================================================
   JOURNAL DETAILS
   ========================================================= */

function renderJournalBookDetails(book) {

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
        book.pages
            ? String(book.pages)
            : "—"
    );


    renderCover(
        "journalCover",
        book
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


    if (contents) {
        contents.hidden = false;
    }


    if (section) {
        section.hidden = true;
    }

}


function openJournalSection(
    sectionName
) {

    if (!selectedBookId) {
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


    if (contents) {
        contents.hidden = true;
    }


    if (section) {
        section.hidden = false;
    }


    const definition =
        CONFIG.journalSections
            ?.[sectionName]
        ||
        {
            label:
                sectionName.toUpperCase(),

            title:
                sectionName
        };


    setText(
        "journalSectionLabel",
        definition.label
    );


    setText(
        "journalSectionTitle",
        definition.title
    );


    renderJournalEntries();

}


/* =========================================================
   JOURNAL ENTRIES
   ========================================================= */

function renderJournalEntries() {

    const container =
        document.getElementById(
            "journalEntries"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    const book =
        getBookById(
            selectedBookId
        );


    if (!book) {
        return;
    }


    const addButton =
        document.getElementById(
            "addJournalEntry"
        );


    if (
        selectedJournalSection ===
        "overview"
    ) {

        if (addButton) {
            addButton.hidden = true;
        }


        renderOverview(
            container,
            book
        );


        return;

    }


    if (addButton) {
        addButton.hidden = false;
    }


    const entries =
        book.journal
            ?.[
                selectedJournalSection
            ]
        ||
        [];


    if (!entries.length) {

        container.innerHTML = `

            <div class="journal-empty">

                Nothing here yet.
                This page is waiting for you.

            </div>

        `;

        return;

    }


    entries
        .slice()
        .reverse()
        .forEach(entry => {

            container.appendChild(
                createJournalEntryElement(
                    entry,
                    selectedJournalSection
                )
            );

        });

}


/* =========================================================
   OVERVIEW
   ========================================================= */

function renderOverview(
    container,
    book
) {

    const progress =
        getProgressPercent(
            book
        );


    container.innerHTML = `

        <div class="journal-entry">

            <h4>
                Reading progress
            </h4>

            <p>
                ${book.current_page}
                of
                ${book.pages || 0}
                pages ·
                ${progress}% complete
            </p>

        </div>


        <div class="journal-entry">

            <h4>
                Genre
            </h4>

            <p>
                ${
                    escapeHTML(
                        book.genre
                    )
                    ||
                    "Not recorded"
                }
            </p>

        </div>


        <div class="journal-entry">

            <h4>
                Rating
            </h4>

            <p>
                ${escapeHTML(
                    getRatingText(
                        book.rating
                    )
                )}
            </p>

        </div>


        <div class="journal-entry">

            <h4>
                Read count
            </h4>

            <p>
                ${book.times_read || 0}
            </p>

        </div>

    `;

}


/* =========================================================
   JOURNAL ENTRY ELEMENT
   ========================================================= */

function createJournalEntryElement(
    entry,
    section
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "journal-entry";


    const content =
        getJournalEntryPresentation(
            entry,
            section
        );


    article.innerHTML = `

        ${
            content.title
                ?
                `
                <h4>
                    ${escapeHTML(
                        content.title
                    )}
                </h4>
                `
                :
                ""
        }

        <p>
            ${escapeHTML(
                content.body
            )}
        </p>

        <span class="journal-entry-meta">

            ${escapeHTML(
                formatDateTime(
                    entry.created_at
                )
            )}

        </span>

    `;


    return article;

}


/* =========================================================
   JOURNAL ENTRY DISPLAY
   ========================================================= */

function getJournalEntryPresentation(
    entry,
    section
) {

    switch (section) {

        case "words":

            return {
                title:
                    entry.word ||
                    "Word",

                body:
                    [
                        entry.definition,
                        entry.context
                    ]
                        .filter(Boolean)
                        .join("\n\n")
            };


        case "quotes":

            return {
                title:
                    entry.page
                        ? `Page ${entry.page}`
                        : "Saved quote",

                body:
                    entry.quote ||
                    entry.text ||
                    ""
            };


        case "characters":

            return {
                title:
                    entry.name ||
                    "Character",

                body:
                    entry.notes ||
                    entry.text ||
                    ""
            };


        case "themes":

            return {
                title:
                    entry.theme ||
                    "Theme",

                body:
                    entry.notes ||
                    entry.text ||
                    ""
            };


        case "questions":

            return {
                title:
                    entry.question ||
                    "Question",

                body:
                    entry.notes ||
                    ""
            };


        case "review":

            return {
                title:
                    entry.title ||
                    "Review",

                body:
                    entry.review ||
                    entry.text ||
                    ""
            };


        default:

            return {
                title:
                    entry.title ||
                    "",

                body:
                    entry.text ||
                    entry.notes ||
                    ""
            };

    }

}


/* =========================================================
   JOURNAL ENTRY MODAL
   ========================================================= */

function openJournalEntryModal() {

    if (
        !selectedBookId ||
        !selectedJournalSection ||
        selectedJournalSection ===
        "overview"
    ) {
        return;
    }


    setValue(
        "entrySection",
        selectedJournalSection
    );


    const definition =
        CONFIG.journalSections
            ?.[selectedJournalSection];


    setText(
        "entryModalTitle",
        definition?.title ||
        "Add entry"
    );


    renderEntryFields(
        selectedJournalSection
    );


    const modal =
        document.getElementById(
            "entryModal"
        );


    if (modal) {
        modal.hidden = false;
    }


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   ENTRY FIELDS
   ========================================================= */

function renderEntryFields(section) {

    const container =
        document.getElementById(
            "entryDynamicFields"
        );


    if (!container) {
        return;
    }


    switch (section) {

        case "words":

            container.innerHTML = `

                <label>

                    Word

                    <input
                        id="entryWord"
                        type="text"
                        required
                    >

                </label>


                <label>

                    Definition

                    <textarea
                        id="entryDefinition"
                        required
                    ></textarea>

                </label>


                <label>

                    Context / why I saved it

                    <textarea
                        id="entryContext"
                    ></textarea>

                </label>

            `;

            break;


        case "quotes":

            container.innerHTML = `

                <label>

                    Quote

                    <textarea
                        id="entryQuote"
                        required
                    ></textarea>

                </label>


                <label>

                    Page

                    <input
                        id="entryPage"
                        type="number"
                        min="0"
                    >

                </label>

            `;

            break;


        case "characters":

            container.innerHTML = `

                <label>

                    Character

                    <input
                        id="entryCharacter"
                        type="text"
                        required
                    >

                </label>


                <label>

                    Notes

                    <textarea
                        id="entryCharacterNotes"
                        required
                    ></textarea>

                </label>

            `;

            break;


        case "themes":

            container.innerHTML = `

                <label>

                    Theme

                    <input
                        id="entryTheme"
                        type="text"
                        required
                    >

                </label>


                <label>

                    Thoughts

                    <textarea
                        id="entryThemeNotes"
                        required
                    ></textarea>

                </label>

            `;

            break;


        case "questions":

            container.innerHTML = `

                <label>

                    Question

                    <textarea
                        id="entryQuestion"
                        required
                    ></textarea>

                </label>


                <label>

                    Notes

                    <textarea
                        id="entryQuestionNotes"
                    ></textarea>

                </label>

            `;

            break;


        case "review":

            container.innerHTML = `

                <label>

                    Review

                    <textarea
                        id="entryReview"
                        required
                    ></textarea>

                </label>

            `;

            break;


        default:

            container.innerHTML = `

                <label>

                    Title

                    <input
                        id="entryTitle"
                        type="text"
                    >

                </label>


                <label>

                    ${
                        section ===
                        "thoughts"
                            ? "Thought"
                            : "Note"
                    }

                    <textarea
                        id="entryText"
                        required
                    ></textarea>

                </label>

            `;

    }

}


/* =========================================================
   SAVE JOURNAL ENTRY
   ========================================================= */

function saveJournalEntry(event) {

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


    const entry = {

        id:
            generateId(),

        created_at:
            new Date()
                .toISOString()

    };


    switch (section) {

        case "words":

            entry.word =
                getValue(
                    "entryWord"
                );

            entry.definition =
                getValue(
                    "entryDefinition"
                );

            entry.context =
                getValue(
                    "entryContext"
                );

            break;


        case "quotes":

            entry.quote =
                getValue(
                    "entryQuote"
                );

            entry.page =
                getValue(
                    "entryPage"
                );

            break;


        case "characters":

            entry.name =
                getValue(
                    "entryCharacter"
                );

            entry.notes =
                getValue(
                    "entryCharacterNotes"
                );

            break;


        case "themes":

            entry.theme =
                getValue(
                    "entryTheme"
                );

            entry.notes =
                getValue(
                    "entryThemeNotes"
                );

            break;


        case "questions":

            entry.question =
                getValue(
                    "entryQuestion"
                );

            entry.notes =
                getValue(
                    "entryQuestionNotes"
                );

            break;


        case "review":

            entry.review =
                getValue(
                    "entryReview"
                );

            break;


        default:

            entry.title =
                getValue(
                    "entryTitle"
                );

            entry.text =
                getValue(
                    "entryText"
                );

    }


    if (
        !Array.isArray(
            book.journal[section]
        )
    ) {

        book.journal[section] =
            [];

    }


    book.journal[section].push(
        entry
    );


    book.updated_at =
        new Date()
            .toISOString();


    saveBooks();

    closeEntryModal();

    renderJournalEntries();

}


function closeEntryModal() {

    const modal =
        document.getElementById(
            "entryModal"
        );


    if (modal) {
        modal.hidden = true;
    }


    updateModalBodyState();

}


/* =========================================================
   READING NOW
   ========================================================= */

function renderReadingNow() {

    const readingBooks =
        books.filter(
            book =>
                book.status ===
                "reading"
        );


    updateReadingNowSummary(
        readingBooks
    );


    const featured =
        document.getElementById(
            "featuredReadingSection"
        );


    const list =
        document.getElementById(
            "readingListSection"
        );


    const empty =
        document.getElementById(
            "readingEmpty"
        );


    if (!readingBooks.length) {

        if (featured) {
            featured.hidden = true;
        }

        if (list) {
            list.hidden = true;
        }

        if (empty) {
            empty.hidden = false;
        }

        return;

    }


    if (featured) {
        featured.hidden = false;
    }


    if (list) {
        list.hidden = false;
    }


    if (empty) {
        empty.hidden = true;
    }


    const featuredBook =
        getFeaturedReadingBook(
            readingBooks
        );


    renderFeaturedReadingBook(
        featuredBook
    );


    renderReadingGrid(
        readingBooks
    );

}


/* =========================================================
   READING SUMMARY
   ========================================================= */

function updateReadingNowSummary(
    readingBooks
) {

    setText(
        "currentReadingCount",
        readingBooks.length
    );


    if (!readingBooks.length) {

        setText(
            "averageProgress",
            "0%"
        );

        setText(
            "pagesRemaining",
            "0"
        );

        return;

    }


    const average =
        Math.round(
            readingBooks.reduce(
                (
                    total,
                    book
                ) =>
                    total +
                    getProgressPercent(
                        book
                    ),
                0
            )
            /
            readingBooks.length
        );


    const remaining =
        readingBooks.reduce(
            (
                total,
                book
            ) => {

                if (!book.pages) {
                    return total;
                }

                return (
                    total +
                    Math.max(
                        0,
                        book.pages -
                        book.current_page
                    )
                );

            },
            0
        );


    setText(
        "averageProgress",
        `${average}%`
    );


    setText(
        "pagesRemaining",
        remaining
    );

}


/* =========================================================
   FEATURED READING BOOK
   ========================================================= */

function getFeaturedReadingBook(
    readingBooks
) {

    return readingBooks
        .slice()
        .sort(
            (a, b) =>
                getProgressPercent(b)
                -
                getProgressPercent(a)
        )[0];

}


function renderFeaturedReadingBook(book) {

    if (!book) {
        return;
    }


    const shelf =
        getShelfById(
            book.shelf_id
        );


    renderCover(
        "featuredBookCover",
        book
    );


    setText(
        "featuredBookShelf",
        shelf?.name ||
        "my library"
    );


    setText(
        "featuredBookTitle",
        book.title
    );


    setText(
        "featuredBookAuthor",
        book.author ||
        "Author not recorded"
    );


    setText(
        "featuredBookStarted",
        formatDate(
            book.started
        )
    );


    setText(
        "featuredBookPages",
        `${book.current_page} / ${book.pages || 0}`
    );


    const percentage =
        getProgressPercent(
            book
        );


    setText(
        "featuredBookPercent",
        `${percentage}%`
    );


    const fill =
        document.getElementById(
            "featuredProgressFill"
        );


    if (fill) {

        fill.style.width =
            `${percentage}%`;

    }


    const bookmark =
        document.getElementById(
            "featuredProgressBookmark"
        );


    if (bookmark) {

        bookmark.style.left =
            `${percentage}%`;

    }


    const openButton =
        document.getElementById(
            "featuredOpenBook"
        );


    if (openButton) {

        openButton.dataset.bookId =
            book.id;

    }


    const progressButton =
        document.getElementById(
            "featuredEditProgress"
        );


    if (progressButton) {

        progressButton.dataset.bookId =
            book.id;

    }

}


/* =========================================================
   READING GRID
   ========================================================= */

function renderReadingGrid(
    readingBooks
) {

    const grid =
        document.getElementById(
            "readingGrid"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML =
        "";


    readingBooks
        .slice()
        .sort(
            (a, b) =>
                dateValue(
                    b.started ||
                    b.created_at
                )
                -
                dateValue(
                    a.started ||
                    a.created_at
                )
        )
        .forEach(book => {

            grid.appendChild(
                createReadingCard(
                    book
                )
            );

        });

}


function createReadingCard(book) {

    const shelf =
        getShelfById(
            book.shelf_id
        );


    const percent =
        getProgressPercent(
            book
        );


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "reading-card";


    card.dataset.bookId =
        book.id;


    card.innerHTML = `

        <div class="reading-card-cover">
        </div>

        <div class="reading-card-copy">

            <span class="reading-card-shelf">

                ${escapeHTML(
                    shelf?.name ||
                    "my library"
                )}

            </span>

            <h3>
                ${escapeHTML(
                    book.title
                )}
            </h3>

            <p class="reading-card-author">

                ${escapeHTML(
                    book.author ||
                    "Author not recorded"
                )}

            </p>

            <div class="reading-card-pages">

                <span>
                    ${book.current_page}
                    /
                    ${book.pages || 0}
                </span>

                <strong>
                    ${percent}%
                </strong>

            </div>

            <div class="reading-card-progress">

                <span
                    style="width:${percent}%"
                >
                </span>

            </div>

            <div class="reading-card-started">

                started
                ${escapeHTML(
                    formatDate(
                        book.started
                    )
                )}

            </div>

        </div>

    `;


    renderCoverInElement(
        card.querySelector(
            ".reading-card-cover"
        ),
        book
    );


    card.addEventListener(
        "click",
        () => {

            openBookReveal(
                book.id
            );

        }
    );


    return card;

}


/* =========================================================
   PROGRESS MODAL
   ========================================================= */

function openProgressModal(bookId) {

    const book =
        getBookById(
            bookId
        );


    if (!book) {
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
            ? `${book.pages} total pages`
            : "Page count not recorded"
    );


    setValue(
        "progressCurrentPage",
        book.current_page
    );


    setChecked(
        "markBookFinished",
        false
    );


    const input =
        document.getElementById(
            "progressCurrentPage"
        );


    if (input) {

        input.max =
            book.pages > 0
                ? String(
                    book.pages
                )
                : "";

    }


    updateProgressPreview();


    const modal =
        document.getElementById(
            "progressModal"
        );


    if (modal) {

        modal.hidden =
            false;

    }


    document.body.classList.add(
        "modal-open"
    );

}


function closeProgressModal() {

    const modal =
        document.getElementById(
            "progressModal"
        );


    if (modal) {

        modal.hidden =
            true;

    }


    updateModalBodyState();

}


function updateProgressPreview() {

    const book =
        getBookById(
            getValue(
                "progressBookId"
            )
        );


    if (!book) {
        return;
    }


    let current =
        normalizeNumber(
            getValue(
                "progressCurrentPage"
            )
        );


    if (book.pages > 0) {

        current =
            Math.min(
                current,
                book.pages
            );

    }


    const percentage =
        book.pages
            ?
            Math.round(
                (
                    current /
                    book.pages
                )
                *
                100
            )
            :
            0;


    const fill =
        document.getElementById(
            "progressPreviewFill"
        );


    if (fill) {

        fill.style.width =
            `${percentage}%`;

    }


    setText(
        "progressPreviewPercent",
        `${percentage}%`
    );

}


function handleFinishedToggle(event) {

    if (!event.target.checked) {
        return;
    }


    const book =
        getBookById(
            getValue(
                "progressBookId"
            )
        );


    if (
        !book ||
        !book.pages
    ) {
        return;
    }


    setValue(
        "progressCurrentPage",
        book.pages
    );


    updateProgressPreview();

}


function saveProgressUpdate(event) {

    event.preventDefault();


    const book =
        getBookById(
            getValue(
                "progressBookId"
            )
        );


    if (!book) {
        return;
    }


    let current =
        normalizeNumber(
            getValue(
                "progressCurrentPage"
            )
        );


    if (book.pages > 0) {

        current =
            Math.min(
                current,
                book.pages
            );

    }


    book.current_page =
        current;


    if (
        document
            .getElementById(
                "markBookFinished"
            )
            ?.checked
    ) {

        book.status =
            "finished";


        book.finished =
            todayISO();


        if (book.pages) {

            book.current_page =
                book.pages;

        }


        if (
            book.times_read <
            1
        ) {

            book.times_read =
                1;

        }

    }


    book.updated_at =
        new Date()
            .toISOString();


    saveBooks();

    closeProgressModal();

    renderAll();

}


/* =========================================================
   STATS
   ========================================================= */

function renderReadingStats() {

    setText(
        "statsTotalBooks",
        books.length
    );


    setText(
        "statsFinishedBooks",
        countStatus(
            "finished"
        )
    );


    setText(
        "statsPagesRead",
        calculatePagesRead()
    );


    setText(
        "statsAverageRating",
        calculateAverageRating()
    );


    setText(
        "statsCurrentlyReading",
        countStatus(
            "reading"
        )
    );


    setText(
        "statsWantToRead",
        countStatus(
            "want"
        )
    );


    setText(
        "statsPaused",
        countStatus(
            "paused"
        )
    );


    setText(
        "statsDNF",
        countStatus(
            "dnf"
        )
    );


    setText(
        "statsReference",
        countStatus(
            "reference"
        )
    );


    setText(
        "statsRereads",
        calculateRereads()
    );


    renderGenreStats();

    renderMonthlyReadingStats();

}


/* =========================================================
   PAGES READ
   ========================================================= */

function calculatePagesRead() {

    return books.reduce(
        (
            total,
            book
        ) => {

            if (
                book.status ===
                "finished"
            ) {

                return (
                    total +
                    (
                        book.pages ||
                        book.current_page
                    )
                );

            }


            if (
                book.status ===
                "reading"
            ) {

                return (
                    total +
                    book.current_page
                );

            }


            return total;

        },
        0
    );

}


/* =========================================================
   AVERAGE RATING
   ========================================================= */

function calculateAverageRating() {

    const rated =
        books.filter(
            book =>
                Number(
                    book.rating
                ) >
                0
        );


    if (!rated.length) {
        return "—";
    }


    const average =
        rated.reduce(
            (
                total,
                book
            ) =>
                total +
                Number(
                    book.rating
                ),
            0
        )
        /
        rated.length;


    return `${average.toFixed(1)} ★`;

}


/* =========================================================
   REREADS
   ========================================================= */

function calculateRereads() {

    return books.reduce(
        (
            total,
            book
        ) => {

            return (
                total +
                Math.max(
                    0,
                    Number(
                        book.times_read ||
                        0
                    )
                    -
                    1
                )
            );

        },
        0
    );

}


function countStatus(status) {

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


    if (!container) {
        return;
    }


    const counts = {};


    books.forEach(book => {

        const genre =
            String(
                book.genre ||
                ""
            ).trim();


        if (!genre) {
            return;
        }


        counts[genre] =
            (
                counts[genre] ||
                0
            )
            +
            1;

    });


    const entries =
        Object.entries(counts)
            .sort(
                (a, b) =>
                    b[1] -
                    a[1]
            )
            .slice(
                0,
                6
            );


    if (!entries.length) {

        container.innerHTML = `

            <div class="stats-empty-line">

                Add genres to your books and
                they will appear here.

            </div>

        `;

        return;

    }


    const highest =
        entries[0][1];


    container.innerHTML =
        entries.map(
            (
                [
                    genre,
                    count
                ]
            ) => {

                const percent =
                    Math.round(
                        (
                            count /
                            highest
                        )
                        *
                        100
                    );


                return `

                    <div class="genre-stat-row">

                        <span class="genre-stat-name">

                            ${escapeHTML(
                                genre
                            )}

                        </span>

                        <div class="genre-stat-track">

                            <div
                                class="genre-stat-fill"
                                style="width:${percent}%"
                            >
                            </div>

                        </div>

                        <span class="genre-stat-count">

                            ${count}

                        </span>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   MONTHLY STATS
   ========================================================= */

function renderMonthlyReadingStats() {

    const container =
        document.getElementById(
            "monthlyReadingStats"
        );


    if (!container) {
        return;
    }


    const months =
        getLastTwelveMonths();


    const counts =
        months.map(month => {

            const count =
                books.filter(book => {

                    if (
                        book.status !==
                        "finished"
                        ||
                        !book.finished
                    ) {
                        return false;
                    }


                    const date =
                        parseDate(
                            book.finished
                        );


                    if (!date) {
                        return false;
                    }


                    return (
                        date.getFullYear() ===
                        month.year
                        &&
                        date.getMonth() ===
                        month.month
                    );

                }).length;


            return {
                ...month,
                count
            };

        });


    const highest =
        Math.max(
            1,
            ...counts.map(
                item =>
                    item.count
            )
        );


    container.innerHTML =
        counts.map(item => {

            const percent =
                item.count
                    ?
                    Math.max(
                        5,
                        Math.round(
                            (
                                item.count /
                                highest
                            )
                            *
                            100
                        )
                    )
                    :
                    2;


            return `

                <div class="month-stat">

                    <strong>
                        ${item.count}
                    </strong>

                    <div class="month-stat-bar-wrap">

                        <div
                            class="month-stat-bar"
                            style="height:${percent}%"
                        >
                        </div>

                    </div>

                    <span>
                        ${escapeHTML(
                            item.label
                        )}
                    </span>

                </div>

            `;

        }).join("");

}


function getLastTwelveMonths() {

    const result =
        [];


    const now =
        new Date();


    for (
        let index = 11;
        index >= 0;
        index--
    ) {

        const date =
            new Date(
                now.getFullYear(),
                now.getMonth() -
                index,
                1
            );


        result.push({

            year:
                date.getFullYear(),

            month:
                date.getMonth(),

            label:
                date.toLocaleDateString(
                    "en-US",
                    {
                        month:
                            "short"
                    }
                )

        });

    }


    return result;

}


/* =========================================================
   COVERS
   ========================================================= */

function renderCover(
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


    renderCoverInElement(
        element,
        book
    );

}


function renderCoverInElement(
    element,
    book
) {

    if (!element) {
        return;
    }


    element.innerHTML =
        "";


    element.style.backgroundImage =
        "";


    element.style.backgroundColor =
        book.spine_color;


    if (book.cover_image) {

        element.style.backgroundImage =
            `url("${safeStyleURL(
                book.cover_image
            )}")`;

        return;

    }


    const classes =
        getBookTypographyClasses(
            book,
            "generated-cover"
        );


    element.innerHTML = `

        <div
            class="${classes}"
            style="
                --book-color:${escapeHTML(
                    book.spine_color
                )};
                --book-text:${escapeHTML(
                    book.text_color
                )};
                --book-accent:${escapeHTML(
                    book.accent_color
                )};
            "
        >

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

        </div>

    `;

}


/* =========================================================
   STATUS
   ========================================================= */

function getStatusLabel(status) {

    return (
        CONFIG.readingStatuses
            ?.[status]
            ?.label
        ||
        status
        ||
        "Unknown"
    );

}


/* =========================================================
   PROGRESS
   ========================================================= */

function getProgressPercent(book) {

    if (!book.pages) {
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
   RATING
   ========================================================= */

function getRatingText(rating) {

    const value =
        Math.min(
            5,
            Math.max(
                0,
                Number(
                    rating ||
                    0
                )
            )
        );


    if (!value) {
        return "not rated";
    }


    return (
        "★".repeat(value)
        +
        "☆".repeat(
            5 -
            value
        )
    );

}


/* =========================================================
   DRAWERS
   ========================================================= */

function openThemeDrawer() {

    hideAllDrawersImmediately();


    showDrawer(
        "themeDrawer"
    );

}


function showDrawer(drawerId) {

    const drawer =
        document.getElementById(
            drawerId
        );


    const overlay =
        document.getElementById(
            "overlay"
        );


    if (!drawer) {
        return;
    }


    drawer.hidden =
        false;


    if (overlay) {
        overlay.hidden = false;
    }


    document.body.classList.add(
        "modal-open"
    );


    requestAnimationFrame(
        () => {

            drawer.classList.add(
                "open"
            );


            overlay
                ?.classList
                .add(
                    "open"
                );

        }
    );

}


function closeAllDrawers() {

    const drawers =
        document.querySelectorAll(
            ".form-drawer"
        );


    const overlay =
        document.getElementById(
            "overlay"
        );


    drawers.forEach(drawer => {

        drawer.classList.remove(
            "open"
        );

    });


    overlay
        ?.classList
        .remove(
            "open"
        );


    const delay =
        settings.reducedMotion
            ? 0
            : 220;


    window.setTimeout(
        () => {

            drawers.forEach(drawer => {

                drawer.hidden =
                    true;

            });


            if (overlay) {

                overlay.hidden =
                    true;

            }


            updateModalBodyState();

        },
        delay
    );

}


function hideAllDrawersImmediately() {

    document
        .querySelectorAll(
            ".form-drawer"
        )
        .forEach(drawer => {

            drawer.classList.remove(
                "open"
            );


            drawer.hidden =
                true;

        });


    const overlay =
        document.getElementById(
            "overlay"
        );


    if (overlay) {

        overlay.classList.remove(
            "open"
        );


        overlay.hidden =
            true;

    }

}


/* =========================================================
   MODAL BODY STATE
   ========================================================= */

function updateModalBodyState() {

    const drawerOpen =
        Array.from(
            document.querySelectorAll(
                ".form-drawer"
            )
        ).some(
            drawer =>
                drawer.hidden ===
                false
        );


    document.body.classList.toggle(
        "modal-open",
        drawerOpen ||
        isAnyModalOpen()
    );

}


function isAnyModalOpen() {

    return [
        "bookReveal",
        "readingBook",
        "entryModal",
        "progressModal"
    ].some(id => {

        const element =
            document.getElementById(
                id
            );


        return (
            element &&
            element.hidden ===
            false
        );

    });

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function bindSectionNavigation() {

    const links =
        Array.from(
            document.querySelectorAll(
                ".main-nav .nav-link[href^='#']"
            )
        );


    links.forEach(link => {

        link.addEventListener(
            "click",
            () => {

                links.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                link.classList.add(
                    "active"
                );

            }
        );

    });


    if (
        !(
            "IntersectionObserver"
            in window
        )
    ) {
        return;
    }


    const sections = [
        "library",
        "reading",
        "stats"
    ]
        .map(
            id =>
                document.getElementById(
                    id
                )
        )
        .filter(Boolean);


    const observer =
        new IntersectionObserver(
            entries => {

                const visible =
                    entries
                        .filter(
                            entry =>
                                entry.isIntersecting
                        )
                        .sort(
                            (a, b) =>
                                b.intersectionRatio -
                                a.intersectionRatio
                        )[0];


                if (!visible) {
                    return;
                }


                links.forEach(link => {

                    link.classList.toggle(
                        "active",
                        link.getAttribute(
                            "href"
                        )
                        ===
                        `#${visible.target.id}`
                    );

                });

            },
            {
                rootMargin:
                    "-25% 0px -55% 0px",

                threshold:
                    [
                        0,
                        0.1,
                        0.25,
                        0.5
                    ]
            }
        );


    sections.forEach(section => {

        observer.observe(
            section
        );

    });

}


/* =========================================================
   LOOKUPS
   ========================================================= */

function getBookById(id) {

    return (
        books.find(
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
        null
    );

}


function getShelfById(id) {

    return (
        shelves.find(
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
        null
    );

}


function getThemeDecorations() {

    return (
        CONFIG.themes
            ?.find(
                theme =>
                    theme.id ===
                    settings.theme
            )
            ?.defaultDecorations
        ||
        []
    );

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
            date.getMonth() +
            1
        ).padStart(
            2,
            "0"
        ),

        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        )
    ].join("-");

}


function parseDate(value) {

    if (!value) {
        return null;
    }


    const date =
        new Date(
            value.includes?.("T")
                ? value
                : `${value}T12:00:00`
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


function formatDate(value) {

    const date =
        parseDate(
            value
        );


    if (!date) {
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


function formatDateTime(value) {

    const date =
        parseDate(
            value
        );


    if (!date) {
        return "";
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


function dateValue(value) {

    const date =
        parseDate(
            value
        );


    return date
        ? date.getTime()
        : 0;

}


/* =========================================================
   NUMBER HELPERS
   ========================================================= */

function normalizeNumber(value) {

    const number =
        Number(value);


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
    fallback
) {

    const number =
        Number(value);


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


function normalizeScale(value) {

    const number =
        Number(value);


    if (
        Number.isNaN(
            number
        )
    ) {
        return 1;
    }


    return clamp(
        number,
        0.5,
        2
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
        window.crypto &&
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
   DOM HELPERS
   ========================================================= */

function bindClick(
    id,
    callback
) {

    document
        .getElementById(
            id
        )
        ?.addEventListener(
            "click",
            callback
        );

}


function getValue(id) {

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
    ).trim();

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
   SAFE STYLE URL
   ========================================================= */

function safeStyleURL(value) {

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

function escapeHTML(value) {

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
