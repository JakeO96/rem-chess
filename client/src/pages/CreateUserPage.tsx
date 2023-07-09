import React, { FC } from 'react';
import ExpressAPI from '../api/express-api';
import { CreateUserForm } from '../components/CreateUserForm';
import MainLayout from '../components/MainLayout';

interface CreateUserPageProps {
  expressApi: ExpressAPI;
}

export const CreateUserPage: FC<CreateUserPageProps> = ({ expressApi }) => {
  return (
    <MainLayout>
      <CreateUserForm expressApi={ expressApi } /> 
    </MainLayout>
  )
};