import React, { FC} from 'react';
import ExpressAPI from '../api/express-api';
import { LogInForm } from '../components/LogInForm'


interface LogInPageProps {
  expressApi: ExpressAPI;
}

export const LogInPage: FC<LogInPageProps> = ({ expressApi }) => {
  return <LogInForm expressApi={ expressApi } />;
};