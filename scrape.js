var fs = require("fs");
var casper = require("casper").create();
var gf = require("./grailedFilter");
var gs = require("./grailedSelectors");

var NUM_ITEMS = 0;
var MARKETS = ["grails", "hype", "sartorial", "core"];
var ACTUAL_DESIGNERS = [];
var MARKETS_TO_SCRAPE = [];
var DESIGNERS_TO_SCRAPE = [];
var CATEGORY_SELECTORS = [];
var LOCATIONS_TO_SCRAPE = [];
var CATEGORY_PANEL_SELECTORS = [];
var TRIES = 0;
var TRY_SCROLL_LIMIT = 15;
var scrollNum = 0;
var filter = new gf.GrailedFilter();
var grailedSelectors = new gs.GrailedSelectors();

// Start a new Casper instance connected to grailed.com
casper.start("https://grailed.com/", function () {
  MARKETS_TO_SCRAPE = getListFromCLI("markets", MARKETS).slice();
  DESIGNERS_TO_SCRAPE = getListFromCLI("designers", []).slice();
  LOCATIONS_TO_SCRAPE = getListFromCLI("locations", []).slice();
});

function configureFiltersFromObj(config) {
  casper.sendKeys(grailedSelectors.search["query-input"], config.query);
}

casper.then(function () {
  if (casper.cli.has("q")) {
    var q = casper.cli.raw.get("q");
    casper.sendKeys(grailedSelectors.search["query-input"], q);
    filter.add({ query: q });
  }
});

casper.then(function () {
  if (casper.cli.has('configFile')) {
    var obj = casper.cli.get("configFile");
    var data = JSON.parse(fs.read(obj));
    filter.add(data)
    console.log(JSON.stringify(data));
  }
})

// Grab categorical filters from command line
casper.then(function () {
  configureCategoricalFilter("categories");
  configureCategoricalFilter("sizes");
});

// Click on selectors associated with the categorical filters
casper.then(function () {
  clickSelectors(CATEGORY_PANEL_SELECTORS);
  clickSelectors(CATEGORY_SELECTORS);
});

// Click on location filters
casper.then(function () {
  var locationSelectors = [];
  LOCATIONS_TO_SCRAPE.forEach(function (location, _) {
    locationSelectors.push(grailedSelectors.locations[location]);
  });
  clickSelectors(locationSelectors);
});

// Set min/max price filters
casper.then(function () {
  if (casper.cli.has("min")) {
    // https://stackoverflow.com/a/25014609/8109239
    minPrice = casper.cli.raw.get("min");
    casper.sendKeys(grailedSelectors.prices["min"], minPrice, {
      keepFocus: true
    });
    filter.add({ price: { min: minPrice } });
  }
  if (casper.cli.has("max")) {
    maxPrice = casper.cli.raw.get("max");
    casper.sendKeys(grailedSelectors.prices["max"], maxPrice, {
      keepFocus: true
    });
    filter.add({ price: { max: maxPrice } });
  }
});

// Click on sort filter
casper.then(function () {
  configureSortFilter();
});

// Click on market filters
casper.then(function () {
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
  if (casper.cli.has("numItems")) {
    try {
      var numItems = parseInt(casper.cli.get("numItems"));
      NUM_ITEMS = numItems > 0 ? numItems : NUM_ITEMS;
    } catch (e) {
      casper.log(e);
    }
  }
});

// Determine how many items should be scraped
casper.then(function () {
  if (NUM_ITEMS !== 0 || DESIGNERS_TO_SCRAPE.length === 0) {
    return;
  }
  MARKETS_TO_SCRAPE.forEach(function (marketName) {
    NUM_ITEMS += getMarketItemCount(marketName);
    casper.wait(500);
  });
});

// Scroll to load a number of items equal to NUM_ITEMS
casper.then(function () {
  printFilterDetails();
  casper.echo("[SCRAPE DETAILS]\n");
  if (numFeedItems() > 0) {
    loadFeedItems(null, NUM_ITEMS);
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
  this.echo("\n[FINISHED]");
  if (numFeedItems() > 0) {
    this.echo("\n  TOTAL ITEMS SCRAPED: " + numFeedItems());
  }
  // printMarketFilterDetails();
  if (casper.cli.has("saveFilter")) {
    fs.write("./filter.json", JSON.stringify(filter.config, null, "\t"));
  }
});

casper.run();

function loadConfigFromCLI() {
  if (casper.cli.has("q")) {
    var q = casper.cli.raw.get("q");
    casper.sendKeys(grailedSelectors.search["query-input"], q);
    filter.add({ query: q });
  }
  configureCategoricalFilter("categories");
  configureCategoricalFilter("sizes");
  if (casper.cli.has("min")) {
    // https://stackoverflow.com/a/25014609/8109239
    minPrice = casper.cli.raw.get("min");
  }
  if (casper.cli.has("max")) {
    maxPrice = casper.cli.raw.get("max");
  }
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
function loadFeedItems(prevFeedItemCount, numItems) {
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
      if (numFeedItems() < numItems && TRIES < TRY_SCROLL_LIMIT) {
        loadFeedItems(prevFeedItemCount, numItems);
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

function configureSortFilter() {
  if (casper.cli.has("sort")) {
    var sortFilterName = casper.cli.get("sort");
    if (sortFilterName in grailedSelectors.sort) {
      filter.add({ sort: sortFilterName });
      clickSortFilter(sortFilterName);
    }
  }
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
  casper.echo(getSelectorsFromFilter(filter.config));
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

function getSelectorsFromFilter(filter) {
  var flattened = flattenObject(filter.config);
  for (var path in filter.config) {
    for (var subpath in path.split(".")) {
      console.log(subpath, ",");
    }
    console.log("---------");
  }
}
