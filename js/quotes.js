/* =========================================================
   NOVELLOW
   QUOTES.JS

   Global quote collection
   Book-linked passages
   Journal integration
   Search
   Add / edit / delete
   ========================================================= */


(() => {

    "use strict";


    /* =====================================================
       GLOBALS
       ===================================================== */

    window.NOVELLOW =
        window.NOVELLOW ||
        {};


    const Novellow =
        window.NOVELLOW;


    const H =
        Novellow.helpers ||
        {};


    /* =====================================================
       INIT
       ===================================================== */

    function init() {

        bindControls();

        populateBookSelect();

        render();

    }


    /* =====================================================
       STATE
       ===================================================== */

    function getState() {

        return Novellow.state || {};

    }


    function getQuotes() {

        return Array.isArray(
            getState().quotes
        )
            ? getState().quotes
            : [];

    }


    function getBooks() {

        return Array.isArray(
            getState().books
        )
            ? getState().books
            : [];

    }


    /* =====================================================
       BIND CONTROLS
       ===================================================== */

    function bindControls() {

        H.bindClick?.(
            "addQuoteButton",
            () => {

                openAddModal();

            }
        );


        H.bindClick?.(
            "closeQuoteModal",
            closeModal
        );


        H.bindClick?.(
            "cancelQuoteButton",
            closeModal
        );


        const form =
            H.getById?.(
                "quoteForm"
            );


        if (form) {

            form.addEventListener(
                "submit",
                handleSubmit
            );

        }


        const search =
            H.getById?.(
                "quoteSearch"
            );


        if (search) {

            search.addEventListener(
                "input",
                render
            );

        }


        const modal =
            H.getById?.(
                "quoteModal"
            );


        if (modal) {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeModal();

                    }

                }
            );

        }

    }


    /* =====================================================
       RENDER
       ===================================================== */

    function render() {

        populateBookSelect();


        const grid =
            H.getById?.(
                "quoteGrid"
            );


        if (!grid) {
            return;
        }


        const empty =
            H.getById?.(
                "quotesEmptyState"
            );


        const quotes =
            getQuotes();


        const searchTerm =
            normalizeSearch(
                H.getById?.(
                    "quoteSearch"
                )?.value ||
                ""
            );


        const filtered =
            quotes
                .filter(
                    quote =>
                        quoteMatchesSearch(
                            quote,
                            searchTerm
                        )
                )
                .sort(
                    newestFirst
                );


        grid.innerHTML =
            "";


        if (
            quotes.length === 0
        ) {

            if (empty) {

                empty.hidden =
                    false;

            }


            return;

        }


        if (empty) {

            empty.hidden =
                true;

        }


        if (
            filtered.length === 0
        ) {

            const message =
                document.createElement(
                    "div"
                );


            message.className =
                "quote-search-message";


            message.textContent =
                "No quotes match your search.";


            grid.appendChild(
                message
            );


            return;

        }


        filtered.forEach(
            quote => {

                grid.appendChild(
                    createQuoteCard(
                        quote
                    )
                );

            }
        );

    }


    /* =====================================================
       SEARCH
       ===================================================== */

    function quoteMatchesSearch(
        quote,
        searchTerm
    ) {

        if (!searchTerm) {
            return true;
        }


        const book =
            H.getBookById?.(
                quote.bookId ||
                quote.book
            );


        const haystack =
            normalizeSearch(
                [
                    quote.text,
                    quote.page,
                    quote.chapter,
                    quote.thoughts,
                    book?.title,
                    book?.author
                ]
                    .filter(Boolean)
                    .join(" ")
            );


        return haystack.includes(
            searchTerm
        );

    }


    /* =====================================================
       CREATE GLOBAL QUOTE CARD
       ===================================================== */

    function createQuoteCard(
        quote
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "quote-card";


        if (
            String(
                quote.text ||
                ""
            ).length > 220
        ) {

            card.classList.add(
                "is-long"
            );

        }


        const book =
            H.getBookById?.(
                quote.bookId ||
                quote.book
            );


        const location =
            buildLocationText(
                quote
            );


        card.innerHTML =
            `
                <div class="quote-card-text">
                    ${escape(
                        quote.text
                    )}
                </div>

                <div class="quote-card-source">

                    <span class="quote-card-book">
                        ${escape(
                            book?.title ||
                            "Unlinked quote"
                        )}
                    </span>

                    ${
                        location
                            ? `
                                <div class="quote-card-location">
                                    ${escape(
                                        location
                                    )}
                                </div>
                            `
                            : ""
                    }

                    ${
                        quote.thoughts
                            ? `
                                <div class="quote-card-thoughts">
                                    ${escape(
                                        quote.thoughts
                                    )}
                                </div>
                            `
                            : ""
                    }

                    <div class="quote-card-actions">

                        ${
                            book
                                ? `
                                    <button
                                        type="button"
                                        class="quote-card-action"
                                        data-quote-open-book="${quote.id}"
                                    >
                                        Open Book
                                    </button>
                                `
                                : ""
                        }

                        <button
                            type="button"
                            class="quote-card-action"
                            data-quote-edit="${quote.id}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="quote-card-action danger"
                            data-quote-delete="${quote.id}"
                        >
                            Delete
                        </button>

                    </div>

                </div>
            `;


        if (book) {

            card.querySelector(
                `[data-quote-open-book="${quote.id}"]`
            )?.addEventListener(
                "click",
                () => {

                    Novellow.app
                        ?.navigate?.(
                            "journal"
                        );


                    requestAnimationFrame(
                        () => {

                            Novellow.journal
                                ?.openBook?.(
                                    book.id,
                                    "quotes"
                                );

                        }
                    );

                }
            );

        }


        card.querySelector(
            `[data-quote-edit="${quote.id}"]`
        )?.addEventListener(
            "click",
            () => {

                openEditModal(
                    quote.id
                );

            }
        );


        card.querySelector(
            `[data-quote-delete="${quote.id}"]`
        )?.addEventListener(
            "click",
            () => {

                deleteQuote(
                    quote.id
                );

            }
        );


        return card;

    }


    /* =====================================================
       ADD MODAL
       ===================================================== */

    function openAddModal(
        bookId =
            ""
    ) {

        resetForm();


        H.setText?.(
            "quoteModalTitle",
            "Add Quote"
        );


        const preferredBookId =
            bookId ||
            getState().selectedBookId ||
            "";


        populateBookSelect(
            preferredBookId
        );


        setValue(
            "quoteBook",
            preferredBookId
        );


        openModal();

    }


    /* =====================================================
       EDIT MODAL
       ===================================================== */

    function openEditModal(
        quoteId
    ) {

        const quote =
            H.getQuoteById?.(
                quoteId
            );


        if (!quote) {

            H.showToast?.(
                "That quote could not be found.",
                "error"
            );

            return;

        }


        resetForm();


        H.setText?.(
            "quoteModalTitle",
            "Edit Quote"
        );


        setValue(
            "editingQuoteId",
            quote.id
        );


        const bookId =
            quote.bookId ||
            quote.book ||
            "";


        populateBookSelect(
            bookId
        );


        setValue(
            "quoteBook",
            bookId
        );


        setValue(
            "quoteText",
            quote.text
        );


        setValue(
            "quotePage",
            quote.page
        );


        setValue(
            "quoteChapter",
            quote.chapter
        );


        setValue(
            "quoteThoughts",
            quote.thoughts
        );


        openModal();

    }


    /* =====================================================
       OPEN MODAL
       ===================================================== */

    function openModal() {

        const modal =
            H.getById?.(
                "quoteModal"
            );


        if (!modal) {
            return;
        }


        modal.hidden =
            false;


        document.body.classList.add(
            "modal-open"
        );


        requestAnimationFrame(
            () => {

                H.getById?.(
                    "quoteText"
                )?.focus();

            }
        );

    }


    /* =====================================================
       CLOSE MODAL
       ===================================================== */

    function closeModal() {

        const modal =
            H.getById?.(
                "quoteModal"
            );


        if (modal) {

            modal.hidden =
                true;

        }


        syncBodyLock();

    }


    /* =====================================================
       RESET FORM
       ===================================================== */

    function resetForm() {

        const form =
            H.getById?.(
                "quoteForm"
            );


        form?.reset();


        setValue(
            "editingQuoteId",
            ""
        );


        populateBookSelect();

    }


    /* =====================================================
       SUBMIT
       ===================================================== */

    function handleSubmit(
        event
    ) {

        event.preventDefault();


        const state =
            getState();


        if (
            !Array.isArray(
                state.quotes
            )
        ) {

            state.quotes =
                [];

        }


        const editingId =
            value(
                "editingQuoteId"
            );


        const existing =
            editingId
                ? H.getQuoteById?.(
                    editingId
                )
                : null;


        const text =
            value(
                "quoteText"
            ).trim();


        if (!text) {

            H.showToast?.(
                "Add the quote before saving.",
                "error"
            );

            return;

        }


        const bookId =
            value(
                "quoteBook"
            );


        const now =
            H.nowISO?.() ||
            new Date()
                .toISOString();


        const quote =
            H.normalizeQuote?.({

                ...existing,

                id:
                    existing?.id ||
                    H.createId?.(
                        "quote"
                    ),

                bookId,

                book:
                    bookId,

                text,

                page:
                    value(
                        "quotePage"
                    ),

                chapter:
                    value(
                        "quoteChapter"
                    ).trim(),

                thoughts:
                    value(
                        "quoteThoughts"
                    ).trim(),

                createdAt:
                    existing?.createdAt ||
                    now,

                updatedAt:
                    now

            }) || {

                ...existing,

                id:
                    existing?.id ||
                    H.createId?.(
                        "quote"
                    ) ||
                    `quote-${Date.now()}`,

                bookId,

                book:
                    bookId,

                text,

                page:
                    value(
                        "quotePage"
                    ),

                chapter:
                    value(
                        "quoteChapter"
                    ).trim(),

                thoughts:
                    value(
                        "quoteThoughts"
                    ).trim(),

                createdAt:
                    existing?.createdAt ||
                    now,

                updatedAt:
                    now

            };


        if (existing) {

            const index =
                state.quotes.findIndex(
                    item =>
                        item.id ===
                        existing.id
                );


            if (
                index !== -1
            ) {

                state.quotes[
                    index
                ] =
                    quote;

            }


            H.showToast?.(
                "Quote updated.",
                "success"
            );

        } else {

            state.quotes.push(
                quote
            );


            H.showToast?.(
                "Quote saved.",
                "success"
            );

        }


        saveQuotes();

        closeModal();

        refreshConnectedViews();

    }


    /* =====================================================
       DELETE
       ===================================================== */

    function deleteQuote(
        quoteId
    ) {

        const quote =
            H.getQuoteById?.(
                quoteId
            );


        if (!quote) {
            return;
        }


        const confirmed =
            H.confirmAction?.(
                "Delete this quote?"
            );


        if (!confirmed) {
            return;
        }


        const state =
            getState();


        state.quotes =
            getQuotes().filter(
                item =>
                    item.id !==
                    quoteId
            );


        saveQuotes();

        refreshConnectedViews();


        H.showToast?.(
            "Quote deleted.",
            "success"
        );

    }


    /* =====================================================
       BOOK SELECT
       ===================================================== */

    function populateBookSelect(
        selectedBookId =
            ""
    ) {

        const select =
            H.getById?.(
                "quoteBook"
            );


        if (!select) {
            return;
        }


        const previous =
            selectedBookId ||
            select.value ||
            "";


        select.innerHTML =
            "";


        const none =
            document.createElement(
                "option"
            );


        none.value =
            "";


        none.textContent =
            "No book selected";


        select.appendChild(
            none
        );


        const books =
            [...getBooks()]
                .sort(
                    (a, b) => {

                        return String(
                            a.title ||
                            ""
                        ).localeCompare(
                            String(
                                b.title ||
                                ""
                            )
                        );

                    }
                );


        books.forEach(
            book => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    book.id;


                option.textContent =
                    book.author
                        ? `${book.title} — ${book.author}`
                        : book.title ||
                            "Untitled Book";


                select.appendChild(
                    option
                );

            }
        );


        if (
            books.some(
                book =>
                    book.id ===
                    previous
            )
        ) {

            select.value =
                previous;

        } else {

            select.value =
                "";

        }

    }


    /* =====================================================
       SAVE
       ===================================================== */

    function saveQuotes() {

        Novellow.storage
            ?.saveQuotes?.();

    }


    /* =====================================================
       REFRESH
       ===================================================== */

    function refreshConnectedViews() {

        render();


        Novellow.journal
            ?.renderOpenBook?.();


        Novellow.journal
            ?.renderJournalLibrary?.();


        Novellow.stats
            ?.render?.();

    }


    /* =====================================================
       LOCATION
       ===================================================== */

    function buildLocationText(
        quote
    ) {

        const parts =
            [];


        if (
            quote.chapter
        ) {

            parts.push(
                quote.chapter
            );

        }


        if (
            quote.page
        ) {

            parts.push(
                `Page ${quote.page}`
            );

        }


        return parts.join(
            " · "
        );

    }


    /* =====================================================
       SORT
       ===================================================== */

    function newestFirst(
        a,
        b
    ) {

        const aTime =
            H.dateSortValue?.(
                a.updatedAt ||
                a.createdAt
            ) || 0;


        const bTime =
            H.dateSortValue?.(
                b.updatedAt ||
                b.createdAt
            ) || 0;


        return (
            bTime -
            aTime
        );

    }


    /* =====================================================
       NORMALIZE SEARCH
       ===================================================== */

    function normalizeSearch(
        input
    ) {

        if (
            H.normalizeSearch
        ) {

            return H.normalizeSearch(
                input
            );

        }


        return String(
            input ||
            ""
        )
            .trim()
            .toLowerCase();

    }


    /* =====================================================
       BODY LOCK
       ===================================================== */

    function syncBodyLock() {

        const ids = [

            "themeDrawer",
            "settingsDrawer",
            "shelfDrawer",
            "bookDrawer",
            "bookReveal",
            "progressModal",
            "journalEntryModal",
            "quoteModal",
            "wordModal"

        ];


        const anyOpen =
            ids.some(
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
            anyOpen
        );

    }


    /* =====================================================
       VALUE HELPERS
       ===================================================== */

    function setValue(
        id,
        nextValue
    ) {

        const element =
            H.getById?.(
                id
            );


        if (!element) {
            return;
        }


        element.value =
            nextValue ??
            "";

    }


    function value(
        id
    ) {

        return (
            H.getById?.(
                id
            )?.value ??
            ""
        );

    }


    /* =====================================================
       ESCAPE
       ===================================================== */

    function escape(
        input
    ) {

        if (
            H.escapeHTML
        ) {

            return H.escapeHTML(
                String(
                    input ??
                    ""
                )
            );

        }


        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            String(
                input ??
                ""
            );


        return div.innerHTML;

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    Novellow.quotes = {

        init,

        render,

        openAddModal,

        openEditModal,

        closeModal,

        deleteQuote,

        populateBookSelect

    };


})();
