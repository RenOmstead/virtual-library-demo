/* =========================================================
   SHELFMARK
   LIBRARY APPLICATION
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const SHELF_STORAGE_KEY =
    "shelfmark_shelves";

const BOOK_STORAGE_KEY =
    "shelfmark_books";


/* =========================================================
   STATE
   ========================================================= */

let shelves =
    [];

let books =
    [];

let selectedBookId =
    null;

let selectedJournalSection =
    null;

let pendingCoverData =
    "";

let pendingSpineData =
    "";


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeLibrary
);


function initializeLibrary() {

    loadData();

    bindControls();

    renderLibrary();

}


/* =========================================================
   LOAD
   ========================================================= */

function loadData() {

    shelves =
        loadCollection(
            SHELF_STORAGE_KEY,
            window.SHELFMARK_DATA
                ?.shelves
        )
        .map(
            normalizeShelf
        );


    books =
        loadCollection(
            BOOK_STORAGE_KEY,
            window.SHELFMARK_DATA
                ?.books
        )
        .map(
            normalizeBook
        );

}


/* =========================================================
   COLLECTION LOADER
   ========================================================= */

function loadCollection(
    key,
    fallback
) {

    try {

        const stored =
            localStorage.getItem(
                key
            );


        if (
            stored
        ) {

            return JSON.parse(
                stored
            );

        }

    }

    catch (error) {

        console.error(
            `Could not load ${key}:`,
            error
        );

    }


    return Array.isArray(
        fallback
    )
        ?
        [...fallback]
        :
        [];

}


/* =========================================================
   NORMALIZE SHELF
   ========================================================= */

function normalizeShelf(
    shelf
) {

    return {

        id:
            shelf.id ||
            generateId(),

        name:
            shelf.name ||
            "Untitled Shelf",

        description:
            shelf.description ||
            "",

        material:
            shelf.material ||
            "walnut",

        mood:
            shelf.mood ||
            "cozy",

        layout:
            shelf.layout ||
            "mixed",

        sort:
            shelf.sort ||
            "manual",

        decorations:
            Array.isArray(
                shelf.decorations
            )
            ?
            shelf.decorations
            :
            [],

        created_at:
            shelf.created_at ||
            new Date()
                .toISOString(),

        updated_at:
            shelf.updated_at ||
            ""

    };

}


/* =========================================================
   NORMALIZE BOOK
   ========================================================= */

function normalizeBook(
    book
) {

    return {

        id:
            book.id ||
            generateId(),

        shelf_id:
            book.shelf_id ||
            "",

        title:
            book.title ||
            "Untitled Book",

        author:
            book.author ||
            "",

        genre:
            book.genre ||
            "",

        publication_year:
            book.publication_year ||
            "",

        pages:
            normalizeNumber(
                book.pages
            ),

        isbn:
            book.isbn ||
            "",

        series:
            book.series ||
            "",

        status:
            normalizeBookStatus(
                book.status
            ),

        rating:
            normalizeNumber(
                book.rating
            ),

        started:
            book.started ||
            "",

        finished:
            book.finished ||
            "",

        current_page:
            normalizeNumber(
                book.current_page
            ),

        times_read:
            normalizeNumber(
                book.times_read
            ),

        cover_image:
            book.cover_image ||
            "",

        spine_image:
            book.spine_image ||
            "",

        spine_color:
            book.spine_color ||
            "#b98f85",

        text_color:
            book.text_color ||
            "#fff8ee",

        height:
            book.height ||
            "medium",

        thickness:
            book.thickness ||
            "medium",

        style:
            book.style ||
            "classic",

        journal:
            normalizeJournal(
                book.journal
            ),

        created_at:
            book.created_at ||
            new Date()
                .toISOString(),

        updated_at:
            book.updated_at ||
            ""

    };

}


/* =========================================================
   JOURNAL
   ========================================================= */

function normalizeJournal(
    journal
) {

    const source =
        journal ||
        {};


    return {

        notes:
            Array.isArray(
                source.notes
            )
            ?
            source.notes
            :
            [],

        thoughts:
            Array.isArray(
                source.thoughts
            )
            ?
            source.thoughts
            :
            [],

        words:
            Array.isArray(
                source.words
            )
            ?
            source.words
            :
            [],

        quotes:
            Array.isArray(
                source.quotes
            )
            ?
            source.quotes
            :
            [],

        characters:
            Array.isArray(
                source.characters
            )
            ?
            source.characters
            :
            [],

        themes:
            Array.isArray(
                source.themes
            )
            ?
            source.themes
            :
            [],

        questions:
            Array.isArray(
                source.questions
            )
            ?
            source.questions
            :
            [],

        review:
            Array.isArray(
                source.review
            )
            ?
            source.review
            :
            []

    };

}


/* =========================================================
   CONTROLS
   ========================================================= */

function bindControls() {

    [
        "sidebarAddShelf",
        "topAddShelf",
        "bottomAddShelf",
        "emptyAddShelf"
    ]
        .forEach(
            id => {

                document
                    .getElementById(
                        id
                    )
                    ?.addEventListener(
                        "click",
                        () =>
                            openShelfDrawer()
                    );

            }
        );


    [
        "sidebarAddBook",
        "topAddBook",
        "emptyAddBook"
    ]
        .forEach(
            id => {

                document
                    .getElementById(
                        id
                    )
                    ?.addEventListener(
                        "click",
                        () =>
                            openBookDrawer()
                    );

            }
        );


    document
        .getElementById(
            "closeShelfDrawer"
        )
        ?.addEventListener(
            "click",
            closeDrawers
        );


    document
        .getElementById(
            "cancelShelf"
        )
        ?.addEventListener(
            "click",
            closeDrawers
        );


    document
        .getElementById(
            "closeBookDrawer"
        )
        ?.addEventListener(
            "click",
            closeDrawers
        );


    document
        .getElementById(
            "cancelBook"
        )
        ?.addEventListener(
            "click",
            closeDrawers
        );


    document
        .getElementById(
            "overlay"
        )
        ?.addEventListener(
            "click",
            closeDrawers
        );


    document
        .getElementById(
            "shelfForm"
        )
        ?.addEventListener(
            "submit",
            saveShelfFromForm
        );


    document
        .getElementById(
            "bookForm"
        )
        ?.addEventListener(
            "submit",
            saveBookFromForm
        );


    document
        .getElementById(
            "bookCoverUpload"
        )
        ?.addEventListener(
            "change",
            handleCoverUpload
        );


    document
        .getElementById(
            "bookSpineUpload"
        )
        ?.addEventListener(
            "change",
            handleSpineUpload
        );


    document
        .getElementById(
            "closeBookReveal"
        )
        ?.addEventListener(
            "click",
            closeBookReveal
        );


    document
        .getElementById(
            "editSelectedBook"
        )
        ?.addEventListener(
            "click",
            editSelectedBook
        );


    document
        .getElementById(
            "openSelectedBook"
        )
        ?.addEventListener(
            "click",
            openReadingBook
        );


    document
        .getElementById(
            "closeReadingBook"
        )
        ?.addEventListener(
            "click",
            closeReadingBook
        );


    document
        .getElementById(
            "backToContents"
        )
        ?.addEventListener(
            "click",
            showJournalContents
        );


    document
        .querySelectorAll(
            "[data-journal-section]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openJournalSection(
                            button.dataset
                                .journalSection
                        );

                    }
                );

            }
        );


    document
        .getElementById(
            "addJournalEntry"
        )
        ?.addEventListener(
            "click",
            openEntryModal
        );


    document
        .getElementById(
            "closeEntryModal"
        )
        ?.addEventListener(
            "click",
            closeEntryModal
        );


    document
        .getElementById(
            "cancelEntry"
        )
        ?.addEventListener(
            "click",
            closeEntryModal
        );


    document
        .getElementById(
            "entryForm"
        )
        ?.addEventListener(
            "submit",
            saveJournalEntry
        );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeEntryModal();

                closeReadingBook();

                closeBookReveal();

                closeDrawers();

            }

        }
    );

}


