/*
* ------------------------------------------ ComprobarCamposMovimientoCorral.jsx: ------------------------------------------
* Funcionalidad: se emplea para mostrar un mensaje de error y el campo en rojo.
* Se le pasa por argumento datosMovimiento (objeto) que contiene:
*    const datosMovimiento = {
            idAnimal: animalSeleccionado, // Donde tenemos guardado el animal que se ha seleccionado.
            corralDestino: corralDestino // Donde tenemos guardado el corral de destino seleccionad.
        };
*
* ERRORES GLOBALES :
*  - Indicar que el campo es obligatorio.
*
*  */
export const ComprobarCamposMovimientoCorral = (datosMovimiento) => {
    const erroresTemp = {};

    // Validaciones comunes para todos los movimientos de corral
    if (!datosMovimiento.idAnimal?.trim()) {
        // erroresTemp.idAnimal = "El campo idAnimal es obligatorio";
        erroresTemp.idAnimal = "Campo obligatorio";
    }

    if (!datosMovimiento.corralDestino?.trim()) {
        // erroresTemp.corralDestino = "El campo corralDestino es obligatorio";
        erroresTemp.corralDestino = "Campo obligatorio";
    }

    return erroresTemp; // Devuelve los errores encontrados
};