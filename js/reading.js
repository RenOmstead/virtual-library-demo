/* =========================================================
   SHELFMARK
   READING NOW
   reading-now.js
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

let readingBooks = [];

let selectedReadingBookId = null;

let currentView = "cards";


let settings = {

    theme:
        CONFIG.defaultSettings?.theme ||
        CONFIG.defaultTheme ||
        "haunted",

    reducedMotion:
        CONFIG.defaultSettings?.reducedMotion ??
        false,

    decorationDensity:
        CONFIG.defaultSettings?.decorationDensity ||
        "cozy"

};


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeReadingNow
);


function initializeReadingNow() {

    resetReadingNowUI();

    loadSettings();

    loadReadingData();

    applyReadingTheme();

    bindReadingControls();

    renderReadingNow();

}


/* =========================================================
   RESET UI
   ========================================================= */

function resetReadingNowUI() {

    [
        "readingBookDetail",
        "progressModal"
    ]
        .forEach(id => {

            const element =
                document.getElementById(id);

            if (element) {
                element.hidden = true;
            }

        });

}


/* =========================================================
   LOAD SETTINGS
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
            "Could not load Shelfmark settings.",
            error
        );

    }

}


/* =========================================================
   LOAD DATA
   ========================================================= */

function loadReadingData() {

    shelves =
        loadCollection(
            STORAGE_KEYS.shelves
        );


    books =
        loadCollection(
            STORAGE_KEYS.books
        )
            .map(normalizeBook);


    readingBooks =
        books.filter(
            book =>
                book.status ===
                "reading"
        );

}


/* =========================================================
   LOAD COLLECTION
   ========================================================= */

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
            ?
            parsed
            :
            [];

    }

    catch (error) {

        console.error(
            `Could not load ${key}.`,
            error
        );


        return [];

    }

}


/* =========================================================
   NORMALIZE BOOK
   ========================================================= */

function normalizeBook(book) {

    return {

        ...book,

        id:
            book.id ||
            generateId(),

        title:
            book.title ||
            "Untitled Book",

        author:
            book.author ||
            "",

        shelf_id:
            book.shelf_id ||
            "",

        status:
            book.status ||
            "want",

        pages:
            normalizeNumber(
                book.pages
            ),

        current_page:
            normalizeNumber(
                book.current_page
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

        cover_image:
            book.cover_image ||
            "",

        style:
            book.style ||
            "classic",

        spine_color:
            book.spine_color ||
            "#6c2633",

        text_color:
            book.text_color ||
            "#eadfca",

        accent_color:
            book.accent_color ||
            "#b28a4a",

        spine_font:
            book.spine_font ||
            "serif",

        spine_ornament:
            book.spine_ornament ||
            "auto",

        journal:
            book.journal ||
            {}

    };

}


/* =========================================================
   APPLY THEME
   ========================================================= */

function applyReadingTheme() {

    const allowedThemes =
        (
            CONFIG.themes ||
            []
        )
            .map(
                theme =>
                    theme.id
            );


    [
        "haunted",
        "autumn",
        "forest",
        "retro",
        "ghosts"
    ]
        .forEach(theme => {

            document.body.classList.remove(
                `theme-${theme}`
            );

        });


    const theme =
        allowedThemes.includes(
            settings.theme
        )
            ?
            settings.theme
            :
            "haunted";


    document.body.classList.add(
        `theme-${theme}`
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

}


/* =========================================================
   BIND CONTROLS
   ========================================================= */

function bindReadingControls() {

    document
        .getElementById(
            "randomReadingBook"
        )
        ?.addEventListener(
            "click",
            openRandomReadingBook
        );


    document
        .querySelectorAll(
            "[data-view]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    currentView =
                        button.dataset.view;


                    document
                        .querySelectorAll(
                            "[data-view]"
                        )
                        .forEach(item => {

                            item.classList.toggle(
                                "active",
                                item === button
                            );

                        });


                    applyReadingView();

                }
            );

        });


    document
        .getElementById(
            "closeReadingDetail"
        )
        ?.addEventListener(
            "click",
            closeReadingDetail
        );


    document
        .getElementById(
            "featuredOpenBook"
        )
        ?.addEventListener(
            "click",
            openFeaturedJournal
        );


    document
        .getElementById(
            "featuredEditProgress"
        )
        ?.addEventListener(
            "click",
            openFeaturedProgress
        );


    document
        .getElementById(
            "detailOpenJournal"
        )
        ?.addEventListener(
            "click",
            openSelectedJournal
        );


    document
        .getElementById(
            "detailUpdateProgress"
        )
        ?.addEventListener(
            "click",
            openSelectedProgress
        );


    document
        .getElementById(
            "closeProgressModal"
        )
        ?.addEventListener(
            "click",
            closeProgressModal
        );


    document
        .getElementById(
            "cancelProgressUpdate"
        )
        ?.addEventListener(
            "click",
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
                event.key !== "Escape"
            ) {
                return;
            }


            closeProgressModal();

            closeReadingDetail();

        }
    );

}


