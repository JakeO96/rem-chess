import React, { FC} from 'react';
import ExpressAPI from '../api/express-api';
import { LogInForm } from '../components/LogInForm'
import MainLayout from '../components/MainLayout';


interface LogInPageProps {
  expressApi: ExpressAPI;
}

export const LogInPage: FC<LogInPageProps> = ({ expressApi }) => {
  return (
    <MainLayout>
      <LogInForm expressApi={ expressApi } />
    </MainLayout>
  )
};