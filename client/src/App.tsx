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
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import ExpressAPI from './api/express-api';

const expressApi: ExpressAPI = new ExpressAPI();

function App() {
  return (
    <AuthProvider expressApi={expressApi}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='login' element={<LogInPage />} />
          <Route 
            path='register' 
            element={
              <RegisterPage expressApi={expressApi} />
            } 
          />
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
    </AuthProvider>
  );
}

export default App;
