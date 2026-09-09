/* =========================================================
   NOVELLOW
   SAFE STORAGE RECOVERY

   Temporary compatibility migration.
   Does NOT delete any existing data.
   ========================================================= */

(() => {

    "use strict";


    function safelyRead(key) {

        try {

            const raw =
                localStorage.getItem(
                    key
                );


            if (!raw) {
                return [];
            }


            const parsed =
                JSON.parse(
                    raw
                );


            return Array.isArray(
                parsed
            )
                ? parsed
                : [];

        } catch (error) {

            console.warn(
                `Could not read ${key}`,
                error
            );


            return [];

        }

    }


    function safelyWrite(
        key,
        value
    ) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(
                    value
                )
            );

        } catch (error) {

            console.warn(
                `Could not write ${key}`,
                error
            );

        }

    }


    function mergeById(
        ...collections
    ) {

        const merged =
            new Map();


        collections
            .flat()
            .filter(Boolean)
            .forEach(
                item => {

                    const id =
                        item.id ||
                        `legacy-${Math.random()
                            .toString(36)
                            .slice(2)}`;


                    if (
                        !merged.has(
                            id
                        )
                    ) {

                        merged.set(
                            id,
                            item
                        );

                        return;

                    }


                    merged.set(
                        id,
                        {
                            ...merged.get(
                                id
                            ),
                            ...item
                        }
                    );

                }
            );


        return [
            ...merged.values()
        ];

    }


    /* =====================================================
       BOOKS
       ===================================================== */

    const novellowBooks =
        safelyRead(
            "novellow_books"
        );


    const shelfmarkBooks =
        safelyRead(
            "shelfmark_books"
        );


    const recoveredBooks =
        mergeById(
            shelfmarkBooks,
            novellowBooks
        );


    if (
        recoveredBooks.length
    ) {

        safelyWrite(
            "novellow_books",
            recoveredBooks
        );

    }


    /* =====================================================
       SHELVES
       ===================================================== */

    const novellowShelves =
        safelyRead(
            "novellow_shelves"
        );


    const shelfmarkShelves =
        safelyRead(
            "shelfmark_shelves"
        );


    const recoveredShelves =
        mergeById(
            shelfmarkShelves,
            novellowShelves
        );


    if (
        recoveredShelves.length
    ) {

        safelyWrite(
            "novellow_shelves",
            recoveredShelves
        );

    }

})();
/* ========================================================
   NOVELLOW
   BOOKS.JS

   Book creation
   Editing
   Shelf rendering
   Spine preview
   Cover generation
   Book reveal
   Journal handoff
   ========================================================= */

