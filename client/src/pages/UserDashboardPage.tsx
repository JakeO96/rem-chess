import { FC, useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import ExpressAPI from "../api/express-api";

interface DashboardPageProps {
  expressApi: ExpressAPI
}

export const DashboardPage: FC<DashboardPageProps> = ({ expressApi }) => {
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
          {users.map((username, index) => (
            <li key={index}>{username}</li>
          ))}
        </ul>
      ) : (
        <p>No users are currently logged in.</p>
      )}
    </MainLayout>
  );
}