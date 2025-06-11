/*
* ------------------------------------------ ComprobarCamposEliminacionAnimal.jsx: ------------------------------------------
* Funcionalidad: se emplea para mostrar un mensaje de error y el campo en rojo.
* Hay mensajes destinados a los animales (vacas/terneros).
* ERRORES:
*  - Indicar que el campo es obligatorio.
* -----------------------------------------------------------------------------------------------------------
* */
export const ComprobarCamposEliminacionAnimal = ({ motivo, fechaNacimiento, fechaEliminacion }) => {
    const erroresTemp = {};

    // Validaciones comunes para la eliminación de los animales.
    if (!motivo?.trim()) {
        erroresTemp.motivo = "Campo obligatorio";
    }

    // Validar la fecha de eliminación si el motivo es "Muerte" o "Vendida"
    if (motivo === "Muerte" || motivo === "Vendida"){
        if(!fechaEliminacion?.trim()){
            erroresTemp.fechaEliminacion = "Campo obligatorio";

            // Se comprueba que la fecha de eliminación sea IGUAL o POSTERIOR que la de nacimiento.
        }else if(fechaNacimiento && fechaEliminacion?.trim() < fechaNacimiento){
            erroresTemp.fechaEliminacion = "La fecha de eliminación debe ser igual o posterior a la fecha de nacimiento";
        }

    }


    return erroresTemp;
};
