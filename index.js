/* ---------------------------------------------------------------------------*/
var fs = require('fs');
var casper = require('casper').create({
    logLevel: 'debug'
});

var NUMSCROLLS = 350

var MARKETS = ['grailed', 'hype', 'core']

var MARKETS_TO_SCRAPE = [] /* if empty, scrape all markets */
var DESIGNERS_TO_SCRAPE = [] /* if empty, scrape all designers */
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
    configureFilters();
});

casper.then(function () {
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
    configureDesignersToScrape();
}

function configureMarketFilters() {

}

function configureDesignerFilters() {
    
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