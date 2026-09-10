/* ========================================================
   NOVELLOW
   LIBRARY.JS
   VERSION 13

   Shelf creation
   Shelf editing
   Shelf deletion
   Shelf rendering
   Shelf book population
   October Sleepover SVG decorations
   Legacy theme decoration fallback
   Decoration dragging
   Decoration scaling
   ========================================================= */


(() => {

    "use strict";


    /* =====================================================
       CONFIG / STATE / HELPERS
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


    const state =
        Novellow.state;


    /* =====================================================
       MODULE STATE
       ===================================================== */

    let initialized =
        false;


    let activeDrag =
        null;


    /* =====================================================
       OCTOBER SLEEPOVER ART
       ===================================================== */

    const OCTOBER_ASSET =
        "assets/october-sleepover.svg";


    /*
       "haunted" is included temporarily because that is the
       old ID used by the current default theme.

       When themes.js/config.js is rebuilt, October Sleepover
       will receive its own permanent theme ID.
    */

    const OCTOBER_THEME_IDS =
        new Set([
            "haunted",
            "default",
            "october",
            "october-sleepover"
        ]);


    /*
       Existing decoration types are mapped to the new SVG
       illustration library.

       Additional October Sleepover objects are included now
       so we can expose them in the Shelf Designer later
       without rewriting library.js again.
    */

    const OCTOBER_SVG_SYMBOLS = {

        cat:
            "decor-black-cat",

        ghost:
            "decor-tiny-ghost",

        mushroom:
            "decor-mushroom",

        candle:
            "decor-candle",

        mug:
            "decor-ghost-mug",

        potion:
            "decor-potion-bottle",

        crystal:
            "decor-crystals",

        stars:
            "decor-stars",

        eightball:
            "decor-magic-eight-ball",

        "magic-eight-ball":
            "decor-magic-eight-ball",

        moon:
            "decor-moon-stars",

        "moon-stars":
            "decor-moon-stars",

        web:
            "decor-spider-web",

        "spider-web":
            "decor-spider-web",

        key:
            "decor-old-key",

        "old-key":
            "decor-old-key",

        flashlight:
            "decor-flashlight",

        "round-potion":
            "decor-round-potion",

        heart:
            "decor-heart-sparkle"

    };


    /*
       These decorations exist specifically because of the
       October Sleepover art pack.

       If they somehow exist while another theme is active,
       we still render them rather than showing a blank item.
    */

    const OCTOBER_ONLY_DECORATIONS =
        new Set([
            "eightball",
            "magic-eight-ball",
            "moon",
            "moon-stars",
            "web",
            "spider-web",
            "key",
            "old-key",
            "flashlight",
            "round-potion",
            "heart"
        ]);


    /* =====================================================
       INITIALIZE
       ===================================================== */

    function init() {

        if (initialized) {
            return;
        }


        initialized =
            true;


        bindShelfControls();

        bindDecorationDragging();

        render();

    }


    /* =====================================================
       SHELF DRAWER CONTROLS
       ===================================================== */

    function bindShelfControls() {

        H.bindClick?.(
            "closeShelfDrawer",
            closeShelfDrawer
        );


        H.bindClick?.(
            "cancelShelfButton",
            closeShelfDrawer
        );


        const form =
            H.getById?.(
                "shelfForm"
            );


        if (form) {

            form.addEventListener(
                "submit",
                handleShelfSubmit
            );

        }

    }


    /* =====================================================
       OPEN ADD SHELF
       ===================================================== */

    function openAddShelfDrawer() {

        resetShelfForm();


        H.setText?.(
            "shelfDrawerTitle",
            "Add a Shelf"
        );


        H.setText?.(
            "saveShelfButtonLabel",
            "Save Shelf"
        );


        Novellow.panels
            ?.openPanel?.(
                "shelfDrawer"
            );


        requestAnimationFrame(
            () => {

                H.getById?.(
                    "shelfName"
                )?.focus();

            }
        );

    }


    /* =====================================================
       OPEN EDIT SHELF
       ===================================================== */

    function openEditShelfDrawer(
        shelfId
    ) {

        const shelf =
            getShelfById(
                shelfId
            );


        if (!shelf) {
            return;
        }


        resetShelfForm();


        H.setText?.(
            "shelfDrawerTitle",
            "Edit Shelf"
        );


        H.setText?.(
            "saveShelfButtonLabel",
            "Save Changes"
        );


        setInputValue(
            "editingShelfId",
            shelf.id
        );


        setInputValue(
            "shelfName",
            shelf.name
        );


        setInputValue(
            "shelfDescription",
            shelf.description
        );


        setInputValue(
            "shelfMaterial",
            shelf.material
        );


        setInputValue(
            "shelfMood",
            shelf.mood
        );


        setInputValue(
            "shelfLayout",
            shelf.layout
        );


        setInputValue(
            "shelfSort",
            shelf.sort ||
            shelf.sortMode ||
            shelf.sort_mode ||
            "manual"
        );


        syncDecorationCheckboxes(
            shelf.decorations
        );


        Novellow.panels
            ?.openPanel?.(
                "shelfDrawer"
            );

    }


    /* =====================================================
       CLOSE SHELF DRAWER
       ===================================================== */

    function closeShelfDrawer() {

        Novellow.panels
            ?.closeAllPanels?.();

    }


    /* =====================================================
       RESET SHELF FORM
       ===================================================== */

    function resetShelfForm() {

        const form =
            H.getById?.(
                "shelfForm"
            );


        form?.reset();


        setInputValue(
            "editingShelfId",
            ""
        );


        setInputValue(
            "shelfMaterial",
            CONFIG.defaultShelf?.material ||
            "walnut"
        );


        setInputValue(
            "shelfMood",
            CONFIG.defaultShelf?.mood ||
            "cozy"
        );


        setInputValue(
            "shelfLayout",
            CONFIG.defaultShelf?.layout ||
            "mixed"
        );


        setInputValue(
            "shelfSort",
            state.settings
                ?.defaultShelfSort ||
            CONFIG.defaultShelf?.sort ||
            "manual"
        );


        syncDecorationCheckboxes(
            []
        );

    }


    /* =====================================================
       SAVE SHELF
       ===================================================== */

    function handleShelfSubmit(
        event
    ) {

        event.preventDefault();


        const editingId =
            getInputValue(
                "editingShelfId"
            );


        const existing =
            editingId
                ? getShelfById(
                    editingId
                )
                : null;


        const name =
            getInputValue(
                "shelfName"
            ).trim();


        if (!name) {

            H.showToast?.(
                "Give your shelf a name first.",
                "error"
            );

            return;

        }


        const selectedDecorations =
            getSelectedDecorations(
                existing
            );


        const sort =
            getInputValue(
                "shelfSort"
            ) ||
            "manual";


        const rawShelf = {

            ...existing,

            id:
                existing?.id ||
                createId(
                    "shelf"
                ),

            name,

            description:
                getInputValue(
                    "shelfDescription"
                ).trim(),

            material:
                getInputValue(
                    "shelfMaterial"
                ) ||
                CONFIG.defaultShelf
                    ?.material ||
                "walnut",

            mood:
                getInputValue(
                    "shelfMood"
                ) ||
                CONFIG.defaultShelf
                    ?.mood ||
                "cozy",

            layout:
                getInputValue(
                    "shelfLayout"
                ) ||
                CONFIG.defaultShelf
                    ?.layout ||
                "mixed",

            /*
               Keep all three during the localStorage /
               Supabase transition.
            */

            sort,

            sortMode:
                sort,

            sort_mode:
                sort,

            decorations:
                selectedDecorations,

            position:
                existing?.position ??
                getNextShelfPosition(),

            createdAt:
                existing?.createdAt ||
                existing?.created_at ||
                nowISO(),

            updatedAt:
                nowISO()

        };


        const normalized =
            typeof H.normalizeShelf ===
                "function"
                ? H.normalizeShelf(
                    rawShelf
                )
                : rawShelf;


        const shelfData = {

            ...rawShelf,

            ...normalized,

            id:
                rawShelf.id,

            sort,

            sortMode:
                sort,

            sort_mode:
                sort,

            decorations:
                selectedDecorations,

            position:
                rawShelf.position

        };


        if (existing) {

            const index =
                state.shelves.findIndex(
                    shelf =>
                        String(
                            shelf.id
                        ) ===
                        String(
                            existing.id
                        )
                );


            if (
                index !==
                -1
            ) {

                state.shelves[
                    index
                ] =
                    shelfData;

            }


            H.showToast?.(
                "Shelf updated.",
                "success"
            );

        } else {

            state.shelves.push(
                shelfData
            );


            H.showToast?.(
                "Shelf added to your library.",
                "success"
            );

        }


        Novellow.storage
            ?.saveShelves?.();


        closeShelfDrawer();


        render();


        Novellow.books
            ?.populateShelfSelect?.();


        Novellow.stats
            ?.render?.();

    }


    /* =====================================================
       DELETE SHELF
       ===================================================== */

    async function deleteShelf(
        shelfId
    ) {

        const shelf =
            getShelfById(
                shelfId
            );


        if (!shelf) {
            return;
        }


        const booksOnShelf =
            getBooksForShelf(
                shelfId
            );


        let message =
            `Delete "${shelf.name}"?`;


        if (
            booksOnShelf.length >
            0
        ) {

            message +=
                ` The ${booksOnShelf.length} book${booksOnShelf.length === 1 ? "" : "s"} on it will stay in Novellow but become unshelved.`;

        }


        const confirmed =
            typeof H.confirmAction ===
                "function"
                ? H.confirmAction(
                    message
                )
                : window.confirm(
                    message
                );


        if (!confirmed) {
            return;
        }


        /*
           Remove shelf locally.
        */

        state.shelves =
            state.shelves.filter(
                item =>
                    String(
                        item.id
                    ) !==
                    String(
                        shelfId
                    )
            );


        /*
           Books remain in Novellow.

           Clear BOTH property names because different parts
           of the app currently understand different versions.
        */

        state.books =
            state.books.map(
                book => {

                    const bookShelfId =
                        book.shelfId ||
                        book.shelf_id ||
                        "";


                    if (
                        String(
                            bookShelfId
                        ) !==
                        String(
                            shelfId
                        )
                    ) {

                        return book;

                    }


                    return {

                        ...book,

                        shelfId:
                            "",

                        shelf_id:
                            null,

                        updatedAt:
                            nowISO()

                    };

                }
            );


        Novellow.storage
            ?.saveShelves?.();


        Novellow.storage
            ?.saveBooks?.();


        /*
           app.js's general cloud queue handles inserts and
           updates, but deleting a row requires an explicit
           Supabase delete.
        */

        if (
            Novellow.currentUser?.id &&
            typeof Novellow.supabase
                ?.deleteShelf ===
                "function"
        ) {

            try {

                await Novellow.supabase
                    .deleteShelf(
                        shelfId
                    );

            } catch (error) {

                console.error(
                    "Novellow could not delete the shelf from Supabase.",
                    error
                );


                H.showToast?.(
                    "The shelf was removed here, but cloud deletion needs another try.",
                    "error"
                );

            }

        }


        render();


        Novellow.books
            ?.populateShelfSelect?.();


        Novellow.reading
            ?.render?.();


        Novellow.stats
            ?.render?.();


        H.showToast?.(
            "Shelf deleted.",
            "success"
        );

    }


    /* =====================================================
       RENDER LIBRARY
       ===================================================== */

    function render() {

        const container =
            H.getById?.(
                "shelfContainer"
            );


        if (!container) {
            return;
        }


        updateLibrarySummary();


        container.innerHTML =
            "";


        const shelves =
            Array.isArray(
                state.shelves
            )
                ? state.shelves
                : [];


        const emptyState =
            H.getById?.(
                "libraryEmptyState"
            );


        if (
            shelves.length ===
            0
        ) {

            if (emptyState) {

                emptyState.hidden =
                    false;

            }


            return;

        }


        if (emptyState) {

            emptyState.hidden =
                true;

        }


        const orderedShelves =
            [...shelves].sort(
                (
                    first,
                    second
                ) => {

                    return (
                        Number(
                            first.position ||
                            0
                        ) -
                        Number(
                            second.position ||
                            0
                        )
                    );

                }
            );


        orderedShelves.forEach(
            shelf => {

                container.appendChild(
                    createShelfElement(
                        shelf
                    )
                );

            }
        );

    }


    /* =====================================================
       LIBRARY SUMMARY
       ===================================================== */

    function updateLibrarySummary() {

        const books =
            Array.isArray(
                state.books
            )
                ? state.books
                : [];


        const shelves =
            Array.isArray(
                state.shelves
            )
                ? state.shelves
                : [];


        const readingCount =
            books.filter(
                book =>
                    book.status ===
                    "reading"
            ).length;


        H.setText?.(
            "libraryBookCount",
            books.length
        );


        H.setText?.(
            "libraryShelfCount",
            shelves.length
        );


        H.setText?.(
            "libraryReadingCount",
            readingCount
        );

    }


    /* =====================================================
       CREATE SHELF ELEMENT
       ===================================================== */

    function createShelfElement(
        shelf
    ) {

        const article =
            document.createElement(
                "article"
            );


        article.className =
            [
                "library-shelf",
                `material-${safeClass(
                    shelf.material ||
                    "walnut"
                )}`,
                `mood-${safeClass(
                    shelf.mood ||
                    "cozy"
                )}`,
                `layout-${safeClass(
                    shelf.layout ||
                    "mixed"
                )}`
            ].join(
                " "
            );


        article.dataset.shelfId =
            shelf.id;


        article.dataset.theme =
            getActiveTheme();


        const books =
            sortShelfBooks(
                getBooksForShelf(
                    shelf.id
                ),
                shelf.sort ||
                shelf.sortMode ||
                shelf.sort_mode ||
                "manual"
            );


        article.innerHTML =
            `
                <header class="shelf-header">

                    <div class="shelf-heading-copy">

                        <span class="shelf-eyebrow">
                            ${escapeHTML(
                                shelf.mood ||
                                "bookshelf"
                            )}
                        </span>

                        <h2>
                            ${escapeHTML(
                                shelf.name ||
                                "Untitled Shelf"
                            )}
                        </h2>

                        ${
                            shelf.description
                                ? `
                                    <p>
                                        ${escapeHTML(
                                            shelf.description
                                        )}
                                    </p>
                                `
                                : ""
                        }

                    </div>

                    <div class="shelf-actions">

                        <button
                            type="button"
                            class="shelf-action-button"
                            data-shelf-add-book="${escapeHTML(
                                shelf.id
                            )}"
                        >
                            + Book
                        </button>

                        <button
                            type="button"
                            class="shelf-action-button"
                            data-shelf-edit="${escapeHTML(
                                shelf.id
                            )}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="shelf-action-button danger"
                            data-shelf-delete="${escapeHTML(
                                shelf.id
                            )}"
                        >
                            Delete
                        </button>

                    </div>

                </header>


                <div
                    class="shelf-interior"
                    data-shelf-interior="${escapeHTML(
                        shelf.id
                    )}"
                >

                    <!--
                        BOOKS
                    -->

                    <div
                        class="shelf-books"
                        data-shelf-books="${escapeHTML(
                            shelf.id
                        )}"
                    ></div>


                    <!--
                        SHELF BOARD
                    -->

                    <div
                        class="shelf-floor"
                        aria-hidden="true"
                    ></div>


                    ${
                        books.length ===
                        0
                            ? `
                                <div class="shelf-empty">

                                    <strong>
                                        Nothing here yet.
                                    </strong>

                                    <span>
                                        Add a book to this shelf.
                                    </span>

                                </div>
                            `
                            : ""
                    }


                    <!--
                        DECOR

                        SVG artwork and older CSS artwork both
                        live inside the same movable layer.
                    -->

                    <div
                        class="shelf-decoration-layer"
                        data-decoration-layer="${escapeHTML(
                            shelf.id
                        )}"
                    ></div>

                </div>


                <div class="shelf-footer-label">

                    ${books.length}

                    ${
                        books.length ===
                        1
                            ? "book"
                            : "books"
                    }

                </div>
            `;


        const booksContainer =
            article.querySelector(
                `[data-shelf-books="${cssEscape(
                    shelf.id
                )}"]`
            );


        if (booksContainer) {

            books.forEach(
                book => {

                    const bookElement =
                        Novellow.books
                            ?.createShelfBookElement?.(
                                book
                            );


                    if (
                        bookElement
                    ) {

                        booksContainer
                            .appendChild(
                                bookElement
                            );

                    }

                }
            );

        }


        const decorationLayer =
            article.querySelector(
                `[data-decoration-layer="${cssEscape(
                    shelf.id
                )}"]`
            );


        if (decorationLayer) {

            renderShelfDecorations(
                shelf,
                decorationLayer
            );

        }


        bindShelfElementActions(
            article,
            shelf
        );


        return article;

    }


    /* =====================================================
       SHELF ACTIONS
       ===================================================== */

    function bindShelfElementActions(
        article,
        shelf
    ) {

        article
            .querySelector(
                "[data-shelf-add-book]"
            )
            ?.addEventListener(
                "click",
                () => {

                    Novellow.books
                        ?.openAddDrawer?.(
                            shelf.id
                        );

                }
            );


        article
            .querySelector(
                "[data-shelf-edit]"
            )
            ?.addEventListener(
                "click",
                () => {

                    openEditShelfDrawer(
                        shelf.id
                    );

                }
            );


        article
            .querySelector(
                "[data-shelf-delete]"
            )
            ?.addEventListener(
                "click",
                () => {

                    deleteShelf(
                        shelf.id
                    );

                }
            );

    }


    /* =====================================================
       DECORATION CHECKBOXES
       ===================================================== */

    function syncDecorationCheckboxes(
        decorations
    ) {

        const selectedTypes =
            new Set(
                (
                    Array.isArray(
                        decorations
                    )
                        ? decorations
                        : []
                )
                    .map(
                        decoration => {

                            if (
                                typeof decoration ===
                                "string"
                            ) {

                                return decoration;

                            }


                            return (
                                decoration?.type ||
                                ""
                            );

                        }
                    )
                    .filter(
                        Boolean
                    )
            );


        const checkboxes =
            H.queryAll?.(
                ".decoration-options input[type='checkbox']"
            ) ||
            document.querySelectorAll(
                ".decoration-options input[type='checkbox']"
            );


        checkboxes.forEach(
            checkbox => {

                checkbox.checked =
                    selectedTypes.has(
                        checkbox.value
                    );

            }
        );

    }


    /* =====================================================
       COLLECT SELECTED DECORATIONS
       ===================================================== */

    function getSelectedDecorations(
        existingShelf
    ) {

        const existing =
            Array.isArray(
                existingShelf?.decorations
            )
                ? existingShelf.decorations
                : [];


        const existingByType =
            new Map();


        existing.forEach(
            decoration => {

                const normalized =
                    normalizeDecoration(
                        decoration
                    );


                if (
                    normalized &&
                    !existingByType.has(
                        normalized.type
                    )
                ) {

                    existingByType.set(
                        normalized.type,
                        normalized
                    );

                }

            }
        );


        const selected =
            [];


        const checkboxes =
            H.queryAll?.(
                ".decoration-options input[type='checkbox']:checked"
            ) ||
            document.querySelectorAll(
                ".decoration-options input[type='checkbox']:checked"
            );


        checkboxes.forEach(
            checkbox => {

                const type =
                    checkbox.value;


                const existingDecoration =
                    existingByType.get(
                        type
                    );


                if (existingDecoration) {

                    selected.push(
                        existingDecoration
                    );

                    return;

                }


                selected.push(
                    normalizeDecoration({
                        id:
                            createId(
                                "decor"
                            ),

                        type,

                        x:
                            randomDecorationPosition(),

                        y:
                            randomDecorationHeight(),

                        scale:
                            1,

                        rotate:
                            randomDecorationRotation()

                    })
                );

            }
        );


        return selected.filter(
            Boolean
        );

    }


    /* =====================================================
       DECORATION NORMALIZATION
       ===================================================== */

    function normalizeDecoration(
        decoration
    ) {

        if (
            typeof decoration ===
            "string"
        ) {

            decoration = {

                id:
                    createId(
                        "decor"
                    ),

                type:
                    decoration,

                x:
                    randomDecorationPosition(),

                y:
                    randomDecorationHeight(),

                scale:
                    1,

                rotate:
                    0

            };

        }


        const helperNormalized =
            typeof H.normalizeDecoration ===
                "function"
                ? H.normalizeDecoration(
                    decoration
                )
                : decoration;


        if (!helperNormalized) {
            return null;
        }


        return {

            ...helperNormalized,

            id:
                helperNormalized.id ||
                createId(
                    "decor"
                ),

            type:
                helperNormalized.type ||
                "stars",

            x:
                clamp(
                    Number(
                        helperNormalized.x
                    ),
                    0,
                    1,
                    0.5
                ),

            y:
                clamp(
                    Number(
                        helperNormalized.y
                    ),
                    0,
                    1,
                    0.68
                ),

            scale:
                Number(
                    helperNormalized.scale
                ) ||
                1,

            rotate:
                Number(
                    helperNormalized.rotate
                ) ||
                0

        };

    }


    /* =====================================================
       RANDOM DECORATION PLACEMENT
       ===================================================== */

    function randomDecorationPosition() {

        return (
            0.08 +
            Math.random() *
            0.78
        );

    }


    function randomDecorationHeight() {

        /*
           We keep new decor mostly toward the lower half of
           the shelf so it feels like an object resting near
           the books instead of floating in the cavity.
        */

        return (
            0.55 +
            Math.random() *
            0.25
        );

    }


    function randomDecorationRotation() {

        return (
            Math.random() *
            8 -
            4
        );

    }


    /* =====================================================
       RENDER SHELF DECORATIONS
       ===================================================== */

    function renderShelfDecorations(
        shelf,
        layer
    ) {

        layer.innerHTML =
            "";


        const decorations =
            Array.isArray(
                shelf.decorations
            )
                ? shelf.decorations
                : [];


        decorations.forEach(
            decoration => {

                const normalized =
                    normalizeDecoration(
                        decoration
                    );


                if (!normalized) {
                    return;
                }


                const element =
                    createDecorationElement(
                        shelf.id,
                        normalized
                    );


                layer.appendChild(
                    element
                );

            }
        );

    }


    /* =====================================================
       CREATE DECORATION ELEMENT
       ===================================================== */

    function createDecorationElement(
        shelfId,
        decoration
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        const useOctoberArt =
            shouldUseOctoberArt(
                decoration.type
            );


        wrapper.className =
            [
                "shelf-decoration",
                "draggable-decoration",
                `decor-${safeClass(
                    decoration.type
                )}`,
                getDecorationScaleClass(
                    decoration.scale
                ),
                useOctoberArt
                    ? "decor-svg-object"
                    : "decor-css-object"
            ]
                .filter(
                    Boolean
                )
                .join(
                    " "
                );


        wrapper.dataset.shelfId =
            shelfId;


        wrapper.dataset.decorationId =
            decoration.id;


        wrapper.dataset.decorationType =
            decoration.type;


        wrapper.dataset.artStyle =
            useOctoberArt
                ? "october-sleepover-svg"
                : "legacy-css";


        wrapper.style.left =
            `${decoration.x * 100}%`;


        wrapper.style.top =
            `${decoration.y * 100}%`;


        /*
           Rotation is kept separate from the existing scale
           transform so CSS can combine them later.
        */

        wrapper.style.setProperty(
            "--decoration-rotate",
            `${decoration.rotate}deg`
        );


        /*
           Modern browsers support the independent rotate
           property, which prevents it from fighting the
           scale transforms already in library.css.
        */

        wrapper.style.rotate =
            `${decoration.rotate}deg`;


        wrapper.style.touchAction =
            "none";


        wrapper.innerHTML =
            getDecorationMarkup(
                decoration.type
            );


        wrapper.addEventListener(
            "dblclick",
            event => {

                event.preventDefault();

                event.stopPropagation();


                cycleDecorationScale(
                    shelfId,
                    decoration.id
                );

            }
        );


        return wrapper;

    }


    /* =====================================================
       WHICH ART SYSTEM SHOULD THIS OBJECT USE?
       ===================================================== */

    function shouldUseOctoberArt(
        type
    ) {

        if (
            !OCTOBER_SVG_SYMBOLS[
                type
            ]
        ) {

            return false;

        }


        /*
           Objects invented specifically for October Sleepover
           always use their SVG.
        */

        if (
            OCTOBER_ONLY_DECORATIONS.has(
                type
            )
        ) {

            return true;

        }


        return (
            OCTOBER_THEME_IDS.has(
                getActiveTheme()
            )
        );

    }


    /* =====================================================
       ACTIVE THEME
       ===================================================== */

    function getActiveTheme() {

        return (
            state.settings?.theme ||
            "haunted"
        );

    }


    /* =====================================================
       DECORATION MARKUP
       ===================================================== */

    function getDecorationMarkup(
        type
    ) {

        if (
            shouldUseOctoberArt(
                type
            )
        ) {

            return getOctoberSvgMarkup(
                type
            );

        }


        return getLegacyDecorationMarkup(
            type
        );

    }


    /* =====================================================
       OCTOBER SLEEPOVER SVG MARKUP
       ===================================================== */

    function getOctoberSvgMarkup(
        type
    ) {

        const symbol =
            OCTOBER_SVG_SYMBOLS[
                type
            ];


        if (!symbol) {

            return getLegacyDecorationMarkup(
                type
            );

        }


        return `
            <svg
                class="decor-svg decor-svg-${safeClass(type)}"
                width="100%"
                height="100%"
                aria-hidden="true"
                focusable="false"
                preserveAspectRatio="xMidYMid meet"
            >
                <use
                    href="${OCTOBER_ASSET}#${symbol}"
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                ></use>
            </svg>
        `;

    }


    /* =====================================================
       LEGACY CSS DECORATIONS

       These remain because we have not designed the SVG packs
       for every other theme yet.
       ===================================================== */

    function getLegacyDecorationMarkup(
        type
    ) {

        switch (type) {

            /* -------------------------------------------------
               CAT
               ------------------------------------------------- */

            case "cat":

                return `
                    <span class="decor-shadow"></span>
                    <span class="cat-tail"></span>
                    <span class="cat-body"></span>
                    <span class="cat-head"></span>
                    <span class="cat-eye left"></span>
                    <span class="cat-eye right"></span>
                `;


            /* -------------------------------------------------
               GHOST
               ------------------------------------------------- */

            case "ghost":

                return `
                    <span class="decor-shadow"></span>
                    <span class="ghost-body"></span>
                    <span class="ghost-eye left"></span>
                    <span class="ghost-eye right"></span>
                `;


            /* -------------------------------------------------
               BAT
               ------------------------------------------------- */

            case "bat":

                return `
                    <span class="bat-wing left"></span>
                    <span class="bat-body"></span>
                    <span class="bat-wing right"></span>
                `;


            /* -------------------------------------------------
               RAVEN
               ------------------------------------------------- */

            case "raven":

                return `
                    <span class="decor-shadow"></span>
                    <span class="raven-body"></span>
                    <span class="raven-head"></span>
                    <span class="raven-beak"></span>
                    <span class="raven-eye"></span>
                `;


            /* -------------------------------------------------
               GOBLIN
               ------------------------------------------------- */

            case "goblin":

                return `
                    <span class="decor-shadow"></span>
                    <span class="goblin-ear left"></span>
                    <span class="goblin-head"></span>
                    <span class="goblin-ear right"></span>
                    <span class="goblin-eye left"></span>
                    <span class="goblin-eye right"></span>
                `;


            /* -------------------------------------------------
               MUSHROOM
               ------------------------------------------------- */

            case "mushroom":

                return `
                    <span class="decor-shadow"></span>
                    <span class="mushroom-stem"></span>
                    <span class="mushroom-cap"></span>
                    <span class="mushroom-spot one"></span>
                    <span class="mushroom-spot two"></span>
                    <span class="mushroom-spot three"></span>
                `;


            /* -------------------------------------------------
               PLANT
               ------------------------------------------------- */

            case "plant":

                return `
                    <span class="decor-shadow"></span>
                    <span class="plant-leaf one"></span>
                    <span class="plant-leaf two"></span>
                    <span class="plant-leaf three"></span>
                    <span class="plant-leaf four"></span>
                    <span class="plant-pot"></span>
                `;


            /* -------------------------------------------------
               FLOWERS
               ------------------------------------------------- */

            case "flowers":

                return `
                    <span class="decor-shadow"></span>
                    <span class="flower-stem stem-1"></span>
                    <span class="flower-stem stem-2"></span>
                    <span class="flower-stem stem-3"></span>
                    <span class="flower-bloom bloom-1"></span>
                    <span class="flower-bloom bloom-2"></span>
                    <span class="flower-bloom bloom-3"></span>
                    <span class="flower-vase"></span>
                `;


            /* -------------------------------------------------
               MOSS
               ------------------------------------------------- */

            case "moss":

                return `
                    <span class="decor-shadow"></span>
                    <span class="moss-clump one"></span>
                    <span class="moss-clump two"></span>
                    <span class="moss-clump three"></span>
                `;


            /* -------------------------------------------------
               PUMPKIN
               ------------------------------------------------- */

            case "pumpkin":

                return `
                    <span class="decor-shadow"></span>
                    <span class="pumpkin-lobe outer-left"></span>
                    <span class="pumpkin-lobe left"></span>
                    <span class="pumpkin-lobe center"></span>
                    <span class="pumpkin-lobe right"></span>
                    <span class="pumpkin-lobe outer-right"></span>
                    <span class="pumpkin-highlight"></span>
                    <span class="pumpkin-stem"></span>
                `;


            /* -------------------------------------------------
               CANDLE
               ------------------------------------------------- */

            case "candle":

                return `
                    <span class="decor-shadow"></span>
                    <span class="candle-body"></span>
                    <span class="candle-wax"></span>
                    <span class="candle-wick"></span>
                    <span class="candle-flame"></span>
                `;


            /* -------------------------------------------------
               MUG
               ------------------------------------------------- */

            case "mug":

                return `
                    <span class="decor-shadow"></span>
                    <span class="mug-body"></span>
                    <span class="mug-handle"></span>
                    <span class="mug-rim"></span>
                    <span class="mug-steam steam-1"></span>
                    <span class="mug-steam steam-2"></span>
                `;


            /* -------------------------------------------------
               POTION
               ------------------------------------------------- */

            case "potion":

                return `
                    <span class="decor-shadow"></span>
                    <span class="potion-neck"></span>
                    <span class="potion-bottle"></span>
                    <span class="potion-liquid"></span>
                    <span class="potion-cork"></span>
                `;


            /* -------------------------------------------------
               CRYSTALS
               ------------------------------------------------- */

            case "crystal":

                return `
                    <span class="decor-shadow"></span>
                    <span class="crystal-shard one"></span>
                    <span class="crystal-shard two"></span>
                    <span class="crystal-shard three"></span>
                `;


            /* -------------------------------------------------
               STARS
               ------------------------------------------------- */

            case "stars":

                return `
                    <span class="star-bit one"></span>
                    <span class="star-bit two"></span>
                    <span class="star-bit three"></span>
                `;


            /* -------------------------------------------------
               OCTOBER-ONLY FALLBACKS

               Normally these render SVGs.
               ------------------------------------------------- */

            case "eightball":
            case "magic-eight-ball":

                return `
                    <span class="decoration-symbol">
                        8
                    </span>
                `;


            case "moon":
            case "moon-stars":

                return `
                    <span class="decoration-symbol">
                        ☾
                    </span>
                `;


            case "web":
            case "spider-web":

                return `
                    <span class="decoration-symbol">
                        ✣
                    </span>
                `;


            case "key":
            case "old-key":

                return `
                    <span class="decoration-symbol">
                        ⚿
                    </span>
                `;


            case "flashlight":

                return `
                    <span class="decoration-symbol">
                        ✦
                    </span>
                `;


            case "heart":

                return `
                    <span class="decoration-symbol">
                        ♡
                    </span>
                `;


            /* -------------------------------------------------
               UNKNOWN
               ------------------------------------------------- */

            default:

                return `
                    <span class="decoration-symbol">
                        ✦
                    </span>
                `;

        }

    }


    /* =====================================================
       DECORATION SCALE CLASS
       ===================================================== */

    function getDecorationScaleClass(
        scale
    ) {

        const value =
            Number(
                scale
            ) ||
            1;


        if (
            value <=
            0.8
        ) {

            return "scale-075";

        }


        if (
            value <=
            1.1
        ) {

            return "scale-100";

        }


        if (
            value <=
            1.35
        ) {

            return "scale-125";

        }


        return "scale-150";

    }


    /* =====================================================
       CYCLE DECORATION SCALE

       Desktop:
       double-click

       Mobile:
       we'll give this a more accessible UI when the Shelf
       Designer itself is redesigned.
       ===================================================== */

    function cycleDecorationScale(
        shelfId,
        decorationId
    ) {

        const shelf =
            getShelfById(
                shelfId
            );


        if (!shelf) {
            return;
        }


        const decoration =
            shelf.decorations
                ?.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            decorationId
                        )
                );


        if (!decoration) {
            return;
        }


        const sizes = [
            0.75,
            1,
            1.25,
            1.5
        ];


        const current =
            Number(
                decoration.scale
            ) ||
            1;


        let currentIndex =
            sizes.findIndex(
                size =>
                    Math.abs(
                        size -
                        current
                    ) <
                    0.08
            );


        if (
            currentIndex ===
            -1
        ) {

            currentIndex =
                1;

        }


        decoration.scale =
            sizes[
                (
                    currentIndex +
                    1
                ) %
                sizes.length
            ];


        shelf.updatedAt =
            nowISO();


        Novellow.storage
            ?.saveShelves?.();


        render();

    }


    /* =====================================================
       DECORATION DRAGGING
       ===================================================== */

    function bindDecorationDragging() {

        document.addEventListener(
            "pointerdown",
            handleDecorationPointerDown
        );


        document.addEventListener(
            "pointermove",
            handleDecorationPointerMove,
            {
                passive:
                    false
            }
        );


        document.addEventListener(
            "pointerup",
            handleDecorationPointerUp
        );


        document.addEventListener(
            "pointercancel",
            handleDecorationPointerUp
        );

    }


    /* =====================================================
       DRAG START
       ===================================================== */

    function handleDecorationPointerDown(
        event
    ) {

        if (
            event.button !==
                undefined &&
            event.button !==
                0
        ) {

            return;

        }


        const decoration =
            event.target
                ?.closest?.(
                    ".draggable-decoration"
                );


        if (!decoration) {
            return;
        }


        const shelfId =
            decoration.dataset
                .shelfId;


        const decorationId =
            decoration.dataset
                .decorationId;


        const shelfInterior =
            decoration.closest(
                ".shelf-interior"
            );


        if (
            !shelfId ||
            !decorationId ||
            !shelfInterior
        ) {

            return;

        }


        event.preventDefault();


        const rect =
            shelfInterior
                .getBoundingClientRect();


        const decorationRect =
            decoration
                .getBoundingClientRect();


        activeDrag = {

            pointerId:
                event.pointerId,

            shelfId,

            decorationId,

            element:
                decoration,

            container:
                shelfInterior,

            containerRect:
                rect,

            offsetX:
                event.clientX -
                decorationRect.left,

            offsetY:
                event.clientY -
                decorationRect.top

        };


        decoration.classList.add(
            "is-dragging"
        );


        shelfInterior.classList.add(
            "is-drag-target"
        );


        try {

            decoration
                .setPointerCapture(
                    event.pointerId
                );

        } catch (error) {

            /*
               Pointer capture is helpful but not required.
            */

        }

    }


    /* =====================================================
       DRAG MOVE
       ===================================================== */

    function handleDecorationPointerMove(
        event
    ) {

        if (
            !activeDrag ||
            event.pointerId !==
                activeDrag.pointerId
        ) {

            return;

        }


        event.preventDefault();


        const {
            containerRect,
            element,
            offsetX,
            offsetY
        } =
            activeDrag;


        const width =
            element.offsetWidth;


        const height =
            element.offsetHeight;


        const rawX =
            event.clientX -
            containerRect.left -
            offsetX;


        const rawY =
            event.clientY -
            containerRect.top -
            offsetY;


        const x =
            clamp(
                rawX,
                0,
                Math.max(
                    0,
                    containerRect.width -
                    width
                ),
                rawX
            );


        const y =
            clamp(
                rawY,
                0,
                Math.max(
                    0,
                    containerRect.height -
                    height
                ),
                rawY
            );


        element.style.left =
            `${x}px`;


        element.style.top =
            `${y}px`;

    }


    /* =====================================================
       DRAG END
       ===================================================== */

    function handleDecorationPointerUp(
        event
    ) {

        if (
            !activeDrag ||
            event.pointerId !==
                activeDrag.pointerId
        ) {

            return;

        }


        const {
            shelfId,
            decorationId,
            element,
            container,
            containerRect
        } =
            activeDrag;


        element.classList.remove(
            "is-dragging"
        );


        container.classList.remove(
            "is-drag-target"
        );


        const left =
            parseFloat(
                element.style.left
            ) ||
            0;


        const top =
            parseFloat(
                element.style.top
            ) ||
            0;


        const maxLeft =
            Math.max(
                1,
                containerRect.width -
                element.offsetWidth
            );


        const maxTop =
            Math.max(
                1,
                containerRect.height -
                element.offsetHeight
            );


        /*
           Save the top-left position relative to the space
           available to that object.

           This behaves better between desktop and mobile than
           using the raw container width alone.
        */

        const x =
            clamp(
                left /
                maxLeft,
                0,
                1,
                0.5
            );


        const y =
            clamp(
                top /
                maxTop,
                0,
                1,
                0.65
            );


        saveDecorationPosition(
            shelfId,
            decorationId,
            x,
            y
        );


        try {

            element
                .releasePointerCapture(
                    event.pointerId
                );

        } catch (error) {

            /*
               Safe to ignore.
            */

        }


        activeDrag =
            null;

    }


    /* =====================================================
       SAVE DECORATION POSITION
       ===================================================== */

    function saveDecorationPosition(
        shelfId,
        decorationId,
        x,
        y
    ) {

        const shelf =
            getShelfById(
                shelfId
            );


        if (!shelf) {
            return;
        }


        const decoration =
            shelf.decorations
                ?.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            decorationId
                        )
                );


        if (!decoration) {
            return;
        }


        decoration.x =
            clamp(
                Number(
                    x
                ),
                0,
                1,
                0.5
            );


        decoration.y =
            clamp(
                Number(
                    y
                ),
                0,
                1,
                0.65
            );


        shelf.updatedAt =
            nowISO();


        Novellow.storage
            ?.saveShelves?.();

    }


    /* =====================================================
       POPULATE BOOK SHELF SELECT
       ===================================================== */

    function populateShelfSelect(
        selectedShelfId =
            ""
    ) {

        const select =
            H.getById?.(
                "bookShelf"
            );


        if (!select) {
            return;
        }


        const previous =
            selectedShelfId ||
            select.value ||
            "";


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


        const orderedShelves =
            [...state.shelves].sort(
                (
                    first,
                    second
                ) => {

                    return (
                        Number(
                            first.position ||
                            0
                        ) -
                        Number(
                            second.position ||
                            0
                        )
                    );

                }
            );


        orderedShelves.forEach(
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


        select.value =
            state.shelves.some(
                shelf =>
                    String(
                        shelf.id
                    ) ===
                    String(
                        previous
                    )
            )
                ? previous
                : "";

    }


    /* =====================================================
       SHELF LOOKUP
       ===================================================== */

    function getShelfById(
        shelfId
    ) {

        if (
            typeof H.getShelfById ===
            "function"
        ) {

            const helperShelf =
                H.getShelfById(
                    shelfId
                );


            if (helperShelf) {

                return helperShelf;

            }

        }


        return (
            state.shelves.find(
                shelf =>
                    String(
                        shelf.id
                    ) ===
                    String(
                        shelfId
                    )
            ) ||
            null
        );

    }


    /* =====================================================
       BOOKS FOR SHELF
       ===================================================== */

    function getBooksForShelf(
        shelfId
    ) {

        if (
            typeof H.getBooksForShelf ===
            "function"
        ) {

            const helperBooks =
                H.getBooksForShelf(
                    shelfId
                );


            if (
                Array.isArray(
                    helperBooks
                )
            ) {

                return helperBooks;

            }

        }


        return (
            Array.isArray(
                state.books
            )
                ? state.books.filter(
                    book => {

                        const bookShelfId =
                            book.shelfId ||
                            book.shelf_id ||
                            "";


                        return (
                            String(
                                bookShelfId
                            ) ===
                            String(
                                shelfId
                            )
                        );

                    }
                )
                : []
        );

    }


    /* =====================================================
       SORT BOOKS
       ===================================================== */

    function sortShelfBooks(
        books,
        sortMode
    ) {

        if (
            typeof H.sortBooks ===
            "function"
        ) {

            return (
                H.sortBooks(
                    books,
                    sortMode
                ) ||
                books
            );

        }


        const copy =
            [...books];


        switch (
            sortMode
        ) {

            case "title":

                return copy.sort(
                    (
                        first,
                        second
                    ) =>
                        String(
                            first.title ||
                            ""
                        ).localeCompare(
                            String(
                                second.title ||
                                ""
                            )
                        )
                );


            case "author":

                return copy.sort(
                    (
                        first,
                        second
                    ) =>
                        String(
                            first.author ||
                            ""
                        ).localeCompare(
                            String(
                                second.author ||
                                ""
                            )
                        )
                );


            case "rating":

                return copy.sort(
                    (
                        first,
                        second
                    ) =>
                        Number(
                            second.rating ||
                            0
                        ) -
                        Number(
                            first.rating ||
                            0
                        )
                );


            case "recent":

                return copy.sort(
                    (
                        first,
                        second
                    ) =>
                        new Date(
                            second.updatedAt ||
                            second.updated_at ||
                            second.createdAt ||
                            second.created_at ||
                            0
                        ) -
                        new Date(
                            first.updatedAt ||
                            first.updated_at ||
                            first.createdAt ||
                            first.created_at ||
                            0
                        )
                );


            case "manual":
            default:

                return copy.sort(
                    (
                        first,
                        second
                    ) =>
                        Number(
                            first.position ||
                            0
                        ) -
                        Number(
                            second.position ||
                            0
                        )
                );

        }

    }


    /* =====================================================
       NEXT SHELF POSITION
       ===================================================== */

    function getNextShelfPosition() {

        if (
            !state.shelves.length
        ) {

            return 0;

        }


        return (
            Math.max(
                ...state.shelves.map(
                    shelf =>
                        Number(
                            shelf.position ||
                            0
                        )
                )
            ) +
            1
        );

    }


    /* =====================================================
       INPUT HELPERS
       ===================================================== */

    function setInputValue(
        id,
        nextValue
    ) {

        const element =
            H.getById?.(
                id
            ) ||
            document.getElementById(
                id
            );


        if (!element) {
            return;
        }


        element.value =
            nextValue ??
            "";

    }


    function getInputValue(
        id
    ) {

        const element =
            H.getById?.(
                id
            ) ||
            document.getElementById(
                id
            );


        return (
            element
                ? element.value
                : ""
        );

    }


    /* =====================================================
       CREATE ID
       ===================================================== */

    function createId(
        prefix
    ) {

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
            typeof window.crypto
                .randomUUID ===
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


    /* =====================================================
       CURRENT TIME
       ===================================================== */

    function nowISO() {

        return (
            H.nowISO?.() ||
            new Date()
                .toISOString()
        );

    }


    /* =====================================================
       HTML ESCAPE
       ===================================================== */

    function escapeHTML(
        value
    ) {

        if (
            typeof H.escapeHTML ===
            "function"
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


    /* =====================================================
       CSS CLASS SAFETY
       ===================================================== */

    function safeClass(
        value
    ) {

        return String(
            value ||
            "default"
        )
            .toLowerCase()
            .replace(
                /[^a-z0-9_-]+/g,
                "-"
            );

    }


    /* =====================================================
       CSS ATTRIBUTE ESCAPE
       ===================================================== */

    function cssEscape(
        value
    ) {

        const string =
            String(
                value ??
                ""
            );


        if (
            window.CSS &&
            typeof window.CSS.escape ===
                "function"
        ) {

            return window.CSS.escape(
                string
            );

        }


        return string.replace(
            /["\\]/g,
            "\\$&"
        );

    }


    /* =====================================================
       NUMBER CLAMP
       ===================================================== */

    function clamp(
        value,
        minimum,
        maximum,
        fallback
    ) {

        const number =
            Number(
                value
            );


        if (
            !Number.isFinite(
                number
            )
        ) {

            return fallback;

        }


        return Math.min(
            maximum,
            Math.max(
                minimum,
                number
            )
        );

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    Novellow.library = {

        init,

        render,

        createShelfElement,

        openAddShelfDrawer,

        openEditShelfDrawer,

        closeShelfDrawer,

        deleteShelf,

        populateShelfSelect,

        createDecorationElement,

        renderShelfDecorations,

        getDecorationMarkup,

        getActiveTheme

    };


    /* =====================================================
       START

       app.js normally initializes feature modules.

       This fallback allows library.js to remain safe if it is
       loaded independently during development.
       ===================================================== */

    if (
        document.readyState !==
            "loading" &&
        !initialized
    ) {

        /*
           Do not force initialization here when Novellow.app
           exists because app.js owns startup order.
        */

        if (
            !Novellow.app
        ) {

            init();

        }

    }

})();
