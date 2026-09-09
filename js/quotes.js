/* =========================================================
   NOVELLOW
   QUOTES.JS

   Quote collection
   Add quote
   Edit quote
   Delete quote
   Search
   Book association
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
       INIT
       ===================================================== */

    function init() {

        bindQuoteControls();

        populateBookSelect();

        render();

    }


    /* =====================================================
       STATE
       ===================================================== */

    function getState() {

        return Novellow.state;

    }


    /* =====================================================
       BIND CONTROLS
       ===================================================== */

    function bindQuoteControls() {

        H.bindClick?.(
            "addQuoteButton",
            openAddModal
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


        const state =
            getState();


        const quotes =
            Array.isArray(
                state.quotes
            )
                ? state.quotes
                : [];


        const searchTerm =
            H.normalizeSearch?.(
                H.getById?.(
                    "quoteSearch"
                )?.value ||
                ""
            ) || "";


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
                    compareQuotes
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
            H.normalizeSearch?.(
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
            ) || "";


        return haystack.includes(
            searchTerm
        );

    }


    /* =====================================================
       SORT
       ===================================================== */

    function compareQuotes(
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
       CREATE CARD
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
                    ${H.escapeHTML?.(
                        quote.text
                    )}
                </div>

                <div class="quote-card-source">

                    <span class="quote-card-book">
                        ${
                            H.escapeHTML?.(
                                book?.title ||
                                "Unlinked quote"
                            )
                        }
                    </span>

                    ${
                        location
                            ? `
                                <div class="quote-card-location">
                                    ${H.escapeHTML?.(
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
                                    ${H.escapeHTML?.(
                                        quote.thoughts
                                    )}
                                </div>
                            `
                            : ""
                    }

                    <div class="quote-card-actions">

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
       LOCATION TEXT
       ===================================================== */

    function buildLocationText(
        quote
    ) {

        const parts =
            [];


        if (
            quote.page
        ) {

            parts.push(
                `Page ${quote.page}`
            );

        }


        if (
            quote.chapter
        ) {

            parts.push(
                quote.chapter
            );

        }


        return parts.join(
            " · "
        );

    }


    /* =====================================================
       OPEN ADD MODAL
       ===================================================== */

    function openAddModal() {

        resetForm();


        H.setText?.(
            "quoteModalTitle",
            "Add Quote"
        );


        setInputValue(
            "editingQuoteId",
            ""
        );


        openModal();

    }


    /* =====================================================
       OPEN EDIT MODAL
       ===================================================== */

    function openEditModal(
        quoteId
    ) {

        const quote =
            H.getQuoteById?.(
                quoteId
            );


        if (!quote) {
            return;
        }


        resetForm();


        H.setText?.(
            "quoteModalTitle",
            "Edit Quote"
        );


        setInputValue(
            "editingQuoteId",
            quote.id
        );


        populateBookSelect(
            quote.bookId ||
            quote.book ||
            ""
        );


        setInputValue(
            "quoteBook",
            quote.bookId ||
            quote.book ||
            ""
        );


        setInputValue(
            "quoteText",
            quote.text
        );


        setInputValue(
            "quotePage",
            quote.page
        );


        setInputValue(
            "quoteChapter",
            quote.chapter
        );


        setInputValue(
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


        setInputValue(
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


        const editingId =
            getInputValue(
                "editingQuoteId"
            );


        const existing =
            editingId
                ? H.getQuoteById?.(
                    editingId
                )
                : null;


        const text =
            getInputValue(
                "quoteText"
            );


        if (!text.trim()) {

            H.showToast?.(
                "Add the quote text before saving.",
                "error"
            );

            return;

        }


        const quote =
            H.normalizeQuote?.({

                ...existing,

                id:
                    existing?.id ||
                    undefined,

                bookId:
                    getInputValue(
                        "quoteBook"
                    ),

                book:
                    getInputValue(
                        "quoteBook"
                    ),

                text:

                    text.trim(),

                page:
                    getInputValue(
                        "quotePage"
                    ),

                chapter:
                    getInputValue(
                        "quoteChapter"
                    ),

                thoughts:
                    getInputValue(
                        "quoteThoughts"
                    ),

                createdAt:
                    existing?.createdAt,

                updatedAt:
                    H.nowISO?.()

            });


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


        Novellow.storage
            ?.saveQuotes?.();


        closeModal();

        render();

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
            state.quotes.filter(
                item =>
                    item.id !==
                    quoteId
            );


        Novellow.storage
            ?.saveQuotes?.();


        render();


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
            [
                ...(getState().books || [])
            ].sort(
                (a, b) =>
                    a.title.localeCompare(
                        b.title
                    )
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
                        : book.title;


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
       BODY LOCK
       ===================================================== */

    function syncBodyLock() {

        const anyOpen =
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
            anyOpen
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

        return (
            H.getById?.(
                id
            )?.value ??
            ""
        );

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

