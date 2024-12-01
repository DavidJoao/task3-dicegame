const crypto = require("node:crypto");
const readline = require("readline-sync");
const Table = require("cli-table3");
const secureRandom = require("secure-random");

class RandomNumberGenerator {
  static generateSecureKey() {
    return crypto.randomBytes(32).toString("hex");
  }

  static generateNumberInRange(min, max) {
    const range = max - min + 1;
    const randomBytes = secureRandom(4, { type: 'Buffer' }).readUInt32BE(0);
    const randomValue = randomBytes % range;
    return min + randomValue;
  }
}

class HMACCalculator {
  static calculate(key, value) {
    return crypto.createHmac("sha3-256", key).update(value.toString()).digest("hex");
  }
}

class ProbabilityTable {
  constructor(diceSets) {
    this.diceSets = diceSets;
    this.winProbabilities = this.calculateWinProbabilities();
  }

  calculateWinProbabilities() {
    const probabilities = Array(this.diceSets.length).fill(0).map(() => Array(this.diceSets.length).fill(0));
    for (let i = 0; i < this.diceSets.length; i++) {
      for (let j = 0; j < this.diceSets.length; j++) {
        if (i !== j) {
          probabilities[i][j] = this.calculateWinProbability(this.diceSets[i], this.diceSets[j]);
        }
      }
    }
    return probabilities;
  }

  calculateWinProbability(diceA, diceB) {
    let wins = 0;
    const trials = diceA.length * diceB.length;

    for (const faceA of diceA) {
      for (const faceB of diceB) {
        if (faceA > faceB) wins++;
      }
    }

    return (wins / trials).toFixed(2);
  }

  display() {
    const table = new Table({
      head: ['Dice Set', ...this.diceSets.map((_, index) => `Set ${index}`)],
      colWidths: [10, ...Array(this.diceSets.length).fill(10)]
    });

    this.winProbabilities.forEach((row, i) => {
      table.push([`Set ${i}`, ...row]);
    });

    console.log(table.toString());
  }
}

class GameSetup {
  static initializeDiceSets(args) {
    if (args.length < 3) {
      console.log("You need at least 3 dice sets to play");
      process.exit();
    }
    args.map(arg => {
        if (arg.split(',').length != 6) {
            console.log("Dice sets need to have exactly 6 faces");
            process.exit();
        }
    })
    return args.map((arg) => arg.split(",").map((face) => parseInt(face.trim(), 10)));
  }
}

class UserInputHandler {
  static getGuess(probabilityTable) {
    let userChoice;
    while (true) {
      userChoice = readline.question("Enter your guess 0/1 \n X to exit \n ? for probability table").trim();
      if (userChoice === "X") process.exit();
      if (userChoice === "?") probabilityTable.display();
      else if (userChoice === "0" || userChoice === "1") break;
    }
    return parseInt(userChoice, 10);
  }

  static getDiceChoice(diceSets, probabilityTable) {
    let choice;
    while (true) {
      choice = readline.question("Choose your dice set index (X to exit, ? for probability table): ").trim();
      if (choice === "X") process.exit();
      if (choice === "?") probabilityTable.display();
      else if (!isNaN(choice) && choice >= 0 && choice < diceSets.length) break;
    }
    return parseInt(choice, 10);
  }

  static getModuloInput(probabilityTable) {
    let input;
    while (true) {
      input = readline.questionInt("Add your number modulo 6 (0-5, X to exit, ? for probability table): ");
      if (input === "X") process.exit();
      if (input === "?") probabilityTable.display();
      else if (input >= 0 && input <= 5) break;
    }
    return input;
  }
}

class ResultCalculator {
  static determineWinner(userDiceFace, computerDiceFace) {
    console.log(`__________________________________________ \n`);
    if (userDiceFace > computerDiceFace) {
      console.log("You win!");
    } else if (userDiceFace < computerDiceFace) {
      console.log("Computer wins!");
    } else {
      console.log("It's a tie!");
    }
  }
}

