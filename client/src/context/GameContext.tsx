import { createContext, useState, ReactNode, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Player } from '../utils/game-utils';
import { Piece, grid } from '../utils/game-utils';
import { JsonObject } from 'react-use-websocket/dist/lib/types';

export interface StartGameMessageObject extends JsonObject {
  type: string;
  accepted?: boolean;
  initiatingUser: string;
  recievingUser: string;
  gameId?: string;
}

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
  sendMessage: (message: string) => void;
  lastMessage: MessageEvent<any> | null;
  readyState: ReadyState;
};

export const GameContext = createContext<GameContextType>({
  initiatingUser: undefined,
  receivingUser: undefined,
  gameId: '',
  gameState: undefined,
  setGameId: () => { },
  setInitiatingUser: () => { },
  setReceivingUser: () => { },
  setGameState: () => { },
  sendMessage: () => {},  // default function
  lastMessage: null,
  readyState: ReadyState.UNINSTANTIATED,
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

  const [socketUrl, setSocketUrl] = useState('ws://localhost:3001');
  const { 
    sendMessage, 
    lastMessage,
    readyState 
  } = useWebSocket<StartGameMessageObject>(socketUrl, { 
    onOpen: () => console.log('opened'), 
    shouldReconnect: (closeEvent) => true,
  });
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  useEffect(() => {
    // Add the message handling code here
  }, [lastMessage]);

  return (
    <GameContext.Provider value={{ initiatingUser, receivingUser, gameId, gameState, setGameId, setInitiatingUser, setReceivingUser, setGameState, sendMessage, lastMessage, readyState }}>
      {children}
    </GameContext.Provider>
  );
};