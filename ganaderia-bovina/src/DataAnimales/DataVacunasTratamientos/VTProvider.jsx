/*
* ------------------------------------------ VTProvider.jsx: ------------------------------------------
* Funcionalidad: importa el contexto.
* Se emplea para que el listado de vacunas y/o tratamientos se encuentre disponible
* en las diferentes páginas.
*
* Se separa el Context del Provider porque se espera que cada archivo solo exporte componentes.
* -----------------------------------------------------------------------------------------------------------
* */

import PropTypes from "prop-types";
import {VTContext} from "./VTContext.jsx";
import {useEffect, useState} from "react";
import api from "../../api.js";
import {useAuthContext} from "../../authentication/AuthContext.jsx";
export const VtProvider = ({children}) => {
    const [vt, setVT] = useState([]);
    const { accessToken } = useAuthContext();
    // Se cargan los datos de las vacunas/tratamientos del inventario que están en el backend.
    useEffect(() => {
        if (!accessToken) return;
        api.get("/inventariovt/")
            .then(response => {
                setVT(response.data);
            })
            .catch(error => {
                console.error("Error al cargar el inventario de vacunas/tratamientos:", error);
            });
    }, [accessToken]);

    /*
    * ----------------------------------------------------------------------------------------------
    *                    agregarVT: AGREGAR (VT) DESDE BACKEND del VT (POST)
    * ----------------------------------------------------------------------------------------------
    */
    const agregarVT = async (nuevoVT) => {
        try {
            // Se añade la vacuna/tratamiento en el backend.
            const response = await api.post("/inventariovt/", nuevoVT);

            // Se añade la vacuna/tratamiento en el contexto: aparece en la lista de vacunas/tratamientos.
            setVT(prev => [...prev, response.data]);
            return response.data; // Se devuelve la vacuna/tratamiento con toda su información (incluyendo: id y codigo)
        } catch (error) {
            console.error("Error al crear la vacuna/tratamiento:", error.response?.data || error.message);
            throw error;
        }
    };
    /*
    * ----------------------------------------------------------------------------------------------
    *                       modificarToro: ELIMINACIÓN del VT (DELETE)
    * ----------------------------------------------------------------------------------------------
    */
    const modificarVT = async (vtModificado) => {
        try {
            // Se actualiza la vacuna/tratamiento en el backend.
            const response = await api.put(`/inventariovt/${vtModificado.id}/`, vtModificado);

            // Se actualiza la vacuna/tratamiento en el contexto.
            setVT(prev =>
                prev.map(vactrac => vactrac.id === vtModificado.id ? response.data : vactrac)
            );
            return response.data;
        } catch (error) {
            console.error("Error al modificar la vacuna/tratamiento:", error.response?.data || error.message);
            throw error;
        }
    };
    /*
    * ----------------------------------------------------------------------------------------------
    *                       eliminarVT: ELIMINACIÓN del VT (DELETE)
    * ----------------------------------------------------------------------------------------------
    */
    const eliminarVT = async (id, desdeBackend) => {
        try {
            if (desdeBackend) {
                // Se borra del backend.
                await api.delete(`/inventariovt/${id}/`);
            }
            // Se actualiza el contexto: desaparece la vacuna/tratamiento del listado de vacunas/tratamientos.
            setVT(prev =>
                prev.filter(vactrac => vactrac.id !== id));
        } catch (error) {
            console.error("Error al eliminar la vacuna/tratamiento:", error.response?.data || error.message);
        }
    };

    // Se encarga de actualizar los datos de un tratamiento/vacuna en el contexto (lista de vacunas/tratamientos) gracias al map.
    const actualizarVTEnContexto = (vtActualizado) => {
        /* Se recorren todos los tratamientos/vacunas del inventario, y en el momento que esa vacuna/tratamiento que haya sido pasado por parámetro
            coincida con uno existente, se reemplaza ese vacuna/tratamiento por el nuevo
            (que es el mismo pero con los datos actualizados)
        * */
        setVT(prev =>
            prev.map(vactrac =>
                vactrac.id === vtActualizado.id ? vtActualizado : vactrac
            )
        );
    };

    // Se carga el inventario de vacunas y tratamientos correctamente
    const obtenerInventarioVT = async () => {
        try {
            const response = await api.get('/inventariovt/');
            setVT(response.data);
        } catch (error) {
            console.error("Error al cargar el listado de vacunas/tratamientos del inventario:", error);
        }
    };
    // const agregarVT = (nuevoVT) => {
    //
    //     if (!nuevoVT.nombre) {
    //         console.error("El nombre de la vacuna/tratamiento no está definido.");
    //         return;
    //     }
    //     // setVT([...vt, nuevoVT]); No le estoy asignando ningún identificador.
    //
    //     // Cálculo del identificador: es necesario que cada vacuna/tratamiento añadido tenga un identificador único
    //     // que en este caso, es el nombre de la vacuna/tratamiento.
    //
    //     // 1. El nombre se convierte a mayúsculas para evitar posibles inconvenientes con las mayúsculas y minúsculas.
    //     const nombreMayuscula = nuevoVT.nombre.toUpperCase();
    //     // 2. Se comprueba que el nombre de la vacuna/tratamiento que se desea agregar sea nuevo.
    //     // Para ello, se comprueba si existe esa vacuna/tratamiento en mayúsculas con las vacunas/tratamientos existentes en mayúscula.
    //     const existeVT = vt.some(v => v.nombre.toUpperCase() === nombreMayuscula);
    //
    //     if(existeVT){
    //         console.error("Existe una vacuna/tratamiento con este mismo nombre.");
    //         return;
    //     }
    //
    //     // 1. Se obtiene el último identificador (ID) asignado a las vacunas/tratamientos
    //     // const siguienteId = vt.length > 0 ? Math.max(...vt.map(v => parseInt(v.id.replace("VT-", "")))) : 0;
    //     const siguienteId = vt.length > 0 ? Math.max(...vt.map(v => parseInt(v.id.replace("VT-", "")))) + 1 : 1;
    //
    //     // 2. Se define el prefijo para una vacuna/tratamiento (VT-)
    //     const prefijoID = 'VT-';
    //
    //     // 3. Se define cómo va a ser el identificador "VT-num"
    //     const idUnico = `${prefijoID}${siguienteId}`;
    //
    //     // 4. Se crea el nuevo tratamiento/vacuna con el identificador único correspondiente.
    //     setVT([...vt, { ...nuevoVT, id: idUnico}]);
    // };
    //
    // const modificarVT = (vtModificado) => {
    //     setVT(
    //         vt.map((vt) =>
    //             vt.id === vtModificado.id ? vtModificado : vt
    //         )
    //     );
    // };
    //
    // const eliminarVT = (id) => {
    //     setVT(vt.filter((vt) => vt.id !== id));
    // };

    return (
        <VTContext.Provider value={{ vt, agregarVT, modificarVT, eliminarVT,
                                     actualizarVTEnContexto, obtenerInventarioVT }}>
            {children}
        </VTContext.Provider>
    );


};

VtProvider.propTypes = {
    children: PropTypes.node.isRequired,
};