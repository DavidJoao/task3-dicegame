# Task #3 ITransition

Youtube Video: https://youtu.be/eZ88Whqkl7U

### Technologies Used
- Node.js

### Requirements
- Require 3 sets of dices separated by commas (1,2,3,4,5,6)
- Check arguments and require minimum 3 sets of dice, and check each set has exactly 6 faces.
- Determine first turn by generating a number between 0 and 1 and make the user choose.
- Users need to select dice set using a CLI menu and generate a random value with help of the computer.
- Random value should be provable fair.
- To obtain the value generate a cryptographically secure random key with a length of at least 256 bits.
- Display also secret keys when computer selects a value.
- Include "?" for help and "X" to exit as options in the menu.
- When you select "?" display a table that show the probabilities of winning for each pair of dice.
- Use 6-9 classes to create the game.

### External Libraries Used
- cli-table3
- secure-random