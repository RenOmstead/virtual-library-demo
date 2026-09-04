/* =========================================================
   SHELFMARK
   APP CONFIGURATION
   ========================================================= */

window.SHELFMARK_CONFIG = {

    productName: "Shelfmark",

    tagline: "my little library",

    environment: "Portfolio Demo",

    defaultTheme: "haunted",


    /* =====================================================
       STORAGE KEYS
       ===================================================== */

    storageKeys: {

        shelves: "shelfmark_shelves",

        books: "shelfmark_books",

        settings: "shelfmark_settings"

    },


    /* =====================================================
       AVAILABLE THEMES
       ===================================================== */

    themes: [

        {
            id: "haunted",

            name: "Haunted Library",

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
            id: "autumn",

            name: "Autumn Bookshop",

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
            id: "forest",

            name: "Enchanted Forest",

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
            id: "retro",

            name: "Retro Horror",

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
            id: "ghosts",

            name: "Pastel Ghosts",

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
       DECORATION LIBRARY
       ===================================================== */

    decorations: {

        plant: {
            id: "plant",
            label: "Plant",
            category: "nature"
        },

        candle: {
            id: "candle",
            label: "Candle",
            category: "objects"
        },

        flowers: {
            id: "flowers",
            label: "Flowers",
            category: "nature"
        },

        stars: {
            id: "stars",
            label: "Stars",
            category: "magic"
        },

        mug: {
            id: "mug",
            label: "Tea Mug",
            category: "objects"
        },

        cat: {
            id: "cat",
            label: "Cat",
            category: "creatures"
        },

        ghost: {
            id: "ghost",
            label: "Ghost",
            category: "creatures"
        },

        bat: {
            id: "bat",
            label: "Bat",
            category: "creatures"
        },

        goblin: {
            id: "goblin",
            label: "Goblin",
            category: "creatures"
        },

        moss: {
            id: "moss",
            label: "Moss",
            category: "nature"
        },

        mushroom: {
            id: "mushroom",
            label: "Mushroom",
            category: "nature"
        },

        potion: {
            id: "potion",
            label: "Potion Bottle",
            category: "magic"
        },

        crystal: {
            id: "crystal",
            label: "Crystal",
            category: "magic"
        },

        raven: {
            id: "raven",
            label: "Raven",
            category: "creatures"
        },

        pumpkin: {
            id: "pumpkin",
            label: "Pumpkin",
            category: "objects"
        }

    },


    /* =====================================================
       DEFAULT USER SETTINGS
       ===================================================== */

    defaultSettings: {

        theme: "haunted",

        candleGlow: true,

        dust: true,

        rain: true,

        oddities: true,

        reducedMotion: false,

        decorationDensity: "cozy"

    },


    /* =====================================================
       DECORATION PLACEMENT DEFAULTS

       These values will be used by library.js when we make
       shelf decorations draggable.

       x and y are percentages inside the shelf.
       scale controls size.
       rotate controls angle.
       ===================================================== */

    decorationDefaults: {

        x: 50,

        y: 72,

        scale: 1,

        rotate: 0

    }

};


/* =========================================================
   STARTER DATA

   Keep empty while building.
   ========================================================= */

window.SHELFMARK_DATA = {

    shelves: [],

    books: []

};
