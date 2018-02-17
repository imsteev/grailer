var _ = require('underscore');

exports.GrailedFilter = function() {
    var self = this;

    self.filter = {
        "designers": [], // list of designers
        "markets": [], //hype, core, grailed, sartorial
        "categories": {}, // tops, bottoms, outerwear, footwear, tailoring, accessories
        "sort": [], // default, new, low price, high price, popular
        "locations" : [], // U.S, Canada, United Kingdom, Europe, Asia, Austrailia/NZ, Other
        "price": {}, // min, max
    }

    self.addToFilter = function(params) {
        for (var item in params) {
            if (!(item in self.filter)) continue;
            var originalField = self.filter[item];
            var newField = params[item]

            if (Array.isArray(originalField)) {
                var noDups = newField.filter(function (item) {
                    return originalField.indexOf(item) < 0;
                })
                self.filter[item] = self.filter[item].concat(noDups);
            } else {
                
                for (var innerItem in newField) {
                    if (!(innerItem in originalField)) {
                        self.filter[item][innerItem] = newField[innerItem]
                    } else {
                        var collection = originalField[innerItem];
                        var noDups = newField[innerItem].filter(function (item) {
                            return collection.indexOf(item) < 0;
                        })
                        self.filter[item][innerItem] = originalField[innerItem].concat(noDups);
                    }
                }
            }
        }
    }
}