/* =========================================================
   NOVELLOW
   APP.JS

   Application startup
   Global state
   Navigation
   Theme/settings controller
   Drawer + overlay management
   Persistence coordination
   Import/export
   ========================================================= */


(() => {

    "use strict";


    /* =====================================================
       CONFIG / HELPERS
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


    /* =====================================================
       GLOBAL STATE
       ===================================================== */

    Novellow.state =
        Novellow.state ||
        H.createEmptyState?.() ||
        {

            shelves: [],
            books: [],
            quotes: [],
            vocabulary: [],

            settings: {
                theme: "haunted",
                candleGlow: true,
                dust: true,
                rain: true,
                oddities: true,
                reducedMotion: false,
                decorationDensity: "cozy",
                defaultShelfSort: "manual",
                annualReadingGoal: 20
            },

            selectedBookId: null,
            selectedJournalSection: null,
            currentSection: "library",
            pendingCoverData: ""

        };


    const state =
        Novellow.state;


    /* =====================================================
       STORAGE KEYS
       ===================================================== */

    const STORAGE =
        CONFIG.storageKeys ||
        {};


    /* =====================================================
       STARTUP
       ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );


    function initialize() {

        hideInitialTransientUI();

        migrateLegacyData();

        loadState();

        applySettings();

        bindNavigation();

        bindGlobalActions();

        bindThemeControls();

        bindSettingsControls();

        bindImportExport();

        initializeFeatureModules();

        renderEverything();

        restoreCurrentSection();

        finishLoading();

    }


    /* =====================================================
       INITIAL UI SAFETY
       ===================================================== */

    function hideInitialTransientUI() {

        [
            "overlay",
            "themeDrawer",
            "settingsDrawer",
            "shelfDrawer",
            "bookDrawer",
            "bookReveal",
            "progressModal",
            "journalEntryModal",
            "quoteModal",
            "wordModal"
        ].forEach(
            id => H.hide?.(id)
        );


        document.body.classList.remove(
            "modal-open"
        );

    }


    /* =====================================================
       LEGACY MIGRATION
       ===================================================== */

    function migrateLegacyData() {

        const migrated =
            H.migrateLegacyStorage?.();


        if (migrated) {

            console.info(
                "Novellow migrated existing Shelfmark data."
            );

        }

    }


    /* =====================================================
       LOAD STATE
       ===================================================== */

    function loadState() {

        const rawShelves =
            H.readStorage?.(
                STORAGE.shelves,
                []
            ) || [];


        const rawBooks =
            H.readStorage?.(
                STORAGE.books,
                []
            ) || [];


        const rawQuotes =
            H.readStorage?.(
                STORAGE.quotes,
                []
            ) || [];


        const rawVocabulary =
            H.readStorage?.(
                STORAGE.vocabulary,
                []
            ) || [];


        const rawSettings =
            H.readStorage?.(
                STORAGE.settings,
                {}
            ) || {};


        state.shelves =
            H.normalizeCollection?.(
                rawShelves,
                H.normalizeShelf
            ) || [];


        state.books =
            H.normalizeCollection?.(
                rawBooks,
                H.normalizeBook
            ) || [];


        state.quotes =
            H.normalizeCollection?.(
                rawQuotes,
                H.normalizeQuote
            ) || [];


        state.vocabulary =
            H.normalizeCollection?.(
                rawVocabulary,
                H.normalizeWord
            ) || [];


        state.settings =
            H.normalizeSettings?.(
                rawSettings
            ) || {
                ...CONFIG.defaultSettings
            };


        persistAll();

    }


    /* =====================================================
       PERSISTENCE
       ===================================================== */

    function saveShelves() {

        H.writeStorage?.(
            STORAGE.shelves,
            state.shelves
        );

    }


    function saveBooks() {

        H.writeStorage?.(
            STORAGE.books,
            state.books
        );

    }


    function saveQuotes() {

        H.writeStorage?.(
            STORAGE.quotes,
            state.quotes
        );

    }


    function saveVocabulary() {

        H.writeStorage?.(
            STORAGE.vocabulary,
            state.vocabulary
        );

    }


    function saveSettings() {

        H.writeStorage?.(
            STORAGE.settings,
            state.settings
        );

    }


    function persistAll() {

        saveShelves();
        saveBooks();
        saveQuotes();
        saveVocabulary();
        saveSettings();

    }


    Novellow.storage = {
        saveShelves,
        saveBooks,
        saveQuotes,
        saveVocabulary,
        saveSettings,
        persistAll
    };


    /* =====================================================
       NAVIGATION
       ===================================================== */

    function bindNavigation() {

        H.queryAll?.(
            "[data-section]"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const section =
                            button.dataset.section;


                        navigateTo(
                            section
                        );

                    }
                );

            }
        );

    }


    function navigateTo(sectionId) {

        const target =
            H.getById?.(
                sectionId
            );


        if (!target) {
            return;
        }


        const sections =
            H.queryAll?.(
                "[data-app-section]"
            ) || [];


        sections.forEach(
            section => {

                const isTarget =
                    section.dataset.appSection ===
                    sectionId;


                section.hidden =
                    !isTarget;


                section.classList.toggle(
                    "active-section",
                    isTarget
                );

            }
        );


        const navButtons =
            H.queryAll?.(
                "[data-section]"
            ) || [];


        navButtons.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.section ===
                    sectionId
                );

            }
        );


        state.currentSection =
            sectionId;


        updateHash(
            sectionId
        );


        window.scrollTo({
            top: 0,
            behavior:
                state.settings.reducedMotion
                    ? "auto"
                    : "smooth"
        });


        triggerSectionRender(
            sectionId
        );

    }


    function triggerSectionRender(
        sectionId
    ) {

        switch (sectionId) {

            case "library":

                Novellow.library?.render?.();

                break;


            case "reading":

                Novellow.reading?.render?.();

                break;


            case "journal":

                Novellow.journal?.render?.();

                break;


            case "quotes":

                Novellow.quotes?.render?.();

                break;


            case "vocabulary":

                Novellow.vocabulary?.render?.();

                break;


            case "stats":

                Novellow.stats?.render?.();

                break;

        }

    }


    function restoreCurrentSection() {

        const hash =
            window.location.hash
                .replace(
                    "#",
                    ""
                )
                .trim();


        const validSections = [
            "library",
            "reading",
            "journal",
            "quotes",
            "vocabulary",
            "stats"
        ];


        const target =
            validSections.includes(hash)
                ? hash
                : state.currentSection ||
                  "library";


        navigateTo(
            target
        );

    }


    function updateHash(sectionId) {

        try {

            history.replaceState(
                null,
                "",
                `#${sectionId}`
            );

        } catch (error) {

            // Safe fallback.
            window.location.hash =
                sectionId;

        }

    }


    Novellow.navigation = {
        navigateTo
    };


    /* =====================================================
       GLOBAL ACTIONS
       ===================================================== */

    function bindGlobalActions() {

        [
            "headerAddBook",
            "libraryAddBook",
            "emptyAddBook",
            "readingAddBook",
            "mobileAddBook"
        ].forEach(
            id => {

                H.bindClick?.(
                    id,
                    () =>
                        Novellow.books?.openAddDrawer?.()
                );

            }
        );


        [
            "addShelfButton",
            "emptyAddShelf"
        ].forEach(
            id => {

                H.bindClick?.(
                    id,
                    () =>
                        Novellow.library?.openAddShelfDrawer?.()
                );

            }
        );


        H.bindClick?.(
            "openThemeDrawer",
            openThemeDrawer
        );


        H.bindClick?.(
            "openSettingsDrawer",
            openSettingsDrawer
        );


        H.bindClick?.(
            "closeThemeDrawer",
            closeAllPanels
        );


        H.bindClick?.(
            "themeDoneButton",
            closeAllPanels
        );


        H.bindClick?.(
            "closeSettingsDrawer",
            closeAllPanels
        );


        H.bindClick?.(
            "settingsDoneButton",
            closeAllPanels
        );


        H.bindClick?.(
            "overlay",
            closeAllPanels
        );


        document.addEventListener(
            "keydown",
            handleGlobalKeydown
        );

    }


    function handleGlobalKeydown(event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeAllPanels();

            Novellow.books?.closeReveal?.();

            Novellow.books?.closeProgressModal?.();

            Novellow.journal?.closeEntryModal?.();

            Novellow.quotes?.closeModal?.();

            Novellow.vocabulary?.closeModal?.();

        }

    }


    /* =====================================================
       DRAWER / OVERLAY CONTROLLER
       ===================================================== */

    function openPanel(
        panelId
    ) {

        closeAllPanels();

        const panel =
            H.getById?.(
                panelId
            );


        const overlay =
            H.getById?.(
                "overlay"
            );


        if (!panel) {
            return;
        }


        if (overlay) {

            overlay.hidden =
                false;

            overlay.style.pointerEvents =
                "auto";

        }


        panel.hidden =
            false;


        panel.style.pointerEvents =
            "auto";


        document.body.classList.add(
            "modal-open"
        );

    }


    function closeAllPanels() {

        [
            "themeDrawer",
            "settingsDrawer",
            "shelfDrawer",
            "bookDrawer"
        ].forEach(
            id => {

                const element =
                    H.getById?.(
                        id
                    );


                if (!element) {
                    return;
                }


                element.hidden =
                    true;

                element.style.pointerEvents =
                    "none";

            }
        );


        const overlay =
            H.getById?.(
                "overlay"
            );


        if (overlay) {

            overlay.hidden =
                true;

            overlay.style.pointerEvents =
                "none";

        }


        document.body.classList.remove(
            "modal-open"
        );

    }


    function openThemeDrawer() {

        syncThemeControls();

        openPanel(
            "themeDrawer"
        );

    }


    function openSettingsDrawer() {

        syncSettingsControls();

        openPanel(
            "settingsDrawer"
        );

    }


    Novellow.panels = {
        openPanel,
        closeAllPanels,
        openThemeDrawer,
        openSettingsDrawer
    };


    /* =====================================================
       THEME CONTROLS
       ===================================================== */

    function bindThemeControls() {

        const themeCards =
            H.queryAll?.(
                ".theme-card[data-theme]"
            ) || [];


        themeCards.forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        setTheme(
                            card.dataset.theme
                        );

                    }
                );

            }
        );


        bindSettingCheckbox(
            "settingCandleGlow",
            "candleGlow"
        );


        bindSettingCheckbox(
            "settingDust",
            "dust"
        );


        bindSettingCheckbox(
            "settingRain",
            "rain"
        );


        bindSettingCheckbox(
            "settingOddities",
            "oddities"
        );


        bindSettingCheckbox(
            "settingReducedMotion",
            "reducedMotion"
        );


        const densityRadios =
            H.queryAll?.(
                'input[name="decorationDensity"]'
            ) || [];


        densityRadios.forEach(
            radio => {

                radio.addEventListener(
                    "change",
                    () => {

                        if (
                            !radio.checked
                        ) {
                            return;
                        }


                        state.settings
                            .decorationDensity =
                            radio.value;


                        saveSettings();

                        applySettings();

                        Novellow.library?.render?.();

                    }
                );

            }
        );

    }


    function bindSettingCheckbox(
        id,
        settingName
    ) {

        const input =
            H.getById?.(
                id
            );


        if (!input) {
            return;
        }


        input.addEventListener(
            "change",
            () => {

                state.settings[
                    settingName
                ] =
                    Boolean(
                        input.checked
                    );


                saveSettings();

                applySettings();

                if (
                    settingName ===
                    "oddities"
                ) {

                    Novellow.library?.render?.();

                }

            }
        );

    }


    function setTheme(
        themeId
    ) {

        const themeExists =
            (
                CONFIG.themes ||
                []
            ).some(
                theme =>
                    theme.id ===
                    themeId
            );


        if (!themeExists) {
            return;
        }


        state.settings.theme =
            themeId;


        saveSettings();

        applySettings();

        syncThemeControls();

        Novellow.library?.render?.();

    }


    function applySettings() {

        const body =
            document.body;


        const settings =
            state.settings;


        const theme =
            settings.theme ||
            CONFIG.defaultSettings?.theme ||
            "haunted";


        (
            CONFIG.themes ||
            []
        ).forEach(
            item => {

                body.classList.remove(
                    item.className
                );

            }
        );


        body.classList.add(
            `theme-${theme}`
        );


        body.dataset.theme =
            theme;


        body.classList.toggle(
            "candle-glow",
            Boolean(
                settings.candleGlow
            )
        );


        body.classList.toggle(
            "floating-dust",
            Boolean(
                settings.dust
            )
        );


        body.classList.toggle(
            "rain-enabled",
            Boolean(
                settings.rain
            )
        );


        body.classList.toggle(
            "ambient-oddities",
            Boolean(
                settings.oddities
            )
        );


        body.classList.toggle(
            "reduce-motion",
            Boolean(
                settings.reducedMotion
            )
        );


        body.dataset
            .decorationDensity =
            settings.decorationDensity ||
            "cozy";


        syncThemeControls();

        syncSettingsControls();

    }


    function syncThemeControls() {

        const settings =
            state.settings;


        const themeCards =
            H.queryAll?.(
                ".theme-card[data-theme]"
            ) || [];


        themeCards.forEach(
            card => {

                card.classList.toggle(
                    "active",
                    card.dataset.theme ===
                    settings.theme
                );

            }
        );


        setChecked(
            "settingCandleGlow",
            settings.candleGlow
        );


        setChecked(
            "settingDust",
            settings.dust
        );


        setChecked(
            "settingRain",
            settings.rain
        );


        setChecked(
            "settingOddities",
            settings.oddities
        );


        setChecked(
            "settingReducedMotion",
            settings.reducedMotion
        );


        const densityRadios =
            H.queryAll?.(
                'input[name="decorationDensity"]'
            ) || [];


        densityRadios.forEach(
            radio => {

                radio.checked =
                    radio.value ===
                    settings.decorationDensity;

            }
        );

    }


    /* =====================================================
       SETTINGS CONTROLS
       ===================================================== */

    function bindSettingsControls() {

        const sort =
            H.getById?.(
                "defaultShelfSort"
            );


        if (sort) {

            sort.addEventListener(
                "change",
                () => {

                    state.settings
                        .defaultShelfSort =
                        sort.value;


                    saveSettings();

                }
            );

        }


        const goal =
            H.getById?.(
                "annualReadingGoal"
            );


        if (goal) {

            goal.addEventListener(
                "change",
                () => {

                    const value =
                        Math.max(
                            1,
                            H.toNumber?.(
                                goal.value,
                                20
                            ) || 20
                        );


                    state.settings
                        .annualReadingGoal =
                        value;


                    goal.value =
                        value;


                    saveSettings();

                    Novellow.stats?.render?.();

                }
            );

        }


        H.bindClick?.(
            "clearLibraryButton",
            clearEntireLibrary
        );

    }


    function syncSettingsControls() {

        const settings =
            state.settings;


        const sort =
            H.getById?.(
                "defaultShelfSort"
            );


        if (sort) {

            sort.value =
                settings.defaultShelfSort ||
                "manual";

        }


        const goal =
            H.getById?.(
                "annualReadingGoal"
            );


        if (goal) {

            goal.value =
                Math.max(
                    1,
                    H.toNumber?.(
                        settings.annualReadingGoal,
                        20
                    ) || 20
                );

        }

    }


    function setChecked(
        id,
        value
    ) {

        const input =
            H.getById?.(
                id
            );


        if (!input) {
            return;
        }


        input.checked =
            Boolean(value);

    }


    /* =====================================================
       IMPORT / EXPORT
       ===================================================== */

    function bindImportExport() {

        H.bindClick?.(
            "exportLibraryButton",
            exportLibrary
        );


        H.bindClick?.(
            "importLibraryButton",
            () => {

                const input =
                    H.getById?.(
                        "importLibraryInput"
                    );


                input?.click();

            }
        );


        const input =
            H.getById?.(
                "importLibraryInput"
            );


        if (input) {

            input.addEventListener(
                "change",
                handleImportFile
            );

        }

    }


    function exportLibrary() {

        const backup = {

            product:
                "Novellow",

            version:
                CONFIG.product?.version ||
                "1.0.0",

            exportedAt:
                H.nowISO?.() ||
                new Date()
                    .toISOString(),

            shelves:
                state.shelves,

            books:
                state.books,

            quotes:
                state.quotes,

            vocabulary:
                state.vocabulary,

            settings:
                state.settings

        };


        const date =
            H.todayISO?.() ||
            "backup";


        H.downloadJSON?.(
            backup,
            `novellow-backup-${date}.json`
        );


        H.showToast?.(
            "Your Novellow library has been exported.",
            "success"
        );

    }


    async function handleImportFile(
        event
    ) {

        const file =
            event.target.files?.[0];


        if (!file) {
            return;
        }


        try {

            const data =
                await H.readJSONFile?.(
                    file
                );


            importBackupData(
                data
            );


            H.showToast?.(
                "Your Novellow library was imported.",
                "success"
            );

        } catch (error) {

            console.error(
                error
            );


            H.showToast?.(
                error.message ||
                "Novellow could not import that file.",
                "error"
            );

        } finally {

            event.target.value =
                "";

        }

    }


    function importBackupData(
        data
    ) {

        if (
            !data ||
            typeof data !==
            "object"
        ) {

            throw new Error(
                "That backup file is not valid."
            );

        }


        const confirmed =
            H.confirmAction?.(
                "Importing this backup will replace the library currently saved in this browser. Continue?"
            );


        if (!confirmed) {
            return;
        }


        state.shelves =
            H.normalizeCollection?.(
                data.shelves || [],
                H.normalizeShelf
            ) || [];


        state.books =
            H.normalizeCollection?.(
                data.books || [],
                H.normalizeBook
            ) || [];


        state.quotes =
            H.normalizeCollection?.(
                data.quotes || [],
                H.normalizeQuote
            ) || [];


        state.vocabulary =
            H.normalizeCollection?.(
                data.vocabulary || [],
                H.normalizeWord
            ) || [];


        state.settings =
            H.normalizeSettings?.(
                data.settings || {}
            ) || {
                ...CONFIG.defaultSettings
            };


        persistAll();

        applySettings();

        renderEverything();

        closeAllPanels();

    }


    /* =====================================================
       CLEAR ENTIRE LIBRARY
       ===================================================== */

    function clearEntireLibrary() {

        const confirmed =
            H.confirmAction?.(
                "Clear your entire Novellow library? This removes all locally saved shelves, books, journal entries, quotes, vocabulary, and settings from this browser."
            );


        if (!confirmed) {
            return;
        }


        state.shelves =
            [];

        state.books =
            [];

        state.quotes =
            [];

        state.vocabulary =
            [];

        state.settings =
            H.normalizeSettings?.(
                {}
            ) || {
                ...CONFIG.defaultSettings
            };

        state.selectedBookId =
            null;

        state.selectedJournalSection =
            null;

        state.pendingCoverData =
            "";


        persistAll();

        applySettings();

        renderEverything();

        closeAllPanels();


        H.showToast?.(
            "Your local Novellow library has been cleared.",
            "success"
        );

    }


    /* =====================================================
       FEATURE MODULE INITIALIZATION
       ===================================================== */

    function initializeFeatureModules() {

        const modules = [
            "books",
            "library",
            "reading",
            "journal",
            "quotes",
            "vocabulary",
            "stats"
        ];


        modules.forEach(
            moduleName => {

                const module =
                    Novellow[
                        moduleName
                    ];


                if (
                    typeof module?.init ===
                    "function"
                ) {

                    try {

                        module.init();

                    } catch (error) {

                        console.error(
                            `Novellow ${moduleName}.init() failed.`,
                            error
                        );

                    }

                }

            }
        );

    }


    /* =====================================================
       RENDER EVERYTHING
       ===================================================== */

    function renderEverything() {

        [
            "library",
            "reading",
            "journal",
            "quotes",
            "vocabulary",
            "stats"
        ].forEach(
            moduleName => {

                const module =
                    Novellow[
                        moduleName
                    ];


                if (
                    typeof module?.render ===
                    "function"
                ) {

                    try {

                        module.render();

                    } catch (error) {

                        console.error(
                            `Novellow ${moduleName}.render() failed.`,
                            error
                        );

                    }

                }

            }
        );

    }


    Novellow.renderEverything =
        renderEverything;


    /* =====================================================
       LOADING SCREEN
       ===================================================== */

    function finishLoading() {

        const loadingScreen =
            H.getById?.(
                "loadingScreen"
            );


        if (!loadingScreen) {
            return;
        }


        requestAnimationFrame(
            () => {

                loadingScreen.classList.add(
                    "is-hidden"
                );


                setTimeout(
                    () => {

                        loadingScreen.hidden =
                            true;

                    },
                    380
                );

            }
        );

    }


    /* =====================================================
       PUBLIC APP API
       ===================================================== */

    Novellow.app = {

        initialize,

        navigateTo,

        applySettings,

        setTheme,

        openPanel,

        closeAllPanels,

        renderEverything,

        exportLibrary,

        importBackupData,

        clearEntireLibrary

    };


})();
