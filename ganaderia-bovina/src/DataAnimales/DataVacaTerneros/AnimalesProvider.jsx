import {useEffect, useState} from "react";
import {animalesMock} from "./AnimalesMock.jsx";
import {AnimalesContext} from "./AnimalesContext.jsx";
import PropTypes from "prop-types"; //Se usa prop-types para definir children.
import api from "../../api.js"
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

    // Se cargan los datos de los animales que están en el backend.
    useEffect(() => {
        api.get("/animales/")
            .then(response => {
                setAnimales(response.data);
            })
            .catch(error => {
                console.error("Error al cargar animales:", error);
            });
    }, []);

/*
* ----------------------------------------------------------------------------------------------
*                    agregarAnimal: AGREGAR (VACA/TERNERO) DESDE BACKEND del ANIMAL (PUT)
* ----------------------------------------------------------------------------------------------
*/

    const agregarAnimal = async (nuevoAnimal) => {
        try {
            // Se crea un nuevo animal en el backend
            const response = await api.post("/animales/", nuevoAnimal);
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
            // Se actualiza el animal en el backend
            const response = await api.put(`/animales/${animalModificado.id}/`, animalModificado);
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

    // const agregarAnimal = (nuevoAnimal) => {
    //
    //     if (!nuevoAnimal.tipo) {
    //         console.error("El tipo de animal no está definido.");
    //         return;
    //     }
    //     // setAnimales([...animales, nuevoAnimal]); No le estoy asignando ningún identificador.
    //     // Cálculo del identificador: es necesario que cada animal añadido tenga un identificador único (ID).
    //
    //     // 1. Se obtiene el último identificador (ID) asignado al animal (vaca/ternero)
    //     // Se emplea filter para poder agrupar a las vacas y terneros y seleccionar al último de estos
    //     // permitiendo identificar al animal en base a su tipo.
    //     // Ej: 12 vacas y 8 terneros --> El siguiente identificador será V-13 y T-9
    //     const animalesDeTipo = animales.filter(animal => animal.tipo === nuevoAnimal.tipo);
    //
    //     // 2. El ID será el siguiente al último identificador, es decir, actúa de manera secuencial.
    //     const siguienteId = animalesDeTipo.length + 1;
    //
    //     // 3. Se define el prefijo dependiendo si es una VACA (V-) o un TERNERO (C-).
    //     const prefijoID = nuevoAnimal.tipo === "Vaca" ? "V-" : "C-";
    //
    //     // 4. Se define cómo va a ser el identificador "V-num" / "C-num"
    //     const idUnico = `${prefijoID}${siguienteId}`;
    //
    //     // 5. Se crea el nuevo animal (VACA o TERNERO) con el identificador único correspondiente.
    //     setAnimales([...animales, { ...nuevoAnimal, id: idUnico}]);
    //
    //     return nuevoAnimal;
    // };
    //
    // const modificarAnimal = (animalModificado) => {
    //     setAnimales(
    //         animales.map((animal) =>
    //             animal.id === animalModificado.id ? animalModificado : animal
    //         )
    //     );
    // };
    //
    // const eliminarAnimal = (id) => {
    //     setAnimales(animales.filter((animal) => animal.id !== id));
    // };

    return (
        <AnimalesContext.Provider value={{ animales, agregarAnimal, modificarAnimal, eliminarAnimal, actualizarAnimalEnContexto }}>
            {children}
        </AnimalesContext.Provider>
    );
};
AnimalesProvider.propTypes = {
    children: PropTypes.node.isRequired,
};