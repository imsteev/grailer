var _ = require('underscore');

exports.GrailedFilter = function() {
    var self = this;

    self.config = {
        "designers": [], // list of designers
        "markets": [], //hype, core, grailed, sartorial
        "categories": {}, // tops, bottoms, outerwear, footwear, tailoring, accessories
        "sizes": {},
        "sort": [], // default, new, low price, high price, popular
        "locations" : [], // U.S, Canada, United Kingdom, Europe, Asia, Austrailia/NZ, Other
        "price": {}, // min, max
    }

    self.addToFilter = function(params) {
        for (var item in params) {
            if (!(item in self.config)) continue;
            var originalField = self.config[item];
            var newField = params[item]

            if (Array.isArray(originalField)) {
                var noDups = newField.filter(function (item) {
                    return originalField.indexOf(item) < 0;
                })
                self.config[item] = self.config[item].concat(noDups);
            } else {
                
                for (var innerItem in newField) {
                    if (!(innerItem in originalField)) {
                        self.config[item][innerItem] = newField[innerItem]
                    } else {
                        var collection = originalField[innerItem];
                        var noDups = newField[innerItem].filter(function (item) {
                            return collection.indexOf(item) < 0;
                        })
                        self.config[item][innerItem] = originalField[innerItem].concat(noDups);
                    }
                }
            }
        }
    }

    self.validate = function() {
        
    }
}