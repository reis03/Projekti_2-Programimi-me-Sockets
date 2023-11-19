const net = require("net");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function handleUserInput() {
  rl.question("", (userInput) => {
    // console.log(`You entered: ${userInput}`);

    client.write(userInput);
    handleUserInput(); // Repeat the prompt
  });
}

const host = 'localhost';
const port = 3005;
const client = new net.Socket();

client.connect(port, host, () => {
    console.log('Connected to server');
    handleUserInput();
});

client.on('data', (data) => {
  console.log(`${data}`);
  const resp = data.toString();
  if (resp.startsWith("/")) { // is a command
      if (resp.startsWith("/exit")) {
          client.destroy();
      }
  }
});


client.on('close', () => {
  console.log('Connection closed');
  client.destroy();
});

client.on('error', (err) => {
  console.log(`Error: ${err}`)
});
