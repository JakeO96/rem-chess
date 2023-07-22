import { FC, MouseEventHandler, useEffect, useState } from "react"
import ExpressAPI from "../api/express-api";

interface StartGamePortalProps {
  expressApi: ExpressAPI;
}

export const StartGamePortal: FC<StartGamePortalProps> = ({ expressApi }) => {

  const [users, setUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleUsernameClick: MouseEventHandler<HTMLButtonElement> = (evt: React.MouseEvent<HTMLButtonElement>) => {
    const username = evt.currentTarget.dataset.username;
    expressApi.createGame({username})
      .then((res) => res.json() )
      .then((data) => {
        //do something here
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
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