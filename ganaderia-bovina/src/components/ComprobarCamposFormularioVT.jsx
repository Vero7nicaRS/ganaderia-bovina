/*
* ------------------------------------------ ComprobarCamposFormularioVT.jsx: ------------------------------------------
* Funcionalidad: se emplea para mostrar un mensaje de error y el campo en rojo.
* Se le pasa por argumento datosVT (objeto), tipo (inventario o VTAnimal) y listadoVT
* (lista de todas las vacunas y tratamientos)
* Hay que diferenciar errores GLOBALES o específicos del tipo.
*
* ERRORES GLOBALES Y VTAnimal:
*  - Indicar que el campo es obligatorio.
*
* ERRORES INVENTARIO:
*  - El campo "nombre" debe ser único, es decir, no puede haber más corrales con el mismo nombre.
*
* -----------------------------------------------------------------------------------------------------------
* */
export const ComprobarCamposFormularioVT = (datosVT, tipo, listadoVT) => {
    const erroresTemp = {};

    // Validaciones específicas para el Inventario de vacunas y/o tratamientos.
    if(tipo === "inventario"){

        if (!datosVT.nombre?.trim()) {
            // erroresTemp.nombre = "El campo nombre es obligatorio";
            erroresTemp.nombre = "Campo obligatorio";
        }else {
            // Verificar si el nombre ya existe en la lista de vacunas/tratamientos
            const nombreMayuscula = datosVT.nombre.toUpperCase();
            const existeVT = listadoVT.some(v => v.nombre.toUpperCase() === nombreMayuscula);
            if (existeVT) {
                erroresTemp.nombre = "Ya existe una vacuna o tratamiento con este nombre";
                // erroresTemp.nombre = `Ya existe  ${datosVT.tipo === "Vacuna" ? "una vacuna " : "un tratamiento"} con este nombre`
                //erroresTemp.nombre = `Ya existe una ${datosVT.tipo}con este nombre.`;
            }
        }
    // Validaciones para agregar una vacuna/tratamiento al animal.
    }else if(tipo === "VTanimal"){
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