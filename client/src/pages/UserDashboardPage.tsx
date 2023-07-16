import { FC, useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import ExpressAPI from "../api/express-api";
import Cookies from "js-cookie";

interface DashboardPageProps {
  expressApi: ExpressAPI
}

interface User {
  username: string;
  // Include any other user fields you want to display
}

export const DashboardPage: FC<DashboardPageProps> = ({ expressApi }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    expressApi.getLoggedInUsers()
      .then((data) => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [expressApi]);

  return (
    <MainLayout>
      <header>
        <h1>
          DASHBOARD
        </h1>
      </header>
      {isLoading ? (
        <p>Loading...</p>
      ) : users.length > 0 ? (
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user.username}</li>
          ))}
        </ul>
      ) : (
        <p>No users are currently logged in.</p>
      )}
    </MainLayout>
  );
}