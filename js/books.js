/* ============================================================
   NOVELLOW
   BOOKS.JS
   VERSION 17

   OCTOBER SLEEPOVER BOOK DESIGNER

   - Book create / edit
   - Existing save behavior preserved
   - Theme-curated color swatches
   - Theme-curated accent swatches
   - Visual font picker
   - SVG spine ornaments
   - Live spine preview
   - Shelf rendering
   - Cover rendering
   - Book reveal
   - Journal handoff
   ============================================================ */

(() => {

    "use strict";


    /* ========================================================
       GLOBALS
       ======================================================== */

    window.NOVELLOW =
        window.NOVELLOW || {};


    const Novellow =
        window.NOVELLOW;


    const H =
        Novellow.helpers || {};


    const OCTOBER_ASSET =
        "assets/october-sleepover.svg";


    let revealBookId =
        null;


    /* ========================================================
       OCTOBER SLEEPOVER PALETTE

       Intentionally limited so every shelf still feels like
       it belongs to the same theme.
       ======================================================== */

    const OCTOBER_BOOK_COLORS = [

        {
            name: "Deep Plum",
            value: "#5b3a6b"
        },

        {
            name: "Blackberry",
            value: "#3b214d"
        },

        {
            name: "Dusty Mauve",
            value: "#a67489"
        },

        {
            name: "Rosewood",
            value: "#b85f6f"
        },

        {
            name: "Pumpkin",
            value: "#d9763f"
        },

        {
            name: "Antique Gold",
            value: "#c99a4f"
        },

        {
            name: "Smoky Lilac",
            value: "#a78eb8"
        },

        {
            name: "Moss",
            value: "#596443"
        },

        {
            name: "Sage",
            value: "#929f7c"
        },

        {
            name: "Warm Cream",
            value: "#f4e8d4"
        }

    ];


    const OCTOBER_ACCENT_COLORS = [

        {
            name: "Antique Gold",
            value: "#c99a4f"
        },

        {
            name: "Warm Cream",
            value: "#f4e8d4"
        },

        {
            name: "Dusty Rose",
            value: "#a67489"
        },

        {
            name: "Smoky Lilac",
            value: "#a78eb8"
        },

        {
            name: "Blackberry Ink",
            value: "#3b214d"
        }

    ];


    const OCTOBER_TEXT_COLORS = [

        {
            name: "Warm Cream",
            value: "#f4e8d4"
        },

        {
            name: "Antique Gold",
            value: "#c99a4f"
        },

        {
            name: "Blackberry Ink",
            value: "#211724"
        }

    ];


    /* ========================================================
       BOOK FONT LIBRARY

       These values match the classes prepared in books.css.
       ======================================================== */

    const BOOK_FONTS = [

        {
            value: "storybook",
            name: "Storybook",
            sample: "Once Upon October",
            family:
                "var(--spine-font-whimsical)"
        },

        {
            value: "dreamy",
            name: "Dreamy",
            sample: "Midnight Stories",
            family:
                "var(--spine-font-dreamy)"
        },

        {
            value: "handwritten",
            name: "Handwritten",
            sample: "Sleepover Notes",
            family:
                "var(--spine-font-handwritten)"
        },

        {
            value: "gothic",
            name: "Old Spooky",
            sample: "The Haunted Library",
            family:
                "var(--spine-font-spooky)"
        },

        {
            value: "deco",
            name: "Decorative",
            sample: "October Tales",
            family:
                "var(--spine-font-gothic)"
        },

        {
            value: "elegant",
            name: "Moonlit",
            sample: "Moonlit Pages",
            family:
                "var(--spine-font-dreamy)"
        },

        {
            value: "bookish",
            name: "Bookish",
            sample: "Secret Chapters",
            family:
                "var(--spine-font-storybook)"
        },

        {
            value: "vintage",
            name: "Vintage",
            sample: "Autumn Reader",
            family:
                "var(--spine-font-vintage)"
        },

        {
            value: "cozy",
            name: "Cozy",
            sample: "Candlelight",
            family:
                "var(--spine-font-cozy)"
        },

        {
            value: "retro",
            name: "Retro Paperback",
            sample: "After Midnight",
            family:
                "var(--spine-font-retro)"
        },

        {
            value: "classic",
            name: "Classic",
            sample: "Collected Stories",
            family:
                "var(--spine-font-classic)"
        },

        {
            value: "label",
            name: "Old Bookplate",
            sample: "Private Library",
            family:
                "var(--spine-font-label)"
        }

    ];


    /* ========================================================
       SVG SPINE ORNAMENTS
       ======================================================== */

    const ORNAMENTS = {

        star: {
            label: "Star",
            symbol: "spine-star"
        },

        moon: {
            label: "Moon",
            symbol: "spine-moon"
        },

        flower: {
            label: "Flower",
            symbol: "spine-flower"
        },

        leaf: {
            label: "Vine",
            symbol: "spine-vine"
        },

        vine: {
            label: "Vine",
            symbol: "spine-vine"
        },

        web: {
            label: "Web",
            symbol: "spine-web"
        },

        ghost: {
            label: "Ghost",
            symbol: "spine-ghost"
        }

    };


    const STYLE_ORNAMENTS = {

        classic:
            "star",

        gothic:
            "moon",

        botanical:
            "vine",

        celestial:
            "star",

        floral:
            "flower",

        pastel:
            "ghost",

        minimal:
            "none",

        leather:
            "moon",

        academia:
            "star",

        storybook:
            "moon"

    };


    /* ========================================================
       INIT
       ======================================================== */

    function init() {

        bindBookDrawer();

        bindBookReveal();

        bindLivePreview();

        populateShelfSelect();

        prepareBookDesigner();

        updateSpinePreview();

    }


    /* ========================================================
       STATE
       ======================================================== */

    function getState() {

        return (
            Novellow.state ||
            {}
        );

    }


    function getBooks() {

        return Array.isArray(
            getState().books
        )
            ? getState().books
            : [];

    }


    /* ========================================================
       BOOK DRAWER
       ======================================================== */

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
            get(
                "bookForm"
            );


        if (
            form &&
            !form.dataset.booksBound
        ) {

            form.dataset.booksBound =
                "true";


            form.addEventListener(
                "submit",
                handleBookSubmit
            );

        }


        const coverUpload =
            get(
                "bookCoverUpload"
            );


        if (
            coverUpload &&
            !coverUpload.dataset.booksBound
        ) {

            coverUpload.dataset.booksBound =
                "true";


            coverUpload.addEventListener(
                "change",
                handleCoverUpload
            );

        }

    }


    /* ========================================================
       BOOK REVEAL
       ======================================================== */

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


                const id =
                    revealBookId;


                closeReveal();

                openEditDrawer(
                    id
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


                getState()
                    .selectedBookId =
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
            get(
                "bookReveal"
            );


        if (
            reveal &&
            !reveal.dataset.booksBound
        ) {

            reveal.dataset.booksBound =
                "true";


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


    /* ========================================================
       DESIGNER SETUP
       ======================================================== */

    function prepareBookDesigner() {

        ensureFontOptions();

        ensureOrnamentOptions();

        buildColorPicker(
            "bookSpineColor",
            "novellowSpineColors",
            OCTOBER_BOOK_COLORS,
            "Book color"
        );


        buildColorPicker(
            "bookAccentColor",
            "novellowAccentColors",
            OCTOBER_ACCENT_COLORS,
            "Detail color"
        );


        buildColorPicker(
            "bookTextColor",
            "novellowTextColors",
            OCTOBER_TEXT_COLORS,
            "Title color"
        );


        buildFontPicker();

        syncDesignerControls();

    }


    /* ========================================================
       ENSURE SELECT OPTIONS EXIST

       This lets us introduce new values without requiring an
       index.html change yet.
       ======================================================== */

    function ensureFontOptions() {

        const select =
            get(
                "bookSpineFont"
            );


        if (!select) {
            return;
        }


        BOOK_FONTS.forEach(
            font => {

                const exists =
                    Array.from(
                        select.options
                    ).some(
                        option =>
                            option.value ===
                            font.value
                    );


                if (exists) {
                    return;
                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    font.value;

                option.textContent =
                    font.name;


                select.appendChild(
                    option
                );

            }
        );

    }


    function ensureOrnamentOptions() {

        const select =
            get(
                "bookSpineOrnament"
            );


        if (!select) {
            return;
        }


        const choices = [

            {
                value: "auto",
                label: "Automatic"
            },

            {
                value: "moon",
                label: "Moon"
            },

            {
                value: "star",
                label: "Star"
            },

            {
                value: "ghost",
                label: "Ghost"
            },

            {
                value: "flower",
                label: "Flower"
            },

            {
                value: "vine",
                label: "Vine"
            },

            {
                value: "web",
                label: "Spider Web"
            },

            {
                value: "none",
                label: "None"
            }

        ];


        choices.forEach(
            choice => {

                const exists =
                    Array.from(
                        select.options
                    ).some(
                        option =>
                            option.value ===
                            choice.value
                    );


                if (exists) {
                    return;
                }


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    choice.value;

                option.textContent =
                    choice.label;


                select.appendChild(
                    option
                );

            }
        );

    }


    /* ========================================================
       COLOR PICKER
       ======================================================== */

    function buildColorPicker(
        inputId,
        pickerId,
        colors,
        label
    ) {

        const input =
            get(
                inputId
            );


        if (!input) {
            return;
        }


        let picker =
            get(
                pickerId
            );


        if (!picker) {

            picker =
                document.createElement(
                    "div"
                );


            picker.id =
                pickerId;

            picker.className =
                "novellow-theme-picker";


            picker.setAttribute(
                "aria-label",
                label
            );


            const title =
                document.createElement(
                    "span"
                );


            title.className =
                "novellow-theme-picker-label";

            title.textContent =
                label;


            const options =
                document.createElement(
                    "div"
                );


            options.className =
                "book-color-options";


            picker.append(
                title,
                options
            );


            input.insertAdjacentElement(
                "afterend",
                picker
            );

        }


        const options =
            picker.querySelector(
                ".book-color-options"
            );


        if (!options) {
            return;
        }


        options.innerHTML =
            "";


        colors.forEach(
            color => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";

                button.className =
                    "book-color-swatch";

                button.style.setProperty(
                    "--swatch-color",
                    color.value
                );


                button.dataset.value =
                    color.value;


                button.setAttribute(
                    "aria-label",
                    color.name
                );


                button.setAttribute(
                    "title",
                    color.name
                );


                button.addEventListener(
                    "click",
                    () => {

                        input.value =
                            color.value;


                        input.dispatchEvent(
                            new Event(
                                "input",
                                {
                                    bubbles:
                                        true
                                }
                            )
                        );


                        input.dispatchEvent(
                            new Event(
                                "change",
                                {
                                    bubbles:
                                        true
                                }
                            )
                        );


                        syncColorPicker(
                            picker,
                            color.value
                        );

                    }
                );


                options.appendChild(
                    button
                );

            }
        );


        syncColorPicker(
            picker,
            input.value
        );

    }


    function syncColorPicker(
        picker,
        currentValue
    ) {

        if (!picker) {
            return;
        }


        picker
            .querySelectorAll(
                ".book-color-swatch"
            )
            .forEach(
                button => {

                    const selected =
                        normalizeColor(
                            button.dataset.value
                        ) ===
                        normalizeColor(
                            currentValue
                        );


                    button.classList.toggle(
                        "is-selected",
                        selected
                    );


                    button.setAttribute(
                        "aria-pressed",
                        selected
                            ? "true"
                            : "false"
                    );

                }
            );

    }


    /* ========================================================
       FONT PICKER
       ======================================================== */

    function buildFontPicker() {

        const select =
            get(
                "bookSpineFont"
            );


        if (!select) {
            return;
        }


        let wrapper =
            get(
                "novellowBookFontPicker"
            );


        if (!wrapper) {

            wrapper =
                document.createElement(
                    "div"
                );


            wrapper.id =
                "novellowBookFontPicker";

            wrapper.className =
                "novellow-font-picker";


            const label =
                document.createElement(
                    "span"
                );


            label.className =
                "novellow-theme-picker-label";

            label.textContent =
                "Spine font";


            const options =
                document.createElement(
                    "div"
                );


            options.className =
                "book-font-options";


            wrapper.append(
                label,
                options
            );


            select.insertAdjacentElement(
                "afterend",
                wrapper
            );

        }


        const options =
            wrapper.querySelector(
                ".book-font-options"
            );


        options.innerHTML =
            "";


        BOOK_FONTS.forEach(
            font => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";

                button.className =
                    "book-font-choice";

                button.dataset.value =
                    font.value;


                button.innerHTML = `
                    <span
                        class="book-font-choice-sample"
                        style="
                            font-family:
                            ${font.family};
                        "
                    >
                        ${escape(
                            font.sample
                        )}
                    </span>

                    <small>
                        ${escape(
                            font.name
                        )}
                    </small>
                `;


                button.addEventListener(
                    "click",
                    () => {

                        select.value =
                            font.value;


                        select.dispatchEvent(
                            new Event(
                                "change",
                                {
                                    bubbles:
                                        true
                                }
                            )
                        );


                        syncFontPicker();

                    }
                );


                options.appendChild(
                    button
                );

            }
        );


        syncFontPicker();

    }


    function syncFontPicker() {

        const select =
            get(
                "bookSpineFont"
            );


        const wrapper =
            get(
                "novellowBookFontPicker"
            );


        if (
            !select ||
            !wrapper
        ) {
            return;
        }


        wrapper
            .querySelectorAll(
                ".book-font-choice"
            )
            .forEach(
                button => {

                    const selected =
                        button.dataset.value ===
                        select.value;


                    button.classList.toggle(
                        "is-selected",
                        selected
                    );


                    button.setAttribute(
                        "aria-pressed",
                        selected
                            ? "true"
                            : "false"
                    );

                }
            );

    }


    /* ========================================================
       SYNC DESIGNER CONTROLS
       ======================================================== */

    function syncDesignerControls() {

        syncColorPicker(
            get(
                "novellowSpineColors"
            ),
            value(
                "bookSpineColor"
            )
        );


        syncColorPicker(
            get(
                "novellowAccentColors"
            ),
            value(
                "bookAccentColor"
            )
        );


        syncColorPicker(
            get(
                "novellowTextColors"
            ),
            value(
                "bookTextColor"
            )
        );


        syncFontPicker();

    }


    /* ========================================================
       LIVE PREVIEW BINDING
       ======================================================== */

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
                    get(
                        id
                    );


                if (
                    !element ||
                    element.dataset.previewBound
                ) {
                    return;
                }


                element.dataset.previewBound =
                    "true";


                element.addEventListener(
                    "input",
                    () => {

                        syncDesignerControls();

                        updateSpinePreview();

                    }
                );


                element.addEventListener(
                    "change",
                    () => {

                        syncDesignerControls();

                        updateSpinePreview();

                    }
                );

            }
        );

    }


    /* ========================================================
       OPEN ADD DRAWER
       ======================================================== */

    function openAddDrawer(
        shelfId = ""
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

        prepareBookDesigner();

        updateSpinePreview();

        openDrawer();


        requestAnimationFrame(
            () => {

                get(
                    "bookTitle"
                )?.focus();

            }
        );

    }


    /* ========================================================
       OPEN EDIT DRAWER
       ======================================================== */

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
            "storybook"
        );


        setValue(
            "bookSpineColor",
            design.spineColor ||
            "#5b3a6b"
        );


        setValue(
            "bookTextColor",
            design.textColor ||
            "#f4e8d4"
        );


        setValue(
            "bookAccentColor",
            design.accentColor ||
            "#c99a4f"
        );


        setValue(
            "bookSpineOrnament",
            design.ornament ||
            "auto"
        );


        setSelectValue(
            "bookSpineFont",
            design.font ||
            "storybook"
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


        getState()
            .pendingCoverData =
            book.cover ||
            "";


        prepareBookDesigner();

        updateSpinePreview();

        openDrawer();

    }


    /* ========================================================
       DRAWER
       ======================================================== */

    function openDrawer() {

        const drawer =
            get(
                "bookDrawer"
            );


        if (!drawer) {
            return;
        }


        drawer.hidden =
            false;


        const overlay =
            get(
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


    function closeDrawer() {

        const drawer =
            get(
                "bookDrawer"
            );


        if (drawer) {

            drawer.hidden =
                true;

        }


        getState()
            .pendingCoverData =
            null;


        syncOverlay();

    }


    /* ========================================================
       RESET
       ======================================================== */

    function resetBookForm() {

        const form =
            get(
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


        getState()
            .pendingCoverData =
            null;

    }


    /* ========================================================
       DEFAULT OCTOBER BOOK DESIGN
       ======================================================== */

    function applyDefaultDesign() {

        setValue(
            "bookStyle",
            "storybook"
        );


        setValue(
            "bookSpineColor",
            "#5b3a6b"
        );


        setValue(
            "bookTextColor",
            "#f4e8d4"
        );


        setValue(
            "bookAccentColor",
            "#c99a4f"
        );


        setValue(
            "bookSpineOrnament",
            "auto"
        );


        setSelectValue(
            "bookSpineFont",
            "storybook"
        );


        setValue(
            "bookSpineFontSize",
            "medium"
        );


        setValue(
            "bookSpineFontWeight",
            "regular"
        );


        setValue(
            "bookSpineLetterSpacing",
            "normal"
        );


        setValue(
            "bookSpineCase",
            "typed"
        );


        setValue(
            "bookSpineFontStyle",
            "normal"
        );


        setValue(
            "bookSpineTextAlign",
            "center"
        );


        setValue(
            "bookSpineTitlePanel",
            "none"
        );


        setValue(
            "bookHeight",
            "medium"
        );


        setValue(
            "bookThickness",
            "medium"
        );


        syncDesignerControls();

    }


    /* ========================================================
       SUBMIT BOOK
       ======================================================== */

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


        const rawBook = {

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

        };


        const book =
            H.normalizeBook?.(
                rawBook
            ) ||
            rawBook;


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
                index !==
                -1
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


    /* ========================================================
       COLLECT BOOK DESIGN
       ======================================================== */

    function collectBookDesign() {

        const design = {

            style:
                value(
                    "bookStyle"
                ) ||
                "storybook",

            spineColor:
                value(
                    "bookSpineColor"
                ) ||
                "#5b3a6b",

            textColor:
                value(
                    "bookTextColor"
                ) ||
                "#f4e8d4",

            accentColor:
                value(
                    "bookAccentColor"
                ) ||
                "#c99a4f",

            ornament:
                value(
                    "bookSpineOrnament"
                ) ||
                "auto",

            font:
                value(
                    "bookSpineFont"
                ) ||
                "storybook",

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
                design
            ) ||
            design
        );

    }


    /* ========================================================
       COVER UPLOAD
       ======================================================== */

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


            getState()
                .pendingCoverData =
                data ||
                null;


            H.showToast?.(
                "Cover added.",
                "success"
            );

        } catch (error) {

            console.error(
                error
            );


            H.showToast?.(
                "That cover could not be loaded.",
                "error"
            );

        }

    }


    /* ========================================================
       CREATE SHELF BOOK
       ======================================================== */

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
            `Open ${
                book.title ||
                "book"
            }`
        );


        applyBookColors(
            button,
            design
        );


        const title =
            applyTextCase(
                book.title ||
                "Untitled",
                design.letterCase
            );


        button.innerHTML = `

            <span
                class="spine-inner"
            >

                ${renderSpineFrame(
                    design
                )}

                <span
                    class="spine-title-panel"
                >

                    <span
                        class="spine-title"
                    >
                        ${escape(
                            title
                        )}
                    </span>

                </span>

                <span
                    class="spine-ornament"
                    aria-hidden="true"
                >
                    ${renderOrnamentSVG(
                        design.ornament,
                        design.style
                    )}
                </span>

            </span>

        `;


        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                const bookId =
                    book.id;


                getState()
                    .selectedBookId =
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


    /* ========================================================
       OPTIONAL SVG SPINE FRAME

       Gives ornate/storybook books extra art without putting
       horizontal bars back on the book.
       ======================================================== */

    function renderSpineFrame(
        design
    ) {

        const style =
            design.style ||
            "classic";


        let symbol =
            "";


        if (
            style ===
            "gothic"
        ) {

            symbol =
                "spine-ornate-label";

        }


        if (
            style ===
            "storybook"
        ) {

            symbol =
                "spine-arch-label";

        }


        if (!symbol) {
            return "";
        }


        return `
            <svg
                class="spine-frame-svg"
                viewBox="0 0 100 300"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <use
                    href="${OCTOBER_ASSET}#${symbol}"
                ></use>
            </svg>
        `;

    }


    /* ========================================================
       ORNAMENT SVG
       ======================================================== */

    function renderOrnamentSVG(
        ornament,
        style
    ) {

        const resolved =
            resolveOrnament(
                ornament,
                style
            );


        if (
            !resolved ||
            resolved ===
            "none"
        ) {

            return "";

        }


        const config =
            ORNAMENTS[
                resolved
            ];


        if (!config) {
            return "";
        }


        return `
            <svg
                class="spine-ornament-svg"
                viewBox="0 0 64 64"
                aria-hidden="true"
            >
                <use
                    href="${OCTOBER_ASSET}#${config.symbol}"
                ></use>
            </svg>
        `;

    }


    function resolveOrnament(
        ornament,
        style
    ) {

        const requested =
            ornament ||
            "auto";


        if (
            requested ===
            "none"
        ) {

            return "none";

        }


        if (
            requested !==
            "auto"
        ) {

            if (
                requested ===
                "leaf"
            ) {

                return "vine";

            }


            if (
                requested ===
                "diamond"
            ) {

                return "star";

            }


            if (
                requested ===
                "heart"
            ) {

                return "flower";

            }


            return requested;

        }


        return (
            STYLE_ORNAMENTS[
                style
            ] ||
            "star"
        );

    }


    /* ========================================================
       BOOK CLASS LIST
       ======================================================== */

    function buildBookClassList(
        design,
        preview = false
    ) {

        const classes = [

            preview
                ? "spine-preview-book"
                : "book-spine",

            `book-style-${
                design.style ||
                "storybook"
            }`,

            `book-font-${
                design.font ||
                "storybook"
            }`,

            `book-font-size-${
                design.fontSize ||
                "medium"
            }`,

            `book-font-weight-${
                design.fontWeight ||
                "regular"
            }`,

            `book-letter-spacing-${
                design.letterSpacing ||
                "normal"
            }`,

            `book-font-style-${
                design.fontStyle ||
                "normal"
            }`,

            `book-text-align-${
                design.textAlign ||
                "center"
            }`,

            `book-title-panel-${
                design.titlePanel ||
                "none"
            }`

        ];


        if (!preview) {

            classes.push(

                `book-height-${
                    design.height ||
                    "medium"
                }`,

                `book-thickness-${
                    design.thickness ||
                    "medium"
                }`

            );

        }


        /*
           Preserve advanced design classes if they already
           exist on older saved books.
        */

        const optional = [

            [
                "material",
                "book-material-"
            ],

            [
                "texture",
                "book-texture-"
            ],

            [
                "wear",
                "book-wear-"
            ],

            [
                "edgeWear",
                "book-edge-wear-"
            ],

            [
                "curve",
                "book-curve-"
            ],

            [
                "depth",
                "book-depth-"
            ],

            [
                "sheen",
                "book-sheen-"
            ],

            [
                "borderStyle",
                "book-border-"
            ]

        ];


        optional.forEach(
            ([
                property,
                prefix
            ]) => {

                const selected =
                    design[
                        property
                    ];


                if (
                    selected &&
                    selected !==
                    "none"
                ) {

                    classes.push(
                        `${prefix}${selected}`
                    );

                }

            }
        );


        return classes
            .filter(Boolean)
            .join(
                " "
            );

    }


    /* ========================================================
       BOOK COLORS
       ======================================================== */

    function applyBookColors(
        element,
        design
    ) {

        if (!element) {
            return;
        }


        element.style.setProperty(
            "--book-color",
            design.spineColor ||
            "#5b3a6b"
        );


        element.style.setProperty(
            "--book-text",
            design.textColor ||
            "#f4e8d4"
        );


        element.style.setProperty(
            "--book-accent",
            design.accentColor ||
            "#c99a4f"
        );

    }


    /* ========================================================
       PREVIEW
       ======================================================== */

    function updateSpinePreview() {

        const preview =
            get(
                "bookSpinePreview"
            );


        if (!preview) {
            return;
        }


        const design =
            collectBookDesign();


        preview.className =
            buildBookClassList(
                design,
                true
            );


        preview.classList.add(
            `book-style-${
                design.style ||
                "storybook"
            }`
        );


        applyBookColors(
            preview,
            design
        );


        const title =
            applyTextCase(
                value(
                    "bookTitle"
                ) ||
                "Book Title",
                design.letterCase
            );


        const previewTitle =
            get(
                "bookSpinePreviewTitle"
            );


        if (previewTitle) {

            previewTitle.textContent =
                title;


            previewTitle.style.fontFamily =
                mapPreviewFont(
                    design.font
                );


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

        }


        const ornament =
            get(
                "bookSpinePreviewOrnament"
            );


        if (ornament) {

            ornament.innerHTML =
                renderOrnamentSVG(
                    design.ornament,
                    design.style
                );

        }


        const panel =
            get(
                "bookSpinePreviewTitlePanel"
            );


        if (panel) {

            panel.className =
                "spine-preview-title-panel";


            if (
                design.titlePanel &&
                design.titlePanel !==
                "none"
            ) {

                panel.classList.add(
                    `preview-panel-${
                        design.titlePanel
                    }`
                );

            }

        }


        syncDesignerControls();

    }


    /* ========================================================
       COVER
       ======================================================== */

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


        if (book.cover) {

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "cover-image";


            image.src =
                book.cover;


            image.alt =
                `${
                    book.title ||
                    "Book"
                } cover`;


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
            "#5b3a6b"
        );


        generated.style.setProperty(
            "--cover-text",
            design.textColor ||
            "#f4e8d4"
        );


        generated.style.setProperty(
            "--cover-accent",
            design.accentColor ||
            "#c99a4f"
        );


        generated.innerHTML = `

            <div
                class="generated-cover-title"
            >
                ${escape(
                    book.title ||
                    "Untitled Book"
                )}
            </div>

            <div
                class="generated-cover-author"
            >
                ${escape(
                    book.author ||
                    ""
                )}
            </div>

            <div
                class="generated-cover-ornament"
                aria-hidden="true"
            >
                ${renderOrnamentSVG(
                    design.ornament,
                    design.style
                )}
            </div>

        `;


        wrapper.appendChild(
            generated
        );


        return wrapper;

    }


    /* ========================================================
       OPEN REVEAL
       ======================================================== */

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


        getState()
            .selectedBookId =
            book.id;


        const reveal =
            get(
                "bookReveal"
            );


        if (!reveal) {
            return;
        }


        const cover =
            get(
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
            get(
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


    /* ========================================================
       CLOSE REVEAL
       ======================================================== */

    function closeReveal() {

        const reveal =
            get(
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


    /* ========================================================
       DELETE
       ======================================================== */

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
            state.selectedBookId ===
            bookId
        ) {

            state.selectedBookId =
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


    /* ========================================================
       SHELF SELECT
       ======================================================== */

    function populateShelfSelect(
        selectedId = ""
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
            get(
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


    /* ========================================================
       SAVE
       ======================================================== */

    function saveBooks() {

        Novellow.storage
            ?.saveBooks?.();

    }


    /* ========================================================
       REFRESH CONNECTED VIEWS
       ======================================================== */

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


    /* ========================================================
       OVERLAY
       ======================================================== */

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
                        get(
                            id
                        );


                    return (
                        element &&
                        !element.hidden
                    );

                }
            );


        const overlay =
            get(
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
                            get(
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


    /* ========================================================
       FONT HELPERS
       ======================================================== */

    function mapPreviewFont(
        font
    ) {

        const map = {

            serif:
                "var(--spine-font-vintage)",

            roman:
                "var(--spine-font-classic)",

            bookish:
                "var(--spine-font-storybook)",

            elegant:
                "var(--spine-font-dreamy)",

            typewriter:
                "var(--spine-font-retro)",

            clean:
                "var(--font-literary)",

            condensed:
                "var(--spine-font-gothic)",

            heavy:
                "var(--spine-font-cozy)",

            storybook:
                "var(--spine-font-whimsical)",

            handwritten:
                "var(--spine-font-handwritten)",

            gothic:
                "var(--spine-font-spooky)",

            deco:
                "var(--spine-font-gothic)",

            retro:
                "var(--spine-font-retro)",

            whimsical:
                "var(--spine-font-whimsical)",

            dreamy:
                "var(--spine-font-dreamy)",

            spooky:
                "var(--spine-font-spooky)",

            vintage:
                "var(--spine-font-vintage)",

            cozy:
                "var(--spine-font-cozy)",

            classic:
                "var(--spine-font-classic)",

            label:
                "var(--spine-font-label)"

        };


        return (
            map[
                font
            ] ||
            "var(--spine-font-storybook)"
        );

    }


    function mapFontWeight(
        weight
    ) {

        const map = {

            light:
                "400",

            regular:
                "500",

            bold:
                "700",

            heavy:
                "700"

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
                "0.07em",

            "extra-wide":
                "0.12em"

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
                "0.58rem",

            medium:
                "0.70rem",

            large:
                "0.82rem",

            xlarge:
                "0.94rem"

        };


        return (
            map[
                size
            ] ||
            "0.70rem"
        );

    }


    /* ========================================================
       TEXT CASE
       ======================================================== */

    function applyTextCase(
        input,
        mode
    ) {

        if (
            H.applyTextCase
        ) {

            return H.applyTextCase(
                input,
                mode
            );

        }


        const text =
            String(
                input ||
                ""
            );


        switch (mode) {

            case "uppercase":
                return text
                    .toUpperCase();

            case "lowercase":
                return text
                    .toLowerCase();

            case "title":
                return text.replace(
                    /\b\w/g,
                    character =>
                        character
                            .toUpperCase()
                );

            default:
                return text;

        }

    }


    /* ========================================================
       VALUES
       ======================================================== */

    function get(
        id
    ) {

        return (
            H.getById?.(
                id
            ) ||
            document.getElementById(
                id
            )
        );

    }


    function setValue(
        id,
        nextValue
    ) {

        const element =
            get(
                id
            );


        if (!element) {
            return;
        }


        element.value =
            nextValue ??
            "";

    }


    function setSelectValue(
        id,
        nextValue
    ) {

        const select =
            get(
                id
            );


        if (!select) {
            return;
        }


        const exists =
            Array.from(
                select.options ||
                []
            ).some(
                option =>
                    option.value ===
                    nextValue
            );


        if (!exists) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                nextValue;

            option.textContent =
                nextValue;


            select.appendChild(
                option
            );

        }


        select.value =
            nextValue;

    }


    function value(
        id
    ) {

        return (
            get(
                id
            )?.value ??
            ""
        );

    }


    function normalizeColor(
        color
    ) {

        return String(
            color ||
            ""
        )
            .trim()
            .toLowerCase();

    }


    /* ========================================================
       FORMATTING
       ======================================================== */

    function formatRating(
        rating
    ) {

        const ratingValue =
            Math.max(
                0,
                Math.min(
                    5,
                    Number(
                        rating
                    ) || 0
                )
            );


        if (!ratingValue) {

            return "Not rated";

        }


        return "★".repeat(
            ratingValue
        );

    }


    /* ========================================================
       ESCAPE
       ======================================================== */

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


    /* ========================================================
       PUBLIC API
       ======================================================== */

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

        refreshConnectedViews,

        renderOrnamentSVG

    };


})();
