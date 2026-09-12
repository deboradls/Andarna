import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import Register from '../pages/Register/Register';

import Login from '../pages/Login/Login';
import Home from '../pages/Home/Home';

import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Rotas públicas */}
        <Route element={<PublicRoute />}>
          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

        </Route>


        {/* Rotas protegidas */}
        <Route element={<ProtectedRoute />}>

          <Route
            path="/home"
            element={<Home />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;