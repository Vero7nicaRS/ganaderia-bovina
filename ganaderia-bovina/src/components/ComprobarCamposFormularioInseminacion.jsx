export const ComprobarCamposFormularioInseminacion = (datosInseminacion) => {
    const erroresTemp = {};

    // Validaciones comunes para todas las inseminaciones
   if (!datosInseminacion.fechaInseminacion?.trim()) {
        // erroresTemp.fechaInseminacion = "El campo fechaInseminacion es obligatorio";
        erroresTemp.fechaInseminacion = "Campo obligatorio";
    }
    if (!datosInseminacion.idToro?.trim()) {
        // erroresTemp.idToro = "El campo idToro es obligatorio";
        erroresTemp.idToro = "Campo obligatorio";
    }

    if (!datosInseminacion.idVaca?.trim()) {
        // erroresTemp.idVaca = "El campo idVaca es obligatorio";
        erroresTemp.idVaca = "Campo obligatorio";
    }
   if (!datosInseminacion.horaInseminacion?.trim()) {
        // erroresTemp.horaInseminacion = "El campo horaInseminacion es obligatorio";
        erroresTemp.horaInseminacion = "Campo obligatorio";
    }
   if (!datosInseminacion.responsable?.trim()) {
        // erroresTemp.responsable = "El campo responsable es obligatorio";
        erroresTemp.responsable = "Campo obligatorio";
    }

    return erroresTemp; // Devuelve los errores encontrados
};
