import { createContext, useState, ReactNode, useEffect, useContext, useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Player, assignBlackPieces, assignWhitePieces } from '../utils/game-utils';
import { Piece, grid } from '../utils/game-utils';
import { JsonObject } from 'react-use-websocket/dist/lib/types';
import { AuthContext } from './AuthContext';

export interface StartGameMessageObject extends JsonObject {
  type: string;
  accepted?: boolean;
  initiatingUser: string;
  receivingUser: string;
  gameId?: string;
}

export interface GameState {
  board: {
    [key: string]: [Piece | null, number];
  };
  isWhiteTurn: boolean;
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

const produceInitialGameState = () => {
  let cordCount = 0;
  const newGameState: GameState = {board: {}, isWhiteTurn: true};
  for (const col of grid) {
    for (const cord of col) {
      newGameState.board[cord] = [null, cordCount];
    }
    cordCount += 1;
  }
  return newGameState;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const initialState: GameState = produceInitialGameState();

  const [initiatingUser, setInitiatingUser] = useState<Player | undefined>(undefined);
  const [receivingUser, setReceivingUser] = useState<Player | undefined>(undefined);
  const [gameId, setGameId] = useState<string>('');
  const [gameState, setGameState] = useState<GameState>(initialState);
  const { isLoggedIn } = useContext(AuthContext)
  const [socketUrl, setSocketUrl] = useState<string>('');

  const initiatePlayers = useCallback(() =>  {
    let player1 = new Player('', '', [], []);
    let player2 = new Player('', '', [], []);
    const r = Math.floor(Math.random() * 2);
    if (r === 0) {
      player1.color = 'white';
      player2.color = 'black';
      assignWhitePieces(player1);
      assignBlackPieces(player2);
    } else {
      player1.color = 'black';
      player2.color = 'white';
      assignWhitePieces(player2);
      assignBlackPieces(player1);
    }
    setInitiatingUser(player1)
    setReceivingUser(player2)
  }, [setInitiatingUser, setReceivingUser]);
  
  useEffect(() => {
    if (isLoggedIn) {
      setSocketUrl('ws://localhost:3001');
      initiatePlayers();
    }
  }, [initiatePlayers, isLoggedIn]);

  const {
    sendMessage,
    lastMessage,
    readyState
  } = useWebSocket<StartGameMessageObject>(socketUrl, {
    onOpen: () => console.log('opened'),
    shouldReconnect: (closeEvent) => true,
  }, socketUrl !== '');

  return (
    <GameContext.Provider value={{ initiatingUser, receivingUser, gameId, gameState, setGameId, setInitiatingUser, setReceivingUser, setGameState, sendMessage, lastMessage, readyState }}>
      {children}
    </GameContext.Provider>
  );
};