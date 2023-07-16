import React from 'react';
import {
  BrowserRouter,
  Route,
  Routes
} from 'react-router-dom';

import {LogInPage} from './pages/LogInPage'
import HomePage from './pages/HomePage';
import {RegisterPage} from './pages/RegisterPage'
import {DashboardPage} from './pages/UserDashboardPage';
import ExpressAPI from './api/express-api';
import Cookies from 'js-cookie';


const expressApi = new ExpressAPI();


function App() {
  Cookies.set('isLoggedIn', '', {sameSite: 'none', secure: true})
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='login' element={<LogInPage expressApi={expressApi} />} />
        <Route path='register' element={<RegisterPage expressApi={expressApi} />} />
        <Route path='dashboard' element={<DashboardPage expressApi={expressApi} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
