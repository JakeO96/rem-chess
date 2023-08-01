import React, { useEffect, useContext, useCallback } from 'react';
import { Piece, grid, process_move } from '../utils/game-utils'
import { GameContext } from "../context/GameContext";
import { ConnectableElement, useDrag, useDrop } from 'react-dnd';
import { svgIcons } from '../utils/svg-icons';

interface DraggablePieceProps {
  spot_piece: Piece;
  squareColor: string;
}

export const ActiveGame: React.FC<{}> = () => {

  const { initiatingUser: player1, receivingUser: player2, gameState, setGameState } = useContext(GameContext);
  console.log(gameState)

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
      console.log("newGameState in setPiecesOnBoard VVVVVVVVVVVVVVVV")
      console.log(newGameState);
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
    console.log(`building board first for loop firing ${row_num}`)
    for (let col_num = 0; col_num < 8; col_num++) {
      console.log(`building board second for loop firing ${col_num}`)
      if (gameState) {
        console.log(`in chessboard building board firing if gameState exists ${col_num}`)
        console.log("gameState in chessboard building the board VVVVVVV")
        console.log(gameState)
        let spot_piece = gameState[grid[col_num][row_num]][0];
        let squareColor = row_num % 2 === 0 
        ? col_num % 2 === 0 ? 'bg-black-square' : 'bg-white-square' 
        : col_num % 2 === 0 ? 'bg-white-square' : 'bg-black-square';
        console.log("in building the board right before check for spot_piece exists spot_piece is VVVVVVVVVVVVVVVVVV")
        console.log(spot_piece)
        if (spot_piece){
          console.log(`in building board firing if spot_piece exists ${col_num}`)
          row.push(
            <DraggablePiece key={`${row_num}-${col_num}`} spot_piece={spot_piece} squareColor={squareColor} />
          );
        } else {
          row.push(<div key={`${row_num}-${col_num}`} className={`w-square h-square flex items-center justify-center ${squareColor}`}></div>)
        }
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

const DraggablePiece: React.FC<DraggablePieceProps> = ({ spot_piece, squareColor }) => {

  const{ initiatingUser: player1, receivingUser: player2, setInitiatingUser, setReceivingUser, gameState, setGameState } = useContext(GameContext);
  const piece = svgIcons[spot_piece.pieceName];
  console.log(`draggablepiece being rendered the piece(supposed to be svg) isvvv`)
  console.log(piece)

  const [{ isDragging }, dragRef] = useDrag({
    type: 'piece',
    item: { type: 'piece', piece: spot_piece },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: 'piece',
    drop: (item: any, monitor) => {
      const start = item.piece.position; 
      const end = spot_piece.position;
      let copy_state = {...gameState};
      if (player1 && player2) {
        const moveResult = process_move(start, end, copy_state, player1, player2 )
        if (moveResult.isValid) {
          setInitiatingUser(moveResult.player1);
          setReceivingUser(moveResult.player2);
          setGameState(moveResult.newState);
        }
        else {
          setGameState(moveResult.newState);
        }
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  })

  // Compose drag and drop refs
  const combinedRef = (node: ConnectableElement) => {
    dragRef(node)
    dropRef(node)
  }

  return (
    <div ref={combinedRef} className={`w-square h-square flex items-center justify-center ${squareColor}`}>
      {piece}
    </div>
  )
}