/* =========================================================
   RENDER LIBRARY
   ========================================================= */

function renderLibrary() {

    renderShelfSelect();

    renderShelves();

    updateLibraryMetrics();

}


/* =========================================================
   SHELVES
   ========================================================= */

function renderShelves() {

    const container =
        document.getElementById(
            "shelfContainer"
        );


    const empty =
        document.getElementById(
            "libraryEmpty"
        );


    const bottomButton =
        document.getElementById(
            "bottomAddShelf"
        );


    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !shelves.length
    ) {

        if (
            empty
        ) {

            empty.hidden =
                false;

        }


        if (
            bottomButton
        ) {

            bottomButton.hidden =
                true;

        }


        return;

    }


    if (
        empty
    ) {

        empty.hidden =
            true;

    }


    if (
        bottomButton
    ) {

        bottomButton.hidden =
            false;

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


/* =========================================================
   CREATE SHELF
   ========================================================= */

function createShelfElement(
    shelf
) {

    const section =
        document.createElement(
            "section"
        );


    section.className =
        "library-shelf";


    section.dataset.material =
        shelf.material;


    const shelfBooks =
        sortShelfBooks(
            books.filter(
                book =>
                    String(
                        book.shelf_id
                    )
                    ===
                    String(
                        shelf.id
                    )
            ),
            shelf.sort
        );


    section.innerHTML = `

        <div class="shelf-heading">


            <div>

                <h2>
                    ${escapeHTML(shelf.name)}
                </h2>

                ${
                    shelf.description

                    ?

                    `
                        <p>
                            ${escapeHTML(shelf.description)}
                        </p>
                    `

                    :

                    ""
                }

            </div>


            <div class="shelf-tools">

                <button
                    class="shelf-tool"
                    type="button"
                    data-action="add"
                >
                    + book
                </button>

                <button
                    class="shelf-tool"
                    type="button"
                    data-action="edit"
                >
                    edit shelf
                </button>

            </div>


        </div>


        <div class="shelf-cabinet">


            <div class="shelf-back">
            </div>


            <div
                class="book-row ${escapeHTML(shelf.layout)}"
            >
            </div>


            <div class="shelf-board">
            </div>


        </div>

    `;


    const row =
        section.querySelector(
            ".book-row"
        );


    if (
        shelfBooks.length
    ) {

        shelfBooks.forEach(
            book => {

                row.appendChild(
                    createBookElement(
                        book
                    )
                );

            }
        );

    }

    else {

        const message =
            document.createElement(
                "div"
            );


        message.className =
            "empty-shelf-message";


        message.innerHTML = `

            This shelf looks a little lonely.

            <button type="button">
                tuck in a book
            </button>

        `;


        message
            .querySelector(
                "button"
            )
            ?.addEventListener(
                "click",
                () => {

                    openBookDrawer(
                        null,
                        shelf.id
                    );

                }
            );


        row.appendChild(
            message
        );

    }


    shelf.decorations
        .forEach(
            decoration => {

                row.appendChild(
                    createDecoration(
                        decoration
                    )
                );

            }
        );


    section
        .querySelector(
            '[data-action="add"]'
        )
        ?.addEventListener(
            "click",
            () => {

                openBookDrawer(
                    null,
                    shelf.id
                );

            }
        );


    section
        .querySelector(
            '[data-action="edit"]'
        )
        ?.addEventListener(
            "click",
            () => {

                openShelfDrawer(
                    shelf.id
                );

            }
        );


    return section;

}


/* =========================================================
   BOOK ELEMENT
   ========================================================= */

function createBookElement(
    book
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        [
            "shelf-book",
            `height-${book.height}`,
            `thickness-${book.thickness}`,
            `book-style-${book.style}`
        ]
            .join(" ");


    element.dataset.status =
        book.status;


    element.title =
        `${book.title}${book.author ? " — " + book.author : ""}`;


    element.style.setProperty(
        "--book-color",
        book.spine_color
    );


    element.style.setProperty(
        "--book-text",
        book.text_color
    );


    if (
        book.spine_image
    ) {

        element.innerHTML = `

            <div
                class="book-spine custom-image"
                style="background-image:url('${safeStyleURL(book.spine_image)}')"
            >
            </div>

        `;

    }

    else {

        element.innerHTML = `

            <div class="book-spine">

                <div class="spine-inner">

                    <span class="spine-title">
                        ${escapeHTML(book.title)}
                    </span>

                    <span class="spine-ornament">
                        ${getBookOrnament(book.style)}
                    </span>

                </div>

            </div>

        `;

    }


    element.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll(
                    ".shelf-book"
                )
                .forEach(
                    item =>
                        item.classList.remove(
                            "selected"
                        )
                );


            element.classList.add(
                "selected"
            );


            setTimeout(
                () => {

                    openBookReveal(
                        book.id
                    );

                },
                180
            );

        }
    );


    return element;

}


/* =========================================================
   DECORATIONS
   ========================================================= */

function createDecoration(
    type
) {

    const decoration =
        document.createElement(
            "div"
        );


    decoration.className =
        `shelf-decoration decor-${type}`;


    decoration.setAttribute(
        "aria-hidden",
        "true"
    );


    return decoration;

}


/* =========================================================
   SORT BOOKS
   ========================================================= */

