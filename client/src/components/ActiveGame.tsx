import React, { useEffect, useContext, useCallback } from 'react';
import { Piece, Pawn, Rook, Bishop, Knight, Queen, King, grid } from '../utils/game-utils'
import type { MoveResult } from '../utils/game-utils'
import { GameContext } from "../context/GameContext";
import { useDrag, useDrop } from 'react-dnd';
import { svgIcons } from '../utils/svg-icons';

export const ActiveGame: React.FC<{}> = () => {

  const { initiatingUser: player1, receivingUser: player2, gameState, setGameState, sendMessage, lastMessage } = useContext(GameContext);
  console.log('activegame component rendering - gamestate is VVVV');
  console.log(gameState);

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

  useEffect(() => {
    setPiecesOnBoard();
  }, [setPiecesOnBoard]);

  useEffect(() => {

    function handleIncomingData(data: any) {
      if (data.type === 'move-made') {
        console.log('useEffect in ActiveGame firing when the message from server is move-made')
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
  }, [sendMessage, lastMessage, setPiecesOnBoard, setGameState])

  return (
    <>
      <ChessBoard />
    </>
  );
};

const ChessBoard: React.FC<{}> = () => {
  const { gameState } = useContext(GameContext);
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
      {chessBoard}
    </div>
  );
}

// Square component
const Square: React.FC<{ position: string, squareColor: string }> = ({ position, squareColor }) => {
  const { initiatingUser: player1, receivingUser: player2, gameId, gameState, setInitiatingUser, setReceivingUser, setGameState, sendMessage } = useContext(GameContext);

  const process_move = (start: string, end: string): MoveResult => {
    let copyState = {...gameState};
    let startPosition = start[0] + start[1];
    console.log(`adjusted start: ${startPosition}`)
    let endPosition = end[0] + end[1];
    console.log(`adjusted start: ${endPosition}`)
    let startCol = copyState[startPosition][1];
    console.log(`start column: ${startCol}`)
    let startRow = 7 - parseInt(startPosition[1]);
    console.log(`start row: ${startRow}`)
  
    let piece = copyState[startPosition][0];
    console.log('piece VVVV');
    console.log(piece)
    let allMoves: string[] = [];
    // find what piece we are moving
    if (piece instanceof Pawn) {
        allMoves = piece.validPawnMoves(grid, gameState, startCol, startRow);
    } else if (piece instanceof Knight) {
        allMoves = piece.validKnightMoves(grid, gameState, startCol, startRow);
    } else if (piece instanceof Rook) {
        allMoves = piece.get_all_straight(grid, gameState, startCol, startRow);
    } else if (piece instanceof Bishop) {
        allMoves = piece.get_all_diagonal(grid, gameState, startCol, startRow);
    } else if (piece instanceof Queen) {
        allMoves = piece.get_all_straight(grid, gameState, startCol, startRow)
            .concat(piece.get_all_diagonal(grid, gameState, startCol, startRow));
    } else if (piece instanceof King) {
        allMoves = piece.validKingMoves(grid, gameState, startCol, startRow);
    }
  
    console.log('all moves after checking vvvv')
    console.log(allMoves)
  
    if (allMoves.includes(endPosition)) {
      // if the piece moving is taking an opponents piece
      if (copyState[endPosition][0] !== null) {
        const piece = copyState[endPosition][0];
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
      copyState[endPosition][0] = copyState[startPosition][0];
      copyState[startPosition][0] = null;
      if (copyState[endPosition][0] !== null) {
        let piece = copyState[endPosition][0];
        if (piece && player1 && player2) {
          piece.position = endPosition;
          if (player1.name === piece.playerName) {
            player1.alive.forEach((p) => {
                if (p.position === startPosition) {
                    p.position = endPosition;
                }
            });
          } else {
            player2.alive.forEach((p) => {
              if (p.position === startPosition) {
                  p.position = endPosition;
              }
            });
          }
        }
      }
    } else {
      return { isValid: false, newState: copyState, newPlayer1: player1, newPlayer2: player2 };
    }
    return { isValid: true, newState: copyState, newPlayer1: player1, newPlayer2: player2 };
  }

  const [, dropRef] = useDrop({
    accept: 'piece',
    drop: (item: any, monitor) => {
      console.log('drop firing')
      console.log('spot piece in drop vvvv')
      console.log(item);
      if (item) {
        const start = item.piece.position; 
        const end = position;
        if (player1 && player2) {
          const moveResult = process_move(start, end);
          console.log(moveResult)
          if (moveResult.isValid) {
            item.piece.moved = true;
            const message = JSON.stringify({type: 'valid-move', pieceColor: item.piece.isWhite, playerName: item.piece.playerName, gameId: gameId, newGameState: moveResult.newState })
            sendMessage(message)
            if (moveResult.newPlayer1 && moveResult.newPlayer2) {
              setInitiatingUser(moveResult.newPlayer1);
              setReceivingUser(moveResult.newPlayer2);
            }
            setGameState(moveResult.newState);
          }
          else {
            setGameState(moveResult.newState);
          }
        }
      }
    },
  })

  const piece = gameState ? gameState[position][0] : null;

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
