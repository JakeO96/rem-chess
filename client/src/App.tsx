import React from 'react';
import {
  BrowserRouter,
  Route,
  Routes
} from 'react-router-dom';

import { LoginPage } from './pages/LoginPage'
import HomePage from './pages/HomePage';
import ExpressAPI from './api/express-api';

const expressApi = new ExpressAPI();


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='login' element={<LoginPage expressApi={expressApi} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
