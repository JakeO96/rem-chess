import React, { useEffect, useContext, useCallback } from 'react';
import { Piece, grid, process_move } from '../utils/game-utils'
import { GameContext } from "../context/GameContext";
import { ConnectableElement, useDrag, useDrop } from 'react-dnd';
import { svgIcons } from '../utils/svg-icons';
import { HTML } from 'react-dnd-html5-backend/dist/NativeTypes';

interface DraggablePieceProps {
  spot_piece: Piece | null;
  squareColor: string;
}

export const ActiveGame: React.FC<{}> = () => {

  const { initiatingUser: player1, receivingUser: player2, gameState, setGameState } = useContext(GameContext);
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
  const { initiatingUser: player1, receivingUser: player2, gameState, setInitiatingUser, setReceivingUser, setGameState } = useContext(GameContext);

  const [, dropRef] = useDrop({
    accept: 'piece',
    drop: (item: any, monitor) => {
      console.log('drop firing')
      console.log('spot piece in drop vvvv')
      console.log(item);
      if (item) {
        const start = item.piece.position; 
        const end = position;
        let copy_state = {...gameState};
        if (player1 && player2) {
          const moveResult = process_move(start, end, copy_state, player1, player2 )
          console.log(moveResult)
          if (moveResult.isValid) {
            item.piece.moved = true;
            setInitiatingUser(moveResult.player1);
            setReceivingUser(moveResult.player2);
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