/* =========================================================
   RENDER PAGE
   ========================================================= */

function renderReadingNow() {

    readingBooks =
        books.filter(
            book =>
                book.status ===
                "reading"
        );


    updateReadingSummary();


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


    if (!readingBooks.length) {

        if (featuredSection) {
            featuredSection.hidden = true;
        }


        if (listSection) {
            listSection.hidden = true;
        }


        if (empty) {
            empty.hidden = false;
        }


        return;

    }


    if (featuredSection) {
        featuredSection.hidden = false;
    }


    if (listSection) {
        listSection.hidden = false;
    }


    if (empty) {
        empty.hidden = true;
    }


    const featured =
        getFeaturedReadingBook();


    renderFeaturedBook(
        featured
    );


    renderReadingGrid();

}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateReadingSummary() {

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


    const totalPercent =
        readingBooks.reduce(
            (
                sum,
                book
            ) =>
                sum +
                getProgressPercent(book),
            0
        );


    const average =
        Math.round(
            totalPercent /
            readingBooks.length
        );


    const remaining =
        readingBooks.reduce(
            (
                sum,
                book
            ) => {

                if (!book.pages) {
                    return sum;
                }


                return (
                    sum +
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
   FEATURED BOOK
   ========================================================= */

function getFeaturedReadingBook() {

    return [
        ...readingBooks
    ]
        .sort(
            (
                a,
                b
            ) =>
                getProgressPercent(b)
                -
                getProgressPercent(a)
        )[0];

}


/* =========================================================
   RENDER FEATURED
   ========================================================= */

function renderFeaturedBook(book) {

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

function renderReadingGrid() {

    const grid =
        document.getElementById(
            "readingGrid"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    readingBooks
        .slice()
        .sort(
            (
                a,
                b
            ) => {

                return (
                    new Date(
                        b.started ||
                        b.created_at ||
                        0
                    )
                    -
                    new Date(
                        a.started ||
                        a.created_at ||
                        0
                    )
                );

            }
        )
        .forEach(book => {

            grid.appendChild(
                createReadingCard(
                    book
                )
            );

        });


    applyReadingView();

}


/* =========================================================
   CREATE CARD
   ========================================================= */

function createReadingCard(book) {

    const shelf =
        getShelfById(
            book.shelf_id
        );


    const percentage =
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

        <div class="reading-card-cover"></div>


        <div class="reading-card-copy">

            <div>

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

            </div>


            <div>

                <div class="reading-card-pages">

                    <span>
                        ${book.current_page}
                        /
                        ${book.pages || 0}
                    </span>

                    <strong>
                        ${percentage}%
                    </strong>

                </div>


                <div class="reading-card-progress">

                    <span
                        style="width:${percentage}%"
                    ></span>

                </div>

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

            openReadingDetail(
                book.id
            );

        }
    );


    return card;

}


/* =========================================================
   VIEW
   ========================================================= */

function applyReadingView() {

    const grid =
        document.getElementById(
            "readingGrid"
        );


    if (!grid) {
        return;
    }


    grid.classList.toggle(
        "compact",
        currentView ===
        "compact"
    );

}


/* =========================================================
   RANDOM BOOK
   ========================================================= */

function openRandomReadingBook() {

    if (!readingBooks.length) {
        return;
    }


    const index =
        Math.floor(
            Math.random() *
            readingBooks.length
        );


    openReadingDetail(
        readingBooks[index].id
    );

}


/* =========================================================
   DETAIL
   ========================================================= */

function openReadingDetail(
    bookId
) {

    const book =
        getBookById(
            bookId
        );


    if (!book) {
        return;
    }


    selectedReadingBookId =
        book.id;


    const shelf =
        getShelfById(
            book.shelf_id
        );


    renderCover(
        "detailCover",
        book
    );


    setText(
        "detailShelf",
        shelf?.name ||
        "my library"
    );


    setText(
        "detailTitle",
        book.title
    );


    setText(
        "detailAuthor",
        book.author ||
        "Author not recorded"
    );


    setText(
        "detailStarted",
        formatDate(
            book.started
        )
    );


    setText(
        "detailPages",
        `${book.current_page} / ${book.pages || 0}`
    );


    const percentage =
        getProgressPercent(
            book
        );


    setText(
        "detailPercent",
        `${percentage}%`
    );


    setText(
        "detailRating",
        getRatingText(
            book.rating
        )
    );


    const fill =
        document.getElementById(
            "detailProgressFill"
        );


    if (fill) {

        fill.style.width =
            `${percentage}%`;

    }


    const detail =
        document.getElementById(
            "readingBookDetail"
        );


    if (detail) {

        detail.hidden = false;

    }


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE DETAIL
   ========================================================= */

function closeReadingDetail() {

    const detail =
        document.getElementById(
            "readingBookDetail"
        );


    if (detail) {

        detail.hidden = true;

    }


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   FEATURED ACTIONS
   ========================================================= */

function openFeaturedJournal() {

    const id =
        document
            .getElementById(
                "featuredOpenBook"
            )
            ?.dataset.bookId;


    if (!id) {
        return;
    }


    openJournalForBook(id);

}


function openFeaturedProgress() {

    const id =
        document
            .getElementById(
                "featuredEditProgress"
            )
            ?.dataset.bookId;


    if (!id) {
        return;
    }


    openProgressModal(id);

}


/* =========================================================
   DETAIL ACTIONS
   ========================================================= */

function openSelectedJournal() {

    if (!selectedReadingBookId) {
        return;
    }


    openJournalForBook(
        selectedReadingBookId
    );

}


function openSelectedProgress() {

    if (!selectedReadingBookId) {
        return;
    }


    openProgressModal(
        selectedReadingBookId
    );

}


/* =========================================================
   OPEN JOURNAL
   ========================================================= */

function openJournalForBook(
    bookId
) {

    /*
     * For now the full open-book journal still
     * lives on index.html.
     *
     * Save the requested book ID so the library
     * page can use it later when we wire direct
     * journal deep-linking.
     */

    sessionStorage.setItem(
        "shelfmark_open_book",
        bookId
    );


    window.location.href =
        "index.html";

}


/* =========================================================
   PROGRESS MODAL
   ========================================================= */

function openProgressModal(
    bookId
) {

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
            ?
            `${book.pages} total pages`
            :
            "Page count not recorded"
    );


    setValue(
        "progressCurrentPage",
        book.current_page
    );


    setChecked(
        "markBookFinished",
        false
    );


    const pageInput =
        document.getElementById(
            "progressCurrentPage"
        );


    if (pageInput) {

        pageInput.max =
            book.pages > 0
                ?
                String(book.pages)
                :
                "";

    }


    updateProgressPreview();


    const modal =
        document.getElementById(
            "progressModal"
        );


    if (modal) {

        modal.hidden = false;

    }


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE PROGRESS
   ========================================================= */

function closeProgressModal() {

    const modal =
        document.getElementById(
            "progressModal"
        );


    if (modal) {

        modal.hidden = true;

    }


    if (
        document
            .getElementById(
                "readingBookDetail"
            )
            ?.hidden !== false
    ) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


/* =========================================================
   PROGRESS PREVIEW
   ========================================================= */

function updateProgressPreview() {

    const bookId =
        getValue(
            "progressBookId"
        );


    const book =
        getBookById(
            bookId
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


    if (
        book.pages >
        0
    ) {

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


/* =========================================================
   FINISHED CHECK
   ========================================================= */

function handleFinishedToggle(
    event
) {

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
        getBookById(
            bookId
        );


    if (!book) {
        return;
    }


    let currentPage =
        normalizeNumber(
            getValue(
                "progressCurrentPage"
            )
        );


    if (book.pages > 0) {

        currentPage =
            Math.min(
                currentPage,
                book.pages
            );

    }


    book.current_page =
        currentPage;


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

    }


    book.updated_at =
        new Date().toISOString();


    saveBooks();


    closeProgressModal();

    closeReadingDetail();


    loadReadingData();

    renderReadingNow();

}


/* =========================================================
   COVER RENDERING
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

    element.innerHTML = "";

    element.style.backgroundImage = "";

    element.style.backgroundColor =
        book.spine_color;


    if (book.cover_image) {

        element.style.backgroundImage =
            `url("${safeStyleURL(
                book.cover_image
            )}")`;


        return;

    }


    element.innerHTML = `

        <div
            class="reading-generated-cover"
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

            <span class="cover-symbol">
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


            <small>
                ${escapeHTML(
                    book.author ||
                    ""
                )}
            </small>

        </div>

    `;

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
        CONFIG.spineOrnaments?.[
            ornament
        ]?.symbol
        ||
        ""
    );

}


/* =========================================================
   LOOKUPS
   ========================================================= */

function getBookById(id) {

    return books.find(
        book =>
            String(book.id) ===
            String(id)
    )
    ||
    null;

}


function getShelfById(id) {

    return shelves.find(
        shelf =>
            String(shelf.id) ===
            String(id)
    )
    ||
    null;

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

function getRatingText(
    rating
) {

    if (!rating) {
        return "not rated";
    }


    return (
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
        )
    );

}


/* =========================================================
   SAVE BOOKS
   ========================================================= */

function saveBooks() {

    localStorage.setItem(
        STORAGE_KEYS.books,
        JSON.stringify(books)
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
        .join("-");

}


function formatDate(value) {

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
   HELPERS
   ========================================================= */

function normalizeNumber(value) {

    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {
        return 0;
    }


    return Math.max(
        0,
        Math.round(number)
    );

}


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


function getValue(id) {

    const element =
        document.getElementById(id);


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
        document.getElementById(id);


    if (element) {

        element.value =
            value ?? "";

    }

}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value ?? "";

    }

}


function setChecked(
    id,
    checked
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.checked =
            Boolean(checked);

    }

}


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
