/*
* ------------------------------------------ TorosProvider.jsx: ------------------------------------------
* Funcionalidad: importa el contexto.
* Se emplea para que el listado de animales (toros) se encuentre disponible
* en las diferentes páginas.
*
* Se separa el Context del Provider porque se espera que cada archivo solo exporte componentes.
* -----------------------------------------------------------------------------------------------------------
* */

import {useEffect, useState} from "react";
import {torosMock} from "./TorosMock.jsx"
import PropTypes from "prop-types";
import {TorosContext} from "./TorosContext.jsx";
import api from "../../api.js";

export const TorosProvider = ({children}) => {
    const [animalesToros, setAnimalesToros] = useState([]);

    // Se cargan los datos de los toros que están en el backend.
    useEffect(() => {
        api.get("/toros/")
            .then(response => {
                setAnimalesToros(response.data);
            })
            .catch(error => {
                console.error("Error al cargar los toros:", error);
            });
    }, []);

/*
* ----------------------------------------------------------------------------------------------
*                    agregarToro: AGREGAR (TORO) DESDE BACKEND del TORO (POST)
* ----------------------------------------------------------------------------------------------
*/
    const agregarToro = async (nuevoToro) => {
        try {
            // Se añade el toro en el backend.
            const response = await api.post("/toros/", nuevoToro);

            // Se añade el toro en el contexto: aparece en la lista de toros.
            setAnimalesToros(prev => [...prev, response.data]);
            return response.data; // Se devuelve el toro con toda su información (incluyendo: id y codigo)
        } catch (error) {
            console.error("Error al crear toro:", error.response?.data || error.message);
            throw error;
        }
    };
/*
* ----------------------------------------------------------------------------------------------
*                       modificarToro: MODIFICACIÓN del TORO (PUT)
* ----------------------------------------------------------------------------------------------
*/
    const modificarToro = async (animalModificado) => {
        try {
            // Se actualiza el toro en el backend.
            const response = await api.put(`/toros/${animalModificado.id}/`, animalModificado);

            // Se actualiza el toro en el contexto.
            setAnimalesToros(prev =>
                prev.map(toro => toro.id === animalModificado.id ? response.data : toro)
            );
            return response.data;
        } catch (error) {
            console.error("Error al modificar toro:", error.response?.data || error.message);
            throw error;
        }
    };
/*
* ----------------------------------------------------------------------------------------------
*                       eliminarToro: ELIMINACIÓN del TORO (DELETE)
* ----------------------------------------------------------------------------------------------
*/
    const eliminarToro = async (id, desdeBackend) => {
        try {
            if (desdeBackend) {
                // Se borra del backend.
                await api.delete(`/animales/${id}/`);
            }
            // Se actualiza el contexto: desaparece el toro del listado de toros.
            setAnimalesToros(prev =>
                prev.filter(toro => toro.id !== id));
        } catch (error) {
            console.error("Error al eliminar toro:", error.response?.data || error.message);
        }
    };

    // Se encarga de actualizar los datos de un animal en el contexto (lista de animales) gracias al map.
    const actualizarToroEnContexto = (toroActualizado) => {
        /* Se recorren todos los animales y en el momento que el animal que haya sido pasado por parámetro
            coincida con uno existente, se reemplaza ese animal por el nuevo
            (que es el mismo pero con los datos actualizados)
            En el caso de la eliminación por "MUERTE" o "VENDIDA", se actualiza:
              - Estado.
              - Corral.
              - Comentario.
              - Fecha de eliminación.
        * */
        setAnimalesToros(prev =>
            prev.map(toro =>
                toro.id === toroActualizado.id ? toroActualizado : toro
            )
        );
    };

    // Se carga el listado de toros correctamente
    const obtenerListadoToros = async () => {
        try {
            const response = await api.get('/toros/');
            setAnimalesToros(response.data);
        } catch (error) {
            console.error("Error al cargar el listado de toros del inventario:", error);
        }
    };

    return (
        <TorosContext.Provider value={{ animalesToros, agregarToro, modificarToro, eliminarToro,
                                        actualizarToroEnContexto, obtenerListadoToros }}>
            {children}
        </TorosContext.Provider>
    );
};
TorosProvider.propTypes = {
    children: PropTypes.node.isRequired,
};