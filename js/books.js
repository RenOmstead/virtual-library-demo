/* =========================================================
   NOVELLOW
   BOOKS.JS
   VERSION 16

   Book creation
   Book editing
   Shelf placement
   Book deletion
   Journal handoff

   Advanced physical spine designer:
   - Binding material
   - Spine curve
   - Raised bands
   - Band thickness
   - Foil finish
   - Separate ornaments
   - Borders
   - Labels
   - Wear
   - Texture
   - Depth
   - Sheen
   - Edge wear
   - Typography
   - Proportions
   ========================================================= */

(() => {

    "use strict";


    /* =====================================================
       GLOBAL NAMESPACE
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
       ELEMENT HELPERS
       ===================================================== */

    function byId(id) {

        return document.getElementById(
            id
        );

    }


    function value(
        id,
        fallback = ""
    ) {

        const element =
            byId(id);


        if (!element) {

            return fallback;

        }


        return (
            element.value ??
            fallback
        );

    }


    function checked(
        id,
        fallback = false
    ) {

        const element =
            byId(id);


        if (!element) {

            return fallback;

        }


        return Boolean(
            element.checked
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


    function setChecked(
        id,
        nextValue
    ) {

        const element =
            byId(id);


        if (!element) {

            return;

        }


        element.checked =
            Boolean(
                nextValue
            );

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


    /* =====================================================
       STATE
       ===================================================== */

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
            typeof H.getBookById ===
            "function"
        ) {

            const found =
                H.getBookById(
                    bookId
                );


            if (found) {

                return found;

            }

        }


        return (
            getBooks().find(
                book =>
                    String(book.id) ===
                    String(bookId)
            ) ||
            null
        );

    }


    /* =====================================================
       GENERAL HELPERS
       ===================================================== */

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


        const temp =
            document.createElement(
                "div"
            );


        temp.textContent =
            String(
                input ??
                ""
            );


        return temp.innerHTML;

    }


    function showToast(
        message,
        type = "success"
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


        console.log(
            message
        );

    }


    function numberValue(
        id,
        fallback = 0
    ) {

        const raw =
            Number(
                value(
                    id,
                    fallback
                )
            );


        return Number.isFinite(raw)
            ? raw
            : fallback;

    }


    function cssNumber(
        valueToClamp,
        minimum,
        maximum,
        fallback
    ) {

        const parsed =
            Number(
                valueToClamp
            );


        if (
            !Number.isFinite(
                parsed
            )
        ) {

            return fallback;

        }


        return Math.min(
            maximum,
            Math.max(
                minimum,
                parsed
            )
        );

    }


    /* =====================================================
       DEFAULT DESIGN MODEL

       Everything about the physical book lives here.

       Existing books that don't have one of these values
       automatically receive a safe default.
       ===================================================== */

    function getDefaultDesign() {

        return {

            /* Base visual family */
            style:
                "classic",

            /* Physical binding material */
            material:
                "linen",

            /* Base colors */
            spineColor:
                "#793f55",

            textColor:
                "#f1e3cf",

            accentColor:
                "#c39a67",

            /* Foil / print finish */
            foil:
                "gold",

            /* Overall spine geometry */
            curve:
                "soft",

            height:
                "medium",

            thickness:
                "medium",

            /* Raised horizontal binding bands */
            raisedBands:
                "2",

            bandThickness:
                "medium",

            /* Decorative edge framework */
            borderStyle:
                "none",

            /* Primary legacy ornament */
            ornament:
                "auto",

            /* More detailed ornaments */
            topOrnament:
                "auto",

            bottomOrnament:
                "auto",

            /* Title plate */
            titlePanel:
                "none",

            labelShape:
                "none",

            labelColor:
                "#4a2d34",

            /* Typography */
            font:
                "bookish",

            fontSize:
                "medium",

            fontWeight:
                "regular",

            letterSpacing:
                "normal",

            letterCase:
                "typed",

            fontStyle:
                "normal",

            textAlign:
                "center",

            /* Material personality */
            texture:
                "medium",

            wear:
                "none",

            edgeWear:
                "none",

            depth:
                "medium",

            sheen:
                "matte"

        };

    }


    /* =====================================================
       NORMALIZE ADVANCED DESIGN

       This is intentionally independent of helper.js so the
       new design fields survive even if helper.js has not
       been upgraded yet.
       ===================================================== */

    function normalizeAdvancedDesign(
        input = {}
    ) {

        const defaults =
            getDefaultDesign();


        const helperNormalized =
            typeof H.normalizeBookDesign ===
                "function"
                ? H.normalizeBookDesign(
                    input
                )
                : input;


        const source = {

            ...input,

            ...helperNormalized

        };


        return {

            style:
                source.style ||
                defaults.style,

            material:
                source.material ||
                source.bindingMaterial ||
                defaults.material,

            spineColor:
                source.spineColor ||
                source.spine_color ||
                defaults.spineColor,

            textColor:
                source.textColor ||
                source.text_color ||
                defaults.textColor,

            accentColor:
                source.accentColor ||
                source.accent_color ||
                defaults.accentColor,

            foil:
                source.foil ||
                source.foilStyle ||
                defaults.foil,

            curve:
                source.curve ||
                source.spineCurve ||
                defaults.curve,

            height:
                source.height ||
                defaults.height,

            thickness:
                source.thickness ||
                defaults.thickness,

            raisedBands:
                String(
                    source.raisedBands ??
                    source.raised_bands ??
                    defaults.raisedBands
                ),

            bandThickness:
                source.bandThickness ||
                source.band_thickness ||
                defaults.bandThickness,

            borderStyle:
                source.borderStyle ||
                source.border_style ||
                defaults.borderStyle,

            ornament:
                source.ornament ||
                defaults.ornament,

            topOrnament:
                source.topOrnament ||
                source.top_ornament ||
                source.ornament ||
                defaults.topOrnament,

            bottomOrnament:
                source.bottomOrnament ||
                source.bottom_ornament ||
                source.ornament ||
                defaults.bottomOrnament,

            titlePanel:
                source.titlePanel ||
                source.title_panel ||
                defaults.titlePanel,

            labelShape:
                source.labelShape ||
                source.label_shape ||
                defaults.labelShape,

            labelColor:
                source.labelColor ||
                source.label_color ||
                defaults.labelColor,

            font:
                source.font ||
                defaults.font,

            fontSize:
                source.fontSize ||
                source.font_size ||
                defaults.fontSize,

            fontWeight:
                source.fontWeight ||
                source.font_weight ||
                defaults.fontWeight,

            letterSpacing:
                source.letterSpacing ||
                source.letter_spacing ||
                defaults.letterSpacing,

            letterCase:
                source.letterCase ||
                source.letter_case ||
                defaults.letterCase,

            fontStyle:
                source.fontStyle ||
                source.font_style ||
                defaults.fontStyle,

            textAlign:
                source.textAlign ||
                source.text_align ||
                defaults.textAlign,

            texture:
                source.texture ||
                source.textureStrength ||
                defaults.texture,

            wear:
                source.wear ||
                source.wearLevel ||
                defaults.wear,

            edgeWear:
                source.edgeWear ||
                source.edge_wear ||
                defaults.edgeWear,

            depth:
                source.depth ||
                source.depthStrength ||
                defaults.depth,

            sheen:
                source.sheen ||
                source.finish ||
                defaults.sheen

        };

    }


    /* =====================================================
       INITIALIZE
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
       BOOK DRAWER BINDINGS
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

                const id =
                    value(
                        "editingBookId"
                    );


                if (id) {

                    deleteBook(
                        id
                    );

                }

            }
        );


        byId(
            "bookCoverUpload"
        )?.addEventListener(
            "change",
            handleCoverUpload
        );

    }


    /* =====================================================
       OPEN ADD BOOK
       ===================================================== */

    function openAddDrawer(
        shelfId = ""
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


        populateDesignFields(
            getDefaultDesign()
        );


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
            normalizeAdvancedDesign(
                book.design
            )
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
       DRAWER OPEN / CLOSE
       ===================================================== */

    function openDrawer() {

        if (
            typeof Novellow.app
                ?.openPanel ===
            "function"
        ) {

            Novellow.app.openPanel(
                "bookDrawer"
            );

            return;

        }


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


    function resetBookForm() {

        byId(
            "bookForm"
        )?.reset();


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
       POPULATE DESIGN CONTROLS

       Missing HTML elements are intentionally ignored.
       This means Version 16 can be installed before we add
       all of the advanced designer controls.
       ===================================================== */

    function populateDesignFields(
        incomingDesign
    ) {

        const design =
            normalizeAdvancedDesign(
                incomingDesign
            );


        /* Existing controls */

        setValue(
            "bookStyle",
            design.style
        );


        setValue(
            "bookSpineStyle",
            design.style
        );


        setValue(
            "bookSpineColor",
            design.spineColor
        );


        setValue(
            "bookTextColor",
            design.textColor
        );


        setValue(
            "bookAccentColor",
            design.accentColor
        );


        setValue(
            "bookSpineOrnament",
            design.ornament
        );


        setValue(
            "bookSpineFont",
            design.font
        );


        setValue(
            "bookSpineFontSize",
            design.fontSize
        );


        setValue(
            "bookSpineFontWeight",
            design.fontWeight
        );


        setValue(
            "bookSpineLetterSpacing",
            design.letterSpacing
        );


        setValue(
            "bookSpineCase",
            design.letterCase
        );


        setValue(
            "bookSpineFontStyle",
            design.fontStyle
        );


        setValue(
            "bookSpineTextAlign",
            design.textAlign
        );


        setValue(
            "bookSpineTitlePanel",
            design.titlePanel
        );


        setValue(
            "bookHeight",
            design.height
        );


        setValue(
            "bookThickness",
            design.thickness
        );


        /* New advanced controls */

        setValue(
            "bookBindingMaterial",
            design.material
        );


        setValue(
            "bookSpineCurve",
            design.curve
        );


        setValue(
            "bookRaisedBands",
            design.raisedBands
        );


        setValue(
            "bookBandThickness",
            design.bandThickness
        );


        setValue(
            "bookFoilStyle",
            design.foil
        );


        setValue(
            "bookTopOrnament",
            design.topOrnament
        );


        setValue(
            "bookBottomOrnament",
            design.bottomOrnament
        );


        setValue(
            "bookBorderStyle",
            design.borderStyle
        );


        setValue(
            "bookLabelShape",
            design.labelShape
        );


        setValue(
            "bookLabelColor",
            design.labelColor
        );


        setValue(
            "bookTextureStrength",
            design.texture
        );


        setValue(
            "bookWearLevel",
            design.wear
        );


        setValue(
            "bookEdgeWear",
            design.edgeWear
        );


        setValue(
            "bookDepthStrength",
            design.depth
        );


        setValue(
            "bookSheen",
            design.sheen
        );

    }


    /* =====================================================
       COLLECT DESIGN FROM FORM
       ===================================================== */

    function collectBookDesign() {

        const defaults =
            getDefaultDesign();


        const style =
            value(
                "bookStyle",
                ""
            ) ||
            value(
                "bookSpineStyle",
                defaults.style
            );


        const design = {

            /* Existing */

            style,

            spineColor:
                value(
                    "bookSpineColor",
                    defaults.spineColor
                ),

            textColor:
                value(
                    "bookTextColor",
                    defaults.textColor
                ),

            accentColor:
                value(
                    "bookAccentColor",
                    defaults.accentColor
                ),

            ornament:
                value(
                    "bookSpineOrnament",
                    defaults.ornament
                ),

            font:
                value(
                    "bookSpineFont",
                    defaults.font
                ),

            fontSize:
                value(
                    "bookSpineFontSize",
                    defaults.fontSize
                ),

            fontWeight:
                value(
                    "bookSpineFontWeight",
                    defaults.fontWeight
                ),

            letterSpacing:
                value(
                    "bookSpineLetterSpacing",
                    defaults.letterSpacing
                ),

            letterCase:
                value(
                    "bookSpineCase",
                    defaults.letterCase
                ),

            fontStyle:
                value(
                    "bookSpineFontStyle",
                    defaults.fontStyle
                ),

            textAlign:
                value(
                    "bookSpineTextAlign",
                    defaults.textAlign
                ),

            titlePanel:
                value(
                    "bookSpineTitlePanel",
                    defaults.titlePanel
                ),

            height:
                value(
                    "bookHeight",
                    defaults.height
                ),

            thickness:
                value(
                    "bookThickness",
                    defaults.thickness
                ),


            /* New physical attributes */

            material:
                value(
                    "bookBindingMaterial",
                    defaults.material
                ),

            curve:
                value(
                    "bookSpineCurve",
                    defaults.curve
                ),

            raisedBands:
                value(
                    "bookRaisedBands",
                    defaults.raisedBands
                ),

            bandThickness:
                value(
                    "bookBandThickness",
                    defaults.bandThickness
                ),

            foil:
                value(
                    "bookFoilStyle",
                    defaults.foil
                ),

            topOrnament:
                value(
                    "bookTopOrnament",
                    value(
                        "bookSpineOrnament",
                        defaults.topOrnament
                    )
                ),

            bottomOrnament:
                value(
                    "bookBottomOrnament",
                    value(
                        "bookSpineOrnament",
                        defaults.bottomOrnament
                    )
                ),

            borderStyle:
                value(
                    "bookBorderStyle",
                    defaults.borderStyle
                ),

            labelShape:
                value(
                    "bookLabelShape",
                    defaults.labelShape
                ),

            labelColor:
                value(
                    "bookLabelColor",
                    defaults.labelColor
                ),

            texture:
                value(
                    "bookTextureStrength",
                    defaults.texture
                ),

            wear:
                value(
                    "bookWearLevel",
                    defaults.wear
                ),

            edgeWear:
                value(
                    "bookEdgeWear",
                    defaults.edgeWear
                ),

            depth:
                value(
                    "bookDepthStrength",
                    defaults.depth
                ),

            sheen:
                value(
                    "bookSheen",
                    defaults.sheen
                )

        };


        return normalizeAdvancedDesign(
            design
        );

    }


    /* =====================================================
       SAVE BOOK
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


        const rawBook = {

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
                numberValue(
                    "bookPages",
                    0
                ),

            total_pages:
                numberValue(
                    "bookPages",
                    0
                ),

            isbn:
                value(
                    "bookISBN"
                ).trim(),

            series:
                value(
                    "bookSeries"
                ).trim(),

            /*
               Maintain both forms while localStorage and
               Supabase coexist.
            */

            shelfId,

            shelf_id:
                shelfId ||
                null,

            status:
                value(
                    "bookStatus",
                    "want"
                ),

            rating:
                numberValue(
                    "bookRating",
                    0
                ),

            timesRead:
                numberValue(
                    "bookTimesRead",
                    0
                ),

            times_read:
                numberValue(
                    "bookTimesRead",
                    0
                ),

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
                numberValue(
                    "bookCurrentPage",
                    0
                ),

            current_page:
                numberValue(
                    "bookCurrentPage",
                    0
                ),

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


        /*
           Allow helper.js to normalize standard book data,
           but restore advanced design afterwards so helper
           normalization cannot accidentally strip it.
        */

        const normalized =
            typeof H.normalizeBook ===
                "function"
                ? H.normalizeBook(
                    rawBook
                )
                : rawBook;


        const book = {

            ...rawBook,

            ...normalized,

            shelfId,

            shelf_id:
                shelfId ||
                null,

            design:
                normalizeAdvancedDesign(
                    rawBook.design
                )

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
       LIVE DESIGNER BINDINGS
       ===================================================== */

    function bindLivePreview() {

        const ids = [

            /* Existing */
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
            "bookThickness",

            /* New */
            "bookBindingMaterial",
            "bookSpineCurve",
            "bookRaisedBands",
            "bookBandThickness",
            "bookFoilStyle",
            "bookTopOrnament",
            "bookBottomOrnament",
            "bookBorderStyle",
            "bookLabelShape",
            "bookLabelColor",
            "bookTextureStrength",
            "bookWearLevel",
            "bookEdgeWear",
            "bookDepthStrength",
            "bookSheen"

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
       LIVE PREVIEW
       ===================================================== */

    function updateSpinePreview() {

        const preview =
            byId(
                "bookSpinePreview"
            ) ||
            byId(
                "spinePreviewBook"
            );


        if (!preview) {

            return;

        }


        const design =
            collectBookDesign();


        /* CSS colors */

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
            getFoilColor(
                design
            )
        );


        preview.style.setProperty(
            "--book-label-color",
            design.labelColor
        );


        /* Data attributes */

        setDesignDataAttributes(
            preview,
            design
        );


        /* Preview classes */

        preview.className =
            buildPreviewClassList(
                design
            );


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
                    design.bottomOrnament,
                    design.style
                );

        }


        const topOrnament =
            byId(
                "bookSpinePreviewTopOrnament"
            );


        if (topOrnament) {

            topOrnament.textContent =
                getOrnament(
                    design.topOrnament,
                    design.style
                );

        }


        const bottomOrnament =
            byId(
                "bookSpinePreviewBottomOrnament"
            );


        if (bottomOrnament) {

            bottomOrnament.textContent =
                getOrnament(
                    design.bottomOrnament,
                    design.style
                );

        }


        const panel =
            byId(
                "bookSpinePreviewTitlePanel"
            );


        if (panel) {

            panel.className =
                [
                    "spine-preview-title-panel",

                    `preview-panel-${design.titlePanel}`,

                    `preview-label-${design.labelShape}`

                ].join(
                    " "
                );


            panel.style.setProperty(
                "--book-label-color",
                design.labelColor
            );

        }


        renderPreviewBands(
            preview,
            design
        );

    }


    /* =====================================================
       DATA ATTRIBUTES
       ===================================================== */

    function setDesignDataAttributes(
        element,
        design
    ) {

        element.dataset.style =
            design.style;

        element.dataset.material =
            design.material;

        element.dataset.curve =
            design.curve;

        element.dataset.height =
            design.height;

        element.dataset.thickness =
            design.thickness;

        element.dataset.raisedBands =
            design.raisedBands;

        element.dataset.bandThickness =
            design.bandThickness;

        element.dataset.foil =
            design.foil;

        element.dataset.border =
            design.borderStyle;

        element.dataset.texture =
            design.texture;

        element.dataset.wear =
            design.wear;

        element.dataset.edgeWear =
            design.edgeWear;

        element.dataset.depth =
            design.depth;

        element.dataset.sheen =
            design.sheen;

        element.dataset.labelShape =
            design.labelShape;

    }


    /* =====================================================
       CREATE SHELF BOOK
       ===================================================== */

    function createShelfBookElement(
        book
    ) {

        const design =
            normalizeAdvancedDesign(
                book.design
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
            `Open ${book.title || "book"}`
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
            getFoilColor(
                design
            )
        );


        button.style.setProperty(
            "--book-label-color",
            design.labelColor
        );


        setDesignDataAttributes(
            button,
            design
        );


        const title =
            applyTextCase(
                book.title ||
                "Untitled",
                design.letterCase
            );


        const topSymbol =
            getOrnament(
                design.topOrnament,
                design.style
            );


        const bottomSymbol =
            getOrnament(
                design.bottomOrnament,
                design.style
            );


        button.innerHTML =
            `
                <span
                    class="spine-material-layer"
                    aria-hidden="true"
                ></span>

                <span
                    class="spine-depth-layer"
                    aria-hidden="true"
                ></span>

                <span
                    class="spine-wear-layer"
                    aria-hidden="true"
                ></span>

                <span
                    class="spine-border-layer"
                    aria-hidden="true"
                ></span>

                ${createRaisedBandsMarkup(
                    design
                )}

                <span class="spine-inner">

                    <span
                        class="spine-top-ornament"
                        aria-hidden="true"
                    >
                        ${escapeHTML(
                            topSymbol
                        )}
                    </span>

                    <span
                        class="
                            spine-title-panel
                            spine-label-${escapeHTML(
                                design.labelShape
                            )}
                        "
                    >

                        <span class="spine-title">
                            ${escapeHTML(
                                title
                            )}
                        </span>

                    </span>

                    <span
                        class="spine-bottom-ornament spine-ornament"
                        aria-hidden="true"
                    >
                        ${escapeHTML(
                            bottomSymbol
                        )}
                    </span>

                </span>
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


    /* =====================================================
       BOOK CLASS LIST
       ===================================================== */

    function buildBookClassList(
        design
    ) {

        return [

            "book-spine",

            `book-style-${design.style}`,

            `book-material-${design.material}`,

            `book-curve-${design.curve}`,

            `book-height-${design.height}`,

            `book-thickness-${design.thickness}`,

            `book-raised-bands-${design.raisedBands}`,

            `book-band-${design.bandThickness}`,

            `book-foil-${design.foil}`,

            `book-border-${design.borderStyle}`,

            `book-label-${design.labelShape}`,

            `book-texture-${design.texture}`,

            `book-wear-${design.wear}`,

            `book-edge-wear-${design.edgeWear}`,

            `book-depth-${design.depth}`,

            `book-sheen-${design.sheen}`,

            `book-font-${design.font}`,

            `book-font-size-${design.fontSize}`,

            `book-font-weight-${design.fontWeight}`,

            `book-letter-spacing-${design.letterSpacing}`,

            `book-font-style-${design.fontStyle}`,

            `book-text-align-${design.textAlign}`,

            `book-title-panel-${design.titlePanel}`

        ].join(
            " "
        );

    }


    function buildPreviewClassList(
        design
    ) {

        return [

            "book-spine-preview",

            "spine-preview-book",

            `book-style-${design.style}`,

            `book-material-${design.material}`,

            `book-curve-${design.curve}`,

            `book-height-${design.height}`,

            `book-thickness-${design.thickness}`,

            `book-raised-bands-${design.raisedBands}`,

            `book-band-${design.bandThickness}`,

            `book-foil-${design.foil}`,

            `book-border-${design.borderStyle}`,

            `book-label-${design.labelShape}`,

            `book-texture-${design.texture}`,

            `book-wear-${design.wear}`,

            `book-edge-wear-${design.edgeWear}`,

            `book-depth-${design.depth}`,

            `book-sheen-${design.sheen}`

        ].join(
            " "
        );

    }


    /* =====================================================
       RAISED BANDS
       ===================================================== */

    function createRaisedBandsMarkup(
        design
    ) {

        const count =
            cssNumber(
                design.raisedBands,
                0,
                4,
                0
            );


        if (!count) {

            return "";

        }


        let markup =
            `<span class="raised-band-layer" aria-hidden="true">`;


        for (
            let i = 0;
            i < count;
            i += 1
        ) {

            markup +=
                `<span class="raised-band raised-band-${i + 1}"></span>`;

        }


        markup +=
            `</span>`;


        return markup;

    }


    function renderPreviewBands(
        preview,
        design
    ) {

        preview
            .querySelector(
                ".raised-band-layer"
            )
            ?.remove();


        const count =
            cssNumber(
                design.raisedBands,
                0,
                4,
                0
            );


        if (!count) {

            return;

        }


        const layer =
            document.createElement(
                "span"
            );


        layer.className =
            "raised-band-layer";


        layer.setAttribute(
            "aria-hidden",
            "true"
        );


        for (
            let i = 0;
            i < count;
            i += 1
        ) {

            const band =
                document.createElement(
                    "span"
                );


            band.className =
                `raised-band raised-band-${i + 1}`;


            layer.appendChild(
                band
            );

        }


        preview.appendChild(
            layer
        );

    }


    /* =====================================================
       FOIL COLORS
       ===================================================== */

    function getFoilColor(
        design
    ) {

        switch (
            design.foil
        ) {

            case "silver":

                return "#d6d4cf";


            case "copper":

                return "#bd7c58";


            case "rose-gold":

                return "#c98f87";


            case "cream":

                return "#eadbc3";


            case "ink":

                return design.accentColor;


            case "black":

                return "#241c1e";


            case "gold":
            default:

                return design.accentColor ||
                    "#c39a67";

        }

    }


    /* =====================================================
       ORNAMENTS
       ===================================================== */

    function getOrnament(
        ornament,
        style = "classic"
    ) {

        const map = {

            none:
                "",

            auto:
                "",

            star:
                "✦",

            tinyStar:
                "⋆",

            diamond:
                "◆",

            smallDiamond:
                "◇",

            moon:
                "☾",

            sun:
                "☼",

            flower:
                "❀",

            blossom:
                "✿",

            leaf:
                "❧",

            vine:
                "❦",

            flourish:
                "❧",

            cross:
                "✣",

            gothic:
                "✥",

            clover:
                "♧",

            heart:
                "♡",

            shell:
                "❈",

            sparkle:
                "✧",

            dot:
                "•",

            doubleDot:
                "••",

            line:
                "—"

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
                "",

            gothic:
                "✥",

            vintage:
                "❧",

            deco:
                "◆",

            retro:
                "★",

            leather:
                "◆",

            botanical:
                "❦",

            celestial:
                "☾",

            floral:
                "❀",

            storybook:
                "✧",

            academia:
                "✦"

        };


        return (
            styleMap[
                style
            ] ||
            "✦"
        );

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
                typeof H.fileToDataURL ===
                    "function"
                    ? await H.fileToDataURL(
                        file
                    )
                    : await fileToDataURL(
                        file
                    );


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
        selectedId = ""
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
            normalizeAdvancedDesign(
                book.design
            );


        const generated =
            document.createElement(
                "div"
            );


        generated.className =
            [
                "generated-cover",
                `cover-material-${design.material}`,
                `cover-wear-${design.wear}`,
                `cover-border-${design.borderStyle}`,
                `cover-sheen-${design.sheen}`

            ].join(
                " "
            );


        generated.style.setProperty(
            "--cover-color",
            design.spineColor
        );


        generated.style.setProperty(
            "--cover-text",
            design.textColor
        );


        generated.style.setProperty(
            "--cover-accent",
            getFoilColor(
                design
            )
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
                            design.topOrnament,
                            design.style
                        )
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

    }


    function bindFirstAvailable(
        ids,
        callback
    ) {

        ids.forEach(
            id => {

                byId(
                    id
                )?.addEventListener(
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


        if (
            typeof Novellow.app
                ?.navigateTo ===
            "function"
        ) {

            Novellow.app.navigateTo(
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

        } else if (
            typeof Novellow.app
                ?.navigate ===
            "function"
        ) {

            Novellow.app.navigate(
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
       DELETE
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
            typeof H.confirmAction ===
                "function"
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
                    entry =>
                        String(
                            entry.bookId ||
                            entry.book_id ||
                            ""
                        ) !==
                        String(bookId)
                );

        }


        if (
            String(
                state.selectedBookId
            ) ===
            String(bookId)
        ) {

            state.selectedBookId =
                null;

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
       SAVE
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
       REFRESH
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


        const anyOpen =
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
                !anyOpen;


            overlay.style.pointerEvents =
                anyOpen
                    ? "auto"
                    : "none";

        }


        document.body.classList.toggle(
            "modal-open",
            anyOpen
        );

    }


    /* =====================================================
       TYPOGRAPHY HELPERS
       ===================================================== */

    function applyTextCase(
        text,
        letterCase
    ) {

        switch (
            letterCase
        ) {

            case "uppercase":

                return String(
                    text
                ).toUpperCase();


            case "lowercase":

                return String(
                    text
                ).toLowerCase();


            case "title":

                return String(
                    text
                )
                    .toLowerCase()
                    .replace(
                        /\b\w/g,
                        character =>
                            character
                                .toUpperCase()
                    );


            default:

                return String(
                    text
                );

        }

    }


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
                "var(--font-book, Georgia, serif)",

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
                "var(--font-display, Georgia, serif)",

            handwritten:
                "'Bradley Hand', 'Segoe Print', cursive",

            gothic:
                "Georgia, 'Times New Roman', serif",

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

        normalizeAdvancedDesign,

        getDefaultDesign,

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
