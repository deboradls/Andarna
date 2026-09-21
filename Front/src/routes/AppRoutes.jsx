import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import Register from '../pages/Register/Register';

import Login from '../pages/Login/Login';
import Home from '../pages/Home/Home';
import Profile from '../pages/Profile/Profile';
import AuthCallback from '../pages/AuthCallback/AuthCallback';
import Catalog from '../pages/Catalog/Catalog';
import Library from '../pages/Library/Library';

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

          <Route path="/auth/callback" element={<AuthCallback />} />

        </Route>


        {/* Rotas protegidas */}
        <Route element={<ProtectedRoute />}>

          <Route
            path="/home"
            element={<Home />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route path="/catalog" element={<Catalog />} />
          <Route path="/shelves/books" element={<Library />} />
          <Route path="/journey/read" element={<Library />} />
          <Route path="/journey/reading" element={<Library />} />
          <Route path="/journey/want-to-read" element={<Library />} />
          <Route path="/journey/abandoned" element={<Library />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
