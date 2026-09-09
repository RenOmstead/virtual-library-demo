/* =========================================================
   NOVELLOW
   READING.JS

   Currently reading page
   Featured book
   Reading statistics
   Progress modal
   Reading cards
   Journal handoff
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
       MODULE STATE
       ===================================================== */

    let featuredBookId =
        null;


    /* =====================================================
       INITIALIZE
       ===================================================== */

    function init() {

        bindReadingControls();

        bindProgressModal();

        render();

    }


    /* =====================================================
       STATE ACCESS
       ===================================================== */

    function getState() {

        return Novellow.state;

    }


    /* =====================================================
       BIND READING CONTROLS
       ===================================================== */

    function bindReadingControls() {

        H.bindClick?.(
            "featuredOpenJournal",
            () => {

                if (!featuredBookId) {
                    return;
                }


                openJournal(
                    featuredBookId
                );

            }
        );


        H.bindClick?.(
            "featuredUpdateProgress",
            () => {

                if (!featuredBookId) {
                    return;
                }


                openProgressModal(
                    featuredBookId
                );

            }
        );

    }


    /* =====================================================
       PROGRESS MODAL EVENTS
       ===================================================== */

    function bindProgressModal() {

        H.bindClick?.(
            "closeProgressModal",
            closeProgressModal
        );


        H.bindClick?.(
            "cancelProgressButton",
            closeProgressModal
        );


        const form =
            H.getById?.(
                "progressForm"
            );


        if (form) {

            form.addEventListener(
                "submit",
                handleProgressSubmit
            );

        }


        const pageInput =
            H.getById?.(
                "progressCurrentPage"
            );


        if (pageInput) {

            pageInput.addEventListener(
                "input",
                updateProgressPreview
            );

        }


        const finishedCheckbox =
            H.getById?.(
                "progressMarkFinished"
            );


        if (finishedCheckbox) {

            finishedCheckbox.addEventListener(
                "change",
                handleFinishedToggle
            );

        }


        const modal =
            H.getById?.(
                "progressModal"
            );


        if (modal) {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeProgressModal();

                    }

                }
            );

        }

    }


    /* =====================================================
       GET CURRENTLY READING
       ===================================================== */

    function getReadingBooks() {

        const state =
            getState();


        return (
            Array.isArray(
                state.books
            )
                ? state.books
                : []
        )
            .filter(
                book =>
                    book.status ===
                    "reading"
            )
            .sort(
                compareReadingBooks
            );

    }


    /* =====================================================
       SORT READING BOOKS
       ===================================================== */

    function compareReadingBooks(
        a,
        b
    ) {

        const aUpdated =
            H.dateSortValue?.(
                a.updatedAt
            ) || 0;


        const bUpdated =
            H.dateSortValue?.(
                b.updatedAt
            ) || 0;


        if (
            bUpdated !==
            aUpdated
        ) {

            return (
                bUpdated -
                aUpdated
            );

        }


        const aStarted =
            H.dateSortValue?.(
                a.started
            ) || 0;


        const bStarted =
            H.dateSortValue?.(
                b.started
            ) || 0;


        return (
            bStarted -
            aStarted
        );

    }


    /* =====================================================
       MAIN RENDER
       ===================================================== */

    function render() {

        const readingBooks =
            getReadingBooks();


        renderSummary(
            readingBooks
        );


        renderFeatured(
            readingBooks
        );


        renderReadingGrid(
            readingBooks
        );


        renderEmptyState(
            readingBooks
        );

    }


    /* =====================================================
       SUMMARY
       ===================================================== */

    function renderSummary(
        books
    ) {

        H.setText?.(
            "currentlyReadingCount",
            books.length
        );


        const progressBooks =
            books.filter(
                book =>
                    Number(
                        book.pages
                    ) > 0
            );


        let average =
            0;


        if (
            progressBooks.length
        ) {

            const totalProgress =
                progressBooks.reduce(
                    (
                        total,
                        book
                    ) => {

                        return (
                            total +
                            calculateBookPercent(
                                book
                            )
                        );

                    },
                    0
                );


            average =
                Math.round(
                    totalProgress /
                    progressBooks.length
                );

        }


        H.setText?.(
            "readingAverageProgress",
            `${average}%`
        );


        const pagesRemaining =
            books.reduce(
                (
                    total,
                    book
                ) => {

                    const pages =
                        Number(
                            book.pages
                        ) || 0;


                    const current =
                        Number(
                            book.currentPage
                        ) || 0;


                    if (
                        pages <= 0
                    ) {

                        return total;

                    }


                    return (
                        total +
                        Math.max(
                            0,
                            pages -
                            current
                        )
                    );

                },
                0
            );


        H.setText?.(
            "readingPagesRemaining",
            H.formatNumber?.(
                pagesRemaining
            ) ??
            pagesRemaining
        );

    }


    /* =====================================================
       FEATURED BOOK
       ===================================================== */

    function renderFeatured(
        books
    ) {

        const container =
            H.getById?.(
                "featuredReading"
            );


        if (!container) {
            return;
        }


        if (
            books.length === 0
        ) {

            featuredBookId =
                null;


            container.hidden =
                true;


            return;

        }


        const book =
            books[0];


        featuredBookId =
            book.id;


        container.hidden =
            false;


        renderCoverInto(
            "featuredReadingCover",
            book
        );


        H.setText?.(
            "featuredReadingTitle",
            book.title
        );


        H.setText?.(
            "featuredReadingAuthor",
            book.author ||
            "Unknown Author"
        );


        H.setText?.(
            "featuredReadingStarted",
            book.started
                ? H.formatDate?.(
                    book.started
                ) || book.started
                : "Not recorded"
        );


        H.setText?.(
            "featuredReadingPages",
            formatPagePosition(
                book
            )
        );


        const percent =
            calculateBookPercent(
                book
            );


        H.setText?.(
            "featuredReadingPercent",
            `${percent}%`
        );


        const progress =
            H.getById?.(
                "featuredReadingProgress"
            );


        if (progress) {

            progress.style.width =
                `${percent}%`;

        }

    }


    /* =====================================================
       READING GRID
       ===================================================== */

    function renderReadingGrid(
        books
    ) {

        const grid =
            H.getById?.(
                "readingGrid"
            );


        if (!grid) {
            return;
        }


        grid.innerHTML =
            "";


        /*
           The featured book remains in the grid too.

           This is intentional. The featured area highlights
           the most recently active book while the grid remains
           a complete list of everything currently being read.
        */

        books.forEach(
            book => {

                grid.appendChild(
                    createReadingCard(
                        book
                    )
                );

            }
        );

    }


    /* =====================================================
       CREATE READING CARD
       ===================================================== */

    function createReadingCard(
        book
    ) {

        const percent =
            calculateBookPercent(
                book
            );


        const card =
            document.createElement(
                "article"
            );


        card.className =
            "reading-card";


        if (
            percent >= 80
        ) {

            card.classList.add(
                "is-nearly-finished"
            );

        }


        if (
            !Number(
                book.pages
            )
        ) {

            card.classList.add(
                "no-page-count"
            );

        }


        card.dataset.bookId =
            book.id;


        card.tabIndex =
            0;


        card.setAttribute(
            "role",
            "button"
        );


        card.setAttribute(
            "aria-label",
            `Open ${book.title}`
        );


        card.innerHTML =
            `
                <div class="reading-card-cover"></div>

                <div class="reading-card-content">

                    <span class="reading-card-status">
                        Currently Reading
                    </span>

                    <h3 class="reading-card-title">
                        ${H.escapeHTML?.(
                            book.title
                        )}
                    </h3>

                    <p class="reading-card-author">
                        ${
                            H.escapeHTML?.(
                                book.author ||
                                "Unknown Author"
                            )
                        }
                    </p>

                    <div class="reading-card-progress">

                        <div class="reading-card-progress-row">

                            <span>
                                ${formatPagePosition(
                                    book
                                )}
                            </span>

                            <strong>
                                ${percent}%
                            </strong>

                        </div>

                        <div class="progress-track">

                            <div
                                class="progress-fill"
                                style="width: ${percent}%"
                            ></div>

                        </div>

                    </div>

                    <div class="reading-card-meta">

                        ${
                            book.started
                                ? `
                                    <span>
                                        Started
                                        ${H.escapeHTML?.(
                                            H.formatDate?.(
                                                book.started
                                            ) ||
                                            book.started
                                        )}
                                    </span>
                                `
                                : ""
                        }

                        ${
                            book.genre
                                ? `
                                    <span>
                                        ${H.escapeHTML?.(
                                            book.genre
                                        )}
                                    </span>
                                `
                                : ""
                        }

                    </div>

                </div>

                <div class="reading-card-actions">

                    <button
                        type="button"
                        class="reading-card-action"
                        data-reading-progress="${book.id}"
                    >
                        Update Progress
                    </button>

                    <button
                        type="button"
                        class="reading-card-action"
                        data-reading-journal="${book.id}"
                    >
                        Journal
                    </button>

                </div>
            `;


        const cover =
            card.querySelector(
                ".reading-card-cover"
            );


        if (cover) {

            appendBookCover(
                cover,
                book
            );

        }


        card.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        ".reading-card-action"
                    )
                ) {

                    return;

                }


                Novellow.books
                    ?.openReveal?.(
                        book.id
                    );

            }
        );


        card.addEventListener(
            "keydown",
            event => {

                if (
                    event.key !==
                    "Enter" &&
                    event.key !==
                    " "
                ) {

                    return;

                }


                if (
                    event.target.closest(
                        ".reading-card-action"
                    )
                ) {

                    return;

                }


                event.preventDefault();


                Novellow.books
                    ?.openReveal?.(
                        book.id
                    );

            }
        );


        const progressButton =
            card.querySelector(
                `[data-reading-progress="${book.id}"]`
            );


        progressButton?.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                openProgressModal(
                    book.id
                );

            }
        );


        const journalButton =
            card.querySelector(
                `[data-reading-journal="${book.id}"]`
            );


        journalButton?.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                openJournal(
                    book.id
                );

            }
        );


        return card;

    }


    /* =====================================================
       EMPTY STATE
       ===================================================== */

    function renderEmptyState(
        books
    ) {

        const empty =
            H.getById?.(
                "readingEmptyState"
            );


        if (!empty) {
            return;
        }


        empty.hidden =
            books.length > 0;

    }


    /* =====================================================
       OPEN PROGRESS MODAL
       ===================================================== */

    function openProgressModal(
        bookId
    ) {

        const book =
            H.getBookById?.(
                bookId
            );


        if (!book) {
            return;
        }


        const modal =
            H.getById?.(
                "progressModal"
            );


        if (!modal) {
            return;
        }


        setInputValue(
            "progressBookId",
            book.id
        );


        H.setText?.(
            "progressBookTitle",
            book.title
        );


        H.setText?.(
            "progressBookTotal",
            book.pages
                ? `${book.pages} pages`
                : "No page count"
        );


        const currentPage =
            H.getById?.(
                "progressCurrentPage"
            );


        if (currentPage) {

            currentPage.value =
                Number(
                    book.currentPage
                ) || 0;


            currentPage.min =
                "0";


            if (
                Number(
                    book.pages
                ) > 0
            ) {

                currentPage.max =
                    String(
                        book.pages
                    );

            } else {

                currentPage.removeAttribute(
                    "max"
                );

            }

        }


        const finished =
            H.getById?.(
                "progressMarkFinished"
            );


        if (finished) {

            finished.checked =
                false;

        }


        updateProgressPreview();


        modal.hidden =
            false;


        document.body.classList.add(
            "modal-open"
        );


        requestAnimationFrame(
            () => {

                currentPage?.focus();

                currentPage?.select();

            }
        );

    }


    /* =====================================================
       CLOSE PROGRESS MODAL
       ===================================================== */

    function closeProgressModal() {

        const modal =
            H.getById?.(
                "progressModal"
            );


        if (modal) {

            modal.hidden =
                true;

        }


        syncBodyScrollLock();

    }


    /* =====================================================
       FINISHED TOGGLE
       ===================================================== */

    function handleFinishedToggle() {

        const finished =
            H.getById?.(
                "progressMarkFinished"
            );


        if (
            !finished?.checked
        ) {

            updateProgressPreview();

            return;

        }


        const book =
            getProgressBook();


        if (
            !book
        ) {

            return;

        }


        if (
            Number(
                book.pages
            ) > 0
        ) {

            setInputValue(
                "progressCurrentPage",
                book.pages
            );

        }


        updateProgressPreview();

    }


    /* =====================================================
       UPDATE PROGRESS PREVIEW
       ===================================================== */

    function updateProgressPreview() {

        const book =
            getProgressBook();


        if (!book) {
            return;
        }


        const current =
            Math.max(
                0,
                Number(
                    getInputValue(
                        "progressCurrentPage"
                    )
                ) || 0
            );


        const total =
            Number(
                book.pages
            ) || 0;


        const percent =
            total > 0
                ? Math.round(
                    Math.min(
                        1,
                        current /
                        total
                    ) *
                    100
                )
                : 0;


        const fill =
            H.getById?.(
                "progressPreviewFill"
            );


        if (fill) {

            fill.style.width =
                `${percent}%`;

        }


        H.setText?.(
            "progressPreviewPercent",
            total > 0
                ? `${percent}%`
                : "—"
        );

    }


    /* =====================================================
       SUBMIT PROGRESS
       ===================================================== */

    function handleProgressSubmit(
        event
    ) {

        event.preventDefault();


        const state =
            getState();


        const book =
            getProgressBook();


        if (!book) {

            closeProgressModal();

            return;

        }


        const totalPages =
            Math.max(
                0,
                Number(
                    book.pages
                ) || 0
            );


        let currentPage =
            Math.max(
                0,
                Number(
                    getInputValue(
                        "progressCurrentPage"
                    )
                ) || 0
            );


        if (
            totalPages > 0
        ) {

            currentPage =
                Math.min(
                    currentPage,
                    totalPages
                );

        }


        const markFinished =
            Boolean(
                H.getById?.(
                    "progressMarkFinished"
                )?.checked
            );


        const wasFinished =
            book.status ===
            "finished";


        if (
            markFinished
        ) {

            book.status =
                "finished";


            book.finished =
                book.finished ||
                H.todayISO?.() ||
                "";


            book.started =
                book.started ||
                H.todayISO?.() ||
                "";


            if (
                totalPages > 0
            ) {

                currentPage =
                    totalPages;

            }


            if (
                !wasFinished
            ) {

                book.timesRead =
                    Math.max(
                        0,
                        Number(
                            book.timesRead
                        ) || 0
                    ) + 1;

            }

        } else {

            book.status =
                "reading";


            book.started =
                book.started ||
                H.todayISO?.() ||
                "";


            /*
               If a page number reaches the end of the book,
               Novellow does not automatically mark it finished.
               The user controls completion using the checkbox.
            */

        }


        book.currentPage =
            currentPage;


        book.updatedAt =
            H.nowISO?.();


        const index =
            state.books.findIndex(
                item =>
                    item.id ===
                    book.id
            );


        if (
            index !== -1
        ) {

            state.books[
                index
            ] =
                H.normalizeBook?.(
                    book
                ) ||
                book;

        }


        Novellow.storage
            ?.saveBooks?.();


        closeProgressModal();


        refreshConnectedViews();


        H.showToast?.(
            markFinished
                ? `"${book.title}" finished.`
                : "Reading progress updated.",
            "success"
        );

    }


    /* =====================================================
       GET PROGRESS BOOK
       ===================================================== */

    function getProgressBook() {

        const id =
            getInputValue(
                "progressBookId"
            );


        if (!id) {
            return null;
        }


        return (
            H.getBookById?.(
                id
            ) ||
            null
        );

    }


    /* =====================================================
       OPEN JOURNAL
       ===================================================== */

    function openJournal(
        bookId
    ) {

        if (!bookId) {
            return;
        }


        getState().selectedBookId =
            bookId;


        Novellow.navigation
            ?.navigateTo?.(
                "journal"
            );


        Novellow.journal
            ?.selectBook?.(
                bookId
            );

    }


    /* =====================================================
       COVER RENDERING
       ===================================================== */

    function renderCoverInto(
        id,
        book
    ) {

        const container =
            H.getById?.(
                id
            );


        if (!container) {
            return;
        }


        container.innerHTML =
            "";


        appendBookCover(
            container,
            book
        );

    }


    function appendBookCover(
        container,
        book
    ) {

        const cover =
            Novellow.books
                ?.createCoverElement?.(
                    book
                );


        if (cover) {

            container.appendChild(
                cover
            );

            return;

        }


        /*
           Safety fallback for early development if books.js
           has not initialized.
        */

        const fallback =
            document.createElement(
                "div"
            );


        fallback.className =
            "generated-cover";


        fallback.innerHTML =
            `
                <strong class="generated-cover-title">
                    ${H.escapeHTML?.(
                        book.title
                    )}
                </strong>

                <span class="generated-cover-author">
                    ${H.escapeHTML?.(
                        book.author ||
                        ""
                    )}
                </span>
            `;


        container.appendChild(
            fallback
        );

    }


    /* =====================================================
       PAGE POSITION
       ===================================================== */

    function formatPagePosition(
        book
    ) {

        const current =
            Math.max(
                0,
                Number(
                    book.currentPage
                ) || 0
            );


        const pages =
            Math.max(
                0,
                Number(
                    book.pages
                ) || 0
            );


        if (
            pages > 0
        ) {

            return (
                `Page ${H.formatNumber?.(
                    current
                ) ?? current} of ${H.formatNumber?.(
                    pages
                ) ?? pages}`
            );

        }


        if (
            current > 0
        ) {

            return (
                `Page ${H.formatNumber?.(
                    current
                ) ?? current}`
            );

        }


        return "No page progress yet";

    }


    /* =====================================================
       BOOK PERCENT
       ===================================================== */

    function calculateBookPercent(
        book
    ) {

        const pages =
            Number(
                book.pages
            ) || 0;


        const current =
            Number(
                book.currentPage
            ) || 0;


        if (
            pages <= 0
        ) {

            return 0;

        }


        return Math.max(
            0,
            Math.min(
                100,
                Math.round(
                    (
                        current /
                        pages
                    ) *
                    100
                )
            )
        );

    }


    /* =====================================================
       REFRESH CONNECTED SECTIONS
       ===================================================== */

    function refreshConnectedViews() {

        render();


        Novellow.library
            ?.render?.();


        Novellow.journal
            ?.render?.();


        Novellow.stats
            ?.render?.();


        /*
           If the book reveal happens to be open,
           refresh its values by reopening the selected book.
        */

        const reveal =
            H.getById?.(
                "bookReveal"
            );


        const selectedBookId =
            getState()
                .selectedBookId;


        if (
            reveal &&
            !reveal.hidden &&
            selectedBookId
        ) {

            Novellow.books
                ?.openReveal?.(
                    selectedBookId
                );

        }

    }


    /* =====================================================
       BODY SCROLL LOCK
       ===================================================== */

    function syncBodyScrollLock() {

        const openLayer =
            [
                "themeDrawer",
                "settingsDrawer",
                "shelfDrawer",
                "bookDrawer",
                "bookReveal",
                "progressModal",
                "journalEntryModal",
                "quoteModal",
                "wordModal"
            ].some(
                id => {

                    const element =
                        H.getById?.(
                            id
                        );


                    return (
                        element &&
                        !element.hidden
                    );

                }
            );


        document.body.classList.toggle(
            "modal-open",
            openLayer
        );

    }


    /* =====================================================
       INPUT HELPERS
       ===================================================== */

    function setInputValue(
        id,
        value
    ) {

        const element =
            H.getById?.(
                id
            );


        if (!element) {
            return;
        }


        element.value =
            value ?? "";

    }


    function getInputValue(
        id
    ) {

        const element =
            H.getById?.(
                id
            );


        return (
            element?.value ??
            ""
        );

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    Novellow.reading = {

        init,

        render,

        getReadingBooks,

        createReadingCard,

        openProgressModal,

        closeProgressModal,

        updateProgressPreview,

        openJournal

    };


})();
