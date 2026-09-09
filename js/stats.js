/* =========================================================
   NOVELLOW
   STATS.JS

   Reading statistics
   Status totals
   Pages read
   Average rating
   Genre breakdown
   Monthly finishes
   Reading goal
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
       INIT
       ===================================================== */

    function init() {

        render();

    }


    /* =====================================================
       STATE
       ===================================================== */

    function getState() {

        return Novellow.state;

    }


    /* =====================================================
       MAIN RENDER
       ===================================================== */

    function render() {

        const books =
            Array.isArray(
                getState()?.books
            )
                ? getState().books
                : [];


        renderSummary(
            books
        );


        renderStatusCounts(
            books
        );


        renderGenres(
            books
        );


        renderMonthlyStats(
            books
        );


        renderReadingGoal(
            books
        );

    }


    /* =====================================================
       SUMMARY
       ===================================================== */

    function renderSummary(
        books
    ) {

        const finished =
            books.filter(
                book =>
                    book.status ===
                    "finished"
            );


        H.setText?.(
            "statsTotalBooks",
            H.formatNumber?.(
                books.length
            ) ??
            books.length
        );


        H.setText?.(
            "statsFinishedBooks",
            H.formatNumber?.(
                finished.length
            ) ??
            finished.length
        );


        const pagesRead =
            calculatePagesRead(
                books
            );


        H.setText?.(
            "statsPagesRead",
            H.formatNumber?.(
                pagesRead
            ) ??
            pagesRead
        );


        const averageRating =
            calculateAverageRating(
                books
            );


        H.setText?.(
            "statsAverageRating",
            averageRating > 0
                ? averageRating.toFixed(1)
                : "—"
        );

    }


    /* =====================================================
       PAGES READ
       ===================================================== */

    function calculatePagesRead(
        books
    ) {

        return books.reduce(
            (
                total,
                book
            ) => {

                const pages =
                    Math.max(
                        0,
                        Number(
                            book.pages
                        ) || 0
                    );


                const currentPage =
                    Math.max(
                        0,
                        Number(
                            book.currentPage
                        ) || 0
                    );


                const timesRead =
                    Math.max(
                        0,
                        Number(
                            book.timesRead
                        ) || 0
                    );


                /*
                   Finished books count their completed page
                   total for each recorded read.

                   Currently-reading / paused books contribute
                   their current progress.
                */


                if (
                    book.status ===
                    "finished"
                ) {

                    if (
                        pages <= 0
                    ) {

                        return total;

                    }


                    const completedReads =
                        Math.max(
                            1,
                            timesRead
                        );


                    return (
                        total +
                        (
                            pages *
                            completedReads
                        )
                    );

                }


                if (
                    book.status ===
                    "reading" ||
                    book.status ===
                    "paused"
                ) {

                    if (
                        pages > 0
                    ) {

                        return (
                            total +
                            Math.min(
                                currentPage,
                                pages
                            )
                        );

                    }


                    return (
                        total +
                        currentPage
                    );

                }


                return total;

            },
            0
        );

    }


    /* =====================================================
       AVERAGE RATING
       ===================================================== */

    function calculateAverageRating(
        books
    ) {

        const rated =
            books.filter(
                book => {

                    const rating =
                        Number(
                            book.rating
                        ) || 0;


                    return (
                        rating > 0
                    );

                }
            );


        if (
            rated.length === 0
        ) {

            return 0;

        }


        const total =
            rated.reduce(
                (
                    sum,
                    book
                ) => {

                    return (
                        sum +
                        (
                            Number(
                                book.rating
                            ) || 0
                        )
                    );

                },
                0
            );


        return (
            total /
            rated.length
        );

    }


    /* =====================================================
       STATUS COUNTS
       ===================================================== */

    function renderStatusCounts(
        books
    ) {

        const counts = {

            reading:
                countStatus(
                    books,
                    "reading"
                ),

            want:
                countStatus(
                    books,
                    "want"
                ),

            paused:
                countStatus(
                    books,
                    "paused"
                ),

            dnf:
                countStatus(
                    books,
                    "dnf"
                ),

            reference:
                countStatus(
                    books,
                    "reference"
                ),

            rereads:
                calculateRereads(
                    books
                )

        };


        H.setText?.(
            "statsReading",
            counts.reading
        );


        H.setText?.(
            "statsWantToRead",
            counts.want
        );


        H.setText?.(
            "statsPaused",
            counts.paused
        );


        H.setText?.(
            "statsDNF",
            counts.dnf
        );


        H.setText?.(
            "statsReference",
            counts.reference
        );


        H.setText?.(
            "statsRereads",
            counts.rereads
        );

    }


    function countStatus(
        books,
        status
    ) {

        return books.filter(
            book =>
                book.status ===
                status
        ).length;

    }


    /* =====================================================
       REREADS
       ===================================================== */

    function calculateRereads(
        books
    ) {

        return books.reduce(
            (
                total,
                book
            ) => {

                const timesRead =
                    Math.max(
                        0,
                        Number(
                            book.timesRead
                        ) || 0
                    );


                /*
                   First read does not count as a reread.
                   Reading the same book twice = 1 reread.
                */

                return (
                    total +
                    Math.max(
                        0,
                        timesRead -
                        1
                    )
                );

            },
            0
        );

    }


    /* =====================================================
       GENRES
       ===================================================== */

    function renderGenres(
        books
    ) {

        const container =
            H.getById?.(
                "genreStats"
            );


        if (!container) {
            return;
        }


        container.innerHTML =
            "";


        const counts =
            buildGenreCounts(
                books
            );


        if (
            counts.length === 0
        ) {

            container.innerHTML =
                `
                    <div class="stats-empty">
                        Add genres to your books and Novellow
                        will build your genre breakdown here.
                    </div>
                `;


            return;

        }


        const maxCount =
            Math.max(
                ...counts.map(
                    item =>
                        item.count
                )
            );


        counts.forEach(
            item => {

                const percent =
                    maxCount > 0
                        ? Math.round(
                            (
                                item.count /
                                maxCount
                            ) *
                            100
                        )
                        : 0;


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "genre-stat-row";


                row.innerHTML =
                    `
                        <span class="genre-stat-name">
                            ${H.escapeHTML?.(
                                item.genre
                            )}
                        </span>

                        <strong class="genre-stat-count">
                            ${item.count}
                        </strong>

                        <div class="genre-stat-bar">
                            <div
                                class="genre-stat-fill"
                                style="width: ${percent}%"
                            ></div>
                        </div>
                    `;


                container.appendChild(
                    row
                );

            }
        );

    }


    /* =====================================================
       BUILD GENRE COUNTS
       ===================================================== */

    function buildGenreCounts(
        books
    ) {

        const map =
            new Map();


        books.forEach(
            book => {

                const genre =
                    H.cleanString?.(
                        book.genre
                    ) ||
                    "";


                if (!genre) {
                    return;
                }


                /*
                   If a user enters:
                   Fantasy, Gothic

                   each becomes its own genre.
                */

                const genres =
                    genre
                        .split(
                            /[,;/|]+/
                        )
                        .map(
                            item =>
                                item.trim()
                        )
                        .filter(Boolean);


                genres.forEach(
                    item => {

                        const key =
                            item.toLowerCase();


                        const existing =
                            map.get(
                                key
                            );


                        if (existing) {

                            existing.count +=
                                1;

                        } else {

                            map.set(
                                key,
                                {
                                    genre:
                                        item,

                                    count:
                                        1
                                }
                            );

                        }

                    }
                );

            }
        );


        return [
            ...map.values()
        ].sort(
            (a, b) => {

                if (
                    b.count !==
                    a.count
                ) {

                    return (
                        b.count -
                        a.count
                    );

                }


                return a.genre.localeCompare(
                    b.genre
                );

            }
        );

    }


    /* =====================================================
       MONTHLY STATS
       ===================================================== */

    function renderMonthlyStats(
        books
    ) {

        const container =
            H.getById?.(
                "monthlyStats"
            );


        if (!container) {
            return;
        }


        container.innerHTML =
            "";


        const year =
            getStatsYear();


        const months =
            buildMonthlyCounts(
                books,
                year
            );


        const total =
            months.reduce(
                (
                    sum,
                    month
                ) =>
                    sum +
                    month.count,
                0
            );


        if (
            total === 0
        ) {

            container.innerHTML =
                `
                    <div class="stats-empty">
                        Finish books and Novellow will build
                        your monthly reading history here.
                    </div>
                `;


            return;

        }


        const max =
            Math.max(
                ...months.map(
                    month =>
                        month.count
                ),
                1
            );


        months.forEach(
            month => {

                const percent =
                    Math.round(
                        (
                            month.count /
                            max
                        ) *
                        100
                    );


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "month-stat-row";


                row.innerHTML =
                    `
                        <span class="month-stat-label">
                            ${month.short}
                        </span>

                        <div class="month-stat-track">

                            <div
                                class="month-stat-fill"
                                style="width: ${percent}%"
                            ></div>

                        </div>

                        <strong class="month-stat-count">
                            ${month.count}
                        </strong>
                    `;


                container.appendChild(
                    row
                );

            }
        );

    }


    /* =====================================================
       STATS YEAR
       ===================================================== */

    function getStatsYear() {

        return new Date()
            .getFullYear();

    }


    /* =====================================================
       MONTHLY COUNTS
       ===================================================== */

    function buildMonthlyCounts(
        books,
        year
    ) {

        const formatter =
            new Intl.DateTimeFormat(
                undefined,
                {
                    month:
                        "short"
                }
            );


        const months =
            Array.from(
                {
                    length:
                        12
                },
                (
                    _,
                    index
                ) => {

                    const date =
                        new Date(
                            year,
                            index,
                            1
                        );


                    return {
                        index,

                        short:
                            formatter.format(
                                date
                            ),

                        count:
                            0
                    };

                }
            );


        books.forEach(
            book => {

                if (
                    book.status !==
                    "finished" ||
                    !book.finished
                ) {

                    return;

                }


                const date =
                    parseLocalDate(
                        book.finished
                    );


                if (
                    !date ||
                    Number.isNaN(
                        date.getTime()
                    )
                ) {

                    return;

                }


                if (
                    date.getFullYear() !==
                    year
                ) {

                    return;

                }


                const month =
                    months[
                        date.getMonth()
                    ];


                if (month) {

                    month.count +=
                        1;

                }

            }
        );


        return months;

    }


    /* =====================================================
       DATE PARSING
       ===================================================== */

    function parseLocalDate(
        value
    ) {

        if (!value) {
            return null;
        }


        /*
           HTML date inputs use YYYY-MM-DD.

           Creating Date directly from that string can be
           interpreted as UTC, which may shift the day/month
           depending on timezone. Build it locally instead.
        */

        const match =
            String(
                value
            ).match(
                /^(\d{4})-(\d{2})-(\d{2})$/
            );


        if (match) {

            return new Date(
                Number(
                    match[1]
                ),
                Number(
                    match[2]
                ) - 1,
                Number(
                    match[3]
                )
            );

        }


        const fallback =
            new Date(
                value
            );


        return Number.isNaN(
            fallback.getTime()
        )
            ? null
            : fallback;

    }


    /* =====================================================
       READING GOAL
       ===================================================== */

    function renderReadingGoal(
        books
    ) {

        /*
           The current index.html may not contain a dedicated
           goal component yet.

           If one exists, Stats will populate it. Otherwise
           this silently does nothing.
        */


        const goalContainer =
            H.getById?.(
                "readingGoalProgress"
            );


        const goalPercent =
            H.getById?.(
                "readingGoalPercent"
            );


        const goalText =
            H.getById?.(
                "readingGoalText"
            );


        if (
            !goalContainer &&
            !goalPercent &&
            !goalText
        ) {

            return;

        }


        const year =
            getStatsYear();


        const finishedThisYear =
            books.filter(
                book =>
                    wasFinishedInYear(
                        book,
                        year
                    )
            ).length;


        const goal =
            Math.max(
                1,
                Number(
                    getState()
                        ?.settings
                        ?.annualReadingGoal
                ) ||
                20
            );


        const percent =
            Math.max(
                0,
                Math.min(
                    100,
                    Math.round(
                        (
                            finishedThisYear /
                            goal
                        ) *
                        100
                    )
                )
            );


        if (
            goalContainer
        ) {

            goalContainer.style.width =
                `${percent}%`;

        }


        if (
            goalPercent
        ) {

            goalPercent.textContent =
                `${percent}%`;

        }


        if (
            goalText
        ) {

            goalText.textContent =
                `${finishedThisYear} of ${goal} books`;

        }

    }


    /* =====================================================
       FINISHED THIS YEAR
       ===================================================== */

    function wasFinishedInYear(
        book,
        year
    ) {

        if (
            book.status !==
            "finished" ||
            !book.finished
        ) {

            return false;

        }


        const date =
            parseLocalDate(
                book.finished
            );


        if (!date) {
            return false;
        }


        return (
            date.getFullYear() ===
            year
        );

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    Novellow.stats = {

        init,

        render,

        calculatePagesRead,

        calculateAverageRating,

        calculateRereads,

        buildGenreCounts,

        buildMonthlyCounts

    };


})();
