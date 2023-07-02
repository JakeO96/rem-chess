import React, { FC } from 'react';
import ExpressAPI from '../api/express-api';
import { CreateAccountForm } from '../components/CreateAccountForm';
import MainLayout from '../components/MainLayout';

interface CreateAccountPageProps {
  expressApi: ExpressAPI;
}

export const CreateAccountPage: FC<CreateAccountPageProps> = ({ expressApi }) => {
  return (
    <MainLayout>
      <CreateAccountForm expressApi={ expressApi } /> 
    </MainLayout>
  )
};