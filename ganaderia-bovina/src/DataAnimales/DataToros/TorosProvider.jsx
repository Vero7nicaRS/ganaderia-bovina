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
*                    agregarToro: AGREGAR (TORO) DESDE BACKEND del TORO (PUT)
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
*                       modificarToro: ELIMINACIÓN del TORO (DELETE)
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

    //  const [animalesToros, setAnimalesToros] = useState(torosMock);
    // const agregarAnimal = (nuevoToro) => {
    //
    //     // Cálculo del identificador: es necesario que cada animal añadido tenga un identificador único (ID).
    //     setAnimalesToros(prevAnimalesToros => {
    //         // 1. Se asegura que el tipo esté definido
    //         const tipoAnimal = nuevoToro.tipo || "Toro";
    //
    //         // 2. Se fitra por los toros existentes
    //         const idsNumericos = prevAnimalesToros
    //             .filter(animal => animal.id.startsWith("T-")) // Solo toros
    //             .map(animal => parseInt(animal.id.split("-")[1])) // Se extrae el número del identificador (ID)
    //             .filter(num => !isNaN(num));
    //
    //         // 3. Definir el siguiente ID disponible
    //         const siguienteId = idsNumericos.length > 0 ? Math.max(...idsNumericos) + 1 : 1;
    //
    //         // 4. Se define cómo va a ser el identificador "T-num"
    //         const idUnico = `T-${siguienteId}`;
    //
    //         // 5. Se crea el nuevo animal (TORO) con el identificador único y tipo correspondiente
    //         return [...prevAnimalesToros, { ...nuevoToro, id: idUnico, tipo: tipoAnimal }];
    //     });
    //
    //     /* FORMA ANTERIOR: La forma en la que se implementaba anteriormente podría dar problemas
    //     con el identificador en el futuro (IDs duplicados), ya que se basaba en la CANTIDAD de toros y le sumaba uno.
    //     Pero si se cambiara el modo en el que se hace la eliminación, podría dar problemas.
    //     La solución a este problema es seleccionar el ID más alto y sumarle 1.
    //
    //     // Cálculo del identificador: es necesario que cada animal añadido tenga un identificador único (ID).
    //     //
    //     // // 1. Se obtiene el último identificador (ID) asignado al animal (toro)
    //     // const animalesDeTipo = animalesTorosToros.filter(animal => animal.tipo === nuevoToro.tipo);
    //     //
    //     // // 2. El ID será el siguiente al último identificador, es decir, actúa de manera secuencial.
    //     // const siguienteId = animalesTorosDeTipo.length + 1;
    //     //
    //     // // 3. Se define el prefijo par el TORO (T).
    //     // const prefijoID = "T-";
    //     //
    //     // // 4. Se define cómo va a ser el identificador "T-num"
    //     // const idUnico = `${prefijoID}${siguienteId}`;
    //     //
    //     // // 5. Se crea el nuevo animal (TORO) con el identificador único correspondiente.
    //     // setAnimalesToros([...animalesToros, { ...nuevoToro, id: idUnico}]);
    //
    //      */
    // };
    //
    // const modificarAnimal = (animalModificado) => {
    //     setAnimalesToros(
    //         animalesToros.map((animal) =>
    //             animal.id === animalModificado.id ? animalModificado : animal
    //         )
    //     );
    // };
    //
    // const eliminarAnimal = (id) => {
    //     setAnimalesToros(animalesToros.filter((animal) => animal.id !== id));
    // };

    return (
        <TorosContext.Provider value={{ animalesToros, agregarToro, modificarToro, eliminarToro, actualizarToroEnContexto }}>
            {children}
        </TorosContext.Provider>
    );
};
TorosProvider.propTypes = {
    children: PropTypes.node.isRequired,
};