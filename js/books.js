/* =========================================================
   NOVELLOW
   BOOKS.JS

   Add books
   Edit books
   Delete books
   Book drawer
   Shelf rendering
   Spine preview
   Journal handoff
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


    let initialized =
        false;


    let revealBookId =
        null;


    /* =====================================================
       BASIC HELPERS
       ===================================================== */

    function byId(id) {

        return document.getElementById(id);

    }


    function getState() {

        Novellow.state =
            Novellow.state ||
            {};


        if (
            !Array.isArray(
                Novellow.state.books
            )
        ) {

            Novellow.state.books =
                [];

        }


        if (
            !Array.isArray(
                Novellow.state.shelves
            )
        ) {

            Novellow.state.shelves =
                [];

        }


        return Novellow.state;

    }


    function getBooks() {

        return getState().books;

    }


    function getShelves() {

        return getState().shelves;

    }


    function getBookById(bookId) {

        return getBooks().find(
            book =>
                String(book.id) ===
                String(bookId)
        ) || null;

    }


    function value(id) {

        return (
            byId(id)?.value ??
            ""
        );

    }


    function setValue(
        id,
        nextValue
    ) {

        const element =
            byId(id);


        if (!element) {
            return;
        }


        element.value =
            nextValue ??
            "";

    }


    function setText(
        id,
        text
    ) {

        const element =
            byId(id);


        if (!element) {
            return;
        }


        element.textContent =
            text ??
            "";

    }


    function createId(prefix) {

        if (
            window.crypto &&
            typeof window.crypto.randomUUID ===
                "function"
        ) {

            return window.crypto
                .randomUUID();

        }


        return (
            prefix +
            "-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 10)
        );

    }


    function escapeHTML(input) {

        const element =
            document.createElement(
                "div"
            );


        element.textContent =
            String(
                input ??
                ""
            );


        return element.innerHTML;

    }


    function showToast(
        message,
        type =
            "success"
    ) {

        if (
            Novellow.helpers
                ?.showToast
        ) {

            Novellow.helpers
                .showToast(
                    message,
                    type
                );

            return;

        }


        const toast =
            byId("toast");


        if (!toast) {

            console.log(
                message
            );

            return;

        }


        toast.textContent =
            message;


        toast.dataset.type =
            type;


        toast.hidden =
            false;


        window.clearTimeout(
            showToast.timeout
        );


        showToast.timeout =
            window.setTimeout(
                () => {

                    toast.hidden =
                        true;

                },
                2400
            );

    }


    /* =====================================================
       STORAGE
       ===================================================== */

    function saveBooks() {

        const state =
            getState();


        try {

            localStorage.setItem(
                "novellow_books",
                JSON.stringify(
                    state.books
                )
            );

        } catch (error) {

            console.error(
                "Novellow: books could not be saved.",
                error
            );

        }


        Novellow.storage
            ?.saveBooks?.();

    }


    /* =====================================================
       INIT
       ===================================================== */

    function init() {

        if (initialized) {
            return;
        }


        initialized =
            true;


        bindAddBookButtons();

        bindBookDrawer();

        bindBookReveal();

        bindPreviewControls();

        populateShelfSelect();

        updateSpinePreview();

    }


    /* =====================================================
       ADD BOOK BUTTONS
       ===================================================== */

    function bindAddBookButtons() {

        const buttonIds = [

            "headerAddBook",

            "libraryAddBook",

            "emptyAddBook",

            "mobileAddBook",

            "readingAddBook"

        ];


        buttonIds.forEach(
            id => {

                const button =
                    byId(id);


                if (!button) {
                    return;
                }


                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();

                        openAddDrawer();

                    }
                );

            }
        );

    }


    /* =====================================================
       BOOK DRAWER BINDING
       ===================================================== */

    function bindBookDrawer() {

        byId(
            "closeBookDrawer"
        )?.addEventListener(
            "click",
            closeDrawer
        );


        byId(
            "cancelBookButton"
        )?.addEventListener(
            "click",
            closeDrawer
        );


        byId(
            "bookForm"
        )?.addEventListener(
            "submit",
            handleBookSubmit
        );


        byId(
            "deleteBookButton"
        )?.addEventListener(
            "click",
            () => {

                const bookId =
                    value(
                        "editingBookId"
                    );


                if (bookId) {

                    deleteBook(
                        bookId
                    );

                }

            }
        );


        byId(
            "overlay"
        )?.addEventListener(
            "click",
            () => {

                const drawer =
                    byId(
                        "bookDrawer"
                    );


                if (
                    drawer &&
                    !drawer.hidden
                ) {

                    closeDrawer();

                }

            }
        );

    }


    /* =====================================================
       OPEN ADD DRAWER
       ===================================================== */

    function openAddDrawer(
        shelfId =
            ""
    ) {

        resetBookForm();


        setText(
            "bookDrawerTitle",
            "Add a Book"
        );


        setText(
            "saveBookButtonLabel",
            "Save Book"
        );


        setValue(
            "editingBookId",
            ""
        );


        const deleteButton =
            byId(
                "deleteBookButton"
            );


        if (deleteButton) {

            deleteButton.hidden =
                true;

        }


        populateShelfSelect(
            shelfId
        );


        if (shelfId) {

            setValue(
                "bookShelf",
                shelfId
            );

        }


        applyDefaultDesign();

        updateSpinePreview();

        openDrawer();


        requestAnimationFrame(
            () => {

                byId(
                    "bookTitle"
                )?.focus();

            }
        );

    }


    /* =====================================================
       OPEN EDIT DRAWER
       ===================================================== */

    function openEditDrawer(
        bookId
    ) {

        const book =
            getBookById(
                bookId
            );


        if (!book) {

            showToast(
                "That book could not be found.",
                "error"
            );

            return;

        }


        resetBookForm();


        setText(
            "bookDrawerTitle",
            "Edit Book"
        );


        setText(
            "saveBookButtonLabel",
            "Save Changes"
        );


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
            book.year
        );


        setValue(
            "bookPages",
            book.pages
        );


        setValue(
            "bookISBN",
            book.isbn ||
            book.ISBN
        );


        setValue(
            "bookSeries",
            book.series
        );


        populateShelfSelect(
            book.shelfId ||
            book.shelf_id ||
            ""
        );


        setValue(
            "bookShelf",
            book.shelfId ||
            book.shelf_id ||
            ""
        );


        setValue(
            "bookStatus",
            book.status ||
            "want"
        );


        setValue(
            "bookRating",
            book.rating ||
            ""
        );


        setValue(
            "bookTimesRead",
            book.timesRead ||
            book.times_read ||
            0
        );


        setValue(
            "bookStarted",
            book.started ||
            book.started_at ||
            ""
        );


        setValue(
            "bookFinished",
            book.finished ||
            book.finished_at ||
            ""
        );


        setValue(
            "bookCurrentPage",
            book.currentPage ||
            book.current_page ||
            0
        );


        const design =
            book.design ||
            {};


        setValue(
            "bookSpineColor",
            design.spineColor ||
            design.spine_color ||
            "#793f55"
        );


        setValue(
            "bookTextColor",
            design.textColor ||
            design.text_color ||
            "#f1e3cf"
        );


        setValue(
            "bookSpineStyle",
            design.style ||
            "classic"
        );


        setValue(
            "bookStyle",
            design.style ||
            "classic"
        );


        setValue(
            "bookSpineFont",
            design.font ||
            "serif"
        );


        setValue(
            "bookHeight",
            design.height ||
            "medium"
        );


        setValue(
            "bookThickness",
            design.thickness ||
            "medium"
        );


        const deleteButton =
            byId(
                "deleteBookButton"
            );


        if (deleteButton) {

            deleteButton.hidden =
                false;

        }


        updateSpinePreview();

        openDrawer();

    }


    /* =====================================================
       OPEN DRAWER
       ===================================================== */

    function openDrawer() {

        const drawer =
            byId(
                "bookDrawer"
            );


        if (!drawer) {

            console.error(
                "Novellow: #bookDrawer was not found."
            );

            return;

        }


        drawer.hidden =
            false;


        const overlay =
            byId(
                "overlay"
            );


        if (overlay) {

            overlay.hidden =
                false;

        }


        document.body
            .classList.add(
                "modal-open"
            );

    }


    /* =====================================================
       CLOSE DRAWER
       ===================================================== */

    function closeDrawer() {

        const drawer =
            byId(
                "bookDrawer"
            );


        if (drawer) {

            drawer.hidden =
                true;

        }


        syncOverlay();

    }


    /* =====================================================
       RESET FORM
       ===================================================== */

    function resetBookForm() {

        const form =
            byId(
                "bookForm"
            );


        form?.reset();


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
            ""
        );


        setValue(
            "bookTimesRead",
            "0"
        );


        setValue(
            "bookCurrentPage",
            "0"
        );

    }


    /* =====================================================
       DEFAULT DESIGN
       ===================================================== */

    function applyDefaultDesign() {

        const defaults =
            Novellow.config
                ?.defaultBookDesign ||
            window.NOVELLOW_CONFIG
                ?.defaultBookDesign ||
            {};


        setValue(
            "bookSpineColor",
            defaults.spineColor ||
            "#793f55"
        );


        setValue(
            "bookTextColor",
            defaults.textColor ||
            "#f1e3cf"
        );


        if (
            byId(
                "bookSpineStyle"
            )
        ) {

            setValue(
                "bookSpineStyle",
                defaults.style ||
                "classic"
            );

        }


        if (
            byId(
                "bookStyle"
            )
        ) {

            setValue(
                "bookStyle",
                defaults.style ||
                "classic"
            );

        }


        setValue(
            "bookSpineFont",
            defaults.font ||
            "serif"
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


    /* =====================================================
       HANDLE BOOK SUBMIT
       ===================================================== */

    function handleBookSubmit(
        event
    ) {

        event.preventDefault();


        const state =
            getState();


        const editingId =
            value(
                "editingBookId"
            );


        const existing =
            editingId
                ? getBookById(
                    editingId
                )
                : null;


        const title =
            value(
                "bookTitle"
            ).trim();


        if (!title) {

            showToast(
                "Add a title before saving.",
                "error"
            );

            return;

        }


        const now =
            new Date()
                .toISOString();


        const shelfId =
            value(
                "bookShelf"
            );


        const book = {

            ...existing,

            id:
                existing?.id ||
                createId(
                    "book"
                ),

            title,

            author:
                value(
                    "bookAuthor"
                ).trim(),

            genre:
                value(
                    "bookGenre"
                ).trim(),

            year:
                value(
                    "bookYear"
                ),

            pages:
                Number(
                    value(
                        "bookPages"
                    )
                ) || 0,

            isbn:
                value(
                    "bookISBN"
                ).trim(),

            series:
                value(
                    "bookSeries"
                ).trim(),

            shelfId,

            shelf_id:
                shelfId,

            status:
                value(
                    "bookStatus"
                ) ||
                "want",

            rating:
                Number(
                    value(
                        "bookRating"
                    )
                ) || 0,

            timesRead:
                Number(
                    value(
                        "bookTimesRead"
                    )
                ) || 0,

            started:
                value(
                    "bookStarted"
                ),

            finished:
                value(
                    "bookFinished"
                ),

            currentPage:
                Number(
                    value(
                        "bookCurrentPage"
                    )
                ) || 0,

            design:
                collectBookDesign(),

            journal:
                existing?.journal ||
                {},

            createdAt:
                existing?.createdAt ||
                now,

            updatedAt:
                now

        };


        if (existing) {

            const index =
                state.books.findIndex(
                    item =>
                        String(item.id) ===
                        String(existing.id)
                );


            if (
                index !==
                -1
            ) {

                state.books[
                    index
                ] =
                    book;

            }


            showToast(
                "Book updated.",
                "success"
            );

        } else {

            state.books.push(
                book
            );


            showToast(
                "Book added to your library.",
                "success"
            );

        }


        saveBooks();

        closeDrawer();

        refreshConnectedViews();

    }


    /* =====================================================
       BOOK DESIGN
       ===================================================== */

    function collectBookDesign() {

        return {

            style:
                value(
                    "bookSpineStyle"
                ) ||
                value(
                    "bookStyle"
                ) ||
                "classic",

            spineColor:
                value(
                    "bookSpineColor"
                ) ||
                "#793f55",

            textColor:
                value(
                    "bookTextColor"
                ) ||
                "#f1e3cf",

            accentColor:
                value(
                    "bookAccentColor"
                ) ||
                "#c39a67",

            ornament:
                value(
                    "bookSpineOrnament"
                ) ||
                "auto",

            font:
                value(
                    "bookSpineFont"
                ) ||
                "serif",

            fontSize:
                value(
                    "bookSpineFontSize"
                ) ||
                "medium",

            fontWeight:
                value(
                    "bookSpineFontWeight"
                ) ||
                "regular",

            letterSpacing:
                value(
                    "bookSpineLetterSpacing"
                ) ||
                "normal",

            letterCase:
                value(
                    "bookSpineCase"
                ) ||
                "typed",

            fontStyle:
                value(
                    "bookSpineFontStyle"
                ) ||
                "normal",

            textAlign:
                value(
                    "bookSpineTextAlign"
                ) ||
                "center",

            titlePanel:
                value(
                    "bookSpineTitlePanel"
                ) ||
                "none",

            height:
                value(
                    "bookHeight"
                ) ||
                "medium",

            thickness:
                value(
                    "bookThickness"
                ) ||
                "medium"

        };

    }


    /* =====================================================
       POPULATE SHELF SELECT
       ===================================================== */

    function populateShelfSelect(
        selectedId =
            ""
    ) {

        const select =
            byId(
                "bookShelf"
            );


        if (!select) {
            return;
        }


        const shelves =
            getShelves();


        const previous =
            selectedId ||
            select.value ||
            "";


        select.innerHTML =
            "";


        const noShelf =
            document.createElement(
                "option"
            );


        noShelf.value =
            "";


        noShelf.textContent =
            shelves.length
                ? "No shelf"
                : "Create a shelf first";


        select.appendChild(
            noShelf
        );


        shelves.forEach(
            shelf => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    shelf.id;


                option.textContent =
                    shelf.name ||
                    "Shelf";


                select.appendChild(
                    option
                );

            }
        );


        if (
            shelves.some(
                shelf =>
                    String(shelf.id) ===
                    String(previous)
            )
        ) {

            select.value =
                previous;

        }

    }


    /* =====================================================
       LIVE PREVIEW
       ===================================================== */

    function bindPreviewControls() {

        const ids = [

            "bookTitle",

            "bookSpineStyle",

            "bookStyle",

            "bookSpineColor",

            "bookTextColor",

            "bookSpineFont",

            "bookHeight",

            "bookThickness"

        ];


        ids.forEach(
            id => {

                const element =
                    byId(id);


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

            }
        );

    }


    /* =====================================================
       UPDATE SPINE PREVIEW
       ===================================================== */

    function updateSpinePreview() {

        const preview =
            byId(
                "bookSpinePreview"
            );


        if (!preview) {
            return;
        }


        const design =
            collectBookDesign();


        preview.style
            .setProperty(
                "--book-color",
                design.spineColor
            );


        preview.style
            .setProperty(
                "--book-text",
                design.textColor
            );


        preview.style
            .setProperty(
                "--book-accent",
                design.accentColor
            );


        const previewTitle =
            byId(
                "bookSpinePreviewTitle"
            );


        if (previewTitle) {

            previewTitle.textContent =
                value(
                    "bookTitle"
                ) ||
                "Book Title";

        }

    }


    /* =====================================================
       CREATE SHELF BOOK
       ===================================================== */

    function createShelfBookElement(
        book
    ) {

        const design =
            book.design ||
            {};


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            [
                "book-spine",
                `book-style-${design.style || "classic"}`,
                `book-height-${design.height || "medium"}`,
                `book-thickness-${design.thickness || "medium"}`
            ].join(
                " "
            );


        button.dataset.bookId =
            book.id;


        button.setAttribute(
            "aria-label",
            `Open ${book.title || "book"}`
        );


        button.style.setProperty(
            "--book-color",
            design.spineColor ||
            "#793f55"
        );


        button.style.setProperty(
            "--book-text",
            design.textColor ||
            "#f1e3cf"
        );


        button.style.setProperty(
            "--book-accent",
            design.accentColor ||
            "#c39a67"
        );


        button.innerHTML =
            `
                <span
                    class="binding-band top"
                    aria-hidden="true"
                ></span>

                <span class="spine-inner">

                    <span class="spine-title-panel">

                        <span class="spine-title">
                            ${escapeHTML(
                                book.title ||
                                "Untitled"
                            )}
                        </span>

                    </span>

                    <span
                        class="spine-ornament"
                        aria-hidden="true"
                    >
                        ✦
                    </span>

                </span>

                <span
                    class="binding-band bottom"
                    aria-hidden="true"
                ></span>
            `;


        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                getState()
                    .selectedBookId =
                    book.id;


                if (
                    Novellow.app
                        ?.navigate
                ) {

                    Novellow.app
                        .navigate(
                            "journal"
                        );

                }


                requestAnimationFrame(
                    () => {

                        Novellow.journal
                            ?.openBook?.(
                                book.id,
                                "overview"
                            );

                    }
                );

            }
        );


        return button;

    }


    /* =====================================================
       CREATE COVER
       ===================================================== */

    function createCoverElement(
        book
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "generated-cover-wrapper";


        if (
            book.cover ||
            book.cover_url
        ) {

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "cover-image";


            image.src =
                book.cover ||
                book.cover_url;


            image.alt =
                `${book.title || "Book"} cover`;


            wrapper.appendChild(
                image
            );


            return wrapper;

        }


        const design =
            book.design ||
            {};


        const generated =
            document.createElement(
                "div"
            );


        generated.className =
            "generated-cover";


        generated.style.setProperty(
            "--cover-color",
            design.spineColor ||
            "#793f55"
        );


        generated.style.setProperty(
            "--cover-text",
            design.textColor ||
            "#f1e3cf"
        );


        generated.style.setProperty(
            "--cover-accent",
            design.accentColor ||
            "#c39a67"
        );


        generated.innerHTML =
            `
                <div class="generated-cover-title">
                    ${escapeHTML(
                        book.title ||
                        "Untitled Book"
                    )}
                </div>

                <div class="generated-cover-author">
                    ${escapeHTML(
                        book.author ||
                        ""
                    )}
                </div>

                <div
                    class="generated-cover-ornament"
                    aria-hidden="true"
                >
                    ✦
                </div>
            `;


        wrapper.appendChild(
            generated
        );


        return wrapper;

    }


    /* =====================================================
       BOOK REVEAL
       ===================================================== */

    function bindBookReveal() {

        byId(
            "closeBookReveal"
        )?.addEventListener(
            "click",
            closeReveal
        );


        byId(
            "bookRevealEdit"
        )?.addEventListener(
            "click",
            () => {

                if (
                    revealBookId
                ) {

                    closeReveal();

                    openEditDrawer(
                        revealBookId
                    );

                }

            }
        );


        byId(
            "bookRevealOpenJournal"
        )?.addEventListener(
            "click",
            () => {

                if (
                    !revealBookId
                ) {
                    return;
                }


                const id =
                    revealBookId;


                closeReveal();


                getState()
                    .selectedBookId =
                    id;


                Novellow.app
                    ?.navigate?.(
                        "journal"
                    );


                requestAnimationFrame(
                    () => {

                        Novellow.journal
                            ?.openBook?.(
                                id,
                                "overview"
                            );

                    }
                );

            }
        );

    }


    function openReveal(
        bookId
    ) {

        const book =
            getBookById(
                bookId
            );


        if (!book) {
            return;
        }


        revealBookId =
            book.id;


        const reveal =
            byId(
                "bookReveal"
            );


        if (!reveal) {
            return;
        }


        const cover =
            byId(
                "bookRevealCover"
            );


        if (cover) {

            cover.innerHTML =
                "";


            cover.appendChild(
                createCoverElement(
                    book
                )
            );

        }


        setText(
            "bookRevealStatus",
            book.status ||
            "Book"
        );


        setText(
            "bookRevealTitle",
            book.title ||
            "Untitled Book"
        );


        setText(
            "bookRevealAuthor",
            book.author ||
            "Unknown author"
        );


        reveal.hidden =
            false;


        document.body
            .classList.add(
                "modal-open"
            );

    }


    function closeReveal() {

        const reveal =
            byId(
                "bookReveal"
            );


        if (reveal) {

            reveal.hidden =
                true;

        }


        revealBookId =
            null;


        syncOverlay();

    }


    /* =====================================================
       DELETE BOOK
       ===================================================== */

    function deleteBook(
        bookId
    ) {

        const book =
            getBookById(
                bookId
            );


        if (!book) {
            return;
        }


        const confirmed =
            window.confirm(
                `Delete "${book.title}" from your library?`
            );


        if (!confirmed) {
            return;
        }


        const state =
            getState();


        state.books =
            state.books.filter(
                item =>
                    String(item.id) !==
                    String(bookId)
            );


        if (
            Array.isArray(
                state.quotes
            )
        ) {

            state.quotes =
                state.quotes.filter(
                    quote =>
                        String(
                            quote.bookId ||
                            quote.book_id ||
                            quote.book ||
                            ""
                        ) !==
                        String(bookId)
                );

        }


        if (
            Array.isArray(
                state.vocabulary
            )
        ) {

            state.vocabulary =
                state.vocabulary.filter(
                    word =>
                        String(
                            word.bookId ||
                            word.book_id ||
                            word.book ||
                            ""
                        ) !==
                        String(bookId)
                );

        }


        saveBooks();


        Novellow.storage
            ?.saveQuotes?.();


        Novellow.storage
            ?.saveVocabulary?.();


        closeDrawer();

        closeReveal();

        refreshConnectedViews();


        showToast(
            "Book deleted.",
            "success"
        );

    }


    /* =====================================================
       REFRESH CONNECTED VIEWS
       ===================================================== */

    function refreshConnectedViews() {

        Novellow.library
            ?.render?.();


        Novellow.reading
            ?.render?.();


        Novellow.journal
            ?.render?.();


        Novellow.quotes
            ?.render?.();


        Novellow.vocabulary
            ?.render?.();


        Novellow.stats
            ?.render?.();

    }


    /* =====================================================
       OVERLAY
       ===================================================== */

    function syncOverlay() {

        const drawerIds = [

            "themeDrawer",

            "settingsDrawer",

            "profileDrawer",

            "shelfDrawer",

            "bookDrawer"

        ];


        const drawerOpen =
            drawerIds.some(
                id => {

                    const element =
                        byId(id);


                    return (
                        element &&
                        !element.hidden
                    );

                }
            );


        const overlay =
            byId(
                "overlay"
            );


        if (overlay) {

            overlay.hidden =
                !drawerOpen;

        }


        document.body
            .classList.toggle(
                "modal-open",
                drawerOpen
            );

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    Novellow.books = {

        init,

        openAddDrawer,

        openEditDrawer,

        closeDrawer,

        openReveal,

        closeReveal,

        deleteBook,

        createShelfBookElement,

        createCoverElement,

        populateShelfSelect,

        updateSpinePreview,

        refreshConnectedViews

    };


    /* =====================================================
       START
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );

    } else {

        init();

    }


})();
