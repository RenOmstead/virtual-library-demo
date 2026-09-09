/* ==========================================================
   NOVELLOW
   APP
========================================================== */

const App = {

    currentPage: AppConfig.defaultPage,

    currentTheme: AppConfig.defaultTheme,

    initialized: false

};



document.addEventListener(

    "DOMContentLoaded",

    initializeApp

);



/* ==========================================================
   INITIALIZE
========================================================== */

function initializeApp(){

    loadSettings();

    cacheElements();

    bindEvents();

    showPage(App.currentPage);

    applyTheme(App.currentTheme);

    closeAllDrawers();

    App.initialized = true;

  /* ==========================================================
   CACHE ELEMENTS
========================================================== */

const UI = {};

function cacheElements(){

    UI.overlay = $("#drawerOverlay");

    UI.sidebar = $("#sidebar");

    UI.header = $("#appHeader");

    UI.main = $("#mainContent");

    UI.pageTitle = $("#pageTitle");

    UI.pageSubtitle = $("#pageSubtitle");

    UI.pages = $$(".page");

    UI.navigation = $$(".nav-item");

    UI.bookDrawer = $("#bookDrawer");

    UI.shelfDrawer = $("#shelfDrawer");

    UI.themeDrawer = $("#themeDrawer");

    UI.settingsDrawer = $("#settingsDrawer");

}

  /* ==========================================================
   EVENTS
========================================================== */

function bindEvents(){

    UI.navigation.forEach(button=>{

        button.addEventListener(

            "click",

            ()=>{

                showPage(

                    button.dataset.page

                );

            }

        );

    });

    $("#themeButton")?.addEventListener(

        "click",

        openThemeDrawer

    );

    $("#themeToggleButton")?.addEventListener(

        "click",

        openThemeDrawer

    );

    $("#addBookBtn")?.addEventListener(

        "click",

        openBookDrawer

    );

    $("#addShelfBtn")?.addEventListener(

        "click",

        openShelfDrawer

    );

    UI.overlay?.addEventListener(

        "click",

        closeAllDrawers

    );

}

  /* ==========================================================
   PAGE NAVIGATION
========================================================== */

function showPage(page){

    App.currentPage = page;

    UI.pages.forEach(section=>{

        section.classList.remove(

            "active-page"

        );

    });

    UI.navigation.forEach(button=>{

        button.classList.remove(

            "active"

        );

    });

    const current = document.getElementById(

        page + "Page"

    );

    if(current){

        current.classList.add(

            "active-page"

        );

    }

    const activeButton = document.querySelector(

        `[data-page="${page}"]`

    );

    if(activeButton){

        activeButton.classList.add(

            "active"

        );

    }

    updateHeader(page);

}

 /* ==========================================================
   HEADER
========================================================== */

function updateHeader(page){

    const titles = {

        library:{

            title:"Library",

            subtitle:"Build the library you've always wanted."

        },

        reading:{

            title:"Reading",

            subtitle:"Track your reading journey."

        },

        journal:{

            title:"Journal",

            subtitle:"Capture your thoughts."

        },

        quotes:{

            title:"Quotes",

            subtitle:"Save memorable passages."

        },

        vocabulary:{

            title:"Vocabulary",

            subtitle:"Grow your personal dictionary."

        },

        statistics:{

            title:"Statistics",

            subtitle:"See your reading habits."

        },

        settings:{

            title:"Settings",

            subtitle:"Customize Novellow."

        }

    };

    UI.pageTitle.textContent =

        titles[page].title;

    UI.pageSubtitle.textContent =

        titles[page].subtitle;

}

  
}
