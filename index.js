var fs = require('fs');
var casper = require('casper').create();
var gf = require('./grailedFilter');
var gs = require('./grailedSelectors');

var NUM_ITEMS = 0

var MARKETS = ['grails', 'hype', 'core']

var ACTUAL_DESIGNERS = []

var MARKETS_TO_SCRAPE = [] /* By default, only grails is selected */
var DESIGNERS_TO_SCRAPE = [] /* if empty, scrape all designers */
var CATEGORIES_TO_SCRAPE = [] /* if empty, scrape all categories */

var TRIES = 0
var TRY_SCROLL_LIMIT = 15

var scrollNum = 0
var prevFeedItemCount = null

casper.start('https://grailed.com/', function() {
    MARKETS_TO_SCRAPE = getMarketsToScrape().slice();
    DESIGNERS_TO_SCRAPE = getDesignersToScrape().slice();
    filter.addToFilter(
        {
            "markets": MARKETS_TO_SCRAPE,
            "designers": DESIGNERS_TO_SCRAPE,
            "categories" : {
                "top": [1,2,3],
                "bottom": [4,5,6]
            }
        }
    )
    console.log(JSON.stringify(filter.filter));
});

casper.then(function() {
    configureSortFilter();
});

casper.then(function() {
    configureMarketFilters();
});

casper.then(function() {
    configureCategoryFilters();
})

casper.then(function() {
    configureSizeFilters();
});


casper.then(function () {
    if (casper.cli.has('numItems')) { 
        try {
            var numItems = parseInt(casper.cli.get('numItems'));
            NUM_ITEMS = numItems > 0 ? numItems : NUM_ITEMS;
        } catch (e) {
            casper.log(e);
        }
    }
});

casper.then(function () {
    configureDesignerFilters();
});

casper.then(function () {
    if (NUM_ITEMS !== 0 || DESIGNERS_TO_SCRAPE.length === 0) {
        return
    }
    MARKETS_TO_SCRAPE.forEach(function(marketName) {
        NUM_ITEMS += getMarketItemCount(marketName)
        casper.wait(500);
    })
})

casper.then(function () {
    printFilterDetails();
});

casper.then(function() {
    casper.echo("[SCRAPE DETAILS]\n");
})

casper.then(function() {
    loadFeedItems(NUM_ITEMS);
});

casper.then(function() {
    var html = this.getHTML('.feed', true);

    dest = casper.cli.has('f') ? casper.cli.get('f') : './feed.html' 

    fs.write(dest, html);
});

casper.then(function () {
    this.echo('\n[FINISHED]');
    this.echo("\n  TOTAL ITEMS SCRAPED: " + numFeedItems());
});

casper.run();

function numFeedItems() {
    var result = casper.evaluate(function() {
        var feedItems = $("div.feed-item");
        return feedItems.length;
    });

    return result;
}

function loadFeedItems (numItems) {
    if (!!prevFeedItemCount && prevFeedItemCount == numFeedItems()) {
        TRIES++;
        casper.echo('  Trying to load more (#' + TRIES + ')')
    } else {
        prevFeedItemCount = numFeedItems();
        casper.echo('  ITEMS SCRAPED: ' + prevFeedItemCount);
        TRIES = 0;
    }

    casper.then(function () {
        casper.scrollToBottom();
        casper.wait(1000, function () {
            if (numFeedItems() < numItems && TRIES < TRY_SCROLL_LIMIT) {
                loadFeedItems(numItems);
            } else {
                return;
            }
        })
    });
}

function configureDesignerFilters() {
    var i = 0;
    casper.repeat(DESIGNERS_TO_SCRAPE.length, function () {
        clickDesignerFilter(DESIGNERS_TO_SCRAPE[i++]);
    });
}

