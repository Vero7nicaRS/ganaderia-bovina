import { useAuthContext } from "../authentication/AuthContext";
import PropTypes from "prop-types";

export const SoloAdmin = ({ children }) => {
    const { rol } = useAuthContext();

    return rol === "Administrador" ? children : null;
};

SoloAdmin.propTypes = {
    children: PropTypes.node.isRequired,
};