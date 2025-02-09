export const ComprobarCamposFormularioAnimal = (datosAnimal, tipoAnimal) => {
    const erroresTemp = {};

    // Validaciones comunes para todos los animales
    if (!datosAnimal.nombre?.trim()) {
        // erroresTemp.nombre = "El campo nombre es obligatorio";
        erroresTemp.nombre = "Campo obligatorio";
    }
    if (!datosAnimal.celulasSomaticas) {
        // erroresTemp.celulasSomaticas = "El campo células somáticas es obligatorio";
        erroresTemp.celulasSomaticas = "Campo obligatorio";
    }
    if (!datosAnimal.calidadPatas) {
        // erroresTemp.calidadPatas = "El campo calidad de patas es obligatorio";
        erroresTemp.calidadPatas = "Campo obligatorio";
    }

    if (!datosAnimal.calidadUbres) {
        // erroresTemp.calidadUbres = "El campo calidad de ubres es obligatorio";
        erroresTemp.calidadUbres = "Campo obligatorio";
    }

    if (!datosAnimal.grasa) {
        // erroresTemp.grasa = "El campo grasa es obligatorio";
        erroresTemp.grasa = "Campo obligatorio";
    }

    if (!datosAnimal.proteinas) {
        // erroresTemp.proteinas = "El campo proteinas es obligatorio";
        erroresTemp.proteinas = "Campo obligatorio";
    }

    // Validaciones específicas para Vacas
    if (tipoAnimal === "Vaca") {

        if (!datosAnimal.fechaNacimiento) {
            // erroresTemp.fechaNacimiento = "La fecha de nacimiento es obligatorio";
            erroresTemp.fechaNacimiento = "Campo obligatorio";
        }

        if (!datosAnimal.padre) {
            // erroresTemp.padre = "El identificador del padre es obligatorio";
            erroresTemp.padre = "Campo obligatorio";
        }

        if (!datosAnimal.madre) {
            // erroresTemp.madre = "El identificador de la madre es obligatorio";
            erroresTemp.madre = "Campo obligatorio";
        }

    }

    // Validaciones específicas para Toros
    if (tipoAnimal === "Toro") {
        if (!datosAnimal.cantidadSemen) {
            // erroresTemp.cantidadSemen = "El campo cantidad de semen es obligatorio";
            erroresTemp.cantidadSemen = "Campo obligatorio";
        }
    }

    return erroresTemp; // Devuelve los errores encontrados
};
