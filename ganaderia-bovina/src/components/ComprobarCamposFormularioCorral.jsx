/*
* ------------------------------------------ ComprobarCamposFormularioCorral.jsx: ------------------------------------------
* Funcionalidad: se emplea para mostrar un mensaje de error y el campo en rojo.
* Se le pasa como argumento datosCorral (objeto) y listadoCorral(lista de todos los corrales)
* ERRORES:
*  - Indicar que el campo es obligatorio.
*  - El campo "nombre" debe ser único, es decir, no puede haber más corrales con el mismo nombre.
* -----------------------------------------------------------------------------------------------------------
* */

export const ComprobarCamposFormularioCorral = (datosCorral, listadoCorral) => {
    const erroresTemp = {};

    // Validaciones comunes para todos los corrales
    if (!datosCorral.nombre?.trim()) {
        // erroresTemp.nombre = "El campo nombre es obligatorio";
        erroresTemp.nombre = "Campo obligatorio";
    }else {
        // Verificar si el nombre ya existe en la lista de corrales
        const nombreMayuscula = datosCorral.nombre.toUpperCase();
        const existeCorral = listadoCorral.some(v => v.nombre.toUpperCase() === nombreMayuscula);
        if (existeCorral) {
            erroresTemp.nombre = "Ya existe un corral con este nombre.";
        }
    }

    return erroresTemp; // Devuelve los errores encontrados
};
