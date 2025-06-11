import {useEffect, useState} from "react";
import {AnimalesContext} from "./AnimalesContext.jsx";
import PropTypes from "prop-types"; //Se usa prop-types para definir children.
import api from "../../api.js"
import {useAuthContext} from "../../authentication/AuthContext.jsx";
/*
* ------------------------------------------ AnimalesProvider.jsx: ------------------------------------------
* Funcionalidad: importa el contexto.
* Se emplea para que el listado de animales (vacas y/o terneros) se encuentre disponible
* en las diferentes páginas.
*
* Se separa el Context del Provider porque se espera que cada archivo solo exporte componentes.
* -----------------------------------------------------------------------------------------------------------
* */

export const AnimalesProvider = ({children}) => {
    const [animales, setAnimales] = useState([]);
    const { accessToken } = useAuthContext();
    // Se cargan los datos de los animales que están en el backend.
    useEffect(() => {
        if (!accessToken) return;
        api.get("/animales/")
            .then(response => {
                setAnimales(response.data);
            })
            .catch(error => {
                console.error("Error al cargar animales:", error);
            });
    }, [accessToken]);

/*
* ----------------------------------------------------------------------------------------------
*                    agregarAnimal: AGREGAR (VACA/TERNERO) DESDE BACKEND del ANIMAL (PUT)
* ----------------------------------------------------------------------------------------------
*/

    const agregarAnimal = async (nuevoAnimal) => {
        try {
            // Se crea un nuevo animal en el backend
            const response = await api.post("/animales/", nuevoAnimal);

            // Se actualiza el contexto: se añade un nuevo animal a la lista de vacas/terneros.
            setAnimales(prev => [...prev, response.data]);

            // Se obtienen los cambios realizados en los animales desde el backend para mostrarlos en el frontend.
            return response.data; // Se devuelve el animal con toda su información (incluyendo: id y codigo)
        } catch (error) {
            console.error("Error al crear animal:", error.response?.data || error.message);
            throw error;
        }
    };

/*
* ----------------------------------------------------------------------------------------------
*                     modificarAnimal: MODIFICACIÓN del ANIMAL (PUT)
* ----------------------------------------------------------------------------------------------
*/
    const modificarAnimal = async (animalModificado) => {
        try {
            // Se actualiza el animal en el backend.
            const response = await api.put(`/animales/${animalModificado.id}/`, animalModificado);

            // Se actualiza el animal en el contexto.
            setAnimales(prev =>
                 prev.map(animal => animal.id === animalModificado.id ? response.data : animal)
             );

            // Se recarga la lista de animales en el backend.
            //const updatedList = await api.get("/animales/");
            //setAnimales(updatedList.data); //Se actualiza el contexto.

            return response.data;
        } catch (error) {
            console.error("Error al modificar animal:", error.response?.data || error.message);
            throw error;
        }
    };

/*
* ----------------------------------------------------------------------------------------------
*                       eliminarAnimal: ELIMINACIÓN del ANIMAL (DELETE)
* ----------------------------------------------------------------------------------------------
*/
    const eliminarAnimal = async (id,desdeBackend) => {
        try {
            if (desdeBackend) {
                // Se borra del backend.
                await api.delete(`/animales/${id}/`);
            }

            // Se elimina del contexto al animal (se borra de la lista de animales y no aparece).
            setAnimales(prev => prev.filter(animal => animal.id !== id));
        } catch (error) {
            console.error("Error al eliminar animal:", error.response?.data || error.message);
        }
    };

    // Se encarga de actualizar los datos de un animal en el contexto (lista de animales) gracias al map.
    const actualizarAnimalEnContexto = (animalActualizado) => {
        /* Se recorren todos los animales y en el momento que el animal que haya sido pasado por parámetro
            coincida con uno existente, se reemplaza ese animal por el nuevo
            (que es el mismo pero con los datos actualizados)
            En el caso de la eliminación por "MUERTE" o "VENDIDA", se actualiza:
              - Estado.
              - Corral.
              - Comentario.
              - Fecha de eliminación.
        * */
        setAnimales(prev =>
            prev.map(animal =>
                animal.id === animalActualizado.id ? animalActualizado : animal
            )
        );
    };
    return (
        <AnimalesContext.Provider value={{ animales, agregarAnimal, modificarAnimal, eliminarAnimal, actualizarAnimalEnContexto }}>
            {children}
        </AnimalesContext.Provider>
    );
};
AnimalesProvider.propTypes = {
    children: PropTypes.node.isRequired,
};