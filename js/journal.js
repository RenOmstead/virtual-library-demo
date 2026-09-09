/* =========================================================
   NOVELLOW
   JOURNAL.JS

   Per-book journal
   Journal navigation
   Entry creation
   Entry editing
   Entry deletion
   Review section
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

    let editingEntryId =
        null;


    /* =====================================================
       INIT
       ===================================================== */

    function init() {

        bindJournalControls();

        bindEntryModal();

        render();

    }


    /* =====================================================
       STATE ACCESS
       ===================================================== */

    function getState() {

        return Novellow.state;

    }


    /* =====================================================
       JOURNAL SECTIONS
       ===================================================== */

    function getSections() {

        return (
            CONFIG.journalSections ||
            [
                {
                    id: "overview",
                    name: "Overview"
                },
                {
                    id: "notes",
                    name: "Notes"
                },
                {
                    id: "thoughts",
                    name: "Thoughts"
                },
                {
                    id: "characters",
                    name: "Characters"
                },
                {
                    id: "themes",
                    name: "Themes"
                },
                {
                    id: "questions",
                    name: "Questions"
                },
                {
                    id: "review",
                    name: "Review"
                }
            ]
        );

    }


    /* =====================================================
       BIND JOURNAL CONTROLS
       ===================================================== */

    function bindJournalControls() {

        const select =
            H.getById?.(
                "journalBookSelect"
            );


        if (select) {

            select.addEventListener(
                "change",
                () => {

                    const bookId =
                        select.value;


                    if (!bookId) {

                        getState()
                            .selectedBookId =
                            null;


                        render();

                        return;

                    }


                    selectBook(
                        bookId
                    );

                }
            );

        }


        H.queryAll?.(
            "[data-journal-section]"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openSection(
                            button.dataset
                                .journalSection
                        );

                    }
                );

            }
        );


        H.bindClick?.(
            "journalBackButton",
            openContents
        );


        H.bindClick?.(
            "addJournalEntry",
            openAddEntryModal
        );

    }


    /* =====================================================
       ENTRY MODAL BINDINGS
       ===================================================== */

    function bindEntryModal() {

        H.bindClick?.(
            "closeJournalEntryModal",
            closeEntryModal
        );


        H.bindClick?.(
            "cancelJournalEntry",
            closeEntryModal
        );


        const form =
            H.getById?.(
                "journalEntryForm"
            );


        if (form) {

            form.addEventListener(
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

    }


    /* =====================================================
       MAIN RENDER
       ===================================================== */

    function render() {

        populateBookSelect();


        const book =
            getSelectedBook();


        const empty =
            H.getById?.(
                "journalEmptyState"
            );


        const workspace =
            H.getById?.(
                "journalWorkspace"
            );


        if (!book) {

            if (empty) {

                empty.hidden =
                    false;

            }


            if (workspace) {

                workspace.hidden =
                    true;

            }


            return;

        }


        if (empty) {

            empty.hidden =
                true;

        }


        if (workspace) {

            workspace.hidden =
                false;

        }


        renderBookPanel(
            book
        );


        if (
            getState()
                .selectedJournalSection
        ) {

            renderSection(
                book,
                getState()
                    .selectedJournalSection
            );

        } else {

            renderContents(
                book
            );

        }

    }


    /* =====================================================
       BOOK SELECT
       ===================================================== */

    function populateBookSelect() {

        const select =
            H.getById?.(
                "journalBookSelect"
            );


        if (!select) {
            return;
        }


        const state =
            getState();


        const previous =
            state.selectedBookId ||
            select.value ||
            "";


        select.innerHTML =
            "";


        const placeholder =
            document.createElement(
                "option"
            );


        placeholder.value =
            "";


        placeholder.textContent =
            "Choose a book";


        select.appendChild(
            placeholder
        );


        const books =
            [
                ...(state.books || [])
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
       SELECT BOOK
       ===================================================== */

    function selectBook(
        bookId
    ) {

        const book =
            H.getBookById?.(
                bookId
            );


        if (!book) {
            return;
        }


        getState()
            .selectedBookId =
            book.id;


        getState()
            .selectedJournalSection =
            null;


        render();

    }


    /* =====================================================
       SELECTED BOOK
       ===================================================== */

    function getSelectedBook() {

        const state =
            getState();


        if (
            !state.selectedBookId
        ) {

            return null;

        }


        return (
            H.getBookById?.(
                state.selectedBookId
            ) ||
            null
        );

    }


    /* =====================================================
       BOOK PANEL
       ===================================================== */

    function renderBookPanel(
        book
    ) {

        const cover =
            H.getById?.(
                "journalBookCover"
            );


        if (cover) {

            cover.innerHTML =
                "";


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

        }


        H.setText?.(
            "journalBookStatus",
            H.getStatusName?.(
                book.status
            ) ||
            "Book"
        );


        H.setText?.(
            "journalBookTitle",
            book.title
        );


        H.setText?.(
            "journalBookAuthor",
            book.author ||
            "Unknown Author"
        );


        H.setText?.(
            "journalBookStarted",
            book.started
                ? H.formatDate?.(
                    book.started
                ) || book.started
                : "—"
        );


        H.setText?.(
            "journalBookFinished",
            book.finished
                ? H.formatDate?.(
                    book.finished
                ) || book.finished
                : "—"
        );


        H.setText?.(
            "journalBookPages",
            book.pages
                ? H.formatNumber?.(
                    book.pages
                ) || book.pages
                : "—"
        );

    }


    /* =====================================================
       CONTENTS
       ===================================================== */

    function renderContents(
        book
    ) {

        const contents =
            H.getById?.(
                "journalContents"
            );


        const section =
            H.getById?.(
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


        updateContentsCounts(
            book
        );

    }


    /* =====================================================
       CONTENTS COUNTS
       ===================================================== */

    function updateContentsCounts(
        book
    ) {

        const journal =
            book.journal ||
            {};


        H.queryAll?.(
            "[data-journal-section]"
        ).forEach(
            button => {

                const sectionId =
                    button.dataset
                        .journalSection;


                const count =
                    getSectionEntries(
                        journal,
                        sectionId
                    ).length;


                button.dataset
                    .sectionNumber =
                    String(
                        count
                    );

            }
        );

    }


    /* =====================================================
       OPEN CONTENTS
       ===================================================== */

    function openContents() {

        getState()
            .selectedJournalSection =
            null;


        render();

    }


    /* =====================================================
       OPEN SECTION
       ===================================================== */

    function openSection(
        sectionId
    ) {

        const valid =
            getSections().some(
                section =>
                    section.id ===
                    sectionId
            );


        if (!valid) {
            return;
        }


        getState()
            .selectedJournalSection =
            sectionId;


        render();

    }


    /* =====================================================
       RENDER SECTION
       ===================================================== */

    function renderSection(
        book,
        sectionId
    ) {

        const contents =
            H.getById?.(
                "journalContents"
            );


        const section =
            H.getById?.(
                "journalSection"
            );


        if (contents) {

            contents.hidden =
                true;

        }


        if (section) {

            section.hidden =
                false;

        }


        const config =
            getSections().find(
                item =>
                    item.id ===
                    sectionId
            );


        H.setText?.(
            "journalSectionEyebrow",
            book.title
        );


        H.setText?.(
            "journalSectionTitle",
            config?.name ||
            "Journal"
        );


        const addButton =
            H.getById?.(
                "addJournalEntry"
            );


        if (addButton) {

            addButton.hidden =
                sectionId ===
                "overview";

        }


        renderEntries(
            book,
            sectionId
        );

    }


    /* =====================================================
       GET SECTION ENTRIES
       ===================================================== */

    function getSectionEntries(
        journal,
        sectionId
    ) {

        if (
            sectionId ===
            "overview"
        ) {

            return [];

        }


        const entries =
            journal?.[
                sectionId
            ];


        return Array.isArray(
            entries
        )
            ? entries
            : [];

    }


    /* =====================================================
       RENDER ENTRIES
       ===================================================== */

    function renderEntries(
        book,
        sectionId
    ) {

        const container =
            H.getById?.(
                "journalEntries"
            );


        if (!container) {
            return;
        }


        container.innerHTML =
            "";


        if (
            sectionId ===
            "overview"
        ) {

            renderOverview(
                container,
                book
            );

            return;

        }


        const entries =
            getSectionEntries(
                book.journal,
                sectionId
            );


        if (
            entries.length === 0
        ) {

            container.appendChild(
                createEmptySection(
                    sectionId
                )
            );

            return;

        }


        entries
            .slice()
            .sort(
                compareEntries
            )
            .forEach(
                entry => {

                    container.appendChild(
                        createEntryCard(
                            book,
                            sectionId,
                            entry
                        )
                    );

                }
            );

    }


    /* =====================================================
       OVERVIEW
       ===================================================== */

    function renderOverview(
        container,
        book
    ) {

        const journal =
            book.journal ||
            {};


        const sections =
            getSections().filter(
                section =>
                    section.id !==
                    "overview"
            );


        const grid =
            document.createElement(
                "div"
            );


        grid.className =
            "journal-compact-grid";


        sections.forEach(
            section => {

                const entries =
                    getSectionEntries(
                        journal,
                        section.id
                    );


                const card =
                    document.createElement(
                        "button"
                    );


                card.type =
                    "button";


                card.className =
                    "journal-overview-card";


                card.innerHTML =
                    `
                        <h3>
                            ${H.escapeHTML?.(
                                section.name
                            )}
                        </h3>

                        <p>
                            ${
                                entries.length === 0
                                    ? "Nothing written yet."
                                    : `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`
                            }
                        </p>
                    `;


                card.addEventListener(
                    "click",
                    () => {

                        openSection(
                            section.id
                        );

                    }
                );


                grid.appendChild(
                    card
                );

            }
        );


        container.appendChild(
            grid
        );

    }


    /* =====================================================
       EMPTY SECTION
       ===================================================== */

    function createEmptySection(
        sectionId
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "journal-section-empty";


        const labels = {

            notes:
                [
                    "No notes yet.",
                    "Capture details, passages, or anything you want to remember."
                ],

            thoughts:
                [
                    "No thoughts yet.",
                    "Write down reactions, interpretations, or ideas while they are fresh."
                ],

            characters:
                [
                    "No characters yet.",
                    "Keep track of people, relationships, motives, and impressions."
                ],

            themes:
                [
                    "No themes yet.",
                    "Record patterns, symbols, ideas, or recurring questions."
                ],

            questions:
                [
                    "No questions yet.",
                    "Save anything you want to investigate, discuss, or think about later."
                ],

            review:
                [
                    "No review yet.",
                    "When you're ready, write what you thought of the book."
                ]

        };


        const [
            title,
            copy
        ] =
            labels[
                sectionId
            ] ||
            [
                "Nothing here yet.",
                "Add your first entry."
            ];


        wrapper.innerHTML =
            `
                <strong>
                    ${H.escapeHTML?.(
                        title
                    )}
                </strong>

                <span>
                    ${H.escapeHTML?.(
                        copy
                    )}
                </span>
            `;


        return wrapper;

    }


    /* =====================================================
       ENTRY SORTING
       ===================================================== */

    function compareEntries(
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
       CREATE ENTRY CARD
       ===================================================== */

    function createEntryCard(
        book,
        sectionId,
        entry
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "journal-entry-card";


        const title =
            getEntryTitle(
                sectionId,
                entry
            );


        const body =
            getEntryBody(
                sectionId,
                entry
            );


        card.innerHTML =
            `
                <div class="journal-entry-header">

                    <div class="journal-entry-heading">

                        <h3>
                            ${H.escapeHTML?.(
                                title
                            )}
                        </h3>

                        <span class="journal-entry-date">
                            ${
                                H.escapeHTML?.(
                                    H.formatDate?.(
                                        entry.updatedAt ||
                                        entry.createdAt
                                    ) ||
                                    ""
                                )
                            }
                        </span>

                    </div>

                    <div class="journal-entry-actions">

                        <button
                            type="button"
                            class="journal-entry-action"
                            data-journal-edit="${entry.id}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="journal-entry-action danger"
                            data-journal-delete="${entry.id}"
                        >
                            Delete
                        </button>

                    </div>

                </div>

                ${
                    body
                        ? `
                            <div class="journal-entry-body">
                                ${H.escapeHTML?.(
                                    body
                                )}
                            </div>
                        `
                        : ""
                }

                ${renderEntryMeta(
                    sectionId,
                    entry
                )}
            `;


        card.querySelector(
            `[data-journal-edit="${entry.id}"]`
        )?.addEventListener(
            "click",
            () => {

                openEditEntryModal(
                    sectionId,
                    entry.id
                );

            }
        );


        card.querySelector(
            `[data-journal-delete="${entry.id}"]`
        )?.addEventListener(
            "click",
            () => {

                deleteEntry(
                    book.id,
                    sectionId,
                    entry.id
                );

            }
        );


        return card;

    }


    /* =====================================================
       ENTRY TITLES
       ===================================================== */

    function getEntryTitle(
        sectionId,
        entry
    ) {

        switch (sectionId) {

            case "characters":
                return (
                    entry.name ||
                    "Character"
                );


            case "themes":
                return (
                    entry.theme ||
                    entry.title ||
                    "Theme"
                );


            case "questions":
                return (
                    entry.question ||
                    "Question"
                );


            case "review":
                return (
                    entry.title ||
                    "Book Review"
                );


            default:
                return (
                    entry.title ||
                    "Journal Entry"
                );

        }

    }


    /* =====================================================
       ENTRY BODY
       ===================================================== */

    function getEntryBody(
        sectionId,
        entry
    ) {

        switch (sectionId) {

            case "characters":
                return (
                    entry.notes ||
                    entry.body ||
                    ""
                );


            case "themes":
                return (
                    entry.notes ||
                    entry.body ||
                    ""
                );


            case "questions":
                return (
                    entry.answer ||
                    entry.notes ||
                    ""
                );


            case "review":
                return (
                    entry.review ||
                    entry.body ||
                    ""
                );


            default:
                return (
                    entry.body ||
                    entry.notes ||
                    ""
                );

        }

    }


    /* =====================================================
       ENTRY META
       ===================================================== */

    function renderEntryMeta(
        sectionId,
        entry
    ) {

        const meta =
            [];


        if (
            entry.page
        ) {

            meta.push(
                `Page ${entry.page}`
            );

        }


        if (
            entry.chapter
        ) {

            meta.push(
                entry.chapter
            );

        }


        if (
            sectionId ===
            "characters" &&
            entry.role
        ) {

            meta.push(
                entry.role
            );

        }


        if (
            sectionId ===
            "review" &&
            entry.rating
        ) {

            meta.push(
                `${entry.rating}/5 ★`
            );

        }


        if (
            meta.length === 0
        ) {

            return "";

        }


        return `
            <div class="journal-entry-meta">
                ${meta.map(
                    item =>
                        `
                            <span>
                                ${H.escapeHTML?.(
                                    item
                                )}
                            </span>
                        `
                ).join("")}
            </div>
        `;

    }


    /* =====================================================
       OPEN ADD ENTRY MODAL
       ===================================================== */

    function openAddEntryModal() {

        const state =
            getState();


        const sectionId =
            state.selectedJournalSection;


        if (
            !sectionId ||
            sectionId ===
            "overview"
        ) {

            return;

        }


        editingEntryId =
            null;


        setInputValue(
            "journalEntrySection",
            sectionId
        );


        H.setText?.(
            "journalEntryModalTitle",
            getAddEntryTitle(
                sectionId
            )
        );


        buildEntryFields(
            sectionId
        );


        openEntryModal();

    }


    /* =====================================================
       OPEN EDIT ENTRY MODAL
       ===================================================== */

    function openEditEntryModal(
        sectionId,
        entryId
    ) {

        const book =
            getSelectedBook();


        if (!book) {
            return;
        }


        const entries =
            getSectionEntries(
                book.journal,
                sectionId
            );


        const entry =
            entries.find(
                item =>
                    item.id ===
                    entryId
            );


        if (!entry) {
            return;
        }


        editingEntryId =
            entryId;


        setInputValue(
            "journalEntrySection",
            sectionId
        );


        H.setText?.(
            "journalEntryModalTitle",
            `Edit ${getSectionName(
                sectionId
            )}`
        );


        buildEntryFields(
            sectionId,
            entry
        );


        openEntryModal();

    }


    /* =====================================================
       MODAL OPEN
       ===================================================== */

    function openEntryModal() {

        const modal =
            H.getById?.(
                "journalEntryModal"
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

                modal.querySelector(
                    "input, textarea, select"
                )?.focus();

            }
        );

    }


    /* =====================================================
       CLOSE MODAL
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


        syncBodyLock();

    }


    /* =====================================================
       BUILD ENTRY FIELDS
       ===================================================== */

    function buildEntryFields(
        sectionId,
        entry =
            {}
    ) {

        const fields =
            H.getById?.(
                "journalEntryFields"
            );


        if (!fields) {
            return;
        }


        fields.innerHTML =
            getFieldMarkup(
                sectionId,
                entry
            );

    }


    /* =====================================================
       FIELD MARKUP
       ===================================================== */

    function getFieldMarkup(
        sectionId,
        entry
    ) {

        switch (sectionId) {

            case "notes":

                return `
                    ${textField(
                        "journalEntryTitle",
                        "Title",
                        entry.title || ""
                    )}

                    ${textField(
                        "journalEntryPage",
                        "Page",
                        entry.page || "",
                        "number"
                    )}

                    ${textField(
                        "journalEntryChapter",
                        "Chapter or section",
                        entry.chapter || ""
                    )}

                    ${textareaField(
                        "journalEntryBody",
                        "Notes",
                        entry.body || entry.notes || ""
                    )}
                `;


            case "thoughts":

                return `
                    ${textField(
                        "journalEntryTitle",
                        "Thought",
                        entry.title || ""
                    )}

                    ${textField(
                        "journalEntryPage",
                        "Page",
                        entry.page || "",
                        "number"
                    )}

                    ${textareaField(
                        "journalEntryBody",
                        "What are you thinking?",
                        entry.body || entry.notes || ""
                    )}
                `;


            case "characters":

                return `
                    ${textField(
                        "journalEntryName",
                        "Character name",
                        entry.name || ""
                    )}

                    ${textField(
                        "journalEntryRole",
                        "Role or relationship",
                        entry.role || ""
                    )}

                    ${textareaField(
                        "journalEntryBody",
                        "Notes",
                        entry.notes || entry.body || ""
                    )}
                `;


            case "themes":

                return `
                    ${textField(
                        "journalEntryTheme",
                        "Theme, symbol, or idea",
                        entry.theme || entry.title || ""
                    )}

                    ${textField(
                        "journalEntryPage",
                        "Page",
                        entry.page || "",
                        "number"
                    )}

                    ${textareaField(
                        "journalEntryBody",
                        "What are you noticing?",
                        entry.notes || entry.body || ""
                    )}
                `;


            case "questions":

                return `
                    ${textareaField(
                        "journalEntryQuestion",
                        "Question",
                        entry.question || "",
                        120
                    )}

                    ${textareaField(
                        "journalEntryAnswer",
                        "Thoughts or possible answer",
                        entry.answer || entry.notes || ""
                    )}

                    ${textField(
                        "journalEntryPage",
                        "Page",
                        entry.page || "",
                        "number"
                    )}
                `;


            case "review":

                return `
                    ${textField(
                        "journalEntryTitle",
                        "Review title",
                        entry.title || ""
                    )}

                    <label class="field">
                        <span>Rating</span>

                        <select id="journalEntryRating">
                            <option value="0">
                                Not rated
                            </option>

                            <option value="1">
                                1 ★
                            </option>

                            <option value="2">
                                2 ★★
                            </option>

                            <option value="3">
                                3 ★★★
                            </option>

                            <option value="4">
                                4 ★★★★
                            </option>

                            <option value="5">
                                5 ★★★★★
                            </option>
                        </select>
                    </label>

                    ${textareaField(
                        "journalEntryBody",
                        "Review",
                        entry.review || entry.body || ""
                    )}
                `;


            default:

                return `
                    ${textField(
                        "journalEntryTitle",
                        "Title",
                        entry.title || ""
                    )}

                    ${textareaField(
                        "journalEntryBody",
                        "Entry",
                        entry.body || ""
                    )}
                `;

        }

    }


    /* =====================================================
       FIELD BUILDERS
       ===================================================== */

    function textField(
        id,
        label,
        value,
        type =
            "text"
    ) {

        return `
            <label class="field">

                <span>
                    ${H.escapeHTML?.(
                        label
                    )}
                </span>

                <input
                    id="${id}"
                    type="${type}"
                    value="${H.escapeHTML?.(
                        String(value)
                    )}"
                    ${
                        type === "number"
                            ? 'min="0"'
                            : ""
                    }
                >

            </label>
        `;

    }


    function textareaField(
        id,
        label,
        value,
        minHeight =
            220
    ) {

        return `
            <label class="field">

                <span>
                    ${H.escapeHTML?.(
                        label
                    )}
                </span>

                <textarea
                    id="${id}"
                    style="min-height: ${minHeight}px;"
                >${H.escapeHTML?.(
                    value
                )}</textarea>

            </label>
        `;

    }


    /* =====================================================
       SUBMIT ENTRY
       ===================================================== */

    function handleEntrySubmit(
        event
    ) {

        event.preventDefault();


        const book =
            getSelectedBook();


        if (!book) {

            closeEntryModal();

            return;

        }


        const sectionId =
            getInputValue(
                "journalEntrySection"
            );


        if (
            !sectionId ||
            sectionId ===
            "overview"
        ) {

            return;

        }


        const journal =
            H.normalizeJournal?.(
                book.journal
            ) ||
            book.journal ||
            {};


        if (
            !Array.isArray(
                journal[
                    sectionId
                ]
            )
        ) {

            journal[
                sectionId
            ] =
                [];

        }


        const existing =
            editingEntryId
                ? journal[
                    sectionId
                ].find(
                    entry =>
                        entry.id ===
                        editingEntryId
                )
                : null;


        const entry =
            buildEntryFromForm(
                sectionId,
                existing
            );


        if (
            !entryHasContent(
                sectionId,
                entry
            )
        ) {

            H.showToast?.(
                "Write something before saving the entry.",
                "error"
            );

            return;

        }


        if (existing) {

            const index =
                journal[
                    sectionId
                ].findIndex(
                    item =>
                        item.id ===
                        existing.id
                );


            if (
                index !== -1
            ) {

                journal[
                    sectionId
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
                sectionId
            ].push(
                entry
            );


            H.showToast?.(
                "Journal entry added.",
                "success"
            );

        }


        book.journal =
            journal;


        book.updatedAt =
            H.nowISO?.();


        Novellow.storage
            ?.saveBooks?.();


        closeEntryModal();


        render();


        Novellow.stats
            ?.render?.();

    }


    /* =====================================================
       BUILD ENTRY FROM FORM
       ===================================================== */

    function buildEntryFromForm(
        sectionId,
        existing
    ) {

        const base = {

            id:
                existing?.id ||
                H.createId?.(
                    "journal"
                ),

            createdAt:
                existing?.createdAt ||
                H.nowISO?.(),

            updatedAt:
                H.nowISO?.()

        };


        switch (sectionId) {

            case "notes":

                return {
                    ...base,

                    title:
                        getInputValue(
                            "journalEntryTitle"
                        ),

                    page:
                        getInputValue(
                            "journalEntryPage"
                        ),

                    chapter:
                        getInputValue(
                            "journalEntryChapter"
                        ),

                    body:
                        getInputValue(
                            "journalEntryBody"
                        )
                };


            case "thoughts":

                return {
                    ...base,

                    title:
                        getInputValue(
                            "journalEntryTitle"
                        ),

                    page:
                        getInputValue(
                            "journalEntryPage"
                        ),

                    body:
                        getInputValue(
                            "journalEntryBody"
                        )
                };


            case "characters":

                return {
                    ...base,

                    name:
                        getInputValue(
                            "journalEntryName"
                        ),

                    role:
                        getInputValue(
                            "journalEntryRole"
                        ),

                    notes:
                        getInputValue(
                            "journalEntryBody"
                        )
                };


            case "themes":

                return {
                    ...base,

                    theme:
                        getInputValue(
                            "journalEntryTheme"
                        ),

                    page:
                        getInputValue(
                            "journalEntryPage"
                        ),

                    notes:
                        getInputValue(
                            "journalEntryBody"
                        )
                };


            case "questions":

                return {
                    ...base,

                    question:
                        getInputValue(
                            "journalEntryQuestion"
                        ),

                    answer:
                        getInputValue(
                            "journalEntryAnswer"
                        ),

                    page:
                        getInputValue(
                            "journalEntryPage"
                        )
                };


            case "review":

                return {
                    ...base,

                    title:
                        getInputValue(
                            "journalEntryTitle"
                        ),

                    rating:
                        Number(
                            getInputValue(
                                "journalEntryRating"
                            )
                        ) || 0,

                    review:
                        getInputValue(
                            "journalEntryBody"
                        )
                };


            default:

                return {
                    ...base,

                    title:
                        getInputValue(
                            "journalEntryTitle"
                        ),

                    body:
                        getInputValue(
                            "journalEntryBody"
                        )
                };

        }

    }


    /* =====================================================
       ENTRY CONTENT CHECK
       ===================================================== */

    function entryHasContent(
        sectionId,
        entry
    ) {

        switch (sectionId) {

            case "characters":
                return Boolean(
                    entry.name ||
                    entry.notes
                );


            case "themes":
                return Boolean(
                    entry.theme ||
                    entry.notes
                );


            case "questions":
                return Boolean(
                    entry.question ||
                    entry.answer
                );


            case "review":
                return Boolean(
                    entry.title ||
                    entry.review ||
                    entry.rating
                );


            default:
                return Boolean(
                    entry.title ||
                    entry.body
                );

        }

    }


    /* =====================================================
       DELETE ENTRY
       ===================================================== */

    function deleteEntry(
        bookId,
        sectionId,
        entryId
    ) {

        const book =
            H.getBookById?.(
                bookId
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
            H.normalizeJournal?.(
                book.journal
            ) ||
            book.journal ||
            {};


        const entries =
            Array.isArray(
                journal[
                    sectionId
                ]
            )
                ? journal[
                    sectionId
                ]
                : [];


        journal[
            sectionId
        ] =
            entries.filter(
                entry =>
                    entry.id !==
                    entryId
            );


        book.journal =
            journal;


        book.updatedAt =
            H.nowISO?.();


        Novellow.storage
            ?.saveBooks?.();


        render();


        H.showToast?.(
            "Journal entry deleted.",
            "success"
        );

    }


    /* =====================================================
       TITLES
       ===================================================== */

    function getSectionName(
        sectionId
    ) {

        return (
            getSections().find(
                section =>
                    section.id ===
                    sectionId
            )?.name ||
            "Journal Entry"
        );

    }


    function getAddEntryTitle(
        sectionId
    ) {

        switch (sectionId) {

            case "notes":
                return "Add Note";

            case "thoughts":
                return "Add Thought";

            case "characters":
                return "Add Character";

            case "themes":
                return "Add Theme";

            case "questions":
                return "Add Question";

            case "review":
                return "Add Review";

            default:
                return "Add Journal Entry";

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

                    const el =
                        H.getById?.(
                            id
                        );


                    return (
                        el &&
                        !el.hidden
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

    Novellow.journal = {

        init,

        render,

        selectBook,

        openContents,

        openSection,

        openAddEntryModal,

        openEditEntryModal,

        closeEntryModal,

        deleteEntry

    };


})();
