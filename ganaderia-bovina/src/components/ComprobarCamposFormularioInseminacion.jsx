/*
* ------------------------------------------ ComprobarCamposFormularioInseminacion.jsx: ------------------------------------------
* Funcionalidad: se emplea para mostrar un mensaje de error y el campo en rojo.
* ERRORES:
*  - Indicar que el campo es obligatorio.
* -----------------------------------------------------------------------------------------------------------
* */

export const ComprobarCamposFormularioInseminacion = (datosInseminacion) => {
    const erroresTemp = {};

    // Validaciones comunes para todas las inseminaciones
   if (!datosInseminacion.fecha_inseminacion?.trim()) {
        // erroresTemp.fechaInseminacion = "El campo fechaInseminacion es obligatorio";
        erroresTemp.fecha_inseminacion = "Campo obligatorio";
   }
   if (datosInseminacion.id_toro === null || datosInseminacion.id_toro === "") {
        erroresTemp.id_toro = "Campo obligatorio";
   }

   if (datosInseminacion.id_vaca === null || datosInseminacion.id_vaca === "") {
        erroresTemp.id_vaca = "Campo obligatorio";
   }
   if (!datosInseminacion.hora_inseminacion?.trim()) {
        // erroresTemp.horaInseminacion = "El campo horaInseminacion es obligatorio";
        erroresTemp.hora_inseminacion = "Campo obligatorio";
    }
   if (!datosInseminacion.responsable?.trim()) {
        // erroresTemp.responsable = "El campo responsable es obligatorio";
        erroresTemp.responsable = "Campo obligatorio";
   }

    return erroresTemp; // Devuelve los errores encontrados
};