var fs = require('fs');
var casper = require('casper').create();
var gf = require('./grailedFilter');
var gs = require('./grailedSelectors');

var NUM_ITEMS = 0
var MARKETS = ['grails', 'hype', 'sartorial', 'core']
var ACTUAL_DESIGNERS = []
var MARKETS_TO_SCRAPE = [] /* By default, only grails is selected */
var DESIGNERS_TO_SCRAPE = [] /* if empty, scrape all designers */
var CATEGORY_SELECTORS = [] /* if empty, scrape all categories */
var LOCATIONS_TO_SCRAPE = []
var CATEGORY_PANEL_SELECTORS = []
var TRIES = 0
var TRY_SCROLL_LIMIT = 15
var scrollNum = 0
var prevFeedItemCount = null
var filter = new gf.GrailedFilter();

// Start a new Casper instance connected to grailed.com
casper.start('https://grailed.com/', function() {
    MARKETS_TO_SCRAPE = getMarketsToScrape().slice();
    DESIGNERS_TO_SCRAPE = getDesignersToScrape().slice();
    LOCATIONS_TO_SCRAPE = getLocationsToScrape().slice();
});

casper.then(function() {
    if (casper.cli.has('q')) {
        var q = casper.cli.raw.get('q')
        casper.sendKeys(gs.QUERY, q, {keepFocus: true})
        filter.add({query: q}); 
    } 
})

// Grab categorical filters from command line
casper.then(function() {
    configureCategoricalFilter('categories')
    configureCategoricalFilter('sizes')
})

// Click on selectors associated with the categorical filters
casper.then(function() {
    clickSelectors(CATEGORY_PANEL_SELECTORS);
    clickSelectors(CATEGORY_SELECTORS);
})

// Click on location filters
casper.then(function() {
    var locationSelectors = [];
    LOCATIONS_TO_SCRAPE.forEach(function(location,_) {
        locationSelectors.push(gs.LOCATIONS[location])
    });
    clickSelectors(locationSelectors);
})

// Set min/max price filters
casper.then(function() {
    if (casper.cli.has('min')) {
        // https://stackoverflow.com/a/25014609/8109239
        minPrice = casper.cli.raw.get('min');
        casper.sendKeys(gs.MIN_PRICE, minPrice, {keepFocus: true});
        filter.add({price: {min : minPrice}})
    }
    if (casper.cli.has('max')) {
        maxPrice = casper.cli.raw.get('max');
        casper.sendKeys(gs.MAX_PRICE, maxPrice, {keepFocus: true});
        filter.add({price: {max : maxPrice}})
    }
})

// Click on sort filter
casper.then(function() {
    configureSortFilter();
});

// Click on market filters
casper.then(function() {
    configureMarketFilters();
});

// Search and click for designer filter
casper.then(function () {
    var i = 0;
    casper.repeat(DESIGNERS_TO_SCRAPE.length, function () {
        clickDesignerFilter(DESIGNERS_TO_SCRAPE[i++]);
    });
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
})

// Determine how many items should be scraped
casper.then(function () {
    if (NUM_ITEMS !== 0 || DESIGNERS_TO_SCRAPE.length === 0) {
        return
    }
    MARKETS_TO_SCRAPE.forEach(function(marketName) {
        NUM_ITEMS += getMarketItemCount(marketName)
        casper.wait(500);
    })
})

casper.then(function() {
    printFilterDetails();
})

// Scroll to load a number of items equal to NUM_ITEMS
casper.then(function() {
    casper.echo("[SCRAPE DETAILS]\n");
    if (numFeedItems() > 0) {
        loadFeedItems(NUM_ITEMS);
    } else {
        casper.echo("  EMPTY FEED");
    }
});

// Write the loaded content into a local file
casper.then(function() {
    var html = this.getHTML('.feed', true);
    dest = casper.cli.has('f') ? casper.cli.get('f') : './feed.html' 
    fs.write(dest, html);
});

casper.then(function () {
    this.echo('\n[FINISHED]');
    if (numFeedItems() > 0) {
        this.echo("\n  TOTAL ITEMS SCRAPED: " + numFeedItems());
    }
    // printMarketFilterDetails();
    if (casper.cli.has('saveFilter')) {
        fs.write('./filter.json', JSON.stringify(filter.config, null, "\t"))
    }
});

casper.run();

