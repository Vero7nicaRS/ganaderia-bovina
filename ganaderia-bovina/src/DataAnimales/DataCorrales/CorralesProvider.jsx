/*
* ------------------------------------------ CorralesProvider.jsx: ------------------------------------------
* Funcionalidad: importa el contexto.
* Se emplea para que el listado de corrales se encuentre disponible
* en las diferentes páginas.
*
* Se separa el Context del Provider porque se espera que cada archivo solo exporte componentes.
* -----------------------------------------------------------------------------------------------------------
* */
import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {CorralesContext} from "./CorralesContext.jsx";
import api from "../../api.js";
import {useAuthContext} from "../../authentication/AuthContext.jsx";

export const CorralesProvider = ({children}) => {
    const [corrales, setCorrales] = useState([]);
    const { accessToken } = useAuthContext();
    // Se cargan los datos de los corrales que están en el backend.
    useEffect(() => {
        if (!accessToken) return;
        api.get("/corrales/")
            .then(response => {
                setCorrales(response.data);
            })
            .catch(error => {
                console.error("Error al cargar los corrales:", error);
            });
    }, [accessToken]);

    /*
    * ----------------------------------------------------------------------------------------------
    *                    agregarCorral: AGREGAR (CORRAL) DESDE BACKEND del CORRAL (PUT)
    * ----------------------------------------------------------------------------------------------
    */
    const agregarCorral = async (nuevoCorral) => {
        try {
            // Se añade al backend: se añade el corral al backend.
            const response = await api.post("/corrales/", nuevoCorral);

            // Se añade al contexto: se incorpora el corral al listado de corrales.
            setCorrales(prev => [...prev, response.data]);
            return response.data; // Se devuelve el corral con toda su información (incluyendo: id y codigo)
        } catch (error) {
            console.error("Error al crear corral:", error.response?.data || error.message);
            throw error;
        }
    };
    /*
    * ----------------------------------------------------------------------------------------------
    *                       modificarCorral: ELIMINACIÓN del CORRAL (DELETE)
    * ----------------------------------------------------------------------------------------------
    */
    const modificarCorral = async (corralModificado) => {
        try {
            // Se actualiza el backend.
            const response = await api.put(`/corrales/${corralModificado.id}/`, corralModificado);

            // Se actualiza el contexto: se busca el corral en el listado de corrales y se modifican sus datos.
            setCorrales(prev =>
                prev.map(corral => corral.id === corralModificado.id ? response.data : corral)
            );
            return response.data;
        } catch (error) {
            console.error("Error al modificar corral:", error.response?.data || error.message);
            throw error;
        }
    };
    /*
    * ----------------------------------------------------------------------------------------------
    *                       eliminarCorral: ELIMINACIÓN del CORRAL (DELETE)
    * ----------------------------------------------------------------------------------------------
    */
    const eliminarCorral = async (id) => {
        try {
            // Se elimina del backend.
            await api.delete(`/corrales/${id}/`);

            // Se elimina del contexto: el corral desaparece de la lista de corrales.
            setCorrales(prev =>
                prev.filter(corral => corral.id !== id));
        } catch (error) {
            console.error("Error al eliminar corral:", error.response?.data || error.message);
        }
    };
    //setCorrales permite actualizar el estado de corrales (evitando modificar el estado actual "corrales")
    // const [corrales, setCorrales] = useState(corralesMock);
    //
    // const agregarCorral = (nuevoCorral) => {
    //
    //     // Cálculo del identificador: es necesario que cada corral añadido tenga un identificador único (ID).
    //     setCorrales(prevCorrales => {
    //
    //         // 1. Se fitra por las corrales existentes
    //         const idsNumericos = prevCorrales
    //             .filter(corral => corral.id.startsWith("CORRAL-")) // Solo corrales
    //             .map(corral => parseInt(corral.id.split("-")[1])) // Se extrae el número del identificador (ID) pasándolo a entero.
    //             .filter(num => !isNaN(num));
    //
    //         // 2. Definir el siguiente ID disponible: se escoge el último Identificador y se le añade 1.
    //         const siguienteId = idsNumericos.length > 0 ? Math.max(...idsNumericos) + 1 : 1;
    //
    //         // 3. Se define cómo va a ser el identificador "CORRAL-num".
    //         const idUnico = `CORRAL-${siguienteId}`;
    //
    //         // 5. Se añade el nuevo corral a la lista de corrales existentes (prevCorrales) y
    //         // ese corral nuevo (nuevoCorral) que contiene los datos pasados por el argumento y se le indica
    //         // el identificador único y tipo correspondiente.
    //         return [...prevCorrales, { ...nuevoCorral, id: idUnico}];
    //     });
    // };
    //
    // //modificarCorral: Se reemplaza el objeto corral por otro en la lista de corrales.
    // const modificarCorral = (corralModificado) => {
    //     setCorrales(
    //         corrales.map((corral) =>
    //             corral.id === corralModificado.id ? corralModificado : corral
    //         )
    //     );
    // };
    //
    // const eliminarCorral = (id) => {
    //     setCorrales(corrales.filter((corral) => corral.id !== id));
    // };

    return (
        <CorralesContext.Provider value={{ corrales, agregarCorral, modificarCorral, eliminarCorral }}>
            {children}
        </CorralesContext.Provider>
    );
};
CorralesProvider.propTypes = {
    children: PropTypes.node.isRequired,
};