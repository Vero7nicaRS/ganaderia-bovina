export const ComprobarCamposFormularioVT = (datosVT, tipo) => {
    const erroresTemp = {};

    // Validaciones comunes para todos las vacunas/tratamientos
    if (!datosVT.nombre?.trim()) {
        // erroresTemp.nombre = "El campo nombre es obligatorio";
        erroresTemp.nombre = "Campo obligatorio";
    }


    // Validaciones específicas para el Inventario de vacunas y/o tratamientos.
    if(tipo === "VTanimal"){

        if (!datosVT.idAnimal?.trim()) {
            // erroresTemp.idAnimal = "El campo idAnimal es obligatorio";
            erroresTemp.idAnimal = "Campo obligatorio";
        }

        if (!datosVT.fechaInicio?.trim()) {
            // erroresTemp.fechaInicio = "El campo fechaInicio es obligatorio";
            erroresTemp.fechaInicio = "Campo obligatorio";
        }
        if (!datosVT.fechaFinalizacion?.trim()) {
            // erroresTemp.fechaFinalizacion = "El campo fechaFinalizacion es obligatorio";
            erroresTemp.fechaFinalizacion = "Campo obligatorio";
        }
        if (!datosVT.responsable?.trim()) {
            // erroresTemp.responsable = "El campo responsable es obligatorio";
            erroresTemp.responsable = "Campo obligatorio";
        }
    }
    return erroresTemp; // Devuelve los errores encontrados
};
