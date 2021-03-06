import minimax from "@christianjuth/minimax";

export declare namespace TicTacToe {
  type GameState = string[];
}

export const printBoard = (gameState: TicTacToe.GameState) => {
  let line = "";
  for (let i = 1; i < 10; i++) {
    line += gameState[i - 1] || " ";
    if (i % 3 === 0) {
      if (i > 3) {
        console.log("---------");
      }
      console.log(line);
      line = "";
    } else {
      line += " | ";
    }
  }
};

export function checkWinner(
  gameState: TicTacToe.GameState
): "X" | "O" | "" | undefined {
  const winningCellCombinations = [
    // horizontal
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // vertical
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // diagnol
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const combination of winningCellCombinations) {
    const string = combination.map((index) => gameState[index]).join("");
    if (/(X{3}|O{3})/.test(string)) {
      return string[0] as "X" | "O" | "";
    }
  }

  if (gameState.filter((cell) => !cell).length === 0) {
    return "";
  }
  return;
}

export function whosMove(gameState: TicTacToe.GameState) {
  return gameState.filter(Boolean).length % 2 === 0 ? "X" : "O";
}

export function getNextMoves(gameState: TicTacToe.GameState) {
  if (checkWinner(gameState) !== undefined) {
    return [];
  }

  const player = whosMove(gameState);
  const nextGameStates: TicTacToe.GameState[] = [];

  for (let i = 0; i < gameState.length; i++) {
    if (gameState[i] === "") {
      const newState = [...gameState];
      newState[i] = player;
      nextGameStates.push(newState);
    }
  }

  return nextGameStates;
}

export function getBestMoveMiniMax(gameState: TicTacToe.GameState) {
  const player = whosMove(gameState);

  return minimax({
    gameState,
    player,
    getNextGameState: getNextMoves,
    leafEvaluator: ({ gameState, player, level }) => {
      const winner = checkWinner(gameState);
      // Positive value if we won this game.
      // We divide by level to encourage paths
      // that lead to a win in less moves.
      if (winner === player) return 9 - level;
      // Zero means draw
      if (!winner) return 0;
      // Negative number if the opponent won
      return -(9 - level);
    },
    hashGameState: (gameState) => gameState.join(","),
    randomizeNextGameStateOrder: true,
  });
}

export function predictWinner(gameState: TicTacToe.GameState) {
  const winner = checkWinner(gameState);
  if (winner !== undefined) {
    return winner || undefined;
  }

  const player = whosMove(gameState);
  const oponent = player === "X" ? "O" : "X";

  const evaluation = getBestMoveMiniMax(gameState).value!;

  if (evaluation > 0) {
    return player;
  } else if (evaluation < 0) {
    return oponent;
  } else {
    return;
  }
}
