import React, { useEffect, useContext, useCallback } from 'react';
import { Player, Piece, Pawn, Rook, Bishop, Knight, Queen, King, grid } from '../utils/game-utils'
import type { GameState } from '../context/GameContext'
import { GameContext } from "../context/GameContext";
import { useDrag, useDrop } from 'react-dnd';
import { svgIcons } from '../utils/svg-icons';

interface MoveResult {
  isValid: boolean;
  newState: GameState;
  newChallenger: Player | null | undefined;
  newOpponent: Player | null | undefined;
}

export const ActiveGame: React.FC<{}> = () => {

  const { challenger, opponent, gameState, setGameState, sendMessage, lastMessage } = useContext(GameContext);

  const setPiecesOnBoard = useCallback(() => {
    if (challenger && opponent && gameState) {
      const allPieces = challenger.alive.concat(opponent.alive);
      const allPositions = allPieces.map(p => p.position);
      const newGameState: GameState = {...gameState};
      for (const spot in newGameState.board) {
        if (allPositions.includes(spot)) {
          for (const p of allPieces) {
            if (p.position === spot) {
              if (newGameState.board) newGameState.board[spot][0] = p;
            }
          }
        }
      }
      setGameState(newGameState);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenger, opponent]);

  useEffect(() => {
    setPiecesOnBoard();
  }, [setPiecesOnBoard]);

  useEffect(() => {

    function handleIncomingData(data: any) {
      if (data.type === 'move-made') {
        setGameState(data.newGameState);
      }
    }

    if (lastMessage !== null) {
      if (lastMessage.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            const data = JSON.parse(reader.result);
            handleIncomingData(data);
          }
        };
        reader.readAsText(lastMessage.data);
      } else {
        const data = JSON.parse(lastMessage.data);
        handleIncomingData(data);
      }
    }
  }, [sendMessage, lastMessage, setGameState])

  return (
    <>
      <ChessBoard />
    </>
  );
};

const ChessBoard: React.FC<{}> = () => {
  const { challenger, opponent, gameState } = useContext(GameContext);
  const chessBoard = [];

  for (let row_num = 0; row_num < 8; row_num++) {
    let row = [];
    for (let col_num = 0; col_num < 8; col_num++) {
      if (gameState) {
        let position = grid[col_num][row_num];
        let squareColor = row_num % 2 === 0 
        ? col_num % 2 === 0 ? 'bg-black-square' : 'bg-white-square' 
        : col_num % 2 === 0 ? 'bg-white-square' : 'bg-black-square';
        row.push(
          <Square key={`${row_num}-${col_num}`} position={position} squareColor={squareColor} />
        );
      }
    }
    chessBoard.push(<div key={row_num} className="w-screen flex items-center justify-center">{row}</div>);
  }

  return (
    <div className="chess-board">
      {challenger && opponent ? challenger.color === 'black' ? <p className="noct-teal">{challenger.name} - {challenger.color}</p> : <p className="noct-teal">{opponent.name} - {opponent.color}</p> : null}
      {chessBoard}
      {challenger && opponent ? challenger.color === 'white' ? <p className="noct-teal">{challenger.name} - {challenger.color}</p> : <p className="noct-teal">{opponent.name} - {opponent.color}</p>: null}
    </div>
  );
}

