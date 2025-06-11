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
import {useAuthContext} from "../../authentication/AuthContext.jsx";

export const InseminacionesProvider = ({children}) => {

    //setInseminaciones permite actualizar el estado de inseminaciones (evitando modificar el estado actual "inseminaciones").
    const [inseminaciones, setInseminaciones] =  useState([]);
    const { accessToken } = useAuthContext();
    // Se cargan los datos de las inseminaciones que están en el backend.
    useEffect(() => {
        if (!accessToken) return;
        api.get("/listainseminaciones/")
            .then(response => {
                setInseminaciones(response.data);
            })
            .catch(error => {
                console.error("Error al cargar las inseminaciones:", error);
            });
    }, [accessToken]);

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
    return (
        <InseminacionesContext.Provider value={{ inseminaciones, agregarInseminacion, modificarInseminacion, eliminarInseminacion }}>
            {children}
        </InseminacionesContext.Provider>
    );
};
InseminacionesProvider.propTypes = {
    children: PropTypes.node.isRequired,
};