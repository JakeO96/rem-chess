import { FC, useCallback, useContext, useEffect, useState } from "react"
//import { useNavigate } from 'react-router-dom'
import ExpressAPI from "../api/express-api";
//import { AuthContext } from "../context/AuthContext";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Cookies from "js-cookie";

interface StartGamePortalProps {
  expressApi: ExpressAPI;
}

export const StartGamePortal: FC<StartGamePortalProps> = ({ expressApi }) => {
  console.log('StartGamePortal render');

  const [users, setUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socketUrl, setSocketUrl] = useState('ws://localhost:3001');
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const { username } = useContext(AuthContext)
  const { 
    sendMessage, 
    lastMessage, 
    readyState 
  } = useWebSocket(socketUrl, { 
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
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage.data));
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'game-invite') {
          const accepted = window.confirm(`You have been invited to a game by ${data.inviterUsername}. Do you accept?`);
          const responseMessage = JSON.stringify({ type: 'game-invite-response', accepted, recievingUser: data.initiatingUser, initiatingUser: data.recievingUser });
          sendMessage(responseMessage);
      } else if (data.type === 'game-start') {
        expressApi.createGame(data, ((gameId) => {
          Cookies.set('activeGameId', gameId);
          <Navigate to={`/game/${data.gameId}`} />;
        }))
      } else if (data.type === 'game-decline') {
        alert(`${data.initiatingUser} declined to start a game.`);
      }
    }
  }, [lastMessage, setMessageHistory, sendMessage, expressApi]);

  const handleUsernameClick = useCallback((evt: React.MouseEvent<HTMLButtonElement>) => {
    const player2 = evt.currentTarget.dataset.username;
    const message = JSON.stringify({ type: 'game-invite', recievingUser: player2, initiatingUser: username });
    sendMessage(message);
  }, [sendMessage, username]);

  return (
    <>
      {isLoading ? (
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
      )}

    <span>The WebSocket is currently {connectionStatus}</span>
      {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
      <ul>
        {messageHistory.map((message, idx) => (
          <span key={idx}>{message ? message : null}</span>
        ))}
      </ul>
    </>
  )
}