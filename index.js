/* ---------------------------------------------------------------------------*/
var fs = require('fs');
var casper = require('casper').create({
    logLevel: 'debug'
});

var NUMSCROLLS = 2

var MARKETS = ['grailed', 'hype', 'core']
var MARKET_FILTER_SELECTOR = {
    grailed: '.strata-wrapper div.active-indicator:nth-child(1)',
    hype: '.strata-wrapper div.active-indicator:nth-child(2)',
    core: '.strata-wrapper div.active-indicator:nth-child(3)'
}

var MARKETS_TO_SCRAPE = [] /* if empty, scrape all markets */
var DESIGNERS_TO_SCRAPE = [] /* if empty, scrape all designers */
var CATEGORIES_TO_SCRAPE = [] /* if empty, scrape all categories */
/* ---------------------------------------------------------------------------*/
var scrollNum = 0

casper.start('https://grailed.com/', function() {
    MARKETS_TO_SCRAPE = getMarketsToScrape().slice();
    DESIGNERS_TO_SCRAPE = getDesignersToScrape().slice();
});

casper.then(function() {
    casper.echo("SCRAPING...\n")
});

casper.then(function () {
    printScrapeDetails();
});

casper.then(function () {
    configureMarketFilter('grailed');
});

casper.then(function () {
    configureMarketFilter('hype');
});

casper.then(function() {
    configureMarketFilter('core');
});

casper.then(function () {
    this.click('.designers-wrapper .view-all-btn');
    this.wait('500', function () {
        this.click(getDesignerSelector(13));
        this.wait('500');
    });
});

casper.then(function () {
    // TODO: figure out why a feed-item won't have all its html
    loadFeed(NUMSCROLLS);
});

casper.then(function () {
    var html = this.getHTML();
    fs.write('feed.html', html)
});

casper.then(function () {
    this.echo('\nFINISHED!');
});

casper.run();

function printScrapeDetails() {
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
}

function loadFeed (numScrolls) {
    casper.repeat(numScrolls, function () {
        casper.scrollToBottom();
        casper.wait(1000, function () {
            casper.log('SCROLL: ' + ++scrollNum);
        });
    })
}

function configureFilters() {
    configureMarketsToScrape();
    // configureDesignersToScrape();
}

function buildDesignerToIndexMapping() {

}

function configureMarketFilter(marketName) {
    if (casper.cli.has(marketName)) {
        this.click(MARKET_FILTER_SELECTOR[marketName]);
        this.wait(1000);
    }
}

function configureDesignerFilters(designer) {
    // need to also index into the right designer-group
    var dti = buildDesignerToIndexMapping();
    var index = getDesignerSelector(dti[designer]);

    this.click('.designer-group .view-all-btn');
    this.wait('500', function () {
        this.click(getDesignerSelector(index));
    });
}   

// 1-based
function getDesignerSelector(index) {
    return '.designers-group .active-indicator:nth-child(' + index + ')';
}

function getMarketsToScrape() {
    var result = [];

    MARKETS.forEach(function (marketName) {
        if (casper.cli.has(marketName)) {
            result.push(marketName);
        }
    })

    return result;
}

function getDesignersToScrape() {
    if (casper.cli.has('designers')) {
        var designers = casper.cli.get('designers').split(',');

        designers.filter(function (designer) {
            return designer.trim().length > 0;
        });

        designers.map(function (designer) {
            return designer.toLowerCase();
        });

        return designers;
    }

    // Empty represents all designers
    return [];
}