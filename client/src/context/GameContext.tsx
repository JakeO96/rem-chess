import { createContext, useState, ReactNode } from 'react';
import { Player } from '../utils/game-utils';
import { Piece, grid } from '../utils/game-utils';

interface GameState {
  [key: string]: [Piece | null, number];
}

type GameContextType = {
  initiatingUser: Player | undefined;
  receivingUser: Player | undefined;
  gameId: string;
  gameState: GameState | undefined;
  setGameId: React.Dispatch<React.SetStateAction<string>>;
  setInitiatingUser: React.Dispatch<React.SetStateAction<Player | undefined>>;
  setReceivingUser: React.Dispatch<React.SetStateAction<Player | undefined>>;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
};

export const GameContext = createContext<GameContextType>({
  initiatingUser: undefined,
  receivingUser: undefined,
  gameId: '',
  gameState: undefined,
  setGameId: () => {}, // default function, will be overwritten by Provider value
  setInitiatingUser: () => {},
  setReceivingUser: () => {},
  setGameState: () => {},
});

type GameProviderProps = {
  children: ReactNode;
};

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

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [initiatingUser, setInitiatingUser] = useState<Player | undefined>(undefined);
  const [receivingUser, setReceivingUser] = useState<Player | undefined>(undefined);
  const [gameId, setGameId] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>(produceEmptyBoard());

  return (
    <GameContext.Provider value={{ initiatingUser, receivingUser, gameId, gameState, setGameId, setInitiatingUser, setReceivingUser, setGameState}}>
      {children}
    </GameContext.Provider>
  );
};