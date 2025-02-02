import {useState} from "react";
import {animalesMock} from "./AnimalesMock.jsx";
import {AnimalesContext} from "./AnimalesContext.jsx";
import PropTypes from "prop-types"; //Se usa prop-types para definir children.

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
    const [animales, setAnimales] = useState(animalesMock);

    const agregarAnimal = (nuevoAnimal) => {

        if (!nuevoAnimal.tipo) {
            console.error("El tipo de animal no está definido.");
            return;
        }
        // setAnimales([...animales, nuevoAnimal]); No le estoy asignando ningún identificador.


        // Cálculo del identificador: es necesario que cada animal añadido tenga un identificador único (ID).

        // 1. Se obtiene el último identificador (ID) asignado al animal (vaca/ternero)
        // Se emplea filter para poder agrupar a las vacas y terneros y seleccionar al último de estos
        // permitiendo identificar al animal en base a su tipo.
        // Ej: 12 vacas y 8 terneros --> El siguiente identificador será V-13 y T-9
        const animalesDeTipo = animales.filter(animal => animal.tipo === nuevoAnimal.tipo);

        // 2. El ID será el siguiente al último identificador, es decir, actúa de manera secuencial.
        const siguienteId = animalesDeTipo.length + 1;

        // 3. Se define el prefijo dependiendo si es una VACA (V-) o un TERNERO (C-).
        const prefijoID = nuevoAnimal.tipo === "Vaca" ? "V-" : "C-";

        // 4. Se define cómo va a ser el identificador "V-num" / "C-num"
        const idUnico = `${prefijoID}${siguienteId}`;

        // 5. Se crea el nuevo animal (VACA o TERNERO) con el identificador único correspondiente.
        setAnimales([...animales, { ...nuevoAnimal, id: idUnico}]);
    };

    const modificarAnimal = (animalModificado) => {
        setAnimales(
            animales.map((animal) =>
                animal.id === animalModificado.id ? animalModificado : animal
            )
        );
    };

    const eliminarAnimal = (id) => {
        setAnimales(animales.filter((animal) => animal.id !== id));
    };

    return (
        <AnimalesContext.Provider value={{ animales, agregarAnimal, modificarAnimal, eliminarAnimal }}>
            {children}
        </AnimalesContext.Provider>
    );
};
AnimalesProvider.propTypes = {
    children: PropTypes.node.isRequired,
};