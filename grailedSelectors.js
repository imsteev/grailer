exports.DESIGNER_SEARCH = ".designer-search-wrapper input";
exports.DESIGNER_SEARCH_LIST = ".designer-search-wrapper .designer-list";
exports.DESIGNER_SEARCH_LIST_RESULTS =
  ".designer-search-wrapper .designer-list .designer .active-indicator:nth-child(1)";
exports.DESIGNER_SEARCH_SELECTOR = ".designer-search-wrapper input";
exports.DESIGNER_SEARCH_LIST_SELECTOR =
  ".designer-search-wrapper .designer-list";
exports.MIN_PRICE = ".price-wrapper .price-min-wrapper input";
exports.MAX_PRICE = ".price-wrapper .price-max-wrapper input";
exports.QUERY = "div.waypoint-wrapper > div > div > form > label > input";

exports.MARKET = {
  grails: ".strata-wrapper div.active-indicator:nth-child(1)",
  hype: ".strata-wrapper div.active-indicator:nth-child(2)",
  sartorial: ".strata-wrapper div.active-indicator:nth-child(3)",
  core: ".strata-wrapper div.active-indicator:nth-child(4)"
};

exports.SORT = {
  dropdown: "h3.drop-down-title",
  default: ".sort .drop-down-toggle h3:nth-child(1)",
  new: ".sort .drop-down-toggle h3:nth-child(2)",
  low: ".sort .drop-down-toggle h3:nth-child(3)",
  high: ".sort .drop-down-toggle h3:nth-child(4)",
  popular: ".sort .drop-down-toggle h3:nth-child(5)"
};

