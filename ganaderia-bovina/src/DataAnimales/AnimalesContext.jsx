/*
* ------------------------------------------ AnimalesContext.jsx: ------------------------------------------
* Funcionalidad: se emplea para que el listado de animales se encuentre disponible en las diferentes páginas.
* -----------------------------------------------------------------------------------------------------------
* */

import { createContext, useState } from "react";
import {animalesMock} from "./AnimalesMock.jsx";
export const AnimalesContext = createContext();

export const AnimalesProvider = ({ children }) => {
    const [animales, setAnimales] = useState(animalesMock);

    const agregarAnimal = (nuevoAnimal) => {

        if (!nuevoAnimal.tipo) {
            console.error("El tipo de animal no está definido.");
            return;
        }
        // setAnimales([...animales, nuevoAnimal]); No le estoy asignando ningún identificador.


        // Cálculo del identificador: es necesario que cada animal añadido tenga un identificador único (ID).

        // 1. Se obtiene el último identificador (ID) asignado al animal (vaca/ternero)
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
