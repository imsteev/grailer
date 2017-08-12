/* ---------------------------------------------------------------------------*/
var fs = require('fs');
var casper = require('casper').create();

var NUM_ITEMS = 0

var MARKETS = ['grails', 'hype', 'core']

var MARKET_FILTER_SELECTOR = {
    grails: '.strata-wrapper div.active-indicator:nth-child(1)',
    hype: '.strata-wrapper div.active-indicator:nth-child(2)',
    core: '.strata-wrapper div.active-indicator:nth-child(3)'
}

var SORT_FILTER_SELECTOR = {
    default: '.sort .drop-down-toggle h3:nth-child(1)',
    new: '.sort .drop-down-toggle h3:nth-child(2)',
    low: '.sort .drop-down-toggle h3:nth-child(3)',
    high: '.sort .drop-down-toggle h3:nth-child(4)',
    popular: '.sort .drop-down-toggle h3:nth-child(5)'
}

var DESIGNER_SEARCH_SELECTOR = '.designer-search-wrapper input';
var DESIGNER_SEARCH_LIST_SELECTOR = '.designer-search-wrapper .designer-list';

var MARKETS_TO_SCRAPE = [] /* By default, only grails is selected */
var DESIGNERS_TO_SCRAPE = [] /* if empty, scrape all designers */
var CATEGORIES_TO_SCRAPE = [] /* if empty, scrape all categories */

var TRIES = 0
var TRY_SCROLL_LIMIT = 20
/* ---------------------------------------------------------------------------*/
var scrollNum = 0
var prevFeedItemCount = null

// process.on('SIGINT', function () {
//     console.log('num items before interrupt: ' + numFeedItems());
// });

casper.start('https://grailed.com/', function() {
    MARKETS_TO_SCRAPE = getMarketsToScrape().slice();
    DESIGNERS_TO_SCRAPE = getDesignersToScrape().slice();
});

casper.then(function() {
    configureSortFilter();
});

casper.then(function() {
    configureMarketFilters();
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

casper.then(function () {
    var html = this.getHTML('.feed', true);
    fs.write('feed.html', html)
});

casper.then(function () {
    // var log = require('utils').dump(this.result.log);
    // fs.write('log.json', JSON.stringify(this.result.log));
    this.echo('\n[FINISHED]');

    printMarketFilterDetails();
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
        casper.echo('  TOTAL ITEMS SCRAPED: ' + prevFeedItemCount);
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
            setMarketFilterActive(marketName);
        } else {
            setMarketFilterNotActive(marketName);
        }
    });
}

/* -----------------------------CLICKS----------------------------------------*/
function clickDesignerFilter(designer) {
    casper.sendKeys(DESIGNER_SEARCH_SELECTOR, designer, { reset : true });
    casper.wait(3000, function () {
        try {
            casper.click(DESIGNER_SEARCH_LIST_SELECTOR + ' .designer .active-indicator:nth-child(1)');
            casper.log('SUCCESSFULLY SELECTED DESIGNER: ' + designer.toUpperCase());
            casper.wait(3000);
        } catch(e) {
            casper.echo(e)  
            casper.log('FAILED TO SELECT DESIGNER: ' + designer.toUpperCase());
        }
    });
}

function clickMarketFilter(marketName) {
    casper.click(MARKET_FILTER_SELECTOR[marketName]);
    casper.wait(1000);
}

function clickSortFilter(sortName) {
    casper.click('h3.drop-down-title');
    casper.click(SORT_FILTER_SELECTOR[sortName]);
    casper.log('SUCCESSFULLY SELECTED SORT FILTER: ' + sortName.toUpperCase());
    casper.wait(1000); 
}

//TODO: refactor to a more general function for active-indicator's
function setMarketFilterActive(marketName) {
    var classes = casper.getElementAttribute(MARKET_FILTER_SELECTOR[marketName], 'class')
    var isMarketActive = classes.split(" ").indexOf('active') !== -1;
    
    if (!isMarketActive) {
        clickMarketFilter(marketName);
    }
}

//TODO: refactor to a more general function for active-indicator's
function setMarketFilterNotActive(marketName) {
    var classes = casper.getElementAttribute(MARKET_FILTER_SELECTOR[marketName], 'class')
    var isMarketActive = classes.split(" ").indexOf('active') !== -1;

    if (isMarketActive) {
        clickMarketFilter(marketName);
    }
}

function getMarketItemCount(marketName) {
    var marketIndex = { 
        grails: 1,
        hype: 2,
        core: 3
    }
    var index = marketIndex[marketName]

    var selector = MARKET_FILTER_SELECTOR[marketName] + ' .sub-title.small';
    return parseInt(casper.getElementInfo(selector).text);
}
/* ---------------------------------------------------------------------------*/

function getDesignerSelector(index) {
    return '.designers-group .active-indicator:nth-child(' + index + ')';
}

function getMarketsToScrape() {
    if (casper.cli.has('markets')) {
        var markets = casper.cli.get('markets').split(',');

        markets = markets.map(function (market) {
            return market.trim();
        });

        markets = markets.filter(function (market) {
            return market.length > 0 && market in MARKET_FILTER_SELECTOR;
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

// Support 'low-to-high' filter, and 'high-to-low' filter.
function configureSortFilter() {
    if (casper.cli.has('sort')) {
        var sortFilterName = casper.cli.get('sort');

        if (sortFilterName in SORT_FILTER_SELECTOR) {
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
        casper.echo("  DESIGNERS: " + DESIGNERS_TO_SCRAPE);
    }

    casper.echo("  CATEGORIES: ALL");
    casper.echo("  ITEM LIMIT: " + NUM_ITEMS + "\n")
}