function configureMarketFilters() {
    var i = 0;
    casper.repeat(MARKETS.length, function () {
        var marketName = MARKETS[i++]

        if (MARKETS_TO_SCRAPE.indexOf(marketName) !== -1) {
            setFilter(gs.MARKET[marketName], true);
        } else {
            setFilter(gs.MARKET[marketName], false);
        }
    });
}

function clickDesignerFilter(designer) {
    casper.sendKeys(gs.DESIGNER_SEARCH, designer, { reset : true });
    casper.wait(3000, function () {
        try {
            var selector = gs.DESIGNER_SEARCH_LIST + ' .designer .active-indicator:nth-child(1)';
            casper.click(selector);
            // Grailed's search auto-corrects
            var actualDesignerText = casper.getElementInfo(selector).text.toLowerCase();
            ACTUAL_DESIGNERS.push(actualDesignerText);
            casper.wait(3000);
        } catch(e) {
            casper.echo('FAILED TO SELECT DESIGNER: ' + designer);
        }
    });
}

function clickSortFilter(sortName) {
    casper.click('h3.drop-down-title');
    casper.click(gs.SORT[sortName]);
    casper.log('SUCCESSFULLY SELECTED SORT FILTER: ' + sortName.toUpperCase());
    casper.wait(1000); 
}

function setFilter(selector, active) {
    var classes = casper.getElementAttribute(selector, 'class');
    var isMarketActive = classes.split(" ").indexOf('active') !== -1;
    if (isMarketActive != active) {
        casper.click(selector);
        casper.wait(1000);
    }
}

function getMarketItemCount(marketName) {
    var selector = gs.MARKET[marketName] + ' .sub-title.small';
    return parseInt(casper.getElementInfo(selector).text);
}

function getMarketsToScrape() {
    if (casper.cli.has('markets')) {
        var markets = casper.cli.get('markets').split(',');

        markets = markets.map(function (market) {
            return market.trim();
        });

        markets = markets.filter(function (market) {
            return market.length > 0 && market in gs.MARKET;
        });

        return markets;
    }

    return MARKETS.slice();
}

function getDesignersToScrape() {
    if (casper.cli.has('designers')) {
        var designers = casper.cli.get('designers').split(',');

        designers = designers.map(function (designer) {
            return designer.trim();
        });

        designers = designers.filter(function (designer) {
            return designer.length > 0;
        });

        return designers;
    }
    // Empty represents all designers
    return [];
}

function configureSortFilter() {
    if (casper.cli.has('sort')) {
        var sortFilterName = casper.cli.get('sort');
        if (sortFilterName in gs.SORT) {
            clickSortFilter(sortFilterName);
        }
    }
}

function printMarketFilterDetails() {
    require('utils').dump(casper.getElementInfo('.strata-wrapper .active-indicator:nth-child(1)')['text']);
    require('utils').dump(casper.getElementInfo('.strata-wrapper .active-indicator:nth-child(1)')['attributes']);

    require('utils').dump(casper.getElementInfo('.strata-wrapper .active-indicator:nth-child(2)')['text']);
    require('utils').dump(casper.getElementInfo('.strata-wrapper .active-indicator:nth-child(2)')['attributes']);

    require('utils').dump(casper.getElementInfo('.strata-wrapper .active-indicator:nth-child(3)')['text']);
    require('utils').dump(casper.getElementInfo('.strata-wrapper .active-indicator:nth-child(3)')['attributes']);
}

function printFilterDetails() {
    casper.echo("[FILTERS]\n");
    if (MARKETS_TO_SCRAPE.length === 0) {
        casper.echo("  MARKETS: ALL");
    } else {
        casper.echo("  MARKETS: " + MARKETS_TO_SCRAPE);
    }

    if (DESIGNERS_TO_SCRAPE.length === 0) {
        casper.echo("  DESIGNERS: ALL");
    } else {
        casper.echo("  DESIGNERS: " + ACTUAL_DESIGNERS);
    }

    casper.echo("  CATEGORIES: ALL");
    casper.echo("  ITEM LIMIT: " + NUM_ITEMS + "\n")
}