exports.CATEGORIES = {
  tops: {
    panel:
      ".categories-wrapper .tops-wrapper .filter-category-item-header h3 span:nth-child(1)",
    all:
      ".categories-wrapper .tops-wrapper .filter-category-item-header .active-indicator",
    longsleeve:
      ".categories-wrapper .tops-wrapper > p.active-indicator:nth-of-type(1)",
    polos:
      ".categories-wrapper .tops-wrapper > p.active-indicator:nth-of-type(2)",
    shirts:
      ".categories-wrapper .tops-wrapper > p.active-indicator:nth-of-type(3)",
    tshirts:
      ".categories-wrapper .tops-wrapper > p.active-indicator:nth-of-type(4)",
    sweaters:
      ".categories-wrapper .tops-wrapper > p.active-indicator:nth-of-type(5)",
    sweatshirts:
      ".categories-wrapper .tops-wrapper > p.active-indicator:nth-of-type(6)",
    sleeveless:
      ".categories-wrapper .tops-wrapper > p.active-indicator:nth-of-type(7)",
    jerseys:
      ".categories-wrapper .tops-wrapper > p.active-indicator:nth-of-type(8)"
  },
  bottoms: {
    panel:
      ".categories-wrapper .bottoms-wrapper .filter-category-item-header h3 span:nth-child(1)",
    all:
      ".categories-wrapper .bottoms-wrapper .filter-category-item-header .active-indicator",
    casual:
      ".categories-wrapper .bottoms-wrapper > p.active-indicator:nth-of-type(1)",
    cropped:
      ".categories-wrapper .bottoms-wrapper > p.active-indicator:nth-of-type(2)",
    denim:
      ".categories-wrapper .bottoms-wrapper > p.active-indicator:nth-of-type(3)",
    leggings:
      ".categories-wrapper .bottoms-wrapper > p.active-indicator:nth-of-type(4)",
    jumpsuits:
      ".categories-wrapper .bottoms-wrapper > p.active-indicator:nth-of-type(5)",
    shorts:
      ".categories-wrapper .bottoms-wrapper > p.active-indicator:nth-of-type(6)",
    sweatpants:
      ".categories-wrapper .bottoms-wrapper > p.active-indicator:nth-of-type(7)",
    swimwear:
      ".categories-wrapper .bottoms-wrapper > p.active-indicator:nth-of-type(8)"
  },
  outerwear: {
    panel:
      ".categories-wrapper .outerwear-wrapper .filter-category-item-header h3 span:nth-child(1)",
    all:
      ".categories-wrapper .outerwear-wrapper .filter-category-item-header .active-indicator",
    bombers:
      ".categories-wrapper .outerwear-wrapper > p.active-indicator:nth-of-type(1)",
    cloaks:
      ".categories-wrapper .outerwear-wrapper > p.active-indicator:nth-of-type(2)",
    denim:
      ".categories-wrapper .outerwear-wrapper > p.active-indicator:nth-of-type(3)",
    heavy:
      ".categories-wrapper .outerwear-wrapper > p.active-indicator:nth-of-type(4)",
    leather:
      ".categories-wrapper .outerwear-wrapper > p.active-indicator:nth-of-type(5)",
    light:
      ".categories-wrapper .outerwear-wrapper > p.active-indicator:nth-of-type(6)",
    parkas:
      ".categories-wrapper .outerwear-wrapper > p.active-indicator:nth-of-type(7)",
    raincoats:
      ".categories-wrapper .outerwear-wrapper > p.active-indicator:nth-of-type(8)",
    vests:
      ".categories-wrapper .outerwear-wrapper > p.active-indicator:nth-of-type(9)"
  },
  footwear: {
    panel:
      ".categories-wrapper .footwear-wrapper .filter-category-item-header h3 span:nth-child(1)",
    all:
      ".categories-wrapper .footwear-wrapper .filter-category-item-header .active-indicator",
    boots:
      ".categories-wrapper .footwear-wrapper > p.active-indicator:nth-of-type(1)",
    casual:
      ".categories-wrapper .footwear-wrapper > p.active-indicator:nth-of-type(2)",
    formal:
      ".categories-wrapper .footwear-wrapper > p.active-indicator:nth-of-type(3)",
    hitop:
      ".categories-wrapper .footwear-wrapper > p.active-indicator:nth-of-type(4)",
    lotop:
      ".categories-wrapper .footwear-wrapper > p.active-indicator:nth-of-type(5)",
    sandals:
      ".categories-wrapper .footwear-wrapper > p.active-indicator:nth-of-type(6)",
    slipOns:
      ".categories-wrapper .footwear-wrapper > p.active-indicator:nth-of-type(7)"
  },
  tailoring: {
    panel:
      ".categories-wrapper .tailoring-wrapper .filter-category-item-header h3 span:nth-child(1)",
    all:
      ".categories-wrapper .tailoring-wrapper .filter-category-item-header .active-indicator",
    blazers:
      ".categories-wrapper .tailoring-wrapper > p.active-indicator:nth-of-type(1)",
    formalShirting:
      ".categories-wrapper .tailoring-wrapper > p.active-indicator:nth-of-type(2)",
    formalTrousers:
      ".categories-wrapper .tailoring-wrapper > p.active-indicator:nth-of-type(3)",
    suits:
      ".categories-wrapper .tailoring-wrapper > p.active-indicator:nth-of-type(4)",
    tuxedos:
      ".categories-wrapper .tailoring-wrapper > p.active-indicator:nth-of-type(5)",
    vests:
      ".categories-wrapper .tailoring-wrapper > p.active-indicator:nth-of-type(6)"
  },
  accessories: {
    panel:
      ".categories-wrapper .accessories-wrapper .filter-category-item-header h3 span:nth-child(1)",
    all:
      ".categories-wrapper .accessories-wrapper .filter-category-item-header .active-indicator",
    bags:
      ".categories-wrapper .accessories-wrapper > p.active-indicator:nth-of-type(1)",
    belts:
      ".categories-wrapper .accessories-wrapper > p.active-indicator:nth-of-type(2)",
    glasses:
      ".categories-wrapper .accessories-wrapper > p.active-indicator:nth-of-type(3)",
    glovesAndScarves:
      ".categories-wrapper .accessories-wrapper > p.active-indicator:nth-of-type(4)",
    hats:
      ".categories-wrapper .accessories-wrapper > p.active-indicator:nth-of-type(5)",
    jeweleryAndWatches:
      ".categories-wrapper .accessories-wrapper > p.active-indicator:nth-of-type(6)",
    wallets:
      ".categories-wrapper .accessories-wrapper > p.active-indicator:nth-of-type(7)",
    misc:
      ".categories-wrapper .accessories-wrapper > p.active-indicator:nth-of-type(8)",
    periodicals:
      ".categories-wrapper .accessories-wrapper > p.active-indicator:nth-of-type(9)",
    socksAndUnderwear:
      ".categories-wrapper .accessories-wrapper > p.active-indicator:nth-of-type(10)",
    sunglasses:
      ".categories-wrapper .accessories-wrapper > p.active-indicator:nth-of-type(11)",
    supreme:
      ".categories-wrapper .accessories-wrapper > p.active-indicator:nth-of-type(12)",
    tiesAndPocketSquares:
      ".categories-wrapper .accessories-wrapper > p.active-indicator:nth-of-type(13)"
  }
};

