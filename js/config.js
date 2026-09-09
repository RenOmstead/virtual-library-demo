/* =========================================================
   SHELFMARK
   CONFIG.JS
   v6
   ========================================================= */

window.SHELFMARK_CONFIG = {

    /* =====================================================
       PRODUCT
       ===================================================== */

    productName: "Shelfmark",

    tagline: "my little library",

    environment: "local",

    defaultTheme: "haunted",


    /* =====================================================
       STORAGE
       ===================================================== */

    storageKeys: {

        shelves: "shelfmark_shelves",

        books: "shelfmark_books",

        settings: "shelfmark_settings"

    },


    /* =====================================================
       THEMES
       ===================================================== */

    themes: [

        {
            id: "haunted",

            name: "Haunted Library",

            description: "candlelight · rain · old wood",

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
            id: "autumn",

            name: "Autumn Bookshop",

            description: "pumpkins · tea · warm evenings",

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
            id: "forest",

            name: "Enchanted Forest",

            description: "moss · moonlight · strange little things",

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
            id: "retro",

            name: "Retro Horror",

            description: "VHS · monsters · strange broadcasts",

            defaultDecorations: [
                "bat",
                "ghost",
                "cat",
                "stars",
                "potion"
            ]
        },

        {
            id: "ghosts",

            name: "Pastel Ghosts",

            description: "friendly spirits · dusty pink · sage",

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
       DECORATIONS
       ===================================================== */

    decorations: [

        {
            id: "cat",
            label: "Little Cat",
            category: "creature"
        },

        {
            id: "ghost",
            label: "Friendly Ghost",
            category: "creature"
        },

        {
            id: "bat",
            label: "Tiny Bat",
            category: "creature"
        },

        {
            id: "goblin",
            label: "Shelf Goblin",
            category: "creature"
        },

        {
            id: "raven",
            label: "Raven",
            category: "creature"
        },

        {
            id: "moss",
            label: "Moss",
            category: "nature"
        },

        {
            id: "mushroom",
            label: "Mushroom",
            category: "nature"
        },

        {
            id: "plant",
            label: "House Plant",
            category: "nature"
        },

        {
            id: "flowers",
            label: "Flowers",
            category: "nature"
        },

        {
            id: "pumpkin",
            label: "Pumpkin",
            category: "object"
        },

        {
            id: "potion",
            label: "Potion Bottle",
            category: "object"
        },

        {
            id: "crystal",
            label: "Crystal",
            category: "object"
        },

        {
            id: "candle",
            label: "Candle",
            category: "object"
        },

        {
            id: "mug",
            label: "Tea Mug",
            category: "object"
        },

        {
            id: "stars",
            label: "Little Stars",
            category: "magic"
        }

    ],


    /* =====================================================
       DEFAULT DECORATION POSITION
       ===================================================== */

    decorationDefaults: {

        x: 50,

        y: 72,

        scale: 1,

        rotate: 0

    },


    /* =====================================================
       DECORATION DENSITY

       Controls automatic ambient room details only.

       It must NEVER hide or remove decorations that the
       user placed on an individual shelf.
       ===================================================== */

    decorationDensity: {

        minimal: {

            label: "Tidy",

            ambientLevel: 0

        },

        cozy: {

            label: "Cozy",

            ambientLevel: 1

        },

        maximal: {

            label: "Curio Cabinet",

            ambientLevel: 2

        }

    },


    /* =====================================================
       SPINE STYLES
       ===================================================== */

    spineStyles: [

        {
            id: "classic",

            label: "Classic Cloth",

            defaultOrnament: "diamond",

            defaultFont: "serif"
        },

        {
            id: "gothic",

            label: "Ornate Gothic",

            defaultOrnament: "diamond",

            defaultFont: "gothic"
        },

        {
            id: "botanical",

            label: "Botanical",

            defaultOrnament: "leaf",

            defaultFont: "bookish"
        },

        {
            id: "celestial",

            label: "Celestial",

            defaultOrnament: "moon",

            defaultFont: "elegant"
        },

        {
            id: "floral",

            label: "Vintage Floral",

            defaultOrnament: "flower",

            defaultFont: "storybook"
        },

        {
            id: "pastel",

            label: "Pastel",

            defaultOrnament: "heart",

            defaultFont: "handwritten"
        },

        {
            id: "minimal",

            label: "Minimal",

            defaultOrnament: "none",

            defaultFont: "clean"
        },

        {
            id: "leather",

            label: "Leatherbound",

            defaultOrnament: "diamond",

            defaultFont: "roman"
        },

        {
            id: "academia",

            label: "Dark Academia",

            defaultOrnament: "star",

            defaultFont: "bookish"
        },

        {
            id: "storybook",

            label: "Storybook",

            defaultOrnament: "star",

            defaultFont: "storybook"
        }

    ],


    /* =====================================================
       SPINE FONTS
       ===================================================== */

    spineFonts: [

        {
            id: "serif",
            label: "Classic Serif"
        },

        {
            id: "roman",
            label: "Old Roman"
        },

        {
            id: "bookish",
            label: "Bookish Serif"
        },

        {
            id: "elegant",
            label: "Elegant Serif"
        },

        {
            id: "typewriter",
            label: "Typewriter"
        },

        {
            id: "clean",
            label: "Clean Sans"
        },

        {
            id: "condensed",
            label: "Condensed Sans"
        },

        {
            id: "heavy",
            label: "Heavy Sans"
        },

        {
            id: "storybook",
            label: "Storybook"
        },

        {
            id: "handwritten",
            label: "Handwritten"
        },

        {
            id: "gothic",
            label: "Gothic Display"
        },

        {
            id: "deco",
            label: "Art Deco"
        },

        {
            id: "retro",
            label: "Retro Horror"
        }

    ],


    /* =====================================================
       FONT SIZE
       ===================================================== */

    spineFontSizes: [

        {
            id: "small",
            label: "Small"
        },

        {
            id: "medium",
            label: "Medium"
        },

        {
            id: "large",
            label: "Large"
        },

        {
            id: "xlarge",
            label: "Extra Large"
        }

    ],


    /* =====================================================
       FONT WEIGHT
       ===================================================== */

    spineFontWeights: [

        {
            id: "light",
            label: "Light"
        },

        {
            id: "regular",
            label: "Regular"
        },

        {
            id: "bold",
            label: "Bold"
        },

        {
            id: "heavy",
            label: "Heavy"
        }

    ],


    /* =====================================================
       LETTER SPACING
       ===================================================== */

    spineLetterSpacing: [

        {
            id: "tight",
            label: "Tight"
        },

        {
            id: "normal",
            label: "Normal"
        },

        {
            id: "wide",
            label: "Wide"
        },

        {
            id: "extra-wide",
            label: "Extra Wide"
        }

    ],


    /* =====================================================
       TEXT CASE
       ===================================================== */

    spineCases: [

        {
            id: "typed",
            label: "As Typed"
        },

        {
            id: "uppercase",
            label: "UPPERCASE"
        },

        {
            id: "lowercase",
            label: "lowercase"
        }

    ],


    /* =====================================================
       FONT STYLE
       ===================================================== */

    spineFontStyles: [

        {
            id: "normal",
            label: "Normal"
        },

        {
            id: "italic",
            label: "Italic"
        }

    ],


    /* =====================================================
       TITLE PLACEMENT
       ===================================================== */

    spineTextAlignments: [

        {
            id: "top",
            label: "Toward Top"
        },

        {
            id: "center",
            label: "Center"
        },

        {
            id: "bottom",
            label: "Toward Bottom"
        }

    ],


    /* =====================================================
       TITLE PANELS
       ===================================================== */

    spineTitlePanels: [

        {
            id: "none",
            label: "No Panel"
        },

        {
            id: "simple",
            label: "Simple Label"
        },

        {
            id: "bordered",
            label: "Bordered Label"
        },

        {
            id: "ornate",
            label: "Ornate Label"
        },

        {
            id: "dark",
            label: "Dark Inset Label"
        },

        {
            id: "light",
            label: "Light Paper Label"
        }

    ],


    /* =====================================================
       SPINE ORNAMENTS
       ===================================================== */

    spineOrnaments: {

        auto: {

            label: "Match the Design",

            symbol: ""

        },

        star: {

            label: "Star",

            symbol: "✦"

        },

        moon: {

            label: "Moon",

            symbol: "☾"

        },

        flower: {

            label: "Flower",

            symbol: "✿"

        },

        leaf: {

            label: "Leaf",

            symbol: "❧"

        },

        diamond: {

            label: "Diamond",

            symbol: "◇"

        },

        heart: {

            label: "Heart",

            symbol: "♡"

        },

        none: {

            label: "No Ornament",

            symbol: ""

        }

    },


    /* =====================================================
       BOOK HEIGHTS
       ===================================================== */

    bookHeights: {

        small: {

            label: "Small",

            pixels: 138

        },

        medium: {

            label: "Medium",

            pixels: 168

        },

        tall: {

            label: "Tall",

            pixels: 198

        }

    },


    /* =====================================================
       BOOK THICKNESS
       ===================================================== */

    bookThicknesses: {

        slim: {

            label: "Slim",

            pixels: 38

        },

        medium: {

            label: "Medium",

            pixels: 55

        },

        chunky: {

            label: "Chunky",

            pixels: 74

        }

    },


    /* =====================================================
       READING STATUSES
       ===================================================== */

    readingStatuses: {

        want: {
            label: "Want to Read"
        },

        reading: {
            label: "Currently Reading"
        },

        paused: {
            label: "Paused"
        },

        finished: {
            label: "Finished"
        },

        dnf: {
            label: "Did Not Finish"
        },

        reference: {
            label: "Reference"
        }

    },


    /* =====================================================
       JOURNAL SECTIONS
       ===================================================== */

    journalSections: {

        overview: {

            label: "OVERVIEW",

            title: "A little about this book"

        },

        notes: {

            label: "NOTES",

            title: "Notes from the margins"

        },

        thoughts: {

            label: "THOUGHTS",

            title: "Things I'm thinking about"

        },

        words: {

            label: "WORD STUDY",

            title: "Little words worth keeping"

        },

        quotes: {

            label: "QUOTES",

            title: "Lines I want to remember"

        },

        characters: {

            label: "CHARACTERS",

            title: "People inside the pages"

        },

        themes: {

            label: "THEMES",

            title: "Ideas running underneath"

        },

        questions: {

            label: "QUESTIONS",

            title: "Things I'm still wondering"

        },

        review: {

            label: "REVIEW",

            title: "What I thought in the end"

        }

    },


    /* =====================================================
       DEFAULT BOOK DESIGN
       ===================================================== */

    defaultBookDesign: {

        style: "classic",

        spineColor: "#6c2633",

        textColor: "#eadfca",

        accentColor: "#b28a4a",

        spineFont: "serif",

        fontSize: "medium",

        fontWeight: "regular",

        letterSpacing: "normal",

        textCase: "typed",

        fontStyle: "normal",

        textAlign: "center",

        titlePanel: "none",

        ornament: "auto",

        height: "medium",

        thickness: "medium"

    },


    /* =====================================================
       DEFAULT SETTINGS
       ===================================================== */

    defaultSettings: {

        theme: "haunted",

        candleGlow: true,

        dust: true,

        rain: true,

        oddities: true,

        reducedMotion: false,

        decorationDensity: "cozy"

    }

};


/* =========================================================
   SHARED DATA PLACEHOLDER

   library.js loads the actual saved data from localStorage.
   This is only a safe initial object.
   ========================================================= */

window.SHELFMARK_DATA = {

    shelves: [],

    books: []

};
