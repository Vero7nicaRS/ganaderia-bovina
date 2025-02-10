export const ComprobarCamposFormularioInseminacion = (datosInseminacion) => {
    const erroresTemp = {};

    // Validaciones comunes para todas las inseminaciones
   if (!datosInseminacion.fechaInseminacion?.trim()) {
        // erroresTemp.nombre = "El campo nombre es obligatorio";
        erroresTemp.nombre = "Campo obligatorio";
    }
   if (!datosInseminacion.horaInseminacion?.trim()) {
        // erroresTemp.nombre = "El campo nombre es obligatorio";
        erroresTemp.nombre = "Campo obligatorio";
    }
   if (!datosInseminacion.responsable?.trim()) {
        // erroresTemp.nombre = "El campo nombre es obligatorio";
        erroresTemp.nombre = "Campo obligatorio";
    }

    return erroresTemp; // Devuelve los errores encontrados
};
