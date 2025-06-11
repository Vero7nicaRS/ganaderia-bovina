import { Navigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";
import PropTypes from "prop-types";

export const ProtegerRuta = ({ children, requiereRol }) => {
    const { accessToken, rol } = useAuthContext();

    // Si no hay token, el usuario es redirigido a la página de inicio de sesión.
    if (!accessToken) {
        return <Navigate to="/inicio-sesion" replace />;
    }

    // Si el rol no está autorizado, el usuario es redirigido a la página de inicio "HOME".
    if (requiereRol && rol !== requiereRol) {
        return <Navigate to="/" replace />;
    }

    return children;
};

ProtegerRuta.propTypes = {
    children: PropTypes.node.isRequired,
    requiereRol: PropTypes.string,
};