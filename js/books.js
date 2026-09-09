/* =========================================================
   NOVELLOW
   BOOKS.JS

   Book creation
   Book editing
   Book deletion
   Shelf spine rendering
   Live spine preview
   Cover handling
   Book reveal
   ========================================================= */


(() => {

    "use strict";


    /* =====================================================
       CONFIG / HELPERS / STATE
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

    let pendingCoverData =
        "";


    /* =====================================================
       INIT
       ===================================================== */

    function init() {

        bindBookControls();

        bindPreviewControls();

        populateShelfSelect();

        updatePreviewFromForm();

    }


    /* =====================================================
       STATE ACCESS
       ===================================================== */

    function getState() {

        return Novellow.state;

    }


    /* =====================================================
       BIND BOOK CONTROLS
       ===================================================== */

    function bindBookControls() {

        H.bindClick?.(
            "closeBookDrawer",
            closeBookDrawer
        );


        H.bindClick?.(
            "cancelBookButton",
            closeBookDrawer
        );


        H.bindClick?.(
            "closeBookReveal",
            closeReveal
        );


        H.bindClick?.(
            "editRevealBook",
            editSelectedBook
        );


        H.bindClick?.(
            "openRevealJournal",
            openSelectedJournal
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


        const coverInput =
            H.getById?.(
                "bookCoverUpload"
            );


        if (coverInput) {

            coverInput.addEventListener(
                "change",
                handleCoverUpload
            );

        }

    }


    /* =====================================================
       PREVIEW CONTROL BINDING
       ===================================================== */

    function bindPreviewControls() {

        [
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
        ].forEach(
            id => {

                const element =
                    H.getById?.(
                        id
                    );


                if (!element) {
                    return;
                }


                const eventName =
                    element.tagName ===
                    "INPUT"
                        ? "input"
                        : "change";


                element.addEventListener(
                    eventName,
                    updatePreviewFromForm
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


        populateShelfSelect(
            shelfId
        );


        if (shelfId) {

            setInputValue(
                "bookShelf",
                shelfId
            );

        }


        Novellow.panels?.openPanel?.(
            "bookDrawer"
        );


        updatePreviewFromForm();


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


        setInputValue(
            "editingBookId",
            book.id
        );


        setInputValue(
            "bookTitle",
            book.title
        );


        setInputValue(
            "bookAuthor",
            book.author
        );


        setInputValue(
            "bookGenre",
            book.genre
        );


        setInputValue(
            "bookYear",
            book.year
        );


        setInputValue(
            "bookPages",
            book.pages
        );


        setInputValue(
            "bookISBN",
            book.isbn
        );


        setInputValue(
            "bookSeries",
            book.series
        );


        populateShelfSelect(
            book.shelfId
        );


        setInputValue(
            "bookShelf",
            book.shelfId
        );


        setInputValue(
            "bookStatus",
            book.status
        );


        setInputValue(
            "bookRating",
            book.rating
        );


        setInputValue(
            "bookTimesRead",
            book.timesRead
        );


        setInputValue(
            "bookStarted",
            book.started
        );


        setInputValue(
            "bookFinished",
            book.finished
        );


        setInputValue(
            "bookCurrentPage",
            book.currentPage
        );


        const design =
            book.design ||
            CONFIG.defaultBookDesign ||
            {};


        setInputValue(
            "bookStyle",
            design.style
        );


        setInputValue(
            "bookSpineColor",
            design.spineColor
        );


        setInputValue(
            "bookTextColor",
            design.textColor
        );


        setInputValue(
            "bookAccentColor",
            design.accentColor
        );


        setInputValue(
            "bookSpineOrnament",
            design.ornament
        );


        setInputValue(
            "bookSpineFont",
            design.spineFont
        );


        setInputValue(
            "bookSpineFontSize",
            design.fontSize
        );


        setInputValue(
            "bookSpineFontWeight",
            design.fontWeight
        );


        setInputValue(
            "bookSpineLetterSpacing",
            design.letterSpacing
        );


        setInputValue(
            "bookSpineCase",
            design.textCase
        );


        setInputValue(
            "bookSpineFontStyle",
            design.fontStyle
        );


        setInputValue(
            "bookSpineTextAlign",
            design.textAlign
        );


        setInputValue(
            "bookSpineTitlePanel",
            design.titlePanel
        );


        setInputValue(
            "bookHeight",
            design.height
        );


        setInputValue(
            "bookThickness",
            design.thickness
        );


        pendingCoverData =
            book.cover ||
            "";


        Novellow.panels?.openPanel?.(
            "bookDrawer"
        );


        updatePreviewFromForm();

    }


    /* =====================================================
       CLOSE BOOK DRAWER
       ===================================================== */

    function closeBookDrawer() {

        pendingCoverData =
            "";


        Novellow.panels?.closeAllPanels?.();

    }


    /* =====================================================
       RESET BOOK FORM
       ===================================================== */

    function resetBookForm() {

        const form =
            H.getById?.(
                "bookForm"
            );


        form?.reset();


        pendingCoverData =
            "";


        setInputValue(
            "editingBookId",
            ""
        );


        setInputValue(
            "bookStatus",
            "want"
        );


        setInputValue(
            "bookRating",
            "0"
        );


        setInputValue(
            "bookTimesRead",
            "0"
        );


        setInputValue(
            "bookCurrentPage",
            "0"
        );


        const design =
            CONFIG.defaultBookDesign ||
            {};


        setInputValue(
            "bookStyle",
            design.style ||
            "classic"
        );


        setInputValue(
            "bookSpineColor",
            design.spineColor ||
            "#793f55"
        );


        setInputValue(
            "bookTextColor",
            design.textColor ||
            "#f1e3cf"
        );


        setInputValue(
            "bookAccentColor",
            design.accentColor ||
            "#c39a67"
        );


        setInputValue(
            "bookSpineOrnament",
            design.ornament ||
            "auto"
        );


        setInputValue(
            "bookSpineFont",
            design.spineFont ||
            "serif"
        );


        setInputValue(
            "bookSpineFontSize",
            design.fontSize ||
            "medium"
        );


        setInputValue(
            "bookSpineFontWeight",
            design.fontWeight ||
            "regular"
        );


        setInputValue(
            "bookSpineLetterSpacing",
            design.letterSpacing ||
            "normal"
        );


        setInputValue(
            "bookSpineCase",
            design.textCase ||
            "typed"
        );


        setInputValue(
            "bookSpineFontStyle",
            design.fontStyle ||
            "normal"
        );


        setInputValue(
            "bookSpineTextAlign",
            design.textAlign ||
            "center"
        );


        setInputValue(
            "bookSpineTitlePanel",
            design.titlePanel ||
            "none"
        );


        setInputValue(
            "bookHeight",
            design.height ||
            "medium"
        );


        setInputValue(
            "bookThickness",
            design.thickness ||
            "medium"
        );


        populateShelfSelect();

        updatePreviewFromForm();

    }


    /* =====================================================
       COVER UPLOAD
       ===================================================== */

    async function handleCoverUpload(
        event
    ) {

        const file =
            event.target.files?.[0];


        if (!file) {

            pendingCoverData =
                "";

            return;

        }


        try {

            pendingCoverData =
                await H.fileToDataURL?.(
                    file
                ) || "";


            H.showToast?.(
                "Cover image ready.",
                "success"
            );

        } catch (error) {

            console.error(
                error
            );


            pendingCoverData =
                "";


            H.showToast?.(
                "Novellow could not read that cover image.",
                "error"
            );

        }

    }


    /* =====================================================
       SUBMIT BOOK
       ===================================================== */

    function handleBookSubmit(
        event
    ) {

        event.preventDefault();


        const state =
            getState();


        const editingId =
            getInputValue(
                "editingBookId"
            );


        const existing =
            editingId
                ? H.getBookById?.(
                    editingId
                )
                : null;


        const title =
            getInputValue(
                "bookTitle"
            );


        if (!title) {

            H.showToast?.(
                "Give your book a title first.",
                "error"
            );

            return;

        }


        const pages =
            Math.max(
                0,
                H.toNumber?.(
                    getInputValue(
                        "bookPages"
                    ),
                    0
                ) || 0
            );


        let currentPage =
            Math.max(
                0,
                H.toNumber?.(
                    getInputValue(
                        "bookCurrentPage"
                    ),
                    0
                ) || 0
            );


        if (
            pages > 0
        ) {

            currentPage =
                Math.min(
                    currentPage,
                    pages
                );

        }


        let status =
            getInputValue(
                "bookStatus"
            ) ||
            "want";


        let started =
            getInputValue(
                "bookStarted"
            );


        let finished =
            getInputValue(
                "bookFinished"
            );


        if (
            status ===
            "reading" &&
            !started
        ) {

            started =
                H.todayISO?.() ||
                "";

        }


        if (
            status ===
            "finished"
        ) {

            if (!started) {

                started =
                    H.todayISO?.() ||
                    "";

            }


            if (!finished) {

                finished =
                    H.todayISO?.() ||
                    "";

            }


            if (
                pages > 0
            ) {

                currentPage =
                    pages;

            }

        }


        const design =
            getDesignFromForm();


        const book =
            H.normalizeBook?.({

                ...existing,

                id:
                    existing?.id ||
                    undefined,

                title,

                author:
                    getInputValue(
                        "bookAuthor"
                    ),

                genre:
                    getInputValue(
                        "bookGenre"
                    ),

                year:
                    getInputValue(
                        "bookYear"
                    ),

                pages,

                isbn:
                    getInputValue(
                        "bookISBN"
                    ),

                series:
                    getInputValue(
                        "bookSeries"
                    ),

                shelfId:
                    getInputValue(
                        "bookShelf"
                    ),

                status,

                rating:
                    H.toNumber?.(
                        getInputValue(
                            "bookRating"
                        ),
                        0
                    ) || 0,

                timesRead:
                    H.toNumber?.(
                        getInputValue(
                            "bookTimesRead"
                        ),
                        0
                    ) || 0,

                started,

                finished,

                currentPage,

                cover:
                    pendingCoverData ||
                    existing?.cover ||
                    "",

                design,

                journal:
                    existing?.journal,

                createdAt:
                    existing?.createdAt,

                updatedAt:
                    H.nowISO?.()

            });


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


        Novellow.storage
            ?.saveBooks?.();


        pendingCoverData =
            "";


        closeBookDrawer();


        refreshConnectedViews();

    }


    /* =====================================================
       DESIGN FROM FORM
       ===================================================== */

    function getDesignFromForm() {

        return H.normalizeBookDesign?.({

            style:
                getInputValue(
                    "bookStyle"
                ),

            spineColor:
                getInputValue(
                    "bookSpineColor"
                ),

            textColor:
                getInputValue(
                    "bookTextColor"
                ),

            accentColor:
                getInputValue(
                    "bookAccentColor"
                ),

            ornament:
                getInputValue(
                    "bookSpineOrnament"
                ),

            spineFont:
                getInputValue(
                    "bookSpineFont"
                ),

            fontSize:
                getInputValue(
                    "bookSpineFontSize"
                ),

            fontWeight:
                getInputValue(
                    "bookSpineFontWeight"
                ),

            letterSpacing:
                getInputValue(
                    "bookSpineLetterSpacing"
                ),

            textCase:
                getInputValue(
                    "bookSpineCase"
                ),

            fontStyle:
                getInputValue(
                    "bookSpineFontStyle"
                ),

            textAlign:
                getInputValue(
                    "bookSpineTextAlign"
                ),

            titlePanel:
                getInputValue(
                    "bookSpineTitlePanel"
                ),

            height:
                getInputValue(
                    "bookHeight"
                ),

            thickness:
                getInputValue(
                    "bookThickness"
                )

        });

    }


    /* =====================================================
       LIVE PREVIEW
       ===================================================== */

    function updatePreviewFromForm() {

        const preview =
            H.getById?.(
                "bookSpinePreview"
            );


        if (!preview) {
            return;
        }


        const title =
            getInputValue(
                "bookTitle"
            ) ||
            "Book Title";


        const design =
            getDesignFromForm();


        preview.className =
            buildBookClassList(
                design,
                true
            );


        preview.style.setProperty(
            "--book-color",
            design.spineColor
        );


        preview.style.setProperty(
            "--book-text",
            design.textColor
        );


        preview.style.setProperty(
            "--book-accent",
            design.accentColor
        );


        const titleElement =
            H.getById?.(
                "bookSpinePreviewTitle"
            );


        if (titleElement) {

            titleElement.textContent =
                H.applyTextCase?.(
                    title,
                    design.textCase
                ) ||
                title;

        }


        const titlePanel =
            H.getById?.(
                "bookSpinePreviewTitlePanel"
            );


        if (titlePanel) {

            titlePanel.className =
                [
                    "spine-preview-title-panel",
                    getPreviewPanelClass(
                        design.titlePanel
                    )
                ]
                .filter(Boolean)
                .join(" ");

        }


        const ornament =
            H.getById?.(
                "bookSpinePreviewOrnament"
            );


        if (ornament) {

            ornament.textContent =
                H.getOrnamentSymbol?.(
                    design.ornament,
                    design.style
                ) ||
                "";

        }


        applyPreviewTypography(
            preview,
            design
        );

    }


    /* =====================================================
       PREVIEW CLASSES
       ===================================================== */

    function applyPreviewTypography(
        preview,
        design
    ) {

        const title =
            H.getById?.(
                "bookSpinePreviewTitle"
            );


        if (!title) {
            return;
        }


        title.style.fontFamily =
            getPreviewFontFamily(
                design.spineFont
            );


        title.style.fontSize =
            getPreviewFontSize(
                design.fontSize
            );


        title.style.fontWeight =
            getPreviewFontWeight(
                design.fontWeight
            );


        title.style.letterSpacing =
            getPreviewLetterSpacing(
                design.letterSpacing
            );


        title.style.fontStyle =
            design.fontStyle ===
            "italic"
                ? "italic"
                : "normal";


        const inner =
            preview.querySelector(
                ".spine-preview-inner"
            );


        if (inner) {

            inner.style.justifyContent =
                design.textAlign ===
                "top"
                    ? "flex-start"
                    : design.textAlign ===
                      "bottom"
                        ? "flex-end"
                        : "center";

        }


        if (
            design.height ===
            "small"
        ) {

            preview.style.height =
                "205px";

        } else if (
            design.height ===
            "tall"
        ) {

            preview.style.height =
                "275px";

        } else {

            preview.style.height =
                "250px";

        }


        if (
            design.thickness ===
            "slim"
        ) {

            preview.style.width =
                "42px";

        } else if (
            design.thickness ===
            "chunky"
        ) {

            preview.style.width =
                "64px";

        } else {

            preview.style.width =
                "52px";

        }

    }


    function getPreviewPanelClass(
        panel
    ) {

        switch (panel) {

            case "simple":
                return "preview-panel-simple";

            case "bordered":
                return "preview-panel-bordered";

            case "ornate":
                return "preview-panel-ornate";

            case "dark":
                return "preview-panel-dark";

            case "light":
                return "preview-panel-light";

            default:
                return "";

        }

    }


    function getPreviewFontFamily(
        font
    ) {

        switch (font) {

            case "roman":

                return '"Times New Roman", Georgia, serif';


            case "bookish":

            case "elegant":

            case "storybook":

                return '"Cormorant Garamond", Georgia, serif';


            case "typewriter":

            case "retro":

                return '"Courier New", monospace';


            case "clean":

                return 'Arial, Helvetica, sans-serif';


            case "condensed":

            case "deco":

                return '"Arial Narrow", Arial, sans-serif';


            case "heavy":

                return 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif';


            case "handwritten":

                return '"Comic Sans MS", "Bradley Hand", cursive';


            default:

                return 'Georgia, "Times New Roman", serif';

        }

    }


    function getPreviewFontSize(
        size
    ) {

        switch (size) {

            case "small":
                return "0.56rem";

            case "large":
                return "0.77rem";

            case "xlarge":
                return "0.9rem";

            default:
                return "0.67rem";

        }

    }


    function getPreviewFontWeight(
        weight
    ) {

        switch (weight) {

            case "light":
                return "300";

            case "bold":
                return "700";

            case "heavy":
                return "800";

            default:
                return "500";

        }

    }


    function getPreviewLetterSpacing(
        spacing
    ) {

        switch (spacing) {

            case "tight":
                return "-0.04em";

            case "wide":
                return "0.08em";

            case "extra-wide":
                return "0.16em";

            default:
                return "0";

        }

    }


    /* =====================================================
       CREATE SHELF BOOK ELEMENT
       ===================================================== */

    function createShelfBookElement(
        book
    ) {

        const design =
            book.design ||
            H.normalizeBookDesign?.(
                {}
            );


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
            `${book.title}${book.author ? ` by ${book.author}` : ""}`
        );


        button.style.setProperty(
            "--book-color",
            design.spineColor
        );


        button.style.setProperty(
            "--book-text",
            design.textColor
        );


        button.style.setProperty(
            "--book-accent",
            design.accentColor
        );


        const title =
            H.applyTextCase?.(
                book.title,
                design.textCase
            ) ||
            book.title;


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

                <span
                    class="binding-band bottom"
                    aria-hidden="true"
                ></span>

                <span class="spine-inner">

                    <span class="spine-title-panel">

                        <span class="spine-title">
                            ${H.escapeHTML?.(
                                title
                            )}
                        </span>

                    </span>

                </span>

                <span
                    class="spine-ornament"
                    aria-hidden="true"
                >
                    ${H.escapeHTML?.(
                        ornament
                    )}
                </span>
            `;


        button.addEventListener(
            "click",
            () =>
                openReveal(
                    book.id
                )
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
                `book-font-${design.spineFont || "serif"}`
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
       COVER ELEMENT
       ===================================================== */

    function createCoverElement(
        book
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "generated-cover";


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
                `${book.title} cover`;


            wrapper.innerHTML =
                "";


            wrapper.appendChild(
                image
            );


            return wrapper;

        }


        const design =
            book.design ||
            CONFIG.defaultBookDesign ||
            {};


        wrapper.style.setProperty(
            "--cover-color",
            design.spineColor ||
            "#793f55"
        );


        wrapper.style.setProperty(
            "--cover-text",
            design.textColor ||
            "#f1e3cf"
        );


        wrapper.style.setProperty(
            "--cover-accent",
            design.accentColor ||
            "#c39a67"
        );


        const ornament =
            H.getOrnamentSymbol?.(
                design.ornament,
                design.style
            ) ||
            "";


        wrapper.innerHTML =
            `
                <strong class="generated-cover-title">
                    ${H.escapeHTML?.(
                        book.title
                    )}
                </strong>

                ${
                    book.author
                        ? `
                            <span class="generated-cover-author">
                                ${H.escapeHTML?.(
                                    book.author
                                )}
                            </span>
                        `
                        : ""
                }

                <span
                    class="generated-cover-ornament"
                    aria-hidden="true"
                >
                    ${H.escapeHTML?.(
                        ornament
                    )}
                </span>
            `;


        return wrapper;

    }


    /* =====================================================
       OPEN REVEAL
       ===================================================== */

    function openReveal(
        bookId
    ) {

        const state =
            getState();


        const book =
            H.getBookById?.(
                bookId
            );


        if (!book) {
            return;
        }


        state.selectedBookId =
            book.id;


        const reveal =
            H.getById?.(
                "bookReveal"
            );


        if (!reveal) {
            return;
        }


        const coverContainer =
            H.getById?.(
                "revealBookCover"
            );


        if (coverContainer) {

            coverContainer.innerHTML =
                "";


            coverContainer.appendChild(
                createCoverElement(
                    book
                )
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
            book.title
        );


        H.setText?.(
            "revealBookAuthor",
            book.author ||
            "Unknown Author"
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
                ? H.formatNumber?.(
                    book.pages
                ) || book.pages
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


        const progress =
            H.getById?.(
                "revealBookProgress"
            );


        if (progress) {

            progress.style.width =
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


        document.body.classList.remove(
            "modal-open"
        );

    }


    /* =====================================================
       EDIT SELECTED BOOK
       ===================================================== */

    function editSelectedBook() {

        const state =
            getState();


        const bookId =
            state.selectedBookId;


        if (!bookId) {
            return;
        }


        closeReveal();

        openEditDrawer(
            bookId
        );

    }


    /* =====================================================
       OPEN SELECTED JOURNAL
       ===================================================== */

    function openSelectedJournal() {

        const state =
            getState();


        const bookId =
            state.selectedBookId;


        if (!bookId) {
            return;
        }


        closeReveal();


        Novellow.navigation?.navigateTo?.(
            "journal"
        );


        Novellow.journal
            ?.selectBook?.(
                bookId
            );

    }


    /* =====================================================
       DELETE BOOK
       ===================================================== */

    function deleteBook(
        bookId
    ) {

        const state =
            getState();


        const book =
            H.getBookById?.(
                bookId
            );


        if (!book) {
            return;
        }


        const confirmed =
            H.confirmAction?.(
                `Delete "${book.title}" from Novellow?`
            );


        if (!confirmed) {
            return;
        }


        state.books =
            state.books.filter(
                item =>
                    item.id !==
                    bookId
            );


        if (
            state.selectedBookId ===
            bookId
        ) {

            state.selectedBookId =
                null;

        }


        Novellow.storage
            ?.saveBooks?.();


        closeReveal();

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
        selectedShelfId =
            ""
    ) {

        if (
            Novellow.library
                ?.populateShelfSelect
        ) {

            Novellow.library
                .populateShelfSelect(
                    selectedShelfId
                );

            return;

        }


        const state =
            getState();


        const select =
            H.getById?.(
                "bookShelf"
            );


        if (!select) {
            return;
        }


        select.innerHTML =
            "";


        const unshelved =
            document.createElement(
                "option"
            );


        unshelved.value =
            "";


        unshelved.textContent =
            "Unshelved";


        select.appendChild(
            unshelved
        );


        state.shelves.forEach(
            shelf => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    shelf.id;


                option.textContent =
                    shelf.name;


                select.appendChild(
                    option
                );

            }
        );


        select.value =
            selectedShelfId ||
            "";

    }


    /* =====================================================
       FORMAT RATING
       ===================================================== */

    function formatRating(
        rating
    ) {

        const value =
            Math.max(
                0,
                Math.min(
                    5,
                    H.toNumber?.(
                        rating,
                        0
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


        populateShelfSelect();

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


        return element
            ? element.value
            : "";

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    Novellow.books = {

        init,

        openAddDrawer,

        openEditDrawer,

        closeBookDrawer,

        createShelfBookElement,

        createCoverElement,

        openReveal,

        closeReveal,

        deleteBook,

        populateShelfSelect,

        updatePreviewFromForm

    };


})();
