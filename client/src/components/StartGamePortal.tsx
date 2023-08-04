import { FC, useCallback, useContext, useEffect, useState } from "react"
import ExpressAPI from "../api/express-api";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { GameContext, StartGameMessageObject } from "../context/GameContext";
import { ReadyState } from "react-use-websocket";
import type { Player } from "../utils/game-utils";

interface StartGamePortalProps {
  expressApi: ExpressAPI;
}

export const StartGamePortal: FC<StartGamePortalProps> = ({ expressApi }) => {

  const [navigateReady, setNavigateReady] = useState<boolean>(false);
  const [users, setUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { username } = useContext(AuthContext)
  const { initiatingUser, receivingUser, gameId, setGameId, setInitiatingUser, setReceivingUser,sendMessage, lastMessage, readyState } = useContext(GameContext)

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
          setGameId(data.gameId);
        }
        setInitiatingUser((prevState: Player | undefined) => {
          if (prevState) {
            return {
              ...prevState,
              name: data.initiatingUser,
            };
          } else {
            // Return a new state when prevState is undefined
            // You may need to adjust this according to your needs
            return {
              name: data.initiatingUser,
              color: "black", // Example value
              alive: [], // Example value
              grave: [], // Example value
            };
          }
        });
        setReceivingUser((prevState: Player | undefined) => {
          if (prevState) {
            return {
              ...prevState,
              name: data.receivingUser,
            };
          } else {
            // Return a new state when prevState is undefined
            // You may need to adjust this according to your needs
            return {
              name: data.receivingUser,
              color: "white", // Example value
              alive: [], // Example value
              grave: [], // Example value
            };
          }
        });
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
  }, [lastMessage, expressApi, sendMessage, setGameId, setInitiatingUser, setReceivingUser]);

  const handleUsernameClick = useCallback((evt: React.MouseEvent<HTMLButtonElement>) => {
    const player2 = evt.currentTarget.dataset.username;
    const message = JSON.stringify({ type: 'game-invite', recievingUser: player2, initiatingUser: username });
    sendMessage(message);
  }, [sendMessage, username]);

  return (
    <>
      {
      navigateReady ? (
        <Navigate to={`/game/${gameId}`} />
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