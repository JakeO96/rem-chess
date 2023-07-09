import React, {FC} from "react";
import MainLayout from "../components/MainLayout";
import ExpressAPI from "../api/express-api";

interface DashboardPageProps {
  expressApi: ExpressAPI
}

export const DashboardPage: FC<DashboardPageProps> = ({ expressApi }) => {
  return (
    <MainLayout>
      <header>
        <h1>
          DASHBOARD
        </h1>
      </header>
    </MainLayout>
  );
}