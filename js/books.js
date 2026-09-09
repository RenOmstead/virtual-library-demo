/* =========================================================
   NOVELLOW
   BOOKS.JS
   Version 15

   Book creation
   Book editing
   Book deletion
   Shelf rendering
   Full spine designer
   Cover generation
   Book reveal
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


    const H =
        Novellow.helpers ||
        {};


    let initialized =
        false;


    let revealBookId =
        null;


    /* =====================================================
       BASIC HELPERS
       ===================================================== */

    function byId(id) {

        return document.getElementById(
            id
        );

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

        if (
            H.getBookById
        ) {

            const found =
                H.getBookById(
                    bookId
                );


            if (found) {

                return found;

            }

        }


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
            typeof H.createId ===
            "function"
        ) {

            return H.createId(
                prefix
            );

        }


        if (
            window.crypto &&
            typeof window.crypto.randomUUID ===
                "function"
        ) {

            return window.crypto
                .randomUUID();

        }


        return (
            `${prefix}-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 10)}`
        );

    }


    function nowISO() {

        return (
            H.nowISO?.() ||
            new Date()
                .toISOString()
        );

    }


    function escapeHTML(input) {

        if (
            typeof H.escapeHTML ===
            "function"
        ) {

            return H.escapeHTML(
                String(
                    input ??
                    ""
                )
            );

        }


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
            typeof H.showToast ===
            "function"
        ) {

            H.showToast(
                message,
                type
            );

            return;

        }


        const toast =
            byId(
                "toast"
            );


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


        clearTimeout(
            showToast.timeout
        );


        showToast.timeout =
            setTimeout(
                () => {

                    toast.hidden =
                        true;

                },
                2500
            );

    }


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    function init() {

        if (initialized) {

            return;

        }


        initialized =
            true;


        bindBookDrawer();

        bindBookReveal();

        bindLivePreview();

        populateShelfSelect();

        updateSpinePreview();

    }


    /* =====================================================
       BOOK DRAWER
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


        const coverUpload =
            byId(
                "bookCoverUpload"
            );


        if (coverUpload) {

            coverUpload.addEventListener(
                "change",
                handleCoverUpload
            );

        }

    }


    /* =====================================================
       OPEN ADD BOOK
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
       OPEN EDIT BOOK
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
            book.year ??
            book.publication_year ??
            ""
        );


        setValue(
            "bookPages",
            book.pages ??
            book.total_pages ??
            ""
        );


        setValue(
            "bookISBN",
            book.isbn ||
            book.ISBN ||
            ""
        );


        setValue(
            "bookSeries",
            book.series ||
            ""
        );


        const shelfId =
            book.shelfId ||
            book.shelf_id ||
            "";


        populateShelfSelect(
            shelfId
        );


        setValue(
            "bookShelf",
            shelfId
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
            book.timesRead ??
            book.times_read ??
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
            book.currentPage ??
            book.current_page ??
            0
        );


        getState().pendingCoverData =
            book.cover ||
            book.cover_url ||
            "";


        populateDesignFields(
            book.design ||
            {}
        );


        updateSpinePreview();


        const deleteButton =
            byId(
                "deleteBookButton"
            );


        if (deleteButton) {

            deleteButton.hidden =
                false;

        }


        openDrawer();

    }


    /* =====================================================
       DRAWER OPEN / CLOSE
       ===================================================== */

    function openDrawer() {

        const drawer =
            byId(
                "bookDrawer"
            );


        if (!drawer) {

            console.error(
                "Novellow: bookDrawer was not found."
            );

            return;

        }


        drawer.hidden =
            false;


        drawer.style.pointerEvents =
            "auto";


        const overlay =
            byId(
                "overlay"
            );


        if (overlay) {

            overlay.hidden =
                false;


            overlay.style.pointerEvents =
                "auto";

        }


        document.body.classList.add(
            "modal-open"
        );

    }


    function closeDrawer() {

        const drawer =
            byId(
                "bookDrawer"
            );


        if (drawer) {

            drawer.hidden =
                true;

        }


        getState().pendingCoverData =
            null;


        syncOverlay();

    }


    /* =====================================================
       RESET BOOK FORM
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


        getState().pendingCoverData =
            null;

    }


    /* =====================================================
       FULL DEFAULT SPINE DESIGN
       ===================================================== */

    function applyDefaultDesign() {

        const defaults =
            Novellow.config
                ?.defaultBookDesign ||
            window.NOVELLOW_CONFIG
                ?.defaultBookDesign ||
            {};


        populateDesignFields(
            {

                style:
                    defaults.style ||
                    "classic",

                spineColor:
                    defaults.spineColor ||
                    "#793f55",

                textColor:
                    defaults.textColor ||
                    "#f1e3cf",

                accentColor:
                    defaults.accentColor ||
                    "#c39a67",

                ornament:
                    defaults.ornament ||
                    "auto",

                font:
                    defaults.font ||
                    "bookish",

                fontSize:
                    defaults.fontSize ||
                    "medium",

                fontWeight:
                    defaults.fontWeight ||
                    "regular",

                letterSpacing:
                    defaults.letterSpacing ||
                    "normal",

                letterCase:
                    defaults.letterCase ||
                    "typed",

                fontStyle:
                    defaults.fontStyle ||
                    "normal",

                textAlign:
                    defaults.textAlign ||
                    "center",

                titlePanel:
                    defaults.titlePanel ||
                    "none",

                height:
                    defaults.height ||
                    "medium",

                thickness:
                    defaults.thickness ||
                    "medium"

            }
        );

    }


    function populateDesignFields(
        design
    ) {

        const normalized =
            H.normalizeBookDesign?.(
                design
            ) ||
            design ||
            {};


        setValue(
            "bookStyle",
            normalized.style ||
            "classic"
        );


        setValue(
            "bookSpineStyle",
            normalized.style ||
            "classic"
        );


        setValue(
            "bookSpineColor",
            normalized.spineColor ||
            normalized.spine_color ||
            "#793f55"
        );


        setValue(
            "bookTextColor",
            normalized.textColor ||
            normalized.text_color ||
            "#f1e3cf"
        );


        setValue(
            "bookAccentColor",
            normalized.accentColor ||
            normalized.accent_color ||
            "#c39a67"
        );


        setValue(
            "bookSpineOrnament",
            normalized.ornament ||
            "auto"
        );


        setValue(
            "bookSpineFont",
            normalized.font ||
            "bookish"
        );


        setValue(
            "bookSpineFontSize",
            normalized.fontSize ||
            "medium"
        );


        setValue(
            "bookSpineFontWeight",
            normalized.fontWeight ||
            "regular"
        );


        setValue(
            "bookSpineLetterSpacing",
            normalized.letterSpacing ||
            "normal"
        );


        setValue(
            "bookSpineCase",
            normalized.letterCase ||
            "typed"
        );


        setValue(
            "bookSpineFontStyle",
            normalized.fontStyle ||
            "normal"
        );


        setValue(
            "bookSpineTextAlign",
            normalized.textAlign ||
            "center"
        );


        setValue(
            "bookSpineTitlePanel",
            normalized.titlePanel ||
            "none"
        );


        setValue(
            "bookHeight",
            normalized.height ||
            "medium"
        );


        setValue(
            "bookThickness",
            normalized.thickness ||
            "medium"
        );

    }


    /* =====================================================
       BOOK SUBMIT
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


        const shelfId =
            value(
                "bookShelf"
            );


        const now =
            nowISO();


        const bookData = {

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

            publication_year:
                value(
                    "bookYear"
                )
                    ? Number(
                        value(
                            "bookYear"
                        )
                    )
                    : null,

            pages:
                Number(
                    value(
                        "bookPages"
                    )
                ) || 0,

            total_pages:
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

            /*
               Keep both names while the old frontend
               and new Supabase schema coexist.
            */

            shelfId,

            shelf_id:
                shelfId ||
                null,

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

            times_read:
                Number(
                    value(
                        "bookTimesRead"
                    )
                ) || 0,

            started:
                value(
                    "bookStarted"
                ),

            started_at:
                value(
                    "bookStarted"
                ) ||
                null,

            finished:
                value(
                    "bookFinished"
                ),

            finished_at:
                value(
                    "bookFinished"
                ) ||
                null,

            currentPage:
                Number(
                    value(
                        "bookCurrentPage"
                    )
                ) || 0,

            current_page:
                Number(
                    value(
                        "bookCurrentPage"
                    )
                ) || 0,

            cover:
                state.pendingCoverData ||
                existing?.cover ||
                existing?.cover_url ||
                "",

            cover_url:
                existing?.cover_url ||
                "",

            design:
                collectBookDesign(),

            journal:
                existing?.journal ||
                {},

            createdAt:
                existing?.createdAt ||
                existing?.created_at ||
                now,

            updatedAt:
                now

        };


        const book =
            H.normalizeBook?.(
                bookData
            ) ||
            bookData;


        /*
           Make absolutely sure shelf identity survives
           normalization.
        */

        book.shelfId =
            shelfId;


        book.shelf_id =
            shelfId ||
            null;


        if (
            !Array.isArray(
                state.books
            )
        ) {

            state.books =
                [];

        }


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
       FULL SPINE DESIGN COLLECTION
       ===================================================== */

    function collectBookDesign() {

        const rawDesign = {

            style:
                value(
                    "bookStyle"
                ) ||
                value(
                    "bookSpineStyle"
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
                "bookish",

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


        return (
            H.normalizeBookDesign?.(
                rawDesign
            ) ||
            rawDesign
        );

    }


    /* =====================================================
       LIVE SPINE PREVIEW
       ===================================================== */

    function bindLivePreview() {

        const ids = [

            "bookTitle",

            "bookStyle",

            "bookSpineStyle",

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


        preview.style.setProperty(
            "--book-color",
            design.spineColor ||
            "#793f55"
        );


        preview.style.setProperty(
            "--book-text",
            design.textColor ||
            "#f1e3cf"
        );


        preview.style.setProperty(
            "--book-accent",
            design.accentColor ||
            "#c39a67"
        );


        preview.dataset.style =
            design.style ||
            "classic";


        preview.dataset.height =
            design.height ||
            "medium";


        preview.dataset.thickness =
            design.thickness ||
            "medium";


        preview.dataset.font =
            design.font ||
            "bookish";


        preview.dataset.fontSize =
            design.fontSize ||
            "medium";


        preview.dataset.fontWeight =
            design.fontWeight ||
            "regular";


        preview.dataset.letterSpacing =
            design.letterSpacing ||
            "normal";


        preview.dataset.fontStyle =
            design.fontStyle ||
            "normal";


        preview.dataset.textAlign =
            design.textAlign ||
            "center";


        preview.dataset.titlePanel =
            design.titlePanel ||
            "none";


        const rawTitle =
            value(
                "bookTitle"
            ) ||
            "Book Title";


        const title =
            applyTextCase(
                rawTitle,
                design.letterCase
            );


        const titleElement =
            byId(
                "bookSpinePreviewTitle"
            );


        if (titleElement) {

            titleElement.textContent =
                title;


            titleElement.style.fontFamily =
                mapPreviewFont(
                    design.font
                );


            titleElement.style.fontSize =
                mapFontSize(
                    design.fontSize
                );


            titleElement.style.fontWeight =
                mapFontWeight(
                    design.fontWeight
                );


            titleElement.style.letterSpacing =
                mapLetterSpacing(
                    design.letterSpacing
                );


            titleElement.style.fontStyle =
                design.fontStyle ===
                    "italic"
                    ? "italic"
                    : "normal";


            titleElement.style.textAlign =
                design.textAlign ||
                "center";

        }


        const ornament =
            byId(
                "bookSpinePreviewOrnament"
            );


        if (ornament) {

            ornament.textContent =
                getOrnament(
                    design
                );

        }


        const titlePanel =
            byId(
                "bookSpinePreviewTitlePanel"
            );


        if (titlePanel) {

            titlePanel.className =
                "spine-preview-title-panel";


            if (
                design.titlePanel &&
                design.titlePanel !==
                    "none"
            ) {

                titlePanel.classList.add(
                    `preview-panel-${design.titlePanel}`
                );

            }

        }

    }


    /* =====================================================
       COVER UPLOAD
       ===================================================== */

    async function handleCoverUpload(
        event
    ) {

        const file =
            event.target
                ?.files
                ?.[0];


        if (!file) {

            return;

        }


        try {

            let data =
                null;


            if (
                typeof H.fileToDataURL ===
                "function"
            ) {

                data =
                    await H.fileToDataURL(
                        file
                    );

            } else {

                data =
                    await fileToDataURL(
                        file
                    );

            }


            getState().pendingCoverData =
                data ||
                null;


            showToast(
                "Cover added.",
                "success"
            );

        } catch (error) {

            console.error(
                "Novellow cover upload failed:",
                error
            );


            showToast(
                "That cover could not be loaded.",
                "error"
            );

        }

    }


    function fileToDataURL(file) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                const reader =
                    new FileReader();


                reader.onload =
                    () =>
                        resolve(
                            reader.result
                        );


                reader.onerror =
                    reject;


                reader.readAsDataURL(
                    file
                );

            }
        );

    }


    /* =====================================================
       SHELF SELECT
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


        const none =
            document.createElement(
                "option"
            );


        none.value =
            "";


        none.textContent =
            shelves.length
                ? "No shelf"
                : "Create a shelf first";


        select.appendChild(
            none
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
                    String(
                        shelf.id
                    ) ===
                    String(
                        previous
                    )
            )
        ) {

            select.value =
                previous;

        }

    }


    /* =====================================================
       CREATE SHELF BOOK ELEMENT
       ===================================================== */

    function createShelfBookElement(
        book
    ) {

        const design =
            H.normalizeBookDesign?.(
                book.design
            ) ||
            book.design ||
            {};


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            buildBookClassList(
                design
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


        const title =
            applyTextCase(
                book.title ||
                "Untitled",
                design.letterCase
            );


        const ornament =
            getOrnament(
                design
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
                                title
                            )}
                        </span>

                    </span>

                    <span
                        class="spine-ornament"
                        aria-hidden="true"
                    >
                        ${escapeHTML(
                            ornament
                        )}
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


                getState().selectedBookId =
                    book.id;


                navigateToJournal(
                    book.id
                );

            }
        );


        return button;

    }


    function buildBookClassList(
        design
    ) {

        return [

            "book-spine",

            `book-style-${design.style || "classic"}`,

            `book-height-${design.height || "medium"}`,

            `book-thickness-${design.thickness || "medium"}`,

            `book-font-${design.font || "bookish"}`,

            `book-font-size-${design.fontSize || "medium"}`,

            `book-font-weight-${design.fontWeight || "regular"}`,

            `book-letter-spacing-${design.letterSpacing || "normal"}`,

            `book-font-style-${design.fontStyle || "normal"}`,

            `book-text-align-${design.textAlign || "center"}`,

            `book-title-panel-${design.titlePanel || "none"}`

        ].join(
            " "
        );

    }


    /* =====================================================
       GENERATED COVER
       ===================================================== */

    function createCoverElement(
        book
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.style.width =
            "100%";


        wrapper.style.height =
            "100%";


        const cover =
            book.cover ||
            book.cover_url;


        if (cover) {

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "cover-image";


            image.src =
                cover;


            image.alt =
                `${book.title || "Book"} cover`;


            wrapper.appendChild(
                image
            );


            return wrapper;

        }


        const design =
            H.normalizeBookDesign?.(
                book.design
            ) ||
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
                    ${escapeHTML(
                        getOrnament(
                            design
                        ) ||
                        "✦"
                    )}
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

        bindFirstAvailable(
            [
                "closeBookReveal"
            ],
            closeReveal
        );


        bindFirstAvailable(
            [
                "bookRevealEdit",
                "editRevealBook"
            ],
            () => {

                if (
                    !revealBookId
                ) {

                    return;

                }


                const id =
                    revealBookId;


                closeReveal();

                openEditDrawer(
                    id
                );

            }
        );


        bindFirstAvailable(
            [
                "bookRevealOpenJournal",
                "openRevealJournal"
            ],
            () => {

                if (
                    !revealBookId
                ) {

                    return;

                }


                navigateToJournal(
                    revealBookId
                );

            }
        );


        const reveal =
            byId(
                "bookReveal"
            );


        if (reveal) {

            reveal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        reveal
                    ) {

                        closeReveal();

                    }

                }
            );

        }

    }


    function bindFirstAvailable(
        ids,
        callback
    ) {

        ids.forEach(
            id => {

                const element =
                    byId(id);


                if (!element) {

                    return;

                }


                element.addEventListener(
                    "click",
                    callback
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


        getState().selectedBookId =
            book.id;


        const reveal =
            byId(
                "bookReveal"
            );


        if (!reveal) {

            navigateToJournal(
                book.id
            );

            return;

        }


        const cover =
            byId(
                "bookRevealCover"
            ) ||
            byId(
                "revealBookCover"
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


        setCompatibleText(
            [
                "bookRevealStatus",
                "revealBookStatus"
            ],
            formatStatus(
                book.status
            )
        );


        setCompatibleText(
            [
                "bookRevealTitle",
                "revealBookTitle"
            ],
            book.title ||
            "Untitled Book"
        );


        setCompatibleText(
            [
                "bookRevealAuthor",
                "revealBookAuthor"
            ],
            book.author ||
            "Unknown author"
        );


        reveal.hidden =
            false;


        document.body.classList.add(
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


    function setCompatibleText(
        ids,
        text
    ) {

        ids.forEach(
            id => {

                if (
                    byId(id)
                ) {

                    setText(
                        id,
                        text
                    );

                }

            }
        );

    }


    /* =====================================================
       JOURNAL HANDOFF
       ===================================================== */

    function navigateToJournal(
        bookId
    ) {

        getState().selectedBookId =
            bookId;


        /*
           Current app.js exposes navigateTo.
           Older code sometimes exposed navigate.
           Support both during rebuild.
        */

        if (
            typeof Novellow.app
                ?.navigateTo ===
            "function"
        ) {

            Novellow.app.navigateTo(
                "journal"
            );

        } else if (
            typeof Novellow.app
                ?.navigate ===
            "function"
        ) {

            Novellow.app.navigate(
                "journal"
            );

        } else if (
            typeof Novellow.navigation
                ?.navigateTo ===
            "function"
        ) {

            Novellow.navigation.navigateTo(
                "journal"
            );

        }


        requestAnimationFrame(
            () => {

                Novellow.journal
                    ?.openBook?.(
                        bookId,
                        "overview"
                    );

            }
        );

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
            H.confirmAction
                ? H.confirmAction(
                    `Delete "${book.title}" from your library?`
                )
                : window.confirm(
                    `Delete "${book.title}" from your library?`
                );


        if (!confirmed) {

            return;

        }


        const state =
            getState();


        state.books =
            getBooks().filter(
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


        if (
            String(
                state.selectedBookId
            ) ===
            String(bookId)
        ) {

            state.selectedBookId =
                null;

        }


        closeDrawer();

        closeReveal();

        refreshConnectedViews();


        showToast(
            "Book deleted.",
            "success"
        );

    }


    /* =====================================================
       SAVE BOOKS
       ===================================================== */

    function saveBooks() {

        if (
            typeof Novellow.storage
                ?.saveBooks ===
            "function"
        ) {

            Novellow.storage
                .saveBooks();

            return;

        }


        try {

            localStorage.setItem(
                "novellow_books",
                JSON.stringify(
                    getBooks()
                )
            );

        } catch (error) {

            console.error(
                "Novellow could not save books.",
                error
            );

        }

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

        const panelIds = [

            "themeDrawer",

            "settingsDrawer",

            "profileDrawer",

            "shelfDrawer",

            "bookDrawer"

        ];


        const anyDrawerOpen =
            panelIds.some(
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
                !anyDrawerOpen;


            overlay.style.pointerEvents =
                anyDrawerOpen
                    ? "auto"
                    : "none";

        }


        document.body.classList.toggle(
            "modal-open",
            anyDrawerOpen
        );

    }


    /* =====================================================
       TEXT CASE
       ===================================================== */

    function applyTextCase(
        text,
        letterCase
    ) {

        if (
            typeof H.applyTextCase ===
            "function"
        ) {

            return H.applyTextCase(
                text,
                letterCase
            );

        }


        switch (
            letterCase
        ) {

            case "uppercase":

                return text
                    .toUpperCase();


            case "lowercase":

                return text
                    .toLowerCase();


            case "title":

                return text
                    .toLowerCase()
                    .replace(
                        /\b\w/g,
                        character =>
                            character
                                .toUpperCase()
                    );


            default:

                return text;

        }

    }


    /* =====================================================
       ORNAMENTS
       ===================================================== */

    function getOrnament(
        design
    ) {

        if (
            typeof H.getOrnamentSymbol ===
            "function"
        ) {

            return (
                H.getOrnamentSymbol(
                    design.ornament,
                    design.style
                ) ||
                ""
            );

        }


        const ornament =
            design.ornament;


        const map = {

            none:
                "",

            star:
                "✦",

            diamond:
                "◆",

            moon:
                "☾",

            flower:
                "❀",

            cross:
                "✣",

            flourish:
                "❦",

            dot:
                "•"

        };


        if (
            ornament &&
            ornament !==
                "auto"
        ) {

            return (
                map[
                    ornament
                ] ||
                ornament
            );

        }


        const styleMap = {

            classic:
                "✦",

            cloth:
                "◆",

            ornate:
                "❦",

            paperback:
                "•",

            modern:
                "◇",

            gothic:
                "✣",

            vintage:
                "❧",

            deco:
                "◆",

            retro:
                "★"

        };


        return (
            styleMap[
                design.style
            ] ||
            "✦"
        );

    }


    /* =====================================================
       FONT MAPPING
       ===================================================== */

    function mapFontWeight(
        weight
    ) {

        const map = {

            light:
                "300",

            regular:
                "500",

            medium:
                "600",

            bold:
                "700",

            heavy:
                "800"

        };


        return (
            map[
                weight
            ] ||
            "500"
        );

    }


    function mapLetterSpacing(
        spacing
    ) {

        const map = {

            tight:
                "-0.04em",

            normal:
                "0",

            wide:
                "0.08em",

            "extra-wide":
                "0.15em"

        };


        return (
            map[
                spacing
            ] ||
            "0"
        );

    }


    function mapFontSize(
        size
    ) {

        const map = {

            small:
                "0.60rem",

            medium:
                "0.72rem",

            large:
                "0.84rem",

            xlarge:
                "0.96rem"

        };


        return (
            map[
                size
            ] ||
            "0.72rem"
        );

    }


    function mapPreviewFont(
        font
    ) {

        const map = {

            serif:
                "Georgia, 'Times New Roman', serif",

            roman:
                "'Times New Roman', Georgia, serif",

            bookish:
                "var(--font-book, 'Cormorant Garamond', Georgia, serif)",

            elegant:
                "'Cormorant Garamond', Georgia, serif",

            typewriter:
                "'Courier New', monospace",

            clean:
                "Arial, Helvetica, sans-serif",

            condensed:
                "'Arial Narrow', Arial, sans-serif",

            heavy:
                "Impact, Haettenschweiler, sans-serif",

            storybook:
                "var(--font-display, 'Cormorant Garamond', Georgia, serif)",

            handwritten:
                "'Comic Sans MS', 'Bradley Hand', cursive",

            gothic:
                "Georgia, serif",

            deco:
                "'Arial Narrow', Arial, sans-serif",

            retro:
                "'Courier New', monospace"

        };


        return (
            map[
                font
            ] ||
            "var(--font-book, Georgia, serif)"
        );

    }


    /* =====================================================
       STATUS
       ===================================================== */

    function formatStatus(
        status
    ) {

        if (
            typeof H.getStatusName ===
            "function"
        ) {

            return (
                H.getStatusName(
                    status
                ) ||
                "Book"
            );

        }


        const map = {

            want:
                "Want to Read",

            reading:
                "Currently Reading",

            paused:
                "Paused",

            finished:
                "Finished",

            dnf:
                "Did Not Finish",

            reference:
                "Reference"

        };


        return (
            map[
                status
            ] ||
            "Book"
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

        collectBookDesign,

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
