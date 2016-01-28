// Complies SCSS. See quickrun.sh.

var sass = require("node-sass"),
    fs = require("fs");

sass.render({
    file: "renderer/style/main.scss"
}, function(err, result) {
    if(err) {
        console.log(err);
        return;
    }

    fs.writeFile("renderer/style/style.css", result.css, function(err){
        if(!err){
            console.log("\nCSS compiled sucessfully!\n");
        } else {
            console.log("\nCSS failed to compile. :(\n");
        }
    });
});
