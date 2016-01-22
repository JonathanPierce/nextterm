var ipc = require("electron").ipcMain,
    child_process = require("child_process");

// Run a command and print out standard output
ipc.on("run-command", function(event, args) {
    var command = args.command,
        onStdout, onStderr,
        id = args.id;

    // Create the child process
    var child = child_process.spawn("bash", ["-c", command]);

    // Declare removable listeners
    onStdout = function(text) {
        event.sender.send("new-stdout", {
            id: id,
            text: text.toString()
        });
    };

    onStderr = function(text) {
        event.sender.send("new-stderr", {
            id: id,
            text: text.toString()
        });
    };

    // Hook up listeners
    child.stdout.on("data", onStdout);
    child.stderr.on("data", onStderr);
    child.once("close", function(code) {
        // Remove listeners
        child.stdout.removeListener("data", onStdout);
        child.stderr.removeListener("data", onStderr);

        // Send the close
        event.sender.send("process-close", {
            id: id,
            code: code
        });
    });

});
