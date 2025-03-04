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
import {vtMock} from "./VTMock.jsx";
import {VTContext} from "./VTContext.jsx";
import {useState} from "react";
export const VtProvider = ({children}) => {
    const [vt, setVT] = useState(vtMock);

    const listaVT=vt;
    const agregarVT = (nuevoVT) => {

        if (!nuevoVT.nombre) {
            console.error("El nombre de la vacuna/tratamiento no está definido.");
            return;
        }
        // setVT([...vt, nuevoVT]); No le estoy asignando ningún identificador.

        // Cálculo del identificador: es necesario que cada vacuna/tratamiento añadido tenga un identificador único
        // que en este caso, es el nombre de la vacuna/tratamiento.

        // 1. El nombre se convierte a mayúsculas para evitar posibles inconvenientes con las mayúsculas y minúsculas.
        const nombreMayuscula = nuevoVT.nombre.toUpperCase();
        // 2. Se comprueba que el nombre de la vacuna/tratamiento que se desea agregar sea nuevo.
        // Para ello, se comprueba si existe esa vacuna/tratamiento en mayúsculas con las vacunas/tratamientos existentes en mayúscula.
        const existeVT = vt.some(v => v.nombre.toUpperCase() === nombreMayuscula);

        if(existeVT){
            console.error("Existe una vacuna/tratamiento con este mismo nombre.");
            return;
        }

        // 1. Se obtiene el último identificador (ID) asignado a las vacunas/tratamientos
        // const siguienteId = vt.length > 0 ? Math.max(...vt.map(v => parseInt(v.id.replace("VT-", "")))) : 0;
        const siguienteId = vt.length > 0 ? Math.max(...vt.map(v => parseInt(v.id.replace("VT-", "")))) + 1 : 1;

        // 2. Se define el prefijo para una vacuna/tratamiento (VT-)
        const prefijoID = 'VT-';

        // 3. Se define cómo va a ser el identificador "VT-num"
        const idUnico = `${prefijoID}${siguienteId}`;

        // 4. Se crea el nuevo tratamiento/vacuna con el identificador único correspondiente.
        setVT([...vt, { ...nuevoVT, id: idUnico}]);
    };

    const modificarVT = (vtModificado) => {
        setVT(
            vt.map((vt) =>
                vt.id === vtModificado.id ? vtModificado : vt
            )
        );
    };

    const eliminarVT = (id) => {
        setVT(vt.filter((vt) => vt.id !== id));
    };

    return (
        <VTContext.Provider value={{ vt, agregarVT, modificarVT, eliminarVT }}>
            {children}
        </VTContext.Provider>
    );


};

VtProvider.propTypes = {
    children: PropTypes.node.isRequired,
};