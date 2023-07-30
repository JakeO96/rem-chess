import { createContext, useState, ReactNode } from 'react';
import { Player } from '../utils/game-utils';

type GameContextType = {
  initiatingUser: Player | undefined;
  receivingUser: Player | undefined;
  gameId: string;
  setGameId: React.Dispatch<React.SetStateAction<string>>;
  setInitiatingUser: React.Dispatch<React.SetStateAction<Player | undefined>>;
  setReceivingUser: React.Dispatch<React.SetStateAction<Player | undefined>>;
};

export const GameContext = createContext<GameContextType>({
  initiatingUser: undefined,
  receivingUser: undefined,
  gameId: '',
  setGameId: () => {}, // default function, will be overwritten by Provider value
  setInitiatingUser: () => {},
  setReceivingUser: () => {},
});

type GameProviderProps = {
  children: ReactNode;
};

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [initiatingUser, setInitiatingUser] = useState<Player | undefined>(undefined);
  const [receivingUser, setReceivingUser] = useState<Player | undefined>(undefined);
  const [gameId, setGameId] = useState<string>('');

  return (
    <GameContext.Provider value={{ initiatingUser, receivingUser, gameId, setGameId, setInitiatingUser, setReceivingUser }}>
      {children}
    </GameContext.Provider>
  );
};