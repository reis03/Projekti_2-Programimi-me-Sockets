var net = require("net");
var server = net.createServer();
const port = 3005;
const host = "localhost"; //192.168.0.1
const clientArray = []; // might need it later to propagate messages to all clients/other clients
let clientCounter = 0;
const authenticatedClients = [];

const fs = require("fs");

server.listen(port, host, () => {
  console.log(`TCP server listening on ${host}:${port}`);
});

server.on("connection", (socket) => {
  //when new clients are added
  var clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(
    `new client connected: Client ${clientCounter + 1} - ${clientAddress}`
  );
  clientArray.push(socket); // add client to the array
  clientCounter++;

  socket.on("data", (data) => {
    const request = data.toString(); // Parse the incoming data as a string
    clientArray.push(socket);
    console.log(`Client ${clientCounter} - ${clientAddress} : ${request}`);
    if (request.startsWith("/")) {
      // is a command
      commandHandler(request, socket);
    } else {
      //is a text
      socket.write(`Server received : ${request}`);
    }
  });

  socket.on("error", (err) => {
    console.log(`${clientAddress} : ${err}`);
  });

  socket.on("close", () => {
    clientArray.splice(clientArray.indexOf(socket), 1);
    authenticatedClients.splice(authenticatedClients.indexOf(socket), 1);
    console.log(`connection from ${clientCounter} - ${clientAddress} closed`);
    clientCounter--;
  });
});

function commandHandler(commandsArray, socket) {
  const commands = commandsArray.split(" ");
  const req = commands[0];
  const isAuthenticated = authenticatedClients.includes(socket);

  if (req === "/read") {
    if (!checkLengthOfCommandArray(commandsArray)) {
        socket.write("Invalid arguments.");
        return;
    }

    const filename = commands[1];
    if (fs.existsSync(filename)) {
        const content = fs.readFileSync(filename, 'utf8');
        socket.write(`The file contains: ${content}`);
    } else {
        socket.write("File does not exist.");
    }
} else if (req === "/write" || req === "/execute") { // combined in 1 if statement because both require elevated perms
    if (!isAuthenticated || !checkLengthOfCommandArray(commandsArray)) {
        socket.write(!isAuthenticated ? "Unauthorized." : "Invalid arguments.");
        return;
    }

      if (req === "/write") {
        const filename = commands[1];
      const text = commands.slice(2).join(" ");
      fs.writeFile(filename, text, function (err) {
          if (err) throw err;
          console.log('Saved!');
      });

    } else {
        fs.open(filename, 'r', (err, fd) => {
            if (err) throw err;
            fs.fstat(fd, (err, stats) => {
                if (err) throw err;
                console.log(`File opened successfully with file descriptor: ${fd}`);
            });
            socket.write(`The file was executed: ${filename}`);
        });
      }
} else if (req === "/exit") {
    socket.write("/exit"); // sends it back just to close the loop back in client
    socket.end();
} else if (req === "/list") {
    //add logic to list all clients in the socket servers
} else if (req === "/password") {
    if (!checkLengthOfCommandArray(commandsArray)) {
        socket.write("Invalid arguments.");
        return;
    }
    const password = commands[1]; //commands[1].trim();
    if (password === 'mysecretpassword' && authenticatedClients.length < 1) {
        authenticatedClients.push(socket);
        socket.write('Welcome! You are now authenticated.');
    } else {
        if (authenticatedClients.length > 0) {
            socket.write('Error.');
        } else {
            socket.write('Invalid response.');
        }
    }
} else {
    socket.write('400: Invalid command');
}
return;
}


function checkLengthOfCommandArray(commandsArray) {
  return commandsArray.length >= 2;
}