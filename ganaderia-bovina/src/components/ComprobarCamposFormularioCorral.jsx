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

        /* OJO: cuando se modifica un corral puede ser que el nombre se mantenga, por tanto
        * hay que contemplar que el nombre puede ser igual que el que se está modificando.
        * Ejemplo:
        *                               VISUALIZAR
        * Nombre: Corral 01
        * Animales: Lola V-1, Sol V-32
        *
        *                                MODIFICAR
        * Nombre: Corral 01
        * Animales: Lola V-1, Sol T-32, Girasol T-12, Pepa V-5
        *
        * En esta situación, cuando guarde los cambios de modificar, me lo debe aceptar, ya que
        * quiero que el nombre "Corral 01" se mantenga y no tenga que ponerle un nuevo nombre.
        * */

        // Filtrar los corrales que no sean el que se está editando
        const listadoFiltrado = listadoCorral.filter(v => v.id !== datosCorral.id);
        // Verificar si el nombre ya existe en la lista filtrada
        const existeCorral = listadoFiltrado.some(v => v.nombre.toUpperCase() === nombreMayuscula);
        // const existeCorral = listadoCorral.some(v => v.nombre.toUpperCase() === nombreMayuscula);
        if (existeCorral) {
            erroresTemp.nombre = "Ya existe un corral con este nombre.";
        }
    }


    return erroresTemp; // Devuelve los errores encontrados
};
