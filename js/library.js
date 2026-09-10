/* ============================================================
   NOVELLOW
   LIBRARY.JS
   VERSION 14

   OCTOBER SLEEPOVER SHELF SYSTEM

   - Shelf creation / editing / deletion
   - Stable decoration positioning
   - NO random re-positioning on render
   - Multiple copies of the same decoration
   - SVG October Sleepover decorations
   - Dragging + scaling
   - Existing shelf/book behavior preserved
   - Legacy decoration data repaired safely
   ============================================================ */

(() => {

    "use strict";


    /* ========================================================
       CONFIG / GLOBALS
       ======================================================== */

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


    const OCTOBER_ASSET =
        "assets/october-sleepover.svg";


    /* ========================================================
       SVG DECORATION MAP
       ======================================================== */

    const SVG_DECORATIONS = {

        cat:
            "decor-black-cat",

        ghost:
            "decor-tiny-ghost",

        bat:
            "decor-bat",

        raven:
            "decor-raven",

        goblin:
            "decor-goblin",

        mushroom:
            "decor-mushroom",

        plant:
            "decor-plant",

        flowers:
            "decor-flowers",

        moss:
            "decor-moss",

        pumpkin:
            "decor-pumpkin",

        candle:
            "decor-candle",

        mug:
            "decor-ghost-mug",

        potion:
            "decor-potion-bottle",

        "round-potion":
            "decor-round-potion",

        crystal:
            "decor-crystals",

        crystals:
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

        heart:
            "decor-heart-sparkle"

    };


    /* ========================================================
       DECORATION LABELS
       ======================================================== */

    const DECORATION_LABELS = {

        cat:
            "Black Cat",

        ghost:
            "Friendly Ghost",

        bat:
            "Tiny Bat",

        raven:
            "Raven",

        goblin:
            "Shelf Goblin",

        mushroom:
            "Mushroom",

        plant:
            "House Plant",

        flowers:
            "Flowers",

        moss:
            "Moss",

        pumpkin:
            "Pumpkin",

        candle:
            "Candle",

        mug:
            "Ghost Mug",

        potion:
            "Potion Bottle",

        "round-potion":
            "Round Potion",

        crystal:
            "Crystals",

        crystals:
            "Crystals",

        stars:
            "Little Stars",

        eightball:
            "Magic 8 Ball",

        "magic-eight-ball":
            "Magic 8 Ball",

        moon:
            "Moon & Stars",

        web:
            "Spider Web",

        key:
            "Old Key",

        flashlight:
            "Sleepover Flashlight",

        heart:
            "Heart Sparkle"

    };


    /* ========================================================
       LOCAL MODULE STATE
       ======================================================== */

    let activeDrag =
        null;


    /*
       This keeps track of how many of each decoration the user
       wants while the shelf editor is open.

       Example:
       cat -> 2
       candle -> 3
       ghost -> 1
    */

    let decorationCounts =
        new Map();


    /* ========================================================
       INIT
       ======================================================== */

    function init() {

        bindShelfControls();

        bindDecorationDragging();

        repairAllDecorationData();

        render();

    }


    /* ========================================================
       STATE
       ======================================================== */

    function state() {

        return (
            Novellow.state ||
            {}
        );

    }


    function shelves() {

        return Array.isArray(
            state().shelves
        )
            ? state().shelves
            : [];

    }


    function books() {

        return Array.isArray(
            state().books
        )
            ? state().books
            : [];

    }


    /* ========================================================
       BASIC DOM
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


    function queryAll(
        selector,
        root = document
    ) {

        return Array.from(
            root.querySelectorAll(
                selector
            )
        );

    }


    /* ========================================================
       BIND SHELF CONTROLS
       ======================================================== */

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
            get(
                "shelfForm"
            );


        if (
            form &&
            !form.dataset.novellowShelfBound
        ) {

            form.dataset.novellowShelfBound =
                "true";


            form.addEventListener(
                "submit",
                handleShelfSubmit
            );

        }

    }


    /* ========================================================
       OPEN ADD SHELF
       ======================================================== */

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


        prepareDecorationControls(
            []
        );


        openShelfPanel();


        requestAnimationFrame(
            () => {

                get(
                    "shelfName"
                )?.focus();

            }
        );

    }


    /* ========================================================
       OPEN EDIT SHELF
       ======================================================== */

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
            shelf.sort
        );


        prepareDecorationControls(
            shelf.decorations ||
            []
        );


        openShelfPanel();

    }


    /* ========================================================
       OPEN PANEL
       ======================================================== */

    function openShelfPanel() {

        if (
            Novellow.panels
                ?.openPanel
        ) {

            Novellow.panels
                .openPanel(
                    "shelfDrawer"
                );

            return;

        }


        const drawer =
            get(
                "shelfDrawer"
            );


        const overlay =
            get(
                "overlay"
            );


        if (drawer) {

            drawer.hidden =
                false;

        }


        if (overlay) {

            overlay.hidden =
                false;

        }


        document.body
            .classList
            .add(
                "modal-open"
            );

    }


    /* ========================================================
       CLOSE SHELF DRAWER
       ======================================================== */

    function closeShelfDrawer() {

        decorationCounts =
            new Map();


        if (
            Novellow.panels
                ?.closeAllPanels
        ) {

            Novellow.panels
                .closeAllPanels();

            return;

        }


        const drawer =
            get(
                "shelfDrawer"
            );


        const overlay =
            get(
                "overlay"
            );


        if (drawer) {

            drawer.hidden =
                true;

        }


        if (overlay) {

            overlay.hidden =
                true;

        }


        document.body
            .classList
            .remove(
                "modal-open"
            );

    }


    /* ========================================================
       RESET SHELF FORM
       ======================================================== */

    function resetShelfForm() {

        const form =
            get(
                "shelfForm"
            );


        form?.reset();


        setInputValue(
            "editingShelfId",
            ""
        );


        setInputValue(
            "shelfMaterial",
            CONFIG.defaultShelf
                ?.material ||
            "walnut"
        );


        setInputValue(
            "shelfMood",
            CONFIG.defaultShelf
                ?.mood ||
            "cozy"
        );


        setInputValue(
            "shelfLayout",
            CONFIG.defaultShelf
                ?.layout ||
            "mixed"
        );


        setInputValue(
            "shelfSort",
            state().settings
                ?.defaultShelfSort ||
            CONFIG.defaultShelf
                ?.sort ||
            "manual"
        );


        decorationCounts =
            new Map();


        syncDecorationCheckboxes(
            []
        );

    }


    /* ========================================================
       DECORATION EDITOR

       Existing checkboxes still work.

       We add a small quantity editor under them so the user can
       have:
       - 2 cats
       - 3 candles
       - 2 ghosts
       etc.
       ======================================================== */

    function prepareDecorationControls(
        existingDecorations = []
    ) {

        initializeDecorationCounts(
            existingDecorations
        );


        syncDecorationCheckboxes(
            existingDecorations
        );


        buildDecorationQuantityEditor();

    }


    function initializeDecorationCounts(
        existingDecorations
    ) {

        decorationCounts =
            new Map();


        const decorations =
            normalizeDecorationArray(
                existingDecorations
            );


        decorations.forEach(
            decoration => {

                const current =
                    decorationCounts.get(
                        decoration.type
                    ) ||
                    0;


                decorationCounts.set(
                    decoration.type,
                    current + 1
                );

            }
        );

    }


    /* ========================================================
       CHECKBOX SYNC
       ======================================================== */

    function syncDecorationCheckboxes(
        decorations
    ) {

        const selectedTypes =
            new Set(
                normalizeDecorationArray(
                    decorations
                )
                    .map(
                        item =>
                            item.type
                    )
            );


        queryAll(
            ".decoration-options input[type='checkbox']"
        )
            .forEach(
                checkbox => {

                    checkbox.checked =
                        selectedTypes.has(
                            checkbox.value
                        );


                    /*
                       We bind this only once.
                    */

                    if (
                        checkbox.dataset
                            .novellowDecorBound
                    ) {

                        return;

                    }


                    checkbox.dataset
                        .novellowDecorBound =
                        "true";


                    checkbox.addEventListener(
                        "change",
                        () => {

                            const type =
                                checkbox.value;


                            if (
                                checkbox.checked
                            ) {

                                if (
                                    (
                                        decorationCounts.get(
                                            type
                                        ) ||
                                        0
                                    ) < 1
                                ) {

                                    decorationCounts.set(
                                        type,
                                        1
                                    );

                                }

                            } else {

                                decorationCounts.set(
                                    type,
                                    0
                                );

                            }


                            updateDecorationQuantityUI();

                        }
                    );

                }
            );

    }


    /* ========================================================
       QUANTITY EDITOR
       ======================================================== */

    function buildDecorationQuantityEditor() {

        const checkboxArea =
            document.querySelector(
                ".decoration-options"
            );


        if (!checkboxArea) {
            return;
        }


        let editor =
            get(
                "novellowDecorationQuantityEditor"
            );


        if (!editor) {

            editor =
                document.createElement(
                    "div"
                );


            editor.id =
                "novellowDecorationQuantityEditor";


            editor.className =
                "decoration-quantity-editor";


            checkboxArea.insertAdjacentElement(
                "afterend",
                editor
            );

        }


        editor.innerHTML =
            "";


        const heading =
            document.createElement(
                "div"
            );


        heading.className =
            "decoration-quantity-heading";


        heading.innerHTML = `
            <strong>
                Shelf decorations
            </strong>

            <span>
                Add more than one if you want.
            </span>
        `;


        editor.appendChild(
            heading
        );


        getAvailableDecorationTypes()
            .forEach(
                type => {

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "decoration-quantity-row";


                    row.dataset
                        .decorationQuantity =
                        type;


                    row.innerHTML = `

                        <div
                            class="decoration-quantity-preview"
                            aria-hidden="true"
                        >
                            ${getDecorationMarkup(
                                type,
                                true
                            )}
                        </div>

                        <div
                            class="decoration-quantity-name"
                        >
                            ${escape(
                                getDecorationLabel(
                                    type
                                )
                            )}
                        </div>

                        <button
                            type="button"
                            class="decoration-count-button"
                            data-decor-minus="${escape(
                                type
                            )}"
                            aria-label="Remove one ${escape(
                                getDecorationLabel(
                                    type
                                )
                            )}"
                        >
                            −
                        </button>

                        <span
                            class="decoration-count-value"
                            data-decor-count="${escape(
                                type
                            )}"
                        >
                            0
                        </span>

                        <button
                            type="button"
                            class="decoration-count-button"
                            data-decor-plus="${escape(
                                type
                            )}"
                            aria-label="Add another ${escape(
                                getDecorationLabel(
                                    type
                                )
                            )}"
                        >
                            +
                        </button>

                    `;


                    row
                        .querySelector(
                            `[data-decor-minus="${cssEscape(
                                type
                            )}"]`
                        )
                        ?.addEventListener(
                            "click",
                            () => {

                                changeDecorationCount(
                                    type,
                                    -1
                                );

                            }
                        );


                    row
                        .querySelector(
                            `[data-decor-plus="${cssEscape(
                                type
                            )}"]`
                        )
                        ?.addEventListener(
                            "click",
                            () => {

                                changeDecorationCount(
                                    type,
                                    1
                                );

                            }
                        );


                    editor.appendChild(
                        row
                    );

                }
            );


        updateDecorationQuantityUI();

    }


    function changeDecorationCount(
        type,
        amount
    ) {

        const current =
            decorationCounts.get(
                type
            ) ||
            0;


        const next =
            clamp(
                current + amount,
                0,
                8
            );


        decorationCounts.set(
            type,
            next
        );


        const checkbox =
            queryAll(
                ".decoration-options input[type='checkbox']"
            )
                .find(
                    item =>
                        item.value ===
                        type
                );


        if (checkbox) {

            checkbox.checked =
                next > 0;

        }


        updateDecorationQuantityUI();

    }


    function updateDecorationQuantityUI() {

        queryAll(
            "[data-decor-count]"
        )
            .forEach(
                element => {

                    const type =
                        element.dataset
                            .decorCount;


                    const count =
                        decorationCounts.get(
                            type
                        ) ||
                        0;


                    element.textContent =
                        String(
                            count
                        );


                    const row =
                        element.closest(
                            ".decoration-quantity-row"
                        );


                    row?.classList.toggle(
                        "is-selected",
                        count > 0
                    );

                }
            );

    }


    /* ========================================================
       AVAILABLE DECORATIONS
       ======================================================== */

    function getAvailableDecorationTypes() {

        const fromConfig =
            Array.isArray(
                CONFIG.decorations
            )
                ? CONFIG.decorations
                    .map(
                        item =>
                            item.id
                    )
                    .filter(Boolean)
                : [];


        const checkboxTypes =
            queryAll(
                ".decoration-options input[type='checkbox']"
            )
                .map(
                    item =>
                        item.value
                )
                .filter(Boolean);


        const defaults = [

            "cat",
            "ghost",
            "candle",
            "mug",
            "pumpkin",
            "mushroom",
            "potion",
            "crystal",
            "stars",
            "bat",
            "raven",
            "goblin",
            "plant",
            "flowers",
            "moss"

        ];


        return Array.from(
            new Set([
                ...fromConfig,
                ...checkboxTypes,
                ...defaults
            ])
        );

    }


    /* ========================================================
       GET SELECTED DECORATIONS

       KEY CHANGE:
       We preserve every existing decoration record individually.

       We DO NOT collapse by type anymore.
       ======================================================== */

    function getSelectedDecorations(
        existingShelf
    ) {

        const existing =
            normalizeDecorationArray(
                existingShelf
                    ?.decorations ||
                []
            );


        const result =
            [];


        const allTypes =
            new Set([
                ...getAvailableDecorationTypes(),
                ...existing.map(
                    item =>
                        item.type
                )
            ]);


        allTypes.forEach(
            type => {

                const desiredCount =
                    decorationCounts.get(
                        type
                    ) ||
                    0;


                if (
                    desiredCount <=
                    0
                ) {

                    return;

                }


                const existingOfType =
                    existing.filter(
                        item =>
                            item.type ===
                            type
                    );


                /*
                   First preserve existing copies exactly.
                */

                existingOfType
                    .slice(
                        0,
                        desiredCount
                    )
                    .forEach(
                        item => {

                            result.push(
                                item
                            );

                        }
                    );


                /*
                   Then add additional copies if requested.
                */

                const missing =
                    desiredCount -
                    existingOfType.length;


                if (
                    missing >
                    0
                ) {

                    for (
                        let index = 0;
                        index < missing;
                        index += 1
                    ) {

                        const id =
                            createDecorationId(
                                type
                            );


                        const position =
                            getDeterministicDecorationPosition(
                                id,
                                type,
                                result.length
                            );


                        result.push({

                            id,

                            type,

                            x:
                                position.x,

                            y:
                                position.y,

                            scale:
                                1,

                            rotate:
                                0

                        });

                    }

                }

            }
        );


        return result;

    }


    /* ========================================================
       DETERMINISTIC NEW DECORATION POSITION

       NO Math.random().

       A decoration gets a stable starting point derived from
       its id/type. It will then stay wherever the user drags it.
       ======================================================== */

    function getDeterministicDecorationPosition(
        id,
        type,
        index = 0
    ) {

        const seed =
            stableHash(
                `${id}-${type}-${index}`
            );


        /*
           x and y represent position within the AVAILABLE travel
           area, not raw container percentage.

           0 = left/top
           1 = right/bottom
        */

        const x =
            0.07 +
            (
                (
                    seed %
                    790
                ) /
                1000
            );


        const secondary =
            stableHash(
                `${type}-${id}-vertical`
            );


        const y =
            0.56 +
            (
                (
                    secondary %
                    260
                ) /
                1000
            );


        return {

            x:
                clamp(
                    x,
                    0.04,
                    0.90
                ),

            y:
                clamp(
                    y,
                    0.48,
                    0.87
                )

        };

    }


    function stableHash(
        input
    ) {

        const text =
            String(
                input ||
                ""
            );


        let hash =
            2166136261;


        for (
            let i = 0;
            i < text.length;
            i += 1
        ) {

            hash ^=
                text.charCodeAt(
                    i
                );


            hash +=
                (
                    hash << 1
                ) +
                (
                    hash << 4
                ) +
                (
                    hash << 7
                ) +
                (
                    hash << 8
                ) +
                (
                    hash << 24
                );

        }


        return (
            hash >>>
            0
        );

    }


    /* ========================================================
       SUBMIT SHELF
       ======================================================== */

    function handleShelfSubmit(
        event
    ) {

        event.preventDefault();


        const currentState =
            state();


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


        const rawShelf = {

            ...existing,

            id:
                existing?.id ||
                createShelfId(),

            name,

            description:
                getInputValue(
                    "shelfDescription"
                ).trim(),

            material:
                getInputValue(
                    "shelfMaterial"
                ) ||
                "walnut",

            mood:
                getInputValue(
                    "shelfMood"
                ) ||
                "cozy",

            layout:
                getInputValue(
                    "shelfLayout"
                ) ||
                "mixed",

            sort:
                getInputValue(
                    "shelfSort"
                ) ||
                "manual",

            decorations:
                selectedDecorations,

            createdAt:
                existing
                    ?.createdAt ||
                now(),

            updatedAt:
                now()

        };


        const shelfData =
            H.normalizeShelf?.(
                rawShelf
            ) ||
            rawShelf;


        /*
           Re-attach our already-normalized decorations after
           normalizeShelf so duplicate records cannot be lost by
           an older helper implementation.
        */

        shelfData.decorations =
            selectedDecorations;


        if (
            !Array.isArray(
                currentState.shelves
            )
        ) {

            currentState.shelves =
                [];

        }


        if (existing) {

            const index =
                currentState.shelves
                    .findIndex(
                        shelf =>
                            shelf.id ===
                            existing.id
                    );


            if (
                index !==
                -1
            ) {

                currentState
                    .shelves[
                        index
                    ] =
                    shelfData;

            }


            H.showToast?.(
                "Shelf updated.",
                "success"
            );

        } else {

            currentState
                .shelves
                .push(
                    shelfData
                );


            H.showToast?.(
                "Shelf added to your library.",
                "success"
            );

        }


        saveShelves();

        closeShelfDrawer();

        render();


        Novellow.books
            ?.populateShelfSelect?.();


        Novellow.stats
            ?.render?.();

    }


    /* ========================================================
       DELETE SHELF
       ======================================================== */

    function deleteShelf(
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
                ` The ${booksOnShelf.length} book${
                    booksOnShelf.length ===
                    1
                        ? ""
                        : "s"
                } on it will stay in Novellow but become unshelved.`;

        }


        const confirmed =
            H.confirmAction?.(
                message
            ) ??
            window.confirm(
                message
            );


        if (!confirmed) {
            return;
        }


        const currentState =
            state();


        currentState.shelves =
            shelves().filter(
                item =>
                    item.id !==
                    shelfId
            );


        currentState.books =
            books().map(
                book => {

                    if (
                        book.shelfId !==
                        shelfId
                    ) {

                        return book;

                    }


                    return {

                        ...book,

                        shelfId:
                            "",

                        updatedAt:
                            now()

                    };

                }
            );


        saveShelves();


        Novellow.storage
            ?.saveBooks?.();


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


    /* ========================================================
       RENDER LIBRARY
       ======================================================== */

    function render() {

        const container =
            get(
                "shelfContainer"
            );


        if (!container) {
            return;
        }


        updateLibrarySummary();


        container.innerHTML =
            "";


        const allShelves =
            shelves();


        const emptyState =
            get(
                "libraryEmptyState"
            );


        if (
            allShelves.length ===
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


        allShelves.forEach(
            shelf => {

                container.appendChild(
                    createShelfElement(
                        shelf
                    )
                );

            }
        );

    }


    /* ========================================================
       LIBRARY SUMMARY
       ======================================================== */

    function updateLibrarySummary() {

        const allBooks =
            books();


        const allShelves =
            shelves();


        const readingCount =
            allBooks.filter(
                book =>
                    book.status ===
                    "reading"
            ).length;


        H.setText?.(
            "libraryBookCount",
            allBooks.length
        );


        H.setText?.(
            "libraryShelfCount",
            allShelves.length
        );


        H.setText?.(
            "libraryReadingCount",
            readingCount
        );

    }


    /* ========================================================
       CREATE SHELF ELEMENT
       ======================================================== */

    function createShelfElement(
        shelf
    ) {

        const article =
            document.createElement(
                "article"
            );


        article.className = [

            "library-shelf",

            `material-${
                shelf.material ||
                "walnut"
            }`,

            `mood-${
                shelf.mood ||
                "cozy"
            }`,

            `layout-${
                shelf.layout ||
                "mixed"
            }`

        ].join(
            " "
        );


        article.dataset.shelfId =
            shelf.id;


        const shelfBooks =
            sortShelfBooks(
                getBooksForShelf(
                    shelf.id
                ),
                shelf.sort
            );


        article.innerHTML = `

            <header
                class="shelf-header"
            >

                <div
                    class="shelf-heading-copy"
                >

                    <span
                        class="shelf-eyebrow"
                    >
                        ${escape(
                            shelf.mood ||
                            "bookshelf"
                        )}
                    </span>

                    <h2>
                        ${escape(
                            shelf.name ||
                            "Shelf"
                        )}
                    </h2>

                    ${
                        shelf.description

                            ? `
                                <p>
                                    ${escape(
                                        shelf.description
                                    )}
                                </p>
                            `

                            : ""
                    }

                </div>


                <div
                    class="shelf-actions"
                >

                    <button
                        type="button"
                        class="shelf-action-button"
                        data-shelf-add-book="${escape(
                            shelf.id
                        )}"
                    >
                        + Book
                    </button>

                    <button
                        type="button"
                        class="shelf-action-button"
                        data-shelf-edit="${escape(
                            shelf.id
                        )}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="shelf-action-button danger"
                        data-shelf-delete="${escape(
                            shelf.id
                        )}"
                    >
                        Delete
                    </button>

                </div>

            </header>


            <div
                class="shelf-interior"
                data-shelf-interior="${escape(
                    shelf.id
                )}"
            >

                <div
                    class="shelf-books"
                    data-shelf-books="${escape(
                        shelf.id
                    )}"
                ></div>


                <div
                    class="shelf-floor"
                    aria-hidden="true"
                ></div>


                ${
                    shelfBooks.length ===
                    0

                        ? `
                            <div
                                class="shelf-empty"
                            >
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


                <div
                    class="shelf-decoration-layer"
                    data-decoration-layer="${escape(
                        shelf.id
                    )}"
                ></div>

            </div>


            <div
                class="shelf-footer-label"
            >
                ${shelfBooks.length}

                ${
                    shelfBooks.length ===
                    1
                        ? "book"
                        : "books"
                }
            </div>

        `;


        /* ====================================================
           BOOKS
           ==================================================== */

        const booksContainer =
            article.querySelector(
                "[data-shelf-books]"
            );


        if (booksContainer) {

            shelfBooks.forEach(
                book => {

                    const bookElement =
                        Novellow.books
                            ?.createShelfBookElement?.(
                                book
                            );


                    if (bookElement) {

                        booksContainer
                            .appendChild(
                                bookElement
                            );

                    }

                }
            );

        }


        /* ====================================================
           DECOR
           ==================================================== */

        const decorationLayer =
            article.querySelector(
                "[data-decoration-layer]"
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


    /* ========================================================
       SHELF ACTIONS
       ======================================================== */

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


    /* ========================================================
       RENDER SHELF DECORATIONS
       ======================================================== */

    function renderShelfDecorations(
        shelf,
        layer
    ) {

        layer.innerHTML =
            "";


        const repaired =
            normalizeDecorationArray(
                shelf.decorations ||
                []
            );


        /*
           Keep the repaired records on the shelf itself so the
           exact ids / positions survive future saves.
        */

        shelf.decorations =
            repaired;


        repaired.forEach(
            decoration => {

                const element =
                    createDecorationElement(
                        shelf.id,
                        decoration
                    );


                layer.appendChild(
                    element
                );

            }
        );


        /*
           Wait until the elements have dimensions before
           converting normalized coordinates into pixels.
        */

        requestAnimationFrame(
            () => {

                positionDecorationsInLayer(
                    layer
                );

            }
        );

    }


    /* ========================================================
       CREATE DECORATION ELEMENT
       ======================================================== */

    function createDecorationElement(
        shelfId,
        decoration
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className = [

            "shelf-decoration",

            "draggable-decoration",

            `decor-${
                decoration.type
            }`,

            getDecorationScaleClass(
                decoration.scale
            )

        ].join(
            " "
        );


        wrapper.dataset.shelfId =
            shelfId;


        wrapper.dataset.decorationId =
            decoration.id;


        wrapper.dataset.decorationType =
            decoration.type;


        wrapper.dataset.positionX =
            String(
                decoration.x
            );


        wrapper.dataset.positionY =
            String(
                decoration.y
            );


        wrapper.title =
            getDecorationLabel(
                decoration.type
            );


        wrapper.setAttribute(
            "role",
            "img"
        );


        wrapper.setAttribute(
            "aria-label",
            getDecorationLabel(
                decoration.type
            )
        );


        wrapper.innerHTML =
            getDecorationMarkup(
                decoration.type
            );


        /*
           Double click / double tap scale behavior remains.
        */

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


    /* ========================================================
       SVG DECORATION MARKUP
       ======================================================== */

    function getDecorationMarkup(
        type,
        preview = false
    ) {

        const symbol =
            SVG_DECORATIONS[
                type
            ];


        if (!symbol) {

            return `
                <svg
                    class="october-decoration-svg"
                    viewBox="0 0 64 64"
                    aria-hidden="true"
                >
                    <use
                        href="${OCTOBER_ASSET}#decor-stars"
                    ></use>
                </svg>
            `;

        }


        const animationClass =
            getDecorationAnimationClass(
                type
            );


        return `
            <svg
                class="
                    october-decoration-svg
                    ${animationClass}
                    ${
                        preview
                            ? "decoration-preview-svg"
                            : ""
                    }
                "
                viewBox="${getDecorationViewBox(
                    type
                )}"
                aria-hidden="true"
            >
                <use
                    href="${OCTOBER_ASSET}#${symbol}"
                ></use>
            </svg>
        `;

    }


    /* ========================================================
       VIEWBOXES

       Each SVG symbol was drawn at a slightly different aspect
       ratio. This keeps the art from being cropped.
       ======================================================== */

    function getDecorationViewBox(
        type
    ) {

        const map = {

            cat:
                "0 0 120 90",

            ghost:
                "0 0 90 100",

            bat:
                "0 0 110 70",

            raven:
                "0 0 90 100",

            goblin:
                "0 0 90 95",

            mushroom:
                "0 0 90 90",

            plant:
                "0 0 95 100",

            flowers:
                "0 0 100 105",

            moss:
                "0 0 110 55",

            pumpkin:
                "0 0 100 84",

            candle:
                "0 0 80 110",

            mug:
                "0 0 110 90",

            potion:
                "0 0 80 105",

            "round-potion":
                "0 0 90 95",

            crystal:
                "0 0 100 95",

            crystals:
                "0 0 100 95",

            stars:
                "0 0 100 80",

            eightball:
                "0 0 90 90",

            "magic-eight-ball":
                "0 0 90 90",

            moon:
                "0 0 100 90",

            "moon-stars":
                "0 0 100 90",

            web:
                "0 0 100 90",

            "spider-web":
                "0 0 100 90",

            key:
                "0 0 110 70",

            "old-key":
                "0 0 110 70",

            flashlight:
                "-20 0 135 65",

            heart:
                "0 0 80 80"

        };


        return (
            map[
                type
            ] ||
            "0 0 100 100"
        );

    }


    /* ========================================================
       ANIMATION CLASS
       ======================================================== */

    function getDecorationAnimationClass(
        type
    ) {

        switch (type) {

            case "ghost":

                return "october-hover";


            case "cat":

                return "october-stretch";


            case "stars":

            case "moon":

            case "moon-stars":

                return "october-float-gentle";


            default:

                return "";

        }

    }


    /* ========================================================
       STABLE DECORATION POSITIONING

       x/y are treated as fractions of the actual usable travel
       space:

           usable width  = layer width - decoration width
           usable height = layer height - decoration height

       This is the important fix.

       Adding a book or re-rendering does NOT create a new x/y.
       ======================================================== */

    function positionDecorationsInLayer(
        layer
    ) {

        if (!layer) {
            return;
        }


        const layerRect =
            layer.getBoundingClientRect();


        queryAll(
            ".shelf-decoration",
            layer
        )
            .forEach(
                element => {

                    const x =
                        clamp(
                            number(
                                element.dataset
                                    .positionX,
                                0.5
                            ),
                            0,
                            1
                        );


                    const y =
                        clamp(
                            number(
                                element.dataset
                                    .positionY,
                                0.72
                            ),
                            0,
                            1
                        );


                    const elementRect =
                        element
                            .getBoundingClientRect();


                    const usableWidth =
                        Math.max(
                            0,
                            layerRect.width -
                            elementRect.width
                        );


                    const usableHeight =
                        Math.max(
                            0,
                            layerRect.height -
                            elementRect.height
                        );


                    const left =
                        usableWidth *
                        x;


                    const top =
                        usableHeight *
                        y;


                    element.style.left =
                        `${left}px`;


                    element.style.top =
                        `${top}px`;

                }
            );

    }


    /* ========================================================
       SCALE
       ======================================================== */

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
            normalizeDecorationArray(
                shelf.decorations
            )
                .find(
                    item =>
                        item.id ===
                        decorationId
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


        let index =
            sizes.findIndex(
                size =>
                    Math.abs(
                        size -
                        current
                    ) <
                    0.08
            );


        if (
            index <
            0
        ) {

            index =
                1;

        }


        decoration.scale =
            sizes[
                (
                    index + 1
                ) %
                sizes.length
            ];


        shelf.updatedAt =
            now();


        saveShelves();

        render();

    }


    /* ========================================================
       DRAGGING
       ======================================================== */

    function bindDecorationDragging() {

        if (
            document.documentElement
                .dataset
                .novellowDecorationDragBound
        ) {

            return;

        }


        document.documentElement
            .dataset
            .novellowDecorationDragBound =
            "true";


        document.addEventListener(
            "pointerdown",
            handleDecorationPointerDown
        );


        document.addEventListener(
            "pointermove",
            handleDecorationPointerMove
        );


        document.addEventListener(
            "pointerup",
            handleDecorationPointerUp
        );


        document.addEventListener(
            "pointercancel",
            handleDecorationPointerUp
        );


        window.addEventListener(
            "resize",
            handleWindowResize
        );

    }


    function handleDecorationPointerDown(
        event
    ) {

        const decoration =
            event.target.closest(
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


        const layer =
            decoration.closest(
                ".shelf-decoration-layer"
            );


        const interior =
            decoration.closest(
                ".shelf-interior"
            );


        if (
            !shelfId ||
            !decorationId ||
            !layer ||
            !interior
        ) {

            return;

        }


        event.preventDefault();


        const layerRect =
            layer.getBoundingClientRect();


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

            layer,

            interior,

            layerRect,

            offsetX:
                event.clientX -
                decorationRect.left,

            offsetY:
                event.clientY -
                decorationRect.top

        };


        decoration
            .classList
            .add(
                "is-dragging"
            );


        interior
            .classList
            .add(
                "is-drag-target"
            );


        try {

            decoration
                .setPointerCapture(
                    event.pointerId
                );

        } catch {

            /* pointer capture is optional */

        }

    }


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

            element,

            layerRect,

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
            layerRect.left -
            offsetX;


        const rawY =
            event.clientY -
            layerRect.top -
            offsetY;


        const left =
            clamp(
                rawX,
                0,
                Math.max(
                    0,
                    layerRect.width -
                    width
                )
            );


        const top =
            clamp(
                rawY,
                0,
                Math.max(
                    0,
                    layerRect.height -
                    height
                )
            );


        element.style.left =
            `${left}px`;


        element.style.top =
            `${top}px`;

    }


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

            layer,

            interior

        } =
            activeDrag;


        element
            .classList
            .remove(
                "is-dragging"
            );


        interior
            .classList
            .remove(
                "is-drag-target"
            );


        const layerRect =
            layer
                .getBoundingClientRect();


        const elementRect =
            element
                .getBoundingClientRect();


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


        const usableWidth =
            Math.max(
                0,
                layerRect.width -
                elementRect.width
            );


        const usableHeight =
            Math.max(
                0,
                layerRect.height -
                elementRect.height
            );


        /*
           Save relative to the usable travel range.

           That means:
           x=1 always means right edge
           y=1 always means bottom edge

           regardless of icon dimensions.
        */

        const x =
            usableWidth >
            0

                ? clamp(
                    left /
                    usableWidth,
                    0,
                    1
                )

                : 0.5;


        const y =
            usableHeight >
            0

                ? clamp(
                    top /
                    usableHeight,
                    0,
                    1
                )

                : 0.5;


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

        } catch {

            /* optional */

        }


        activeDrag =
            null;

    }


    /* ========================================================
       SAVE DECORATION POSITION
       ======================================================== */

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
                        item.id ===
                        decorationId
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
                1
            );


        decoration.y =
            clamp(
                Number(
                    y
                ),
                0,
                1
            );


        decoration.updatedAt =
            now();


        shelf.updatedAt =
            now();


        saveShelves();


        /*
           Keep the DOM copy in sync without re-rendering.
        */

        const element =
            document.querySelector(
                `[data-decoration-id="${cssEscape(
                    decorationId
                )}"]`
            );


        if (element) {

            element.dataset.positionX =
                String(
                    decoration.x
                );


            element.dataset.positionY =
                String(
                    decoration.y
                );

        }

    }


    /* ========================================================
       RESIZE

       Recalculate pixels from the same saved normalized values.
       No new positions are generated.
       ======================================================== */

    function handleWindowResize() {

        if (
            activeDrag
        ) {

            return;

        }


        queryAll(
            ".shelf-decoration-layer"
        )
            .forEach(
                layer => {

                    positionDecorationsInLayer(
                        layer
                    );

                }
            );

    }


    /* ========================================================
       REPAIR LEGACY DECORATIONS

       Handles:
       ["cat", "ghost"]

       as well as older objects missing ids/x/y.

       The repair is deterministic, not random.
       ======================================================== */

    function repairAllDecorationData() {

        let changed =
            false;


        shelves()
            .forEach(
                shelf => {

                    const before =
                        JSON.stringify(
                            shelf.decorations ||
                            []
                        );


                    shelf.decorations =
                        normalizeDecorationArray(
                            shelf.decorations ||
                            []
                        );


                    const after =
                        JSON.stringify(
                            shelf.decorations
                        );


                    if (
                        before !==
                        after
                    ) {

                        changed =
                            true;

                    }

                }
            );


        if (changed) {

            saveShelves();

        }

    }


    function normalizeDecorationArray(
        decorations
    ) {

        if (
            !Array.isArray(
                decorations
            )
        ) {

            return [];

        }


        return decorations
            .map(
                (
                    decoration,
                    index
                ) => {

                    return normalizeDecorationRecord(
                        decoration,
                        index
                    );

                }
            )
            .filter(Boolean);

    }


    function normalizeDecorationRecord(
        decoration,
        index = 0
    ) {

        let raw;


        if (
            typeof decoration ===
            "string"
        ) {

            raw = {

                type:
                    decoration

            };

        } else if (
            decoration &&
            typeof decoration ===
            "object"
        ) {

            raw = {

                ...decoration

            };

        } else {

            return null;

        }


        const type =
            raw.type ||
            raw.id ||
            "stars";


        let id =
            raw.id;


        /*
           Legacy string decoration ids were often just the type.
           That cannot support duplicates, so give them a proper
           instance id.
        */

        if (
            !id ||
            id ===
            type
        ) {

            id =
                `decor-${type}-${stableHash(
                    `${type}-${index}`
                ).toString(36)}`;

        }


        let x =
            Number(
                raw.x
            );


        let y =
            Number(
                raw.y
            );


        if (
            !Number.isFinite(
                x
            ) ||
            !Number.isFinite(
                y
            )
        ) {

            const position =
                getDeterministicDecorationPosition(
                    id,
                    type,
                    index
                );


            if (
                !Number.isFinite(
                    x
                )
            ) {

                x =
                    position.x;

            }


            if (
                !Number.isFinite(
                    y
                )
            ) {

                y =
                    position.y;

            }

        }


        /*
           Some older implementations stored percentages as 50
           rather than .50.
        */

        if (
            x >
            1
        ) {

            x =
                x /
                100;

        }


        if (
            y >
            1
        ) {

            y =
                y /
                100;

        }


        return {

            ...raw,

            id,

            type,

            x:
                clamp(
                    x,
                    0,
                    1
                ),

            y:
                clamp(
                    y,
                    0,
                    1
                ),

            scale:
                normalizeScale(
                    raw.scale
                ),

            rotate:
                Number.isFinite(
                    Number(
                        raw.rotate
                    )
                )
                    ? Number(
                        raw.rotate
                    )
                    : 0

        };

    }


    /* ========================================================
       NORMALIZE SCALE
       ======================================================== */

    function normalizeScale(
        scale
    ) {

        const value =
            Number(
                scale
            );


        if (
            !Number.isFinite(
                value
            )
        ) {

            return 1;

        }


        const choices = [

            0.75,

            1,

            1.25,

            1.5

        ];


        return choices.reduce(
            (
                closest,
                choice
            ) => {

                return (
                    Math.abs(
                        choice -
                        value
                    ) <
                    Math.abs(
                        closest -
                        value
                    )
                )
                    ? choice
                    : closest;

            },
            1
        );

    }


    /* ========================================================
       SHELF SELECT
       ======================================================== */

    function populateShelfSelect(
        selectedShelfId = ""
    ) {

        const select =
            get(
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


        shelves()
            .forEach(
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
            shelves()
                .some(
                    shelf =>
                        shelf.id ===
                        previous
                )

                ? previous

                : "";

    }


    /* ========================================================
       HELPERS
       ======================================================== */

    function getShelfById(
        shelfId
    ) {

        return (
            H.getShelfById?.(
                shelfId
            ) ||
            shelves().find(
                shelf =>
                    shelf.id ===
                    shelfId
            ) ||
            null
        );

    }


    function getBooksForShelf(
        shelfId
    ) {

        return (
            H.getBooksForShelf?.(
                shelfId
            ) ||
            books().filter(
                book =>
                    book.shelfId ===
                    shelfId
            )
        );

    }


    function sortShelfBooks(
        list,
        mode
    ) {

        if (
            H.sortBooks
        ) {

            return H.sortBooks(
                list,
                mode
            );

        }


        const copy =
            [
                ...list
            ];


        switch (mode) {

            case "title":

                return copy.sort(
                    (
                        a,
                        b
                    ) =>
                        String(
                            a.title ||
                            ""
                        )
                            .localeCompare(
                                String(
                                    b.title ||
                                    ""
                                )
                            )
                );


            case "author":

                return copy.sort(
                    (
                        a,
                        b
                    ) =>
                        String(
                            a.author ||
                            ""
                        )
                            .localeCompare(
                                String(
                                    b.author ||
                                    ""
                                )
                            )
                );


            case "recent":

                return copy.sort(
                    (
                        a,
                        b
                    ) =>
                        String(
                            b.updatedAt ||
                            b.createdAt ||
                            ""
                        )
                            .localeCompare(
                                String(
                                    a.updatedAt ||
                                    a.createdAt ||
                                    ""
                                )
                            )
                );


            default:

                return copy;

        }

    }


    function createShelfId() {

        return (
            H.createId?.(
                "shelf"
            ) ||
            (
                crypto.randomUUID
                    ? crypto.randomUUID()
                    : `shelf-${Date.now()}`
            )
        );

    }


    function createDecorationId(
        type
    ) {

        return (
            H.createId?.(
                "decor"
            ) ||
            (
                crypto.randomUUID
                    ? crypto.randomUUID()
                    : `decor-${type}-${Date.now()}-${Math.floor(
                        performance.now()
                    )}`
            )
        );

    }


    function getDecorationLabel(
        type
    ) {

        const configItem =
            Array.isArray(
                CONFIG.decorations
            )
                ? CONFIG.decorations
                    .find(
                        item =>
                            item.id ===
                            type
                    )
                : null;


        return (
            configItem?.label ||
            DECORATION_LABELS[
                type
            ] ||
            type ||
            "Decoration"
        );

    }


    function saveShelves() {

        Novellow.storage
            ?.saveShelves?.();

    }


    function now() {

        return (
            H.nowISO?.() ||
            new Date()
                .toISOString()
        );

    }


    function number(
        value,
        fallback = 0
    ) {

        const parsed =
            Number(
                value
            );


        return Number.isFinite(
            parsed
        )
            ? parsed
            : fallback;

    }


    function clamp(
        value,
        min,
        max
    ) {

        if (
            H.clamp
        ) {

            return H.clamp(
                value,
                min,
                max
            );

        }


        return Math.min(
            max,
            Math.max(
                min,
                Number(
                    value
                ) ||
                0
            )
        );

    }


    function setInputValue(
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


    function getInputValue(
        id
    ) {

        return (
            get(
                id
            )?.value ??
            ""
        );

    }


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


        const element =
            document.createElement(
                "div"
            );


        element.textContent =
            String(
                value ??
                ""
            );


        return element.innerHTML;

    }


    function cssEscape(
        value
    ) {

        if (
            window.CSS &&
            typeof CSS.escape ===
            "function"
        ) {

            return CSS.escape(
                String(
                    value
                )
            );

        }


        return String(
            value
        )
            .replace(
                /["\\]/g,
                "\\$&"
            );

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

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

        positionDecorationsInLayer

    };


})();
