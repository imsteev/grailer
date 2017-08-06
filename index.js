var casper = require('casper').create();
var fs = require('fs');

var NUMSCROLLS = 250

var loadFeed = function (numScrolls) {
    casper.repeat(numScrolls, function () {
        casper.scrollToBottom();
        casper.wait(1000, function () {
            'scrolled'
        });
    })
}

casper.start('https://grailed.com/', function() {

});

casper.then(function() {
    loadFeed(NUMSCROLLS);
});

casper.then(function () {
    var html = this.getHTML();
    fs.write('feed.html', html)
});

casper.run();