exports.SIZES = {
  tops: {
    panel:
      ".sizes-wrapper > div.filter-bottom.checkboxes > span:nth-child(1) > div > h3 > span:nth-child(1)",
    XXS:
      ".sizes-wrapper .sizes.tops.outerwear > p.active-indicator:nth-of-type(1)",
    XS:
      ".sizes-wrapper .sizes.tops.outerwear > p.active-indicator:nth-of-type(2)",
    S:
      ".sizes-wrapper .sizes.tops.outerwear > p.active-indicator:nth-of-type(3)",
    M:
      ".sizes-wrapper .sizes.tops.outerwear > p.active-indicator:nth-of-type(4)",
    L:
      ".sizes-wrapper .sizes.tops.outerwear > p.active-indicator:nth-of-type(5)",
    XL:
      ".sizes-wrapper .sizes.tops.outerwear > p.active-indicator:nth-of-type(6)",
    XXL:
      ".sizes-wrapper .sizes.tops.outerwear > p.active-indicator:nth-of-type(7)"
  },
  bottoms: {
    panel:
      ".sizes-wrapper > div.filter-bottom.checkboxes > span:nth-child(2) > div > h3 > span:nth-child(1)",
    26: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(1)",
    27: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(2)",
    28: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(3)",
    29: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(4)",
    30: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(5)",
    31: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(6)",
    32: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(7)",
    33: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(8)",
    34: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(9)",
    35: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(10)",
    36: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(11)",
    37: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(12)",
    38: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(13)",
    39: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(14)",
    40: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(15)",
    41: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(16)",
    42: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(17)",
    43: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(18)",
    44: ".sizes-wrapper .sizes.bottoms > p.active-indicator:nth-of-type(19)"
  },
  footwear: {
    panel:
      ".sizes-wrapper > div.filter-bottom.checkboxes > span:nth-child(3) > div > h3 > span:nth-child(1)",
    "5": ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(1)",
    "5.5": ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(2)",
    "6": ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(3)",
    "6.5": ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(4)",
    "7": ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(5)",
    "7.5": ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(6)",
    "8": ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(7)",
    "8.5": ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(8)",
    "9": ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(9)",
    "9.5":
      ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(10)",
    "10": ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(11)",
    "10.5":
      ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(12)",
    "11": ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(13)",
    "11.5":
      ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(14)",
    "12": ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(15)",
    "12.5":
      ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(16)",
    "13": ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(17)",
    "14": ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(18)",
    "15": ".sizes-wrapper .sizes.footwear > p.active-indicator:nth-of-type(19)"
  },
  tailoring: {
    panel:
      ".sizes-wrapper > div.filter-bottom.checkboxes > span:nth-child(4) > div > h3 > span:nth-child(1)",
    "34S":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(1)",
    "34R":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(2)",
    "36S":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(3)",
    "36R":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(4)",
    "38S":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(5)",
    "38R":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(6)",
    "38L":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(7)",
    "40S":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(8)",
    "40R":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(9)",
    "40L":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(10)",
    "42S":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(11)",
    "42R":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(12)",
    "42L":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(13)",
    "44S":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(14)",
    "44R":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(15)",
    "44L":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(16)",
    "46S":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(17)",
    "46R":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(18)",
    "46L":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(19)",
    "48S":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(20)",
    "48R":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(21)",
    "48L":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(22)",
    "50S":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(23)",
    "50R":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(24)",
    "50L":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(25)",
    "52S":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(26)",
    "52R":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(27)",
    "52L":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(28)",
    "54R":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(29)",
    "54L":
      ".sizes-wrapper .sizes.tailoring > p.active-indicator:nth-of-type(30)"
  },
  accessories: {
    panel:
      ".sizes-wrapper > div.filter-bottom.checkboxes > span:nth-child(5) > div > h3 > span:nth-child(1)",
    OS: ".sizes-wrapper .sizes.accessories > p.active-indicator:nth-of-type(1)",
    26: ".sizes-wrapper .sizes.accessories > p.active-indicator:nth-of-type(2)",
    28: ".sizes-wrapper .sizes.accessories > p.active-indicator:nth-of-type(3)",
    30: ".sizes-wrapper .sizes.accessories > p.active-indicator:nth-of-type(4)",
    32: ".sizes-wrapper .sizes.accessories > p.active-indicator:nth-of-type(5)",
    34: ".sizes-wrapper .sizes.accessories > p.active-indicator:nth-of-type(6)",
    36: ".sizes-wrapper .sizes.accessories > p.active-indicator:nth-of-type(7)",
    38: ".sizes-wrapper .sizes.accessories > p.active-indicator:nth-of-type(8)",
    40: ".sizes-wrapper .sizes.accessories > p.active-indicator:nth-of-type(9)",
    42: ".sizes-wrapper .sizes.accessories > p.active-indicator:nth-of-type(10)",
    44: ".sizes-wrapper .sizes.accessories > p.active-indicator:nth-of-type(11)",
    46: ".sizes-wrapper .sizes.accessories > p.active-indicator:nth-of-type(12)"
  }
};

exports.LOCATIONS = {
  US: ".locations-wrapper div.active-indicator:nth-of-type(1)",
  Canada: ".locations-wrapper div.active-indicator:nth-of-type(2)",
  UK: ".locations-wrapper div.active-indicator:nth-of-type(3)",
  EU: ".locations-wrapper div.active-indicator:nth-of-type(4)",
  Asia: ".locations-wrapper div.active-indicator:nth-of-type(5)",
  Aus: ".locations-wrapper div.active-indicator:nth-of-type(6)",
  Other: ".locations-wrapper div.active-indicator:nth-of-type(7)"
};

exports.DEBUG = {
  markets: {
    grails: ".strata-wrapper .active-indicator:nth-child(1)",
    hype: ".strata-wrapper .active-indicator:nth-child(2)",
    sartorial: ".strata-wrapper .active-indicator:nth-child(3)",
    core: ".strata-wrapper .active-indicator:nth-child(4)"
  },
  sizes: {
    footwear: {
      all:
        ".categories-wrapper .footwear-wrapper .filter-category-item-header p"
    }
  }
};
