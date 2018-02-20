var _ = require("underscore");

exports.GrailedFilter = function() {
  var self = this;

  // valid configuration categories
  self.config = {
    designers: [],
    markets: [],
    categories: {},
    sizes: {},
    sort: "",
    locations: [],
    price: {},
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

  self.validate = function() {};
};
