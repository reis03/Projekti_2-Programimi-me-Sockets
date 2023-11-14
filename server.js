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
