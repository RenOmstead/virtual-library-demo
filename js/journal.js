/* =========================================================
   NOVELLOW
   JOURNAL.JS

   Book-based reading journals

   Journal gallery
   Open-book workspace
   Notes
   Quotes
   Vocabulary
   Thoughts
   Characters
   Themes
   Questions
   Review
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
       LOCAL STATE
       ===================================================== */

    let selectedBookId =
        null;


    let selectedSection =
        "overview";


    let editingEntryId =
        null;


    /* =====================================================
       SECTION CONFIG
       ===================================================== */

    const SECTION_CONFIG = {

        overview: {
            title:
                "Overview",

            eyebrow:
                "Reading Journal",

            emptyTitle:
                "",

            emptyText:
                ""
        },


        notes: {
            title:
                "Notes",

            eyebrow:
                "Margins & Notes",

            emptyTitle:
                "No notes yet.",

            emptyText:
                "Write down passages, observations, details, or anything you want to remember."
        },


        quotes: {
            title:
                "Quotes",

            eyebrow:
                "Marked Passages",

            emptyTitle:
                "No passages marked yet.",

            emptyText:
                "Save the sentences you want to carry out of this book."
        },


        vocabulary: {
            title:
                "Words",

            eyebrow:
                "Vocabulary",

            emptyTitle:
                "No words collected yet.",

            emptyText:
                "Keep unfamiliar, strange, beautiful, or useful words you meet while reading."
        },


        thoughts: {
            title:
                "Thoughts",

            eyebrow:
                "Reading Thoughts",

            emptyTitle:
                "Nothing written here yet.",

            emptyText:
                "Use this page for reactions, theories, connections, disagreements, or wandering thoughts."
        },


        characters: {
            title:
                "Characters",

            eyebrow:
                "People in the Book",

            emptyTitle:
                "No characters recorded yet.",

            emptyText:
                "Keep track of names, relationships, motives, and anything that helps you remember who is who."
        },


        themes: {
            title:
                "Themes",

            eyebrow:
                "Ideas & Patterns",

            emptyTitle:
                "No themes recorded yet.",

            emptyText:
                "Notice ideas, symbols, patterns, questions, or recurring tensions as they emerge."
        },


        questions: {
            title:
                "Questions",

            eyebrow:
                "Questions to Return To",

            emptyTitle:
                "No questions yet.",

            emptyText:
                "Save things you do not understand yet, questions for later, or ideas you want to investigate."
        },


        review: {
            title:
                "Review",

            eyebrow:
                "After the Last Page",

            emptyTitle:
                "No review yet.",

            emptyText:
                "When you are ready, write what you thought of the book and what you want to remember about it."
        }

    };


    /* =====================================================
       INIT
       ===================================================== */

    function init() {

        bindControls();

        render();

    }


    /* =====================================================
       STATE
       ===================================================== */

    function getState() {

        return Novellow.state || {};

    }


    function getBooks() {

        return Array.isArray(
            getState().books
        )
            ? getState().books
            : [];

    }


    function getQuotes() {

        return Array.isArray(
            getState().quotes
        )
            ? getState().quotes
            : [];

    }


    function getVocabulary() {

        return Array.isArray(
            getState().vocabulary
        )
            ? getState().vocabulary
            : [];

    }


    /* =====================================================
       BIND CONTROLS
       ===================================================== */

    function bindControls() {

        H.bindClick?.(
            "journalCloseBook",
            closeBook
        );


        H.bindClick?.(
            "journalEditBook",
            () => {

                if (!selectedBookId) {
                    return;
                }


                Novellow.books
                    ?.openEditDrawer?.(
                        selectedBookId
                    );

            }
        );


        H.bindClick?.(
            "addJournalEntry",
            handleAddForCurrentSection
        );


        H.bindClick?.(
            "closeJournalEntryModal",
            closeEntryModal
        );


        H.bindClick?.(
            "cancelJournalEntry",
            closeEntryModal
        );


        const entryForm =
            H.getById?.(
                "journalEntryForm"
            );


        if (entryForm) {

            entryForm.addEventListener(
                "submit",
                handleEntrySubmit
            );

        }


        const modal =
            H.getById?.(
                "journalEntryModal"
            );


        if (modal) {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeEntryModal();

                    }

                }
            );

        }


        H.queryAll?.(
            "[data-journal-section]"
        )?.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const section =
                            button.dataset
                                .journalSection;


                        setSection(
                            section
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       MAIN RENDER
       ===================================================== */

    function render() {

        renderJournalLibrary();

        populateLegacyBookSelect();


        if (
            selectedBookId &&
            H.getBookById?.(
                selectedBookId
            )
        ) {

            renderOpenBook();

        } else {

            selectedBookId =
                null;

            showJournalLibrary();

        }

    }


    /* =====================================================
       JOURNAL GALLERY
       ===================================================== */

    function renderJournalLibrary() {

        const container =
            H.getById?.(
                "journalLibrary"
            );


        const empty =
            H.getById?.(
                "journalEmptyState"
            );


        if (!container) {
            return;
        }


        const books =
            [...getBooks()]
                .sort(
                    (a, b) => {

                        return String(
                            a.title || ""
                        ).localeCompare(
                            String(
                                b.title || ""
                            )
                        );

                    }
                );


        container.innerHTML =
            "";


        if (
            books.length === 0
        ) {

            if (empty) {

                empty.hidden =
                    false;

            }


            container.hidden =
                true;


            return;

        }


        if (empty) {

            empty.hidden =
                true;

        }


        container.hidden =
            false;


        books.forEach(
            book => {

                container.appendChild(
                    createJournalBookCard(
                        book
                    )
                );

            }
        );

    }


    /* =====================================================
       JOURNAL BOOK CARD
       ===================================================== */

    function createJournalBookCard(
        book
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "journal-book-card";


        card.tabIndex =
            0;


        card.setAttribute(
            "role",
            "button"
        );


        card.setAttribute(
            "aria-label",
            `Open journal for ${book.title || "book"}`
        );


        const coverWrap =
            document.createElement(
                "div"
            );


        coverWrap.className =
            "journal-book-cover-wrap";


        const cover =
            document.createElement(
                "div"
            );


        cover.className =
            "journal-book-cover";


        const generatedCover =
            Novellow.books
                ?.createCoverElement?.(
                    book
                );


        if (generatedCover) {

            cover.appendChild(
                generatedCover
            );

        }


        coverWrap.appendChild(
            cover
        );


        const meta =
            document.createElement(
                "div"
            );


        meta.className =
            "journal-book-meta";


        const counts =
            getJournalCounts(
                book
            );


        meta.innerHTML =
            `
                <h3>
                    ${escape(
                        book.title ||
                        "Untitled Book"
                    )}
                </h3>

                <p>
                    ${escape(
                        book.author ||
                        "Unknown author"
                    )}
                </p>

                <div class="journal-book-counts">

                    <span class="journal-count-pill">
                        ${counts.notes}
                        ${counts.notes === 1 ? "note" : "notes"}
                    </span>

                    <span class="journal-count-pill">
                        ${counts.quotes}
                        ${counts.quotes === 1 ? "quote" : "quotes"}
                    </span>

                    <span class="journal-count-pill">
                        ${counts.words}
                        ${counts.words === 1 ? "word" : "words"}
                    </span>

                </div>
            `;


        card.appendChild(
            coverWrap
        );


        card.appendChild(
            meta
        );


        card.addEventListener(
            "click",
            () => {

                openBook(
                    book.id
                );

            }
        );


        card.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();


                    openBook(
                        book.id
                    );

                }

            }
        );


        return card;

    }


    /* =====================================================
       JOURNAL COUNTS
       ===================================================== */

    function getJournalCounts(
        book
    ) {

        const journal =
            ensureJournal(
                book
            );


        return {

            notes:
                journal.notes.length,

            quotes:
                getQuotesForBook(
                    book.id
                ).length,

            words:
                getWordsForBook(
                    book.id
                ).length

        };

    }


    /* =====================================================
       OPEN BOOK
       ===================================================== */

    function openBook(
        bookId,
        section =
            "overview"
    ) {

        const book =
            H.getBookById?.(
                bookId
            );


        if (!book) {

            H.showToast?.(
                "That book could not be found.",
                "error"
            );

            return;

        }


        selectedBookId =
            book.id;


        selectedSection =
            SECTION_CONFIG[
                section
            ]
                ? section
                : "overview";


        getState().selectedBookId =
            book.id;


        showWorkspace();

        renderOpenBook();


        requestAnimationFrame(
            () => {

                H.getById?.(
                    "journalWorkspace"
                )?.scrollIntoView?.({
                    behavior:
                        getState()
                            ?.settings
                            ?.reducedMotion
                            ? "auto"
                            : "smooth",

                    block:
                        "start"
                });

            }
        );

    }


    /* =====================================================
       SELECT BOOK

       Kept as a public compatibility method because Reading
       and the book reveal already use this.
       ===================================================== */

    function selectBook(
        bookId,
        section =
            "overview"
    ) {

        openBook(
            bookId,
            section
        );

    }


    /* =====================================================
       OPEN SELECTED JOURNAL
       ===================================================== */

    function openSelectedJournal(
        bookId,
        section =
            "overview"
    ) {

        if (bookId) {

            selectedBookId =
                bookId;

        }


        const targetId =
            bookId ||
            selectedBookId ||
            getState().selectedBookId;


        if (!targetId) {
            return;
        }


        Novellow.app
            ?.navigate?.(
                "journal"
            );


        openBook(
            targetId,
            section
        );

    }


    /* =====================================================
       CLOSE BOOK
       ===================================================== */

    function closeBook() {

        selectedBookId =
            null;


        selectedSection =
            "overview";


        getState().selectedBookId =
            null;


        showJournalLibrary();

        renderJournalLibrary();

    }


    /* =====================================================
       SHOW GALLERY
       ===================================================== */

    function showJournalLibrary() {

        const library =
            H.getById?.(
                "journalLibrary"
            );


        const workspace =
            H.getById?.(
                "journalWorkspace"
            );


        if (library) {

            library.hidden =
                false;

        }


        if (workspace) {

            workspace.hidden =
                true;

        }

    }


    /* =====================================================
       SHOW WORKSPACE
       ===================================================== */

    function showWorkspace() {

        const library =
            H.getById?.(
                "journalLibrary"
            );


        const empty =
            H.getById?.(
                "journalEmptyState"
            );


        const workspace =
            H.getById?.(
                "journalWorkspace"
            );


        if (library) {

            library.hidden =
                true;

        }


        if (empty) {

            empty.hidden =
                true;

        }


        if (workspace) {

            workspace.hidden =
                false;

        }

    }


    /* =====================================================
       RENDER OPEN BOOK
       ===================================================== */

    function renderOpenBook() {

        const book =
            H.getBookById?.(
                selectedBookId
            );


        if (!book) {

            closeBook();

            return;

        }


        ensureJournal(
            book
        );


        renderBookIdentity(
            book
        );


        updateBookmarkState();


        renderLeftPage(
            book
        );


        renderRightPage(
            book
        );


        updatePageNumbers();

    }


    /* =====================================================
       BOOK IDENTITY
       ===================================================== */

    function renderBookIdentity(
        book
    ) {

        H.setText?.(
            "journalBookTitle",
            book.title ||
            "Untitled Book"
        );


        H.setText?.(
            "journalBookAuthor",
            book.author ||
            "Unknown author"
        );


        H.setText?.(
            "journalBookStatus",
            H.getStatusName?.(
                book.status
            ) ||
            "Book"
        );


        H.setText?.(
            "journalBookStarted",
            H.formatDate?.(
                book.started
            ) ||
            "—"
        );


        H.setText?.(
            "journalBookFinished",
            H.formatDate?.(
                book.finished
            ) ||
            "—"
        );


        H.setText?.(
            "journalBookPages",
            book.pages
                ? String(
                    book.pages
                )
                : "—"
        );

    }


    /* =====================================================
       SECTION
       ===================================================== */

    function setSection(
        section
    ) {

        if (
            !SECTION_CONFIG[
                section
            ]
        ) {

            return;

        }


        selectedSection =
            section;


        getState().selectedJournalSection =
            section;


        renderOpenBook();

    }


    /* =====================================================
       BOOKMARK ACTIVE STATE
       ===================================================== */

    function updateBookmarkState() {

        H.queryAll?.(
            ".journal-bookmark[data-journal-section]"
        )?.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset
                        .journalSection ===
                        selectedSection
                );

            }
        );

    }


    /* =====================================================
       LEFT PAGE
       ===================================================== */

    function renderLeftPage(
        book
    ) {

        const eyebrow =
            H.getById?.(
                "journalLeftEyebrow"
            );


        const title =
            H.getById?.(
                "journalLeftTitle"
            );


        const content =
            H.getById?.(
                "journalLeftContent"
            );


        if (
            !eyebrow ||
            !title ||
            !content
        ) {

            return;

        }


        const section =
            SECTION_CONFIG[
                selectedSection
            ] ||
            SECTION_CONFIG.overview;


        eyebrow.textContent =
            selectedSection ===
            "overview"
                ? "Reading Journal"
                : book.title ||
                    "Reading Journal";


        title.textContent =
            selectedSection ===
            "overview"
                ? book.title ||
                    "Overview"
                : section.title;


        if (
            selectedSection ===
            "overview"
        ) {

            renderOverviewLeftPage(
                book,
                content
            );

            return;

        }


        renderContextLeftPage(
            book,
            content
        );

    }


    /* =====================================================
       OVERVIEW LEFT PAGE
       ===================================================== */

    function renderOverviewLeftPage(
        book,
        container
    ) {

        container.innerHTML =
            "";


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "journal-overview";


        const cover =
            document.createElement(
                "div"
            );


        cover.className =
            "journal-overview-cover";


        const coverElement =
            Novellow.books
                ?.createCoverElement?.(
                    book
                );


        if (coverElement) {

            cover.appendChild(
                coverElement
            );

        }


        const details =
            document.createElement(
                "div"
            );


        details.className =
            "journal-overview-details";


        details.innerHTML =
            `
                ${createOverviewDetail(
                    "Author",
                    book.author ||
                    "Unknown"
                )}

                ${createOverviewDetail(
                    "Status",
                    H.getStatusName?.(
                        book.status
                    ) ||
                    "—"
                )}

                ${createOverviewDetail(
                    "Started",
                    H.formatDate?.(
                        book.started
                    ) ||
                    "—"
                )}

                ${createOverviewDetail(
                    "Finished",
                    H.formatDate?.(
                        book.finished
                    ) ||
                    "—"
                )}

                ${createOverviewDetail(
                    "Pages",
                    book.pages ||
                    "—"
                )}

                ${createOverviewDetail(
                    "Rating",
                    formatRating(
                        book.rating
                    )
                )}
            `;


        wrapper.appendChild(
            cover
        );


        wrapper.appendChild(
            details
        );


        container.appendChild(
            wrapper
        );

    }


    /* =====================================================
       CONTEXT LEFT PAGE
       ===================================================== */

    function renderContextLeftPage(
        book,
        container
    ) {

        const counts =
            getAllSectionCounts(
                book
            );


        const progress =
            H.calculatePercent?.(
                book.currentPage,
                book.pages
            ) || 0;


        container.innerHTML =
            `
                <div class="journal-section-intro">
                    ${escape(
                        getSectionIntro(
                            selectedSection
                        )
                    )}
                </div>

                <div class="journal-overview-details">

                    ${createOverviewDetail(
                        "Progress",
                        `${progress}%`
                    )}

                    ${createOverviewDetail(
                        "Current Page",
                        book.currentPage ||
                        "—"
                    )}

                    ${createOverviewDetail(
                        "Notes",
                        counts.notes
                    )}

                    ${createOverviewDetail(
                        "Quotes",
                        counts.quotes
                    )}

                    ${createOverviewDetail(
                        "Words",
                        counts.words
                    )}

                    ${createOverviewDetail(
                        "Questions",
                        counts.questions
                    )}

                </div>
            `;

    }


    /* =====================================================
       RIGHT PAGE
       ===================================================== */

    function renderRightPage(
        book
    ) {

        const config =
            SECTION_CONFIG[
                selectedSection
            ] ||
            SECTION_CONFIG.overview;


        H.setText?.(
            "journalSectionEyebrow",
            selectedSection ===
            "overview"
                ? book.author ||
                    "Reading Journal"
                : config.eyebrow
        );


        H.setText?.(
            "journalSectionTitle",
            selectedSection ===
            "overview"
                ? "Inside This Book"
                : config.title
        );


        const addButton =
            H.getById?.(
                "addJournalEntry"
            );


        if (addButton) {

            addButton.hidden =
                selectedSection ===
                "overview";


            if (
                selectedSection ===
                "quotes"
            ) {

                addButton.textContent =
                    "+ Mark Quote";

            } else if (
                selectedSection ===
                "vocabulary"
            ) {

                addButton.textContent =
                    "+ Add Word";

            } else if (
                selectedSection ===
                "review"
            ) {

                addButton.textContent =
                    "+ Write Review";

            } else {

                addButton.textContent =
                    "+ Write";

            }

        }


        switch (
            selectedSection
        ) {

            case "overview":

                renderOverviewRightPage(
                    book
                );

                break;


            case "quotes":

                renderQuotePage(
                    book
                );

                break;


            case "vocabulary":

                renderVocabularyPage(
                    book
                );

                break;


            default:

                renderJournalEntryPage(
                    book,
                    selectedSection
                );

                break;

        }

    }


    /* =====================================================
       OVERVIEW RIGHT PAGE
       ===================================================== */

    function renderOverviewRightPage(
        book
    ) {

        const container =
            H.getById?.(
                "journalEntries"
            );


        if (!container) {
            return;
        }


        const counts =
            getAllSectionCounts(
                book
            );


        const totalJournalEntries =
            counts.notes +
            counts.thoughts +
            counts.characters +
            counts.themes +
            counts.questions +
            counts.reviews;


        const status =
            H.getStatusName?.(
                book.status
            ) ||
            "Book";


        container.innerHTML =
            `
                <div class="journal-section-intro">
                    This journal belongs to
                    <strong>
                        ${escape(
                            book.title ||
                            "this book"
                        )}
                    </strong>.
                    Use the bookmarks above to move between
                    everything you collect while reading.
                </div>

                <div class="journal-overview-details">

                    ${createOverviewDetail(
                        "Journal Entries",
                        totalJournalEntries
                    )}

                    ${createOverviewDetail(
                        "Quotes",
                        counts.quotes
                    )}

                    ${createOverviewDetail(
                        "Vocabulary",
                        counts.words
                    )}

                    ${createOverviewDetail(
                        "Questions",
                        counts.questions
                    )}

                    ${createOverviewDetail(
                        "Status",
                        status
                    )}

                    ${createOverviewDetail(
                        "Times Read",
                        Number(
                            book.timesRead
                        ) || 0
                    )}

                </div>

                <div
                    class="journal-section-intro"
                    style="margin-top: 24px;"
                >
                    A reading journal does not need to be complete.
                    Keep only the pieces that help you understand,
                    remember, question, or enjoy the book.
                </div>
            `;

    }


    /* =====================================================
       STANDARD JOURNAL ENTRY PAGE
       ===================================================== */

    function renderJournalEntryPage(
        book,
        section
    ) {

        const container =
            H.getById?.(
                "journalEntries"
            );


        if (!container) {
            return;
        }


        const journal =
            ensureJournal(
                book
            );


        const entries =
            Array.isArray(
                journal[
                    section
                ]
            )
                ? journal[
                    section
                ]
                : [];


        container.innerHTML =
            "";


        if (
            entries.length === 0
        ) {

            renderSectionEmpty(
                container,
                section
            );

            return;

        }


        const list =
            document.createElement(
                "div"
            );


        list.className =
            "journal-entry-list";


        [...entries]
            .sort(
                newestFirst
            )
            .forEach(
                entry => {

                    list.appendChild(
                        createEntryElement(
                            section,
                            entry
                        )
                    );

                }
            );


        container.appendChild(
            list
        );

    }


    /* =====================================================
       CREATE STANDARD ENTRY
       ===================================================== */

    function createEntryElement(
        section,
        entry
    ) {

        switch (
            section
        ) {

            case "characters":

                return createCharacterEntry(
                    entry
                );


            case "themes":

                return createThemeEntry(
                    entry
                );


            case "questions":

                return createQuestionEntry(
                    entry
                );


            case "review":

                return createReviewEntry(
                    entry
                );


            default:

                return createStandardEntry(
                    section,
                    entry
                );

        }

    }


    /* =====================================================
       STANDARD NOTE / THOUGHT ENTRY
       ===================================================== */

    function createStandardEntry(
        section,
        entry
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "journal-entry-card";


        const title =
            entry.title ||
            (
                section ===
                "notes"
                    ? "Reading Note"
                    : "Thought"
            );


        const meta =
            buildEntryMeta(
                entry
            );


        card.innerHTML =
            `
                <h3>
                    ${escape(
                        title
                    )}
                </h3>

                ${
                    meta
                        ? `
                            <div class="journal-entry-meta">
                                ${meta}
                            </div>
                        `
                        : ""
                }

                <div class="journal-entry-body">
                    ${escape(
                        entry.body ||
                        entry.text ||
                        entry.notes ||
                        ""
                    )}
                </div>

                ${createEntryActionsHTML(
                    entry.id
                )}
            `;


        bindEntryActions(
            card,
            section,
            entry.id
        );


        return card;

    }


    /* =====================================================
       CHARACTER ENTRY
       ===================================================== */

    function createCharacterEntry(
        entry
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "journal-character-entry";


        const name =
            entry.name ||
            entry.title ||
            "Unnamed Character";


        const initial =
            name
                .trim()
                .charAt(0)
                .toUpperCase() ||
            "?";


        card.innerHTML =
            `
                <div class="journal-character-initial">
                    ${escape(
                        initial
                    )}
                </div>

                <div>

                    <h3>
                        ${escape(
                            name
                        )}
                    </h3>

                    ${
                        entry.role
                            ? `
                                <div class="journal-entry-meta">
                                    <span>
                                        ${escape(
                                            entry.role
                                        )}
                                    </span>
                                </div>
                            `
                            : ""
                    }

                    <div class="journal-entry-body">
                        ${escape(
                            entry.body ||
                            entry.notes ||
                            ""
                        )}
                    </div>

                    ${createEntryActionsHTML(
                        entry.id
                    )}

                </div>
            `;


        bindEntryActions(
            card,
            "characters",
            entry.id
        );


        return card;

    }


    /* =====================================================
       THEME ENTRY
       ===================================================== */

    function createThemeEntry(
        entry
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "journal-entry-card";


        card.innerHTML =
            `
                <span class="journal-theme-entry">
                    ${escape(
                        entry.name ||
                        entry.title ||
                        "Theme"
                    )}
                </span>

                ${
                    entry.body ||
                    entry.notes
                        ? `
                            <div class="journal-entry-body">
                                ${escape(
                                    entry.body ||
                                    entry.notes
                                )}
                            </div>
                        `
                        : ""
                }

                ${createEntryActionsHTML(
                    entry.id
                )}
            `;


        bindEntryActions(
            card,
            "themes",
            entry.id
        );


        return card;

    }


    /* =====================================================
       QUESTION ENTRY
       ===================================================== */

    function createQuestionEntry(
        entry
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "journal-question-entry";


        const meta =
            buildEntryMeta(
                entry
            );


        card.innerHTML =
            `
                <h3>
                    ${escape(
                        entry.question ||
                        entry.title ||
                        "Question"
                    )}
                </h3>

                ${
                    meta
                        ? `
                            <div class="journal-entry-meta">
                                ${meta}
                            </div>
                        `
                        : ""
                }

                ${
                    entry.answer ||
                    entry.body
                        ? `
                            <div class="journal-entry-body">
                                ${escape(
                                    entry.answer ||
                                    entry.body
                                )}
                            </div>
                        `
                        : ""
                }

                ${createEntryActionsHTML(
                    entry.id
                )}
            `;


        bindEntryActions(
            card,
            "questions",
            entry.id
        );


        return card;

    }


    /* =====================================================
       REVIEW ENTRY
       ===================================================== */

    function createReviewEntry(
        entry
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "journal-entry-card";


        const rating =
            Number(
                entry.rating
            ) || 0;


        card.innerHTML =
            `
                ${
                    rating
                        ? `
                            <div class="journal-review-rating">
                                ${"★".repeat(
                                    rating
                                )}
                                ${"☆".repeat(
                                    Math.max(
                                        0,
                                        5 - rating
                                    )
                                )}
                            </div>
                        `
                        : ""
                }

                ${
                    entry.title
                        ? `
                            <h3>
                                ${escape(
                                    entry.title
                                )}
                            </h3>
                        `
                        : ""
                }

                <div class="journal-review-body">
                    ${escape(
                        entry.body ||
                        entry.review ||
                        ""
                    )}
                </div>

                ${createEntryActionsHTML(
                    entry.id
                )}
            `;


        bindEntryActions(
            card,
            "review",
            entry.id
        );


        return card;

    }


    /* =====================================================
       QUOTES PAGE
       ===================================================== */

    function renderQuotePage(
        book
    ) {

        const container =
            H.getById?.(
                "journalEntries"
            );


        if (!container) {
            return;
        }


        const quotes =
            getQuotesForBook(
                book.id
            );


        container.innerHTML =
            "";


        if (
            quotes.length === 0
        ) {

            renderSectionEmpty(
                container,
                "quotes"
            );

            return;

        }


        quotes
            .sort(
                newestFirst
            )
            .forEach(
                quote => {

                    const element =
                        document.createElement(
                            "article"
                        );


                    element.className =
                        "journal-quote-entry";


                    const location =
                        buildQuoteLocation(
                            quote
                        );


                    element.innerHTML =
                        `
                            <div class="journal-quote-text">
                                ${escape(
                                    quote.text ||
                                    ""
                                )}
                            </div>

                            ${
                                location
                                    ? `
                                        <div class="journal-quote-location">
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
                                        <div
                                            class="journal-entry-body"
                                            style="margin-top: 10px;"
                                        >
                                            ${escape(
                                                quote.thoughts
                                            )}
                                        </div>
                                    `
                                    : ""
                            }

                            <div class="journal-entry-actions">

                                <button
                                    type="button"
                                    class="journal-entry-action"
                                    data-quote-edit="${quote.id}"
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    class="journal-entry-action"
                                    data-quote-delete="${quote.id}"
                                >
                                    Delete
                                </button>

                            </div>
                        `;


                    element
                        .querySelector(
                            `[data-quote-edit="${quote.id}"]`
                        )
                        ?.addEventListener(
                            "click",
                            () => {

                                Novellow.quotes
                                    ?.openEditModal?.(
                                        quote.id
                                    );

                            }
                        );


                    element
                        .querySelector(
                            `[data-quote-delete="${quote.id}"]`
                        )
                        ?.addEventListener(
                            "click",
                            () => {

                                Novellow.quotes
                                    ?.deleteQuote?.(
                                        quote.id
                                    );


                                setTimeout(
                                    renderOpenBook,
                                    0
                                );

                            }
                        );


                    container.appendChild(
                        element
                    );

                }
            );

    }


    /* =====================================================
       VOCABULARY PAGE
       ===================================================== */

    function renderVocabularyPage(
        book
    ) {

        const container =
            H.getById?.(
                "journalEntries"
            );


        if (!container) {
            return;
        }


        const words =
            getWordsForBook(
                book.id
            );


        container.innerHTML =
            "";


        if (
            words.length === 0
        ) {

            renderSectionEmpty(
                container,
                "vocabulary"
            );

            return;

        }


        words
            .sort(
                (
                    a,
                    b
                ) => {

                    return String(
                        a.word ||
                        ""
                    ).localeCompare(
                        String(
                            b.word ||
                            ""
                        )
                    );

                }
            )
            .forEach(
                word => {

                    const element =
                        document.createElement(
                            "article"
                        );


                    element.className =
                        "journal-word-entry";


                    element.innerHTML =
                        `
                            <strong>
                                ${escape(
                                    word.word ||
                                    ""
                                )}
                            </strong>

                            ${
                                word.partOfSpeech
                                    ? `
                                        <em>
                                            ${escape(
                                                word.partOfSpeech
                                            )}
                                        </em>
                                    `
                                    : ""
                            }

                            <p>
                                ${escape(
                                    word.definition ||
                                    ""
                                )}
                            </p>

                            ${
                                word.context
                                    ? `
                                        <div
                                            class="journal-entry-body"
                                            style="margin-top: 8px;"
                                        >
                                            ${escape(
                                                word.context
                                            )}
                                        </div>
                                    `
                                    : ""
                            }

                            ${
                                word.page
                                    ? `
                                        <div
                                            class="journal-entry-meta"
                                            style="margin-top: 7px;"
                                        >
                                            Page
                                            ${escape(
                                                String(
                                                    word.page
                                                )
                                            )}
                                        </div>
                                    `
                                    : ""
                            }

                            <div class="journal-entry-actions">

                                <button
                                    type="button"
                                    class="journal-entry-action"
                                    data-word-edit="${word.id}"
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    class="journal-entry-action"
                                    data-word-delete="${word.id}"
                                >
                                    Delete
                                </button>

                            </div>
                        `;


                    element
                        .querySelector(
                            `[data-word-edit="${word.id}"]`
                        )
                        ?.addEventListener(
                            "click",
                            () => {

                                Novellow.vocabulary
                                    ?.openEditModal?.(
                                        word.id
                                    );

                            }
                        );


                    element
                        .querySelector(
                            `[data-word-delete="${word.id}"]`
                        )
                        ?.addEventListener(
                            "click",
                            () => {

                                Novellow.vocabulary
                                    ?.deleteWord?.(
                                        word.id
                                    );


                                setTimeout(
                                    renderOpenBook,
                                    0
                                );

                            }
                        );


                    container.appendChild(
                        element
                    );

                }
            );

    }


    /* =====================================================
       SECTION EMPTY
       ===================================================== */

    function renderSectionEmpty(
        container,
        section
    ) {

        const config =
            SECTION_CONFIG[
                section
            ];


        container.innerHTML =
            `
                <div class="journal-section-empty">

                    <strong>
                        ${escape(
                            config?.emptyTitle ||
                            "Nothing here yet."
                        )}
                    </strong>

                    <p>
                        ${escape(
                            config?.emptyText ||
                            ""
                        )}
                    </p>

                </div>
            `;

    }


    /* =====================================================
       ADD FOR CURRENT SECTION
       ===================================================== */

    function handleAddForCurrentSection() {

        if (!selectedBookId) {
            return;
        }


        if (
            selectedSection ===
            "overview"
        ) {

            return;

        }


        if (
            selectedSection ===
            "quotes"
        ) {

            Novellow.quotes
                ?.openAddModal?.();


            requestAnimationFrame(
                () => {

                    const select =
                        H.getById?.(
                            "quoteBook"
                        );


                    if (select) {

                        select.value =
                            selectedBookId;

                    }

                }
            );


            return;

        }


        if (
            selectedSection ===
            "vocabulary"
        ) {

            Novellow.vocabulary
                ?.openAddModal?.();


            requestAnimationFrame(
                () => {

                    const select =
                        H.getById?.(
                            "wordBook"
                        );


                    if (select) {

                        select.value =
                            selectedBookId;

                    }

                }
            );


            return;

        }


        openEntryModal(
            selectedSection
        );

    }


    /* =====================================================
       OPEN ENTRY MODAL
       ===================================================== */

    function openEntryModal(
        section,
        entryId =
            null
    ) {

        if (
            !selectedBookId ||
            !SECTION_CONFIG[
                section
            ]
        ) {

            return;

        }


        editingEntryId =
            entryId;


        const book =
            H.getBookById?.(
                selectedBookId
            );


        if (!book) {
            return;
        }


        const journal =
            ensureJournal(
                book
            );


        const entry =
            entryId
                ? journal[
                    section
                ]?.find(
                    item =>
                        item.id ===
                        entryId
                )
                : null;


        H.setText?.(
            "journalEntryModalTitle",
            entry
                ? `Edit ${getEntryLabel(section)}`
                : `Add ${getEntryLabel(section)}`
        );


        const sectionInput =
            H.getById?.(
                "journalEntrySection"
            );


        if (sectionInput) {

            sectionInput.value =
                section;

        }


        const fields =
            H.getById?.(
                "journalEntryFields"
            );


        if (!fields) {
            return;
        }


        fields.innerHTML =
            getEntryFieldMarkup(
                section,
                entry
            );


        const modal =
            H.getById?.(
                "journalEntryModal"
            );


        if (modal) {

            modal.hidden =
                false;

        }


        document.body.classList.add(
            "modal-open"
        );


        requestAnimationFrame(
            () => {

                fields
                    .querySelector(
                        "input:not([type='hidden']), textarea, select"
                    )
                    ?.focus();

            }
        );

    }


    /* =====================================================
       ENTRY FIELD MARKUP
       ===================================================== */

    function getEntryFieldMarkup(
        section,
        entry =
            null
    ) {

        const value =
            (
                key,
                fallback =
                    ""
            ) => {

                return escapeAttribute(
                    entry?.[
                        key
                    ] ??
                    fallback
                );

            };


        switch (
            section
        ) {

            case "notes":

                return `
                    <label class="field">

                        <span>
                            Note title
                        </span>

                        <input
                            id="journalFieldTitle"
                            type="text"
                            value="${value("title")}"
                            placeholder="Optional title"
                        >

                    </label>

                    <div class="form-grid">

                        <label class="field">

                            <span>
                                Page
                            </span>

                            <input
                                id="journalFieldPage"
                                type="number"
                                min="0"
                                value="${value("page")}"
                            >

                        </label>

                        <label class="field">

                            <span>
                                Chapter
                            </span>

                            <input
                                id="journalFieldChapter"
                                type="text"
                                value="${value("chapter")}"
                            >

                        </label>

                    </div>

                    <label class="field">

                        <span>
                            Note
                        </span>

                        <textarea
                            id="journalFieldBody"
                            required
                            placeholder="What do you want to remember?"
                        >${escapeTextarea(
                            entry?.body ||
                            entry?.text ||
                            ""
                        )}</textarea>

                    </label>
                `;


            case "thoughts":

                return `
                    <label class="field">

                        <span>
                            Thought
                        </span>

                        <input
                            id="journalFieldTitle"
                            type="text"
                            value="${value("title")}"
                            placeholder="Optional heading"
                        >

                    </label>

                    <label class="field">

                        <span>
                            Write
                        </span>

                        <textarea
                            id="journalFieldBody"
                            required
                            placeholder="What are you thinking about?"
                        >${escapeTextarea(
                            entry?.body ||
                            entry?.text ||
                            ""
                        )}</textarea>

                    </label>
                `;


            case "characters":

                return `
                    <label class="field">

                        <span>
                            Character name
                        </span>

                        <input
                            id="journalFieldName"
                            type="text"
                            required
                            value="${value(
                                "name",
                                entry?.title ||
                                ""
                            )}"
                        >

                    </label>

                    <label class="field">

                        <span>
                            Role / relationship
                        </span>

                        <input
                            id="journalFieldRole"
                            type="text"
                            value="${value("role")}"
                            placeholder="Brother, narrator, antagonist..."
                        >

                    </label>

                    <label class="field">

                        <span>
                            Notes
                        </span>

                        <textarea
                            id="journalFieldBody"
                            placeholder="Who are they? What matters about them?"
                        >${escapeTextarea(
                            entry?.body ||
                            entry?.notes ||
                            ""
                        )}</textarea>

                    </label>
                `;


            case "themes":

                return `
                    <label class="field">

                        <span>
                            Theme / idea
                        </span>

                        <input
                            id="journalFieldName"
                            type="text"
                            required
                            value="${value(
                                "name",
                                entry?.title ||
                                ""
                            )}"
                            placeholder="Faith, guilt, identity..."
                        >

                    </label>

                    <label class="field">

                        <span>
                            Notes
                        </span>

                        <textarea
                            id="journalFieldBody"
                            placeholder="Where are you seeing this idea?"
                        >${escapeTextarea(
                            entry?.body ||
                            entry?.notes ||
                            ""
                        )}</textarea>

                    </label>
                `;


            case "questions":

                return `
                    <label class="field">

                        <span>
                            Question
                        </span>

                        <textarea
                            id="journalFieldQuestion"
                            required
                            placeholder="What are you wondering?"
                        >${escapeTextarea(
                            entry?.question ||
                            entry?.title ||
                            ""
                        )}</textarea>

                    </label>

                    <label class="field">

                        <span>
                            Page
                        </span>

                        <input
                            id="journalFieldPage"
                            type="number"
                            min="0"
                            value="${value("page")}"
                        >

                    </label>

                    <label class="field">

                        <span>
                            Answer / thoughts
                        </span>

                        <textarea
                            id="journalFieldAnswer"
                            placeholder="Leave this blank if you do not know yet."
                        >${escapeTextarea(
                            entry?.answer ||
                            entry?.body ||
                            ""
                        )}</textarea>

                    </label>
                `;


            case "review":

                return `
                    <label class="field">

                        <span>
                            Rating
                        </span>

                        <select id="journalFieldRating">

                            ${createRatingOptions(
                                Number(
                                    entry?.rating
                                ) || 0
                            )}

                        </select>

                    </label>

                    <label class="field">

                        <span>
                            Review title
                        </span>

                        <input
                            id="journalFieldTitle"
                            type="text"
                            value="${value("title")}"
                            placeholder="Optional"
                        >

                    </label>

                    <label class="field">

                        <span>
                            Review
                        </span>

                        <textarea
                            id="journalFieldBody"
                            required
                            placeholder="What did you think? What will stay with you?"
                        >${escapeTextarea(
                            entry?.body ||
                            entry?.review ||
                            ""
                        )}</textarea>

                    </label>
                `;


            default:

                return `
                    <label class="field">

                        <span>
                            Entry
                        </span>

                        <textarea
                            id="journalFieldBody"
                            required
                        >${escapeTextarea(
                            entry?.body ||
                            ""
                        )}</textarea>

                    </label>
                `;

        }

    }


    /* =====================================================
       SUBMIT JOURNAL ENTRY
       ===================================================== */

    function handleEntrySubmit(
        event
    ) {

        event.preventDefault();


        const book =
            H.getBookById?.(
                selectedBookId
            );


        if (!book) {
            return;
        }


        const section =
            H.getById?.(
                "journalEntrySection"
            )?.value ||
            selectedSection;


        if (
            !SECTION_CONFIG[
                section
            ] ||
            section ===
                "overview" ||
            section ===
                "quotes" ||
            section ===
                "vocabulary"
        ) {

            return;

        }


        const journal =
            ensureJournal(
                book
            );


        if (
            !Array.isArray(
                journal[
                    section
                ]
            )
        ) {

            journal[
                section
            ] =
                [];

        }


        const existing =
            editingEntryId
                ? journal[
                    section
                ].find(
                    entry =>
                        entry.id ===
                        editingEntryId
                )
                : null;


        const entry =
            buildEntryFromFields(
                section,
                existing
            );


        if (!entry) {
            return;
        }


        if (existing) {

            const index =
                journal[
                    section
                ].findIndex(
                    item =>
                        item.id ===
                        existing.id
                );


            if (
                index !== -1
            ) {

                journal[
                    section
                ][
                    index
                ] =
                    entry;

            }


            H.showToast?.(
                "Journal entry updated.",
                "success"
            );

        } else {

            journal[
                section
            ].push(
                entry
            );


            H.showToast?.(
                "Added to your journal.",
                "success"
            );

        }


        book.journal =
            journal;


        book.updatedAt =
            H.nowISO?.() ||
            new Date()
                .toISOString();


        saveBooks();


        closeEntryModal();

        renderOpenBook();

        renderJournalLibrary();

    }


    /* =====================================================
       BUILD ENTRY
       ===================================================== */

    function buildEntryFromFields(
        section,
        existing
    ) {

        const base = {

            ...existing,

            id:
                existing?.id ||
                H.createId?.(
                    "journal"
                ) ||
                `journal-${Date.now()}`,

            createdAt:
                existing?.createdAt ||
                H.nowISO?.() ||
                new Date()
                    .toISOString(),

            updatedAt:
                H.nowISO?.() ||
                new Date()
                    .toISOString()

        };


        switch (
            section
        ) {

            case "notes": {

                const body =
                    inputValue(
                        "journalFieldBody"
                    ).trim();


                if (!body) {

                    H.showToast?.(
                        "Write something before saving.",
                        "error"
                    );

                    return null;

                }


                return {
                    ...base,

                    title:
                        inputValue(
                            "journalFieldTitle"
                        ).trim(),

                    page:
                        inputValue(
                            "journalFieldPage"
                        ),

                    chapter:
                        inputValue(
                            "journalFieldChapter"
                        ).trim(),

                    body
                };

            }


            case "thoughts": {

                const body =
                    inputValue(
                        "journalFieldBody"
                    ).trim();


                if (!body) {

                    H.showToast?.(
                        "Write something before saving.",
                        "error"
                    );

                    return null;

                }


                return {
                    ...base,

                    title:
                        inputValue(
                            "journalFieldTitle"
                        ).trim(),

                    body
                };

            }


            case "characters": {

                const name =
                    inputValue(
                        "journalFieldName"
                    ).trim();


                if (!name) {

                    H.showToast?.(
                        "Add the character's name.",
                        "error"
                    );

                    return null;

                }


                return {
                    ...base,

                    name,

                    role:
                        inputValue(
                            "journalFieldRole"
                        ).trim(),

                    body:
                        inputValue(
                            "journalFieldBody"
                        ).trim()
                };

            }


            case "themes": {

                const name =
                    inputValue(
                        "journalFieldName"
                    ).trim();


                if (!name) {

                    H.showToast?.(
                        "Name the theme or idea.",
                        "error"
                    );

                    return null;

                }


                return {
                    ...base,

                    name,

                    body:
                        inputValue(
                            "journalFieldBody"
                        ).trim()
                };

            }


            case "questions": {

                const question =
                    inputValue(
                        "journalFieldQuestion"
                    ).trim();


                if (!question) {

                    H.showToast?.(
                        "Write the question before saving.",
                        "error"
                    );

                    return null;

                }


                return {
                    ...base,

                    question,

                    page:
                        inputValue(
                            "journalFieldPage"
                        ),

                    answer:
                        inputValue(
                            "journalFieldAnswer"
                        ).trim()
                };

            }


            case "review": {

                const body =
                    inputValue(
                        "journalFieldBody"
                    ).trim();


                if (!body) {

                    H.showToast?.(
                        "Write your review before saving.",
                        "error"
                    );

                    return null;

                }


                return {
                    ...base,

                    rating:
                        Number(
                            inputValue(
                                "journalFieldRating"
                            )
                        ) ||
                        0,

                    title:
                        inputValue(
                            "journalFieldTitle"
                        ).trim(),

                    body
                };

            }


            default:

                return null;

        }

    }


    /* =====================================================
       EDIT ENTRY
       ===================================================== */

    function editEntry(
        section,
        entryId
    ) {

        openEntryModal(
            section,
            entryId
        );

    }


    /* =====================================================
       DELETE ENTRY
       ===================================================== */

    function deleteEntry(
        section,
        entryId
    ) {

        const book =
            H.getBookById?.(
                selectedBookId
            );


        if (!book) {
            return;
        }


        const confirmed =
            H.confirmAction?.(
                "Delete this journal entry?"
            );


        if (!confirmed) {
            return;
        }


        const journal =
            ensureJournal(
                book
            );


        journal[
            section
        ] =
            (
                journal[
                    section
                ] ||
                []
            ).filter(
                entry =>
                    entry.id !==
                    entryId
            );


        book.journal =
            journal;


        saveBooks();

        renderOpenBook();

        renderJournalLibrary();


        H.showToast?.(
            "Journal entry deleted.",
            "success"
        );

    }


    /* =====================================================
       ENTRY ACTION HTML
       ===================================================== */

    function createEntryActionsHTML(
        entryId
    ) {

        return `
            <div class="journal-entry-actions">

                <button
                    type="button"
                    class="journal-entry-action"
                    data-journal-edit="${escapeAttribute(
                        entryId
                    )}"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="journal-entry-action"
                    data-journal-delete="${escapeAttribute(
                        entryId
                    )}"
                >
                    Delete
                </button>

            </div>
        `;

    }


    /* =====================================================
       BIND ENTRY ACTIONS
       ===================================================== */

    function bindEntryActions(
        element,
        section,
        entryId
    ) {

        element
            .querySelector(
                `[data-journal-edit="${entryId}"]`
            )
            ?.addEventListener(
                "click",
                () => {

                    editEntry(
                        section,
                        entryId
                    );

                }
            );


        element
            .querySelector(
                `[data-journal-delete="${entryId}"]`
            )
            ?.addEventListener(
                "click",
                () => {

                    deleteEntry(
                        section,
                        entryId
                    );

                }
            );

    }


    /* =====================================================
       CLOSE ENTRY MODAL
       ===================================================== */

    function closeEntryModal() {

        const modal =
            H.getById?.(
                "journalEntryModal"
            );


        if (modal) {

            modal.hidden =
                true;

        }


        editingEntryId =
            null;


        const form =
            H.getById?.(
                "journalEntryForm"
            );


        form?.reset();


        syncBodyLock();

    }


    /* =====================================================
       JOURNAL NORMALIZATION
       ===================================================== */

    function ensureJournal(
        book
    ) {

        const normalized =
            H.normalizeJournal?.(
                book.journal
            );


        if (normalized) {

            book.journal =
                normalized;

        } else {

            book.journal =
                book.journal ||
                {};

        }


        const journal =
            book.journal;


        [
            "notes",
            "thoughts",
            "characters",
            "themes",
            "questions",
            "review"
        ].forEach(
            section => {

                if (
                    !Array.isArray(
                        journal[
                            section
                        ]
                    )
                ) {

                    journal[
                        section
                    ] =
                        [];

                }

            }
        );


        return journal;

    }


    /* =====================================================
       QUOTES FOR BOOK
       ===================================================== */

    function getQuotesForBook(
        bookId
    ) {

        return getQuotes().filter(
            quote => {

                return (
                    quote.bookId ===
                        bookId ||
                    quote.book ===
                        bookId
                );

            }
        );

    }


    /* =====================================================
       WORDS FOR BOOK
       ===================================================== */

    function getWordsForBook(
        bookId
    ) {

        return getVocabulary().filter(
            word => {

                return (
                    word.bookId ===
                        bookId ||
                    word.book ===
                        bookId
                );

            }
        );

    }


    /* =====================================================
       ALL SECTION COUNTS
       ===================================================== */

    function getAllSectionCounts(
        book
    ) {

        const journal =
            ensureJournal(
                book
            );


        return {

            notes:
                journal.notes.length,

            thoughts:
                journal.thoughts.length,

            characters:
                journal.characters.length,

            themes:
                journal.themes.length,

            questions:
                journal.questions.length,

            reviews:
                journal.review.length,

            quotes:
                getQuotesForBook(
                    book.id
                ).length,

            words:
                getWordsForBook(
                    book.id
                ).length

        };

    }


    /* =====================================================
       SAVE
       ===================================================== */

    function saveBooks() {

        Novellow.storage
            ?.saveBooks?.();


        Novellow.library
            ?.render?.();


        Novellow.reading
            ?.render?.();


        Novellow.stats
            ?.render?.();

    }


    /* =====================================================
       LEGACY BOOK SELECT
       ===================================================== */

    function populateLegacyBookSelect() {

        const select =
            H.getById?.(
                "journalBookSelect"
            );


        if (!select) {
            return;
        }


        select.innerHTML =
            "";


        getBooks()
            .slice()
            .sort(
                (
                    a,
                    b
                ) =>
                    String(
                        a.title ||
                        ""
                    ).localeCompare(
                        String(
                            b.title ||
                            ""
                        )
                    )
            )
            .forEach(
                book => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        book.id;


                    option.textContent =
                        book.title ||
                        "Untitled Book";


                    select.appendChild(
                        option
                    );

                }
            );


        if (
            selectedBookId
        ) {

            select.value =
                selectedBookId;

        }

    }


    /* =====================================================
       SECTION INTRO
       ===================================================== */

    function getSectionIntro(
        section
    ) {

        const intros = {

            notes:
                "The things you would have scribbled in the margins if the book belonged entirely to you.",

            quotes:
                "Passages worth underlining, copying down, or carrying somewhere beyond the book.",

            vocabulary:
                "Words you met here and decided were worth knowing.",

            thoughts:
                "Reactions, theories, arguments, connections, and whatever the book makes you think about.",

            characters:
                "Names, relationships, motives, personalities, and enough detail to keep everyone straight.",

            themes:
                "The larger ideas, symbols, tensions, and patterns you notice as the book unfolds.",

            questions:
                "Things you are unsure about, curious about, or want to return to before closing the book.",

            review:
                "What the book became after you finished reading it."

        };


        return (
            intros[
                section
            ] ||
            ""
        );

    }


    /* =====================================================
       ENTRY LABEL
       ===================================================== */

    function getEntryLabel(
        section
    ) {

        const labels = {

            notes:
                "Note",

            thoughts:
                "Thought",

            characters:
                "Character",

            themes:
                "Theme",

            questions:
                "Question",

            review:
                "Review"

        };


        return (
            labels[
                section
            ] ||
            "Entry"
        );

    }


    /* =====================================================
       ENTRY META
       ===================================================== */

    function buildEntryMeta(
        entry
    ) {

        const parts =
            [];


        if (
            entry.chapter
        ) {

            parts.push(
                `<span>${escape(
                    entry.chapter
                )}</span>`
            );

        }


        if (
            entry.page
        ) {

            parts.push(
                `<span>Page ${escape(
                    String(
                        entry.page
                    )
                )}</span>`
            );

        }


        return parts.join(
            ""
        );

    }


    /* =====================================================
       QUOTE LOCATION
       ===================================================== */

    function buildQuoteLocation(
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
       OVERVIEW DETAIL
       ===================================================== */

    function createOverviewDetail(
        label,
        value
    ) {

        return `
            <div class="journal-overview-detail">

                <span>
                    ${escape(
                        label
                    )}
                </span>

                <strong>
                    ${escape(
                        String(
                            value ?? "—"
                        )
                    )}
                </strong>

            </div>
        `;

    }


    /* =====================================================
       RATING
       ===================================================== */

    function formatRating(
        rating
    ) {

        const value =
            Math.max(
                0,
                Math.min(
                    5,
                    Number(
                        rating
                    ) || 0
                )
            );


        if (
            value === 0
        ) {

            return "Not rated";

        }


        return "★".repeat(
            value
        );

    }


    function createRatingOptions(
        selected
    ) {

        const options = [
            {
                value:
                    0,

                label:
                    "Not rated"
            },
            {
                value:
                    1,

                label:
                    "★"
            },
            {
                value:
                    2,

                label:
                    "★★"
            },
            {
                value:
                    3,

                label:
                    "★★★"
            },
            {
                value:
                    4,

                label:
                    "★★★★"
            },
            {
                value:
                    5,

                label:
                    "★★★★★"
            }
        ];


        return options
            .map(
                option => {

                    return `
                        <option
                            value="${option.value}"
                            ${
                                option.value ===
                                selected
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${option.label}
                        </option>
                    `;

                }
            )
            .join("");

    }


    /* =====================================================
       PAGE NUMBERS
       ===================================================== */

    function updatePageNumbers() {

        const order = [
            "overview",
            "notes",
            "quotes",
            "vocabulary",
            "thoughts",
            "characters",
            "themes",
            "questions",
            "review"
        ];


        const index =
            Math.max(
                0,
                order.indexOf(
                    selectedSection
                )
            );


        H.setText?.(
            "journalLeftPageNumber",
            String(
                index * 2 +
                1
            )
        );


        H.setText?.(
            "journalRightPageNumber",
            String(
                index * 2 +
                2
            )
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
       INPUT
       ===================================================== */

    function inputValue(
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
        value
    ) {

        if (
            H.escapeHTML
        ) {

            return H.escapeHTML(
                String(
                    value ??
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
                value ??
                ""
            );


        return div.innerHTML;

    }


    function escapeAttribute(
        value
    ) {

        return escape(
            value
        )
            .replace(
                /"/g,
                "&quot;"
            );

    }


    function escapeTextarea(
        value
    ) {

        return escape(
            value
        );

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
       PUBLIC API
       ===================================================== */

    Novellow.journal = {

        init,

        render,

        openBook,

        closeBook,

        selectBook,

        openSelectedJournal,

        setSection,

        renderOpenBook,

        renderJournalLibrary,

        closeEntryModal

    };


})();