function sortShelfBooks(
    list,
    sort
) {

    const result =
        [...list];


    if (
        sort ===
        "title"
    ) {

        return result.sort(
            (a,b) =>
                a.title.localeCompare(
                    b.title
                )
        );

    }


    if (
        sort ===
        "author"
    ) {

        return result.sort(
            (a,b) =>
                a.author.localeCompare(
                    b.author
                )
        );

    }


    if (
        sort ===
        "rating"
    ) {

        return result.sort(
            (a,b) =>
                b.rating -
                a.rating
        );

    }


    if (
        sort ===
        "finished"
    ) {

        return result.sort(
            (a,b) =>
                String(
                    b.finished ||
                    ""
                )
                    .localeCompare(
                        String(
                            a.finished ||
                            ""
                        )
                    )
        );

    }


    return result.sort(
        (a,b) =>
            new Date(
                a.created_at
            )
            -
            new Date(
                b.created_at
            )
    );

}


/* =========================================================
   METRICS
   ========================================================= */

function updateLibraryMetrics() {

    setText(
        "bookCount",
        books.length
    );


    setText(
        "readingCount",
        books.filter(
            book =>
                book.status ===
                "reading"
        ).length
    );


    setText(
        "finishedCount",
        books.filter(
            book =>
                book.status ===
                "finished"
        ).length
    );

}


/* =========================================================
   SHELF SELECT
   ========================================================= */

function renderShelfSelect() {

    const select =
        document.getElementById(
            "bookShelf"
        );


    if (
        !select
    ) {

        return;

    }


    const current =
        select.value;


    select.innerHTML =
        "";


    if (
        !shelves.length
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            "";


        option.textContent =
            "Create a shelf first";


        select.appendChild(
            option
        );


        return;

    }


    shelves.forEach(
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


    if (
        current
        &&
        shelves.some(
            shelf =>
                String(
                    shelf.id
                )
                ===
                String(
                    current
                )
        )
    ) {

        select.value =
            current;

    }

}


/* =========================================================
   SHELF DRAWER
   ========================================================= */

function openShelfDrawer(
    shelfId = null
) {

    resetShelfForm();


    if (
        shelfId
    ) {

        loadShelfIntoForm(
            shelfId
        );

    }


    showDrawer(
        "shelfDrawer"
    );

}


/* =========================================================
   RESET SHELF
   ========================================================= */

function resetShelfForm() {

    document
        .getElementById(
            "shelfForm"
        )
        ?.reset();


    setValue(
        "editingShelfId",
        ""
    );


    setValue(
        "shelfMaterial",
        "walnut"
    );


    setValue(
        "shelfMood",
        "cozy"
    );


    setValue(
        "shelfLayout",
        "mixed"
    );


    setValue(
        "shelfSort",
        "manual"
    );


    setText(
        "shelfDrawerTitle",
        "Create a shelf"
    );


    setText(
        "saveShelfLabel",
        "create shelf"
    );

}


/* =========================================================
   LOAD SHELF
   ========================================================= */

function loadShelfIntoForm(
    id
) {

    const shelf =
        getShelfById(
            id
        );


    if (
        !shelf
    ) {

        return;

    }


    setValue(
        "editingShelfId",
        shelf.id
    );


    setValue(
        "shelfName",
        shelf.name
    );


    setValue(
        "shelfDescription",
        shelf.description
    );


    setValue(
        "shelfMaterial",
        shelf.material
    );


    setValue(
        "shelfMood",
        shelf.mood
    );


    setValue(
        "shelfLayout",
        shelf.layout
    );


    setValue(
        "shelfSort",
        shelf.sort
    );


    document
        .querySelectorAll(
            '[name="shelfDecoration"]'
        )
        .forEach(
            input => {

                input.checked =
                    shelf.decorations
                        .includes(
                            input.value
                        );

            }
        );


    setText(
        "shelfDrawerTitle",
        "Edit shelf"
    );


    setText(
        "saveShelfLabel",
        "save shelf"
    );

}


/* =========================================================
   SAVE SHELF
   ========================================================= */

function saveShelfFromForm(
    event
) {

    event.preventDefault();


    const name =
        getValue(
            "shelfName"
        );


    if (
        !name
    ) {

        return;

    }


    const editingId =
        getValue(
            "editingShelfId"
        );


    const existing =
        editingId
        ?
        getShelfById(
            editingId
        )
        :
        null;


    const record = {

        id:
            editingId ||
            generateId(),

        name,

        description:
            getValue(
                "shelfDescription"
            ),

        material:
            getValue(
                "shelfMaterial"
            )
            ||
            "walnut",

        mood:
            getValue(
                "shelfMood"
            )
            ||
            "cozy",

        layout:
            getValue(
                "shelfLayout"
            )
            ||
            "mixed",

        sort:
            getValue(
                "shelfSort"
            )
            ||
            "manual",

        decorations:
            [
                ...document.querySelectorAll(
                    '[name="shelfDecoration"]:checked'
                )
            ]
                .map(
                    input =>
                        input.value
                ),

        created_at:
            existing?.created_at
            ||
            new Date()
                .toISOString(),

        updated_at:
            new Date()
                .toISOString()

    };


    if (
        editingId
    ) {

        const index =
            shelves.findIndex(
                shelf =>
                    String(
                        shelf.id
                    )
                    ===
                    String(
                        editingId
                    )
            );


        if (
            index >=
            0
        ) {

            shelves[index] =
                record;

        }

    }

    else {

        shelves.push(
            record
        );

    }


    saveShelves();

    closeDrawers();

    renderLibrary();

}


/* =========================================================
   BOOK DRAWER
   ========================================================= */

function openBookDrawer(
    bookId = null,
    shelfId = null
) {

    if (
        !shelves.length
        &&
        !bookId
    ) {

        openShelfDrawer();

        return;

    }


    resetBookForm();


    if (
        bookId
    ) {

        loadBookIntoForm(
            bookId
        );

    }

    else if (
        shelfId
    ) {

        setValue(
            "bookShelf",
            shelfId
        );

    }


    showDrawer(
        "bookDrawer"
    );

}


/* =========================================================
   RESET BOOK
   ========================================================= */

function resetBookForm() {

    document
        .getElementById(
            "bookForm"
        )
        ?.reset();


    pendingCoverData =
        "";


    pendingSpineData =
        "";


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
        "bookCurrentPage",
        "0"
    );


    setValue(
        "bookTimesRead",
        "0"
    );


    setValue(
        "bookSpineColor",
        "#b98f85"
    );


    setValue(
        "bookTextColor",
        "#fff8ee"
    );


    setValue(
        "bookHeight",
        "medium"
    );


    setValue(
        "bookThickness",
        "medium"
    );


    setValue(
        "bookStyle",
        "classic"
    );


    renderShelfSelect();


    setText(
        "bookDrawerTitle",
        "Add a book"
    );


    setText(
        "saveBookLabel",
        "tuck it in"
    );

}


