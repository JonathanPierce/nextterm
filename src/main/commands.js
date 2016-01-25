var ipc = require("electron").ipcMain,
    pty = require("pty.js"),
    child_process = require("child_process"),
    childMap = {};

// Run a command and print out standard output
ipc.on("run-command", function(event, args) {
    var command = args.command,
        onData, onClose,
        id = args.id;

    // Create the child process
    var child = pty.spawn("bash", ["-c", command], {
        name: 'xterm-color',
        cols: 70,
        rows: 10,
        cwd: process.env.HOME,
        env: process.env
    });

    // Save the child
    childMap[id] = child;

    // Declare removable listeners
    onData = function(text) {
        event.sender.send("new-data", {
            id: id,
            text: text.toString()
        });
    };

    onClose = function(code) {
        // Remove from child map
        childMap[id] = null;

        // Send the close
        event.sender.send("process-close", {
            id: id,
            code: code
        });
    };

    child.on("data", onData);
    child.on("close", onClose);
});

// Write the input to the correct terminal
ipc.on("write-terminal", function(event, args) {
    if(childMap[args.id]) {
        var child = childMap[args.id];

        child.write(args.text);
    }
});
