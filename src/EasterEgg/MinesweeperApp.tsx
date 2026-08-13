import React, { useEffect, useState } from "react";
import "./MinesweeperApp.scss";

const ROWS = 9;
const COLS = 9;
const MINES = 10;

export interface CellData {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

const createEmptyBoard = (): CellData[][] => {
  const board: CellData[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: CellData[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push({
        row: r,
        col: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0,
      });
    }
    board.push(row);
  }
  return board;
};

export function MinesweeperApp() {
  const [board, setBoard] = useState<CellData[][]>(createEmptyBoard());
  const [isFirstClick, setIsFirstClick] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [time, setTime] = useState(0);

  const plantMines = (
    board: CellData[][],
    firstRow: number,
    firstCol: number,
  ) => {
    let minesPlanted = 0;

    while (minesPlanted < MINES) {
      const randomRow = Math.floor(Math.random() * ROWS);
      const randomCol = Math.floor(Math.random() * COLS);

      const isNotFirstClick = randomRow !== firstRow || randomCol !== firstCol;
      const hasNoMine = !board[randomRow][randomCol].isMine;

      if (isNotFirstClick && hasNoMine) {
        board[randomRow][randomCol].isMine = true;
        minesPlanted++;
      }
    }
  };

  const calculateAdjacentMines = (board: CellData[][]) => {
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c].isMine) continue;

        let minesCount = 0;

        for (const [dRow, dCol] of directions) {
          const newRow = r + dRow;
          const newCol = c + dCol;

          if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
            if (board[newRow][newCol].isMine) {
              minesCount++;
            }
          }
        }

        board[r][c].adjacentMines = minesCount;
      }
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (
      gameOver ||
      gameWon ||
      board[r][c].isRevealed ||
      board[r][c].isFlagged
    ) {
      return;
    }

    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

    if (isFirstClick) {
      plantMines(newBoard, r, c);
      calculateAdjacentMines(newBoard);
      setIsFirstClick(false);
    }

    if (newBoard[r][c].isMine) {
      newBoard.forEach((row) => {
        row.forEach((cell) => {
          if (cell.isMine) {
            cell.isRevealed = true;
          }
        });
      });

      setGameOver(true);
      setBoard(newBoard);
      return;
    }

    const stack = [[r, c]];

    while (stack.length > 0) {
      const [currR, currC] = stack.pop()!;
      const currentCell = newBoard[currR][currC];

      if (currentCell.isRevealed || currentCell.isFlagged) {
        continue;
      }

      currentCell.isRevealed = true;

      if (currentCell.adjacentMines === 0) {
        const directions = [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
          [1, 1],
        ];

        for (const [dRow, dCol] of directions) {
          const newRow = currR + dRow;
          const newCol = currC + dCol;

          if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
            stack.push([newRow, newCol]);
          }
        }
      }
    }

    setBoard(newBoard);

    let unrevealedCount = 0;
    newBoard.forEach((row) => {
      row.forEach((cell) => {
        if (!cell.isRevealed) unrevealedCount++;
      });
    });

    if (unrevealedCount === MINES) {
      setGameWon(true);
    }
  };

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();

    if (gameOver || gameWon || board[r][c].isRevealed) {
      return;
    }

    const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

    newBoard[r][c].isFlagged = !newBoard[r][c].isFlagged;

    setBoard(newBoard);
  };

  const renderCellContent = (cell: CellData) => {
    if (cell.isRevealed) {
      if (cell.isMine) return "💣";
      if (cell.adjacentMines > 0) return cell.adjacentMines;
      return "";
    } else {
      if (cell.isFlagged) return "🚩";
      return "";
    }
  };

  const getCellClass = (cell: CellData) => {
    const classes = ["ms-cell"];
    if (cell.isRevealed) {
      classes.push("revealed");
      if (!cell.isMine && cell.adjacentMines > 0) {
        classes.push(`color-${cell.adjacentMines}`);
      }
    }
    return classes.join(" ");
  };

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setIsFirstClick(true);
    setGameOver(false);
    setGameWon(false);
    setTime(0);
  };

  const flaggedCount = board.reduce(
    (acc, row) => acc + row.filter((cell) => cell.isFlagged).length,
    0,
  );

  const minesLeft = MINES - flaggedCount;

  let face = "🙂";
  if (gameOver) face = "😵";
  if (gameWon) face = "😎";

  const formatNumber = (num: number) => {
    if (num < 0) return "-" + Math.abs(num).toString().padStart(2, "0");
    return num.toString().padStart(3, "0");
  };

  useEffect(() => {
    let interval: number | undefined;

    if (!isFirstClick && !gameOver && !gameWon) {
      interval = window.setInterval(() => {
        setTime((prevTime) => Math.min(prevTime + 1, 999)); // Максимум 999 секунд
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isFirstClick, gameOver, gameWon]);

  return (
    <div className="minesweeper-wrapper">
      <div className="ms-window">
        <div className="ms-title-bar">
          <span className="ms-title-text">💣 Сапер</span>
        </div>

        <div className="ms-content">
          <div className="ms-scoreboard">
            <div className="ms-digital-display">{formatNumber(minesLeft)}</div>
            <button className="ms-smiley-btn" onClick={resetGame}>
              {face}
            </button>
            <div className="ms-digital-display">{formatNumber(time)}</div>
          </div>
          <div className="ms-board">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="ms-row">
                {row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={getCellClass(cell)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onContextMenu={(e) =>
                      handleRightClick(e, rowIndex, colIndex)
                    }
                  >
                    {renderCellContent(cell)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