function clickSelectors(selectors) {
    var i = 0;
    casper.repeat(selectors.length, function () {
        var selector = selectors[i++];
        casper.click(selector);
        casper.wait(200);
    })
}

function numFeedItems() {
    return casper.evaluate(function() {
        return $("div.feed-item").length;
    });
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
            }
        })
    });
}

function configureMarketFilters() {
    var i = 0;
    casper.repeat(MARKETS.length, function () {
        var marketName = MARKETS[i++]
        if (MARKETS_TO_SCRAPE.indexOf(marketName) == -1) { // By default, grails market is checked
            setMarketFilter(gs.MARKET[marketName], false);
        } else {
            setMarketFilter(gs.MARKET[marketName], true);
        }
    });
    filter.add({markets: MARKETS_TO_SCRAPE})
}

function configureCategoricalFilter(domain) {
    if (casper.cli.has(domain)) {
        var res = casper.cli.get(domain).split(' ');
        for (var i = 0; i < res.length; i++) {
            var category = res[i];
            var items = category.split(':')
            var categoryName = items[0]
            var subcategories = items[1].split(',')
            var obj = {}
            obj[domain] = {}
            obj[domain][categoryName] = subcategories
            filter.add(obj);
            CATEGORY_PANEL_SELECTORS.push(gs[domain.toUpperCase()][categoryName]['panel'])
            subcategories.forEach(function (subcategory, _) {
                CATEGORY_SELECTORS.push(gs[domain.toUpperCase()][categoryName][subcategory])
            })
        }
    }
}
function clickDesignerFilter(designer) {
    // Must search for designer, and then a drop down with potential matches appears
    casper.sendKeys(gs.DESIGNER_SEARCH, designer, { reset : true });
    casper.wait(3000, function () {
        try {
            var selector = gs.DESIGNER_SEARCH_LIST_RESULTS;
            casper.click(selector);
            // Grailed's search auto-corrects
            var actualDesignerText = casper.getElementInfo(selector).text.toLowerCase();
            ACTUAL_DESIGNERS.push(actualDesignerText);
            casper.wait(3000);
        } catch(e) {
            casper.echo('FAILED TO SELECT DESIGNER: ' + designer);
        }
    });

    filter.add({designers: [designer]});
}

function clickSortFilter(sortName) {
    casper.click(gs.SORT['dropdown']);
    casper.click(gs.SORT[sortName]);
    casper.wait(1000);
}

function setMarketFilter(selector, active) {
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
        return markets
                .map(function (market) {return market.trim()})
                .filter(function (market) {return market.length > 0 && market in gs.MARKET});
    }
    return MARKETS.slice();
}

function getLocationsToScrape() {
    if (casper.cli.has('locations')) {
        var locations = casper.cli.get('locations').split(',');
        filter.add({locations: locations})
        return locations.map(function (location) { return location.trim()})
                         .filter(function (location) { return location.length > 0 && location in gs.LOCATIONS });
    }
    return [];
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
            filter.add({sort: sortFilterName});
            clickSortFilter(sortFilterName);
        }
    }
}

function printMarketFilterDetails() {
    MARKETS.forEach(function(market, _) {
        require('utils').dump(casper.getElementInfo(gs.DEBUG['markets'][market])['text']);
        require('utils').dump(casper.getElementInfo(gs.DEBUG['markets'][market])['attributes']);
    })
}

function sizeFilterDetails() {
    require('utils').dump(casper.getElementInfo(gs.DEBUG['sizes']['footwear']['all'])['text'])
    require('utils').dump(casper.getElementInfo(gs.DEBUG['sizes']['footwear']['all'])['attributes'])
}

function printFilterDetails() {
    casper.echo("[FILTERS]");
    if (MARKETS_TO_SCRAPE.length === 0) {
        casper.echo("  MARKETS: ALL");
    } else {
        casper.echo("  MARKETS: " + MARKETS_TO_SCRAPE);
    }

    if (ACTUAL_DESIGNERS.length === 0) {
        casper.echo("  DESIGNERS: [NONE SPECIFIED]");
    } else {
        casper.echo("  DESIGNERS: " + ACTUAL_DESIGNERS);
    }
    casper.echo("  ITEM LIMIT: " + NUM_ITEMS)
    casper.echo("  MIN PRICE: " + filter.config['price']['min'])
    casper.echo("  MAX PRICE: " + filter.config['price']['max'])
    casper.echo("")
}