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
            description: "candlelight · rain · old wood"
        },

        {
            id: "autumn",
            name: "Autumn Bookshop",
            description: "pumpkins · tea · warm evenings"
        },

        {
            id: "forest",
            name: "Enchanted Forest",
            description: "moss · moonlight · strange little things"
        },

        {
            id: "retro",
            name: "Retro Horror",
            description: "VHS · monsters · strange broadcasts"
        },

        {
            id: "ghosts",
            name: "Pastel Ghosts",
            description: "friendly spirits · dusty pink · sage"
        }

    ],


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

    }

};


/* =========================================================
   STARTER DATA

   Keep these empty for now.

   Later, when we are ready to make the public portfolio demo,
   we can add a fictional sample library here.
   ========================================================= */

window.SHELFMARK_DATA = {

    shelves: [],

    books: []

};
