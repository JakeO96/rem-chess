import { createContext, useState, ReactNode } from 'react';

type GameContextType = {
  initiatingUser: string;
  receivingUser: string;
  gameId: string;
  setGameId: React.Dispatch<React.SetStateAction<string>>;
  setInitiatingUser: React.Dispatch<React.SetStateAction<string>>;
  setReceivingUser: React.Dispatch<React.SetStateAction<string>>;
};

export const GameContext = createContext<GameContextType>({
  initiatingUser: '',
  receivingUser: '',
  gameId: '',
  setGameId: () => {}, // default function, will be overwritten by Provider value
  setInitiatingUser: () => {},
  setReceivingUser: () => {},
});

type GameProviderProps = {
  children: ReactNode;
};

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [initiatingUser, setInitiatingUser] = useState<string>('');
  const [receivingUser, setReceivingUser] = useState<string>('');
  const [gameId, setGameId] = useState<string>('');

  return (
    <GameContext.Provider value={{ initiatingUser, receivingUser, gameId, setGameId, setInitiatingUser, setReceivingUser }}>
      {children}
    </GameContext.Provider>
  );
};