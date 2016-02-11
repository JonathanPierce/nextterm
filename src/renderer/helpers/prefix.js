var ngModule = require("../ngModule");

ngModule.filter("prefix", function() {
    return function(input, prefix) {
        if(input.indexOf(prefix) === -1) {
            return ""; // no match
        } else {
            return prefix; // return the prefix
        }
    };
});
