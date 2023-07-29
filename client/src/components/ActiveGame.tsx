import MainLayout from "./MainLayout"
import { Player, Piece, Pawn, Rook, Knight, Bishop, Queen, King, assignBlackPieces, assignWhitePieces, grid } from '../utils/game-utils'
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { GameContext } from "../context/GameContext";

interface GameState {
  [key: string]: [Piece | null, number];
}

export const ActiveGame: React.FC<{}> = () => {

  const { initiatingUser, receivingUser } = useContext(GameContext);
  const [gameState, setGameState] = useState<GameState>({});
  const [player1, setPlayer1] = useState<Player>(new Player(initiatingUser, '', [], []));
  const [player2, setPlayer2] = useState<Player>(new Player(receivingUser, '', [], []));
  
  useEffect(() => {
    produceEmptyBoard();
    randomlyAssignWhite();
    setPiecesOnBoard();
  }, []);

  const produceEmptyBoard = useCallback(() => {
    let coordCount = 0;
    const newGameState: GameState = {};
    for (const col of grid) {
      for (const cord of col) {
        newGameState[cord] = [null, coordCount];
      }
      coordCount += 1;
    }
    setGameState(newGameState);
  }, []);

  const randomlyAssignWhite = useCallback(() => {
    const r = Math.floor(Math.random() * 2);
    if (r === 0) {
      assignWhitePieces(grid, player1);
      player1.color = 'white';
      assignBlackPieces(grid, player2);
      player2.color = 'black';
    } else {
      assignWhitePieces(grid, player2);
      player2.color = 'white';
      assignBlackPieces(grid, player1);
      player1.color = 'black';
    }
  }, [player1, player2]);

  const setPiecesOnBoard = useCallback(() => {
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
  }, [gameState, player1, player2]);

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
        if (piece) {
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
            player2.alive.forEach((p) => {
                if (p.position === adj_start) {
                    p.position = adj_end;
                }
            });
          }

        }
      }
      setGameState(copy_state);
    } else {
        return false;
    }
    return true;
  }

  const renderBoard = (): JSX.Element => {
    // This function should return JSX that represents the board.
    // This implementation depends on how you want to render the board.
    // For simplicity, let's assume we're returning an empty div.
    return <div></div>;
  }

  return (
    <div>
      {renderBoard()}
    </div>
  );
};
