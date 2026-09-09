/* =========================================================
   NOVELLOW
   CONFIG.JS

   Central application configuration.
   No DOM manipulation belongs in this file.
   ========================================================= */


window.NOVELLOW_CONFIG = {


    /* =====================================================
       APPLICATION
       ===================================================== */

    product: {

        name:
            "Novellow",

        tagline:
            "a library of your own",

        description:
            "A personal virtual library, reading tracker, and literary journal.",

        version:
            "1.0.0",

        environment:
            "local"

    },


    /* =====================================================
       STORAGE

       Novellow uses its own storage keys going forward.

       The legacy Shelfmark keys are also listed so helpers.js
       can migrate old saved libraries if they still exist
       in the browser.
       ===================================================== */

    storageKeys: {

        shelves:
            "novellow_shelves",

        books:
            "novellow_books",

        settings:
            "novellow_settings",

        quotes:
            "novellow_quotes",

        vocabulary:
            "novellow_vocabulary"

    },


    legacyStorageKeys: {

        shelves:
            "shelfmark_shelves",

        books:
            "shelfmark_books",

        settings:
            "shelfmark_settings"

    },


    /* =====================================================
       DEFAULT APPLICATION SETTINGS
       ===================================================== */

    defaultSettings: {

        theme:
            "haunted",

        candleGlow:
            true,

        dust:
            true,

        rain:
            true,

        oddities:
            true,

        reducedMotion:
            false,

        decorationDensity:
            "cozy",

        defaultShelfSort:
            "manual",

        annualReadingGoal:
            20

    },


    /* =====================================================
       THEMES
       ===================================================== */

    themes: [

        {
            id:
                "haunted",

            name:
                "Haunted Library",

            description:
                "candlelight · rain · old books",

            className:
                "theme-haunted",

            defaultDecorations: [
                "cat",
                "ghost",
                "bat",
                "raven",
                "candle",
                "potion",
                "crystal"
            ]
        },

        {
            id:
                "autumn",

            name:
                "Autumn Bookshop",

            description:
                "pumpkins · tea · warm evenings",

            className:
                "theme-autumn",

            defaultDecorations: [
                "cat",
                "pumpkin",
                "mug",
                "mushroom",
                "flowers",
                "candle",
                "plant"
            ]
        },

        {
            id:
                "forest",

            name:
                "Enchanted Forest",

            description:
                "moss · moonlight · strange little things",

            className:
                "theme-forest",

            defaultDecorations: [
                "goblin",
                "moss",
                "mushroom",
                "plant",
                "crystal",
                "stars",
                "potion"
            ]
        },

        {
            id:
                "retro",

            name:
                "Retro Horror",

            description:
                "VHS · monsters · late-night broadcasts",

            className:
                "theme-retro",

            defaultDecorations: [
                "bat",
                "ghost",
                "cat",
                "stars",
                "potion"
            ]
        },

        {
            id:
                "ghosts",

            name:
                "Pastel Ghosts",

            description:
                "dusty pink · sage · friendly spirits",

            className:
                "theme-ghosts",

            defaultDecorations: [
                "ghost",
                "cat",
                "flowers",
                "mushroom",
                "mug",
                "stars",
                "plant"
            ]
        }

    ],


    /* =====================================================
       DECORATION DENSITY
       ===================================================== */

    decorationDensity: [

        {
            id:
                "minimal",

            name:
                "Tidy",

            description:
                "Calm and uncluttered.",

            ambientCount:
                1
        },

        {
            id:
                "cozy",

            name:
                "Cozy",

            description:
                "A few extra little things.",

            ambientCount:
                3
        },

        {
            id:
                "maximal",

            name:
                "Curio Cabinet",

            description:
                "Weird, collected, wonderfully busy.",

            ambientCount:
                6
        }

    ],


    /* =====================================================
       SHELF DECORATIONS
       ===================================================== */

    decorations: [

        {
            id:
                "cat",

            label:
                "Cat",

            category:
                "creature"
        },

        {
            id:
                "ghost",

            label:
                "Ghost",

            category:
                "creature"
        },

        {
            id:
                "bat",

            label:
                "Bat",

            category:
                "creature"
        },

        {
            id:
                "raven",

            label:
                "Raven",

            category:
                "creature"
        },

        {
            id:
                "goblin",

            label:
                "Goblin",

            category:
                "creature"
        },

        {
            id:
                "mushroom",

            label:
                "Mushroom",

            category:
                "nature"
        },

        {
            id:
                "plant",

            label:
                "Plant",

            category:
                "nature"
        },

        {
            id:
                "flowers",

            label:
                "Flowers",

            category:
                "nature"
        },

        {
            id:
                "moss",

            label:
                "Moss",

            category:
                "nature"
        },

        {
            id:
                "pumpkin",

            label:
                "Pumpkin",

            category:
                "object"
        },

        {
            id:
                "candle",

            label:
                "Candle",

            category:
                "object"
        },

        {
            id:
                "mug",

            label:
                "Mug",

            category:
                "object"
        },

        {
            id:
                "potion",

            label:
                "Potion",

            category:
                "object"
        },

        {
            id:
                "crystal",

            label:
                "Crystal",

            category:
                "object"
        },

        {
            id:
                "stars",

            label:
                "Stars",

            category:
                "ambient"
        }

    ],


    /* =====================================================
       SHELF MATERIALS
       ===================================================== */

    shelfMaterials: [

        {
            id:
                "walnut",

            name:
                "Walnut"
        },

        {
            id:
                "honey",

            name:
                "Honey Oak"
        },

        {
            id:
                "cream",

            name:
                "Antique Cream"
        },

        {
            id:
                "sage",

            name:
                "Sage"
        },

        {
            id:
                "rose",

            name:
                "Dusty Rose"
        }

    ],


    /* =====================================================
       SHELF MOODS
       ===================================================== */

    shelfMoods: [

        {
            id:
                "cozy",

            name:
                "Cozy"
        },

        {
            id:
                "gothic",

            name:
                "Gothic"
        },

        {
            id:
                "botanical",

            name:
                "Botanical"
        },

        {
            id:
                "celestial",

            name:
                "Celestial"
        },

        {
            id:
                "cottage",

            name:
                "Cottage"
        },

        {
            id:
                "simple",

            name:
                "Simple"
        }

    ],


    /* =====================================================
       SHELF LAYOUTS
       ===================================================== */

    shelfLayouts: [

        {
            id:
                "mixed",

            name:
                "Mixed"
        },

        {
            id:
                "upright",

            name:
                "Upright"
        },

        {
            id:
                "stacked",

            name:
                "Stacked"
        }

    ],


    /* =====================================================
       SHELF SORTING
       ===================================================== */

    shelfSortOptions: [

        {
            id:
                "manual",

            name:
                "Manual"
        },

        {
            id:
                "title",

            name:
                "Title"
        },

        {
            id:
                "author",

            name:
                "Author"
        },

        {
            id:
                "rating",

            name:
                "Rating"
        },

        {
            id:
                "finished",

            name:
                "Finished Date"
        },

        {
            id:
                "recent",

            name:
                "Recently Added"
        }

    ],


    /* =====================================================
       BOOK STATUSES
       ===================================================== */

    bookStatuses: [

        {
            id:
                "want",

            name:
                "Want to Read"
        },

        {
            id:
                "reading",

            name:
                "Currently Reading"
        },

        {
            id:
                "paused",

            name:
                "Paused"
        },

        {
            id:
                "finished",

            name:
                "Finished"
        },

        {
            id:
                "dnf",

            name:
                "Did Not Finish"
        },

        {
            id:
                "reference",

            name:
                "Reference"
        }

    ],


    /* =====================================================
       BOOK RATINGS
       ===================================================== */

    ratings: [

        {
            value:
                0,

            label:
                "Not Rated"
        },

        {
            value:
                1,

            label:
                "★"
        },

        {
            value:
                2,

            label:
                "★★"
        },

        {
            value:
                3,

            label:
                "★★★"
        },

        {
            value:
                4,

            label:
                "★★★★"
        },

        {
            value:
                5,

            label:
                "★★★★★"
        }

    ],


    /* =====================================================
       BOOK SPINE STYLES
       ===================================================== */

    bookStyles: [

        {
            id:
                "classic",

            name:
                "Classic Cloth",

            defaultOrnament:
                "diamond"
        },

        {
            id:
                "gothic",

            name:
                "Gothic",

            defaultOrnament:
                "moon"
        },

        {
            id:
                "botanical",

            name:
                "Botanical",

            defaultOrnament:
                "leaf"
        },

        {
            id:
                "celestial",

            name:
                "Celestial",

            defaultOrnament:
                "star"
        },

        {
            id:
                "floral",

            name:
                "Floral",

            defaultOrnament:
                "flower"
        },

        {
            id:
                "pastel",

            name:
                "Pastel",

            defaultOrnament:
                "heart"
        },

        {
            id:
                "minimal",

            name:
                "Minimal",

            defaultOrnament:
                "none"
        },

        {
            id:
                "leather",

            name:
                "Leather",

            defaultOrnament:
                "diamond"
        },

        {
            id:
                "academia",

            name:
                "Dark Academia",

            defaultOrnament:
                "star"
        },

        {
            id:
                "storybook",

            name:
                "Storybook",

            defaultOrnament:
                "leaf"
        }

    ],


    /* =====================================================
       SPINE ORNAMENTS
       ===================================================== */

    ornaments: [

        {
            id:
                "auto",

            name:
                "Auto",

            symbol:
                ""
        },

        {
            id:
                "star",

            name:
                "Star",

            symbol:
                "✦"
        },

        {
            id:
                "moon",

            name:
                "Moon",

            symbol:
                "☾"
        },

        {
            id:
                "flower",

            name:
                "Flower",

            symbol:
                "❀"
        },

        {
            id:
                "leaf",

            name:
                "Leaf",

            symbol:
                "❦"
        },

        {
            id:
                "diamond",

            name:
                "Diamond",

            symbol:
                "◆"
        },

        {
            id:
                "heart",

            name:
                "Heart",

            symbol:
                "♥"
        },

        {
            id:
                "none",

            name:
                "None",

            symbol:
                ""
        }

    ],


    /* =====================================================
       SPINE FONTS

       These map to CSS classes rather than external font
       downloads. books.css will define each visual family.
       ===================================================== */

    spineFonts: [

        {
            id:
                "serif",

            name:
                "Classic Serif"
        },

        {
            id:
                "roman",

            name:
                "Roman"
        },

        {
            id:
                "bookish",

            name:
                "Bookish"
        },

        {
            id:
                "elegant",

            name:
                "Elegant"
        },

        {
            id:
                "typewriter",

            name:
                "Typewriter"
        },

        {
            id:
                "clean",

            name:
                "Clean"
        },

        {
            id:
                "condensed",

            name:
                "Condensed"
        },

        {
            id:
                "heavy",

            name:
                "Heavy"
        },

        {
            id:
                "storybook",

            name:
                "Storybook"
        },

        {
            id:
                "handwritten",

            name:
                "Handwritten"
        },

        {
            id:
                "gothic",

            name:
                "Gothic"
        },

        {
            id:
                "deco",

            name:
                "Art Deco"
        },

        {
            id:
                "retro",

            name:
                "Retro"
        }

    ],


    /* =====================================================
       FONT SIZES
       ===================================================== */

    spineFontSizes: [

        {
            id:
                "small",

            name:
                "Small"
        },

        {
            id:
                "medium",

            name:
                "Medium"
        },

        {
            id:
                "large",

            name:
                "Large"
        },

        {
            id:
                "xlarge",

            name:
                "Extra Large"
        }

    ],


    /* =====================================================
       FONT WEIGHTS
       ===================================================== */

    spineFontWeights: [

        {
            id:
                "light",

            name:
                "Light"
        },

        {
            id:
                "regular",

            name:
                "Regular"
        },

        {
            id:
                "bold",

            name:
                "Bold"
        },

        {
            id:
                "heavy",

            name:
                "Heavy"
        }

    ],


    /* =====================================================
       LETTER SPACING
       ===================================================== */

    spineLetterSpacing: [

        {
            id:
                "tight",

            name:
                "Tight"
        },

        {
            id:
                "normal",

            name:
                "Normal"
        },

        {
            id:
                "wide",

            name:
                "Wide"
        },

        {
            id:
                "extra-wide",

            name:
                "Extra Wide"
        }

    ],


    /* =====================================================
       TEXT CASE
       ===================================================== */

    spineTextCases: [

        {
            id:
                "typed",

            name:
                "As Typed"
        },

        {
            id:
                "uppercase",

            name:
                "Uppercase"
        },

        {
            id:
                "lowercase",

            name:
                "Lowercase"
        }

    ],


    /* =====================================================
       FONT STYLE
       ===================================================== */

    spineFontStyles: [

        {
            id:
                "normal",

            name:
                "Normal"
        },

        {
            id:
                "italic",

            name:
                "Italic"
        }

    ],


    /* =====================================================
       TITLE ALIGNMENT
       ===================================================== */

    spineTextAlignment: [

        {
            id:
                "top",

            name:
                "Top"
        },

        {
            id:
                "center",

            name:
                "Center"
        },

        {
            id:
                "bottom",

            name:
                "Bottom"
        }

    ],


    /* =====================================================
       TITLE PANELS
       ===================================================== */

    spineTitlePanels: [

        {
            id:
                "none",

            name:
                "None"
        },

        {
            id:
                "simple",

            name:
                "Simple"
        },

        {
            id:
                "bordered",

            name:
                "Bordered"
        },

        {
            id:
                "ornate",

            name:
                "Ornate"
        },

        {
            id:
                "dark",

            name:
                "Dark"
        },

        {
            id:
                "light",

            name:
                "Light"
        }

    ],


    /* =====================================================
       BOOK HEIGHT
       ===================================================== */

    bookHeights: [

        {
            id:
                "small",

            name:
                "Small"
        },

        {
            id:
                "medium",

            name:
                "Medium"
        },

        {
            id:
                "tall",

            name:
                "Tall"
        }

    ],


    /* =====================================================
       BOOK THICKNESS
       ===================================================== */

    bookThicknesses: [

        {
            id:
                "slim",

            name:
                "Slim"
        },

        {
            id:
                "medium",

            name:
                "Medium"
        },

        {
            id:
                "chunky",

            name:
                "Chunky"
        }

    ],


    /* =====================================================
       DEFAULT BOOK DESIGN
       ===================================================== */

    defaultBookDesign: {

        style:
            "classic",

        spineColor:
            "#793f55",

        textColor:
            "#f1e3cf",

        accentColor:
            "#c39a67",

        ornament:
            "auto",

        spineFont:
            "serif",

        fontSize:
            "medium",

        fontWeight:
            "regular",

        letterSpacing:
            "normal",

        textCase:
            "typed",

        fontStyle:
            "normal",

        textAlign:
            "center",

        titlePanel:
            "none",

        height:
            "medium",

        thickness:
            "medium"

    },


    /* =====================================================
       DEFAULT SHELF
       ===================================================== */

    defaultShelf: {

        name:
            "My Bookshelf",

        description:
            "",

        material:
            "walnut",

        mood:
            "cozy",

        layout:
            "mixed",

        sort:
            "manual",

        decorations:
            []

    },


    /* =====================================================
       JOURNAL SECTIONS
       ===================================================== */

    journalSections: [

        {
            id:
                "overview",

            number:
                "01",

            label:
                "Overview",

            title:
                "About this book"
        },

        {
            id:
                "notes",

            number:
                "02",

            label:
                "Notes",

            title:
                "Things worth remembering"
        },

        {
            id:
                "thoughts",

            number:
                "03",

            label:
                "Thoughts",

            title:
                "What this book made me think about"
        },

        {
            id:
                "characters",

            number:
                "04",

            label:
                "Characters",

            title:
                "People inside the story"
        },

        {
            id:
                "themes",

            number:
                "05",

            label:
                "Themes",

            title:
                "Ideas running underneath"
        },

        {
            id:
                "questions",

            number:
                "06",

            label:
                "Questions",

            title:
                "Things I am still wondering"
        },

        {
            id:
                "review",

            number:
                "07",

            label:
                "Review",

            title:
                "What I thought in the end"
        }

    ],


    /* =====================================================
       JOURNAL DEFAULT STRUCTURE
       ===================================================== */

    defaultJournal: {

        overview:
            [],

        notes:
            [],

        thoughts:
            [],

        characters:
            [],

        themes:
            [],

        questions:
            [],

        review:
            []

    },


    /* =====================================================
       QUOTE DEFAULT
       ===================================================== */

    defaultQuote: {

        bookId:
            "",

        text:
            "",

        page:
            "",

        chapter:
            "",

        thoughts:
            "",

        createdAt:
            ""

    },


    /* =====================================================
       VOCABULARY DEFAULT
       ===================================================== */

    defaultWord: {

        word:
            "",

        definition:
            "",

        bookId:
            "",

        page:
            "",

        partOfSpeech:
            "",

        context:
            "",

        createdAt:
            ""

    },


    /* =====================================================
       LIMITS

       These are UI safeguards, not database limits.
       ===================================================== */

    limits: {

        shelfNameLength:
            80,

        shelfDescriptionLength:
            300,

        bookTitleLength:
            200,

        bookAuthorLength:
            160,

        genreLength:
            100,

        seriesLength:
            160,

        journalTitleLength:
            160,

        quoteLength:
            5000,

        wordLength:
            100,

        definitionLength:
            2500,

        notesLength:
            10000

    }

};


/* =========================================================
   SHORT GLOBAL ALIAS

   Each JavaScript module can use:

   const CONFIG = window.NOVELLOW_CONFIG;

   ========================================================= */

window.NOVELLOW =
    window.NOVELLOW ||
    {};


window.NOVELLOW.config =
    window.NOVELLOW_CONFIG;


/* =========================================================
   LEGACY COMPATIBILITY

   Temporary alias for recovered Shelfmark functions while
   Novellow is being rebuilt module-by-module.

   We will eventually no longer need this, but keeping it
   prevents older recovered functions from immediately
   breaking if they reference SHELFMARK_CONFIG.
   ========================================================= */

window.SHELFMARK_CONFIG =
    window.NOVELLOW_CONFIG;