button.addEventListener(
    "click",
    event => {

        event.stopPropagation();


        const bookId =
            book.id;


        getState().selectedBookId =
            bookId;


        Novellow.app
            ?.navigate?.(
                "journal"
            );


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
);
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

    let revealBookId =
        null;


    /* =====================================================
       INIT
       ===================================================== */

    function init() {

        bindBookDrawer();

        bindBookReveal();

        bindProgressHooks();

        bindLivePreview();

        populateShelfSelect();

        updateSpinePreview();

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


    /* =====================================================
       BOOK DRAWER
       ===================================================== */

    function bindBookDrawer() {

        H.bindClick?.(
            "closeBookDrawer",
            closeDrawer
        );


        H.bindClick?.(
            "cancelBookButton",
            closeDrawer
        );


        const form =
            H.getById?.(
                "bookForm"
            );


        if (form) {

            form.addEventListener(
                "submit",
                handleBookSubmit
            );

        }


        const coverUpload =
            H.getById?.(
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
       BOOK REVEAL
       ===================================================== */

    function bindBookReveal() {

        H.bindClick?.(
            "closeBookReveal",
            closeReveal
        );


        H.bindClick?.(
            "editRevealBook",
            () => {

                if (!revealBookId) {
                    return;
                }


                closeReveal();

                openEditDrawer(
                    revealBookId
                );

            }
        );


        H.bindClick?.(
            "openRevealJournal",
            () => {

                if (!revealBookId) {
                    return;
                }


                const bookId =
                    revealBookId;


                closeReveal();


                getState().selectedBookId =
                    bookId;


                Novellow.app
                    ?.navigate?.(
                        "journal"
                    );


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
        );


        const reveal =
            H.getById?.(
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


    /* =====================================================
       PROGRESS HOOKS
       ===================================================== */

    function bindProgressHooks() {

        /*
           Reading owns the progress modal itself.
           This module only exposes helpers used by Reading.
        */

    }


    /* =====================================================
       LIVE PREVIEW
       ===================================================== */

    function bindLivePreview() {

        const ids = [

            "bookTitle",
            "bookStyle",
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
                    H.getById?.(
                        id
                    );


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
       OPEN ADD DRAWER
       ===================================================== */

    function openAddDrawer(
        shelfId =
            ""
    ) {

        resetBookForm();


        H.setText?.(
            "bookDrawerTitle",
            "Add a Book"
        );


        H.setText?.(
            "saveBookButtonLabel",
            "Save Book"
        );


        setValue(
            "editingBookId",
            ""
        );


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

                H.getById?.(
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


        resetBookForm();


        H.setText?.(
            "bookDrawerTitle",
            "Edit Book"
        );


        H.setText?.(
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
            book.shelfId
        );


        setValue(
            "bookShelf",
            book.shelfId
        );


        setValue(
            "bookStatus",
            book.status
        );


        setValue(
            "bookRating",
            book.rating
        );


        setValue(
            "bookTimesRead",
            book.timesRead
        );


        setValue(
            "bookStarted",
            book.started
        );


        setValue(
            "bookFinished",
            book.finished
        );


        setValue(
            "bookCurrentPage",
            book.currentPage
        );


        const design =
            H.normalizeBookDesign?.(
                book.design
            ) ||
            book.design ||
            {};


        setValue(
            "bookStyle",
            design.style ||
            "classic"
        );


        setValue(
            "bookSpineColor",
            design.spineColor ||
            "#793f55"
        );


        setValue(
            "bookTextColor",
            design.textColor ||
            "#f1e3cf"
        );


        setValue(
            "bookAccentColor",
            design.accentColor ||
            "#c39a67"
        );


        setValue(
            "bookSpineOrnament",
            design.ornament ||
            "auto"
        );


        setValue(
            "bookSpineFont",
            design.font ||
            "bookish"
        );


        setValue(
            "bookSpineFontSize",
            design.fontSize ||
            "medium"
        );


        setValue(
            "bookSpineFontWeight",
            design.fontWeight ||
            "regular"
        );


        setValue(
            "bookSpineLetterSpacing",
            design.letterSpacing ||
            "normal"
        );


        setValue(
            "bookSpineCase",
            design.letterCase ||
            "typed"
        );


        setValue(
            "bookSpineFontStyle",
            design.fontStyle ||
            "normal"
        );


        setValue(
            "bookSpineTextAlign",
            design.textAlign ||
            "center"
        );


        setValue(
            "bookSpineTitlePanel",
            design.titlePanel ||
            "none"
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


        getState().pendingCoverData =
            book.cover ||
            "";


        updateSpinePreview();

        openDrawer();

    }


    /* =====================================================
       OPEN DRAWER
       ===================================================== */

    function openDrawer() {

        const drawer =
            H.getById?.(
                "bookDrawer"
            );


        if (!drawer) {
            return;
        }


        drawer.hidden =
            false;


        const overlay =
            H.getById?.(
                "overlay"
            );


        if (overlay) {

            overlay.hidden =
                false;

        }


        document.body.classList.add(
            "modal-open"
        );

    }


    /* =====================================================
       CLOSE DRAWER
       ===================================================== */

    function closeDrawer() {

        const drawer =
            H.getById?.(
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
       RESET FORM
       ===================================================== */

    function resetBookForm() {

        const form =
            H.getById?.(
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
            "0"
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
            "bookStyle",
            defaults.style ||
            "classic"
        );


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


        setValue(
            "bookAccentColor",
            defaults.accentColor ||
            "#c39a67"
        );


        setValue(
            "bookSpineOrnament",
            defaults.ornament ||
            "auto"
        );


        setValue(
            "bookSpineFont",
            defaults.font ||
            "bookish"
        );


        setValue(
            "bookSpineFontSize",
            defaults.fontSize ||
            "medium"
        );


        setValue(
            "bookSpineFontWeight",
            defaults.fontWeight ||
            "regular"
        );


        setValue(
            "bookSpineLetterSpacing",
            defaults.letterSpacing ||
            "normal"
        );


        setValue(
            "bookSpineCase",
            defaults.letterCase ||
            "typed"
        );


        setValue(
            "bookSpineFontStyle",
            defaults.fontStyle ||
            "normal"
        );


        setValue(
            "bookSpineTextAlign",
            defaults.textAlign ||
            "center"
        );


        setValue(
            "bookSpineTitlePanel",
            defaults.titlePanel ||
            "none"
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
       HANDLE SUBMIT
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
                ? H.getBookById?.(
                    editingId
                )
                : null;


        const title =
            value(
                "bookTitle"
            ).trim();


        if (!title) {

            H.showToast?.(
                "Add a title before saving.",
                "error"
            );

            return;

        }


        const now =
            H.nowISO?.() ||
            new Date()
                .toISOString();


        const book =
            H.normalizeBook?.({

                ...existing,

                id:
                    existing?.id ||
                    H.createId?.(
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

                shelfId:
                    value(
                        "bookShelf"
                    ),

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

                cover:
                    state.pendingCoverData ||
                    existing?.cover ||
                    "",

                design:
                    collectBookDesign(),

                journal:
                    existing?.journal,

                createdAt:
                    existing?.createdAt ||
                    now,

                updatedAt:
                    now

            });


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
                        item.id ===
                        existing.id
                );


            if (
                index !== -1
            ) {

                state.books[
                    index
                ] =
                    book;

            }


            H.showToast?.(
                "Book updated.",
                "success"
            );

        } else {

            state.books.push(
                book
            );


            H.showToast?.(
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

        return H.normalizeBookDesign?.({

            style:
                value(
                    "bookStyle"
                ),

            spineColor:
                value(
                    "bookSpineColor"
                ),

            textColor:
                value(
                    "bookTextColor"
                ),

            accentColor:
                value(
                    "bookAccentColor"
                ),

            ornament:
                value(
                    "bookSpineOrnament"
                ),

            font:
                value(
                    "bookSpineFont"
                ),

            fontSize:
                value(
                    "bookSpineFontSize"
                ),

            fontWeight:
                value(
                    "bookSpineFontWeight"
                ),

            letterSpacing:
                value(
                    "bookSpineLetterSpacing"
                ),

            letterCase:
                value(
                    "bookSpineCase"
                ),

            fontStyle:
                value(
                    "bookSpineFontStyle"
                ),

            textAlign:
                value(
                    "bookSpineTextAlign"
                ),

            titlePanel:
                value(
                    "bookSpineTitlePanel"
                ),

            height:
                value(
                    "bookHeight"
                ),

            thickness:
                value(
                    "bookThickness"
                )

        }) || {

            style:
                value(
                    "bookStyle"
                ),

            spineColor:
                value(
                    "bookSpineColor"
                ),

            textColor:
                value(
                    "bookTextColor"
                ),

            accentColor:
                value(
                    "bookAccentColor"
                ),

            ornament:
                value(
                    "bookSpineOrnament"
                ),

            font:
                value(
                    "bookSpineFont"
                ),

            fontSize:
                value(
                    "bookSpineFontSize"
                ),

            fontWeight:
                value(
                    "bookSpineFontWeight"
                ),

            letterSpacing:
                value(
                    "bookSpineLetterSpacing"
                ),

            letterCase:
                value(
                    "bookSpineCase"
                ),

            fontStyle:
                value(
                    "bookSpineFontStyle"
                ),

            textAlign:
                value(
                    "bookSpineTextAlign"
                ),

            titlePanel:
                value(
                    "bookSpineTitlePanel"
                ),

            height:
                value(
                    "bookHeight"
                ),

            thickness:
                value(
                    "bookThickness"
                )

        };

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

            const data =
                await H.fileToDataURL?.(
                    file
                );


            getState().pendingCoverData =
                data ||
                null;


            H.showToast?.(
                "Cover added.",
                "success"
            );

        } catch (
            error
        ) {

            console.error(
                error
            );


            H.showToast?.(
                "That cover could not be loaded.",
                "error"
            );

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
            H.applyTextCase?.(
                book.title ||
                "Untitled",
                design.letterCase
            ) ||
            book.title ||
            "Untitled";


        const ornament =
            H.getOrnamentSymbol?.(
                design.ornament,
                design.style
            ) ||
            "";


        button.innerHTML =
            `
                <span
                    class="binding-band top"
                    aria-hidden="true"
                ></span>

                <span class="spine-inner">

                    <span class="spine-title-panel">

                        <span class="spine-title">
                            ${escape(
                                title
                            )}
                        </span>

                    </span>

                    <span
                        class="spine-ornament"
                        aria-hidden="true"
                    >
                        ${escape(
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

        event.stopPropagation();


        const bookId =
            book.id;


        getState().selectedBookId =
            bookId;


        Novellow.app
            ?.navigate?.(
                "journal"
            );


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
);


        return button;

    }


    /* =====================================================
       BOOK CLASS LIST
       ===================================================== */

    function buildBookClassList(
        design,
        preview =
            false
    ) {

        const classes = [
            preview
                ? "spine-preview-book"
                : "book-spine"
        ];


        if (!preview) {

            classes.push(
                `book-style-${design.style || "classic"}`
            );


            classes.push(
                `book-height-${design.height || "medium"}`
            );


            classes.push(
                `book-thickness-${design.thickness || "medium"}`
            );


            classes.push(
                `book-font-${design.font || "bookish"}`
            );


            classes.push(
                `book-font-size-${design.fontSize || "medium"}`
            );


            classes.push(
                `book-font-weight-${design.fontWeight || "regular"}`
            );


            classes.push(
                `book-letter-spacing-${design.letterSpacing || "normal"}`
            );


            classes.push(
                `book-font-style-${design.fontStyle || "normal"}`
            );


            classes.push(
                `book-text-align-${design.textAlign || "center"}`
            );


            classes.push(
                `book-title-panel-${design.titlePanel || "none"}`
            );

        }


        return classes.join(
            " "
        );

    }


    /* =====================================================
       SPINE PREVIEW
       ===================================================== */

    function updateSpinePreview() {

        const preview =
            H.getById?.(
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


        const title =
            H.applyTextCase?.(
                value(
                    "bookTitle"
                ) ||
                "Book Title",
                design.letterCase
            ) ||
            value(
                "bookTitle"
            ) ||
            "Book Title";


        H.setText?.(
            "bookSpinePreviewTitle",
            title
        );


        H.setText?.(
            "bookSpinePreviewOrnament",
            H.getOrnamentSymbol?.(
                design.ornament,
                design.style
            ) ||
            ""
        );


        const titlePanel =
            H.getById?.(
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


        const previewTitle =
            H.getById?.(
                "bookSpinePreviewTitle"
            );


        if (previewTitle) {

            previewTitle.style.fontStyle =
                design.fontStyle ===
                    "italic"
                    ? "italic"
                    : "normal";


            previewTitle.style.fontWeight =
                mapFontWeight(
                    design.fontWeight
                );


            previewTitle.style.letterSpacing =
                mapLetterSpacing(
                    design.letterSpacing
                );


            previewTitle.style.fontSize =
                mapFontSize(
                    design.fontSize
                );


            previewTitle.style.fontFamily =
                mapPreviewFont(
                    design.font
                );

        }

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


        wrapper.style.width =
            "100%";


        wrapper.style.height =
            "100%";


        if (
            book.cover
        ) {

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "cover-image";


            image.src =
                book.cover;


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
                    ${escape(
                        book.title ||
                        "Untitled Book"
                    )}
                </div>

                <div class="generated-cover-author">
                    ${escape(
                        book.author ||
                        ""
                    )}
                </div>

                <div
                    class="generated-cover-ornament"
                    aria-hidden="true"
                >
                    ${escape(
                        H.getOrnamentSymbol?.(
                            design.ornament,
                            design.style
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
       OPEN REVEAL
       ===================================================== */

    function openReveal(
        bookId
    ) {

        const book =
            H.getBookById?.(
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
            H.getById?.(
                "bookReveal"
            );


        if (!reveal) {
            return;
        }


        const cover =
            H.getById?.(
                "revealBookCover"
            );


        if (cover) {

            cover.innerHTML =
                "";


            const coverElement =
                createCoverElement(
                    book
                );


            cover.appendChild(
                coverElement
            );

        }


        H.setText?.(
            "revealBookStatus",
            H.getStatusName?.(
                book.status
            ) ||
            "Book"
        );


        H.setText?.(
            "revealBookTitle",
            book.title ||
            "Untitled Book"
        );


        H.setText?.(
            "revealBookAuthor",
            book.author ||
            "Unknown author"
        );


        H.setText?.(
            "revealBookStarted",
            H.formatDate?.(
                book.started
            ) ||
            "—"
        );


        H.setText?.(
            "revealBookFinished",
            H.formatDate?.(
                book.finished
            ) ||
            "—"
        );


        H.setText?.(
            "revealBookPages",
            book.pages
                ? String(
                    book.pages
                )
                : "—"
        );


        H.setText?.(
            "revealBookRating",
            formatRating(
                book.rating
            )
        );


        const percent =
            H.calculatePercent?.(
                book.currentPage,
                book.pages
            ) || 0;


        H.setText?.(
            "revealBookPercent",
            `${percent}%`
        );


        const fill =
            H.getById?.(
                "revealBookProgress"
            );


        if (fill) {

            fill.style.width =
                `${percent}%`;

        }


        reveal.hidden =
            false;


        document.body.classList.add(
            "modal-open"
        );

    }


    /* =====================================================
       CLOSE REVEAL
       ===================================================== */

    function closeReveal() {

        const reveal =
            H.getById?.(
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
            H.getBookById?.(
                bookId
            );


        if (!book) {
            return;
        }


        const confirmed =
            H.confirmAction?.(
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
                    item.id !==
                    bookId
            );


        /*
           Remove associated quotes and vocabulary as well so
           orphaned records do not remain.
        */

        if (
            Array.isArray(
                state.quotes
            )
        ) {

            state.quotes =
                state.quotes.filter(
                    quote =>
                        quote.bookId !==
                            bookId &&
                        quote.book !==
                            bookId
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
                        word.bookId !==
                            bookId &&
                        word.book !==
                            bookId
                );

        }


        Novellow.storage
            ?.saveBooks?.();


        Novellow.storage
            ?.saveQuotes?.();


        Novellow.storage
            ?.saveVocabulary?.();


        if (
            getState()
                .selectedBookId ===
            bookId
        ) {

            getState()
                .selectedBookId =
                null;

        }


        if (
            revealBookId ===
            bookId
        ) {

            closeReveal();

        }


        refreshConnectedViews();


        H.showToast?.(
            "Book deleted.",
            "success"
        );

    }


    /* =====================================================
       POPULATE SHELF SELECT
       ===================================================== */

    function populateShelfSelect(
        selectedId =
            ""
    ) {

        if (
            Novellow.library
                ?.populateShelfSelect
        ) {

            Novellow.library
                .populateShelfSelect(
                    selectedId
                );

            return;

        }


        const select =
            H.getById?.(
                "bookShelf"
            );


        if (!select) {
            return;
        }


        const shelves =
            Array.isArray(
                getState().shelves
            )
                ? getState().shelves
                : [];


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
                    shelf.id ===
                    previous
            )
        ) {

            select.value =
                previous;

        }

    }


    /* =====================================================
       SAVE BOOKS
       ===================================================== */

    function saveBooks() {

        Novellow.storage
            ?.saveBooks?.();

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
       OVERLAY / BODY LOCK
       ===================================================== */

    function syncOverlay() {

        const panelIds = [

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
            panelIds.some(
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


        const overlay =
            H.getById?.(
                "overlay"
            );


        if (overlay) {

            const drawerOpen =
                [
                    "themeDrawer",
                    "settingsDrawer",
                    "shelfDrawer",
                    "bookDrawer"
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


            overlay.hidden =
                !drawerOpen;

        }


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
       FORMATTING
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


        if (!value) {

            return "Not rated";

        }


        return "★".repeat(
            value
        );

    }


    function mapFontWeight(
        weight
    ) {

        const map = {

            light:
                "300",

            regular:
                "500",

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
                "var(--font-book)",

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
                "var(--font-display)",

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
            "var(--font-book)"
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


})();
/* =========================================================
   NOVELLOW
   ADD BOOK BUTTON SAFETY PATCH
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const addBookButtons = [
            "headerAddBook",
            "libraryAddBook",
            "emptyAddBook",
            "mobileAddBook",
            "readingAddBook"
        ];


        function safelyOpenAddBook() {

            console.log(
                "Novellow: opening Add Book drawer"
            );


            /*
               Use the normal books module first.
            */

            if (
                window.NOVELLOW?.books?.openAddDrawer
            ) {

                try {

                    window.NOVELLOW
                        .books
                        .openAddDrawer();

                    return;

                } catch (error) {

                    console.error(
                        "Normal Add Book opener failed:",
                        error
                    );

                }

            }


            /*
               Fallback:
               open the actual drawer directly.
            */

            const drawer =
                document.getElementById(
                    "bookDrawer"
                );


            const overlay =
                document.getElementById(
                    "overlay"
                );


            if (!drawer) {

                console.error(
                    "bookDrawer was not found."
                );

                return;

            }


            /*
               Reset the form for a new book.
            */

            const form =
                document.getElementById(
                    "bookForm"
                );


            if (form) {

                form.reset();

            }


            const editingId =
                document.getElementById(
                    "editingBookId"
                );


            if (editingId) {

                editingId.value =
                    "";

            }


            const title =
                document.getElementById(
                    "bookDrawerTitle"
                );


            if (title) {

                title.textContent =
                    "Add a Book";

            }


            const saveLabel =
                document.getElementById(
                    "saveBookButtonLabel"
                );


            if (saveLabel) {

                saveLabel.textContent =
                    "Save Book";

            }


            /*
               Populate shelf dropdown manually if needed.
            */

            const shelfSelect =
                document.getElementById(
                    "bookShelf"
                );


            if (shelfSelect) {

                const shelves =
                    window.NOVELLOW
                        ?.state
                        ?.shelves ||
                    [];


                shelfSelect.innerHTML =
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


                shelfSelect.appendChild(
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


                        shelfSelect.appendChild(
                            option
                        );

                    }
                );

            }


            drawer.hidden =
                false;


            if (overlay) {

                overlay.hidden =
                    false;

            }


            document.body.classList.add(
                "modal-open"
            );


            requestAnimationFrame(
                () => {

                    document
                        .getElementById(
                            "bookTitle"
                        )
                        ?.focus();

                }
            );

        }


        addBookButtons.forEach(
            id => {

                const button =
                    document.getElementById(
                        id
                    );


                if (!button) {
                    return;
                }


                /*
                   Replace the button node so any broken or duplicate
                   click listeners attached previously are discarded.
                */

                const replacement =
                    button.cloneNode(
                        true
                    );


                button.replaceWith(
                    replacement
                );


                replacement.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();

                        safelyOpenAddBook();

                    }
                );

            }
        );

    }
);
