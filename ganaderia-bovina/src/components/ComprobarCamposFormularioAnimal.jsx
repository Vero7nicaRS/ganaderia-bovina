/*
* ------------------------------------------ ComprobarCamposFormularioAnimal.jsx: ------------------------------------------
* Funcionalidad: se emplea para mostrar un mensaje de error y el campo en rojo.
* Hay mensajes destinados a las vacas, toros o para ambos.
* ERRORES:
*  - Indicar que el campo es obligatorio.
* -----------------------------------------------------------------------------------------------------------
* */

export const ComprobarCamposFormularioAnimal = (datosAnimal, tipoAnimal, esModificar) => {
    const erroresTemp = {};

    // Validaciones comunes para todos los animales
    if (!datosAnimal.nombre?.trim()) {
        // erroresTemp.nombre = "El campo nombre es obligatorio";
        erroresTemp.nombre = "Campo obligatorio";
    }
    if (!datosAnimal.celulas_somaticas) {
        // erroresTemp.celulas_somaticas = "El campo células somáticas es obligatorio";
        erroresTemp.celulas_somaticas = "Campo obligatorio";
    }
    if (!datosAnimal.calidad_patas) {
        // erroresTemp.calidad_patas = "El campo calidad de patas es obligatorio";
        erroresTemp.calidad_patas = "Campo obligatorio";
    }
    if (!datosAnimal.calidad_ubres) {
        // erroresTemp.calidad_ubres = "El campo calidad de ubres es obligatorio";
        erroresTemp.calidad_ubres = "Campo obligatorio";
    }
    if (!datosAnimal.grasa) {
        // erroresTemp.grasa = "El campo grasa es obligatorio";
        erroresTemp.grasa = "Campo obligatorio";
    }
    if (!datosAnimal.proteinas) {
        // erroresTemp.proteinas = "El campo proteinas es obligatorio";
        erroresTemp.proteinas = "Campo obligatorio";
    }
    // Validaciones específicas para Vacas y Terneros
    if (tipoAnimal === "Vaca" || tipoAnimal === "Ternero") {

        if (!datosAnimal.fecha_nacimiento) {
            // erroresTemp.fecha_nacimiento = "La fecha de nacimiento es obligatorio";
            erroresTemp.fecha_nacimiento = "Campo obligatorio";
        }

        /* Si estamos creando y el campo no tiene valor, se muestra mensaje de error.
           En modificar no lo contemplamos porque su padre ha sido eliminado del sistema.
        */
        if (!datosAnimal.padre && !esModificar) {
            // erroresTemp.padre = "El identificador del padre es obligatorio";
            erroresTemp.padre = "Campo obligatorio";
        }
        /* Si estamos creando y el campo no tiene valor, se muestra mensaje de error.
           En modificar no lo contemplamos porque su madre ha sido eliminada del sistema.
        */
        if (!datosAnimal.madre && !esModificar) {
            // erroresTemp.madre = "El identificador de la madre es obligatorio";
            erroresTemp.madre = "Campo obligatorio";
        }

        if(!datosAnimal.corral){
            // erroresTemp.corral = "El corral es obligatorio";
            erroresTemp.corral = "Campo obligatorio";
        }

        if (!datosAnimal.produccion_leche) {
            // erroresTemp.produccion_leche = "El campo produccion de leche es obligatorio";
            erroresTemp.produccion_leche = "Campo obligatorio";
        }
    }

    // Validaciones específicas para Toros
    if (tipoAnimal === "Toro") {
        if (datosAnimal.cantidad_semen === "" || datosAnimal.cantidad_semen === null
            || Number(datosAnimal.cantidad_semen) < 0) {
            erroresTemp.cantidad_semen = "Campo obligatorio";
        }

        if (!datosAnimal.transmision_leche) {
            // erroresTemp.produccion_leche = "El campo transmisión de leche es obligatorio";
            erroresTemp.transmision_leche = "Campo obligatorio";
        }
    }

    return erroresTemp; // Devuelve los errores encontrados
};