/* =========================================================
   LOAD BOOK
   ========================================================= */

function loadBookIntoForm(
    id
) {

    const book =
        getBookById(
            id
        );


    if (
        !book
    ) {

        return;

    }


    pendingCoverData =
        book.cover_image;


    pendingSpineData =
        book.spine_image;


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
        book.publication_year
    );


    setValue(
        "bookPages",
        book.pages
    );


    setValue(
        "bookISBN",
        book.isbn
    );


    setValue(
        "bookSeries",
        book.series
    );


    setValue(
        "bookShelf",
        book.shelf_id
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
        "bookStarted",
        book.started
    );


    setValue(
        "bookFinished",
        book.finished
    );


    setValue(
        "bookCurrentPage",
        book.current_page
    );


    setValue(
        "bookTimesRead",
        book.times_read
    );


    setValue(
        "bookSpineColor",
        book.spine_color
    );


    setValue(
        "bookTextColor",
        book.text_color
    );


    setValue(
        "bookHeight",
        book.height
    );


    setValue(
        "bookThickness",
        book.thickness
    );


    setValue(
        "bookStyle",
        book.style
    );


    setText(
        "bookDrawerTitle",
        "Edit book"
    );


    setText(
        "saveBookLabel",
        "save changes"
    );

}


/* =========================================================
   SAVE BOOK
   ========================================================= */

function saveBookFromForm(
    event
) {

    event.preventDefault();


    const title =
        getValue(
            "bookTitle"
        );


    const shelfId =
        getValue(
            "bookShelf"
        );


    if (
        !title ||
        !shelfId
    ) {

        return;

    }


    const editingId =
        getValue(
            "editingBookId"
        );


    const existing =
        editingId
        ?
        getBookById(
            editingId
        )
        :
        null;


    const pages =
        normalizeNumber(
            getValue(
                "bookPages"
            )
        );


    const currentPage =
        Math.min(
            pages ||
            Infinity,
            normalizeNumber(
                getValue(
                    "bookCurrentPage"
                )
            )
        );


    const record = {

        id:
            editingId ||
            generateId(),

        shelf_id:
            shelfId,

        title,

        author:
            getValue(
                "bookAuthor"
            ),

        genre:
            getValue(
                "bookGenre"
            ),

        publication_year:
            getValue(
                "bookYear"
            ),

        pages,

        isbn:
            getValue(
                "bookISBN"
            ),

        series:
            getValue(
                "bookSeries"
            ),

        status:
            normalizeBookStatus(
                getValue(
                    "bookStatus"
                )
            ),

        rating:
            normalizeNumber(
                getValue(
                    "bookRating"
                )
            ),

        started:
            getValue(
                "bookStarted"
            ),

        finished:
            getValue(
                "bookFinished"
            ),

        current_page:
            Number.isFinite(
                currentPage
            )
            ?
            currentPage
            :
            0,

        times_read:
            normalizeNumber(
                getValue(
                    "bookTimesRead"
                )
            ),

        cover_image:
            pendingCoverData,

        spine_image:
            pendingSpineData,

        spine_color:
            getValue(
                "bookSpineColor"
            )
            ||
            "#b98f85",

        text_color:
            getValue(
                "bookTextColor"
            )
            ||
            "#fff8ee",

        height:
            getValue(
                "bookHeight"
            )
            ||
            "medium",

        thickness:
            getValue(
                "bookThickness"
            )
            ||
            "medium",

        style:
            getValue(
                "bookStyle"
            )
            ||
            "classic",

        journal:
            existing?.journal
            ||
            normalizeJournal(),

        created_at:
            existing?.created_at
            ||
            new Date()
                .toISOString(),

        updated_at:
            new Date()
                .toISOString()

    };


    if (
        editingId
    ) {

        const index =
            books.findIndex(
                book =>
                    String(
                        book.id
                    )
                    ===
                    String(
                        editingId
                    )
            );


        if (
            index >=
            0
        ) {

            books[index] =
                record;

        }

    }

    else {

        books.push(
            record
        );

    }


    saveBooks();

    closeDrawers();

    renderLibrary();

}


/* =========================================================
   FILE UPLOAD
   ========================================================= */

async function handleCoverUpload(
    event
) {

    const file =
        event.target.files?.[0];


    if (
        !file
    ) {

        return;

    }


    pendingCoverData =
        await fileToDataURL(
            file
        );

}


async function handleSpineUpload(
    event
) {

    const file =
        event.target.files?.[0];


    if (
        !file
    ) {

        return;

    }


    pendingSpineData =
        await fileToDataURL(
            file
        );

}


