/* =========================================================
   NOVELLOW
   VOCABULARY.JS

   Vocabulary collection
   Add word
   Edit word
   Delete word
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

        bindVocabularyControls();

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

    function bindVocabularyControls() {

        H.bindClick?.(
            "addWordButton",
            openAddModal
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


        const state =
            getState();


        const words =
            Array.isArray(
                state.vocabulary
            )
                ? state.vocabulary
                : [];


        const searchTerm =
            H.normalizeSearch?.(
                H.getById?.(
                    "wordSearch"
                )?.value ||
                ""
            ) || "";


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
                    compareWords
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
            H.normalizeSearch?.(
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
            ) || "";


        return haystack.includes(
            searchTerm
        );

    }


    /* =====================================================
       SORT
       ===================================================== */

    function compareWords(
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
       CREATE CARD
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


        const initial =
            String(
                word.word ||
                "?"
            )
                .trim()
                .charAt(0)
                .toUpperCase() ||
            "?";


        card.dataset.initial =
            initial;


        const book =
            H.getBookById?.(
                word.bookId ||
                word.book
            );


        card.innerHTML =
            `
                <div class="word-card-header">

                    <h3 class="word-card-word">
                        ${H.escapeHTML?.(
                            word.word
                        )}
                    </h3>

                    ${
                        word.partOfSpeech
                            ? `
                                <span class="word-card-part">
                                    ${H.escapeHTML?.(
                                        word.partOfSpeech
                                    )}
                                </span>
                            `
                            : ""
                    }

                </div>

                <div class="word-card-definition">
                    ${H.escapeHTML?.(
                        word.definition
                    )}
                </div>

                ${
                    word.context
                        ? `
                            <div class="word-card-context">
                                ${H.escapeHTML?.(
                                    word.context
                                )}
                            </div>
                        `
                        : ""
                }

                <div class="word-card-source">

                    <span class="word-card-book">
                        ${
                            H.escapeHTML?.(
                                book?.title ||
                                "Unlinked word"
                            )
                        }
                    </span>

                    ${
                        word.page
                            ? `
                                <div class="word-card-location">
                                    Page
                                    ${H.escapeHTML?.(
                                        String(
                                            word.page
                                        )
                                    )}
                                </div>
                            `
                            : ""
                    }

                    <div class="word-card-actions">

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
       OPEN ADD MODAL
       ===================================================== */

    function openAddModal() {

        resetForm();


        H.setText?.(
            "wordModalTitle",
            "Add Word"
        );


        setInputValue(
            "editingWordId",
            ""
        );


        openModal();

    }


    /* =====================================================
       OPEN EDIT MODAL
       ===================================================== */

    function openEditModal(
        wordId
    ) {

        const word =
            H.getWordById?.(
                wordId
            );


        if (!word) {
            return;
        }


        resetForm();


        H.setText?.(
            "wordModalTitle",
            "Edit Word"
        );


        setInputValue(
            "editingWordId",
            word.id
        );


        setInputValue(
            "wordText",
            word.word
        );


        setInputValue(
            "wordDefinition",
            word.definition
        );


        populateBookSelect(
            word.bookId ||
            word.book ||
            ""
        );


        setInputValue(
            "wordBook",
            word.bookId ||
            word.book ||
            ""
        );


        setInputValue(
            "wordPage",
            word.page
        );


        setInputValue(
            "wordPartOfSpeech",
            word.partOfSpeech
        );


        setInputValue(
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


        setInputValue(
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


        const editingId =
            getInputValue(
                "editingWordId"
            );


        const existing =
            editingId
                ? H.getWordById?.(
                    editingId
                )
                : null;


        const wordText =
            getInputValue(
                "wordText"
            ).trim();


        const definition =
            getInputValue(
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


        const word =
            H.normalizeWord?.({

                ...existing,

                id:
                    existing?.id ||
                    undefined,

                word:
                    wordText,

                definition,

                bookId:
                    getInputValue(
                        "wordBook"
                    ),

                book:
                    getInputValue(
                        "wordBook"
                    ),

                page:
                    getInputValue(
                        "wordPage"
                    ),

                partOfSpeech:
                    getInputValue(
                        "wordPartOfSpeech"
                    ),

                context:
                    getInputValue(
                        "wordContext"
                    ),

                createdAt:
                    existing?.createdAt,

                updatedAt:
                    H.nowISO?.()

            });


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


        Novellow.storage
            ?.saveVocabulary?.();


        closeModal();

        render();


        Novellow.stats
            ?.render?.();

    }


    /* =====================================================
       DELETE WORD
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
            state.vocabulary.filter(
                item =>
                    item.id !==
                    wordId
            );


        Novellow.storage
            ?.saveVocabulary?.();


        render();


        Novellow.stats
            ?.render?.();


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
