import React, { FC, useState } from 'react';
import ExpressAPI from '../api/express-api';


interface LoginPageProps {
  expressApi: ExpressAPI;
}

export const LoginPage: FC<LoginPageProps> = ({ expressApi }) => {
  const [usernameExists, setUsernameExists] = useState<boolean | null>(null);

  const checkUsername = async () => {
    expressApi.doesUsernameExist()
    .then(res => res.json())
    .then((data) => {
      if (data.working) {
        setUsernameExists(data.working);
      }
    })
  };

  return (
    <div>
      <button onClick={checkUsername}>
        Check if Username Exists
      </button>
      {usernameExists !== null && (
        <p>{usernameExists ? 'Username exists.' : 'Username does not exist.'}</p>
      )}
    </div>
  );
};