// Functions for handling command history and autocomplete
var Autocomplete,
    ipc = require("electron").ipcMain,
    child_process = require("child_process"),
    fs = require('fs');

Autocomplete = (function() {
    var history, historyJSON,
        addHistory, query, getLocal,
        dateSortFun;

    // When the app loads, try to get the history JSON
    try {
        fs.accessSync("saved_data");
        fs.accessSync("saved_data/history.json");
    } catch(e) {
        fs.mkdirSync("saved_data");
        fs.writeFileSync("saved_data/history.json", "[]", {flag: "w+"});
    }
    historyJSON = fs.readFileSync("saved_data/history.json", {flag: "r+"}).toString().trim() || "[]";
    history = JSON.parse(historyJSON);

    // Function for sorting history entries by date
    dateSortFun = function(a,b) {
        return b.date - a.date;
    };

    // Add a command to the history, and save to disk
    addHistory = function(command) {
        // Create the entry
        var entry = {
            command: command,
            cwd: require("./commands.js").getCWD(),
            date: Date.now()
        }, duplicate = false, i;

        // Check for duplicates, update if found
        for(i = 0; i < history.length; i++) {
            if(history[i].command === command) {
                history[i].date = entry.date;
                history[i].cwd = entry.cwd;
                duplicate = true;
                break;
            }
        }

        // Add to the array if we didn't update
        if(duplicate === false) {
            history.push(entry);
        }

        // Only allow 2,000 entries
        while(history.length > 2000) {
            history.sort(dateSortFun);
            history = history.slice(1);
        }

        // Flush to disk
        historyJSON = JSON.stringify(history);
        fs.writeFile("saved_data/history.json", historyJSON);
    };

    // Retreives local file/folder suggestions based on a prefix
    getLocal = function(prefix, cwd) {
        var parts = prefix.trim().split(" "), last, lastSlashIndex, folder, file, ls_result, results = [];

        if(parts.length > 1 && parts[parts.length - 1].length > 0) {
            last = parts[parts.length - 1];

            if(last !== ".." && last !== ".") {
                lastSlashIndex = last.lastIndexOf("/");

                // Get the working directory and partial file
                if(lastSlashIndex === -1) {
                    folder = "";
                    file = last;
                } else {
                    folder = last.slice(0, lastSlashIndex + 1);
                    file = last.slice(lastSlashIndex + 1);
                }

                // Perform the ls
                ls_result = child_process.spawnSync(
                    "bash",
                    ["-c", "ls " + folder + " | grep \"^" + file + "\""],
                    {cwd: cwd}
                );

                if(ls_result.status === 0) {
                    // Only allow 10 results
                    results = ls_result.stdout.toString().trim().split("\n").slice(0,10);

                    // Put in correct format
                    results = results.map(function(result) {
                        return {
                            command: parts.slice(0,-1).join(" ") + " " + folder + result,
                            bin: 5,
                            date: Date.now()
                        };
                    });
                }
            }
        }

        return results;
    };

    // Query history/autocomplete based on a prefix
    query = function(prefix) {
        var bins = [[],[],[],[]], getBin,
            cwd = require("./commands.js").getCWD(),
            localResults = getLocal(prefix, cwd), combined;

        getBin = function(entry) {
            if(prefix !== "" && entry.command.indexOf(prefix) === 0) {
                if(entry.cwd === cwd) {
                    return 0;
                } else {
                    return 1;
                }
            } else {
                if(entry.cwd === cwd) {
                    return 2;
                } else {
                    return 3;
                }
            }
        };

        // For each history member, send to correct bin
        history.map(function(entry) {
            var bin = getBin(entry);

            bins[bin].push({
                command: entry.command,
                date: entry.date,
                bin: bin
            });
        });

        // Sort each bin
        bins.map(function(bin) {
            bin.sort(dateSortFun);
        });

        // Append them all together
        return bins[0].concat(localResults).concat(bins[1]).concat(bins[2]).concat(bins[3]);
    };

    // Return out the interface
    return {
        addHistory: addHistory,
        query: query
    };
})();

// Handle incoming queries
ipc.on("query-autocomplete", function(event, args) {
    event.sender.send("autocomplete-result", Autocomplete.query(args.prefix));
});

module.exports = Autocomplete;