// Square component
const Square: React.FC<{ position: string, squareColor: string }> = ({ position, squareColor }) => {
  const { challenger, opponent, gameId, gameState, setChallenger, setOpponent, setGameState, sendMessage } = useContext(GameContext);

  const process_move = (start: string, end: string): MoveResult => {
    let copyState = {...gameState as GameState};
    if (copyState.board) {
      let startPosition = start[0] + start[1];
      let endPosition = end[0] + end[1];
      let startCol = copyState.board[startPosition][1];
      let startRow = 7 - parseInt(startPosition[1]);
    
      let piece = copyState.board[startPosition][0];
      // check if piece belongs to white, check the isWhite property of the piece to make sure it is a white piece white is dragging
      //against if it is white's turn to move. 
      if (piece) {
        if (piece.playerColor === 'white') {
          if (piece.isWhite !== copyState.isWhiteTurn) {
            return { isValid: false, newState: copyState, newChallenger: challenger, newOpponent: opponent };
          }
        }
      }
      const board = copyState.board;
      console.log(board)
      let allMoves: string[] = [];
      // find what piece we are moving
      console.log(typeof piece)
      console.log(piece instanceof Pawn)
      if (piece instanceof Pawn) {
          console.log('is this even firing?')
          allMoves = piece.validPawnMoves(grid, board, startCol, startRow);
      } else if (piece instanceof Knight) {
          allMoves = piece.validKnightMoves(grid, board, startCol, startRow);
      } else if (piece instanceof Rook) {
          allMoves = piece.get_all_straight(grid, board, startCol, startRow);
      } else if (piece instanceof Bishop) {
          allMoves = piece.get_all_diagonal(grid, board, startCol, startRow);
      } else if (piece instanceof Queen) {
          allMoves = piece.get_all_straight(grid, board, startCol, startRow)
              .concat(piece.get_all_diagonal(grid, board, startCol, startRow));
      } else if (piece instanceof King) {
          allMoves = piece.validKingMoves(grid, board, startCol, startRow);
      }
      
      console.log(allMoves)
      if (allMoves.includes(endPosition)) {
        // if the piece moving is taking an opponents piece
        if (board[endPosition][0] !== null) {
          const endSpotpiece = board[endPosition][0];
          // update the alive and grave list for player losing a piece
          if (endSpotpiece && challenger && opponent) {
            if (challenger.alive.includes(endSpotpiece)) {
              challenger.grave.push(endSpotpiece);
              challenger.alive = challenger.alive.filter(item => item !== endSpotpiece);
            } else {
              opponent.grave.push(endSpotpiece);
              opponent.alive = opponent.alive.filter(item => item !== endSpotpiece);
            }
          }
        }
    
        // update the positions of the pieces on the board
        board[endPosition][0] = board[startPosition][0];
        board[startPosition][0] = null;
        if (board[endPosition][0] !== null) {
          let piece = board[endPosition][0];
          if (piece && challenger && opponent) {
            piece.position = endPosition;
            if (challenger.name === piece.playerName) {
              challenger.alive.forEach((p) => {
                  if (p.position === startPosition) {
                      p.position = endPosition;
                  }
              });
            } else {
              opponent.alive.forEach((p) => {
                if (p.position === startPosition) {
                    p.position = endPosition;
                }
              });
            }
          }
        }
      } else {
        return { isValid: false, newState: copyState, newChallenger: challenger, newOpponent: opponent };
      }
    }
    const newTurn = copyState.isWhiteTurn ? false : true;
    copyState.isWhiteTurn = newTurn;
    return { isValid: true, newState: copyState, newChallenger: challenger, newOpponent: opponent };
  }

  const [, dropRef] = useDrop({
    accept: 'piece',
    drop: (item: any, monitor) => {
      if (item) {
        const start = item.piece.position; 
        const end = position;
        if (challenger && opponent) {
          const moveResult = process_move(start, end);
          if (moveResult.isValid) {
            item.piece.moved = true;
            const message = JSON.stringify({type: 'valid-move', pieceColor: item.piece.isWhite, playerName: item.piece.playerName, gameId: gameId, newGameState: moveResult.newState })
            sendMessage(message)
            if (moveResult.newChallenger && moveResult.newOpponent) {
              setChallenger(moveResult.newChallenger);
              setOpponent(moveResult.newOpponent);
            }
            setGameState(moveResult.newState);
          }
          else {
            alert('inValid Move');
          }
        }
      }
    },
  })

  const piece = gameState ? gameState.board[position][0] : null;

  return (
    <div ref={dropRef} className={`w-square h-square flex items-center justify-center ${squareColor}`}>
      {piece ? <DraggablePiece piece={piece} /> : null}
    </div>
  );
};

const DraggablePiece: React.FC<{ piece: Piece }> = ({ piece }) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'piece',
    item: { type: 'piece', piece },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  return (
    <div ref={dragRef}>
      {svgIcons[piece.pieceName]}
    </div>
  )
}
