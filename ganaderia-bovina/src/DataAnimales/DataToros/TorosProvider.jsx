/*
* ------------------------------------------ TorosProvider.jsx: ------------------------------------------
* Funcionalidad: importa el contexto.
* Se emplea para que el listado de animales (toros) se encuentre disponible
* en las diferentes páginas.
*
* Se separa el Context del Provider porque se espera que cada archivo solo exporte componentes.
* -----------------------------------------------------------------------------------------------------------
* */

import {useState} from "react";
import {torosMock} from "./TorosMock.jsx"
import PropTypes from "prop-types";
import {TorosContext} from "./TorosContext.jsx";

export const TorosProvider = ({children}) => {
    const [animales, setAnimales] = useState(torosMock);

    const agregarAnimal = (nuevoAnimal) => {
        // Para los toros no indicamos ningún tipo.
        // if (!nuevoAnimal.tipo) {
        //     console.error("El tipo de animal no está definido.");
        //     return;
        // }
        // setAnimales([...animales, nuevoAnimal]); No le estoy asignando ningún identificador.


        // Cálculo del identificador: es necesario que cada animal añadido tenga un identificador único (ID).

        // 1. Se obtiene el último identificador (ID) asignado al animal (toro)
        const animalesDeTipo = animales.filter(animal => animal.tipo === nuevoAnimal.tipo);

        // 2. El ID será el siguiente al último identificador, es decir, actúa de manera secuencial.
        const siguienteId = animalesDeTipo.length + 1;

        // 3. Se define el prefijo par el TORO (T).
        const prefijoID = "T-";

        // 4. Se define cómo va a ser el identificador "T-num"
        const idUnico = `${prefijoID}${siguienteId}`;

        // 5. Se crea el nuevo animal (TORO) con el identificador único correspondiente.
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
        <TorosContext.Provider value={{ animales, agregarAnimal, modificarAnimal, eliminarAnimal }}>
            {children}
        </TorosContext.Provider>
    );
};
TorosProvider.propTypes = {
    children: PropTypes.node.isRequired,
};