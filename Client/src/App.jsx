import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Home from "./pages/dashboard/Home.jsx";
import Detalle from "./pages/dashboard/Detalle.jsx";
import Help from "./pages/auth/Help.jsx";
import Forgot from "./pages/auth/ForgotEmailSent.jsx";
import Reset from "./pages/auth/ResetPassword.jsx";
import ReservasUsuario from "./pages/dashboard/ReservasUsuario.jsx";
import PrestamosUsuarios from "./pages/dashboard/PrestamosUsuarios.jsx";
import Favorites from "./pages/dashboard/Favorites.jsx";
import Account from "./pages/dashboard/Account.jsx";

import InventarioAdmin from "./pages/Admin/InventarioAdmin.jsx";
import ReservasAdmin from "./pages/Admin/ReservasAdmin.jsx";
import UsuariosAdmin from "./pages/Admin/UsuariosAdmin.jsx";
import PrestamosAdmin from "./pages/Admin/PrestamosAdmin.jsx";

import { AdminRoute } from "./components/AdminRoute.jsx";
import { PrivateRoute } from "./components/PrivateRoute.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/Help" element={<Help />} />
      <Route path="/Forgot" element={<Forgot />} />
      <Route
        path="/Reset"
        element={
          <PrivateRoute>
            <Reset />
          </PrivateRoute>
        }
      />
      <Route
        path="/Home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/Detalle/:id"
        element={
          <PrivateRoute>
            <Detalle />
          </PrivateRoute>
        }
      />
      <Route
        path="/Reservas"
        element={
          <PrivateRoute>
            <ReservasUsuario />
          </PrivateRoute>
        }
      />
      <Route
        path="/Prestamos"
        element={
          <PrivateRoute>
            <PrestamosUsuarios />
          </PrivateRoute>
        }
      />
      <Route
        path="/Favoritos"
        element={
          <PrivateRoute>
            <Favorites />
          </PrivateRoute>
        }
      />
      <Route
        path="/Cuenta"
        element={
          <PrivateRoute>
            <Account />
          </PrivateRoute>
        }
      />

      {/* ===== RUTAS ADMIN ===== */}
      <Route
        path="/Admin/Inventario"
        element={
          <AdminRoute>
            {" "}
            <InventarioAdmin />{" "}
          </AdminRoute>
        }
      />
      <Route
        path="/Admin/Reservas"
        element={
          <AdminRoute>
            {" "}
            <ReservasAdmin />{" "}
          </AdminRoute>
        }
      />
      <Route
        path="/Admin/Usuarios"
        element={
          <AdminRoute>
            {" "}
            <UsuariosAdmin />{" "}
          </AdminRoute>
        }
      />

      <Route
        path="/Admin/Prestamos"
        element={
          <AdminRoute>
            {" "}
            <PrestamosAdmin />{" "}
          </AdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
