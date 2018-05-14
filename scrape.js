var fs = require("fs");
var casper = require("casper").create();
var gf = require("./grailedFilter");
var gs = require("./grailedSelectors");

var LIMIT = 0;
var MARKETS = ["grails", "hype", "sartorial", "core"];
var ACTUAL_DESIGNERS = [];
var MARKETS_TO_SCRAPE = [];
var DESIGNERS_TO_SCRAPE = [];
var CATEGORY_SELECTORS = [];
var LOCATIONS_TO_SCRAPE = [];
var CATEGORY_PANEL_SELECTORS = [];
var TRIES = 0;
var TRY_SCROLL_LIMIT = 15;
var CONFIGURABLE_OPTIONS = ['markets', 'designers', 'locations', 'sort', 'q', 'categories', 'sizes', 'min', 'max', 'limit'];
var scrollNum = 0;
var filter = new gf.GrailedFilter();
var grailedSelectors = new gs.GrailedSelectors();

// Start a new Casper instance connected to grailed.com
casper.start("https://grailed.com/", function () {
  var i = 0;
  casper.repeat(CONFIGURABLE_OPTIONS.length, function () {
    configureFromCLI(CONFIGURABLE_OPTIONS[i++]);
  });
});

// Click on selectors associated with the categorical filters
casper.then(function () {
  clickSelectors(CATEGORY_PANEL_SELECTORS);
  clickSelectors(CATEGORY_SELECTORS);
});

// Determine how many items should be scraped
casper.then(function () {
  if (LIMIT !== 0 || DESIGNERS_TO_SCRAPE.length === 0) {
    casper.log("LIMIT " + LIMIT)
    return;
  }
  MARKETS_TO_SCRAPE.forEach(function (marketName) {
    LIMIT += getMarketItemCount(marketName);
    casper.wait(500);
  });
});

// Scroll to load a number of items equal to LIMIT
casper.then(function () {
  casper.echo("[SCRAPE DETAILS]\n");
  if (numFeedItems() > 0) {
    loadFeedItems(null, LIMIT);
  } else {
    casper.echo("  EMPTY FEED");
  }
});

// Write the loaded content into a local file
casper.then(function () {
  var html = this.getHTML(".feed", true);
  dest = casper.cli.has("f") ? casper.cli.get("f") : "./feed.html";
  fs.write(dest, html);
});

casper.then(function () {
  filter.add({
    markets: MARKETS_TO_SCRAPE,
    locations: LOCATIONS_TO_SCRAPE,
    designers: DESIGNERS_TO_SCRAPE
  });
});

casper.then(function () {
  printFilterDetails();
  this.echo("\n[FINISHED]");
  if (numFeedItems() > 0) {
    this.echo("\n  TOTAL ITEMS SCRAPED: " + numFeedItems());
  }
  // printMarketFilterDetails();
  if (casper.cli.has("save")) {
    fs.write("./filter.json", JSON.stringify(filter.config, null, "\t"));
  }
});

casper.run();

function configureFromCLI(opt) {
  if (casper.cli.has(opt)) {
    configureOptionFromCLI(opt);
  } else {
    console.log('Could not configure option: ' + opt);
  }
}

function configureOptionFromCLI(opt) {
  switch (opt) {
    case "markets":
      MARKETS_TO_SCRAPE = getListFromCLI("markets", MARKETS).slice();
      configureMarketFilters();
      break;
    case "designers":
      DESIGNERS_TO_SCRAPE = getListFromCLI("designers", []).slice();
      clickDesignerFilters();
      break;
    case "locations":
      LOCATIONS_TO_SCRAPE = getListFromCLI("locations", []).slice();
      clickLocationFilters();
      break;
    case "sort":
      var sortFilterName = casper.cli.get(opt);
      if (sortFilterName in grailedSelectors.sort) {
        filter.add({ sort: sortFilterName });
        clickSortFilter(sortFilterName);
      }
      break;
    case "q":
      var q = casper.cli.raw.get(opt);
      casper.sendKeys(grailedSelectors.search["query-input"], q);
      filter.add({ query: q });
      break;
    case "categories":
      configureCategoricalFilter(opt);
      break;
    case "sizes":
      configureCategoricalFilter(opt);
      break;
    case "min":
      const minPrice = casper.cli.raw.get(opt);
      // Set min
      casper.sendKeys(grailedSelectors.prices["min"], minPrice, {
        keepFocus: true
      });
      break;
    case "max":
      const maxPrice = casper.cli.raw.get(opt);
      // Set max
      casper.sendKeys(grailedSelectors.prices["max"], minPrice, {
        keepFocus: true
      });
      break;
    case "limit":
      try {
        var limit = parseInt(casper.cli.get(opt));
        LIMIT = Math.max(limit, LIMIT);
      } catch (e) {
        casper.log("Could not parse 'limit' as integer");
      };
      break;
    default: casper.log(opt + ' is not a valid option');
  }
}

