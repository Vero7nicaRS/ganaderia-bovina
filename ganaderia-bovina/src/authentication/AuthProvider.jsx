/*
* ------------------------------------------ AuthProvider.jsx: ------------------------------------------
* Funcionalidad: almacena el usuario y su rol.
* --------------------------------------------------------------------------------------------------------
* */

import { AuthContext } from "./AuthContext";
import { useState } from "react";
import {jwtDecode} from "jwt-decode";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    const [accessToken, setAccessToken] = useState(localStorage.getItem("access") || null);
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refresh") || null);
    const [rol, setRol] = useState(() => {
        const token = localStorage.getItem("access");
        return token ? jwtDecode(token).rol : null;
    });

    const [nombreUsuario, setNombreUsuario] = useState(() => {
        const token = localStorage.getItem("access");
        return token ? jwtDecode(token).username : null;
    });

    const login = (access, refresh) => {
        localStorage.setItem("access", access);
        localStorage.setItem("refresh", refresh);

        setAccessToken(access);
        setRefreshToken(refresh);

        const decoded = jwtDecode(access);
        setRol(decoded.rol);
        localStorage.setItem("rol", decoded.rol);
        setNombreUsuario(decoded.username);
        localStorage.setItem("username", decoded.username);
        navigate("/");
    };

    const logout = () => {
        localStorage.clear();
        setAccessToken(null);
        setRefreshToken(null);
        setRol(null);
        navigate("/inicio-sesion");
    };

    return (
        <AuthContext.Provider value={{ accessToken, refreshToken, rol, nombreUsuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};