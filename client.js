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