class Game {
  constructor(diceSets) {
    this.diceSets = diceSets;
    this.probabilityTable = new ProbabilityTable(diceSets);
  }

  displayDiceSets() {
    const table = new Table({
      head: ["Index", "Dice Faces"],
      colWidths: [10, 30],
    });

    this.diceSets.forEach((dice, index) => {
      table.push([index, `[${dice.join(", ")}]`]);
    });

    console.log(table.toString());
  }

  userGuessingTurn() {
    console.log("Try to guess my selection:");
    const guess = UserInputHandler.getGuess(this.probabilityTable);
    this.computerSelection = RandomNumberGenerator.generateNumberInRange(0, 1);
    console.log(`Computer HMAC: ${HMACCalculator.calculate(RandomNumberGenerator.generateSecureKey(), this.computerSelection)}`);

    if (guess === this.computerSelection) {
      console.log("Correct guess! You can choose a dice set.");
      this.userTurnFirst = true;
      this.userDiceChoiceTurn();
    } else {
      console.log("Incorrect guess. Computer will choose a dice set.");
      this.computerDiceChoices();
    }
  }

  userDiceChoiceTurn() {
    this.displayDiceSets();
    let diceChoice = UserInputHandler.getDiceChoice(this.diceSets, this.probabilityTable);
    this.userDiceChoice = diceChoice;
    console.log(`You selected dice set: [${this.diceSets[this.userDiceChoice].join(", ")}]`);
    const computerDiceChoice = RandomNumberGenerator.generateNumberInRange(0, this.diceSets.length - 1);
    this.computerDiceChoice = computerDiceChoice;
    console.log(`Computer selected dice set: [${this.diceSets[computerDiceChoice].join(", ")}]`);
    this.modulo6Turn("user");
  }

  computerDiceChoices() {
    const computerDiceChoice = RandomNumberGenerator.generateNumberInRange(0, this.diceSets.length - 1);
    this.computerDiceChoice = computerDiceChoice;
    console.log(`Computer selected dice set: [${this.diceSets[computerDiceChoice].join(", ")}]`);
    this.userDiceChoiceTurn();
  }

  modulo6Turn(turn) {
    if (turn === "user") {
      console.log("User's Turn");
      const userModulo = UserInputHandler.getModuloInput(this.probabilityTable);
      const computerModulo = RandomNumberGenerator.generateNumberInRange(0, 5);
      this.userSelection = userModulo + computerModulo;
      console.log(`Computer chose: ${computerModulo}`);
      console.log(`You chose: ${userModulo}`);
      console.log(`The result is ${userModulo} + ${computerModulo} = ${this.userSelection} (mod 6)`);
      this.userFinalResult = this.userSelection % 6;
      console.log(`Your throw: ${this.diceSets[this.userDiceChoice][this.userFinalResult]}`);

      console.log("Now it's computer's turn to throw");
      const secondComputerModulo = RandomNumberGenerator.generateNumberInRange(0, 5);
      const secondUserModulo = UserInputHandler.getModuloInput(this.probabilityTable);
      this.computerSelection = secondUserModulo + secondComputerModulo;
      console.log(`You chose: ${secondUserModulo}`);
      console.log(`The result is ${secondUserModulo} + ${secondComputerModulo} = ${this.computerSelection} (mod 6)`);
      this.computerFinalResult = this.computerSelection % 6;
      console.log(`Computer's throw: ${this.diceSets[this.computerDiceChoice][this.computerFinalResult]}`);

      ResultCalculator.determineWinner(
        this.diceSets[this.userDiceChoice][this.userFinalResult],
        this.diceSets[this.computerDiceChoice][this.computerFinalResult]
      );
    }
  }
}

const args = process.argv.slice(2);
const diceSets = GameSetup.initializeDiceSets(args);
const game = new Game(diceSets);
game.userGuessingTurn();
