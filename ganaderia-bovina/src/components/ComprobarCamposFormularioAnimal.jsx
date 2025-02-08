export const ComprobarCamposFormularioAnimal = (datosAnimal, tipoAnimal) => {
    const erroresTemp = {};

    // Validaciones comunes para todos los animales
    if (!datosAnimal.nombre?.trim()) {
        erroresTemp.nombre = "El nombre es obligatorio";
    }
    if (!datosAnimal.celulasSomaticas) {
        erroresTemp.celulasSomaticas = "El campo células somáticas es obligatorio";
    }
    if (!datosAnimal.calidadPatas) {
        erroresTemp.calidadPatas = "El campo calidad de patas es obligatorio";
    }

    if (!datosAnimal.calidadUbres) {
        erroresTemp.calidadUbres = "El campo calidad de ubres es obligatorio";
    }

    if (!datosAnimal.grasa) {
        erroresTemp.grasa = "El campo grasa es obligatorio";
    }

    if (!datosAnimal.proteinas) {
        erroresTemp.proteinas = "El campo proteinas es obligatorio";
    }

    // Validaciones específicas para Vacas
    if (tipoAnimal === "Vaca") {

        if (!datosAnimal.fechaNacimiento) {
            erroresTemp.fechaNacimiento = "La fecha de nacimiento es obligatoria";
        }

        if (!datosAnimal.padre) {
            erroresTemp.idToro = "El identificador del padre es obligatoria";
        }

        if (!datosAnimal.madre) {
            erroresTemp.idVaca = "El identificador de la madre es obligatorio";
        }

    }

    // Validaciones específicas para Toros
    if (tipoAnimal === "Toro") {
        if (!datosAnimal.cantidadSemen) {
            erroresTemp.cantidadSemen = "El campo cantidad de semen es obligatorio";
        }
    }

    return erroresTemp; // Devuelve los errores encontrados
};
