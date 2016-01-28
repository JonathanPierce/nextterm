// Handles communication with the main process
var ipc = require("electron").ipcRenderer,
    Command,
    listeners,
    Commands,
    idBase = 0;

listeners = (function() {
    var register, degregister, emit,
        registrations = {};

    ipc.on("new-data", function(event, args) {
        var id = args.id,
            text = args.text;

        emit("data", id, text);
    });

    ipc.on("process-close", function(event, args) {
        var id = args.id,
            code = args.code;

        emit("close", id, code);
    });

    // Start listening for events for this process
    register = function(id, listeners) {
        registrations[id] = {};

        for(var key in listeners) {
            if(listeners.hasOwnProperty(key)) {
                registrations[id][key] = listeners[key];
            }
        }
    };

    deregister = function(id) {
        registrations[id] = null;
    };

    emit = function(event, id, args) {
        var registration;

        // Id the ID is still registered....
        if(registrations[id]) {
            registration = registrations[id];

            if(registration[event]) {
                // If this event is there, do it...
                registration[event](args);
            }
        }
    }

    // Return out the interface
    return {
        register: register,
        deregister: deregister
    };
})();

Command = function(command) {
    var id, onData, onClose, write, registered = {},
        register, kill;

    // generate a unique id
    id = idBase; idBase++;

    // Listeners
    onData = function(text) {
        // Emit to outside listener
        registered.data && registered.data(text);
    };

    onClose = function(code) {
        // Deregister any listeners
        listeners.deregister(id);

        // TEMP
        console.log("CLOSED " + id + " with code " + code);

        // Did the working directory change?
        var newCWD = null, isCD = Commands.isCD(command);
        if(code === 0 && isCD !== null) {
            // Change the working directory
            ipc.send("change-cwd", {
                dir: isCD
            });
        }

        // Emit to outside listener
        registered.close && registered.close(code);
    };

    // Register listeners
    listeners.register(id, {
        data: onData,
        close: onClose
    });

    // Tell main to run the command
    ipc.send("run-command", {
        id: id,
        command: command
    });

    // Write data to the Terminal
    write = function(text) {
        ipc.send("write-terminal", {
            id: id,
            text: text
        });
    };

    // Kill the program
    kill = function() {
        ipc.send("kill-program", {
            id: id
        });
    }

    // Register listeners
    register = function(handlers) {
        registered = handlers;
    };

    // Return out the interface
    return {
        id: id,
        write: write,
        command: command,
        register: register,
        kill: kill
    };
};

Commands = {
    runCommand: function(command) {
        // Create a new command instance
        return Command(command);
    },
    isCD: function(command) {
        // Returns the last working directory from a command
        var parts = command.split(" ");
        if(parts[0] === "cd" && parts.length === 2) {
            return parts[1];
        }
        return null;
    }
};

module.exports = Commands;
