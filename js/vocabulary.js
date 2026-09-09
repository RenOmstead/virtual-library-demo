/* =========================================================
   NOVELLOW
   VOCABULARY.JS

   Global vocabulary collection
   Book-linked words
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


    function getWords() {

        return Array.isArray(
            getState().vocabulary
        )
            ? getState().vocabulary
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
            "addWordButton",
            () => {

                openAddModal();

            }
        );


        H.bindClick?.(
            "closeWordModal",
            closeModal
        );


        H.bindClick?.(
            "cancelWordButton",
            closeModal
        );


        const form =
            H.getById?.(
                "wordForm"
            );


        if (form) {

            form.addEventListener(
                "submit",
                handleSubmit
            );

        }


        const search =
            H.getById?.(
                "wordSearch"
            );


        if (search) {

            search.addEventListener(
                "input",
                render
            );

        }


        const modal =
            H.getById?.(
                "wordModal"
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
                "vocabularyGrid"
            );


        if (!grid) {
            return;
        }


        const empty =
            H.getById?.(
                "vocabularyEmptyState"
            );


        const words =
            getWords();


        const searchTerm =
            normalizeSearch(
                H.getById?.(
                    "wordSearch"
                )?.value ||
                ""
            );


        const filtered =
            words
                .filter(
                    word =>
                        wordMatchesSearch(
                            word,
                            searchTerm
                        )
                )
                .sort(
                    alphabetical
                );


        grid.innerHTML =
            "";


        if (
            words.length === 0
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
                "vocabulary-search-message";


            message.textContent =
                "No words match your search.";


            grid.appendChild(
                message
            );


            return;

        }


        filtered.forEach(
            word => {

                grid.appendChild(
                    createWordCard(
                        word
                    )
                );

            }
        );

    }


    /* =====================================================
       SEARCH
       ===================================================== */

    function wordMatchesSearch(
        word,
        searchTerm
    ) {

        if (!searchTerm) {
            return true;
        }


        const book =
            H.getBookById?.(
                word.bookId ||
                word.book
            );


        const haystack =
            normalizeSearch(
                [
                    word.word,
                    word.definition,
                    word.partOfSpeech,
                    word.context,
                    word.page,
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
       CREATE GLOBAL WORD CARD
       ===================================================== */

    function createWordCard(
        word
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "word-card";


        card.dataset.initial =
            String(
                word.word ||
                "?"
            )
                .trim()
                .charAt(0)
                .toUpperCase() ||
            "?";


        const book =
            H.getBookById?.(
                word.bookId ||
                word.book
            );


        card.innerHTML =
            `
                <div class="word-card-header">

                    <h3 class="word-card-word">
                        ${escape(
                            word.word
                        )}
                    </h3>

                    ${
                        word.partOfSpeech
                            ? `
                                <span class="word-card-part">
                                    ${escape(
                                        word.partOfSpeech
                                    )}
                                </span>
                            `
                            : ""
                    }

                </div>

                <div class="word-card-definition">
                    ${escape(
                        word.definition
                    )}
                </div>

                ${
                    word.context
                        ? `
                            <div class="word-card-context">
                                ${escape(
                                    word.context
                                )}
                            </div>
                        `
                        : ""
                }

                <div class="word-card-source">

                    <span class="word-card-book">
                        ${escape(
                            book?.title ||
                            "Unlinked word"
                        )}
                    </span>

                    ${
                        word.page
                            ? `
                                <div class="word-card-location">
                                    Page ${escape(
                                        String(
                                            word.page
                                        )
                                    )}
                                </div>
                            `
                            : ""
                    }

                    <div class="word-card-actions">

                        ${
                            book
                                ? `
                                    <button
                                        type="button"
                                        class="word-card-action"
                                        data-word-open-book="${word.id}"
                                    >
                                        Open Book
                                    </button>
                                `
                                : ""
                        }

                        <button
                            type="button"
                            class="word-card-action"
                            data-word-edit="${word.id}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="word-card-action danger"
                            data-word-delete="${word.id}"
                        >
                            Delete
                        </button>

                    </div>

                </div>
            `;


        if (book) {

            card.querySelector(
                `[data-word-open-book="${word.id}"]`
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
                                    "vocabulary"
                                );

                        }
                    );

                }
            );

        }


        card.querySelector(
            `[data-word-edit="${word.id}"]`
        )?.addEventListener(
            "click",
            () => {

                openEditModal(
                    word.id
                );

            }
        );


        card.querySelector(
            `[data-word-delete="${word.id}"]`
        )?.addEventListener(
            "click",
            () => {

                deleteWord(
                    word.id
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
            "wordModalTitle",
            "Add Word"
        );


        const preferredBookId =
            bookId ||
            getState().selectedBookId ||
            "";


        populateBookSelect(
            preferredBookId
        );


        setValue(
            "wordBook",
            preferredBookId
        );


        openModal();

    }


    /* =====================================================
       EDIT MODAL
       ===================================================== */

    function openEditModal(
        wordId
    ) {

        const word =
            H.getWordById?.(
                wordId
            );


        if (!word) {

            H.showToast?.(
                "That word could not be found.",
                "error"
            );

            return;

        }


        resetForm();


        H.setText?.(
            "wordModalTitle",
            "Edit Word"
        );


        setValue(
            "editingWordId",
            word.id
        );


        setValue(
            "wordText",
            word.word
        );


        setValue(
            "wordDefinition",
            word.definition
        );


        setValue(
            "wordPartOfSpeech",
            word.partOfSpeech
        );


        const bookId =
            word.bookId ||
            word.book ||
            "";


        populateBookSelect(
            bookId
        );


        setValue(
            "wordBook",
            bookId
        );


        setValue(
            "wordPage",
            word.page
        );


        setValue(
            "wordContext",
            word.context
        );


        openModal();

    }


    /* =====================================================
       OPEN MODAL
       ===================================================== */

    function openModal() {

        const modal =
            H.getById?.(
                "wordModal"
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
                    "wordText"
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
                "wordModal"
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
                "wordForm"
            );


        form?.reset();


        setValue(
            "editingWordId",
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
                state.vocabulary
            )
        ) {

            state.vocabulary =
                [];

        }


        const editingId =
            value(
                "editingWordId"
            );


        const existing =
            editingId
                ? H.getWordById?.(
                    editingId
                )
                : null;


        const wordText =
            value(
                "wordText"
            ).trim();


        const definition =
            value(
                "wordDefinition"
            ).trim();


        if (!wordText) {

            H.showToast?.(
                "Add the word before saving.",
                "error"
            );

            return;

        }


        if (!definition) {

            H.showToast?.(
                "Add a definition before saving.",
                "error"
            );

            return;

        }


        const bookId =
            value(
                "wordBook"
            );


        const now =
            H.nowISO?.() ||
            new Date()
                .toISOString();


        const word =
            H.normalizeWord?.({

                ...existing,

                id:
                    existing?.id ||
                    H.createId?.(
                        "word"
                    ),

                word:
                    wordText,

                definition,

                partOfSpeech:
                    value(
                        "wordPartOfSpeech"
                    ).trim(),

                bookId,

                book:
                    bookId,

                page:
                    value(
                        "wordPage"
                    ),

                context:
                    value(
                        "wordContext"
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
                        "word"
                    ) ||
                    `word-${Date.now()}`,

                word:
                    wordText,

                definition,

                partOfSpeech:
                    value(
                        "wordPartOfSpeech"
                    ).trim(),

                bookId,

                book:
                    bookId,

                page:
                    value(
                        "wordPage"
                    ),

                context:
                    value(
                        "wordContext"
                    ).trim(),

                createdAt:
                    existing?.createdAt ||
                    now,

                updatedAt:
                    now

            };


        if (existing) {

            const index =
                state.vocabulary.findIndex(
                    item =>
                        item.id ===
                        existing.id
                );


            if (
                index !== -1
            ) {

                state.vocabulary[
                    index
                ] =
                    word;

            }


            H.showToast?.(
                "Word updated.",
                "success"
            );

        } else {

            state.vocabulary.push(
                word
            );


            H.showToast?.(
                "Word added to your vocabulary.",
                "success"
            );

        }


        saveVocabulary();

        closeModal();

        refreshConnectedViews();

    }


    /* =====================================================
       DELETE
       ===================================================== */

    function deleteWord(
        wordId
    ) {

        const word =
            H.getWordById?.(
                wordId
            );


        if (!word) {
            return;
        }


        const confirmed =
            H.confirmAction?.(
                `Delete "${word.word}" from your vocabulary?`
            );


        if (!confirmed) {
            return;
        }


        const state =
            getState();


        state.vocabulary =
            getWords().filter(
                item =>
                    item.id !==
                    wordId
            );


        saveVocabulary();

        refreshConnectedViews();


        H.showToast?.(
            "Word deleted.",
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
                "wordBook"
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

    function saveVocabulary() {

        Novellow.storage
            ?.saveVocabulary?.();

    }


    /* =====================================================
       REFRESH CONNECTED VIEWS
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
       SORT
       ===================================================== */

    function alphabetical(
        a,
        b
    ) {

        return String(
            a.word ||
            ""
        ).localeCompare(
            String(
                b.word ||
                ""
            ),
            undefined,
            {
                sensitivity:
                    "base"
            }
        );

    }


    /* =====================================================
       SEARCH NORMALIZER
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

    Novellow.vocabulary = {

        init,

        render,

        openAddModal,

        openEditModal,

        closeModal,

        deleteWord,

        populateBookSelect

    };


})();
