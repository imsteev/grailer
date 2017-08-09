/* ---------------------------------------------------------------------------*/
var fs = require('fs');
var casper = require('casper').create({
    logLevel: 'debug'
});

var NUMSCROLLS = 1

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

casper.then(function() {
    configureSortFilters();
});

casper.then(function() {
    configureMarketFilters();
});

casper.then(function () {
    configureDesignerFilters();
});

casper.then(function () {
    loadFeed(NUMSCROLLS);
});

casper.then(function () {
    var html = this.getHTML('.feed', true);
    fs.write('feed.html', html)
});

casper.then(function () {
    var log = require('utils').dump(this.result.log);

    fs.write('log.json', JSON.stringify(this.result.log));
    this.echo('\nFINISHED!');
    console.log(this.getElementInfo('.drop-down-toggle h3.selected').text)
    // printMarketFilterDetails();
});

casper.run();

function loadFeed (numScrolls) {
    casper.repeat(numScrolls, function () {
        casper.scrollToBottom();
        casper.wait(1000, function () {
            casper.log('SCROLL: ' + ++scrollNum);
        });
    })
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

// Support 'low-to-high' filter, and 'high-to-low' filter.
function configureSortFilters() {
    if (casper.cli.has('low')) {
        clickSortFilter('low');
    }
    else if (casper.cli.has('high')) {
        clickSortFilter('high');
    }
}

/* -----------------------------CLICKS----------------------------------------*/
function clickDesignerFilter(designer) {
    casper.sendKeys(DESIGNER_SEARCH_SELECTOR, designer, { reset : true });
    casper.wait(1000, function () {
        try {
            casper.click(DESIGNER_SEARCH_LIST_SELECTOR + ' .designer .active-indicator:nth-child(1)');
            casper.log('SUCCESSFULLY SELECTED DESIGNER: ' + designer.toUpperCase());
            casper.wait(1000);
        } catch(e) {
            casper.log('FAILED TO SELECT DESIGNER: ' + designer.toUpperCase());
        }
    });
}

function clickMarketFilter(marketName) {
    casper.click(MARKET_FILTER_SELECTOR[marketName]);
    casper.wait(1000);
}

function clickSortFilter(sortName) {
    if (sortName in SORT_FILTER_SELECTOR) {
        casper.click('h3.drop-down-title');
        casper.click(SORT_FILTER_SELECTOR[sortName]);
        casper.log('SUCCESSFULLY SELECTED SORT FILTER: ' + sortName.toUpperCase());
        casper.wait(1000);
    }
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
/* ---------------------------------------------------------------------------*/

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

    return result.length == 0 ? MARKETS.slice() : result;
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

function printMarketFilterDetails() {
    require('utils').dump(casper.getElementInfo('.strata-wrapper .active-indicator:nth-child(1)')['text']);
    require('utils').dump(casper.getElementInfo('.strata-wrapper .active-indicator:nth-child(1)')['attributes']);

    require('utils').dump(casper.getElementInfo('.strata-wrapper .active-indicator:nth-child(2)')['text']);
    require('utils').dump(casper.getElementInfo('.strata-wrapper .active-indicator:nth-child(2)')['attributes']);

    require('utils').dump(casper.getElementInfo('.strata-wrapper .active-indicator:nth-child(3)')['text']);
    require('utils').dump(casper.getElementInfo('.strata-wrapper .active-indicator:nth-child(3)')['attributes']);
}

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

    casper.echo("  CATEGORIES: ALL");
}