/*
* ------------------------------------------ VTListadoProvider.jsx: ------------------------------------------
* Funcionalidad: importa el contexto.
* Se emplea para que el listado de vacunas y/o tratamientos de los animales que se encuentren disponible
* en las diferentes páginas.
*
* Se separa el Context del Provider porque se espera que cada archivo solo exporte componentes.
* -----------------------------------------------------------------------------------------------------------
* */

import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {VTListadoContext} from "./VTListadoContext.jsx";
import api from "../../../api.js";
import {useAuthContext} from "../../../authentication/AuthContext.jsx";

export const VTListadoProvider = ({children}) => {

    /*setVT_Animal permite actualizar el estado de vacunas/tratamientos del animal
    (evitando modificar el estado actual "vt_animal") */
    const [vt_animal, setVT_Animal] = useState([]);
    const { accessToken } = useAuthContext();

    // Se cargan los datos de las vacunas/tratamientos suministradas que están en el backend.
    useEffect(() => {
        if (!accessToken) return;
        api.get("/vtanimales/")
            .then(response => {
                setVT_Animal(response.data);
            })
            .catch(error => {
                console.error("Error al cargar el inventario de vacunas/tratamientos suministradas:", error);
            });
    }, [accessToken]);

    /*
    * ----------------------------------------------------------------------------------------------
    *                    agregarVT_Animal: AGREGAR (VTAnimal) DESDE BACKEND del VTAnimal (POST)
    * ----------------------------------------------------------------------------------------------
    */
    const agregarVT_Animal = async (nuevoVTAnimal) => {
        try {
            // Se añade la vacuna/tratamiento en el backend.
            const response = await api.post("/vtanimales/", nuevoVTAnimal);

            // Se añade la vacuna/tratamiento en el contexto: aparece en la lista de vacunas/tratamientos suministrados.
            setVT_Animal(prev => [...prev, response.data]);
            return response.data; /* Se devuelve la vacuna/tratamiento suministrada
                                     con toda su información (incluyendo: id y codigo) */
        } catch (error) {
            console.error("Error al crear la vacuna/tratamiento suministrada:", error.response?.data || error.message);
            throw error;
        }
    };
    /*
    * ----------------------------------------------------------------------------------------------
    *                       modificarVT_Animal: ELIMINACIÓN del VTAnimal (DELETE)
    * ----------------------------------------------------------------------------------------------
    */
    const modificarVT_Animal = async (vtAnimalModificado) => {
        try {
            // Se actualiza la vacuna/tratamiento suministrado en el backend.
            const response = await api.put(`/vtanimales/${vtAnimalModificado.id}/`, vtAnimalModificado);

            // Se actualiza la vacuna/tratamiento suministrado en el contexto.
            setVT_Animal(prev =>
                prev.map(vtAnimal => vtAnimal.id === vtAnimalModificado.id ? response.data : vtAnimal)
            );
            return response.data;
        } catch (error) {
            console.error("Error al modificar la vacuna/tratamiento suministrada:", error.response?.data || error.message);
            throw error;
        }
    };
    /*
    * ----------------------------------------------------------------------------------------------
    *                       eliminarVT_Animal: ELIMINACIÓN del VTAnimal (DELETE)
    * ----------------------------------------------------------------------------------------------
    */
    const eliminarVT_Animal = async (id) => {
        try {
            // Se borra del backend.
                await api.delete(`/vtanimales/${id}/`);
            // Se actualiza el contexto: desaparece la vacuna/tratamiento del listado de vacunas/tratamientos suministrados.
            setVT_Animal(prev =>
                prev.filter(vactracsuministrada => vactracsuministrada.id !== id));
        } catch (error) {
            console.error("Error al eliminar la vacuna/tratamiento suministrada:", error.response?.data || error.message);
        }
    };

    // Se encarga de actualizar los datos de un tratamiento/vacuna en el contexto (lista de vacunas/tratamientos) gracias al map.
    const actualizarVTAnimalEnContexto = (vtAnimalActualizado) => {
        /* Se recorren todos los tratamientos/vacunas suministrados a los animales, y en el momento que esa vacuna/tratamiento que haya sido pasado por parámetro
            coincida con uno existente, se reemplaza ese vacuna/tratamiento suministrada por el nuevo
            (que es el mismo pero con los datos actualizados)
        * */
        setVT_Animal(prev =>
            prev.map(vactrac =>
                vactrac.id === vtAnimalActualizado.id ? vtAnimalActualizado : vactrac
            )
        );
    };

    // const agregarVT_Animal = (nuevoVT_animal) => {
    //
    //     // Cálculo del identificador: es necesario que cada vacuna/tratamiento añadida tenga un identificador único (ID).
    //     setVT_Animal(prevVTAnimal => {
    //         // 1. Se asegura que el tipo esté definido
    //         //const tipoVT_Animal = nuevoVT_animal.tipo || "Vacuna" || "Tratamiento";
    //         //No vale lo de arriba porque se evalua de IZQUIERDA a DERECHA.
    //         const tipoVT_Animal = nuevoVT_animal.tipo === "Tratamiento" || nuevoVT_animal.tipo === "Vacuna" ? nuevoVT_animal.tipo : "Vacuna";
    //
    //         // 2. Se fitra por las vacunas/tratamientos "VT_Animal" existentes
    //         const idsNumericos = prevVTAnimal
    //             .filter(vt_animal => vt_animal.id.startsWith("VTA-")) // Solo vacunas/tratamientos
    //             .map(vt_animal => parseInt(vt_animal.id.split("-")[1])) // Se extrae el número del identificador (ID) pasándolo a entero.
    //             .filter(num => !isNaN(num));
    //
    //         // 3. Definir el siguiente ID disponible: se escoge el último Identificador y se le añade 1.
    //         const siguienteId = idsNumericos.length > 0 ? Math.max(...idsNumericos) + 1 : 1;
    //
    //         // 4. Se define cómo va a ser el identificador "I-num".
    //         const idUnico = `VTA-${siguienteId}`;
    //
    //         // 5. Se añade la nueva inseminación a la lista de vacunas/tratamientos de animales existentes (prevVTAnimal) y
    //         // esa vacuna/tratamiento nueva del animal (nuevoVT_animal) contiene los datos pasados por el argumento y se le indica
    //         // el identificador único y tipo correspondiente.
    //         return [...prevVTAnimal, { ...nuevoVT_animal, id: idUnico, tipo: tipoVT_Animal }];
    //     });
    // };
    //
    // const modificarVT_Animal = (vtModificado_Animal) => {
    //     setVT_Animal(
    //         vt_animal.map((vt_animal) =>
    //             vt_animal.id === vtModificado_Animal.id ? vtModificado_Animal : vt_animal
    //         )
    //     );
    // };
    //
    // const eliminarVT_Animal = (id) => {
    //     setVT_Animal(vt_animal.filter((vt_animal) => vt_animal.id !== id));
    // };

    return (
        <VTListadoContext.Provider value={{ vt_animal, agregarVT_Animal, modificarVT_Animal,
                                            eliminarVT_Animal, actualizarVTAnimalEnContexto }}>
            {children}
        </VTListadoContext.Provider>
    );
};
VTListadoProvider.propTypes = {
    children: PropTypes.node.isRequired,
};