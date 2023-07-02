import React, { FC} from 'react';
import ExpressAPI from '../api/express-api';
import { CreateAccountForm } from '../components/CreateAccountForm';

interface CreateAccountPageProps {
  expressApi: ExpressAPI;
}

export const CreateAccountPage: FC<CreateAccountPageProps> = ({ expressApi }) => {
  return <CreateAccountForm expressApi={ expressApi } />;
};