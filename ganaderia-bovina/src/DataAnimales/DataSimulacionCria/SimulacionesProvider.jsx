/*
* ------------------------------------------ SimulacionesProvider.jsx: ------------------------------------------
* Funcionalidad: importa el contexto.
* Se emplea para que el listado de simulaciones se encuentre disponible
* en las diferentes páginas.
*
* Se separa el Context del Provider porque se espera que cada archivo solo exporte componentes.
* -----------------------------------------------------------------------------------------------------------
* */
import {useState} from "react";
import PropTypes from "prop-types";
import {SimulacionesContext} from "./SimulacionesContext.jsx";
import {simulacionesMock} from "./simulacionesMock.jsx";

export const SimulacionesProvider = ({children}) => {

    //setSimulaciones permite actualizar el estado de simulaciones (evitando modificar el estado actual "simulaciones")
    const [simulaciones, setSimulaciones] = useState(simulacionesMock);

    const agregarSimulacion = (nuevaSimulacion) => {

        // Cálculo del identificador: es necesario que cada simulacion añadido tenga un identificador único (ID).
        setSimulaciones(prevSimulaciones => {

            // 1. Se fitra por las simulaciones existentes
            const idsNumericos = prevSimulaciones
                .filter(simulacion => simulacion.id.startsWith("SIMULACION-")) // Solo simulaciones
                .map(simulacion => parseInt(simulacion.id.split("-")[1])) // Se extrae el número del identificador (ID) pasándolo a entero.
                .filter(num => !isNaN(num));

            // 2. Definir el siguiente ID disponible: se escoge el último Identificador y se le añade 1.
            const siguienteId = idsNumericos.length > 0 ? Math.max(...idsNumericos) + 1 : 1;

            // 3. Se define cómo va a ser el identificador "CORRAL-num"
            const idUnico = `SIMULACION-${siguienteId}`;

            // 5. Se añade el nuevo corral a la lista de simulaciones existentes (prevSimulaciones) y
            // ese corral nuevo (nuevaSimulacion) que contiene los datos pasados por el argumento y se le indica
            // el identificador único y tipo correspondiente.
            return [...prevSimulaciones, { ...nuevaSimulacion, id: idUnico}];
        });
    };

    //modificarSimulacion: Se reemplaza el objeto corral por otro en la lista de simulaciones.
    const modificarSimulacion = (simulacionModificado) => {
        setSimulaciones(
            simulaciones.map((simulacion) =>
                simulacion.id === simulacionModificado.id ? simulacionModificado : simulacion
            )
        );
    };

    const eliminarSimulacion = (id) => {
        setSimulaciones(simulaciones.filter((simulacion) => simulacion.id !== id));
    };

    return (
        <SimulacionesContext.Provider value={{ simulaciones, agregarSimulacion, modificarSimulacion, eliminarSimulacion }}>
            {children}
        </SimulacionesContext.Provider>
    );
};
SimulacionesProvider.propTypes = {
    children: PropTypes.node.isRequired,
};