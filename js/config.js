/* =========================================================
   NOVELLOW
   CONFIG
========================================================== */

const AppConfig = {

    appName: "Novellow",

    version: "1.0.0",

    defaultTheme: "theme-cozy",

    defaultPage: "library",

    animationSpeed: 250,

    maxShelves: 100,

    maxBooksPerShelf: 500

};



const StorageKeys = {

    SETTINGS: "novellow-settings",

    LIBRARY: "novellow-library",

    BOOKS: "novellow-books",

    SHELVES: "novellow-shelves",

    THEMES: "novellow-themes"

};



const DefaultLibrary = {

    shelves: [

        {

            id: crypto.randomUUID(),

            name: "Classics",

            description: "Timeless literature",

            books: []

        },

        {

            id: crypto.randomUUID(),

            name: "Fantasy",

            description: "Magic and adventure",

            books: []

        },

        {

            id: crypto.randomUUID(),

            name: "Want To Read",

            description: "Future adventures",

            books: []

        }

    ]

};



const ThemeList = [

    "theme-cozy",

    "theme-haunted",

    "theme-cottage",

    "theme-autumn",

    "theme-celestial",

    "theme-rain",

    "theme-christmas"

];