function fileToDataURL(
    file
) {

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


/* =========================================================
   SHOW DRAWER
   ========================================================= */

function showDrawer(
    drawerId
) {

    const drawer =
        document.getElementById(
            drawerId
        );


    const overlay =
        document.getElementById(
            "overlay"
        );


    if (
        !drawer ||
        !overlay
    ) {

        return;

    }


    overlay.hidden =
        false;


    drawer.hidden =
        false;


    requestAnimationFrame(
        () => {

            overlay.classList.add(
                "open"
            );


            drawer.classList.add(
                "open"
            );

        }
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE DRAWERS
   ========================================================= */

function closeDrawers() {

    const overlay =
        document.getElementById(
            "overlay"
        );


    const drawers =
        document.querySelectorAll(
            ".form-drawer"
        );


    overlay?.classList.remove(
        "open"
    );


    drawers.forEach(
        drawer =>
            drawer.classList.remove(
                "open"
            )
    );


    setTimeout(
        () => {

            if (
                overlay
            ) {

                overlay.hidden =
                    true;

            }


            drawers.forEach(
                drawer =>
                    drawer.hidden =
                        true
            );

        },
        250
    );


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   BOOK REVEAL
   ========================================================= */

function openBookReveal(
    id
) {

    const book =
        getBookById(
            id
        );


    if (
        !book
    ) {

        return;

    }


    selectedBookId =
        book.id;


    const reveal =
        document.getElementById(
            "bookReveal"
        );


    if (
        !reveal
    ) {

        return;

    }


    renderCoverInto(
        "revealCover",
        book
    );


    setText(
        "revealStatus",
        getStatusLabel(
            book.status
        )
    );


    setText(
        "revealTitle",
        book.title
    );


    setText(
        "revealAuthor",
        book.author ||
        "Author not recorded"
    );


    setText(
        "revealStarted",
        formatDate(
            book.started
        )
    );


    setText(
        "revealFinished",
        formatDate(
            book.finished
        )
    );


    setText(
        "revealPageCount",
        `${book.current_page} / ${book.pages || 0} pages`
    );


    const percentage =
        getProgressPercent(
            book
        );


    setText(
        "revealPercent",
        `${percentage}%`
    );


    const progress =
        document.getElementById(
            "revealProgressBar"
        );


    if (
        progress
    ) {

        progress.style.width =
            `${percentage}%`;

    }


    const bookmark =
        document.getElementById(
            "progressBookmark"
        );


    if (
        bookmark
    ) {

        bookmark.style.left =
            `${percentage}%`;

    }


    renderRating(
        book.rating
    );


    reveal.hidden =
        false;


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE REVEAL
   ========================================================= */

function closeBookReveal() {

    const reveal =
        document.getElementById(
            "bookReveal"
        );


    if (
        reveal
    ) {

        reveal.hidden =
            true;

    }


    document
        .querySelectorAll(
            ".shelf-book"
        )
        .forEach(
            book =>
                book.classList.remove(
                    "selected"
                )
        );


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   EDIT SELECTED
   ========================================================= */

function editSelectedBook() {

    const id =
        selectedBookId;


    closeBookReveal();


    if (
        id
    ) {

        setTimeout(
            () =>
                openBookDrawer(
                    id
                ),
            50
        );

    }

}


/* =========================================================
   COVER
   ========================================================= */

function renderCoverInto(
    elementId,
    book
) {

    const element =
        document.getElementById(
            elementId
        );


    if (
        !element
    ) {

        return;

    }


    element.innerHTML =
        "";


    element.style.backgroundImage =
        "";


    element.style.backgroundColor =
        book.spine_color;


    if (
        book.cover_image
    ) {

        element.style.backgroundImage =
            `url("${safeStyleURL(book.cover_image)}")`;

        return;

    }


    element.innerHTML = `

        <div class="generated-cover">

            <span class="cover-ornament">
                ${getBookOrnament(book.style)}
            </span>

            <strong>
                ${escapeHTML(book.title)}
            </strong>

            <span>
                ${escapeHTML(book.author || "")}
            </span>

        </div>

    `;

}


/* =========================================================
   RATING
   ========================================================= */

function renderRating(
    rating
) {

    const element =
        document.getElementById(
            "revealRating"
        );


    if (
        !element
    ) {

        return;

    }


    if (
        !rating
    ) {

        element.textContent =
            "not rated yet";

        return;

    }


    element.textContent =
        "★".repeat(
            Math.min(
                5,
                rating
            )
        )
        +
        "☆".repeat(
            Math.max(
                0,
                5 - rating
            )
        );

}


/* =========================================================
   OPEN READING BOOK
   ========================================================= */

function openReadingBook() {

    const book =
        getBookById(
            selectedBookId
        );


    if (
        !book
    ) {

        return;

    }


    closeBookReveal();


    setText(
        "journalBookTitle",
        book.title
    );


    setText(
        "journalBookAuthor",
        book.author ||
        "Author not recorded"
    );


    setText(
        "journalStatus",
        getStatusLabel(
            book.status
        )
    );


    setText(
        "journalStarted",
        formatDate(
            book.started
        )
    );


    setText(
        "journalFinished",
        formatDate(
            book.finished
        )
    );


    setText(
        "journalPages",
        `${book.current_page} / ${book.pages || 0}`
    );


    renderCoverInto(
        "journalCover",
        book
    );


    showJournalContents();


    const readingBook =
        document.getElementById(
            "readingBook"
        );


    if (
        readingBook
    ) {

        readingBook.hidden =
            false;

    }


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE READING BOOK
   ========================================================= */

function closeReadingBook() {

    const element =
        document.getElementById(
            "readingBook"
        );


    if (
        element
    ) {

        element.hidden =
            true;

    }


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   JOURNAL CONTENTS
   ========================================================= */

function showJournalContents() {

    selectedJournalSection =
        null;


    const contents =
        document.getElementById(
            "journalContents"
        );


    const section =
        document.getElementById(
            "journalSection"
        );


    if (
        contents
    ) {

        contents.hidden =
            false;

    }


    if (
        section
    ) {

        section.hidden =
            true;

    }

}


/* =========================================================
   OPEN JOURNAL SECTION
   ========================================================= */

function openJournalSection(
    section
) {

    selectedJournalSection =
        section;


    const contents =
        document.getElementById(
            "journalContents"
        );


    const journalSection =
        document.getElementById(
            "journalSection"
        );


    if (
        contents
    ) {

        contents.hidden =
            true;

    }


    if (
        journalSection
    ) {

        journalSection.hidden =
            false;

    }


    setText(
        "journalSectionLabel",
        getSectionLabel(
            section
        )
    );


    setText(
        "journalSectionTitle",
        getSectionTitle(
            section
        )
    );


    renderJournalEntries();

}


/* =========================================================
   SECTION LABELS
   ========================================================= */

function getSectionLabel(
    section
) {

    const labels = {

        overview:
            "ABOUT THIS BOOK",

        notes:
            "MARGINAL NOTES",

        thoughts:
            "THINGS I'M THINKING",

        words:
            "LITTLE WORDS",

        quotes:
            "WORDS WORTH KEEPING",

        characters:
            "PEOPLE IN THESE PAGES",

        themes:
            "THREADS & THEMES",

        questions:
            "THINGS I'M WONDERING",

        review:
            "WHEN THE BOOK IS DONE"

    };


    return labels[
        section
    ]
    ||
    "";

}


/* =========================================================
   SECTION TITLES
   ========================================================= */

function getSectionTitle(
    section
) {

    const titles = {

        overview:
            "Overview",

        notes:
            "My notes",

        thoughts:
            "My thoughts",

        words:
            "Word study",

        quotes:
            "Saved quotes",

        characters:
            "Characters",

        themes:
            "Themes",

        questions:
            "Questions",

        review:
            "My review"

    };


    return titles[
        section
    ]
    ||
    section;

}


/* =========================================================
   RENDER JOURNAL
   ========================================================= */

function renderJournalEntries() {

    const container =
        document.getElementById(
            "journalEntries"
        );


    const addButton =
        document.getElementById(
            "addJournalEntry"
        );


    const book =
        getBookById(
            selectedBookId
        );


    if (
        !container ||
        !book
    ) {

        return;

    }


    container.innerHTML =
        "";


    if (
        selectedJournalSection ===
        "overview"
    ) {

        if (
            addButton
        ) {

            addButton.hidden =
                true;

        }


        renderOverview(
            container,
            book
        );

        return;

    }


    if (
        addButton
    ) {

        addButton.hidden =
            false;

    }


    const entries =
        book.journal[
            selectedJournalSection
        ]
        ||
        [];


    if (
        !entries.length
    ) {

        container.innerHTML = `

            <div class="empty-journal-section">

                Nothing lives on this page yet.

                <br><br>

                Add your first
                ${escapeHTML(getSingularEntryName(selectedJournalSection))}.

            </div>

        `;


        return;

    }


    entries
        .slice()
        .reverse()
        .forEach(
            entry => {

                container.appendChild(
                    createJournalEntry(
                        entry,
                        selectedJournalSection
                    )
                );

            }
        );

}


/* =========================================================
   OVERVIEW
   ========================================================= */

function renderOverview(
    container,
    book
) {

    const progress =
        getProgressPercent(
            book
        );


    container.innerHTML = `

        <div class="journal-entry">

            <div class="journal-entry-header">

                <strong>
                    ${escapeHTML(book.title)}
                </strong>

                <small>
                    ${progress}% read
                </small>

            </div>

            <p>
                Author: ${escapeHTML(book.author || "—")}
                <br>
                Genre: ${escapeHTML(book.genre || "—")}
                <br>
                Publication year: ${escapeHTML(book.publication_year || "—")}
                <br>
                Pages: ${book.pages || "—"}
                <br>
                Series: ${escapeHTML(book.series || "—")}
                <br>
                Times read: ${book.times_read || 0}
            </p>

        </div>


        <div class="journal-entry">

            <div class="journal-entry-header">

                <strong>
                    Reading timeline
                </strong>

            </div>

            <p>
                Started: ${escapeHTML(formatDate(book.started))}
                <br>
                Finished: ${escapeHTML(formatDate(book.finished))}
                <br>
                Current page: ${book.current_page || 0}
            </p>

        </div>

    `;

}


/* =========================================================
   CREATE JOURNAL ENTRY
   ========================================================= */

function createJournalEntry(
    entry,
    section
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "journal-entry";


    card.innerHTML = `

        <div class="journal-entry-header">

            <strong>
                ${escapeHTML(getEntryHeading(entry,section))}
            </strong>

            <small>
                ${escapeHTML(formatDate(entry.date))}
            </small>

        </div>


        <p>
            ${escapeHTML(getEntryBody(entry,section))}
        </p>


        ${
            getEntryMeta(entry,section)

            ?

            `
                <div class="journal-entry-meta">
                    ${escapeHTML(getEntryMeta(entry,section))}
                </div>
            `

            :

            ""
        }

    `;


    return card;

}


/* =========================================================
   ENTRY HEADING
   ========================================================= */

function getEntryHeading(
    entry,
    section
) {

    if (
        section ===
        "words"
    ) {

        return entry.word ||
        "New word";

    }


    if (
        section ===
        "characters"
    ) {

        return entry.name ||
        "Character";

    }


    if (
        section ===
        "themes"
    ) {

        return entry.theme ||
        "Theme";

    }


    if (
        section ===
        "review"
    ) {

        return entry.title ||
        "My review";

    }


    return entry.title ||
    getSectionTitle(
        section
    );

}


/* =========================================================
   ENTRY BODY
   ========================================================= */

function getEntryBody(
    entry,
    section
) {

    if (
        section ===
        "words"
    ) {

        return [
            entry.definition,
            entry.context
                ?
                `Context: ${entry.context}`
                :
                "",
            entry.sentence
                ?
                `My sentence: ${entry.sentence}`
                :
                ""
        ]
            .filter(Boolean)
            .join("\n\n");

    }


    if (
        section ===
        "quotes"
    ) {

        return [
            entry.quote,
            entry.reason
                ?
                `Why I kept it: ${entry.reason}`
                :
                ""
        ]
            .filter(Boolean)
            .join("\n\n");

    }


    if (
        section ===
        "characters"
    ) {

        return [
            entry.role,
            entry.notes
        ]
            .filter(Boolean)
            .join("\n\n");

    }


    if (
        section ===
        "themes"
    ) {

        return entry.notes ||
        "";

    }


    if (
        section ===
        "questions"
    ) {

        return [
            entry.question,
            entry.answer
                ?
                `Answer: ${entry.answer}`
                :
                ""
        ]
            .filter(Boolean)
            .join("\n\n");

    }


    if (
        section ===
        "review"
    ) {

        return [
            entry.review,
            entry.learned
                ?
                `What I learned: ${entry.learned}`
                :
                "",
            entry.stayed
                ?
                `What stayed with me: ${entry.stayed}`
                :
                ""
        ]
            .filter(Boolean)
            .join("\n\n");

    }


    return entry.body ||
    "";

}


/* =========================================================
   ENTRY META
   ========================================================= */

function getEntryMeta(
    entry,
    section
) {

    const parts =
        [];


    if (
        entry.page
    ) {

        parts.push(
            `page ${entry.page}`
        );

    }


    if (
        entry.chapter
    ) {

        parts.push(
            entry.chapter
        );

    }


    if (
        entry.tags
    ) {

        parts.push(
            entry.tags
        );

    }


    if (
        section ===
        "questions"
        &&
        entry.status
    ) {

        parts.push(
            entry.status
        );

    }


    if (
        section ===
        "review"
        &&
        entry.rating
    ) {

        parts.push(
            `${entry.rating}/5`
        );

    }


    return parts.join(
        " · "
    );

}


/* =========================================================
   ENTRY MODAL
   ========================================================= */

function openEntryModal() {

    if (
        !selectedJournalSection
        ||
        selectedJournalSection ===
        "overview"
    ) {

        return;

    }


    setValue(
        "entrySection",
        selectedJournalSection
    );


    setText(
        "entryModalTitle",
        `Add ${getSingularEntryName(selectedJournalSection)}`
    );


    renderEntryFields(
        selectedJournalSection
    );


    const modal =
        document.getElementById(
            "entryModal"
        );


    if (
        modal
    ) {

        modal.hidden =
            false;

    }

}


/* =========================================================
   CLOSE ENTRY
   ========================================================= */

function closeEntryModal() {

    const modal =
        document.getElementById(
            "entryModal"
        );


    if (
        modal
    ) {

        modal.hidden =
            true;

    }

}


/* =========================================================
   DYNAMIC ENTRY FIELDS
   ========================================================= */

function renderEntryFields(
    section
) {

    const container =
        document.getElementById(
            "entryDynamicFields"
        );


    if (
        !container
    ) {

        return;

    }


    const commonDate = `

        <div class="entry-field">

            <label>
                Date
            </label>

            <input
                id="entryDate"
                type="date"
                value="${todayISO()}"
            >

        </div>

    `;


    if (
        section ===
        "notes"
        ||
        section ===
        "thoughts"
    ) {

        container.innerHTML = `

            <div class="entry-field full">

                <label>
                    Heading
                </label>

                <input
                    id="entryTitle"
                    type="text"
                    placeholder="${
                        section === "notes"
                        ?
                        "Chapter notes"
                        :
                        "Something I'm thinking about"
                    }"
                >

            </div>


            <div class="entry-field">

                <label>
                    Page
                </label>

                <input
                    id="entryPage"
                    type="number"
                    min="0"
                >

            </div>


            <div class="entry-field">

                <label>
                    Chapter
                </label>

                <input
                    id="entryChapter"
                    type="text"
                >

            </div>


            <div class="entry-field full">

                <label>
                    ${
                        section === "notes"
                        ?
                        "Note"
                        :
                        "Thought"
                    }
                </label>

                <textarea
                    id="entryBody"
                    rows="7"
                ></textarea>

            </div>


            <div class="entry-field full">

                <label>
                    Tags
                </label>

                <input
                    id="entryTags"
                    type="text"
                    placeholder="#character #faith #chapter3"
                >

            </div>

            ${commonDate}

        `;

        return;

    }


    if (
        section ===
        "words"
    ) {

        container.innerHTML = `

            <div class="entry-field full">

                <label>
                    Word
                </label>

                <input
                    id="entryWord"
                    type="text"
                    required
                >

            </div>


            <div class="entry-field">

                <label>
                    Page
                </label>

                <input
                    id="entryPage"
                    type="number"
                >

            </div>


            ${commonDate}


            <div class="entry-field full">

                <label>
                    Definition
                </label>

                <textarea
                    id="entryDefinition"
                    rows="4"
                ></textarea>

            </div>


            <div class="entry-field full">

                <label>
                    Context in book
                </label>

                <textarea
                    id="entryContext"
                    rows="3"
                ></textarea>

            </div>


            <div class="entry-field full">

                <label>
                    My sentence
                </label>

                <textarea
                    id="entrySentence"
                    rows="3"
                ></textarea>

            </div>

        `;

        return;

    }


    if (
        section ===
        "quotes"
    ) {

        container.innerHTML = `

            <div class="entry-field full">

                <label>
                    Quote
                </label>

                <textarea
                    id="entryQuote"
                    rows="6"
                    required
                ></textarea>

            </div>


            <div class="entry-field">

                <label>
                    Page
                </label>

                <input
                    id="entryPage"
                    type="number"
                >

            </div>


            <div class="entry-field">

                <label>
                    Chapter
                </label>

                <input
                    id="entryChapter"
                    type="text"
                >

            </div>


            <div class="entry-field full">

                <label>
                    Why did I save this?
                </label>

                <textarea
                    id="entryReason"
                    rows="4"
                ></textarea>

            </div>


            ${commonDate}

        `;

        return;

    }


    if (
        section ===
        "characters"
    ) {

        container.innerHTML = `

            <div class="entry-field full">

                <label>
                    Character name
                </label>

                <input
                    id="entryName"
                    type="text"
                    required
                >

            </div>


            <div class="entry-field full">

                <label>
                    Role / relationship
                </label>

                <input
                    id="entryRole"
                    type="text"
                >

            </div>


            <div class="entry-field">

                <label>
                    First appearance
                </label>

                <input
                    id="entryPage"
                    type="number"
                >

            </div>


            ${commonDate}


            <div class="entry-field full">

                <label>
                    Notes
                </label>

                <textarea
                    id="entryNotes"
                    rows="6"
                ></textarea>

            </div>

        `;

        return;

    }


    if (
        section ===
        "themes"
    ) {

        container.innerHTML = `

            <div class="entry-field full">

                <label>
                    Theme
                </label>

                <input
                    id="entryTheme"
                    type="text"
                    required
                >

            </div>


            <div class="entry-field full">

                <label>
                    Notes
                </label>

                <textarea
                    id="entryNotes"
                    rows="7"
                ></textarea>

            </div>


            ${commonDate}

        `;

        return;

    }


    if (
        section ===
        "questions"
    ) {

        container.innerHTML = `

            <div class="entry-field full">

                <label>
                    Question
                </label>

                <textarea
                    id="entryQuestion"
                    rows="4"
                    required
                ></textarea>

            </div>


            <div class="entry-field">

                <label>
                    Status
                </label>

                <select id="entryStatus">

                    <option value="unanswered">
                        Unanswered
                    </option>

                    <option value="answered">
                        Answered
                    </option>

                    <option value="research-later">
                        Research Later
                    </option>

                </select>

            </div>


            ${commonDate}


            <div class="entry-field full">

                <label>
                    Answer / thoughts
                </label>

                <textarea
                    id="entryAnswer"
                    rows="5"
                ></textarea>

            </div>

        `;

        return;

    }


    if (
        section ===
        "review"
    ) {

        container.innerHTML = `

            <div class="entry-field full">

                <label>
                    Review title
                </label>

                <input
                    id="entryTitle"
                    type="text"
                    placeholder="What I thought"
                >

            </div>


            <div class="entry-field">

                <label>
                    Rating
                </label>

                <select id="entryRating">

                    <option value="1">1 / 5</option>
                    <option value="2">2 / 5</option>
                    <option value="3">3 / 5</option>
                    <option value="4">4 / 5</option>
                    <option value="5">5 / 5</option>

                </select>

            </div>


            ${commonDate}


            <div class="entry-field full">

                <label>
                    Review
                </label>

                <textarea
                    id="entryReview"
                    rows="7"
                ></textarea>

            </div>


            <div class="entry-field full">

                <label>
                    What I learned
                </label>

                <textarea
                    id="entryLearned"
                    rows="4"
                ></textarea>

            </div>


            <div class="entry-field full">

                <label>
                    What stayed with me
                </label>

                <textarea
                    id="entryStayed"
                    rows="4"
                ></textarea>

            </div>

        `;

    }

}


/* =========================================================
   SAVE JOURNAL ENTRY
   ========================================================= */

function saveJournalEntry(
    event
) {

    event.preventDefault();


    const book =
        getBookById(
            selectedBookId
        );


    const section =
        getValue(
            "entrySection"
        );


    if (
        !book ||
        !section
    ) {

        return;

    }


    const entry =
        buildEntryFromForm(
            section
        );


    book.journal[
        section
    ]
        .push(
            entry
        );


    book.updated_at =
        new Date()
            .toISOString();


    saveBooks();

    closeEntryModal();

    renderJournalEntries();

}


/* =========================================================
   BUILD JOURNAL ENTRY
   ========================================================= */

function buildEntryFromForm(
    section
) {

    const base = {

        id:
            generateId(),

        date:
            getValue(
                "entryDate"
            )
            ||
            todayISO(),

        created_at:
            new Date()
                .toISOString()

    };


    if (
        section ===
        "notes"
        ||
        section ===
        "thoughts"
    ) {

        return {

            ...base,

            title:
                getValue(
                    "entryTitle"
                ),

            page:
                getValue(
                    "entryPage"
                ),

            chapter:
                getValue(
                    "entryChapter"
                ),

            body:
                getValue(
                    "entryBody"
                ),

            tags:
                getValue(
                    "entryTags"
                )

        };

    }


    if (
        section ===
        "words"
    ) {

        return {

            ...base,

            word:
                getValue(
                    "entryWord"
                ),

            page:
                getValue(
                    "entryPage"
                ),

            definition:
                getValue(
                    "entryDefinition"
                ),

            context:
                getValue(
                    "entryContext"
                ),

            sentence:
                getValue(
                    "entrySentence"
                )

        };

    }


    if (
        section ===
        "quotes"
    ) {

        return {

            ...base,

            quote:
                getValue(
                    "entryQuote"
                ),

            page:
                getValue(
                    "entryPage"
                ),

            chapter:
                getValue(
                    "entryChapter"
                ),

            reason:
                getValue(
                    "entryReason"
                )

        };

    }


    if (
        section ===
        "characters"
    ) {

        return {

            ...base,

            name:
                getValue(
                    "entryName"
                ),

            role:
                getValue(
                    "entryRole"
                ),

            page:
                getValue(
                    "entryPage"
                ),

            notes:
                getValue(
                    "entryNotes"
                )

        };

    }


    if (
        section ===
        "themes"
    ) {

        return {

            ...base,

            theme:
                getValue(
                    "entryTheme"
                ),

            notes:
                getValue(
                    "entryNotes"
                )

        };

    }


    if (
        section ===
        "questions"
    ) {

        return {

            ...base,

            question:
                getValue(
                    "entryQuestion"
                ),

            status:
                getValue(
                    "entryStatus"
                ),

            answer:
                getValue(
                    "entryAnswer"
                )

        };

    }


    if (
        section ===
        "review"
    ) {

        return {

            ...base,

            title:
                getValue(
                    "entryTitle"
                ),

            rating:
                getValue(
                    "entryRating"
                ),

            review:
                getValue(
                    "entryReview"
                ),

            learned:
                getValue(
                    "entryLearned"
                ),

            stayed:
                getValue(
                    "entryStayed"
                )

        };

    }


    return base;

}


/* =========================================================
   SECTION ENTRY NAME
   ========================================================= */

function getSingularEntryName(
    section
) {

    const labels = {

        notes:
            "note",

        thoughts:
            "thought",

        words:
            "word",

        quotes:
            "quote",

        characters:
            "character",

        themes:
            "theme",

        questions:
            "question",

        review:
            "review"

    };


    return labels[
        section
    ]
    ||
    "entry";

}


/* =========================================================
   BOOK ORNAMENT
   ========================================================= */

function getBookOrnament(
    style
) {

    const ornaments = {

        classic:
            "◇",

        floral:
            "❀",

        botanical:
            "❧",

        celestial:
            "✦",

        pastel:
            "♡",

        gothic:
            "◆",

        minimal:
            "·"

    };


    return ornaments[
        style
    ]
    ||
    "◇";

}


/* =========================================================
   STATUS LABEL
   ========================================================= */

function getStatusLabel(
    status
) {

    const labels = {

        want:
            "♡ want to read",

        reading:
            "currently reading",

        paused:
            "paused for now",

        finished:
            "finished",

        dnf:
            "did not finish",

        reference:
            "kept for reference"

    };


    return labels[
        status
    ]
    ||
    status;

}


/* =========================================================
   NORMALIZE STATUS
   ========================================================= */

function normalizeBookStatus(
    value
) {

    const valid = [

        "want",
        "reading",
        "paused",
        "finished",
        "dnf",
        "reference"

    ];


    return valid.includes(
        value
    )
        ?
        value
        :
        "want";

}


/* =========================================================
   PROGRESS
   ========================================================= */

function getProgressPercent(
    book
) {

    if (
        !book.pages
    ) {

        return 0;

    }


    return Math.min(
        100,
        Math.max(
            0,
            Math.round(
                (
                    book.current_page /
                    book.pages
                )
                *
                100
            )
        )
    );

}


/* =========================================================
   SAVE STORAGE
   ========================================================= */

function saveShelves() {

    localStorage.setItem(
        SHELF_STORAGE_KEY,
        JSON.stringify(
            shelves
        )
    );

}


function saveBooks() {

    localStorage.setItem(
        BOOK_STORAGE_KEY,
        JSON.stringify(
            books
        )
    );

}


/* =========================================================
   LOOKUPS
   ========================================================= */

function getShelfById(
    id
) {

    return shelves.find(
        shelf =>
            String(
                shelf.id
            )
            ===
            String(
                id
            )
    )
    ||
    null;

}


function getBookById(
    id
) {

    return books.find(
        book =>
            String(
                book.id
            )
            ===
            String(
                id
            )
    )
    ||
    null;

}


/* =========================================================
   DATE
   ========================================================= */

function todayISO() {

    const date =
        new Date();


    return [

        date.getFullYear(),

        String(
            date.getMonth() + 1
        )
            .padStart(
                2,
                "0"
            ),

        String(
            date.getDate()
        )
            .padStart(
                2,
                "0"
            )

    ]
        .join("-");

}


function formatDate(
    value
) {

    if (
        !value
    ) {

        return "—";

    }


    return new Date(
        `${value}T12:00:00`
    )
        .toLocaleDateString(
            "en-US",
            {
                month:
                    "short",

                day:
                    "numeric",

                year:
                    "numeric"
            }
        );

}


/* =========================================================
   NUMBER
   ========================================================= */

function normalizeNumber(
    value
) {

    const number =
        Number(
            value
        );


    if (
        Number.isNaN(
            number
        )
    ) {

        return 0;

    }


    return Math.max(
        0,
        Math.round(
            number
        )
    );

}


/* =========================================================
   GENERATE ID
   ========================================================= */

function generateId() {

    if (
        window.crypto &&
        typeof window.crypto.randomUUID ===
        "function"
    ) {

        return window.crypto.randomUUID();

    }


    return (
        Date.now()
        +
        "-"
        +
        Math.random()
            .toString(16)
            .slice(2)
    );

}


/* =========================================================
   FORM HELPERS
   ========================================================= */

function getValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (
        !element
    ) {

        return "";

    }


    return String(
        element.value ??
        ""
    )
        .trim();

}


function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.value =
            value ??
            "";

    }

}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.textContent =
            value ??
            "";

    }

}


/* =========================================================
   SAFE IMAGE URL
   ========================================================= */

function safeStyleURL(
    value
) {

    return String(
        value ||
        ""
    )
        .replace(
            /"/g,
            "%22"
        )
        .replace(
            /\n/g,
            ""
        );

}


/* =========================================================
   ESCAPE
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ??
        ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
