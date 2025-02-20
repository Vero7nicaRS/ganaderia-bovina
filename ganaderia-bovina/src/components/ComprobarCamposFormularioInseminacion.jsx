export const ComprobarCamposFormularioInseminacion = (datosInseminacion) => {
    const erroresTemp = {};

    // Validaciones comunes para todas las inseminaciones
   if (!datosInseminacion.fechaInseminacion?.trim()) {
        // erroresTemp.nombre = "El campo nombre es obligatorio";
        erroresTemp.fechaInseminacion = "Campo obligatorio";
    }
    if (!datosInseminacion.idToro?.trim()) {
        // erroresTemp.nombre = "El campo nombre es obligatorio";
        erroresTemp.idToro = "Campo obligatorio";
    }

    if (!datosInseminacion.idVaca?.trim()) {
        // erroresTemp.nombre = "El campo nombre es obligatorio";
        erroresTemp.idVaca = "Campo obligatorio";
    }
   if (!datosInseminacion.horaInseminacion?.trim()) {
        // erroresTemp.nombre = "El campo nombre es obligatorio";
        erroresTemp.horaInseminacion = "Campo obligatorio";
    }
   if (!datosInseminacion.responsable?.trim()) {
        // erroresTemp.nombre = "El campo nombre es obligatorio";
        erroresTemp.responsable = "Campo obligatorio";
    }

    return erroresTemp; // Devuelve los errores encontrados
};
