import { FC, useCallback, useContext, useEffect, useState } from "react"
import ExpressAPI from "../api/express-api";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { JsonObject } from "react-use-websocket/dist/lib/types";

interface StartGamePortalProps {
  expressApi: ExpressAPI;
}

interface StartGameMessageObject extends JsonObject {
  type: string;
  accepted?: boolean;
  initiatingUser: string;
  recievingUser: string;
  gameId?: string;
}

export const StartGamePortal: FC<StartGamePortalProps> = ({ expressApi }) => {
  console.log('StartGamePortal render');

  const [navigateReady, setNavigateReady] = useState<boolean>(false);
  const [newGameId, setNewGameId] = useState<string>('');
  const [users, setUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socketUrl, setSocketUrl] = useState('ws://localhost:3001');
  const { username } = useContext(AuthContext)
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
    expressApi.getLoggedInUsers()
      .then((res) =>  res.json() )
      .then((data) => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [expressApi]);

  useEffect(() => {
    function handleIncomingData(data: StartGameMessageObject) {
      if (data.type === 'game-invite') {
        const accepted = window.confirm(`You have been invited to a game by ${data.inviterUsername}. Do you accept?`);
        const responseMessage = JSON.stringify({ type: 'game-invite-response', accepted, recievingUser: data.initiatingUser, initiatingUser: data.recievingUser });
        sendMessage(responseMessage);
      } else if (data.type === 'create-game') {
        expressApi.createGame(data, ((gameId) => {
          const responseMessage = JSON.stringify({ type: 'game-created', recievingUser: data.initiatingUser, initiatingUser: data.recievingUser, gameId: gameId})
          sendMessage(responseMessage);
        }))
      } else if (data.type === 'start-game') {
          if (data.gameId) {
            setNewGameId(data.gameId)
          }
          setNavigateReady(true);
      } else if (data.type === 'game-decline') {
        alert(`${data.initiatingUser} declined to start a game.`);
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
  }, [lastMessage, expressApi, sendMessage, newGameId]);

  const handleUsernameClick = useCallback((evt: React.MouseEvent<HTMLButtonElement>) => {
    const player2 = evt.currentTarget.dataset.username;
    const message = JSON.stringify({ type: 'game-invite', recievingUser: player2, initiatingUser: username });
    sendMessage(message);
  }, [sendMessage, username]);

  return (
    <>
      {
      navigateReady ? (
        <Navigate to={`game/${newGameId}`} />
      ) :  isLoading ? (
          <p>Loading...</p>
        ) : users.length > 0 ? (
          <ul>
            {users.map((username, index) => (
              <li key={index}>
                <button 
                  disabled={readyState !== ReadyState.OPEN} 
                  data-username={username} 
                  onClick={handleUsernameClick}>
                  {username}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No users are currently logged in.</p>
        )
      }
    </>
  )
}