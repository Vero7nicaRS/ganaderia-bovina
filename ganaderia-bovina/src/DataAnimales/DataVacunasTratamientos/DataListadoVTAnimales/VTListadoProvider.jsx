/*
* ------------------------------------------ VTListadoProvider.jsx: ------------------------------------------
* Funcionalidad: importa el contexto.
* Se emplea para que el listado de vacunas y/o tratamientos de los animales que se encuentren disponible
* en las diferentes páginas.
*
* Se separa el Context del Provider porque se espera que cada archivo solo exporte componentes.
* -----------------------------------------------------------------------------------------------------------
* */

import {useState} from "react";
import PropTypes from "prop-types";
import {VTListadoContext} from "./VTListadoContext.jsx";
import {vtListadoMock} from "./vtListadoMock.jsx";

export const VTListadoProvider = ({children}) => {

    //setVT_Animal permite actualizar el estado de vacunas/tratamientos del animal (evitando modificar el estado actual "vt_animal")
    const [vt_animal, setVT_Animal] = useState(vtListadoMock);

    const agregarVT_Animal = (nuevoVT_animal) => {

        // Cálculo del identificador: es necesario que cada vacuna/tratamiento añadida tenga un identificador único (ID).
        setVT_Animal(prevVTAnimal => {
            // 1. Se asegura que el tipo esté definido
            //const tipoVT_Animal = nuevoVT_animal.tipo || "Vacuna" || "Tratamiento";
            //No vale lo de arriba porque se evalua de IZQUIERDA a DERECHA.
            const tipoVT_Animal = nuevoVT_animal.tipo === "Tratamiento" || nuevoVT_animal.tipo === "Vacuna" ? nuevoVT_animal.tipo : "Vacuna";

            // 2. Se fitra por las vacunas/tratamientos "VT_Animal" existentes
            const idsNumericos = prevVTAnimal
                .filter(vt_animal => vt_animal.id.startsWith("VTA-")) // Solo vacunas/tratamientos
                .map(vt_animal => parseInt(vt_animal.id.split("-")[1])) // Se extrae el número del identificador (ID) pasándolo a entero.
                .filter(num => !isNaN(num));

            // 3. Definir el siguiente ID disponible: se escoge el último Identificador y se le añade 1.
            const siguienteId = idsNumericos.length > 0 ? Math.max(...idsNumericos) + 1 : 1;

            // 4. Se define cómo va a ser el identificador "I-num".
            const idUnico = `VTA-${siguienteId}`;

            // 5. Se añade la nueva inseminación a la lista de vacunas/tratamientos de animales existentes (prevVTAnimal) y
            // esa vacuna/tratamiento nueva del animal (nuevoVT_animal) contiene los datos pasados por el argumento y se le indica
            // el identificador único y tipo correspondiente.
            return [...prevVTAnimal, { ...nuevoVT_animal, id: idUnico, tipo: tipoVT_Animal }];
        });
    };

    const modificarVT_Animal = (vtModificado_Animal) => {
        setVT_Animal(
            vt_animal.map((vt_animal) =>
                vt_animal.id === vtModificado_Animal.id ? vtModificado_Animal : vt_animal
            )
        );
    };

    const eliminarVT_Animal = (id) => {
        setVT_Animal(vt_animal.filter((vt_animal) => vt_animal.id !== id));
    };

    return (
        <VTListadoContext.Provider value={{ vt_animal, agregarVT_Animal, modificarVT_Animal, eliminarVT_Animal }}>
            {children}
        </VTListadoContext.Provider>
    );
};
VTListadoProvider.propTypes = {
    children: PropTypes.node.isRequired,
};