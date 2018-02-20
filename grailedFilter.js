exports.GrailedFilter = function() {
  var self = this;

  self.config = {
    designers: [],
    markets: [],
    locations: [],
    categories: {},
    sizes: {},
    price: {},
    sort: "",
    query: ""
  };

  self.add = function(params) {
    for (var item in params) {
      if (!(item in self.config)) continue;
      var originalField = self.config[item];
      var newField = params[item];

      if (Array.isArray(originalField)) {
        var noDups = newField.filter(function(item) {
          return originalField.indexOf(item) < 0;
        });
        self.config[item] = self.config[item].concat(noDups);
      } else if (typeof originalField == "object") {
        for (var innerItem in newField) {
          if (!(innerItem in originalField)) {
            self.config[item][innerItem] = newField[innerItem];
          } else {
            var collection = originalField[innerItem];
            var noDups = newField[innerItem].filter(function(item) {
              return collection.indexOf(item) < 0;
            });
            self.config[item][innerItem] = originalField[innerItem].concat(
              noDups
            );
          }
        }
      } else {
        self.config[item] = newField;
      }
    }
  };

  self.validate = function(config) {
    if (typeof config !== "object") return false;
    var validFilters = [
      "designers",
      "markets",
      "sort",
      "query",
      "price",
      "locations",
      "categories",
      "sizes"
    ];
    var configKeys = Object.keys(config);
    for (var i = 0; i < configKeys.length; i++) {
      if (validFilters.indexOf(configKeys[i]) == -1) {
        return false;
      }
    }
    return true;
  };

  self.setConfig = function(newConfig) {
    if (!self.validate(newConfig)) throw "not a valid configuration";
    self.config = newConfig;
  };
};
