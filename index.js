var fs = require('fs');
var casper = require('casper').create({
    logLevel: 'debug'
});

var NUMSCROLLS = 250
var scrollNum = 0

var loadFeed = function (numScrolls) {
    casper.repeat(numScrolls, function () {
        casper.scrollToBottom();
        casper.wait(1000, function () {
            casper.log('SCROLL: ' + ++scrollNum);
        });
    })
}

casper.start('https://grailed.com/', function() {
    casper.log('STARTING TO SCRAPE...');
});

casper.then(function () {
    loadFeed(NUMSCROLLS);
});

casper.then(function () {
    var html = this.getHTML();
    fs.write('feed.html', html)
});

casper.then(function () {
    casper.log('FINISHED SCRAPING!');
});

casper.run();