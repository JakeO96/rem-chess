import {
  BrowserRouter,
  Route,
  Routes
} from 'react-router-dom';

import HomePage from './pages/HomePage';
import { LogInPage } from './pages/LogInPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/UserDashboardPage';
import { ActiveGamePage } from './pages/ActiveGamePage';
import { NewUserRedirectToLogin } from './pages/NewUserRedirectVerifyEmail';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import ExpressAPI from './api/express-api';

const expressApi: ExpressAPI = new ExpressAPI();

function App() {
  return (
    <AuthProvider expressApi={expressApi}>
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='login' element={<LogInPage />} />
            <Route path='register' element={<RegisterPage expressApi={expressApi} />} />
            <Route path='new-user-redirect-to-login' element={<NewUserRedirectToLogin />} />
            <Route 
              path='dashboard' 
              element={
                <ProtectedRoute>
                  <DashboardPage expressApi={expressApi} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='game/:gameId' 
              element={
                <ProtectedRoute>
                  <ActiveGamePage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
