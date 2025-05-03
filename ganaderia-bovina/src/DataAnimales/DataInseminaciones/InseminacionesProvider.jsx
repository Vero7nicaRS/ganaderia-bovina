/*
* ------------------------------------------ InseminacionesProvider.jsx: ------------------------------------------
* Funcionalidad: importa el contexto.
* Se emplea para que el listado de inseminaciones se encuentre disponible en las diferentes páginas.
*
* Se separa el Context del Provider porque se espera que cada archivo solo exporte componentes.
* -----------------------------------------------------------------------------------------------------------
* */
import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {InseminacionesContext} from "./InseminacionesContext.jsx";
import api from "../../api.js";

export const InseminacionesProvider = ({children}) => {

    //setInseminaciones permite actualizar el estado de inseminaciones (evitando modificar el estado actual "inseminaciones").
    const [inseminaciones, setInseminaciones] =  useState([]);

    // Se cargan los datos de las inseminaciones que están en el backend.
    useEffect(() => {
        api.get("/listainseminaciones/")
            .then(response => {
                setInseminaciones(response.data);
            })
            .catch(error => {
                console.error("Error al cargar las inseminaciones:", error);
            });
    }, []);

    /*
    * ----------------------------------------------------------------------------------------------
    *                    agregarCorral: AGREGAR (CORRAL) DESDE BACKEND del CORRAL (PUT)
    * ----------------------------------------------------------------------------------------------
    */
    const agregarInseminacion = async (nuevaInseminacion) => {
        try {
            const response = await api.post("/listainseminaciones/", nuevaInseminacion);
            setInseminaciones(prev => [...prev, response.data]);
            return response.data; // Se devuelve la inseminación con toda su información (incluyendo: id y codigo)
        } catch (error) {
            console.error("Error al crear la inseminación:", error.response?.data || error.message);
            throw error;
        }
    };
    /*
    * ----------------------------------------------------------------------------------------------
    *                       modificarCorral: ELIMINACIÓN del CORRAL (DELETE)
    * ----------------------------------------------------------------------------------------------
    */
    const modificarInseminacion = async (inseminacionModificada) => {
        try {
            const response = await api.put(`/listainseminaciones/${inseminacionModificada.id}/`, inseminacionModificada);
            setInseminaciones(prev =>
                prev.map(corral => corral.id === inseminacionModificada.id ? response.data : corral)
            );
            return response.data;
        } catch (error) {
            console.error("Error al modificar la inseminación:", error.response?.data || error.message);
            throw error;
        }
    };
    /*
    * ----------------------------------------------------------------------------------------------
    *                       eliminarInseminacion: ELIMINACIÓN de la INSEMINACION (DELETE)
    * ----------------------------------------------------------------------------------------------
    */
    const eliminarInseminacion = async (id) => {
        try {
            await api.delete(`/listainseminaciones/${id}/`);
            setInseminaciones(prev =>
                prev.filter(corral => corral.id !== id));
        } catch (error) {
            console.error("Error al eliminar la inseminación:", error.response?.data || error.message);
        }
    };

    // const agregarInseminacion = (nuevaInseminacion) => {
    //
    //     // Cálculo del identificador: es necesario que cada inseminación añadida tenga un identificador único (ID).
    //     setInseminaciones(prevInseminaciones => {
    //         // 1. Se asegura que el tipo esté definido.
    //         const tipoInseminacion = nuevaInseminacion.tipo || "Inseminación";
    //
    //         // 2. Se fitra por las inseminaciones existentes.
    //         const idsNumericos = prevInseminaciones
    //             .filter(inseminacion => inseminacion.id.startsWith("I-")) // Solo inseminaciones.
    //             .map(inseminacion => parseInt(inseminacion.id.split("-")[1])) // Se extrae el número del identificador (ID) pasándolo a entero.
    //             .filter(num => !isNaN(num));
    //
    //         // 3. Definir el siguiente ID disponible: se escoge el último Identificador y se le añade 1.
    //         const siguienteId = idsNumericos.length > 0 ? Math.max(...idsNumericos) + 1 : 1;
    //
    //         // 4. Se define cómo va a ser el identificador "I-num".
    //         const idUnico = `I-${siguienteId}`;
    //
    //         // 5. Se añade la nueva inseminación a la lista de inseminaciones existentes (prevInseminaciones) y
    //         // esa inseminación nueva (nuevaInseminacion) contiene los datos pasados por el argumento y se le indica
    //         // el identificador único y tipo correspondiente.
    //         return [...prevInseminaciones, { ...nuevaInseminacion, id: idUnico, tipo: tipoInseminacion }];
    //     });
    // };
    //
    // const modificarInseminacion = (inseminacionModificado) => {
    //     setInseminaciones(
    //         inseminaciones.map((inseminacion) =>
    //             inseminacion.id === inseminacionModificado.id ? inseminacionModificado : inseminacion
    //         )
    //     );
    // };
    //
    // const eliminarInseminacion = (id) => {
    //     setInseminaciones(inseminaciones.filter((inseminacion) => inseminacion.id !== id));
    // };

    return (
        <InseminacionesContext.Provider value={{ inseminaciones, agregarInseminacion, modificarInseminacion, eliminarInseminacion }}>
            {children}
        </InseminacionesContext.Provider>
    );
};
InseminacionesProvider.propTypes = {
    children: PropTypes.node.isRequired,
};