// Search and click for designer filter
function clickDesignerFilters() {
  var i = 0;
  casper.repeat(DESIGNERS_TO_SCRAPE.length, function () {
    clickDesignerFilter(DESIGNERS_TO_SCRAPE[i++]);
  });
};

function clickLocationFilters() {
  var locationSelectors = [];
  LOCATIONS_TO_SCRAPE.forEach(function (location, _) {
    locationSelectors.push(grailedSelectors.locations[location]);
  });
  clickSelectors(locationSelectors);
}

function clickSelectors(selectors) {
  var i = 0;
  casper.repeat(selectors.length, function () {
    var selector = selectors[i++];
    casper.click(selector);
    casper.wait(200);
  });
}

function clickDesignerFilter(designer) {
  // Must search for designer, and then a drop down with potential matches appears
  casper.sendKeys(grailedSelectors.search["designer-input"], designer, {
    reset: true
  });
  casper.wait(3000, function () {
    try {
      var selector = grailedSelectors.search["designer-results"];
      casper.click(selector);
      // Grailed's search auto-corrects
      var actualDesignerText = casper
        .getElementInfo(selector)
        .text.toLowerCase();
      ACTUAL_DESIGNERS.push(actualDesignerText);
      casper.wait(3000);
    } catch (e) {
      casper.echo("FAILED TO SELECT DESIGNER: " + designer);
    }
  });

  filter.add({ designers: [designer] });
}

function numFeedItems() {
  return casper.evaluate(function () {
    return $("div.feed-item").length;
  });
}

function getMarketItemCount(marketName) {
  var selector = grailedSelectors.markets[marketName] + " .sub-title.small";
  return parseInt(casper.getElementInfo(selector).text);
}

// TODO: refactor this
function loadFeedItems(prevFeedItemCount, limit) {
  if (!!prevFeedItemCount && prevFeedItemCount == numFeedItems()) {
    TRIES++;
    casper.echo("  Trying to load more (#" + TRIES + ")");
  } else {
    prevFeedItemCount = numFeedItems();
    casper.echo("  ITEMS SCRAPED: " + prevFeedItemCount);
    TRIES = 0;
  }

  casper.then(function () {
    casper.scrollToBottom();
    casper.wait(1000, function () {
      if (numFeedItems() < limit && TRIES < TRY_SCROLL_LIMIT) {
        loadFeedItems(prevFeedItemCount, limit);
      }
    });
  });
}

function setMarketFilter(selector, active) {
  var classes = casper.getElementAttribute(selector, "class");
  var isMarketActive = classes.split(" ").indexOf("active") == 0;
  if (isMarketActive != active) {
    casper.click(selector);
    casper.wait(1000);
  }
}

function configureMarketFilters() {
  var i = 0;
  casper.repeat(MARKETS.length, function () {
    var marketName = MARKETS[i++];
    if (MARKETS_TO_SCRAPE.indexOf(marketName) == -1) {
      // By default, grails market is checked
      setMarketFilter(grailedSelectors.markets[marketName], false);
    } else {
      setMarketFilter(grailedSelectors.markets[marketName], true);
    }
  });
}

function configureCategoricalFilter(domain) {
  if (casper.cli.has(domain)) {
    var res = casper.cli.get(domain).split(" ");
    for (var i = 0; i < res.length; i++) {
      var category = res[i];
      var items = category.split(":");
      var categoryName = items[0];
      var subcategories = items[1].split(",");
      var obj = {};
      obj[domain] = {};
      obj[domain][categoryName] = subcategories;
      filter.add(obj);
      CATEGORY_PANEL_SELECTORS.push(
        grailedSelectors[domain][categoryName]["panel"]
      );
      subcategories.forEach(function (subcategory, _) {
        CATEGORY_SELECTORS.push(
          grailedSelectors[domain][categoryName][subcategory]
        );
      });
    }
  }
}

function getListFromCLI(cliArg, L) {
  if (casper.cli.has(cliArg)) {
    var res = casper.cli.get(cliArg).split(",");
    return res
      .map(function (item) {
        return item.trim();
      })
      .filter(function (item) {
        return item.length > 0;
      });
  }
  return L;
}

function clickSortFilter(sortName) {
  casper.click(grailedSelectors.sort["dropdown"]);
  casper.click(grailedSelectors.sort[sortName]);
  casper.wait(1000);
}

function printMarketFilterDetails() {
  MARKETS.forEach(function (market, _) {
    require("utils").dump(
      casper.getElementInfo(grailedSelectors.debug["markets"][market])["text"]
    );
    require("utils").dump(
      casper.getElementInfo(grailedSelectors.debug["markets"][market])[
      "attributes"
      ]
    );
  });
}

function printFilterDetails() {
  casper.echo("[FILTERS]");
  casper.echo("");
  casper.echo(JSON.stringify(filter.config, null, "  "));
  casper.echo("");
}

// inspired from https://gist.github.com/penguinboy/762197
var flattenObject = function (ob) {
  var toReturn = {};

  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if (typeof ob[i] == "object") {
      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        toReturn[i + "." + flatObject[x]] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
};
