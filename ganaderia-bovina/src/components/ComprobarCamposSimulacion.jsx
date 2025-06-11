/*
* ------------------------------------------ ComprobarCamposSimulacion.jsx: ------------------------------------------
* Funcionalidad: se emplea para mostrar un mensaje de error y el campo en rojo.
* Se le pasa como argumento datosSimulacion(objeto).
* ERRORES:
*  - Indicar que el campo es obligatorio.
* -----------------------------------------------------------------------------------------------------------
* */

export const ComprobarCamposSimulacion = (datosFormulario, vacasSeleccionadas) => {
    const erroresTemp = {};

    if (!datosFormulario.idToro) {
        erroresTemp.toro = "Campo obligatorio";
    }

    if (vacasSeleccionadas.length === 0) {
        erroresTemp.listaAnimales = "Campo obligatorio";
    }

    if (!datosFormulario.atributo_prioridad) {
        erroresTemp.atributo_prioridad = "Campo obligatorio";
    }

    return erroresTemp; // Devuelve los errores encontrados
};