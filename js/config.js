/* =========================================================
   SHELFMARK
   CONFIG.JS
   ========================================================= */

window.SHELFMARK_CONFIG = {

    productName: "Shelfmark",

    tagline: "my little library",

    environment: "Portfolio Demo",

    defaultTheme: "haunted",


    /* =====================================================
       STORAGE
       ===================================================== */

    storageKeys: {

        shelves:
            "shelfmark_shelves",

        books:
            "shelfmark_books",

        settings:
            "shelfmark_settings"

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
                "candlelight · rain · old wood",

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
                "VHS · monsters · strange broadcasts",

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
                "friendly spirits · dusty pink · sage",

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

    decorations: {

        plant: {
            id:
                "plant",

            label:
                "Plant",

            category:
                "nature"
        },

        candle: {
            id:
                "candle",

            label:
                "Candle",

            category:
                "objects"
        },

        flowers: {
            id:
                "flowers",

            label:
                "Flowers",

            category:
                "nature"
        },

        stars: {
            id:
                "stars",

            label:
                "Stars",

            category:
                "magic"
        },

        mug: {
            id:
                "mug",

            label:
                "Tea Mug",

            category:
                "objects"
        },

        cat: {
            id:
                "cat",

            label:
                "Cat",

            category:
                "creatures"
        },

        ghost: {
            id:
                "ghost",

            label:
                "Ghost",

            category:
                "creatures"
        },

        bat: {
            id:
                "bat",

            label:
                "Bat",

            category:
                "creatures"
        },

        goblin: {
            id:
                "goblin",

            label:
                "Goblin",

            category:
                "creatures"
        },

        moss: {
            id:
                "moss",

            label:
                "Moss",

            category:
                "nature"
        },

        mushroom: {
            id:
                "mushroom",

            label:
                "Mushroom",

            category:
                "nature"
        },

        potion: {
            id:
                "potion",

            label:
                "Potion Bottle",

            category:
                "magic"
        },

        crystal: {
            id:
                "crystal",

            label:
                "Crystal",

            category:
                "magic"
        },

        raven: {
            id:
                "raven",

            label:
                "Raven",

            category:
                "creatures"
        },

        pumpkin: {
            id:
                "pumpkin",

            label:
                "Pumpkin",

            category:
                "objects"
        }

    },


    /* =====================================================
       SPINE DESIGNS
       ===================================================== */

    spineStyles: [

        {
            id:
                "classic",

            name:
                "Classic Cloth",

            defaultOrnament:
                "diamond",

            defaultFont:
                "serif"
        },

        {
            id:
                "gothic",

            name:
                "Ornate Gothic",

            defaultOrnament:
                "diamond",

            defaultFont:
                "roman"
        },

        {
            id:
                "botanical",

            name:
                "Botanical",

            defaultOrnament:
                "leaf",

            defaultFont:
                "serif"
        },

        {
            id:
                "celestial",

            name:
                "Celestial",

            defaultOrnament:
                "moon",

            defaultFont:
                "serif"
        },

        {
            id:
                "floral",

            name:
                "Vintage Floral",

            defaultOrnament:
                "flower",

            defaultFont:
                "storybook"
        },

        {
            id:
                "pastel",

            name:
                "Pastel",

            defaultOrnament:
                "heart",

            defaultFont:
                "storybook"
        },

        {
            id:
                "minimal",

            name:
                "Minimal",

            defaultOrnament:
                "none",

            defaultFont:
                "clean"
        },

        {
            id:
                "leather",

            name:
                "Leatherbound",

            defaultOrnament:
                "diamond",

            defaultFont:
                "roman"
        },

        {
            id:
                "academia",

            name:
                "Dark Academia",

            defaultOrnament:
                "star",

            defaultFont:
                "roman"
        },

        {
            id:
                "storybook",

            name:
                "Storybook",

            defaultOrnament:
                "star",

            defaultFont:
                "storybook"
        }

    ],


    /* =====================================================
       SPINE FONTS
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
                "Old Roman"
        },

        {
            id:
                "typewriter",

            name:
                "Typewriter"
        },

        {
            id:
                "storybook",

            name:
                "Storybook"
        },

        {
            id:
                "clean",

            name:
                "Clean"
        }

    ],


    /* =====================================================
       SPINE ORNAMENTS
       ===================================================== */

    spineOrnaments: {

        auto: {
            id:
                "auto",

            label:
                "Match the design",

            symbol:
                ""
        },

        star: {
            id:
                "star",

            label:
                "Star",

            symbol:
                "✦"
        },

        moon: {
            id:
                "moon",

            label:
                "Moon",

            symbol:
                "☾"
        },

        flower: {
            id:
                "flower",

            label:
                "Flower",

            symbol:
                "✿"
        },

        leaf: {
            id:
                "leaf",

            label:
                "Leaf",

            symbol:
                "❧"
        },

        diamond: {
            id:
                "diamond",

            label:
                "Diamond",

            symbol:
                "◇"
        },

        heart: {
            id:
                "heart",

            label:
                "Heart",

            symbol:
                "♡"
        },

        none: {
            id:
                "none",

            label:
                "No ornament",

            symbol:
                ""
        }

    },


    /* =====================================================
       DEFAULT USER SETTINGS
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
            "cozy"

    },


    /* =====================================================
       DEFAULT BOOK DESIGN
       ===================================================== */

    defaultBookDesign: {

        style:
            "classic",

        spineColor:
            "#6c2633",

        textColor:
            "#eadfca",

        accentColor:
            "#b28a4a",

        spineFont:
            "serif",

        ornament:
            "auto",

        height:
            "medium",

        thickness:
            "medium"

    },


    /* =====================================================
       DECORATION PLACEMENT
       ===================================================== */

    decorationDefaults: {

        x:
            50,

        y:
            72,

        scale:
            1,

        rotate:
            0

    }

};


/* =========================================================
   EMPTY STARTER DATA
   ========================================================= */

window.SHELFMARK_DATA = {

    shelves: [],

    books: []

};
