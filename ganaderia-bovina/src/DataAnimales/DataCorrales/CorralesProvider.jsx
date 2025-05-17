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

    return (
        <CorralesContext.Provider value={{ corrales, agregarCorral, modificarCorral, eliminarCorral }}>
            {children}
        </CorralesContext.Provider>
    );
};
CorralesProvider.propTypes = {
    children: PropTypes.node.isRequired,
};