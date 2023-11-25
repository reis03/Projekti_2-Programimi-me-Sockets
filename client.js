const net = require("net");
const readline = require("readline");

let waitingForResponse = false

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function handleUserInput() {
  rl.question("", async (userInput) => {
    if (waitingForResponse) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return handleUserInput();
    }
    client.write(userInput);
    waitingForResponse = true
    if (userInput === "/exit") {
      client.end();
      client.destroy();
      rl.close();
      return;
    }
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
  waitingForResponse = false
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

