import { FC, MouseEventHandler, useContext, useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom'
import ExpressAPI from "../api/express-api";
import { AuthContext } from "../context/AuthContext";

interface StartGamePortalProps {
  expressApi: ExpressAPI;
}

export const StartGamePortal: FC<StartGamePortalProps> = ({ expressApi }) => {
  console.log('StartGamePortal render');

  const [users, setUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const navigate = useNavigate();
  const { isLoggedIn, username } = useContext(AuthContext);

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
    const ws = new WebSocket('ws://localhost:3001');
    setWs(ws);

    // Handle WebSocket events here...
    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.message) {
          console.log(data.message)
        }
        if (data.type === 'game-invite') {
          const accepted = window.confirm(`You have been invited to a game by ${data.inviterUsername}. Do you accept?`);
          const message = JSON.stringify({ type: 'game-invite-response', accepted });
          ws.send(message);
        } else if (data.type === 'game-start') {
          // Replace '/game' with the actual path to your game page
          // 'data.gameId' should be the id of the game that was created on the server
          navigate(`/game/${data.gameId}`);
        }
      };
    }
  }, [navigate]);

  useEffect(() => {
    if (!isLoggedIn && ws) {
      ws.close();
    }
  }, [isLoggedIn, ws]);

  const handleUsernameClick: MouseEventHandler<HTMLButtonElement> = (evt: React.MouseEvent<HTMLButtonElement>) => {
    const player2 = evt.currentTarget.dataset.username;
    const message = JSON.stringify({ type: 'game-invite', invitedUser: player2 });
    if (ws) ws.send(message);


    const handleGameStart = (gameId: string) => {
      const message = JSON.stringify({ type: 'game-start', gameId });
      if (ws) ws.send(message);
    };
    expressApi.createGame({ player1: username, player2 }, handleGameStart);
  }

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : users.length > 0 ? (
        <ul>
          {users.map((username, index) => (
            <li key={index}>
              <button data-username={username} onClick={handleUsernameClick}>{username}</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No users are currently logged in.</p>
      )}
    </>
  )
}