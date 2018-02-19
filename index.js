var fs = require('fs');
var casper = require('casper').create();
var gf = require('./grailedFilter');
var gs = require('./grailedSelectors');

var NUM_ITEMS = 0

var MARKETS = ['grails', 'hype', 'sartorial', 'core']

var ACTUAL_DESIGNERS = []

var MARKETS_TO_SCRAPE = [] /* By default, only grails is selected */
var DESIGNERS_TO_SCRAPE = [] /* if empty, scrape all designers */
var CATEGORIES_TO_SCRAPE = [] /* if empty, scrape all categories */
var PANELS_TO_CLICK = []

var TRIES = 0
var TRY_SCROLL_LIMIT = 15

var scrollNum = 0
var prevFeedItemCount = null

var filter = new gf.GrailedFilter();

casper.start('https://grailed.com/', function() {
    MARKETS_TO_SCRAPE = getMarketsToScrape().slice();
    DESIGNERS_TO_SCRAPE = getDesignersToScrape().slice();
});

casper.then(function() {
    if (casper.cli.has('categories')) {
        var categories = casper.cli.get('categories').split(' ');
        for (var i=0; i<categories.length; i++) {
            var category = categories[i];
            var items = category.split(':')
            var categoryName = items[0]
            var subcategories = items[1].split(',')
            var obj = {}
            obj[categoryName] = subcategories
            filter.addToFilter({categories: obj});
            PANELS_TO_CLICK.push(gs.CATEGORIES[categoryName]['panel'])
            subcategories.forEach(function(subcategory, _) {
                console.log(subcategory, gs.CATEGORIES[categoryName][subcategory])
                CATEGORIES_TO_SCRAPE.push(gs.CATEGORIES[categoryName][subcategory])
            })
        }
    }
})

casper.then(function() {
    if (casper.cli.has('sizes')) {
        var sizes = casper.cli.get('sizes').split(' ');
        for (var i=0; i<sizes.length; i++) {
            var category = sizes[i];
            var items = category.split(':')
            var categoryName = items[0]
            var subcategories = items[1].split(',')
            var obj = {}
            obj[categoryName] = subcategories
            filter.addToFilter({sizes: obj});
            PANELS_TO_CLICK.push(gs.CATEGORIES[categoryName]['panel'])
            subcategories.forEach(function(subcategory, _) {
                CATEGORIES_TO_SCRAPE.push(gs.CATEGORIES[categoryName][subcategory])
            })
        }
    }
})

casper.then(function() {
    
    configureSortFilter();
});

casper.then(function() {
    configureMarketFilters();
});

casper.then(function () {
    configureDesignerFilters();
});

casper.then(function() {
    clickSelectors(PANELS_TO_CLICK);
    clickSelectors(CATEGORIES_TO_SCRAPE);
})

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
    printMarketFilterDetails()
});

casper.run();

function clickSelectors(selectors) {
    var i = 0;
    casper.repeat(selectors, function () {
        casper.click(selectors[i++]);
        casper.wait(500);
    })
}

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

function configureFilter() {
    filter.addToFilter({designers: DESIGNERS_TO_SCRAPE})
    filter.addToFilter({markets: MARKETS_TO_SCRAPE});
    // filter.addToFilter({price: PRICES_TO_SCRAPE});
    // filter.addToFilter({categories: CATEGORIES_TO_SCRAPE});
    // filter.addToFilter({locations: LOCATIONS_TO_SCRAPE});
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
        if (MARKETS_TO_SCRAPE.indexOf(marketName) == -1) {
            filter.addToFilter({markets: [marketName]})
            setMarketFilter(gs.MARKET[marketName], false);
        } else {
            setMarketFilter(gs.MARKET[marketName], true);
        }
    });
}

function clickDesignerFilter(designer) {
    filter.addToFilter({designers: [designer]});
    casper.sendKeys(gs.DESIGNER_SEARCH, designer, { reset : true });
    casper.wait(3000, function () {
        try {
            var selector = gs.DESIGNER_SEARCH_LIST + ' .designer .active-indicator:nth-child(1)';
            casper.click(selector);
            // Grailed's search auto-corrects
            var actualDesignerText = casper.getElementInfo(selector).text.toLowerCase();
            console.log("DESIGNER SEARCH: " + actualDesignerText);
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

function setMarketFilter(selector, active) {
    console.log('MARKET FILTER', selector)
    var classes = casper.getElementAttribute(selector, 'class');
    var isMarketActive = classes.split(" ").indexOf('active') == 0;
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

        return markets.map(function (market) { return market.trim()})
                         .filter(function (market) { return market.length > 0 && market in gs.MARKET });
    }

    return MARKETS.slice();
}

function getDesignersToScrape() {
    if (casper.cli.has('designers')) {
        var designers = casper.cli.get('designers').split(',');

        return designers.map(function (designer) { return designer.trim() })
                        .filter(function (designer) { return designer.length > 0 });
    }
    // Empty represents all designers
    return [];
}

function configureSortFilter() {
    if (casper.cli.has('sort')) {
        var sortFilterName = casper.cli.get('sort');
        
        if (sortFilterName in gs.SORT) {
            filter.addToFilter({sort: [sortFilterName]});
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
    casper.echo("  ITEM LIMIT: " + NUM_ITEMS + "\n")
}