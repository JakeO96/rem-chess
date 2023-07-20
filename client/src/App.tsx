import {
  BrowserRouter,
  Route,
  Routes
} from 'react-router-dom';

import HomePage from './pages/HomePage';
import { LogInPage } from './pages/LogInPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/UserDashboardPage';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import ExpressAPI from './api/express-api';

function App() {
  const expressApi = new ExpressAPI();
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
                <DashboardPage expressApi={expressApi}/>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
