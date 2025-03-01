/*
* ------------------------------------------ ComprobarCamposSimulacion.jsx: ------------------------------------------
* Funcionalidad: se emplea para mostrar un mensaje de error y el campo en rojo.
* Se le pasa como argumento datosSimulacion(objeto) y listadoCorral(lista de todos los corrales)
* ERRORES:
*  - Indicar que el campo es obligatorio.
* -----------------------------------------------------------------------------------------------------------
* */

export const ComprobarCamposFormularioCorral = (datosAnimal) => {
    const erroresTemp = {};

    // Validaciones comunes para todos los corrales
    if (!datosAnimal.toro) {
        // erroresTemp.toro = "El identificador del toro es obligatorio";
        erroresTemp.toro = "Campo obligatorio";
    }

    if (!datosAnimal.vaca) {
        // erroresTemp.vaca = "El identificador de la vaca es obligatorio";
        erroresTemp.vaca = "Campo obligatorio";
    }

    return erroresTemp; // Devuelve los errores encontrados
};
