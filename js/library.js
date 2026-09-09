/* =========================================================
   NOVELLOW
   LIBRARY.JS

   Shelf creation
   Shelf editing
   Shelf deletion
   Shelf rendering
   Shelf book population
   Decoration rendering
   Decoration drag + scale
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

    let activeDrag =
        null;


    /* =====================================================
       INITIALIZE
       ===================================================== */

    function init() {

        bindShelfControls();

        bindDecorationDragging();

        render();

    }


    /* =====================================================
       BIND CONTROLS
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


        Novellow.panels?.openPanel?.(
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
            H.getShelfById?.(
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


        syncDecorationCheckboxes(
            shelf.decorations
        );


        Novellow.panels?.openPanel?.(
            "shelfDrawer"
        );

    }


    /* =====================================================
       CLOSE SHELF DRAWER
       ===================================================== */

    function closeShelfDrawer() {

        Novellow.panels?.closeAllPanels?.();

    }


    /* =====================================================
       RESET FORM
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
            state.settings?.defaultShelfSort ||
            CONFIG.defaultShelf?.sort ||
            "manual"
        );


        syncDecorationCheckboxes(
            []
        );

    }


    /* =====================================================
       SUBMIT SHELF
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
                ? H.getShelfById?.(
                    editingId
                )
                : null;


        const selectedDecorations =
            getSelectedDecorations(
                existing
            );


        const shelfData =
            H.normalizeShelf?.({
                ...existing,

                id:
                    existing?.id ||
                    undefined,

                name:
                    getInputValue(
                        "shelfName"
                    ),

                description:
                    getInputValue(
                        "shelfDescription"
                    ),

                material:
                    getInputValue(
                        "shelfMaterial"
                    ),

                mood:
                    getInputValue(
                        "shelfMood"
                    ),

                layout:
                    getInputValue(
                        "shelfLayout"
                    ),

                sort:
                    getInputValue(
                        "shelfSort"
                    ),

                decorations:
                    selectedDecorations,

                createdAt:
                    existing?.createdAt,

                updatedAt:
                    H.nowISO?.()

            });


        if (
            !shelfData.name
        ) {

            H.showToast?.(
                "Give your shelf a name first.",
                "error"
            );

            return;

        }


        if (existing) {

            const index =
                state.shelves.findIndex(
                    shelf =>
                        shelf.id ===
                        existing.id
                );


            if (
                index !== -1
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

    function deleteShelf(
        shelfId
    ) {

        const shelf =
            H.getShelfById?.(
                shelfId
            );


        if (!shelf) {
            return;
        }


        const booksOnShelf =
            H.getBooksForShelf?.(
                shelfId
            ) || [];


        let message =
            `Delete "${shelf.name}"?`;


        if (
            booksOnShelf.length > 0
        ) {

            message +=
                ` The ${booksOnShelf.length} book${booksOnShelf.length === 1 ? "" : "s"} on it will stay in Novellow but become unshelved.`;

        }


        const confirmed =
            H.confirmAction?.(
                message
            );


        if (!confirmed) {
            return;
        }


        state.shelves =
            state.shelves.filter(
                item =>
                    item.id !==
                    shelfId
            );


        state.books =
            state.books.map(
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
                            H.nowISO?.()
                    };

                }
            );


        Novellow.storage
            ?.saveShelves?.();


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
            shelves.length === 0
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


        shelves.forEach(
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
                `material-${shelf.material}`,
                `mood-${shelf.mood}`,
                `layout-${shelf.layout}`
            ].join(" ");


        article.dataset.shelfId =
            shelf.id;


        const books =
            H.sortBooks?.(
                H.getBooksForShelf?.(
                    shelf.id
                ) || [],
                shelf.sort
            ) || [];


        article.innerHTML =
            `
                <header class="shelf-header">

                    <div class="shelf-heading-copy">

                        <span class="shelf-eyebrow">
                            ${H.escapeHTML?.(
                                shelf.mood ||
                                "bookshelf"
                            )}
                        </span>

                        <h2>
                            ${H.escapeHTML?.(
                                shelf.name
                            )}
                        </h2>

                        ${
                            shelf.description
                                ? `
                                    <p>
                                        ${H.escapeHTML?.(
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
                            data-shelf-add-book="${shelf.id}"
                        >
                            + Book
                        </button>

                        <button
                            type="button"
                            class="shelf-action-button"
                            data-shelf-edit="${shelf.id}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="shelf-action-button danger"
                            data-shelf-delete="${shelf.id}"
                        >
                            Delete
                        </button>

                    </div>

                </header>

                <div
                    class="shelf-interior"
                    data-shelf-interior="${shelf.id}"
                >

                    <div
                        class="shelf-books"
                        data-shelf-books="${shelf.id}"
                    ></div>

                    <div
                        class="shelf-floor"
                        aria-hidden="true"
                    ></div>

                    ${
                        books.length === 0
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

                    <div
                        class="shelf-decoration-layer"
                        data-decoration-layer="${shelf.id}"
                    ></div>

                </div>

                <div class="shelf-footer-label">
                    ${books.length}
                    ${
                        books.length === 1
                            ? "book"
                            : "books"
                    }
                </div>
            `;


        const booksContainer =
            article.querySelector(
                `[data-shelf-books="${shelf.id}"]`
            );


        if (booksContainer) {

            books.forEach(
                book => {

                    const bookElement =
                        Novellow.books
                            ?.createShelfBookElement?.(
                                book
                            );


                    if (bookElement) {

                        booksContainer.appendChild(
                            bookElement
                        );

                    }

                }
            );

        }


        const decorationLayer =
            article.querySelector(
                `[data-decoration-layer="${shelf.id}"]`
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
       SHELF ACTION EVENTS
       ===================================================== */

    function bindShelfElementActions(
        article,
        shelf
    ) {

        const addBook =
            article.querySelector(
                `[data-shelf-add-book="${shelf.id}"]`
            );


        addBook?.addEventListener(
            "click",
            () => {

                Novellow.books
                    ?.openAddDrawer?.(
                        shelf.id
                    );

            }
        );


        const edit =
            article.querySelector(
                `[data-shelf-edit="${shelf.id}"]`
            );


        edit?.addEventListener(
            "click",
            () => {

                openEditShelfDrawer(
                    shelf.id
                );

            }
        );


        const remove =
            article.querySelector(
                `[data-shelf-delete="${shelf.id}"]`
            );


        remove?.addEventListener(
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
                ).map(
                    decoration =>
                        typeof decoration ===
                        "string"
                            ? decoration
                            : decoration.type
                )
            );


        H.queryAll?.(
            ".decoration-options input[type='checkbox']"
        ).forEach(
            checkbox => {

                checkbox.checked =
                    selectedTypes.has(
                        checkbox.value
                    );

            }
        );

    }


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
                    H.normalizeDecoration?.(
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


        H.queryAll?.(
            ".decoration-options input[type='checkbox']:checked"
        ).forEach(
            checkbox => {

                const type =
                    checkbox.value;


                const previous =
                    existingByType.get(
                        type
                    );


                selected.push(
                    previous ||
                    H.normalizeDecoration?.({
                        id:
                            H.createId?.(
                                "decor"
                            ),

                        type,

                        x:
                            randomDecorationPosition(),
                        y:
                            randomDecorationHeight(),

                        scale:
                            1
                    })
                );

            }
        );


        return selected;

    }


    /* =====================================================
       RANDOM DECORATION POSITION
       ===================================================== */

    function randomDecorationPosition() {

        return (
            0.08 +
            Math.random() *
            0.78
        );

    }


    function randomDecorationHeight() {

        return (
            0.58 +
            Math.random() *
            0.24
        );

    }


    /* =====================================================
       RENDER DECORATIONS
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
                    H.normalizeDecoration?.(
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


        wrapper.className =
            [
                "shelf-decoration",
                "draggable-decoration",
                `decor-${decoration.type}`,
                getDecorationScaleClass(
                    decoration.scale
                )
            ].join(" ");


        wrapper.dataset.shelfId =
            shelfId;


        wrapper.dataset.decorationId =
            decoration.id;


        wrapper.dataset.decorationType =
            decoration.type;


        wrapper.style.left =
            `${decoration.x * 100}%`;


        wrapper.style.top =
            `${decoration.y * 100}%`;


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
       DECORATION MARKUP
       ===================================================== */

    function getDecorationMarkup(
        type
    ) {

        switch (type) {

            case "cat":

                return `
                    <span class="decor-shadow"></span>
                    <span class="cat-tail"></span>
                    <span class="cat-body"></span>
                    <span class="cat-head"></span>
                    <span class="cat-eye left"></span>
                    <span class="cat-eye right"></span>
                `;


            case "ghost":

                return `
                    <span class="decor-shadow"></span>
                    <span class="ghost-body"></span>
                    <span class="ghost-eye left"></span>
                    <span class="ghost-eye right"></span>
                `;


            case "bat":

                return `
                    <span class="bat-wing left"></span>
                    <span class="bat-body"></span>
                    <span class="bat-wing right"></span>
                `;


            case "raven":

                return `
                    <span class="decor-shadow"></span>
                    <span class="raven-body"></span>
                    <span class="raven-head"></span>
                    <span class="raven-beak"></span>
                    <span class="raven-eye"></span>
                `;


            case "goblin":

                return `
                    <span class="decor-shadow"></span>
                    <span class="goblin-ear left"></span>
                    <span class="goblin-head"></span>
                    <span class="goblin-ear right"></span>
                    <span class="goblin-eye left"></span>
                    <span class="goblin-eye right"></span>
                `;


            case "mushroom":

                return `
                    <span class="decor-shadow"></span>
                    <span class="mushroom-stem"></span>
                    <span class="mushroom-cap"></span>
                    <span class="mushroom-spot one"></span>
                    <span class="mushroom-spot two"></span>
                    <span class="mushroom-spot three"></span>
                `;


            case "plant":

                return `
                    <span class="decor-shadow"></span>
                    <span class="plant-leaf one"></span>
                    <span class="plant-leaf two"></span>
                    <span class="plant-leaf three"></span>
                    <span class="plant-leaf four"></span>
                    <span class="plant-pot"></span>
                `;


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


            case "moss":

                return `
                    <span class="decor-shadow"></span>
                    <span class="moss-clump one"></span>
                    <span class="moss-clump two"></span>
                    <span class="moss-clump three"></span>
                `;


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


            case "candle":

                return `
                    <span class="decor-shadow"></span>
                    <span class="candle-body"></span>
                    <span class="candle-wax"></span>
                    <span class="candle-wick"></span>
                    <span class="candle-flame"></span>
                `;


            case "mug":

                return `
                    <span class="decor-shadow"></span>
                    <span class="mug-body"></span>
                    <span class="mug-handle"></span>
                    <span class="mug-rim"></span>
                    <span class="mug-steam steam-1"></span>
                    <span class="mug-steam steam-2"></span>
                `;


            case "potion":

                return `
                    <span class="decor-shadow"></span>
                    <span class="potion-neck"></span>
                    <span class="potion-bottle"></span>
                    <span class="potion-liquid"></span>
                    <span class="potion-cork"></span>
                `;


            case "crystal":

                return `
                    <span class="decor-shadow"></span>
                    <span class="crystal-shard one"></span>
                    <span class="crystal-shard two"></span>
                    <span class="crystal-shard three"></span>
                `;


            case "stars":

                return `
                    <span class="star-bit one"></span>
                    <span class="star-bit two"></span>
                    <span class="star-bit three"></span>
                `;


            default:

                return `
                    <span class="decoration-symbol">
                        ✦
                    </span>
                `;

        }

    }


    /* =====================================================
       SCALE
       ===================================================== */

    function getDecorationScaleClass(
        scale
    ) {

        const value =
            Number(scale) || 1;


        if (
            value <= 0.8
        ) {
            return "scale-075";
        }


        if (
            value <= 1.1
        ) {
            return "scale-100";
        }


        if (
            value <= 1.35
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
            H.getShelfById?.(
                shelfId
            );


        if (!shelf) {
            return;
        }


        const decoration =
            shelf.decorations.find(
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


        const currentIndex =
            sizes.findIndex(
                size =>
                    Math.abs(
                        size -
                        Number(
                            decoration.scale ||
                            1
                        )
                    ) < 0.08
            );


        decoration.scale =
            sizes[
                (
                    currentIndex + 1
                ) %
                sizes.length
            ];


        shelf.updatedAt =
            H.nowISO?.();


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
            decoration.dataset.shelfId;


        const decorationId =
            decoration.dataset.decorationId;


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
            shelfInterior.getBoundingClientRect();


        const decorationRect =
            decoration.getBoundingClientRect();


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

            decoration.setPointerCapture(
                event.pointerId
            );

        } catch (error) {

            // Not required.

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
            H.clamp?.(
                rawX,
                0,
                Math.max(
                    0,
                    containerRect.width -
                    width
                )
            ) ?? rawX;


        const y =
            H.clamp?.(
                rawY,
                0,
                Math.max(
                    0,
                    containerRect.height -
                    height
                )
            ) ?? rawY;


        element.style.left =
            `${x}px`;


        element.style.top =
            `${y}px`;

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
            ) || 0;


        const top =
            parseFloat(
                element.style.top
            ) || 0;


        const x =
            containerRect.width > 0
                ? H.clamp?.(
                    left /
                    containerRect.width,
                    0,
                    1
                )
                : 0.5;


        const y =
            containerRect.height > 0
                ? H.clamp?.(
                    top /
                    containerRect.height,
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

            element.releasePointerCapture(
                event.pointerId
            );

        } catch (error) {

            // Not required.

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
            H.getShelfById?.(
                shelfId
            );


        if (!shelf) {
            return;
        }


        const decoration =
            shelf.decorations.find(
                item =>
                    item.id ===
                    decorationId
            );


        if (!decoration) {
            return;
        }


        decoration.x =
            H.clamp?.(
                Number(x),
                0,
                1
            ) ?? 0.5;


        decoration.y =
            H.clamp?.(
                Number(y),
                0,
                1
            ) ?? 0.5;


        shelf.updatedAt =
            H.nowISO?.();


        Novellow.storage
            ?.saveShelves?.();

    }


    /* =====================================================
       POPULATE SHELF SELECT
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
            state.shelves.some(
                shelf =>
                    shelf.id ===
                    previous
            )
                ? previous
                : "";

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


    function getInputValue(id) {

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

        renderShelfDecorations

    };


})();
