import { useAuthContext } from "../authentication/AuthContext";
import PropTypes from "prop-types";

export const SoloEmpleado = ({ children }) => {
    const { rol } = useAuthContext();

    return rol === "Empleado" ? children : null;
};

SoloEmpleado.propTypes = {
    children: PropTypes.node.isRequired,
};