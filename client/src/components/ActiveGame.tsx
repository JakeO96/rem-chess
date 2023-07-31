import { Piece, Pawn, Rook, Knight, Bishop, Queen, King, grid } from '../utils/game-utils'
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { GameContext } from "../context/GameContext";
import blackPawn from '../utils/game-piece-graphics/black-pawn.svg';
import blackKing from '../utils/game-piece-graphics/black-king.svg';
import blackQueen from '../utils/game-piece-graphics/black-queen.svg';
import blackBishop from '../utils/game-piece-graphics/black-bishop.svg';
import blackKnight from '../utils/game-piece-graphics/black-knight.svg';
import blackRook from '../utils/game-piece-graphics/black-rook.svg';
import whitePawn from '../utils/game-piece-graphics/white-pawn.svg';
import whiteKing from '../utils/game-piece-graphics/white-king.svg';
import whiteQueen from '../utils/game-piece-graphics/white-queen.svg';
import whiteBishop from '../utils/game-piece-graphics/white-bishop.svg';
import whiteKnight from '../utils/game-piece-graphics/white-knight.svg';
import whiteRook from '../utils/game-piece-graphics/white-rook.svg';

const pieceSVGs = {
  blackPawn: blackPawn,
  blackKing: blackKing,
  blackQueen: blackQueen,
  blackBishop: blackBishop,
  blackKnight: blackKnight,
  blackRook: blackRook,
  whitePawn: whitePawn,
  whiteKing: whiteKing,
  whiteQueen: whiteQueen,
  whiteBishop: whiteBishop,
  whiteKnight: whiteKnight,
  whiteRook: whiteRook,
}


interface GameState {
  [key: string]: [Piece | null, number];
}

interface ChessBoardProps {
  gameState: GameState;
  grid: string[][];
}

const produceEmptyBoard = () => {
  let cordCount = 0;
  const newGameState: GameState = {};
  for (const col of grid) {
    for (const cord of col) {
      newGameState[cord] = [null, cordCount];
    }
    cordCount += 1;
  }
  return newGameState;
}

export const ActiveGame: React.FC<{}> = () => {

  const { initiatingUser: player1, receivingUser: player2 } = useContext(GameContext);
  const [gameState, setGameState] = useState<GameState>(produceEmptyBoard());
  

  const setPiecesOnBoard = useCallback(() => {
    if (player1 && player2) {
      const allPieces = player1.alive.concat(player2.alive);
      const allPositions = allPieces.map(p => p.position);
      const newGameState = {...gameState};
      for (const spot in newGameState) {
        if (allPositions.includes(spot)) {
          for (const p of allPieces) {
            if (p.position === spot) {
              newGameState[spot][0] = p;
            }
          }
        }
      }
      setGameState(newGameState);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player1, player2]);

  const process_move = (start: string, end: string): boolean => {
    let copy_state = {...gameState};
    let adj_start = start[0] + ((parseInt(start[1]) - 1).toString());
    let adj_end = end[0] + ((parseInt(end[1]) - 1).toString());
    let start_col = gameState[adj_start][1];
    let start_row = 7 - parseInt(adj_start[1]);

    let piece = copy_state[adj_start][0];
    let all_moves: string[] = [];
    // find what piece we are moving
    if (piece instanceof Pawn) {
        all_moves = piece.validPawnMoves(grid, gameState, start_col, start_row);
    } else if (piece instanceof Knight) {
        all_moves = piece.validKnightMoves(grid, gameState, start_col, start_row);
    } else if (piece instanceof Rook) {
        all_moves = piece.get_all_straight(grid, gameState, start_col, start_row);
    } else if (piece instanceof Bishop) {
        all_moves = piece.get_all_diagonal(grid, gameState, start_col, start_row);
    } else if (piece instanceof Queen) {
        all_moves = piece.get_all_straight(grid, gameState, start_col, start_row)
            .concat(piece.get_all_diagonal(grid, gameState, start_col, start_row));
    } else if (piece instanceof King) {
        all_moves = piece.validKingMoves(grid, gameState, start_col, start_row);
    }

    if (all_moves.includes(adj_end)) {
      // if the piece moving is taking an opponents piece
      if (copy_state[adj_end][0] !== null) {
        const piece = copy_state[adj_end][0];
        // update the alive and grave list for player losing a piece
        if (piece && player1 && player2) {
          if (player1.alive.includes(piece)) {
            player1.grave.push(piece);
            player1.alive = player1.alive.filter(item => item !== piece);
          } else {
            player2.grave.push(piece);
            player2.alive = player2.alive.filter(item => item !== piece);
          }
        }
      }

      // update the positions of the pieces on the board
      copy_state[adj_end][0] = copy_state[adj_start][0];
      copy_state[adj_start][0] = null;
      if (copy_state[adj_end][0] !== null) {
        let piece = copy_state[adj_end][0];
        if (piece) {
          piece.position = adj_end;
          if (player1 === piece.player) {
            player1.alive.forEach((p) => {
                if (p.position === adj_start) {
                    p.position = adj_end;
                }
            });
          } else {
            if (player2) {
              player2.alive.forEach((p) => {
                if (p.position === adj_start) {
                    p.position = adj_end;
                }
            });
            }
          }
        }
      }
      setGameState(copy_state);
    } else {
        return false;
    }
    return true;
  }

  useEffect(() => {
    setPiecesOnBoard();
  }, [setPiecesOnBoard]);

  return (
    <>
      {Object.keys(gameState).length === 64 && <ChessBoard gameState={gameState} grid={grid} />}
    </>
  );
};

const ChessBoard: React.FC<ChessBoardProps> = ({ gameState, grid }) => {
  const chessBoard = [];

  for (let row_num = 0; row_num < 8; row_num++) {
    let row = [];
    for (let col_num = 0; col_num < 8; col_num++) {
      let spot_piece = gameState[grid[col_num][row_num]][0];
      let squareColor = row_num % 2 === 0 
        ? col_num % 2 === 0 ? 'bg-black-square' : 'bg-white-square' 
        : col_num % 2 === 0 ? 'bg-white-square' : 'bg-black-square';

      row.push(
        <div className={`w-square h-square flex items-center justify-center ${squareColor}`}>
          {spot_piece ? <img src={pieceSVGs[spot_piece.pieceName as keyof typeof pieceSVGs]} alt={spot_piece.pieceName} className={spot_piece.isWhite ? 'noct-white' : 'noct-black'} /> : ''}
        </div>
      );
    }
    chessBoard.push(<div className="w-screen flex items-center justify-center">{row}</div>);
  }

  return (
    <div className="chess-board">
      {chessBoard}
    </div>
  );
}
