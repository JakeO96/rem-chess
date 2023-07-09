import React from 'react';
import {
  BrowserRouter,
  Route,
  Routes
} from 'react-router-dom';

import {LogInPage} from './pages/LogInPage'
import HomePage from './pages/HomePage';
import {CreateUserPage} from './pages/CreateUserPage'
import {DashboardPage} from './pages/UserDashboardPage';
import ExpressAPI from './api/express-api';

const expressApi = new ExpressAPI();


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='login' element={<LogInPage expressApi={expressApi} />} />
        <Route path='create-account' element={<CreateUserPage expressApi={expressApi} />} />
        <Route path='dashboard' element={<DashboardPage expressApi={expressApi} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
